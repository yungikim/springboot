function gBodyCollect() {

	this.nm_prop = ''; // 조직도에 저장된 이름 매핑 정보
	//this.my_company_code = gap.userinfo.rinfo.cpc; // 내 회사 정보
	this.company_list = [];
	this.cur_company = ''; // 현재 조직도에 선택된 회사
	this.tree_id = 'org_tree';
	this.select_userinfo = null;
	this.aleady_select_user_count = 0;
	this.collect_name = "";
	this.collect_body = "";
	this.collect_owner = "";
	this.collect_submitter_list = "";
	this.collect_referrer_list = "";
	this.collect_due_date = "";
	this.collect_due_time = "";
	this.collect_req_kind = ""
	this.collect_req_body = "";
	this.per_page = "5";
	this.all_page = "1";
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.total_page_count = "";
	this.total_data_count = "";
	this.qna_count = 0;
	this.qna_total_count = 0;
	this.s_dept_exist = false;
	this.r_dept_exist = false;
	this.search_collection_type = "1";
	this.search_collection_opt = "1";
	this.temp_collection = false;
	this.is_before_block = false;
	this.top_layer_element = null;
	this.orikey = "";
}

gBodyCollect.prototype = {
	"init" : function() {
	},

	"showMainCollect" : function() {
		var _self = this;
		
		this.cur_company = '';
		this.centerInit();
	},
	
	"collectUploadInit" : function(selectid){
		if (typeof(myDropzone_collect) != "undefined" && myDropzone_collect){
			return;
		}
		
		myDropzone_collect = new Dropzone("#"+selectid, { // Make the whole body a dropzone
			url: gap.channelserver + "/FileControl_collect.do", // Set the url
			autoProcessQueue : false, 
			parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			maxFilesize: 1000,
			timeout: 180000,
			uploadMultiple: true,
			withCredentials: false,
			previewsContainer: "#previews_channel", // Define the container to display the previews
			clickable: "#upload_collect_add_file", // Define the element that should be used as click trigger to select files.
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {		
				myDropzone_collect = this;
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
				var jj = JSON.parse(json);	    	  
				if (jj.result == "OK"){
					myDropzone_collect.ucount ++;
					myDropzone_collect.files_info = jj;		
				}
			}
		});
		
		myDropzone_collect.on("totaluploadprogress", function(progress) {	
			$("#show_loading_progress").text(parseInt(progress) + "%");
		//	document.querySelector("#total-progress_channel .progress-bar").style.width = progress + "%";
		});
		
		myDropzone_collect.on("queuecomplete", function (file) {
			gCol.collect_main_save(true);
		});
		
		myDropzone_collect.on("addedfiles", function (file) {
			var tmp_file = [];
			$(file).each(function(idx, val){
				tmp_file.push(val);
			});

			for (var i = 0 ; i < file.length; i++){
				var fx = file[i];
				var is_image = gap.check_image_file(fx.name);
				
				// 파일 증복 체크
				$('#upload_collect_file_list').find('.file_remove_btn').each(function(idx, val){
					var fname = $(val).data('name');
					var fsize = $(val).data('size');
					
					if (fx.name == fname && fx.size == fsize){
						myDropzone_collect.removeFile(fx);

						for (var k = 0; k < tmp_file.length; k++){
							if (tmp_file[k].name == fname && tmp_file[k].size == fsize){
								tmp_file.splice(k, 1);
								break;
							}
						}
						mobiscroll.toast({message:gap.lang.exist_file, color:'danger'});
						return false;
					}
				});

				if (is_image){
					//이미지일 경우 파일 사이즈를 20M로 설정한다.
					if (fx.size > (gBody.image_max_upload_size_box * 1024 * 1024)){
						var si = (fx.size / 1024 / 1024) + "M";
								 
					//	gap.gAlert("'" + fx.name + "'" + " " + gap.lang.file_ex + "<br>(MaxSize : " + gBody.image_max_upload_size_box + "M)");
						mobiscroll.toast({message:"'" + fx.name + "'" + " " + gap.lang.file_ex + "<br>(MaxSize : " + gBody.image_max_upload_size_box + "M)", color:'danger'});
						gCol.removeFile(fx, 'main');
						return false;

						if (!myDropzone.sendOK){
							myDropzone_collect.sendOK = false;	
						}

					}else{
						myDropzone_collect.sendOK = true;
					}
					
				}else{
					//일반 파일일 경우 사이즈를 100M로 설정한다.
					if (fx.size > (gBody.file_max_upload_size_box * 1024 * 1024)){
					//	gap.gAlert("'" + fx.name + "'" + "" + gap.lang.file_ex + "<br>(MaxSize : " + gBody.file_max_upload_size_box + "M)");
						mobiscroll.toast({message:"'" + fx.name + "'" + "" + gap.lang.file_ex + "<br>(MaxSize : " + gBody.file_max_upload_size_box + "M)", color:'danger'});
						gCol.removeFile(fx, 'main');
						return false;
						
						if (!myDropzone_collect.sendOK){
							myDropzone_collect.sendOK = false;
						}
						//return false;
						
					}else{
						myDropzone_collect.sendOK = true;
					}			
				}
			}

			$("#"+selectid).css("border", "");
			gCol.addUploadFileList(tmp_file, "file", "upload_collect_file_list");
			
			$("#total-progress_channel").show();
		});
		
		myDropzone_collect.on("sending", function (file, xhr, formData) {	
			gap.show_loading(gap.lang.saving);
			
			$("#"+selectid).css("border", "");
			
			formData.append("ky", gap.userinfo.rinfo.ky);
			formData.append("orikey", (myDropzone_collect.is_edit ? myDropzone_collect.orikey : gCol.orikey));
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("saveFolder", "collect");
			
			myDropzone_collect.files_info = "";
		});		
	},
	
	"collect_main_save" : function(use_dropzone){
		gap.hide_loading();
		
		var readers = [];
		var submitter_list = [];
		var submitter_ky_list = [];
		var submitter_mail_ky_list = [];
		var submitter_group_list = [];	
		var del_submitter_ky_list = [];
		var add_submitter_list = [];
		var referrer_list = [];
		var _submitter = "";
		var _referrer = "";
		
		if (myDropzone_collect.is_edit){
			_submitter = $('#collect_sendto_edit').data('suser');
			_referrer = $('#collect_sendto_edit').data('ruser');
			
		}else{
			_submitter = $('#collect_sendto').data('suser');
			_referrer = $('#collect_sendto').data('ruser');
		}
		
		readers.push(gap.userinfo.rinfo.ky);
		
		$(_submitter).each(function(idx, val){
			var user_info = val;
			
			submitter_list.push(user_info);
			submitter_ky_list.push(user_info.ky);
			if (!gCol.temp_collection){
				// 임시저장이 아닌 경우
				if (user_info.ky != gap.userinfo.rinfo.ky){
					readers.push(user_info.ky);	
				}
			}
			
			if (typeof(user_info.dsize) != "undefined" && user_info.dsize == "group"){
				submitter_group_list.push(user_info.dpc);
				
			}else{
				submitter_mail_ky_list.push(user_info.ky);
			}
		})
		
		if (_referrer) {
			$(_referrer).each(function(idx, val){
				var user_info = val;
				referrer_list.push(user_info);
				if (!gCol.temp_collection){
					// 임시저장이 아닌 경우
					if (user_info.ky != gap.userinfo.rinfo.ky){
						readers.push(user_info.ky);	
					}
				}
			})
		}
		
		if (myDropzone_collect.is_edit){
			var _info = $("#collect_detail_main").data("info");
			var _finfo = $("#collect_info_edit").data("finfo");
			var orikey = _info.key;
			var owner = _info.owner;

			if (typeof(myDropzone_collect.files_info) == "undefined"){
				myDropzone_collect.files_info = new Object();
			}
			
			if (typeof(_finfo) != "undefined" && _finfo != ""){
				if (myDropzone_collect.files_info == ""){
					myDropzone_collect.files_info.cyear = _info.key.substr(0,4);
					myDropzone_collect.files_info.folder = _info.key;
					myDropzone_collect.files_info.fserver = _info.fserver;
					myDropzone_collect.files_info.files = [];
					
				}else{
					if (typeof(myDropzone_collect.files_info.files) == "undefined"){
						myDropzone_collect.files_info.files = [];
					}
				}
				for (var i = 0; i < _finfo.length; i++){
					myDropzone_collect.files_info.files.push(_finfo[i]);	
				}				
			}

			var pre_submitter = _info.submitter;
			var pre_submitter_ky = $.map(pre_submitter, function(ret, key) {
				return ret.ky;
			});
			
			var add_submitter_list = [];
			var del_submitter_list = [];
			var add_submitter_ky = $(submitter_ky_list).not(pre_submitter_ky);
			var del_submitter_ky = $(pre_submitter_ky).not(submitter_ky_list);

			for (var i = 0; i < add_submitter_ky.length; i++){
				var _ky = add_submitter_ky[i];
				for (var j = 0; j < _submitter.length; j++){
					var _sub = _submitter[j];
					if (_ky == _sub.ky){
						add_submitter_list.push(_sub);
						break;
					}
				}
			}
			
			for (var k = 0; k < del_submitter_ky.length; k++){
				del_submitter_list.push( del_submitter_ky[k] );
			}
			
			var surl = gap.channelserver + "/update_collection.km";
			var postData = {
					"id" : myDropzone_collect.main_id,
					"key" : orikey,
					"owner" : owner,
					"name" : $('#collect_info_edit').data('title'),
					"content" : $('#collect_info_edit').data('content'),
					"submitter" : submitter_list,
					"del_submitter" : del_submitter_list,
					"add_submitter" : add_submitter_list,
					"referrer" : referrer_list,
					"due_date" : $('#collect_duedate_edit').data('edate'),
					"due_time" : $('#collect_duedate_edit').data('duetime'),
					"end_date" : $('#collect_duedate_edit').data('edate'),
					"req_kind" : $("#collect_request_edit").data('reqtype'),
					"req_content" : $("#collect_request_edit").data('reqbody'),
				//	"file_info" : (use_dropzone ? myDropzone_collect.files_info : ""),
					"temp" : (gCol.temp_collection ? "T" : "F"),
					"readers" : readers
				};
			
			if (use_dropzone){
				postData.file_info = myDropzone_collect.files_info;
			}
			
		}else{
			if (!use_dropzone){
				var random = Math.random();
				var random_key = random.toString().split(".")[1];
				var folder_key = moment.utc(new Date()).local().format('YYYYMMDDHHmmSS') + "_" + random_key;
			}
			
			var surl = gap.channelserver + "/save_collection.km";
			var postData = {
					"owner" : gap.userinfo.rinfo,
					"name" : $('#collect_info').data('title'),
					"content" : $('#collect_info').data('content'),
					"submitter" : submitter_list,
					"referrer" : referrer_list,
					"due_date" : $('#collect_duedate').data('edate'),
					"due_time" : $('#collect_duedate').data('duetime'),
					"end_date" : $('#collect_duedate').data('edate'),
					"req_kind" : $("#collect_request").data('reqtype'),
					"req_content" : $("#collect_request").data('reqbody'),
					"key" : (use_dropzone ? myDropzone_collect.files_info.folder : folder_key),
					"fserver" : gap.channelserver,
					"file_info" : (use_dropzone ? myDropzone_collect.files_info : ""),
					"temp" : (gCol.temp_collection ? "T" : "F"),
					"readers" : readers
				};
		}
		var req_data = postData;
	
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
					if (myDropzone_collect.is_edit){
						// 기존 제출담당자 정보
						var _info = $("#collect_detail_main").data("info");
						var _folder = $("#collect_detail_main").data("folder");
						var _pre_submitter_ky_list = [];
						var _pre_submitter_group_list = [];
						var _pre_submitter = _info.submitter;
						
						$(_pre_submitter).each(function(idx, val){
							var user_info = val;
							
							_pre_submitter_ky_list.push(user_info.ky);
							
							if (typeof(user_info.dsize) != "undefined" && user_info.dsize == "group"){
								_pre_submitter_group_list.push(user_info.dpc);
							}
						})

						// 임시저장이 아닐 때
						if (!gCol.temp_collection){
							// 취합 안내 방법 처리
							if ($("#collect_request_edit").data('reqtype') == "email"){
								// 메일 발송
							//	gCol.sendReqMail(submitter_ky_list, false);
								gCol.sendReqMail(submitter_mail_ky_list, submitter_group_list, false);
							
							}else{
								// 메시지 발송
							//	gCol.sendReqMsg( JSON.parse($('#collect_sendto_edit').data('suser')) );
								gCol.sendReqMsg( $('#collect_sendto_edit').data('suser') );
							}
							
							// 일정 등록
							gCol.updateSchedule('D', req_data, _pre_submitter_ky_list, _pre_submitter_group_list);	// 기존 일정 삭제
							gCol.updateSchedule('U', req_data, submitter_ky_list, submitter_group_list);			// 신규 일정 등록							
						}
						
						gCol.temp_collection = false; 		//초기화
						myDropzone_collect.files_info = "";	//초기화
						
						// 수정화면 닫고 취합 상세화면 표시
						$('#container_edit').fadeOut();
						$('#container_edit').empty();
						$('#container_detail').empty();
						$('#container_detail').fadeIn();
						
						// 취합 상세화면 정보 업데이트
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
									gCol.drawCollectDetailView(res);

									// 취합 리스트 정보 가져오기
									gCol.drawCollectList(1);
								}else{
									gap.gAlert(gap.lang.errormsg);
									return false;
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
							}
						});	
						
					}else{
						gCol.drawCollectList(1);
						
						// 임시저장이 아닐때
						if (!gCol.temp_collection){
							// 취합 안내 방법 처리
							if ($("#collect_request").data('reqtype') == "email"){
								// 메일 발송
							//	gCol.sendReqMail(submitter_ky_list, false);
								gCol.sendReqMail(submitter_mail_ky_list, submitter_group_list, false);
							
							}else{
								// 메시지 발송
							//	gCol.sendReqMsg( JSON.parse($('#collect_sendto').data('suser')) );
								gCol.sendReqMsg( $('#collect_sendto').data('suser') );
							}
							
							// 신규 일정 등록				
							gCol.updateSchedule('C', req_data, submitter_ky_list, submitter_group_list);
							
						}else{
							gCol.clearDropzone();
						}
						
						gCol.temp_collection = false; //초기화
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
	
	"direct_collect_main_save" : function(obj){
		// 일시저장된 취합을 바로 취합 요청을 하는 경우
	
		var readers = [];
		var submitter_list = [];
		var submitter_ky_list = [];
		var submitter_mail_ky_list = [];
		var submitter_group_list = [];	
		var referrer_list = [];

		var _info = obj;
		var orikey = _info.key;
		var owner = _info.owner;
		var main_id = _info._id.$oid;
		
		var _submitter = _info.submitter;
		var _referrer = _info.referrer;
		
		readers.push(gap.userinfo.rinfo.ky);
		
		$(_submitter).each(function(idx, val){
			var user_info = val;
			
			submitter_list.push(user_info);
			submitter_ky_list.push(user_info.ky);
			if (user_info.ky != gap.userinfo.rinfo.ky){
				readers.push(user_info.ky);	
			}
			
			if (typeof(user_info.dsize) != "undefined" && user_info.dsize == "group"){
				submitter_group_list.push(user_info.dpc);
				
			}else{
				submitter_mail_ky_list.push(user_info.ky)
			}
		})
		
		if (_referrer) {
			$(_referrer).each(function(idx, val){
				var user_info = val;
				referrer_list.push(user_info);
				if (user_info.ky != gap.userinfo.rinfo.ky){
					readers.push(user_info.ky);	
				}
			})
		}
		
		var surl = gap.channelserver + "/update_collection.km";
		var postData = {
				"id" : main_id,
				"key" : orikey,
				"owner" : owner,
				"temp" : "F",
				"readers" : readers
			};
		
		var req_data = postData;
		req_data.name = _info.name;
		req_data.content = _info.content;
		req_data.startdate = moment(new Date()).utc().format('YYYY-MM-DD[T]HH:mm:ss') + 'Z';
		req_data.enddate = _info.end_date;
	
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
					// 취합 안내 방법 처리
					if (_info.req_kind == "email"){
						// 메일 발송
					//	gCol.sendReqMail(submitter_ky_list, false);
						gCol.sendReqMail(submitter_mail_ky_list, submitter_group_list, false);
					
					}else{
						// 메시지 발송
						gCol.sendReqMsg( _submitter )
					}
					
					// 일정 등록
					gCol.updateSchedule('C', req_data, submitter_ky_list, submitter_group_list);			// 신규 일정 등록
					
					// 메인 목록 갱신
					gCol.drawCollectList(1);
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
	
	
	"responseUploadInit" : function(selectid){
		if (typeof(myDropzone_response) != "undefined" && myDropzone_response){
			return;
		}
		
		myDropzone_response = new Dropzone("#"+selectid, { // Make the whole body a dropzone
			url: gap.channelserver + "/FileControl_collect.do", // Set the url
			autoProcessQueue : false, 
			parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			maxFilesize: 1000,
			timeout: 180000,
			uploadMultiple: true,
			withCredentials: false,
			previewsContainer: "#previews_channel", // Define the container to display the previews
			clickable: "#response_collect_add_file", // Define the element that should be used as click trigger to select files.
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {		
				myDropzone_response = this;
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
				var jj = JSON.parse(json);	    	  
				if (jj.result == "OK"){
					myDropzone_response.ucount ++;
					myDropzone_response.files_info = jj;
					myDropzone_response.files_info.folder = myDropzone_response.folder;
				}
			}
		});
		
		myDropzone_response.on("totaluploadprogress", function(progress) {	
			$("#show_loading_progress").text(parseInt(progress) + "%");
		//	document.querySelector("#total-progress_channel .progress-bar").style.width = progress + "%";
		});
		
		myDropzone_response.on("queuecomplete", function (file) {
			gCol.collect_response_save(true);
		});
	      
		myDropzone_response.on("addedfiles", function (file) {
			var tmp_file = [];
			$(file).each(function(idx, val){
				tmp_file.push(val);
			});
			
			for (var i = 0 ; i < file.length; i++){
				var fx = file[i];
				var is_image = gap.check_image_file(fx.name);
				
				// 파일 증복 체크
				$('#response_collect_file_list').find('.file_remove_btn').each(function(idx, val){
					var fname = $(val).data('name');
					var fsize = $(val).data('size');
					
					if (fx.name == fname && fx.size == fsize){
						myDropzone_response.removeFile(fx);

						for (var k = 0; k < tmp_file.length; k++){
							if (tmp_file[k].name == fname && tmp_file[k].size == fsize){
								tmp_file.splice(k, 1);
								break;
							}
						}
						mobiscroll.toast({message:gap.lang.exist_file, color:'danger'});
						return false;
					}
				});

				if (is_image){
					//이미지일 경우 파일 사이즈를 20M로 설정한다.
					if (fx.size > (gBody.image_max_upload_size_box * 1024 * 1024)){
						var si = (fx.size / 1024 / 1024) + "M";

						mobiscroll.toast({message:"'" + fx.name + "'" + " " + gap.lang.file_ex + "<br>(MaxSize : " + gBody.image_max_upload_size_box + "M)", color:'danger'});
						gCol.removeFile(fx, 'response');
						
						return false;
						if (!myDropzone_response.sendOK){
							myDropzone_response.sendOK = false;	
						}

					}else{
						myDropzone_response.sendOK = true;
					}
					
				}else{
					//일반 파일일 경우 사이즈를 100M로 설정한다.
					if (fx.size > (gBody.file_max_upload_size_box * 1024 * 1024)){
					//	gap.gAlert("'" + fx.name + "'" + "" + gap.lang.file_ex + "<br>(MaxSize : " + gBody.file_max_upload_size_box + "M)");
						mobiscroll.toast({message:"'" + fx.name + "'" + "" + gap.lang.file_ex + "<br>(MaxSize : " + gBody.file_max_upload_size_box + "M)", color:'danger'});
						gCol.removeFile(fx, 'response');
						return false;
						
						if (!myDropzone_response.sendOK){
							myDropzone_response.sendOK = false;
						}
						//return false;
						
					}else{
						myDropzone_response.sendOK = true;
					}			
				}	
			}
			
			$("#"+selectid).css("border", "");
			gCol.addUploadFileList(tmp_file, "file", "response_collect_file_list");	
			
			$("#total-progress_channel").show();
		});
		
		myDropzone_response.on("sending", function (file, xhr, formData) {	
			gap.show_loading(gap.lang.saving);
			
			$("#"+selectid).css("border", "");
			
			formData.append("ky", gap.userinfo.rinfo.ky);
			formData.append("orikey", myDropzone_response.folder);
			formData.append("cyear", myDropzone_response.cyear);
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("saveFolder", "response");
			
			myDropzone_response.files_info = "";
			$("#total-progress_channel").show();	
		//	document.querySelector("#total-progress_channel .progress-bar").style.display = "";
		});		
	},
	
	"collect_response_save" : function(use_dropzone){
		// 파일 업로드 후 실행
		gap.hide_loading();

		var readers = [];
		readers.push(gap.userinfo.rinfo.ky);

		if (typeof(myDropzone_response.res_id) == "undefined"){
			// 응답 작성
			var surl = gap.channelserver + "/save_collection_response.km";
			var postData = {
					"ky" : (myDropzone_response.restype == "P" ? gap.userinfo.rinfo.ky : gap.userinfo.rinfo.dpc),
					"writer" : gap.userinfo.rinfo,
					"content" : myDropzone_response.content,	//$("#collect_response_express").val(),
					"fserver" : gap.channelserver,
					"file_info" : myDropzone_response.files_info
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
						var _display = $('#container').css('display');
						if (_display == "none"){
							// 상세화면을 보고 있는 경우
							// 취합 상세화면 정보 업데이트
							var _info = $("#collect_detail_main").data("info");
							var _folder = $("#collect_detail_main").data("folder");
							
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
										gCol.drawCollectDetailView(res);
										gCol.drawCollectList(1);

									}else{
										gap.gAlert(gap.lang.errormsg);
										return false;
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
								}
							});	
							
						}else{
							// 메인화면을 보고 있는 경우
							gCol.drawCollectList(1);
						}	
						gCol.clearDropzone();

						// 일정 완료 처리
						gap.schedule_update_collection(post_data, 'T');
						
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
			// 응답 수정
			var $layer = $("#collect_edit_layer")
			var finfo = $layer.data("finfo");
			for (var i = 0; i < finfo.length; i++){
				myDropzone_response.files_info.files.push(finfo[i]);	
			}
			
			var surl = gap.channelserver + "/update_collection_response.km";
			var postData = {
					"id" : myDropzone_response.res_id,
					"writer" : gap.userinfo.rinfo,
					"content" : myDropzone_response.content,	//$("#collect_response_express").val(),
					"file_info" : myDropzone_response.files_info
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
						delete myDropzone_response['res_id'];
						gCol.clearDropzone();
						
						// 수정 레이어 닫기
						$layer.find('.pop_btn_close').click();
						
						var _display = $('#container').css('display');
						if (_display == "none"){
							// 상세화면을 보고 있는 경우
							// 상세보기 다시 그림
							var _folder = $("#collect_detail_main").data("folder");
							
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
										gCol.drawCollectDetailView(res);

									}else{
										gap.gAlert(gap.lang.errormsg);
										return false;
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
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
		}		
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

		gCol.search_collection_type = "1";
		gCol.search_collection_opt = "1";
		
		// 취합 메인 화면
		var _main = gCol.drawCollectMain();
		$('#center_content').html(_main);
		
		if (is_direct){
			$("#container").hide()
		}
		
		// 테이블 헤더 표시
		var _header = gCol.drawCollectHeader();
		$('#main_header').html(_header);
		
		// 취합 리스트
		gCol.drawCollectList(1);
		
		//이벤트 처리
		gCol.eventCollectMain();
		
		
		var $el = $("#container");
		var $el_info = $el.find('.step.n1');
		
		$el_info.click();
		$('#gathering_type').find('.pop_btn_close').click();
	},
	
	"drawCollectMain" : function(){
		var _html = "";
		_html += '<div id="container" class="mu_container mu_gathering">';
		_html += '	<div class="contents scroll" style="overflow-y:auto;">';
		_html += '		<section class="section sec01">';
		_html += '			<h2>' + gap.lang.new_collection_request + '</h2>';
		_html += '			<div id="main_header" class="f_between">';
		_html += '			</div>';
		_html += '		</section> <!-- //top_wr -->';
		_html += '		<section class="section sec02">';
		_html += '			<h2>' + gap.lang.collection_list + '</h2>';
		_html += '			<div class="f_between">';
		_html += '				<ul class="tab_wr inb">';
		_html += '					<li id="all_coll" class="on" >' + gap.lang.all_collection + ' <span class="num en"></span></li>';
		_html += '					<li id="receive_coll">' + gap.lang.receive_collection + '<span class="num en"></span></li>';
		_html += '					<li id="send_coll">' + gap.lang.sent_collection + '<span class="num en"></span></li>';
		_html += '					<li id="ref_coll">' + gap.lang.reference + '<span class="num en"></span></li>';
		_html += '					<li id="temp_coll">' + gap.lang.temps + '<span class="num en"></span></li>';
		_html += '				</ul>';
		_html += '				<div class="input-field selectbox">';
		_html += '					<select id="collect_status_type">';
		_html += '						<option value="1">' + gap.lang.status_collection + '</option>';
		_html += '						<option value="2">' + gap.lang.ing_collection + '</option>';
		_html += '						<option value="3">' + gap.lang.close_collection + '</option>';
		_html += '						<option value="4">' + gap.lang.before_submission + '</option>';
		_html += '						<option value="5">' + gap.lang.close_submission + '</option>';
		_html += '					</select>';
		_html += '				</div>';
		_html += '			</div>';
		_html += '			<div class="tab_cont_wr">';
		_html += '				<table class="table_type_a">';
		_html += '					<thead>';
		_html += '						<tr>';
		_html += '							<th style="width: 15%;" class="inb">' + gap.lang.type + '</th>';
		_html += '							<th style="width: auto;" class="inb">' + gap.lang.collect_name + '</th>';
		_html += '							<th style="width: 13%;" class="inb">' + gap.lang.deadline + '</th>';
		_html += '							<th style="width: 13%;" class="inb">' + gap.lang.manager_collection + '</th>';
		_html += '							<th style="width: 13%;" class="inb">' + gap.lang.count_person_collection + '</th>';
		_html += '							<th style="width: 13%;" class="inb">' + gap.lang.status_collection + '</th>';
		_html += '							<th style="width: 4%;">' + gap.lang.basic_write + '</th>';
		_html += '							<th style="width: 4%;">' + gap.lang.basic_modify + '</th>';
		_html += '							<th style="width: 5%; padding-right: 1.5%">' + gap.lang.basic_delete + '</th>';
		_html += '						</tr>';
		_html += '					</thead>';
		_html += '					<tbody id="collect_list">';
		_html += '					</tbody>';
		_html += '				</table>';
		_html += '				<div class="pagination_wr" id="paging_area">';
		_html += '				</div>';
		_html += '			</div>';
		_html += '		</section>';
		_html += '	</div> <!-- //contents -->';
		_html += '</div><!-- //container -->';
		_html += '<div id="container_detail" class="mu_container mu_gathering mu_gathering_detail" style="display:none;">';
		_html += '</div><!-- //container detail -->';
		_html += '<div id="container_edit" class="mu_container mu_gathering mu_gathering_detail" style="display:none;">';
		_html += '</div><!-- //container edit -->';
		
		return _html;
	},

	"drawCollectHeader" : function(is_edit){
		var _id = ""
		var _html = "";
		
		if (is_edit){
			_id = "_edit";
		}
		
		_html += '<div class="step_wr f_between">';
		_html += '	<!-- 선택 완료되면 step에 on 클래스 추가 -->';
		_html += '	<div class="step n1" id="collect_info' + _id + '">';
		_html += '		<div><span class="sub">' + gap.lang.collect_body + '</span></div>';
		_html += '		<p class="cont">' + gap.lang.collect_reg_title_content + '</p>';
		_html += '	</div>';
		_html += '	<div class="step n2" id="collect_sendto' + _id + '">';
		_html += '		<div><span class="sub">' + gap.lang.collect_submitter + '/' + gap.lang.collect_referrer + '</span></div>';
		_html += '		<p class="cont">' + gap.lang.select_submitter_referrer + '</p>';
		_html += '	</div>';
		_html += '	<div class="step n3" id="collect_duedate' + _id + '">';
		_html += '		<div><span class="sub">' + gap.lang.collection_deadline + '</span></div>';
		_html += '		<p class="cont">' + gap.lang.select_collection_deadline + '</p>';
		_html += '	</div>';
		_html += '	<div class="step n4" id="collect_request' + _id + '">';
		_html += '		<div><span class="sub">' + gap.lang.collection_req_method + '</span></div>';
		_html += '		<p class="cont">' + gap.lang.select_collect_req_method + '</p>';
		_html += '	</div>';
		_html += '</div>';
		_html += '<!-- 선택 완료되면 btn_wr에 act 클래스 추가 -->';
		_html += '<div class="btn_wr">';
		if (is_edit){
			_html += '	<button class="complete_btn" id="collect_edit_btn">' + gap.lang.basic_modify + '</button>';
			
		}else{
			_html += '	<button class="complete_btn" id="collect_req_btn"><span>' + gap.lang.request_collection + '</span></button>';
		}
		_html += '</div>';
		
		return _html;
	},	
	
	"eventCollectMain" : function(){
		$('#collect_status_type').val('1');
		$('#collect_status_type').material_select();
		$('#collect_status_type').off().on("change", function(){
			gCol.search_collection_opt = $(this).val();
			gCol.drawCollectList(1);
		});
  
		// 1단계 내용 입력
		$('.step.n1').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			gCol.showInfoLayer(this);
		});
        
		// 2단계 내용 입력
		$('.step.n2').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			
			if (!$('.step.n1').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.input_collection_content_first, color:'danger'});
				return false;
			}
			
			gCol.showSendToLayer(this);
		});
			
		// 3단계 내용 입력
		$('.step.n3').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			
			if (!$('.step.n1').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.input_collection_content_first, color:'danger'});
				return false;
			}
			
			if (!$('.step.n2').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.input_submitter_referrer, color:'danger'});
				return false;
			}
			
			gCol.showDueDateLayer(this);
		});
		
		// 4단계 내용 입력
		$('.step.n4').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			
			if (!$('.step.n1').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.input_collection_content_first, color:'danger'});
				return false;
			}
			
			if (!$('.step.n2').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.input_submitter_referrer, color:'danger'});
				return false;
			}
			
			if (!$('.step.n3').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.select_collection_deadline, color:'danger'});
				return false;
			}
			
			gCol.showReqTypeLayer(this);
		});

		// 취합요청
		$("#collect_req_btn").off().on("click", function(){
			if (!$('.step.n1').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.collect_reg_title_content, color:'danger'});
				return false;
			}
			if (!$('.step.n2').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.select_submitter_referrer, color:'danger'});
				return false;
			}
			if (!$('.step.n3').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.select_collection_deadline, color:'danger'});
				return false;
			}
			if (!$('.step.n4').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.select_collect_req_method, color:'danger'});
				return false;
			}
			
			var _date_txt = $('#collect_duedate').data('duedate') + '(' + moment($('#collect_duedate').data('edate')).format('ddd') + ')';
			var _time_txt = $('#collect_duedate').data('duetime');
			var _req_method = ($('#collect_request').data('reqtype') == 'email' ? gap.lang.email : gap.lang.message)
			var _content = '';
			_content += gap.lang.confirm_request_collection + '<br /><br />';
			_content += gap.lang.collect_body + '  :  ' + $('#collect_info').data('title') + '<br />';
			_content += gap.lang.collect_submitter + '  :  ' + $('#collect_sendto').data('sinfo') + '<br />';
			_content += gap.lang.collection_deadline + '  :  ' + _date_txt + ' ' + _time_txt + '<br />';
			_content += gap.lang.collection_req_method + '  :  ' + _req_method + '<br />';
			
			gCol.showSaveConfirm({
				title: gap.lang.Confirm,
			//	iconClass: 'remove',
				contents: _content,	//gap.lang.confirm_request_collection,
				onClose: function(){
					var random = Math.random();
					var random_key = random.toString().split(".")[1];
					gCol.orikey = moment.utc(new Date()).local().format('YYYYMMDDHHmmSS') + "_" + random_key;					
					
					myDropzone_collect.is_edit = false;
					gCol.temp_collection = true;
					if (myDropzone_collect.files.length == 0){
						gCol.collect_main_save(false);
					
					}else{
						myDropzone_collect.processQueue();	
					}
				},
				callback: function(){
					var random = Math.random();
					var random_key = random.toString().split(".")[1];
					gCol.orikey = moment.utc(new Date()).local().format('YYYYMMDDHHmmSS') + "_" + random_key;	
					
					myDropzone_collect.is_edit = false;
					gCol.temp_collection = false;
					if (myDropzone_collect.files.length == 0){
						gCol.collect_main_save(false);
						
					}else{
						myDropzone_collect.processQueue();	
					}
				}
			});
		});
		
		
		// 전체 취합 tab
		$('#all_coll').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.tab_wr li').removeClass('on');
			$(this).addClass('on');
			
			gCol.search_collection_type = "1";
			gCol.drawCollectList(1);
		});
		
		// 받은 취합 tab
		$('#receive_coll').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.tab_wr li').removeClass('on');
			$(this).addClass('on');
			
			gCol.search_collection_type = "2";
			gCol.drawCollectList(1);
		});
		
		// 보낸 취합 tab
		$('#send_coll').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.tab_wr li').removeClass('on');
			$(this).addClass('on');
			
			gCol.search_collection_type = "3";
			gCol.drawCollectList(1);
		});
		
		// 참조 tab
		$('#ref_coll').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.tab_wr li').removeClass('on');
			$(this).addClass('on');
			
			gCol.search_collection_type = "4";
			gCol.drawCollectList(1);
		});

		// 임시저장 tab
		$('#temp_coll').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.tab_wr li').removeClass('on');
			$(this).addClass('on');
			
			gCol.search_collection_type = "5";
			gCol.drawCollectList(1);
		});
	},
	
	"showCollectBlock" : function(el){
		$('#layerDimDark').remove();
		var html = '<div id="layerDimDark"></div>';
		var $block = $(html);
		$(el).prepend($block);
	},
	
	"hideCollectBlock" : function(){
		$('#layerDimDark').remove();
	},
	
	"setCollectLayer" : function(el, html){
		gCol.showCollectBlock(el);
		
		var $target = $(el);
		var $layer = $(html);

		$target.prepend($layer);
		
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx);
	},
	
	"showMeetBlock" : function(){
		$('.meet-block-layer').remove();
		var html = '<div class="meet-block-layer"></div>';
		var $block = $(html);
		$('#body_content').append($block);
	},
	
	"hideMeetBlock" : function(){
		$('.meet-block-layer').remove();
	},
	
	"setLayer" : function(el, html){
		var _self = this;
		gCol.showMeetBlock();
		
		var $target = $(el);
		$target.addClass('popup');
				
		$('.meet-make-layer').remove();
		
		var $layer = $(html);
		/*
		$layer.css({
			top: $target.outerHeight() + 15,
			left: 0
		});
		*/
		$target.append($layer);
	},	
	
	// 취합 내용 레이어 표시
	"showInfoLayer" : function(el, is_edit){
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="gathering_type" class="layer_wrap" style="min-height: 445px;">' +
			'	<div class="layer_inner">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + gap.lang.collect_body + '</h4>' +
			'		<div class="layer_cont left">' +
			'			<div class="cont_wr">' +
			'				<h5>' + gap.lang.basic_title + '/' + gap.lang.basic_content + '</h5>' +
			'				<input type="text" name="" id="input_collect_name" class="input" autocomplete="off" placeholder="' + gap.lang.input_title + '"' + (is_edit && !gCol.temp_collection ? ' style="background-color:#efefef;" disabled' : '') + '>' +
			'				<textarea name="" id="collect_body_express" class="input textarea" cols="30" rows="10" autocomplete="off" placeholder="' + gap.lang.input_content + '"' + (is_edit && !gCol.temp_collection ? ' style="background-color:#efefef;" disabled' : '') + '></textarea>' +
			'			</div>' +
			'			<div class="cont_wr">' +
			'				<div class="rel">' +
			'					<h5>' + gap.lang.select_template_file + '</h5>' +
			'					<button class="g_w_pop_file_btn" id="collect_add_file">' + gap.lang.addFile + '</button>' +
			'				</div>' +
			'				<div class="g_w_pop_file_box" id="upload_collect_file_list" style="overflow-y:auto;">' +
		//	'					<p class="file_none_txt">+ 파일을 끌어오세요.</p>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr one">' +
			'			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		gCol.setLayer(el, html);
		
		var $layer = $('#gathering_type');
		
		var title = $el.data('title');
		if (title) {
			$("#input_collect_name").val(title);
		}
		
		var content = $el.data('content');
		if (content) {
			$("#collect_body_express").val(content);
		}
		
		if (!$el.hasClass("on")){
			// DropZone 설정
			gCol.collectUploadInit('gathering_type');
			myDropzone_collect.removeAllFiles(true);
			
			if (is_edit){
				gCol.addSavedFileList(true, $el.data('finfo'), $el.data('id'), "upload_collect_file_list");
			}
	
		}else{
			if (is_edit){
			/*	if (typeof(myDropzone_collect) != "undefined" && myDropzone_collect){
					// DropZone 이미 로드되어 있음
					
				}else{
					// DropZone 설정
					gCol.collectUploadInit('gathering_type');
					myDropzone_collect.removeAllFiles(true);
				}*/
				gCol.addSavedFileList(true, $el.data('finfo'), $el.data('id'), "upload_collect_file_list");
			}
			
			if (myDropzone_collect.files.length > 0){
				gCol.addUploadFileList(myDropzone_collect.files, "file", "upload_collect_file_list");
				myDropzone_collect.sendOK = true;
			}
		}
		
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			myDropzone_collect.stack_files = myDropzone_collect.files;
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			gCol.hideMeetBlock();
			return false;
		});
		
		// 파일 추가
		$layer.find('.g_w_pop_file_btn').on('click', function(){
//			$("#upload_collect_add_file").click();
			myDropzone_collect.hiddenFileInput.click();
			return false;
		});
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			var $title = $layer.find('#input_collect_name');
			if ($title.val() ==  ""){
				mobiscroll.toast({message:gap.lang.input_title, color:'danger'});
				return false;
			}
			
			var $content = $layer.find('#collect_body_express');
		/*	
		 * 체크하지 않도록 요청 - 황수진 (2022.11.21)
		 * if ($content.val() ==  ""){
				mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
				return false;
			}*/
			
			$el.find('.cont').html($title.val());
			$el.data('title', $title.val()).addClass('on');
			$el.data('content', $content.val());
			if (is_edit){
				$layer.find('.pop_btn_close').click();
				if ($('#collect_edit_btn').parent().hasClass('act')){
					// do nothing
				}else{
					$('#container_edit .step.n2').click();			
				}
				
			}else{
				$layer.find('.pop_btn_close').click();
				if ($('#collect_req_btn').parent().hasClass('finish')){
					// do nothing
				}else{
					$('.step.n2').click();					
				}
			}
			return false;
		});	

	},
	
	// 제출담당자/참조인 레이어 표시
	"showSendToLayer" : function(el, is_edit){
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="gathering_type" class="layer_wrap gathering_manager">' +
			'	<div class="layer_inner rel">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + gap.lang.submitter + '/' + gap.lang.referrer + '</h4>' +
			'		<div class="layer_cont left">' +
			'			<div class="cont_wr rel">' +
			'				<h5>' + gap.lang.submitter + '</h5>' +
			'				<div class="before_select rel">' +
			'					<input type="text" name="" id="input_collect_submitter" class="input" autocomplete="off" placeholder="' + gap.lang.input_submitter + '">' +
			'					<button class="abs type_icon org_s"></button>' +
			'				</div>' +
			'				<div class="after_select g_w_pop_file_box" style="display:none;">' +
			'					<ul class="scroll until p5" id="collect_submitter_list" style="overflow-y:auto;">' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			'			<div class="cont_wr rel">' +
			'				<h5>' + gap.lang.referrer + '</h5>' +
			'				<div class="before_select rel">' +
			'					<input type="text" name="" id="input_collect_referrer" class="input" autocomplete="off" placeholder="' + gap.lang.input_referrer + '">' +
			'					<button class="abs type_icon org_r"></button>' +
			'				</div>' +
			'				<div class="after_select g_w_pop_file_box" style="display:none;">' +
			'					<ul class="scroll until p5" id="collect_referrer_list" style="max-height:75px; overflow-y:auto;">' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr one">' +
			'			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' +
			'		</div>' +			
			'	</div>' +
			'</div>';
		
		gCol.setLayer(el, html);
		
		var $layer = $('#gathering_type');
		var $input_submitter = $("#input_collect_submitter");
		var $input_referrer = $("#input_collect_referrer");
		
		var _submitter = $el.data('suser');
		if (_submitter) {
			$(_submitter).each(function(idx, val){
				gCol.collectAddUser('S', val);
			})
		}
		
		var _referrer = $el.data('ruser');
		if (_referrer) {
			$(_referrer).each(function(idx, val){
				gCol.collectAddUser('R', val);
			})
		}
		
		$input_submitter.keydown(function(evt){
			if (evt.keyCode == 13){
				if ($input_submitter.val().trim() == ""){
					mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
					return;
				}
				gCol.collectUserSearch("S", $input_submitter.val());				
			}			
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		$input_referrer.keydown(function(evt){
			if (evt.keyCode == 13){
				if ($input_referrer.val().trim() == ""){
					mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
					return;
				}
				gCol.collectUserSearch("R", $input_referrer.val());				
			}			
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		// 체출담당자 조직도 버튼 클릭
		$layer.find('.org_s').on('click', function(){
			window.ORG.show(
					{
						'title': gap.lang.invite_user,
						'single': false
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) {  
							//반환되는 Items

							gCol.aleady_select_user_count = 0;
							gCol.s_dept_exist = false;
							for (var i = 0; i < items.length; i++){
								//2023.11.10 퇴사자라 정보가 없는 경우 처리
								if(typeof items[i] == "undefined") { return; }
								var _res = gap.convert_org_data(items[i]);
								if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
									gCol.collectAddUser('S', _res);
								}
							}
							gCol.alertAleadySelectUser();
							gCol.alertAleadySelectDept();
						}
					});			
		});
		
		// 참조인 버튼 클릭
		$layer.find('.org_r').on('click', function(){
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
						
							gCol.aleady_select_user_count = 0;
							gCol.s_dept_exist = false;
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
									gCol.collectAddUser('R', _res);
								}
							}
							gCol.alertAleadySelectUser();
							gCol.alertAleadySelectDept();
						}
					});			
		});		
		
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			if ($input_submitter.val() != ""){
				gCol.collectUserSearch("S", $input_submitter.val());
				return false;
			}
			var $s_list = $layer.find('#collect_submitter_list').children();
			if ($s_list.length ==  0){
				mobiscroll.toast({message:gap.lang.input_submitter, color:'danger'});
				return false;
			}
		
			if ($input_referrer.val() != ""){
				gCol.collectUserSearch("R", $input_referrer.val());
				return false;
			}
			var $r_list = $layer.find('#collect_referrer_list').children();
		/*	if ($r_list.length ==  0){
				mobiscroll.toast({message:gap.lang.input_referrer, color:'danger'});
				return false;
			}*/

			var s_txt = "";
			var r_txt = "";
			var s_users = [];
			var r_users = [];
			if ($s_list.length > 0){
				var s_info = gap.user_check($s_list.eq(0).data("user"));
				s_txt = ($s_list.length == 1 ? s_info.name : gap.lang.name_and_other_person.replace(/\%1/g, s_info.name).replace(/\%2/g, ($s_list.length - 1)));
				
				$s_list.each(function(idx, val){
					s_users.push($(val).data('user'));
				});
			}
			if ($r_list.length > 0){
				var r_info = gap.user_check($r_list.eq(0).data("user"));
				r_txt = ($r_list.length == 1 ? r_info.name : gap.lang.name_and_other_person.replace(/\%1/g, r_info.name).replace(/\%2/g, ($r_list.length - 1)));
				
				$r_list.each(function(idx, val){
					r_users.push($(val).data('user'));
				});
			}
			var txt = s_txt + "<br>" + r_txt;
			
			$el.find('.cont').html(txt);
			$el.data('sinfo', s_txt).addClass('on');
			$el.data('rinfo', r_txt);
			$el.data('suser', s_users);
			$el.data('ruser', r_users);
			$layer.find('.pop_btn_close').click();
			if (is_edit){
				if (gCol.temp_collection){
					// 임시저장인 경우
					// do nothing
					
				}else{
					$("#collect_edit_btn").click();	
				}
				
			}else{
				if ($('#collect_req_btn').parent().hasClass('finish')){
					// do nothing
				}else{
					$('.step.n3').click();		
				}
			}
			return false;
		});	
	},
	
	// 취합마감일
	"showDueDateLayer" : function(el, is_edit){
		function _getTimeHtml() {
			var html_time = '';
			var now = moment();
			now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});
			
			var ckdate = now.clone();
			ckdate.add(1, 'day');
			
			while (now.format() != ckdate.format()) {
				html_time += '<option value="' + now.format('HH:mm') + '">' + now.format('h:mm A') + '</option>';
				now.add(30, 'minutes');
			}
			return html_time;
		}
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="gathering_type" class="layer_wrap gathering_deadline">' +
			'	<div class="layer_inner rel">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>취합마감일</h4>' +
			'		<div class="layer_cont left">' +
			'			<div class="cont_wr rel datepicker">' +
			'			</div>' +
			'			<div class="cont_wr rel f_between">' +
			'				<h5>시간 선택</h5>' +
			'				<div class="input-field selectbox">' +
			'					<select id="due_time">' +
			'					</select>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr one">' +
			'			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		gCol.setLayer(el, html);
		
		var $layer = $('#gathering_type');
		
		var end_date = $el.data('edate');
		var sel_date;
		if (end_date) {
			sel_date = moment(end_date).format('YYYY-MM-DD');		
		} else {
			sel_date = moment().format('YYYY-MM-DD');
		}
		
		$layer.find('.datepicker').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: moment(sel_date),
			display: 'inline',
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],
			select: 'date',
			dateFormat: 'YYYY.MM.DD',
			calendarType: 'month',
			touchUi: true,
			buttons: [],
			min: moment().format('YYYY.MM.DD'),
		    onChange: function (event, inst) {
				$el.data('duedate', event.valueText);						// 표시용
				$el.data('sdate', moment().utc().format());					// 일정등록 시 사용
				$el.data('edate', moment(event.value).utc().format());		// 마감일
		    }
		});
		
		var $due_time = $('#due_time');
		var time_html = _getTimeHtml();
		
		// 시간 (기본은 현재 시간 +1)
		var time_info = $(el).data('duetime');
		var due_time;
		if (time_info){
			due_time = time_info;
			
		}else{
			var now = moment();
	        var add_hour = now.get('h') < 23 ? 1 : 0; // 11시가 넘으면 +1 하지 않음
	        due_time = now.startOf('h').add(add_hour, 'h').format('HH:mm');
		}
		$due_time.append(time_html).val(due_time);
		
		$layer.find('select').material_select();
		
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			$el.data('duetime', $("#due_time").val()).addClass('on');
			$el.data('edate', moment($el.data('duedate') + ' ' + $el.data('duetime')).utc().format());		// 마감일시

			var date_txt = $el.data('duedate') + '(' + moment($el.data('edate')).format('ddd') + ')';
			var time_txt = $el.data('duetime');
			var txt = date_txt + "<br>" + time_txt;
			$el.find('.cont').html(txt);
			
			$layer.find('.pop_btn_close').click();
			if (is_edit){
				// do nothing...
				
			}else{
				if ($('#collect_req_btn').parent().hasClass('finish')){
					// do nothing
				}else{
					$('.step.n4').click();;		
				}				
			}
			return false;
		});
	},
	
	// 취합 요청 방법
	"showReqTypeLayer" : function(el, is_edit){
		var _self = this;
		var $el = $(el);
		var html = 
			'<div id="gathering_type" class="layer_wrap gathering_type">' +
			'	<div class="layer_inner rel">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + gap.lang.collection_req_method + '</h4>' +
			'		<div class="layer_cont left">' +
			'			<div class="type_list_wr rel">' +
			'				<div class="type_list flex on" data-value="email">' +
			'					<div class="chk_wr"><div class="chk_point"></div></div>' +
			'					<div class="txt_wr">' +
			'						<strong>' + gap.lang.email + '</strong>' +
			'					</div>' +
			'				</div>' +
/*			'				<div class="type_list flex" data-value="msg">' +
			'					<div class="chk_wr"><div class="chk_point"></div></div>' +
			'					<div class="txt_wr">' +
			'						<strong>' + gap.lang.message + '</strong>' +
			'					</div>' +
			'				</div>' +*/
			'				<div class="cont_wr">' +
			'					<div class="g_write_pop_bot">' +
			'						<h5>' + gap.lang.req_message + ' (' + gap.lang.optional + ')</h5>' +
			'					</div>' +
			'					<textarea name="" id="collect_req_express" class="input textarea" cols="30" rows="10" autocomplete="off" placeholder="' + gap.lang.input_message + '"></textarea>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr">' +
			'			<button class="btn_layer confirm">확인</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		gCol.setLayer(el, html);
		
		var $layer = $('#gathering_type');
		
		var reqtype = $el.data('reqtype');
		if (reqtype) {
			$layer.find('.type_list[data-value="' + reqtype + '"]').addClass('on');
		}
		
		var content = $el.data('reqbody');
		if (content) {
			$("#collect_req_express").val(content);
		}
		
		// 타입선택
		$layer.find('.type_list').on('click', function(){
			if ($(this).hasClass('on')) return false;
			$layer.find('.type_list').removeClass('on');
			$(this).addClass('on');
		});
		
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			var $sel_type = $layer.find('.type_list.on');
			if ($sel_type.length == 0) {
				mobiscroll.toast({message:gap.lang.select_collect_req_method, color:'danger'});
				return false;
			}
			
			var $content = $layer.find('#collect_req_express');
		/*	if ($content.val() ==  ""){
				mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
				return false;
			}*/
		
			var txt = $sel_type.find('strong').text();
			$el.find('.cont').html(txt);
			$el.data('reqtype', $sel_type.data('value')).addClass('on');
			$el.data('reqbody', $content.val());
			$layer.find('.pop_btn_close').click();
			
			// 취합요청 버튼 처리
			if (is_edit){
				$('#collect_edit_btn').click();
				
			}else{
				if ($('.step.n1').hasClass('on') && $('.step.n2').hasClass('on') && $('.step.n3').hasClass('on') && $('.step.n4').hasClass('on')){
					if ($('#collect_req_btn').parent().hasClass('finish')){
						// do nothing
					}else{
						$('#collect_req_btn').parent().addClass('act');
						$('#collect_req_btn').parent().addClass('finish');
						
						$('#collect_req_btn').click();
					}
				}				
			}

			return false;
		});
	},
	
	"collectUserSearch" : function(type, str){
		/*
		 * type : S(제출담당자), R(참조자)
		 */
		if (type == "S"){
			$("#input_collect_submitter").val("");
			
		}else if (type == "R"){
			$("#input_collect_referrer").val("");
			
		}
		
		gsn.requestSearch('', str, function(sel_data){
			for (var i = 0; i < sel_data.length; i++){
				var info = sel_data[i];
			//	if (info.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
			//		mobiscroll.toast({message:gap.lang.me_not_add_invite_user, color:'danger'});
			//		return false;
 			//	}else{
 					gCol.aleady_select_user_count = 0;
 					gCol.collectAddUser(type, info);
 					gCol.alertAleadySelectUser();
 			//	}
			}
		});
	},	
	
	"addUploadFileList" : function(file, type, selector){
		var _type = (selector.indexOf('response') > -1 ? 'response' : 'main');
		
		if (typeof(file) != "undefined"){
			var _html = '';
			
			for (var i = 0; i < file.length; i++){
				var fx = file[i];			
				var ext = gap.file_icon_check(fx.name);
				var size = gap.file_size_setting(fx.size);					
				_html += '<div class="file_have">';
				_html += '	<span class="file_name">' + fx.name + '</span>';
				_html += '	<button class="file_remove_btn" data-name="' + fx.name + '" data-size="' + fx.size + '" onClick=\"gCol.removeFile(this, \'' + _type + '\')\"></button>';
				_html += '</div>';
			}
				
			$("#" + selector).append(_html);			
		}
	},
	
	"addSavedFileList" : function(is_main, file, id, selector){
		if (typeof(file) != "undefined"){
			var _html = '';

			for (var i = 0; i < file.length; i++){
				var fx = file[i];			
				var ext = gap.file_icon_check(fx.filename);
				var size = gap.file_size_setting(fx.file_size.$numberLong);
				var md5_id = fx.md5.replace(".", "_");
				
				_html += '<div class="file_have">';
				_html += '	<span class="file_name">' + fx.filename + '</span>';
				if (is_main){
					_html += '	<button class="file_remove_btn" id="' + md5_id + '" data-id="' + id + '" data-md5="' + fx.md5 + '" onClick=\"gCol.removeMainFile(this)\"></button>';
					
				}else{
					_html += '	<button class="file_remove_btn" id="' + md5_id + '" data-id="' + id + '" data-md5="' + fx.md5 + '" onClick=\"gCol.removeResponseFile(this)\"></button>';	
				}
				_html += '</div>';
			}
				
			$("#" + selector).append(_html);
			$("#" + md5_id).data("finfo", fx);			
		}
	},	
	
	"removeFile" : function(obj, doctype){
		$(obj).parent().remove();
		
		var filename = $(obj).data("name");
		var size = $(obj).data("size");
				
		var list = (doctype == "main" ? myDropzone_collect.files : myDropzone_response.files);		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if ( (filename == item.name) && (size == item.size)){
				$("#total-progress_channel").hide();
				if (doctype == "main"){
					myDropzone_collect.removeFile(item);
					
				}else{
					myDropzone_response.removeFile(item);
				}
				break;
			}
		}
	},
	
	"removeMainFile" : function(obj){
		var _finfo = $('#collect_info_edit').data('finfo');
		var _id = $(obj).data("id");
		var _md5 = $(obj).data("md5");
		
		var surl = gap.channelserver + "/collection_main_file_delete.km";
		var postData = {
				"id" : _id,
				"md5" : _md5
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
					// 취합 내용에 있던 finfo 배열 중에서 md5에 해당되는 데이터를 삭제
					var _new_finfo = _finfo.filter(function(info){
						if (info.md5 != _md5){
							return info;
						}
					})
					$('#collect_info_edit').data('finfo', _new_finfo);
					$(obj).parent().remove();

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
	
	"removeResponseFile" : function(obj){
		var _id = $(obj).data("id");
		var _md5 = $(obj).data("md5");
		
		var surl = gap.channelserver + "/collection_response_file_delete.km";
		var postData = {
				"id" : _id,
				"md5" : _md5
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
					$(obj).parent().remove();

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
	
	"collectAddUser" : function(type, obj){
		if (obj == undefined){
			mobiscroll.toast({message:gap.lang.searchnoresult, color:'danger'});
			return false;
		}

		var user_info = gap.user_check(obj);
		var ky = user_info.ky;
		if (type == "S"){	// 제출 작성자
			var len = $("#collect_submitter_list #member_" + type + "_" + ky).length;
			
			var dept_list = [];
			$.each($("#collect_submitter_list").children(), function(idx, val){
				var _info = $(val).data("user");
				if (_info.dsize == "group"){
					dept_list.push(_info.dpc);
				}
			});
			
			gCol.s_dept_exist = false;
			$.each(dept_list, function(idx, val){
				if (val == obj.dpc){
					gCol.s_dept_exist = true;
					return false;
				}
			});
			
			if (gCol.s_dept_exist){
				return false;
			}
			
		}else if (type == "R"){	// 참조인
			var len = $("#collect_referrer_list #member_" + type + "_" + ky).length;
			
		}
		
		if (len > 0){
			gCol.aleady_select_user_count += len;
			return false;
		}

		var html =
			'<li class="f_between" id="member_' + type + '_' + ky + '">' +
			'	<span class="txt ko">' + user_info.disp_user_info + '</span>' +
			'	<button class="file_remove_btn" onclick="gCol.collectDeleteUser(this)"></button>' +
			'</li>';

		if (type == "S"){
			$("#collect_submitter_list").append($(html));
			
			if ($("#collect_submitter_list").children().length > 0){
				$("#collect_submitter_list").parent().show();
			}
			
		}else if (type == "R"){
			$("#collect_referrer_list").append($(html));
			
			if ($("#collect_referrer_list").children().length > 0){
				$("#collect_referrer_list").parent().show();
			}
		}
				
		delete obj['_id'];
		obj.ky = obj.emp.toLowerCase();
		$("#member_" + type + "_" + ky).data('user', obj);
		$("#member_" + type + "_" + ky).data('dept', obj.dpc);
	},
	
	"alertAleadySelectUser" : function(){
		if (gCol.aleady_select_user_count == 0){
			//nothing
			
		}else if (gCol.aleady_select_user_count == 1){
			mobiscroll.toast({message:gap.lang.existuser, color:'danger'});
			return false;
			
		}else{
			mobiscroll.toast({message:gap.lang.existuser + " (" + gCol.aleady_select_user_count + " " + gap.lang.myung + ")", color:'danger'});
			return false;	
		}
	},
	
	"alertAleadySelectDept" : function(){
		if (gCol.s_dept_exist){
			mobiscroll.toast({message:gap.lang.cannot_select_same_dept_member, color:'danger'});
			return false;			
		}
	},	
	
	"collectDeleteUser" : function(obj){
		var user_info = $(obj).parent().data("user");
		var id = $(obj).parent().attr("id");
		$("#" + id).remove();
		
		if ($("#collect_submitter_list").children().length == 0){
			$("#collect_submitter_list").parent().hide();
		}
		if ($("#collect_referrer_list").children().length == 0){
			$("#collect_referrer_list").parent().hide();
		}
	},
	
	"clearDropzone" : function(){
		if (typeof(myDropzone_collect) != "undefined"){
			myDropzone_collect.removeAllFiles(true);
			myDropzone_collect.is_edit = false;
		}
		if (typeof(myDropzone_response) != "undefined"){
			myDropzone_response.removeAllFiles(true);
		}
		
		var _header = gCol.drawCollectHeader();
		$('#main_header').html(_header);
		
		//이벤트 처리
		gCol.eventCollectMain();
	},

	
	"drawCollectList" : function(page_no){
		if (page_no == 1){
			gCol.start_page = "1";
			gCol.cur_page = "1";
			gCol.total_data_count = 0;
		}
		
		gCol.start_skp = (parseInt(gCol.per_page) * (parseInt(page_no))) - (parseInt(gCol.per_page) - 1);
		var surl = gap.channelserver + "/api/collection/search_collection.km";
		
		var postData = {
				"start" : (gCol.start_skp - 1).toString(),
				"perpage" : gCol.per_page,
				"day" : moment.utc().format(),
				"dcode" : gap.userinfo.rinfo.dpc,
				"type" : gCol.search_collection_type,
				"opt" : gCol.search_collection_opt
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
					var _no_data = false;
					
					if (gCol.search_collection_opt == "2"){
						//취합중인것을 계산하는 경우이다. 좌측 프레임의 건수를 맞춰야 한다..
						var cnt = res.data.t1;
						if (cnt > 0){
							gap.unread_count_check("7", cnt);
						}	
					}
					
					var _today_date = moment(new Date()).utc().local().format('YYYY-MM-DD');	//moment(new Date());

					$("#all_coll span").html(res.data.total);
					$("#receive_coll span").html(res.data.t1);
					$("#send_coll span").html(res.data.t2);
					$("#ref_coll span").html(res.data.t3);
					$("#temp_coll span").html(res.data.t4);
					
					$("#collect_list").empty();
					
					if (res.data.total == 0){
						_no_data = true;
					}
					if (gCol.search_collection_type == "5"){
						if (res.data.t4 == 0){
							_no_data = true;
							
						}else{
							_no_data = false;
						}
					}
					
					if (_no_data){
						var _html =
							'<tr style="cursor:default;">' +
							'	<td colspan="9" style="text-align:center;">' + gap.lang.reg_no_collection + '</td>' +
							'</tr>'
							
						$('#collect_list').html(_html);
						return false;
					}
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];
						var _title = _info.name;
						var _content = _info.content;
						var _disp_date = moment(_info.due_date).utc().local().format('YYYY.MM.DD')
						var _due_date = moment(_info.due_date).utc().local().format('YYYY-MM-DD');	//moment(_info.due_date);
						var _diff_days = moment(_due_date).diff(moment(_today_date), 'days');
						var _owner_info = gap.user_check(_info.owner);
						var _folder = (_info.file_info != "" ? _info.file_info.folder : _info.key);
						var _cyear = (_info.file_info != "" ? _info.file_info.cyear : _info.key.substr(0,4));
						var _col_id = _info._id.$oid;
						var _type = "";
						var _status_txt = "";				// 취합 상태
						var _type_response_btn = "";		// 응답버튼 유형 (P : 개인 / D : 부서)
						var _show_response_btn = false;		// 제출담당자 등답버튼 보이기
						var _show_edit_btn = false;			// 제출담당자 수정버튼 보이기
						var _show_del_btn = false;			// 삭제버튼 보이기
						var _has_response = false;			// 응답문서가 있는지 여부
						var _res_count = 0;					// 응답 갯수
						var _file_info = "";
						var _file_count = 0;
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
		
						if (typeof(_info.file_info) != "undefined" && _info.file_info != "" && _info.file_info.files.length > 0){
							_file_info = _info.file_info.files;
							_file_count = _info.file_info.files.length;
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
									_show_response_btn = true;
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
						//	_show_response_btn = false;
						//	_show_edit_btn = false;
							_show_del_btn = true;
							_type = gap.lang.sent_collection;
							if (gCol.search_collection_type == "2"){
								_type = gap.lang.receive_collection;
								
							}else if (gCol.search_collection_type == "3"){
								_type = gap.lang.sent_collection;
							}
							if (_diff_days > -1){
								_status_txt = gap.lang.ing_collection;
							}
						}
						
						if (_diff_days < 0){
							//취합 마감
						/*	
						 * 체크하지 않게 처리 요청 - 황수진 (2022.11.21)
						 * _show_response_btn = false;
							_show_edit_btn = false;*/
							_status_txt = gap.lang.close_collection;
						}
						
						if (_info.temp == "T"){
							_show_response_btn = false;
							_type = gap.lang.temps;
							_status_txt = gap.lang.before_collection;
							if (_info.owner.ky == gap.userinfo.rinfo.ky){
								_request_html = '<button id="reg_request_btn" class="change_btn">' + gap.lang.collect_request + '</button>';	
							}
						}

						_html += '<tr id="' + _folder + '">';
						_html += '	<td class="color fw800"><span class="middot">' + _type + _request_html + '</span></td>';
						_html += '	<td class="fw800"><a href="#" class="post_cont">' + _title + ' </a>' + (_file_count > 0 ? '<span class="file_icon"></span>' : '') + '</td>';
						_html += '	<td class="en">' + _disp_date + '<span class="fz14">(' + moment(_info.due_date).format('ddd') + ')</span> ' + _info.due_time + (_diff_days > 0 ? '<span class="num en dday">D-' + _diff_days + '</span>' : "") + '</td>';
						_html += '	<td class="">' + _owner_info.disp_user_info + '</td>';
						_html += '	<td class="en">' + _res_count + '/' + _info.submitter.length + gap.lang.myung + '</td>';
						_html += '	<td class="">' + _status_txt + '</td>';
						_html += '	<td><button data-restype="' + _type_response_btn + '" class="ico btn_circle wri_btn' + (_show_response_btn ? "" : " disabled") + '">작성</button></td>';
						_html += '	<td><button class="ico btn_circle cor_btn' + (_show_edit_btn ? "" : " disabled") + '">수정</button></td>';
						_html += '	<td><button class="ico btn_circle del_btn' + (_show_del_btn ? "" : " disabled") + '">복사</button></td>';
						_html += '</tr>';
						
						$("#collect_list").append(_html);
						
						$("#" + _folder).data("folder", _folder);
						$("#" + _folder).data("cyear", _cyear);
						$("#" + _folder).data("colid", _col_id);
						$("#" + _folder).data("title", _title);
						$("#" + _folder).data("content", _content);
						$("#" + _folder).data("fileinfo", _file_info);
						$("#" + _folder).data("submitter", _info.submitter);
						$("#" + _folder).data("referrer", _info.referrer);
						$("#" + _folder).data("endtime", moment(_info.due_date).format('YYYY-MM-DD') + ' ' + _info.due_time);
					}
					
					//페이징
					if (gCol.search_collection_type == "1"){
						gCol.total_data_count = res.data.total;	
						
					}else if (gCol.search_collection_type == "2"){
						gCol.total_data_count = res.data.t1;
						
					}else if (gCol.search_collection_type == "3"){
						gCol.total_data_count = res.data.t2;
						
					}else if (gCol.search_collection_type == "4"){
						gCol.total_data_count = res.data.t3;
						
					}else if (gCol.search_collection_type == "5"){
						gCol.total_data_count = res.data.t4;
						
					}
					gCol.total_page_count = gCol.getPageCount(gCol.total_data_count, gCol.per_page);
					gCol.initializePage();
					
					// 이벶트
					gCol.eventCollectList();
					
				}else{
					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"eventCollectList" : function(){
		$("#collect_list tr").off().on("click", function(e){
			var _folder = $(this).data("folder");
			var _cyear = $(this).data("cyear");
			var _colid = $(this).data("colid");
			var _endtime = $(this).data("endtime");
			var _deadline = false;
			var t1 = moment(_endtime, 'YYYY-MM-DD HH:mm'); 
			var t2 = moment(); 
			var dif = moment.duration(t2.diff(t1)).asMinutes();
			
			// 취합 마감 기한 체크
			if (dif > 0){
				_deadline = true;
			}
			
			if (e.target.className == "ico btn_circle wri_btn"){
				// 응답 작성 버튼
				var _res_type = $(e.target).data("restype")
				
			/*
			 * 	체크하지 않게 처리 요청 - 황수진 (2022.11.21)
			 * 	if (_deadline){
					mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
					return false;
				}*/
				gCol.createCollectResponse(_folder, _res_type);
				
			/*	var _res_type = $(e.target).data("restype");
				var _content = $(e.target).parent().parent().data("content");
				var _fileinfo = JSON.parse($(e.target).parent().parent().data("fileinfo"));
				var _file_html = "";
				
				for (var i = 0; i < _fileinfo.length; i++){
					var _file = _fileinfo[i];
					_file_html += '<a href="" download>' + _file.filename + '</a>';
				}
				
				var _html = '';
				_html += '<div id="collect_write_layer" class="layer_wrap gathering_write_pop center" style="width: 440px;">';
				_html += '	<div class="layer_inner">';
				_html += '		<div class="pop_btn_close"></div>';
				_html += '		<h4>' + gap.lang.collection_write + '</h4>';
				_html += '		<span class="g_w_pop_txt">' + _content;
				_html += '		</span>';
				_html += '		<textarea id="collect_response_express" name="" placeholder="' + gap.lang.input_content + '"></textarea>';
				_html += '		<div class="g_write_pop_bot">';
				_html += '			<h5>' + gap.lang.attachment + '</h5>';
				_html += '			<button class="g_w_pop_file_btn">' + gap.lang.addFile + '</button>';
				_html += '		</div>';
				_html += '		<div class="g_w_pop_file_box" id="response_collect_file_list">';
				_html += '		</div>';
				if (_file_html != ""){
					_html += '		<div class="g_w_pop_file_info">';
					_html += '			<h5>' + gap.lang.download_template_file + '</h5>' + _file_html;
					_html += '		</div>';
				}
				_html += '		<div class="g_w_pop_btn_box">';
				_html += '			<div class="g_w_pop_btn s_w_submit">' + gap.lang.submission + '</div>';
				_html += '		</div>';
				_html += '	</div>';
				_html += '</div>';
				
				gCol.setCollectLayer("#container .contents.scroll", _html);
				
				var $layer = $('#collect_write_layer');
				
				// DropZone 설정
				gCol.responseUploadInit('collect_write_layer')
				
				// 닫기
				$layer.find('.pop_btn_close').on('click', function(){
					$layer.remove();
					gCol.hideCollectBlock();
					return false;
				});
				
				// 파일 추가
				$layer.find('.g_w_pop_file_btn').on('click', function(){
					$("#response_collect_add_file").click();
					return false;
				});
				
				// 제출
				$layer.find('.s_w_submit').on('click', function(){
					var $content = $layer.find('#collect_response_express');
					if ($content.val() ==  ""){
						mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
						return false;
					}
					
					myDropzone_response.folder = _folder;
					myDropzone_response.cyear = _cyear;
					myDropzone_response.restype = _res_type;	// 개인/부서
					myDropzone_response.content = $("#collect_response_express").val();
					
					if (myDropzone_response.files.length == 0){
						var obj = {
								"folder" : _folder,
								"fserver" : "",
								"files" : []
						}
						myDropzone_response.files_info = obj;
						gCol.collect_response_save(false);
						
					}else{
						myDropzone_response.processQueue();	
					}
					$layer.find('.pop_btn_close').click();
					return false;
				});*/
				
			}else if (e.target.className == "ico btn_circle cor_btn"){
				// 수정버튼
			/*	
			 * 체크하지 않게 처리 요청 - 황수진 (2022.11.21)
			 * if (_deadline){
					mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
					return false;
				}*/
				gCol.editCollectResponse(_folder);
				
			}else if (e.target.className == "ico btn_circle del_btn"){
				// 삭제버튼
				gap.showConfirm({
					title: gap.lang.Confirm,
					iconClass: 'remove',
					contents: gap.lang.confirm_delete,
					callback: function(){
						gCol.deleteCollectMain(_colid, _folder);	
					}
				});
			
			}else if (e.target.className == "change_btn"){
				var _folder = $(this).closest('tr').data('folder');
				
				// 취합 요청
				gap.showConfirm({
					title: gap.lang.Confirm,
				//	iconClass: 'remove',
					contents: gap.lang.confirm_request_collection,
					callback: function(){
						var surl = gap.channelserver + "/api/collection/search_collection_item.km";
						var postData = {
								"key" : _folder
							};	

						$.ajax({
							type : "POST",
							url : surl,
							dataType : "text",	//"json",
							async : false,
							data : JSON.stringify(postData),
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
								xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							},			
							success : function(__res){
								var res = JSON.parse(__res);
								if (res.result == "OK"){
									gCol.direct_collect_main_save(res.data.ori);						
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
							}
						});
					}
				});	
				
			}else{
				gCol.showCollectDetailView(_folder);	
			}
		});
	},
	
	"showCollectDetailView" : function(_folder, is_direct){
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
					if (is_direct){
						$('#container').hide();
						$('#container_detail').show();
						
					}else{
						$('#container').fadeOut();
						$('#container_detail').fadeIn();
					}
					
					gCol.drawCollectDetailView(res);

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
	
	// 메인에서 취합 상세 바로 보기
	"directCollectDetailView" : function(_folder){
		var id = 'collect';
		var url = location.pathname + "?readform&" + id;
		if (history.state != id){
			history.pushState(id, null, url);
		}else{
			history.replaceState(id, null, url);
		}
		
		// 왼쪽에 선택이 안되어 있는 경우 선택되도록 처리
		if (!$('#collect').hasClass('act')){
			$('#left_menu_list').find('ul .act').removeClass('act');
			$('#collect').addClass('act');
		}
		
		$("#main_content").hide();
		$("#left_main").html('').css({"width": "0", "border":"none"});
		$("#main_body").css({
			left: '63px',
			right: '0',
			background: '#fff',
			width: ''			
		}).show();		
		
		$("#center_content").css("width", "100%");
		$("#user_profile").css("width", "0px");
		$(".left-area").hide();
		$("#center_content").show();
		$("#center_content").off();
		$("#center_content").removeAttr("class");
		
		// 가운데 화면, 우측 화면 처리
		$('#center_content').html('').css('width', '100%');
		$('#user_profile').html('').hide();
		
		gCol.cur_company = '';
		gCol.centerInit(true);
		gCol.showCollectDetailView(_folder, true);
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
						_file_html += '<div><a href="#" class="download-file" data-md5="' + _file.md5 + '">' + _file.filename + '</a></div>';
					}
					
					if (_res_type == 'P'){
						_ky = gap.userinfo.rinfo.ky;
						
					}else{
						_ky = gap.userinfo.rinfo.dpc;
					}
					
					var _html = '';
					_html += '<div id="collect_write_layer" class="layer_wrap gathering_write_pop center" style="width: 440px;">';
					_html += '	<div class="layer_inner">';
					_html += '		<div class="pop_btn_close"></div>';
					_html += '		<h4>' + gap.lang.collection_write + '</h4>';
					_html += '		<span class="g_w_pop_txt">' + main_content;
					_html += '		</span>';
					_html += '		<textarea id="collect_response_express" name="" placeholder="' + gap.lang.input_content + '"></textarea>';
					_html += '		<div class="g_write_pop_bot">';
					_html += '			<h5>' + gap.lang.attachment + '</h5>';
					_html += '			<button class="g_w_pop_file_btn">' + gap.lang.addFile + '</button>';
					_html += '		</div>';
					_html += '		<div class="g_w_pop_file_box" id="response_collect_file_list">';
					_html += '		</div>';
					if (_file_html != ""){
						_html += '		<div class="g_w_pop_file_info">';
						_html += '			<h5>' + gap.lang.download_template_file + '</h5>' + _file_html;
						_html += '		</div>';
					}
					_html += '		<div class="g_w_pop_btn_box">';
					_html += '			<div class="g_w_pop_btn s_w_submit">' + gap.lang.submission + '</div>';
					_html += '		</div>';
					_html += '	</div>';
					_html += '</div>';
			
					
					// 기존에 Blockui가 떠 있는지 체크
					gCol.is_before_block = false;
					if ($('#blockui').is(':visible')) {
						var ck_z = parseInt($('#blockui').css('z-index')) + 1;
						
						// 최상위 레이어 가져오기
						$("header, div, article, section, nav, aside").not("[class*='mbsc-']").each(function(){
							if (!$(this).is(':visible')) return true;
							var z = parseInt($(this).css("z-index"));
							if (ck_z == z) {
								gCol.is_before_block = true;
								gCol.top_layer_element = $(this);
								return false;
							}
						});
					}
					
					gap.showBlock();
					
					$("#common_work_layer").show();
					$("#common_work_layer").html(_html);
					var $layer = $('#collect_write_layer');
					var inx = parseInt(gap.maxZindex()) + 1;
					$layer.css('z-index', inx).addClass('show-layer');
					
					// DropZone 설정
					gCol.responseUploadInit('collect_write_layer')
					
					// 닫기
					$layer.find('.pop_btn_close').on('click', function(){
						gCol.hideCreateResponse();
					});
					
					// 파일 추가
					$layer.find('.g_w_pop_file_btn').on('click', function(){
						$("#response_collect_add_file").click();
						return false;
					});
					
					// 템플릿 파일 다운로드
					$layer.find('.download-file').off().on('click', function(){
						var md5 = $(this).data("md5");

						gCol.downloadFile(_fserver, '1', _folder, md5, 'main');
					});
					
					// 제출
					$layer.find('.s_w_submit').on('click', function(){
					/*	
					 * 체크하지 않게 처리 요청 - 황수진 (2022.11.21)
					 * if (_deadline){
							mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
							return false;
						}*/
						
						var $content = $layer.find('#collect_response_express');
						if ($content.val() ==  "" && myDropzone_response.files.length == 0){
							mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
							return false;
						}
						
						myDropzone_response.folder = _folder;
						myDropzone_response.cyear = _cyear;
						myDropzone_response.restype = _res_type;	// 개인/부서
						myDropzone_response.content = $("#collect_response_express").val();
						
						if (myDropzone_response.files.length == 0){
							var obj = {
									"folder" : _folder,
									"fserver" : "",
									"files" : []
							}
							myDropzone_response.files_info = obj;
							gCol.collect_response_save(false);
							
						}else{
							myDropzone_response.processQueue();	
						}
						$layer.find('.pop_btn_close').click();
						mobiscroll.toast({message:gap.lang.reg_success, color:'success'});
						return false;
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
	
	"hideCreateResponse" : function(){
		if (gCol.is_before_block) {
			var z = parseInt($('#blockui').css('z-index')) + 1;
			gCol.top_layer_element.css('z-index', z);
		} else {
			gap.hideBlock();
		}
		$('#collect_write_layer').remove();
	},
	
	// 응답 수정
	"editCollectResponse" : function(_folder){
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
					var _fserver = response.fserver;
					var _folder = (main_finfo != "" ? main_finfo.folder : main.key);
					var _cyear = (main_finfo != "" ? main_finfo.cyear : main.key.substr(0,4));
					var my_response = "";
					
					if (_folder == "undefined"){
						_folder = main.key;
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
						var res_id = my_response._id.$oid;
						var _html = '';
						
						_html += '<div id="collect_edit_layer" class="layer_wrap gathering_write_pop center" style="width: 440px;">';
						_html += '	<div class="layer_inner">';
						_html += '		<div class="pop_btn_close"></div>';
						_html += '		<h4>' + gap.lang.collection_modify + '</h4>';
						_html += '		<span class="g_w_pop_txt">' + main_content;
						_html += '		</span>';
						_html += '		<textarea id="collect_response_express" name="" placeholder="' + gap.lang.input_content + '"></textarea>';
						_html += '		<div class="g_write_pop_bot">';
						_html += '			<h5>' + gap.lang.attachment + '</h5>';
						_html += '			<button class="g_w_pop_file_btn">' + gap.lang.addFile + '</button>';
						_html += '		</div>';
						_html += '		<div class="g_w_pop_file_box" id="response_collect_file_list">';
						_html += '		</div>';
						if (res_finfo != ""){
							_html += '		<div class="g_w_pop_file_info">';
							_html += '			<h5>' + gap.lang.download_template_file + '</h5>';
							_html += '		</div>';							
						}
						_html += '		<div class="g_w_pop_btn_box">';
						_html += '			<div class="g_w_pop_btn s_w_submit">' + gap.lang.basic_modify + '</div>';
						_html += '		</div>';
						_html += '	</div>';
						_html += '</div>';
						
						gCol.setCollectLayer("#container .contents.scroll", _html);
						
						var $layer = $('#collect_edit_layer');
						
						// DropZone 설정
						gCol.responseUploadInit('collect_edit_layer')

						// 콘첸츠 내용 세팅
						$layer.find('#collect_response_express').val(res_content);
						
						// 취합파일 세팅
						gCol.addSavedFileList(false, res_finfo, res_id, "response_collect_file_list");	
						
						// 템플릿 파일 세팅
						if (main_finfo != ""){
							for (var j = 0; j < main_finfo.files.length; j++){
								var main_file = main_finfo.files[j];
								var file_html = "";
								
								file_html += '<div><a href="#" class="download-file" data-md5="' + main_file.md5 + '">' + main_file.filename + '</a></div>';
								$layer.find('.g_w_pop_file_info').append(file_html);
							}							
						}
						
						// 템플릿 파일 다운로드
						$layer.find('.download-file').off().on('click', function(){
							var md5 = $(this).data("md5");

							gCol.downloadFile(_fserver, '1', _folder, md5, 'main');
						});
						
						// 파일 추가
						$layer.find('.g_w_pop_file_btn').on('click', function(){
							$("#response_collect_add_file").click();
							return false;
						});
						
						// 닫기
						$layer.find('.pop_btn_close').on('click', function(){
							$layer.remove();
							gCol.hideCollectBlock();
							return false;
						});
						
						// 수정(저장) 버튼
						$layer.find('.s_w_submit').on('click', function(){
							var $content = $layer.find('#collect_response_express');
						  	if ($content.val() ==  "" && myDropzone_response.files.length == 0){
								mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
								return false;
							}
							
							var finfo_list = [];
							$(".file_remove_btn").each(function(idx, obj){
								var finfo = $(obj).data("finfo");
								if (finfo){
									finfo_list.push(finfo);
								}
							});
							$layer.data('finfo', finfo_list);
							
							if (myDropzone_response.files.length > 0){
								myDropzone_response.folder = _folder;
								myDropzone_response.cyear = _cyear;
								myDropzone_response.res_id = res_id;
								myDropzone_response.content = $("#collect_response_express").val();
								myDropzone_response.processQueue();
								return false;
								
							}else{
								var surl = gap.channelserver + "/update_collection_response.km";
								var postData = {
										"id" : res_id,
										"writer" : gap.userinfo.rinfo,
										"content" : $("#collect_response_express").val()
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
											// 닫기
											$layer.find('.pop_btn_close').click();
										//	gCol.drawCollectList(gCol.cur_page);
											
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
	
	"drawCollectDetailView" : function(res){
		var _html = '';
		var _info = res.data.ori;
		var _response = res.data.response;
		var _qna_count = res.data.qnacount;
		var _created_date = gCol.convertGMTLocalDateTime(_info.GMT);
		var _today_date = moment(new Date()).utc().local().format('YYYY-MM-DD');	//moment(new Date());
		var _disp_date = moment(_info.due_date).utc().local().format('YYYY.MM.DD');
		var _due_date = moment(_info.due_date).utc().local().format('YYYY-MM-DD');
		var _diff_days = moment(_due_date).diff(moment(_today_date), 'days');
		var _owner_info = gap.user_check(_info.owner);
		var _folder = (_info.file_info != "" ? _info.file_info.folder : _info.key);
		var _fserver = _info.fserver;
		var _col_id = _info._id.$oid;
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
		var _deadline = false;
		var t1 = moment(_info.due_date).utc().local().format('YYYY-MM-DD HH:mm'); 
		var t2 = moment(); 
		var dif = moment.duration(t2.diff(t1)).asMinutes();
		
		if (_folder == "undefined"){
			_folder = _info.key;
		}
		
		// 취합 마감 기한 체크
		if (dif > 0){
			_diff_days = -1;
			_deadline = true;
		}
		
		if (typeof(_info.file_info) != "undefined" && _info.file_info != "" && _info.file_info.files.length > 0){
			_file = (_info.file_info.files.length == 1 ? _info.file_info.files[0].filename : _info.file_info.files[0].filename + " " + gap.lang.other + " " + (_info.file_info.files.length - 1) + " " + gap.lang.total_attach_count_txt);
			_file_md5 = _info.file_info.files[0].md5;
			_file_count = _info.file_info.files.length;
		}
		
		gCol.collect_owner = _info.owner;
		gCol.collect_submitter_list = _info.submitter;
		gCol.collect_referrer_list = _info.referrer;
		
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
				_status_txt = gap.lang.ing_collection		//취합중
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
		
		_html += '<div class="contents scroll">';
		_html += '	<div class="before_box">';
		_html += '		<a href="#" id="before_btn" class="before_btn fw800"><span class="before_btn_icon"></span>' + gap.lang.back + '</a>';
		_html += '	</div>';
		_html += '	<section class="section gathering_detail_sec">';
		_html += '		<div class="gathering_detail_top">';
		_html += '			<div class="g_detail_tit" style="width:calc(100% - 360px);">';
		_html += '	    		<h2>' + _info.name + '</h2>';
		_html += '				<div class="g_detail_sub_txt">';
		_html += '	    			<span class="fw800">' + _info.content + '</span>';
		_html += '					<span class="tool_ico" id="info_ico" style="padding-right:20px;"></span>';
		_html += '				</div>';
		_html += '			</div>';
		_html += '			<div class="g_detail_btn_box">';
		if (_owner_info.ky == gap.userinfo.rinfo.ky){
			// 취합담당자(원본 작성자)인 경우
			if (_res_count == 0 && !_deadline){
				_html += '				<button id="main_edit_btn" class="g_detail_btn g_detail_change_btn">' + gap.lang.basic_modify + '</button>';	
			}
			_html += '				<button id="main_delete_btn" class="g_detail_btn g_detail_remove_btn">' + gap.lang.basic_delete + '</button>';
		}
		_html += '				<button id="detail_qna_btn" class="g_detail_btn g_detail_qa_btn">Q&A(<span id="qna_btn_total_count">' + _qna_count + '</span>)</button>';
		_html += '			</div>';
		_html += '		</div>';
		_html += '		<div id="collect_detail_main" class="tab_cont_wr">';
		_html += '			<table class="table_type_a">';
		_html += '				<thead>';
		_html += '					<tr>';
		_html += '						<th style="width: 15%;" class="inb fw800">' + gap.lang.deadline + '</th>';					//마감일
		_html += '						<th style="width: 13%;" class="inb fw800">' + gap.lang.manager_collection + '</th>';		//취합담당자
		_html += '						<th style="width: 10%;" class="inb fw800">' + gap.lang.count_person_collection + '</th>';	//취합인원
		_html += '						<th style="width: 10%;" class="inb fw800">' + gap.lang.collect_referrer + '</th>';			//참조인
		_html += '						<th style="width: 10%;" class="inb fw800">' + gap.lang.status_collection + '</th>';			//취합현황
		_html += '						<th style="width: 10%;" class="inb fw800">' + gap.lang.my_role + '</th>';					//내 역할
		if (_owner_info.ky != gap.userinfo.rinfo.ky){
			_html += '						<th style="width: 10%;" class="inb fw800">' + gap.lang.status_submission + '</th>';		//제출현황
		}
		_html += '						<th style="width: auto; padding-right: 1.5%;" class="inb fw800">' + gap.lang.template + '</th>';	//템플릿
		_html += '						<th style="width: 10%; padding-right: 1.5%;" class="inb fw800">' + gap.lang.created + '</th>';	//템플릿
		_html += '					</tr>';
		_html += '				</thead>';
		_html += '				<tbody>';
		_html += '					<tr class="assembling type_file"> <!-- 취합중 assembling 클래스 -->';
		_html += '						<td class="fw800 en">' + _disp_date + '<span class="fz14">(' + moment(_info.due_date).format('ddd') + ')</span> ' + _info.due_time + (_diff_days > 0 ? '<span class="num en dday">D-' + _diff_days + '</span>' : "") + '</td>';
		_html += '						<td>' + _owner_info.disp_user_info + '</td>';
		_html += '						<td class="en fw600">' + _res_count + '/' + _info.submitter.length + gap.lang.myung + '</td>';
		_html += '						<td class="en fw600"><span id="disp_referrer" style="cursor:pointer;">' + _info.referrer.length + gap.lang.myung + '</span></td>';
		_html += '						<td class="fw800">' + _status_txt + '</td>';
		_html += '						<td class="fw800">' + _role_txt + '</td>';
		if (_owner_info.ky != gap.userinfo.rinfo.ky){
		//	_html += '						<td class="fw800">' + _submit_status_txt + (_show_response_edit_btn ? '<button id="response_edit_btn" class="change_btn">수정</button>' : '') + '</td>';			
			_html += '						<td class="fw800">' + _submit_status_txt + '</td>';
		}
		if (_file_count > 0){
			_html += '						<td class="fw800"><a href="#" class="download-file" data-md5="' + _file_md5 + '" data-fcount="' + _file_count + '">' + _file + '</a><span class="file_icon"></span></td>';
		}else{
			_html += '						<td class="fw800">&nbsp;</td>';
		}
		_html += '						<td class="fw800">' + _created_date + '</td>';
		_html += '					</tr>';
		_html += '				</tbody>';
		_html += '			</table>';
		_html += '		</div>';
		_html += '	</section>';		
		
		_html += '	<section class="section gathering_detail_sec">';
		_html += '		<div class="gathering_detail_bot">';
		_html += '			<div class="g_detail_tit g_detail_tit_flex">';           		
		_html += '	    		<h2>' + gap.lang.status_submission + '</h2>';


		_html += '			<div class="g_detail_select_wr">';
		_html += '				<div class="g_detail_btn_box h34">';
		_html += '					<button id="quick_start" class="g_detail_btn g_detail_qa_btn">' + gap.lang.start_work + '</button>';
		if (_owner_info.ky == gap.userinfo.rinfo.ky){
			_html += '					<button id="download_btn" class="g_detail_btn pd_l">' + gap.lang.optional_download + '</button>';
			_html += '					<button id="all_download_btn" class="g_detail_btn pd_l">' + gap.lang.all_download + '</button>';
			_html += '					<button id="alarm_btn" class="g_detail_btn">' + gap.lang.remind_noti + '</button>';
			_html += '					<button id="all_alarm_btn" class="g_detail_btn">' + gap.lang.all_remind_noti + '</button>';
		}		
		_html += '				</div>';
		_html += '			</div>';
		
		
		_html += '			</div>';		
		_html += '		</div>';
		_html += '		<div id="collect_detail_response" class="tab_cont_wr" style="height: calc(100vh - 490px); display: block; overflow-y: auto;">';

		_html += '			<table class="table_type_a">';
		_html += '				<thead>';
		_html += '					<tr>';

		if (_owner_info.ky == gap.userinfo.rinfo.ky){
			_html += '						<th style="width: 5%;" class="inb mu_chk_list">체크</th>';
		}
		_html += '						<th style="width: 7%;" class="inb fw800">' + gap.lang.status_submission + '</th>';
		_html += '						<th style="width: auto;" class="inb fw800">' + gap.lang.target_person + '</th>';
		_html += '						<th style="width: auto;" class="inb fw800">' + gap.lang.basic_content + '</th>';
		_html += '						<th style="width: auto;" class="inb fw800">' + gap.lang.file + '</th>';
	//	_html += '						<th style="width: 15%;" class="inb fw800">' + gap.lang.submission_date + '<div class="arr_wr"><div class="u_arr"></div><div class="d_arr"></div></div></th>';
		_html += '						<th style="width: 15%;" class="inb fw800">' + gap.lang.submission_date + '</th>';
		_html += '						<th style="width: 15%; padding-right: 1.5%;" class="inb fw800">' + gap.lang.modify_date + '</th>';
		_html += '					</tr>';
		_html += '				</thead>';
		_html += '				<tbody id="collect_response_list">';
		_html += '				</tbody>';
		_html += '			</table>';
		
		_html += '		</div>';
		_html += '	</section>';
		_html += '</div> <!-- //contents -->';
		
		$("#container_detail").html(_html);
		
		// 응답문서 그리기
	//	gCol.drawCollectResponseList((_role_txt == gap.lang.collect_submitter ? true : false), _owner_info, _response);
		gCol.drawCollectResponseList(false, _show_response_edit_btn, _owner_info, _info, _response);
		
		// 필요한 data 설정
		$("#collect_detail_main").data("info", _info);
		$("#collect_detail_main").data("fserver", _fserver);
		$("#collect_detail_main").data("folder", _folder);
		$("#collect_detail_main").data("colid", _col_id);
		$("#collect_detail_main").data("content", _info.content);
		$("#collect_detail_main").data("finfo", _info.file_info.files);
		$("#collect_detail_main").data("colid", _col_id);
		$("#collect_detail_main").data("deadline", _deadline);
		$("#collect_detail_main").data("referrer_cnt", _info.referrer.length);
		
		// 이벤트 처리
		gCol.eventCollectDetailView();
	},
	
	"drawCollectResponseList" : function(_is_submitter, _show_response_edit_btn, _owner_info, _info, _response){
		$("#collect_response_list").empty();
		
		if (_is_submitter){
			// 제출담당자
			for (var k = 0; k < _response.length; k++){
				var _html = '';
				var _res_info = _response[k];
				var _res_id = _res_info._id.$oid;
				var _res_content = (_res_info.content ? _res_info.content : "");
				var _res_owner = gap.user_check(_res_info.owner);
				var _res_datetime = "";
				var _res_modify_datetime = "";
				var _res_time = "";
				var _res_file = "";
				var _res_file_md5 = "";
				var _res_file_count = 0;
				
				if (typeof(_res_info.GMT) != "undefined"){
					_res_datetime = gCol.convertGMTLocalDateTime(_res_info.GMT);
				}
				if (typeof(_res_info.GMT2) != "undefined"){
					_res_modify_datetime = gCol.convertGMTLocalDateTime(_res_info.GMT2);
				}
				if (typeof(_res_info.file_info) != "undefined" && _res_info.file_info.length > 0){
					_res_file = (_res_info.file_info.length == 1 ? _res_info.file_info[0].filename : _res_info.file_info[0].filename + " " + gap.lang.other + " " +  (_res_info.file_info.length - 1) + " " + gap.lang.total_attach_count_txt);
					_res_file_md5 = _res_info.file_info[0].md5;
					_res_file_count = _res_info.file_info.length;
				}
						
				if (_res_owner.ky == gap.userinfo.rinfo.ky){
					_html += '<tr class="type_file">';
					_html += '	<td class="fw800">' + gap.lang.collect_submitter + '</td>';
					_html += '	<td>' + _res_content + '</td>';
				//	_html += '	<td class="fw800"><a href="#" id="' + _res_id + '" class="download-file" data-md5="' + _res_file_md5 + '" data-fcount="' + _res_file_count + '">' + _res_file + '</a>' + (_res_file != "" ? '<span class="file_icon"></span>' : "") + '</td>';
					_html += '	<td class="fw800"><a href="#" id="' + _res_id + '" class="download-file">' + _res_file + '</a>' + (_res_file != "" ? '<span class="file_icon"></span>' : "") + '</td>';
					_html += '	<td class="en fw600">' + _res_datetime + '</td>';
					_html += '	<td class="en fw600">' + _res_modify_datetime + '</td>';
					_html += '</tr>';
					
					$("#collect_response_list").append(_html);
					
					$("#" + _res_id).data("md5", _res_file_md5);
					$("#" + _res_id).data("fcount", _res_file_count);
					$("#" + _res_id).data("finfo", _res_info.file_info);
					$("#" + _res_id).data("content", _res_content);
					$("#" + _res_id).data("owner", _res_info.owner);
					
					break;
				}
			}
			
		}else{
			// 내 부서 or 내 것만 표시한다.
			for (var k = 0; k < _response.length; k++){
				var _res_info = _response[k];
				
				if (_res_info.owner.dsize == "group" && (_res_info.owner.dpc == gap.userinfo.rinfo.dpc)){
					gCol.drawCollectResponseHtml('D', _owner_info, _info, _res_info);
					
				}else{
					if (_res_info.owner.ky == gap.userinfo.rinfo.ky){
						gCol.drawCollectResponseHtml('P', _owner_info, _info, _res_info);
					}
				}
			}
			
			// 내 부서 or 내 것을 제외한 나머지
			for (var k = 0; k < _response.length; k++){
				var _res_info = _response[k];
				
				if (_res_info.owner.dsize == "group" && (_res_info.owner.dpc != gap.userinfo.rinfo.dpc)){
					gCol.drawCollectResponseHtml('', _owner_info, _info, _res_info);
					
				}else{
					if (_res_info.owner.dsize != "group" && _res_info.owner.ky != gap.userinfo.rinfo.ky){
						gCol.drawCollectResponseHtml('', _owner_info, _info, _res_info);
					}
				}
			}				
		}
	},
	
	"drawCollectResponseHtml" : function(_res_type, _owner_info, _info, _response){
		var _html = '';
		var _res_info = _response;
		var _res_id = _res_info._id.$oid;
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
			_res_datetime = gCol.convertGMTLocalDateTime(_res_info.GMT);
		}
		if (typeof(_res_info.GMT2) != "undefined"){
			_res_modify_datetime = gCol.convertGMTLocalDateTime(_res_info.GMT2);
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
		
		_html += '<tr id="tr_' + _res_id + '" class="type_file">';
		if (_owner_info.ky == gap.userinfo.rinfo.ky){
			_html += '	<td class="mu_chk_box">';
			_html += '		<span class="chk_box">';
			_html += '			<input type="checkbox" id="chk_' + _res_owner.ky + '" name="response_chk" value="' + _res_owner.ky + '-spl-' + _res_owner.name + '"/>';
			_html += '			<label for="chk_' + _res_owner.ky + '"></label>';
			_html += '		</span>';
			_html += '	</td>';
			
		}
		
		if (_show_response_btn){
			var btn_id = "create_response_btn";
			if (_res_type == 'D'){
				btn_id = "create_group_response_btn";
			}
			_html += '	<td class="fw800">' + _res_submit + '<button id="' + btn_id + '" class="change_btn">' + gap.lang.basic_write + '</button></td>';
			
		}else if (_show_response_edit_btn){
			var btn_id = "edit_response_btn";
			if (_res_type == 'D'){
				btn_id = "edit_group_response_btn";
			}
			_html += '	<td class="fw800">' + _res_submit + '<button id="' + btn_id + '" class="change_btn">' + gap.lang.basic_modify + '</button></td>';
			
		}else{
			_html += '	<td class="fw800">' + _res_submit + '</td>';			
		}
		_html += '	<td>' + _res_disp_user_info + '</td>';
		_html += '	<td class="fw600" style="letter-spacing: -0.68px;">' + _res_content + '</td>';
		_html += '	<td class="fw800"><a href="#" id="' + _res_id + '" class="download-file">' + _res_file + '</a>' + (_res_file != "" ? '<span class="file_icon"></span>' : "") + '</td>';
		_html += '	<td class="en fw600">' + _res_datetime + '</td>';
		_html += '	<td class="en fw600">' + _res_modify_datetime + '</td>';
		_html += '</tr>';
		
		$("#collect_response_list").append(_html);
		
		$("#" + _res_id).data("md5", _res_file_md5);
		$("#" + _res_id).data("fcount", _res_file_count);
		$("#" + _res_id).data("finfo", _res_info.file_info);
		$("#" + _res_id).data("content", _res_content);
		$("#" + _res_id).data("owner", _res_info.owner);
		$("#chk_" + _res_owner.ky).data("owner", _res_info.owner);
	},
	
	"eventCollectDetailView" : function(){
		// 이전 버튼 - 상세보기
		$("#before_btn").off().on("click", function(){
			$('#container_detail').fadeOut();
			$('#container_detail').empty();
			$('#container').fadeIn();
			gCol.temp_collection = false; //초기화
			gma.refreshPos();
		});
		
		// 응답문서 작성 버튼
		$("#create_response_btn").off().on("click", function(){
			var $main = $("#collect_detail_main");
			var _folder = $main.data('folder');
			var _deadline = $main.data("deadline");

		/*	
		 * 체크하지 않게 처리 요청 - 황수진 (2022.11.21)
		 * if (_deadline){
				mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
				return false;
			}*/			
			gCol.createCollectResponse(_folder, 'P');
		});
		
		// 응답문서 작성 버튼 - 그룹
		$("#create_group_response_btn").off().on("click", function(){
			var $main = $("#collect_detail_main");
			var _folder = $main.data('folder');
			var _deadline = $main.data("deadline");

		/*	
		 * 체크하지 않게 처리 요청 - 황수진 (2022.11.21)
		 * if (_deadline){
				mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
				return false;
			}*/			
			gCol.createCollectResponse(_folder, 'D');
		});
		
		// 응답문서 수정 버튼
		$("#edit_response_btn, #edit_group_response_btn").off().on("click", function(){
			var btn_id = $(this).attr('id');
			var $main = $("#collect_detail_main");
			var _deadline = $main.data("deadline");
			
		/*	
		 * 체크하지 않게 처리 요청 - 황수진 (2022.11.21)
		 * if (_deadline){
				mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
				return false;
			}*/
			
			var response_id = $(this).closest('tr').attr('id').replace('tr_', '');
			var $el = $('#' + response_id);	//$response.find('.download-file');
			
			var _main_content = $main.data('content');
			var _main_finfo = $main.data('finfo');
			var _fserver = $main.data('fserver');
			var _folder = $main.data('folder');
			var _cyear = _folder.substr(0,4);
			var _res_content = $el.data('content');
			var _res_finfo = $el.data('finfo');
			var _res_id = $el.attr('id');
			
			var _html = '';
			_html += '<div id="collect_edit_layer" class="layer_wrap gathering_write_pop center" style="width: 440px;">';
			_html += '	<div class="layer_inner">';
			_html += '		<div class="pop_btn_close"></div>';
			_html += '		<h4>' + gap.lang.collection_modify + '</h4>';
			_html += '		<span class="g_w_pop_txt">' + _main_content;
			_html += '		</span>';
			_html += '		<textarea id="collect_response_express" name="" placeholder="' + gap.lang.input_content + '"></textarea>';
			_html += '		<div class="g_write_pop_bot">';
			_html += '			<h5>' + gap.lang.attachment + '</h5>';
			_html += '			<button class="g_w_pop_file_btn">' + gap.lang.addFile + '</button>';
			_html += '		</div>';
			_html += '		<div class="g_w_pop_file_box" id="response_collect_file_list">';
			_html += '		</div>';
			if (_main_finfo != ""){
				_html += '		<div class="g_w_pop_file_info">';
				_html += '			<h5>' + gap.lang.download_template_file + '</h5>'; 
				_html += '		</div>';	
			}
			_html += '		<div class="g_w_pop_btn_box">';
			_html += '			<div class="g_w_pop_btn s_w_submit">' + gap.lang.basic_modify + '</div>';
			_html += '		</div>';
			_html += '	</div>';
			_html += '</div>';
			
			gCol.setCollectLayer("#container_detail .contents.scroll", _html);
			
			var $layer = $('#collect_edit_layer');
			
			// DropZone 설정
			gCol.responseUploadInit('collect_edit_layer')
			
			// 콘첸츠 내용 세팅
			$layer.find('#collect_response_express').val(_res_content);
			
			// 취합파일 세팅
			gCol.addSavedFileList(false, _res_finfo, _res_id, "response_collect_file_list");
			
			// 템플릿 파일 세팅
			if (typeof(_main_finfo) != "undefined"){
				for (var i = 0; i < _main_finfo.length; i++){
					var _main_file = _main_finfo[i];
					var _file_html = "";
					
					_file_html += '<div><a href="#" class="download-file" data-md5="' + _main_file.md5 + '">' + _main_file.filename + '</a></div>';
					$layer.find('.g_w_pop_file_info').append(_file_html);
				}				
			}
			
			// 템플릿 파일 다운로드
			$layer.find('.download-file').off().on('click', function(){
				var _fserver = $("#collect_detail_main").data("fserver");
				var _folder = $("#collect_detail_main").data("folder");
				var _md5 = $(this).data("md5");

				gCol.downloadFile(_fserver, '1', _folder, _md5, 'main');
			});
			
			// 파일 추가
			$layer.find('.g_w_pop_file_btn').on('click', function(){
//				$("#response_collect_add_file").click();
				myDropzone_response.hiddenFileInput.click();	//2023.07.04 클릭 이벤트 remove 방지.
				return false;
			});
			
			// 닫기
			$layer.find('.pop_btn_close').on('click', function(){
				$layer.remove();
				gCol.hideCollectBlock();
				return false;
			});
			
			// 수정 버튼
			$layer.find('.s_w_submit').on('click', function(){
				var $content = $layer.find('#collect_response_express');
				if ($content.val() ==  "" && myDropzone_response.files.length == 0){
					mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
					return false;
				}
				
				var finfo_list = [];
				$(".file_remove_btn").each(function(idx, obj){
					var finfo = $(obj).data("finfo");
					if (finfo){
						finfo_list.push(finfo);
					}
				});
				$layer.data('finfo', finfo_list);
				
				if (myDropzone_response.files.length > 0){
					myDropzone_response.folder = _folder;
					myDropzone_response.cyear = _cyear;
					myDropzone_response.res_id = _res_id;
					myDropzone_response.content = $("#collect_response_express").val();
					myDropzone_response.processQueue();
					return false;
					
				}else{
					var surl = gap.channelserver + "/update_collection_response.km";
					var postData = {
							"id" : _res_id,
							"writer" : gap.userinfo.rinfo,
							"content" : $("#collect_response_express").val()
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
								// 닫기
								$layer.find('.pop_btn_close').click();

								// 상세보기 다시 그림
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
											gCol.drawCollectDetailView(res);

										}else{
											gap.gAlert(gap.lang.errormsg);
											return false;
										}
									},
									error : function(e){
										gap.gAlert(gap.lang.errormsg);
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
				}
			});
			
		});
		
		// 취합담당자 수정 버튼
		$("#main_edit_btn").off().on("click", function(){
			gap.showConfirm({
				title: gap.lang.Confirm,
			//	iconClass: 'remove',
				contents: gap.lang.confirm_edit_collection,
				callback: function(){
					$('#container_detail').fadeOut();
					$('#container_edit').fadeIn();
				
					var _main = gCol.drawCollectMainEdit();
					$('#container_edit').html(_main);
				
					var _header = gCol.drawCollectHeader(true);
					$('#main_header_edit').html(_header);
				
					$('.complete_btn').parent().addClass('act');
				
					// 데이터 처리
					gCol.setCollectHeaderEdit();
				
					// 이벤트 처리
					gCol.eventCollectMainEdit();
				
					var $el = $("#container_edit");
					var $el_info = $el.find('.step.n1');
					
					$el_info.click();
					$('#gathering_type').find('.pop_btn_close').click();
					$el_info.addClass("on");		
				}
			});
		});
		
		// 취합담당자 삭제 버튼
		$("#main_delete_btn").off().on("click", function(){
			gap.showConfirm({
				title: gap.lang.Confirm,
				iconClass: 'remove',
				contents: gap.lang.confirm_delete,
				callback: function(){
					var _folder = $("#collect_detail_main").data("folder");
					var _colid = $("#collect_detail_main").data("colid");
				
					gCol.deleteCollectMain(_colid, _folder);
					$("#before_btn").click();
				}
			});
		});
		
		// Q&A 버튼
		$("#detail_qna_btn").off().on("click", function(){
			gCol.qnaCollectionInit();	
		});
		
		// 업무 시작
		$("#quick_start").on("click", function(){
			var ids = [];
			$(gCol.collect_submitter_list).each(function(idx, val) {
				if (val.ky != gCol.collect_owner.ky){
					ids.push(val.ky);
				}
			});
			ids.push(gCol.collect_owner.ky);
			gHome.quickWorkStart(ids);
		});
		
		// 다운로드
		$("#download_btn").on("click", function(){
			gCol.downloadZipFile('one');
		});
		
		// 전체 다운로드
		$("#all_download_btn").on("click", function(){
			gCol.downloadZipFile('all');
		});
		
		// 독촉
		$("#alarm_btn").on("click", function(){
			gCol.alarmCollection('one');
		});
		
		// 전체 독촉
		$("#all_alarm_btn").on("click", function(){
			gCol.alarmCollection('all');
		});
		
		//참조인 정보 조회
		$("#disp_referrer").off().on("click", function(){
			var _cnt = $("#collect_detail_main").data("referrer_cnt");
			if (_cnt == 0){
				return false;
			}
			
			var html = "";
			var list = gCol.collect_referrer_list;
			
			html += "<div id='work-chat-popup' style='max-height:300px; overflow-y:auto; padding: 0 15px 10px 15px'>";
			html += "<div class='like-cont' style=''>";
			for (var i = 0 ; i < list.length; i++){
				var item = list[i];
				var user_info = gap.user_check(item);
				var owner_img = gap.person_profile_photo(item);
				html += "<div class='like-who'>";
				html += "	<div class='user' style='width:30px; height:30px; border-radius:50%;'>";
				html += "		" + owner_img + "";
			//	html += "		<span class='status online'></span>";
				html += "	</div>";
				html += "<div class='who-name' style='padding-left:5px'>" + user_info.name + " " +  user_info.jt + " <span>" + user_info.dept + "</span></div>";
				html += "</div>";
								
			}
			html += "</div>";
			html += "</div>"
			
	
			$("#disp_referrer").qtip({
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
					tip : true
				},
				position : {
					my : 'top center',
					at : 'bottom right',
					//target : $(this)
					adjust: {
						x: 0,
						y: 10
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
		
		// 원본문서 - 파일 다운로드
		$("#collect_detail_main .download-file").off().on("click", function(){
			var _info = $("#collect_detail_main").data("info");
			var _fserver = $("#collect_detail_main").data("fserver");
			var _folder = $("#collect_detail_main").data("folder");
			var _finfo = $("#collect_detail_main").data("finfo");
			var _md5 = $(this).data("md5");
			var _fcount = $(this).data("fcount");
			var _owner_ky = _info.owner.ky;

		/*	if (parseInt(_fcount) == 1){
				gCol.downloadFile(_fserver, '1', _folder, _md5, 'main');

			}else{
				gCol.downloadFileListInit(_fserver, _folder, _finfo, _owner_ky, 'main');
			}*/

			if ($('.gathering_right_pop').length > 0){
				if ($('#file_list').length > 0){
					$('#file_list').remove();
				}
			}
			gCol.downloadFileListInit(_fserver, _folder, _finfo, _owner_ky, 'main', '');
		});
		
		// 응답문서 - 파일 다운로드
		$("#collect_detail_response .download-file").off().on("click", function(){
			var _fserver = $("#collect_detail_main").data("fserver");
			var _folder = $("#collect_detail_main").data("folder");
			var _finfo = $(this).data("finfo");
			var _md5 = $(this).data("md5");
			var _fcount = $(this).data("fcount");
			var _owner_ky = $(this).data("owner").ky;
			var _res_id = $(this).attr("id");
			
		/*	if (parseInt(_fcount) == 1){
				gCol.downloadFile(_fserver, '2', _folder, _md5, 'response');
				
			}else{
				gCol.downloadFileListInit(_fserver, _folder, $(this).data("finfo"), _owner_ky, 'response');
			}*/
			
			if ($('.gathering_right_pop').length > 0){
				if ($('#file_list').length > 0){
					$('#file_list').remove();
				}
			}
			gCol.downloadFileListInit(_fserver, _folder, _finfo, _owner_ky, 'response', _res_id) ;
		});	

		// 취합 내용 더보기
		$("#info_ico").off().on("click", function(){
			var _content = $("#collect_detail_main").data("content");
			var _html = '<div style="padding:5px 10px;">' + _content + '</div>';

			$("#info_ico").qtip({
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
					//event : 'mouseout',
					fixed : true
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : true
				},
				position : {
					my : 'top left',
					at : 'bottom right',
					//target : $(this)
					adjust: {
						x: 0,
						y: 0
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

	},
	
	"drawCollectMainEdit" : function(){
		var _info = $("#collect_detail_main").data("info");
		var _title = _info.name;
		var _content = _info.content;
		var _html = "";
		
		_html += '<div class="contents scroll">';
		_html += '	<div class="before_box">';
		_html += '		<a href="#" id="edit_before_btn" class="before_btn fw800"><span class="before_btn_icon"></span>' + gap.lang.back + '</a>';
		_html += '	</div>';
		_html += '	<section class="section gathering_detail_sec">';
		_html += '		<div class="gathering_detail_top">';
		_html += '			<div class="g_detail_tit g_have_f_between_tit">';
		_html += '				<h2>' + _title + '</h2>';
		_html += '				<span class="fw800">' + _content + '</span>';
		_html += '			</div>';
		_html += '		</div>';
		_html += '		<div id="main_header_edit" class="f_between">';
		_html += '		</div>';
		_html += '	</section> <!-- //top_wr -->';
		_html += '</div> <!-- //contents -->';
		
		return _html;
	},
	
	"setCollectHeaderEdit" : function(){
		var $el = $("#container_edit");
		var _info = $("#collect_detail_main").data("info");
		var _title = _info.name;
		var _content = _info.content;
		var _finfo = _info.file_info.files;
		var _id = _info._id.$oid;
		
		if (typeof(_info.temp) != "undefined" && _info.temp == "T"){
			gCol.temp_collection = true;
			
		}else{
			gCol.temp_collection = false;
		}
		
		// 1단계 설정
		var $el_info = $el.find('.step.n1');
		$el_info.find('.cont').html(_title);
		$el_info.data('title', _title);
		$el_info.data('content', _content);
		$el_info.data('finfo', _finfo);
		$el_info.data('id', _id);
		
		// 2단계 설정
		var $el_sendto = $el.find('.step.n2');
		var _s_list = _info.submitter;
		var _r_list = _info.referrer;
		
		var s_txt = "";
		var r_txt = "";
		var s_users = [];
		var r_users = [];

		if (_s_list.length > 0){
			var s_info = gap.user_check(_s_list[0]);
			s_txt = (_s_list.length == 1 ? s_info.name : gap.lang.name_and_other_person.replace(/\%1/g, s_info.name).replace(/\%2/g, (_s_list.length - 1)));
			
			for (var i = 0; i < _s_list.length; i++){
				s_users.push( _s_list[i] );
			}
		}
		if (_r_list.length > 0){
			var r_info = gap.user_check(_r_list[0]);
			r_txt = (_r_list.length == 1 ? r_info.name : gap.lang.name_and_other_person.replace(/\%1/g, r_info.name).replace(/\%2/g, (_r_list.length - 1)));
			
			for (var j = 0; j < _r_list.length; j++){
				r_users.push( _r_list[j] );
			}
		}
		var txt = s_txt + "<br>" + r_txt;
		
		$el_sendto.find('.cont').html(txt);
		$el_sendto.data('sinfo', s_txt).addClass('on');
		$el_sendto.data('rinfo', r_txt);
		$el_sendto.data('suser', s_users);
		$el_sendto.data('ruser', r_users);
		
		// 3단계 설정
		var $el_duedate = $el.find('.step.n3');
		var start_date = moment(_info.GMT, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]');
		var date_txt = moment(_info.end_date).format('YYYY-MM-DD') + '(' + moment(_info.end_date).format('ddd') + ')';
		var time_txt = _info.due_time;
		var txt = date_txt + "<br>" + time_txt;
		$el_duedate.find('.cont').html(txt);
/*		$el_duedate.data('duedate', moment(_info.due_date).format('YYYY-MM-DD'));
		$el_duedate.data('sdate', moment.utc(start_date).local().format('YYYY-MM-DD'));
		$el_duedate.data('edate', moment(_info.end_date).format('YYYY-MM-DD'));*/
		$el_duedate.data('duedate', _info.due_date);
		$el_duedate.data('sdate', start_date);
		$el_duedate.data('edate', _info.end_date);
		$el_duedate.data('duetime', time_txt).addClass('on');

		if (!gCol.temp_collection){
			$el_duedate.css('cursor', 'default');
		}

		// 4단계 설정
		var $el_reqtype = $el.find('.step.n4');
		var txt = (_info.req_kind == "email" ? gap.lang.email : gap.lang.message)
		$el_reqtype.find('.cont').html(txt);
		$el_reqtype.data('reqtype', _info.req_kind).addClass('on')	;
		$el_reqtype.data('reqbody', _info.req_content);
		if (!gCol.temp_collection){
			$el_reqtype.css('cursor', 'default');
		}
		
	},
	
	"eventCollectMainEdit" : function(){
		var $el = $("#container_edit");
		var _info = $("#collect_detail_main").data("info");
		
		if (typeof(_info.temp) != "undefined" && _info.temp == "T"){
			gCol.temp_collection = true;
			
		}else{
			gCol.temp_collection = false;
		}
		
		// 이전 버튼 - 취합당당자 수정 화면
		$("#edit_before_btn").off().on("click", function(){
			$('#container_edit').fadeOut();
			$('#container_edit').empty();
			$('#container_detail').fadeIn();
		});
		
		// 1단계 내용 입력
		$el.find('.step.n1').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			gCol.showInfoLayer(this, true);
		});
        
		// 2단계 내용 입력
		$el.find('.step.n2').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			gCol.showSendToLayer(this, true);
		});
		
		if (gCol.temp_collection){
			// 3단계 내용 입력
			$el.find('.step.n3').on('click', function(){
				if ( $(this).hasClass('popup') ) return false;
				gCol.showDueDateLayer(this, true);
			});
			
			// 4단계 내용 입력
			$el.find('.step.n4').on('click', function(){
				if ( $(this).hasClass('popup') ) return false;
				gCol.showReqTypeLayer(this, true);
				
				$('#gathering_type').find('.type_list_wr').removeClass('type_list_wr');
			});
		}
		// 수정버튼 클릭
		$("#collect_edit_btn").off().on("click", function(){
			if (gCol.temp_collection){
				// 임시저장에서 다시 임시저장하거나 취합요청을 하는 경우
				
			//	var _date_txt = $('#collect_duedate_edit').data('duedate') + '(' + moment($('#collect_duedate_edit').data('edate')).format('ddd') + ')';
				var _date_txt = moment($('#collect_duedate_edit').data('duedate')).utc().local().format('YYYY-MM-DD') + '(' + moment($('#collect_duedate_edit').data('edate')).format('ddd') + ')';
				var _time_txt = $('#collect_duedate_edit').data('duetime');
				var _req_method = ($('#collect_request_edit').data('reqtype') == 'email' ? gap.lang.email : gap.lang.message)
				var _content = '';
				_content += gap.lang.confirm_request_collection + '<br /><br />';
				_content += gap.lang.collect_body + '  :  ' + $('#collect_info_edit').data('title') + '<br />';
				_content += gap.lang.collect_submitter + '  :  ' + $('#collect_sendto_edit').data('sinfo') + '<br />';
				_content += gap.lang.collection_deadline + '  :  ' + _date_txt + ' ' + _time_txt + '<br />';
				_content += gap.lang.collection_req_method + '  :  ' + _req_method + '<br />';
				
				gCol.showSaveConfirm({
					title: gap.lang.Confirm,
				//	iconClass: 'remove',
					contents: _content,
					onClose: function(){
						myDropzone_collect.main_id = $('#collect_info_edit').data('id');
						myDropzone_collect.is_edit = true;
						gCol.temp_collection = true;
						if (myDropzone_collect.files.length == 0){
							gCol.collect_main_save(false);
						
						}else{
							myDropzone_collect.processQueue();	
						}
					},
					callback: function(){
						myDropzone_collect.main_id = $('#collect_info_edit').data('id');
						myDropzone_collect.is_edit = true;
						gCol.temp_collection = false;
						if (myDropzone_collect.files.length == 0){
							gCol.collect_main_save(false);
							
						}else{
							myDropzone_collect.processQueue();	
						}
					}
				});
				
			}else{
				// 취합요청된 내역을 수정하고 저장하는 경우
				gap.showConfirm({
					title: gap.lang.Confirm,
				//	iconClass: 'remove',
					contents: gap.lang.confirm_edit_collection,
					callback: function(){
						myDropzone_collect.main_id = $el.find('.step.n1').data('id');
						myDropzone_collect.is_edit = true;
						myDropzone_collect.orikey = _info.key;
						
						if (myDropzone_collect.files.length == 0){
							gCol.collect_main_save(false);
							
						}else{
							myDropzone_collect.processQueue();		
						}
					}
				});				
			}
		});
	},
	
	"downloadFileListInit" : function(_fserver, _folder, _finfo, _owner_ky, _doc_kind, _res_id){
		var _file_main = gCol.drawFileCollectionMain();
		$('#container_detail .contents.scroll').prepend(_file_main);
		
		// 파일리스트 가져오기
		gCol.drawFileCollectionList(_fserver, _folder, _finfo, _owner_ky, _doc_kind, _res_id);
		
		// 이벤트 처리
		gCol.eventFileCollection();
	},
	
	"drawFileCollectionMain" : function(){
		var html = '';
		
		html += '<div id="file_list" class="gathering_right_pop r_wr">';
		html += '	<div class="qna_tit_box">';
		html += '		<div class="pop_btn_close"></div>';
		html += '		<h4>' + gap.lang.file + '(<span id="file_total_count"></span>)</h4>';
		html += '	</div>';
		html += '	<div class="g_r_file_wr">';
		html += '		<ul class="mu_file_list">';
		html += '		</ul>';
		html += '	</div>';
		html += '</div>';
		
		return html;		
	},
	
	"drawFileCollectionList" : function(_file_server, _file_folder, _file_info, _owner_ky, _doc_kind, _res_id){
		var $layer = $('#file_list');
		$layer.find(".mu_file_list").empty();
		$layer.find("#file_total_count").html(_file_info.length);
		
		for (var i = 0; i < _file_info.length; i++){
			var html = '';
			var _info = _file_info[i];
			var _fname = _info.filename;
			var _fid = _info.md5.replace(".", "_");
			
			html += '<li class="file_count f_between">';
			html += '	<span class="file_c_name">' + _fname + '</span>';
			html += '  	<div class="btn_wr" id="finfo_' +  _fid + '">';
			html += '		<button class="g_right_pop_btn g_r_search_btn" title="' + gap.lang.preview + '"></button>';
			html += '		<button class="g_right_pop_btn g_r_download_btn" title="' + gap.lang.download + '"></button>';
			html += '	</div>';
			html += '</li>';
			
			$layer.find(".mu_file_list").append(html);
			$layer.find('#finfo_' + _fid).data('fserver', _file_server);
			$layer.find('#finfo_' + _fid).data('folder', _file_folder);
			$layer.find('#finfo_' + _fid).data('finfo', _info);
			$layer.find('#finfo_' + _fid).data('ownerky', _owner_ky);
			$layer.find('#finfo_' + _fid).data('dkind', _doc_kind);
			$layer.find('#finfo_' + _fid).data('resid', _res_id);
		}
	},
	
	"eventFileCollection" : function(){
		var $layer = $('#file_list');
				
		// 미리보기
		$layer.find('.g_r_search_btn').on('click', function(){
			var _fserver = $(this).parent().data('fserver');
			var _folder = $(this).parent().data('folder');
			var _finfo = $(this).parent().data('finfo');
			var _dkind = $(this).parent().data('dkind');	// main or response
			var _fname = $(this).parent().data('ownerky') + '_' + gap.textToHtml(_finfo.filename);
			var _md5  = _finfo.md5;
			
			gBody3.file_convert(_fserver, _fname, _md5, _dkind, 'collect', '', '', _folder);
		});
		
		// 다운로드
		$layer.find('.g_r_download_btn').on('click', function(){
			var _fserver = $(this).parent().data('fserver');
			var _folder = $(this).parent().data('folder');
			var _finfo = $(this).parent().data('finfo');
			var _dkind = $(this).parent().data('dkind');
			var _resid = $(this).parent().data('resid');
			var _md5 = _finfo.md5;
			
			gCol.downloadFile(_fserver, (_dkind == 'main' ? '1' : '2'), (_dkind == 'main' ? _folder : _resid), _md5, _dkind);
		});
		
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$layer.remove();
			return false;
		});
	},
	
	"makeCollectResponse" : function(){
		
	},
	
	"downloadFile" : function(_fserver, _type, _key, _md5, _dkind){
		var downloadurl = _fserver + "/FDownload_collection_one.do?key=" + _key + "&type=" + _type + "&md5=" + _md5;
		
		var link = document.createElement("a");
		$(link).click(function(e) {
			e.preventDefault();
			window.location.href = downloadurl;
		});
		$(link).click();
	},
	
	"downloadZipFile" : function(type){
		var _fserver = $("#collect_detail_main").data("fserver");
		var _key = $("#collect_detail_main").data("folder");
		var _kys = "";
		
		if (type == "all"){
			_kys = type;
			
		}else{
			var file_check = [];

			$("input[name=response_chk]:checked").each(function() {
				file_check.push($(this).val());
			});
			
			if (file_check.length == 0){
				mobiscroll.toast({message:gap.lang.select_item_download, color:'danger'});
				return false;				
			}
			
			_kys = file_check.join("-spl-");
		}
		var filename = "download_" + moment(new Date()).format('YYYYMMDDhhmmss') + ".zip";
		var downloadurl = _fserver + "/FDownload_collection.do?key=" + _key + "&kys=" + _kys;
		gap.file_download_normal(downloadurl, filename);
		
	/*	var link = document.createElement("a");
		$(link).click(function(e) {
			e.preventDefault();
			window.location.href = downloadurl;
		});
		$(link).click();*/
	},
	
	"alarmCollection" : function(type){
		var _fserver = $("#collect_detail_main").data("fserver");
		var _key = $("#collect_detail_main").data("folder");
		var _kys = "";
		var alarm_check = [];
		var alarm_group_check = [];
		
		if (type == "all"){
			$(gCol.collect_submitter_list).each(function(idx, val) {
				if (typeof(val.dsize) != "undefined" && val.dsize == "group"){
					alarm_group_check.push(val.dpc);
					
				}else{
					var receiver_info = gap.user_check(val);
					alarm_check.push(receiver_info.ky);
				}
			});
			
		}else{
			$("input[name=response_chk]:checked").each(function() {
			//	var receiver_info = $(this).val();
			//	alarm_check.push(receiver_info.split("-spl-")[0]);
						
				var val = $(this).data('owner');
				
				if (typeof(val.dsize) != "undefined" && val.dsize == "group"){
					alarm_group_check.push(val.dpc);
					
				}else{
					var receiver_info = gap.user_check(val);
					alarm_check.push(receiver_info.ky);
				}
			});
			
			if (alarm_check.length == 0 && alarm_group_check.length == 0){
				mobiscroll.toast({message:gap.lang.select_item_remind, color:'danger'});
				return false;	
			}
		}
		
		gCol.sendReqMail(alarm_check, alarm_group_check, true);
	},
	
	"editCollectMain" : function(_id){
		var $title = $("#" + _id).data("title");
		var $content = $("#" + _id).data("content");
	//	var $el_info = $("#collect_info");
		var $el_info = $('.step.n1');
		
		$el_info.find('.cont').html($title);
	//	$el_info.data('title', $title).addClass('on');
		$el_info.data('title', $title);
		$el_info.data('content', $content);
		
		$el_info.click();
		$el_info.addClass('on');
		
		var $s_list = $("#" + _id).data("submitter");
		var $r_list = $("#" + _id).data("referrer");
	//	var $el_sendto = $("#collect_sendto");
		var $el_sendto = $('.step.n2');
		
		var s_txt = "";
		var r_txt = "";
		var s_users = [];
		var r_users = [];

		if ($s_list.length > 0){
			var s_info = gap.user_check($s_list[0]);
			s_txt = ($s_list.length == 1 ? s_info.name : gap.lang.name_and_other_person.replace(/\%1/g, s_info.name).replace(/\%2/g, ($s_list.length - 1)));
			
			for (var i = 0; i < $s_list.length; i++){
				s_users.push( $s_list[i] );
			}
		}
		if ($r_list.length > 0){
			var r_info = gap.user_check($r_list[0]);
			r_txt = ($r_list.length == 1 ? r_info.name : gap.lang.name_and_other_person.replace(/\%1/g, r_info.name).replace(/\%2/g, ($r_list.length - 1)));
			
			for (var j = 0; j < $r_list.length; j++){
				r_users.push( $r_list[j] );
			}
		}
		var txt = s_txt + "<br>" + r_txt;
		
		$el_sendto.find('.cont').html(txt);
		$el_sendto.data('sinfo', s_txt).addClass('on');
		$el_sendto.data('rinfo', r_txt);
		$el_sendto.data('suser', s_users);
		$el_sendto.data('ruser', r_users);
	},
	
	"deleteCollectMain" : function(_id, _folder){
		var submitter_ky_list = [];
		var submitter_group_list = [];
		
		// 일정 삭제를 위한 취합정보 가져오기
		var surl = gap.channelserver + "/api/collection/search_collection_item.km";
		var postData = {
				"key" : _folder
			};	

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//"json",
			async : false,
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},			
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					var _submitter = res.data.ori.submitter;
					
					$(_submitter).each(function(idx, val){
						var user_info = val;
						
						submitter_ky_list.push(user_info.ky);
						
						if (typeof(user_info.dsize) != "undefined" && user_info.dsize == "group"){
							submitter_group_list.push(user_info.dpc);
						}
					})
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
		
		// 취합 삭제
		var surl = gap.channelserver + "/delete_collection.km";
		var postData = {
				"id" : _id
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
					gCol.drawCollectList(1);
					
					// 기존 일정 삭제 //////////////////////////////////////////////////////////////////
					var req_data = new Object();
					req_data.key = _folder;
					req_data.owner = gap.userinfo.rinfo;
					gCol.updateSchedule('D', req_data, submitter_ky_list, submitter_group_list);
					/////////////////////////////////////////////////////////////////////////////
					
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
	
	"qnaCollectionInit" : function(){
		var _qna_main = gCol.drawQnaCollectionMain();
		$('#container_detail .contents.scroll').prepend(_qna_main);
		
		// Q&A 리스트 가져오기
		gCol.drawQnaCollectionList(1);
		
		// 이벤트 처리
		gCol.eventQnaCollection();
		
		// 채팅 모아보기 위치 조정
		gma.refreshPos();
	},
	
	"drawQnaCollectionMain" : function(){
		var html = '';
		
		html += '<div id="qna_list" class="gathering_right_pop r_wr g_r_qna">';
		html += '	<div class="qna_tit_box">';
		html += '		<div class="pop_btn_close"></div>';
		html += '		<h4>Q&A(<span id="qna_total_count"></span>)</h4>';
		html += '	</div>';
		html += '	<div id="qna_data_list" class="g_r_qna_txt_wr">';
		html += '	</div>';
		html += '	<div class="type_list_wr rel meet_mem" id="minchat">';
		html += '		<input type="text" id="input_qna" placeholder="' + gap.lang.input_content + '">';
		html += '		<div id="save_qna_btn" class="abs type_icon" title="' + gap.lang.basic_save + '"></div>';
		html += '	</div>';
		html += '</div>';
		
		return html;		
	},
	
	"drawQnaCollectionList" : function(page_no){
		var _folder = $("#collect_detail_main").data("folder");
		var $layer = $('#qna_list');
		
		if (page_no == 1){
			$layer.find('.g_r_qna_txt_wr').empty();
			
			gCol.qna_count = 0;
			gCol.qna_total_count = 0;
		}
		gCol.start_skp = (parseInt(gCol.per_page) * (parseInt(page_no))) - (parseInt(gCol.per_page) - 1);

		var surl = gap.channelserver + "/api/collection/search_collection_chat.km";
		var postData = {
				"start" : gCol.start_skp - 1,
				"perpage" : "1000",	//gCol.per_page,
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
					gCol.qna_count += res.data.data.length;
					gCol.qna_total_count = res.data.totalcount;
					
					$layer.find("#qna_total_count").html(gCol.qna_total_count);
					$("#qna_btn_total_count").html(gCol.qna_total_count);
					
					for (var i = 0; i < res.data.data.length; i++){
						var html = '';
						var _info = res.data.data[i];
						var _owner = gap.user_check(_info.owner);

						html += '<div class="g_r_qna_box">';
						html += '	<div class="qna_profile_box">';
						html += '		<div class="qna_profile user-thumb">';
						html += '			' + _owner.user_img;
					//	html += '			<span class="status online"></span>';							
						html += '		</div>';
						html += '	</div>';
						html += '	<div class="qna_txt_box">';
						html += '		<div class="qna_txt_top">';
						html += '			<span class="qna_name">' + _owner.name + '</span>';
						html += '			<span class="qna_time en">' + gCol.convertGMTLocalDateTime(_info.GMT) + '</span>';
						html += '		</div>';
						html += '		<div class="qna_txt_bot">';								
						html += '			<span class="qna_txt">' + _info.content;
						html += '			</span>';
						html += '		</div>';
						html += '	</div>';
						html += '</div>';
						
						$('#qna_data_list').append(html);
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
		if (gCol.qna_total_count > gCol.qna_count){
			is_continue = true;
		}
		if (is_continue){
			page_no++;
			gCol.drawQnaCollectionList(page_no);	
		}
	},
	
	"saveQnaContent" : function(){
		var $layer = $('#qna_list');
		var _folder = $("#collect_detail_main").data("folder");
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
					gCol.drawQnaCollectionList(1);

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
	
	"eventQnaCollection" : function(){
		var $layer = $('#qna_list');

		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$layer.remove();
			gma.refreshPos();
			return false;
		});
		
		// 텍스즈 저장
		$layer.find('#save_qna_btn').on('click', function(){
			gCol.saveQnaContent();
		});
		
		// 텍스트 입력 후 엔터
		$layer.find('#input_qna').keydown(function(evt){
			if (evt.keyCode == 13){
				gCol.saveQnaContent();
			}
		});	
	},
	
	"getPageCount" : function(doc_count, rows){
		return ret_page_count = Math.floor(gCol.total_data_count / rows) + (((gCol.total_data_count % rows) > 0) ? 1 : 0);
	},
	
	"initializePage" : function(){
		var alldocuments = gCol.total_data_count;
		if (alldocuments % gCol.per_page > 0 & alldocuments % gCol.per_page < gCol.per_page/2 ){
			gCol.all_page = Number(Math.round(alldocuments/gCol.per_page)) + 1
		}else{
			gCol.all_page = Number(Math.round(alldocuments/gCol.per_page))
		}	

		if (gCol.start_page % gCol.per_page > 0 & gCol.start_page % gCol.per_page < gCol.per_page/2 ){
			gCol.cur_page = Number(Math.round(gCol.start_page/gCol.per_page)) + 1
		}else{
			gCol.cur_page = Number(Math.round(gCol.start_page/gCol.per_page))
		}

		gCol.initializeNavigator();		
	},
	
	"initializeNavigator" : function(){
		var alldocuments = gCol.total_data_count;

		if (gCol.total_page_count == 0){
			gCol.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			gCol.total_page_count = 1;
			gCol.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (gCol.total_page_count % 10 > 0 & gCol.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gCol.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gCol.total_page_count / 10))	
			}

			if (gCol.cur_page % 10 > 0 & gCol.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gCol.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gCol.cur_page / 10))
			}

			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '<ul class="pagination inb">';
			}else{
				nav[0] = '<div class="arrow prev" onclick="gCol.gotoPage(' + ((((c_frame-1) * 10) - 1)*gCol.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"></div><ul class="pagination inb">';
			}			
			
			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == gCol.cur_page){
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
						nav[pIndex] = '<li onclick="gCol.gotoPage(' + (((i-1) * gCol.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gCol.gotoPage(' + (((i-1) * gCol.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gCol.gotoPage(' + (((i-1) * gCol.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == gCol.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '</ul><div class="arrow next" onclick="gCol.gotoPage(' + ((c_frame * gCol.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"></div>';
				
			}else{
				nav[nav.length] = '</ul>';
			}
			
		
			var nav_html = '';

			if (c_frame != 1 ){
				nav_html = '<li class="p-first" onclick="gCol.gotoPage(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
					

			if (c_frame < all_frame){
				nav_html += '<li class="p-last" onclick="gCol.gotoPage(' + ((gCol.all_page - 1) * gCol.per_page + 1) + ',' + gCol.all_page + ')"><span>마지막</span></li>';
			}
			$("#paging_area").html(nav_html);
		}		
	},
	
	"gotoPage" : function(idx, page_num){
		if (gCol.total_data_count < idx) {
			gCol.start_page = idx - 10;
			if ( gCol.start_page < 1 ) {
				return;
			}
		}else{
			gCol.start_page = idx;
		}
		cur_page = page_num;
		gCol.drawCollectList(page_num);
	},
	
	"showSaveConfirm" : function(opt){
		
		$('#layerDimHard').remove();
		/*
		 * opt parameter
		 * escClose : ESC 키로 닫기 가능 여부 (true, false)
		 * title : 제목
		 * contents : 내용 (html로 입력)
		 * callback : 확인 클릭 시 콜백 함수
		 * 
		 * opt 예시)
		 * {
		 * 	escClose: true,
		 * 	title: '알림',
		 * 	contents: '내용입니다',
		 * 	callback: function(){
		 * 		console.log('확인 누름');
		 * 	},
		 *  onClose: function(){
		 *  	console.log('닫힐 때');
		 *  }
		 * }
		 */
		var html =
			'<div id="common_confirm" class="layer_wrap" style="height:auto;">' + 
			'	<div class="layer_inner">' + 
			'		<div class="pop_btn_close"></div>' + 
			'		<h4>' + (opt.title || '') +'</h4>' + 
			'		<div class="layer_cont left">';
		
		if (opt.iconClass) {
			html +=
			'		<div class="pop_icon">' + 
			'			<div class="ico-img ' + opt.iconClass + '"></div>' + 
			'		</div>';
		}

			html +=
			'		<div class="pop_alert">' + 
			'			<p>' + (opt.contents || '') + '</p>' + 
			'		</div>' + 
			'		</div>' + 
			'		<div class="btn_wr">' + 
			'			<button class="btn_layer cancel">' + gap.lang.temps + '</button>' + 
			'			<button class="btn_layer confirm">' + gap.lang.request_collection + '</button>' + 
			'		</div>' + 
			'	</div>' + 
			'</div>';
		
		var z_idx = gap.maxZindex() + 1;
		var $layer = $('<div id="layerDimHard"></div>');
		$layer.append(html).css('z-index', z_idx);
		
		// 닫기 
		$layer.find('.pop_btn_close').on('click', function(){
			gap.hideConfirm();
		//	if (typeof(opt.onClose) == 'function') opt.onClose();
		});
		
		// 취소
		$layer.find('.cancel').on('click', function(){
			gap.hideConfirm();
			if (typeof(opt.onClose) == 'function') opt.onClose();
		});
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			if (typeof(opt.callback) == 'function') opt.callback();
			$layer.find('.pop_btn_close').click();
		});
		
		if (opt.escClose != false) {
			$(document).on('keydown.confirmesc', function(e){
				// ESC
				if (e.keyCode == 27) {
					gap.hideConfirm();
				//	if (typeof(opt.onClose) == 'function') opt.onClose();
				}
			})
		}
		
		$('body').append($layer);
	},
	
	"updateSchedule" : function(opt, post_data, ky_list, group_list){
		var _suffix = ((typeof(myDropzone_collect.is_edit) != "undefined" && myDropzone_collect.is_edit) ? "_edit" : "");
		var _attendee = "";
		
		if (group_list.length > 0){
			var surl = gap.channelserver + "/search_group_members.km";
			var postData = {
					"list" : group_list.join(",")
				};
			
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				async : false,
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var users = res.data2;
						
						if (ky_list.length > 0){
							_attendee += ky_list.join(",") + ",";
						}
						_attendee += users;
						post_data.attendee = _attendee;

						if (opt == 'C' || opt == 'U'){
							if (typeof(post_data.startdate) == "undefined"){
								post_data.startdate = $("#collect_duedate" + _suffix).data("sdate");	
							}
							if (typeof(post_data.enddate) == "undefined"){
								post_data.enddate = $("#collect_duedate" + _suffix).data("edate");
							}
						}

						gap.schedule_update_collection(post_data, opt);
						
						if (opt == 'C' || opt == 'U'){
							// DropZone 및 헤더 초기화
							gCol.clearDropzone();								
						}
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
			
		}else{
			post_data.attendee = ky_list.join(",");
			
			if (opt == 'C' || opt == 'U'){
				if (typeof(post_data.startdate) == "undefined"){
					post_data.startdate = $("#collect_duedate" + _suffix).data("sdate");		
				}
				if (typeof(post_data.enddate) == "undefined"){
					post_data.enddate = $("#collect_duedate" + _suffix).data("edate");	
				}
			}

			gap.schedule_update_collection(post_data, opt);
			
			if (opt == 'C' || opt == 'U'){
				// DropZone 및 헤더 초기화
				gCol.clearDropzone();				
			}
		}
	},
	
	
	"sendReqMail" : function(ky_list, group_list, is_remind){
		return; // 임시로 사용하지 않음 2024.06.17
		var _sender = gap.user_check(gap.userinfo.rinfo);
		var _title = "";
		var _req_msg = "";
		var _sinfo = "";
		var _date_txt = "";
		var _time_txt = "";
		var _mail_type = "";
		var _receiver = "";
		
		if (is_remind){
			// 리마인드 알림 메일 발송
			var _info = $('#collect_detail_main').data('info');
			_title = _info.name;
			_req_msg = '';
			_sinfo = '';
			_date_txt = moment(_info.due_date).format("YYYY-MM-DD") + '(' + moment(_info.end_date).format('ddd') + ')';
			_time_txt = _info.due_time;
			_mail_type = 'remindMailSend'
			
		}else{
			// 일반 메일 발송
			var _suffix = ((typeof(myDropzone_collect.is_edit) != "undefined" && myDropzone_collect.is_edit) ? "_edit" : "");
			_title = $('#collect_info' + _suffix).data('title');
			_req_msg = $('#collect_request' + _suffix).data('reqbody');
			_sinfo = $('#collect_sendto' + _suffix).data('sinfo');
			_date_txt = $('#collect_duedate' + _suffix).data('duedate') + '(' + moment($('#collect_duedate' + _suffix).data('edate')).format('ddd') + ')';
			_time_txt = $('#collect_duedate' + _suffix).data('duetime');
			_mail_type = 'mailSend';
		}
		
		if (group_list.length > 0){
			var surl = gap.channelserver + "/search_group_members.km";
			var postData = {
					"list" : group_list.join(",")
				};
			
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				async : false,
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var users = res.data2;
						
						if (ky_list.length > 0){
							_receiver += ky_list.join("-spl-") + "-spl-";
						}
						_receiver += users.split(",").join("-spl-");
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
			
		}else{
			_receiver = ky_list.join("-spl-");
		}
		
		var surl = cdbpath + "/sendCollectionMail?OpenForm";
		var postData = {
				"__Click":"0",
				"%%PostCharset":"UTF-8",
				"SaveOptions":"0",
				"Type":_mail_type,
				"Options":'',
				"Title":_title,
				"ReqMsg": _req_msg,
				"SInfo":_sinfo,
				"DeadLine":_date_txt + ' ' + _time_txt,
				"Sender":_sender.name + ' <' + _sender.email + '>',
				"Receiver":_receiver
			};	

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(__res){
				var res = __res;	//JSON.parse(__res);
				if (res.success){
					if (_mail_type == 'remindMailSend'){
						mobiscroll.toast({message:gap.lang.reminder_noti_has_been_sent, color:'success'});
						return false;
					}

				}else{
					// do nothing...
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
	},
	
	"sendReqMsg" : function(_submitter){
	//	var _suffix = (myDropzone_collect.is_edit ? "_edit" : "");
	//	var _submitter = $('#collect_sendto' + _suffix).data('suser');
		var _suffix = ((typeof(myDropzone_collect.is_edit) != "undefined" && myDropzone_collect.is_edit) ? "_edit" : "");
		var _body = $('#collect_request' + _suffix).data('reqbody');
		var alarm_check = [];
		var group_list = [];

		$(_submitter).each(function(idx, val) {
			var val = val;
			if (typeof(val.dsize) != "undefined" && val.dsize == "group"){
				group_list.push(val.dpc);
				
			}else{
				var receiver_info = gap.user_check(val);
				var receiver = new Object;
				
				receiver.emp = receiver_info.ky;
				receiver.name = receiver_info.name;
				alarm_check.push(receiver);
			}
		});
		
		var sender_info = gap.user_check(gap.userinfo.rinfo);
		var sender = new Object();
		sender.emp = sender_info.ky;
		sender.name = sender_info.name;

		// 개인 전송
		if (alarm_check.length > 0){
			gCol.sendNotiMsg(gap.lang.collection_request_regist, (_body == "" ? gap.lang.collection_request_regist : _body), sender, alarm_check);	
		}
		
		// 부서 처리
		if (group_list.length > 0){
			var surl = gap.channelserver + "/search_group_members.km";
			var postData = {
					"list" : group_list.join(",")
				};
			
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var users = res.data2.split(",");
						var r_list = [];
						
						$(users).each(function(idx, val) {
							var receiver = new Object;
							
							receiver.emp = val;
							receiver.name = "";
							r_list.push(receiver);
						});
						
						gCol.sendNotiMsg(gap.lang.collection_request_regist, (_body == "" ? gap.lang.collection_request_regist : _body), sender, r_list);	
					}
				},
				error : function(e){
				}
			});
		}
	},
	
	"sendNotiMsg" : function(_title, _body, _sender, _receiver){
		var surl = gap.getHostUrl() + "/noti/regist";
		var postData = {
				"nid" : "once",
				"vol" : 2,
				"title" : _title,
				"body" : _body,
				"fty" : [0],
				"s" : _sender,
				"r" : _receiver
			};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "success"){
					// do nothing...
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
		
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + '(' + moment.utc(_date).local().format('ddd') + ') ' + moment.utc(_date).local().format('HH:mm');
		return ret;
	}

}