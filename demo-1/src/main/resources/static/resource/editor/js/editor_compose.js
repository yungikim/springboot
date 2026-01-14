var is_opened = false;
var sdt;
var edt;
var days;
var edays;
function FormJS(info){
	this.instance_id = null;
	this.info = info;
	FormJS.init_instance(this);
	this.org_loader = null;
	this.doc = null;
	this.form = null;
	this.isEditorExpand = false;
	this.formSubmitFrame = "_formSubmitFrame";
	this._msgbox = new (__UI.ClassLoader("MESSAGEBOX"))(window, 0, '', "");
	this.body_zoom = 0;
	this.delete_attachment_log = [];
/*	if( this.info.read_type == "preview") {
		document.title = "공지사항 미리보기";
	}else{
		if(this.info.docOptions == "0") {
			document.title =(typeof(this.info.subject)!="undefined"&&this.info.subject!='' ? '[K-Portal] ' + this.info.subject :"공지사항")
		}else{
			document.title = "공지사항";
		}
	}*/
}
FormJS.instance_hash = {};
FormJS.instance_hash_count = 0;
FormJS.init_instance = function(obj){
	var id = "FormJS_INSTANCE_" + (FormJS.instance_hash_count++);
	FormJS.instance_hash[id] = obj;
	obj.instance_id = id;
};
FormJS.get = function(id){
	return FormJS.instance_hash[id];
};
FormJS.prototype = {
	/* 초기 설정 */
	"init":function(doc, form){
		this.doc = doc;
		this.form = form;
		resizeMid();
		if(this.info.isEdit){
			this.initEdit();
		}else{
			this.initRead();
		}
	}
	/* 편집시 초기화 */
	,"initEdit":function(){
		var _self = this;
		var _now = new Date();
		//임시 파일키 생성
		var dt = new Date();
		window.tmpFileKey = (""+dt.getFullYear()).slice(-2) +
			    ("00" + (dt.getMonth() + 1)).slice(-2) +
			    ("00" + dt.getDate()).slice(-2) +
			    ("00" + dt.getHours()).slice(-2) +
			    ("00" + dt.getMinutes()).slice(-2) +
			    ("00" + dt.getSeconds()).slice(-2) + "_" + EMPNO;
	}
	, "eventNumOnly":function(){
		//숫자만 입력가능하도록 처리
		$(".numonly").css('imeMode','disabled').keypress(function(e) {
			if(e.which && (e.which < 48 || e.which > 57) ) {
				e.preventDefault();
			}
		}).keyup(function(){
			if( $(this).val() != null && $(this).val() != '' ) {
				var _thisval = $(this).val().replace(/[^0-9]/g, '');
				var addcom = $(this).attr("insertcom");
				if (addcom != 1)	{
					$(this).val( _thisval );
					return;
				}
				_thisval = _thisval.toCurrency();
				 $(this).val( _thisval );
			}
		}).blur(function(){
			//onblur시 크롬에서 마지막에 입력한 한글 1byte가 남아서 처리
			var num = $(this).val().replace(/,/gi, ""); 
			if (isNaN(num)) {
				num = num.substring(0, num.length-1);
				$(this).val(num.toCurrency()); 
			}
		});
	}
     /* Block */
	,"blockBGopen":function(){
		//var id = '#orgModal';
		var maskHeight = $(document).height();
		var maskWidth = $(window).width();
		$('#mask, #mask iframe').css({
			'width': maskWidth,
			'height': maskHeight
		});
		$('#mask').fadeIn(500);
		$('#mask').fadeTo("fast");
		var winH = $(window).height();
		var winW = $(window).width();
		if (opentype != 'popup') {
			//좌측 영역 레이어처리
			$('#mask_left', parent.document).css({
				'width': $('#mask_left', parent.document).next().width() + 1,
				'height':$('#mask_left', parent.document).next().height()
			});
			$('#mask_left', parent.document).fadeIn(500);	
			$('#mask_left', parent.document).fadeTo("fast");
			//상단영역 레이어처리
			$('#mask_top', parent.document).css({
				'width': $('#mask_top', parent.document).next().width(),
				'height':$('#mask_top', parent.document).next().height()+2, 
				'left':$('#mask_top', parent.document).next().css('left')
			});
			$('#mask_top', parent.document).fadeIn(500);	
			$('#mask_top', parent.document).fadeTo("fast");
		}
		//조직도창
		//$(id).css('top', winH / 2 - $(id).height() / 2);
		//$(id).css('left', winW / 2 - $(id).width() / 2);
		//$(id).fadeIn(500);
	}
	/* Block Close*/
	,"blockBGclose":function(){
		$('#mask').fadeOut(200);
		$('.modalpop').fadeOut(200);
	
		if (opentype != 'popup'){
			$('#mask_left', parent.document).fadeOut(200);
			$('#mask_top', parent.document).fadeOut(200);
		}
	}
	/* 빈시간대 찾기 close*/
	,"closeEmptytimePopup":function(){
		$('#emptytime_popup').empty().removeAttr("style").hide();
		_form.blockBGclose();
	}
	/* 읽기 초기화 */
	,"initRead":function(){
		if(!(this.info.isPreview)){
			__dom.add_event_listener(this.doc, "click", Object.bind_event_listener(window, this, this.event_doc_click));
		}
		if (formName == "F10"){	//품의서만 호출
			BodyOpen();
		}else if (formName == "F15"){	//경조사
			if (_targetdate != ""){
				sdt = new Date(_targetdate);
				$("#targetDate").html(_targetdate + " (" + (_useLang=="kor"?days[sdt.getDay()]:edays[sdt.getDay()]) + ")");
			}
		}else if (formName == "F17"){	//프로젝트완료보고서
			if (_startdate != "" && _enddate != ""){
				sdt = new Date(_startdate);
				edt = new Date(_enddate);
				$("#fm_start_date").html(_startdate + " (" + (_useLang=="kor"?days[sdt.getDay()]:edays[sdt.getDay()]) + ")");
				$("#fm_end_date").html(_enddate + " (" + (_useLang=="kor"?days[edt.getDay()]:edays[edt.getDay()]) + ")");
			}
		}else if (formName == "F2"){	//제증명발급신청서
			if (_sdate1 != "" && _edate1 != ""){
				var sdt = new Date(_sdate1);
				var edt = new Date(_edate1);
				$("#fm_sdate1").html(_sdate1 + " (" + (_useLang=="kor"?days[sdt.getDay()]:edays[sdt.getDay()]) + ")");
				$("#fm_edate1").html(_edate1 + " (" + (_useLang=="kor"?days[edt.getDay()]:edays[edt.getDay()]) + ")");
			}
			if (_sdate2 != "" && _edate2 != ""){
				var sdt = new Date(_sdate2);
				var edt = new Date(_edate2);
				$("#fm_sdate2").html(_sdate2 + " (" + (_useLang=="kor"?days[sdt.getDay()]:edays[sdt.getDay()]) + ")");
				$("#fm_edate2").html(_edate2 + " (" + (_useLang=="kor"?days[edt.getDay()]:edays[edt.getDay()]) + ")");
			}
			if (_sdate3 != "" && _edate3 != ""){
				var sdt = new Date(_sdate3);
				var edt = new Date(_edate3);
				$("#fm_sdate1").html(_sdate1 + " (" + (_useLang=="kor"?days[sdt.getDay()]:edays[sdt.getDay()]) + ")");
				$("#fm_edate1").html(_edate1 + " (" + (_useLang=="kor"?days[edt.getDay()]:edays[edt.getDay()]) + ")");
			}
		}else if (formName == "F4"){	//교통비지급청구 및 영수증
			if (_startdate != "" && _enddate != ""){
				sdt = new Date(_startdate);
				edt = new Date(_enddate);
				$("#fm_start_date").html(_startdate + " (" + (_useLang=="kor"?days[sdt.getDay()]:edays[sdt.getDay()]) + ")");
				$("#fm_end_date").html(_enddate + " (" + (_useLang=="kor"?days[edt.getDay()]:edays[edt.getDay()]) + ")");
			}
		}
	}
	/* 문서 클릭 Event */
	,"event_doc_click":function(e){
		var elem = __dom.event.src_element(e);
		if(elem.getAttribute("event_cate") != "move") this.closeMoveDoc();
	}
	/* 인쇄미리보기용 수신인 정보 표시 */
	,"drawPrintModeRecipients":function(){
		/* 발신인 */
		var tmpfrom;
		var name = this.getFromInfo();
		if(name.isInternetAddress){
			tmpfrom = this.info.form.From.html_text();
		}else if(this._user_info.has_item(name.canonical2)){
			tmpfrom = this._user_info.get_display_name(name.canonical2).html_text();
		}else{
			tmpfrom = name.common;
		}
		if (tmpfrom.indexOf('CN=') > -1) {
			tmpfrom = name.origin.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '');
		}
		this.doc.getElementById("disFrom").innerHTML = tmpfrom;
		
		/* 수신인/참조인 */
		var rcp = null;
		if(this.info.isNoneDeliveryReport){
			rcp = ["IntendedRecipient", "SendTo", "CopyTo"];
		}else{
			rcp = ["SendTo", "CopyTo"];
		}
		var html, separator = "";
		for(var i = 0; i < rcp.length; i++){
			var items = this.info.form[rcp[i]];
			if(!items[0]){
				switch(rcp[i]){
					case "SendTo": tmpdl = "get--user"; break;
					case "CopyTo": tmpdl = "get--refer"; break;
				};
				$('#write_send_info .user-info .get-view .'+tmpdl).css('display','none');
				continue;
			}
			html = "";
			separator = "";
			for(var j = 0; j < items.length; j++){
				var json = this._user_info.get_json(items[j]);
				html += separator + this._user_info.get_display_name(items[j]).html_text();
				separator = ", ";
			}
			this.doc.getElementById("dis" + rcp[i] + "All").innerHTML = html;
			if (html != "") $('#write_send_info .user-info .get-view .' + (rcp[i] == "SendTo" ? "get--user" : "get--refer")).show();
		}
	}
	/* From Name 정보 */
	,"getFromInfo":function(){
		//표시순서 - 1:Principal, 2:InetFrom, 3:From	
		if(this.info.form.Principal){
			return new NotesName(this.info.form.Principal);	
		}else if(this.info.form.InetFrom){
			return new NotesName(this.info.form.InetFrom);
		}else{
			return new NotesName(this.info.form.From);
		}
	}
	/* From JSON 정보 */
	,"getFromJson":function(){
		var name = this.getFromInfo();
		return this._user_info.get_json(name.canonical2);
	}
	/* From 정보 표시 */
	,"getFromDisplayInfo":function(){
		var name = this.getFromInfo();
		if(name.isInternetAddress){
			return name.origin.html_text().replace(/"/g, "");
		}else if(this._user_info.has_item(name.canonical2)){
			return this._user_info.get_display_name(name.canonical2).html_text();
		}else{
			return name.common;
		}
	}
	,"getFromName":function(){
		var name = this.getFromInfo()
		, _val = ''
		if(name.isInternetAddress){
			var addr = name.origin.html_text().replace(/"/g, "").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			if (addr.indexOf('<') > -1) {
				_val = addr.replace(/ </g, '<').split('<')[0];
			} else {
				_val = addr;
			}
		}else if(this._user_info.has_item(name.canonical2)){
			_val = this._user_info.get_json(name.canonical2).user_name;
		}else{
			_val =  name.common;
		}
		
		var _frominfo = this.getFromJson();
		if (_frominfo.type=='user') {
			return '<a href="#" onclick="viewUserinfo(event, \'user\', \'' + _frominfo.company_code + '^' + _frominfo.user_id+ '\')">' + _val + '</a>';
		} else {
			return '<a href="#" onclick="viewUserinfo(event, \'\', \'' + _frominfo.email + '\')">' + _val + '</a>';
		}
	}
	,"getFromEmail":function(){
		var name = this.getFromInfo()
		, _val = ''
		if(name.isInternetAddress){
			var addr = name.origin.html_text().replace(/"/g, "").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			if (addr.indexOf('<') > -1) {
				_val = addr.split('<')[1].replace(/>/g, '');
			} else {
				_val = addr;
			}
		}else if(this._user_info.has_item(name.canonical2)){
			_val = this._user_info.get_json(name.canonical2).email;
		}else{
			_val =  name.addr821;
		}
		var _frominfo = this.getFromJson();
		if (_frominfo.type=='user') {
			return '<a href="#" onclick="viewUserinfo(event, \'user\', \'' + _frominfo.company_code + '^' + _frominfo.user_id+ '\')">' + _val + '</a>';
		} else {
			return '<a href="#" onclick="viewUserinfo(event, \'\', \'' + _frominfo.email + '\')">' + _val + '</a>';
		}
	}
	/* 조직도 열기 */
	,"openOrg":function(){
		var selected_item = {"to":[], "cc":[], "bcc":[]};
		var send_list = $("#send_to").tokenInput("get");
		var copy_list = $("#copy_to").tokenInput("get");
		var bcopy_list = $("#bcopy_to").tokenInput("get");
		for(var i = 0 ; i < send_list.length; i++){
			var item_key = send_list[i].key;
			var item_key = send_list[i];
			if(item_key == "") continue;
			selected_item["to"].push(this._user_info.get_json(item_key));
		}
		for(var i = 0 ; i < copy_list.length; i++){
			var item_key = copy_list[i].key;
			if(item_key == "") continue;
			selected_item["cc"].push(this._user_info.get_json(item_key));
		}
		for(var i = 0 ; i < bcopy_list.length; i++){
			var item_key = bcopy_list[i].key;
			if(item_key == "") continue;
			selected_item["bcc"].push(this._user_info.get_json(item_key));
		}
		this.org_loader.set_selected_item(selected_item);
		this.org_loader.open(Object.bind(window, this, this._orgSelectedList));
	}
	/* 본문 Resize */
	,"resizeBody":function(){
		if(mimeclass == "0") {
			return;
		}
		var bodyheight = this.doc.body.clientHeight;
		var bodylistheight = null;
		var minusHeight = null;
		if(this.info.docOptions == "0"){
			var frames = this.doc.getElementsByTagName("iframe");
			
			if(frames.length > 0){
				var frame_doc = (frames[0].contentDocument) ? frames[0].contentDocument : frames[0].contentWindow.document;
				
				if(frame_doc.readyState == "complete"){
					this.iframeResize(frames[0]);
				}
			}
		}else if(this.info.EditorType == "KEditor"){
			return; // 에디터 높이 리사이즈는 재처리할 것
			if(document.getElementById("atttable") == null){
				minusHeight = this.doc.getElementById("HeaderTable").offsetHeight + 58;
			}else{
				minusHeight = this.doc.getElementById("HeaderTable").offsetHeight + this.doc.getElementById("atttable").offsetHeight + 58;
			}
			minusHeight += this.doc.getElementById("tx_toolbar_basic").offsetHeight
						+ this.doc.getElementById("tx_toolbar_advanced").offsetHeight
						+ this.doc.getElementById("tx_resizer").offsetHeight;
			bodylistheight = (bodyheight - minusHeight) - 5
			if(bodylistheight<185){
				this.doc.getElementById("tx_canvas_wysiwyg").style.height = "185px";
				//this.doc.body.scroll="auto";
			}else{
				this.doc.getElementById("tx_canvas_wysiwyg").style.height = bodylistheight + "px";
				//this.doc.body.scroll="no";
			}
		}
	}
	/* 본문 Resize Preview */
	,"resizeBodyForPreView":function(){
		var bodyheight = document.body.clientHeight;
		var minusHeight = document.all.docinfo.offsetHeight+20;
		var bodylistheight = bodyheight - minusHeight;
		
		if(bodylistheight<0){
			if(document.getElementById("bodylist")) document.getElementById("bodylist").style.height = 0;
		}
		else{
			if(document.getElementById("bodylist")) document.getElementById("bodylist").style.height = bodylistheight;
		}
		
		var frames = this.doc.getElementsByTagName("iframe");
		
		if(frames.length > 0){
			var frame_doc = (frames[0].contentDocument) ? frames[0].contentDocument : frames[0].contentWindow.document;
			
			if(frame_doc.readyState == "complete"){
				this.iframeResize(frames[0]);
			}
		}
	}
	/* iFrame resize */
	,"iframeResize":function(iframe_obj, ex_flag){
		try{
			var frame_body = iframe_obj.contentWindow.document.body;
			if(frame_body){
				$(frame_body).css({'margin':'0'})
				var remove_tag = new RegExp(/\<spanstyle|\<\/body\>\<\/div\>|\<\!\[if ppt\]\>/);
				if (typeof ex_flag == "undefined" && remove_tag.test(frame_body.innerHTML)){
					frame_body.innerHTML = RemoveMSWordTags(frame_body.innerHTML);
					//innerHTML을 하면 DOM을 새로 읽어오므로 setTimeout으로 세로를 다시 계산을 한다.
					setTimeout(function(){iframeResize(iframe_obj, true)}, 0);
					return;
				}
				var height = frame_body.scrollHeight + 20;
				var width = frame_body.scrollWidth + 10 ;
				//iframe_obj.style.height = "300px";
				if(height > 300) iframe_obj.style.height = height + 'px';
				iframe_obj.style.width = width + 'px';
				$('.view').css({'overflow':'auto'})
				//$('#body_mail').css('opacity', '1');
				$('#id_related').css('opacity', '1');
				setBodyHeight(height);
			}
		}catch(e){
			if ($('#aprvBody').length == 0) {
				$('.view').css({'overflow':'auto'})
			}
			//$('#body_mail').css('opacity', '1');
			$('#id_related').css('opacity', '1');
		}
	}
	/* 메일 작성창 확대 */
	,"editorExpand":function(){
		var editorEx1 = this.doc.getElementById("editorEx1");
		var editorEx2 = this.doc.getElementById("editorEx2");
		var editorEx3 = this.doc.getElementById("editorEx3");
		var btnObj = this.doc.getElementById("idExpandEditorSpan"); 
		if(!this.isEditorExpand){
			if(editorEx1 != null) editorEx1.style.display = "none";
			if(editorEx2 != null) editorEx2.style.display = "none";
			if(editorEx3 != null) editorEx3.style.display = "none";
			btnObj.innerHTML = "Reset";
			this.isEditorExpand = true;
		}else{
			if(editorEx1 != null) editorEx1.style.display = "";
			if(editorEx2 != null) editorEx2.style.display = "";
			if(editorEx3 != null) editorEx3.style.display = "";
			btnObj.innerHTML = "Expand";
			this.isEditorExpand = false;
		}		
		if(this.info.EditorType == "NAMO"){
			var bodyheight = this.doc.body.clientHeight;
			var minusHeight = this.doc.getElementById("HeaderTable").offsetHeight + 58;
		
			bodylistheight = (bodyheight - minusHeight) - 5
			this.doc.getElementById("we").height = bodylistheight;
		}else if(this.info.EditorType == "KEditor"){
			var bodyheight = this.doc.body.clientHeight;
			var minusHeight = this.doc.getElementById("HeaderTable").offsetHeight 
							+ this.doc.getElementById("tx_toolbar_basic").offsetHeight
							+ this.doc.getElementById("tx_toolbar_advanced").offsetHeight
							+ this.doc.getElementById("tx_resizer").offsetHeight + 46;
			bodylistheight = (bodyheight - minusHeight) - 5
			this.doc.getElementById("tx_canvas_wysiwyg").style.height = bodylistheight + "px";
		}
	}
	/* 문서 닫기 */
	,"closeWindow":function(){
		if(this.info.isEdit){
			if (typeof(current_data_size)!='undefined' && current_data_size == sum_data_size()) { 
				gotoList();
			} else {
				if(confirm("문서가 저장되지 않았습니다. 계속하시겠습니까?")){
					gotoList();
				}
			}
		}else{
			if (this.info.read_type == "preview"){	//작성중 미리보기
				window.close();
			}else{
				if (this.info.opentype=="popup" && this.info.relatedyn=="Y") { //연관메일이 popup으로 열린경우
					if (opener) {
						pwin = opener;
					} else {
						pwin = parent;
					}
					if (pwin.$("#ViewBody").css("display") == "none") {
						gotoList();
					} else {
						window.close();
					}
				} else {
					gotoList();
				}
			}		
		}
	}
	/* 팝업창 문서 닫기 */
	,"closePopup":function(){
		window.close();
	}
	/* 저장 */
	,"saveDoc":function(me, e, action){
		// 버튼 더블클릭 방지 코드
		var el = $(me);
		if (el.hasClass('clicked')) {
			return;
		} else { 
			el.addClass('clicked');
			setTimeout(function(){el.removeClass('clicked')}, 2000);
		}
	
		/* 자동로그아웃되었는지 체크 */
		if(!sessionCheck()){ // common.js 
			return;
		}
		if ($("input[name=subject]").val().trim() == ""){
			alert("제목을 입력하여 주십시오.");
			return;
		}
		this.setField("DocStatus", "register");
		this._formSubmit();
	}
	/* Form Submit */
	,"_formSubmit":function(){
		var _self = this;
		if (_form.kEditor != null){
			// K-Portal Web Editor 본문 데이터 가져오기
			_form.kEditor.getSaveHtml().then(
				function(html){
					_form.form.Body_EDITOR.value = html;	
					_form.amHandler.XAM_upload(docid);
				}
			);	
		}else{
			_form.amHandler.XAM_upload(docid);
		}
	}
	,"_submitAction":function(){
		// 업로드 실패된 파일이 존재하는 경우 메일 발송 불가 처리
		var _fileList = $('#' + _form.am.g.iframe_id).contents().find('#file_list');
		if (_fileList.length) {
			if (_fileList.find('span[class*="error"]').length > 0) {
				var child = $('#' + _form.am.g.iframe_id).get(0).contentWindow;
				alert(child._XAM.xamlang.propStr("error_file_exists"));
				return;
			}
		}
		this.form.target = this.formSubmitFrame;
		this.setField("SAResponse", "parent.FormJS.get('" + this.instance_id + "').saveResponse");
		this._msgbox.hidden();
		this._msgbox.show('<img src="/ux/img/loading.gif" style="vertical-align:middle">&nbsp;&nbsp;<strong>저장 중 입니다. 잠시만 기다려 주십시오.</strong>');
		this.form.submit();
	}
	/* 저장 응답 */
	,"saveResponse":function(result){
		var _self = this;
		_self._msgbox.hidden();
		if(result.result != true){
			if(result.message) alert(result.message);
			else if(result.message_func) alert(result.message_func(window));
			else alert("오류가 발생하였습니다.");
			if(_self.info.isNewDoc && (result.saveoptions == "1")){
				_self.doc.location.href = '/' + _self.info.dbPath + '/0/' + result.unid + '?editdocument';
			}
			return;
		}else{
			if(result.message) alert(result.message);
			else if(result.message_func) alert(result.message_func(window));
			try{
				opener.gBody.xml_download('1', 'MeetNotice.nsf', 'vwNoticeList');
			}catch(e){}
			self.close();
		}
	}
	/* 작성중 미리보기 */
	,"preview":function(me, e){
		// 버튼 더블클릭 방지 코드
		var el = $(me);
		if (el.hasClass('clicked')) {
			return;
		} else { 
			el.addClass('clicked');
			setTimeout(function(){el.removeClass('clicked')}, 2000);
		}
		
		/* 자동로그아웃되었는지 체크 */
		if(!sessionCheck()){ // common.js 
			return;
		}
		
		this.setRecipients(false);
		this.setField("nh_Type", "");
		this.setField("SaveAgent", "wSave");
		this.setField("SendOptions", "2");
		this.setField("docMode", "preview");	//미리보기
		this.setField("ReturnReceipt", ($('#returnreceipt_check').is(':checked'))?"1":"");
		this.setField("Importance", ($('#important_check').is(':checked'))?"1":"2");
		this.setField("Forward_Deny", ($('#notforward').is(':checked'))?"1":"");
		this.setField("IndividualSend", ($('#OnePost').is(':checked'))?"1":"");
		this._formSubmit();
	}
	/* 작성중 새창쓰기 */
	,"newWindowWrite":function(me, e){		
		// 버튼 더블클릭 방지 코드
		var el = $(me);
		if (el.hasClass('clicked')) {
			return;
		} else { 
			el.addClass('clicked');
			setTimeout(function(){el.removeClass('clicked')}, 2000);
		}
		/* 자동로그아웃되었는지 체크 */
		if(!sessionCheck()){ // common.js 
			return;
		}
		
		this.setRecipients(false);
		this.setField("ECMCheck", "");		
		this.setField("nh_Type", "");
		this.setField("SaveAgent", "wSave");
		this.setField("SendOptions", "2");
		this.setField("docMode", "new_window_write");	//새창쓰기
		this.setField("ReturnReceipt", ($('#returnreceipt_check').is(':checked'))?"1":"");
		this.setField("Importance", ($('#important_check').is(':checked'))?"1":"2");
		this.setField("Forward_Deny", ($('#notforward').is(':checked'))?"1":"");
		this.setField("IndividualSend", ($('#OnePost').is(':checked'))?"1":"");
		this._formSubmit();
	}	
	/* 조회중 새창열기 */
	,"newWindowOpen":function(){
		if (!parent) return;
		/* 자동로그아웃되었는지 체크 */
		if(!sessionCheck()){ // common.js 
			return;
		}
		
		parent.open_win("/"+dbpath, this.info.unid, '', this, this.info.relatedyn);
		this.closeWindow();
	}
	/* 수정 */
	,"editDoc":function(){
		var msg = "";
		msg = "처리";
		this._msgbox.show('<img src="/ux/img/loading.gif" style="vertical-align:middle">&nbsp;&nbsp;<strong>' 
				+ msg + ' 중 입니다. 잠시만 기다려 주십시오.</strong>');
		var url = "/" + this.info.dbPath + "/0/" + this.info.unid + "?Editdocument";
		
		if (opentype != 'popup'){
			this._msgbox.hidden();
			url += '&opentype=tab&tabtitle=' + this.info.unid;
			parent.open_tab(url, this.info.unid, 'change');
		}else{
			this.doc.location.href = url + "&opentype=popup";
		}		
	}
	/* 삭제 */
	,"deleteDoc":function(){
		if(!confirm("삭제 하시겠습니까?")) return;
		this._msgbox.hidden();
		this._msgbox.show('<img src="/ux/img/loading.gif" style="vertical-align:middle">&nbsp;&nbsp;<strong>잠시만 기다려 주십시오.</strong>');
		var result = null;
		var pwin = window.opener;
		var _nextID = '';
		if (parent.$('.t-approval tr.t-next').length>-1) {
			_nextID = parent.$('.t-approval tr.t-next').attr('id');
		}
		if (opentype == 'preview' && _nextID != undefined && _nextID != '') {
		} else {
			// 미리보기 모드가 아닌경우 삭제 전에 다음문서의 정보를 Json으로 반환
			var _type = 'next';
			var vars = {}, hash;
			var hashes = document.location.href.slice(document.location.href.indexOf('?') + 1).split('&');
			for(var i = 0; i < hashes.length; i++){hash = hashes[i].split('=');vars[hash[0]] = hash[1] ? hash[1].replace(/#/g,'') : ''; }
			var _query = vars;
			var _r_url = "/" + dbpath + "/prevnext?openagent&viewname=" + (_query["viewname"] ? _query["viewname"] : viewname) + "&userkey=" + curUser + "&cmd=" + _type+ "&unid=" + docid;
			var _r = JSON.parse(__xml.request("g",_r_url,"text", false));
		}
		var url = "/" + this.info.dbPath + "/DeleteDocInDoc?OpenAgent&docid=" + this.info.unid;
		result = __xml.request("g",url,"text", false);
			
		try{
			result = eval("(" + result + ")");
			if(result.result != true){
				if(result.message){
					alert(result.message);
				}else if(result.message_func){
					alert(result.message_func(window));
				}else{
					alert("오류가 발생하였습니다.");
				}
				this._msgbox.hidden();
			}else{
				if(result.message){
					alert(result.message);
				}else if(result.message_func){
					alert(result.message_func(window));
				}
				try{
					if (this.info.opentype == 'popup'){
						pwin.page_reload();			
					}else{
						parent.page_reload();
					}
				}catch(e){}
				// 팝업창으로 표시된 경우에는 삭제 후 창 닫기 수행
				if (this.info.opentype == 'popup'){
					gotoList(this.info.docOptions);
				}
			}
		}catch(e){
			alert("오류가 발생하였습니다.");
		}
		this._msgbox.hidden();
	}
	/* 이동 닫기 */
	,"closeMoveDoc":function(){
		var sde = this.doc.getElementById("folder_list");
		if(sde) sde.style.display = "none";
	}
	/* 본문 확대/축소 */
	,"bodyZoom":function(offset){
		this.body_zoom += offset;
		if(this.body_zoom < -4) this.body_zoom = -4;
		var bodyDiv = this.doc.getElementById("dispbody");
		var iframe = bodyDiv.getElementsByTagName("iframe");
		var contentBody = null;
		if(iframe.length > 0){
			contentBody = iframe[0].contentWindow.document.body;
		}else{
			contentBody = bodyDiv;
		}
		var zoom = 1 + (this.body_zoom * 0.2);
		contentBody.style.zoom = zoom;
		contentBody.style.MsZoom = zoom;
		contentBody.style.webkitZoom = zoom;
		contentBody.style.MozTransform = "scale(" + zoom + ")";
		contentBody.style.MozTransformOrigin = "left top";
		if(iframe[0]) this.iframeResize(iframe[0], zoom);
	}
	/* 필드 Check */
	,"validationCheck":function(){ 
		for(var i = 0; i < this.validataionFlds.length; i++){
			var info = this.validataionFlds[i];
			if(info.condition && !info.condition(this)) continue;
			var fld = this.form[info.fld];
			if(fld != null && fld.value != null) fld.value = fld.value.trim();
			if(fld && fld.value == ""){
				try{fld.focus();}catch(e){}
				alert(info.msg);
				return false;
			}
		}
		return true;
	}
	/* 새창 */
	,"openSubWin":function(url,width,height,scroll,win_name,resizable){
		scroll = (scroll==null?"auto":scroll);
		win_name = (win_name==null?"":win_name);
		resizable = (resizable==null?"yes":resizable);
		
		if(width >= screen.availWidth) {width = screen.availWidth - 10;scroll = "auto";}
		if(height >= screen.availHeight) {height = screen.availHeight - 30;scroll = "auto";}
		var winx = Math.ceil((screen.availWidth - width)/ 2);
		var winy = Math.ceil((screen.availHeight - height)/ 2);		
		var feature = "left="+winx+",top="+winy
					+",width="+width+",height="+height
					+",status=yes,menubar=no,resizable="+resizable
					+",scrollbars="+scroll;
		return window.open(url,win_name,feature);
	}
	/* Field Set */
	,"setField":function(name, value){
		var elem = this.form.elements[name];
		if(elem == null){
			var elem = this.doc.createElement("input");
			elem.type = "hidden";
			elem.name = name;
			this.form.appendChild(elem);
			this.form.elements[name] = elem;
		}
		elem.value = value;
	}
	,"_action":function(post_url, post_data, progress_info){
		post_data["__Click"] = "0";
		post_data["%25%25PostCharset"] = "UTF-8";
		this._msgbox.show('<img src="/ux/img/loading.gif" style="vertical-align:middle">&nbsp;&nbsp;<strong>' + progress_info + '</strong>');
		__xml.request("p", post_url, "text", true
				, Object.bind(window, this, this._action_complete), 
				post_data, true);
	}
	,"_action_complete":function(result){
		this._msgbox.hidden();
		try{
			result = eval("(" + result + ")");
			if(result.result != true){
				if(result.message){
					alert(result.message);
				}else if(result.message_func){
					alert(result.message_func(window));
				}else{
					alert("오류가 발생하였습니다.");
				}
			}else{
				if(result.message){
					alert(result.message);
				}else if(result.message_func){
					alert(result.message_func(window));
				}
				try{opener.rePage();	}catch(e){}
				window.close();
			}
		}catch(e){
			alert("오류가 발생하였습니다.");
		}
	}
};
// 편집모드에서 상단 버튼 표시
function edit_button_draw() {
	var btn_html = '';	
}
// 조회모드에서 상단버튼 표시
function read_button_draw() {
	var btn_html = '';
}
// 화면에 표시될 버튼 및 More 버튼 구분 처리
function show_button(_id, _count) {
	$('#container').addClass('popup')
	$('#top_menu_list').show();
	var _li = $('#'+_id+' li');
	var _li_more = '';
	var header_width = $('#container header').width()- 200;
	var button_width = 0;
	var _dispmenu = $('#'+_id.replace(/_list|_memo/g, '')+'_disp');
	var _popupmenu = $('#'+_id.replace(/_list|_memo/g, '')+'_more');
	_dispmenu.empty();
	_popupmenu.empty();
	$.each(_li, function (idx, v) {
		var _clone = $(v).clone();
		if (header_width > button_width) {
			_dispmenu.append(_clone);
			button_width = calc_li(_dispmenu);
		} else {
			if (_li_more=='') {
				_li_more = '<li><a onclick="moreTopMenu(event, \''+_id+'\')"><span class="header-more ico">More</span></a></li>'
			}
			//_clone.find('span').remove();
								if (_clone.find('span').length) {
									var tmptit = _clone.find('span').text();
									_clone.find('span').remove();
									if (tmptit != '' && _clone.find('a').length) _clone.find('a').html(tmptit)
								}
			_popupmenu.append(_clone)
		}
	});
	_dispmenu.append(_li_more);
	_popupmenu.find('a').unbind().click(function(){
		$('.all-list-more').hide();
	})
}
function calc_li(_dispmenu) {
	var calc_width = 0;
	$.each(_dispmenu.find('li'), function (idx, v) {
		calc_width = calc_width + $(v).width() + 25;
	});
	return calc_width 
}
// More 버튼 클릭 시 레이어 팝업
function moreTopMenu(event, _id) {
	event = event || window.event;
	var _popupmenu = $('#'+_id.replace(/_list|_memo/g, '')+'_more');
	var posY = event.pageY;
	var posX = event.pageX //- _popupmenu.width() //- $('#Lnb').width();
	_popupmenu.show().css({'position':'absolute', 'left':posX, 'top':posY});
}
//조직도 레이어 initialize
function init_org() {

	actionId = ''
	lang = ''
	$('#orgModal')
	.empty()
	.append('<iframe src="' + '/' + libdb + '/org?readform&act=' + actionId + '&lang=' + lang + '&_org_mail_path=' + dbpath + '" style="width:100%;height:100%"></iframe>')
	.css({'width':'768px','max-width':'768px','height':'550px'})
	.position({
		my: 'center',
		at: 'center',
		of: window
	})
	
	window.all_data_list = window.duplicate_list; //temp데이터에 값 셋팅
	
	var list_cnt = 0;
	var tmp_duplicate_list = {};
	var list = ["send_to", "copy_to", "bcopy_to"]; 
	for (i = 0; i < list.length; i++) {
		list_type = list[i];
		list_cnt = 0;
		var tokeninput_list = $("#"+list_type+"").tokenInput("get");
		$.each(tokeninput_list, function (index, item) {
			list_cnt++;
			key = item.key;
			tmp_duplicate_list[key] = window.all_data_list[key];
			tmp_duplicate_list[key].field = list_type;
		});
	}
	window.all_data_list = tmp_duplicate_list;
}
//조직도팝업창의 확인버튼 클릭
function org_ok(all_data_list) {
	var list = ["send_to", "copy_to", "bcopy_to"];
	window.duplicate_list = {};
	for (i = 0; i < list.length; i++) {
		var type = list[i];
		$('#' + type).tokenInput("clear"); //필드값 초기화
	}
	for(var i = 0; i < all_data_list.length; i++){
		var _list = all_data_list[i].field;
		var _listCnt = $('#'+_list+'_cnt').text();
		if (_list=='bcopy_to') {
			$('.secret-user').addClass('on');
			$('#BtnMinus1').addClass('on')
		}
		$('#' + _list).tokenInput("add", all_data_list[i]);
		$('#'+_list+'_cnt').text(parseInt(_listCnt==''?'0':_listCnt)+1);
	}	
	
	$('#mask').fadeOut(200);
	$('.modalpop').fadeOut(200);
	
	if (opentype != 'popup'){
		$('#mask_left', parent.document).fadeOut(200);
		$('#mask_top', parent.document).fadeOut(200);
	}
	//비밀참조에 값이 있는 경우 DIV표시
	//if (parseInt($('#bcopy_to_cnt').text()) > 0){		
	if ($('#bcopy_to').closest('td').find('ul li').text() != '') {
		if (!$('#BtnMinus1').hasClass('on')){
			$('#BtnMinus1').click();
		}
	}
}
$(document).ready(function () {
	if (docoptions=='0') { // 조회모드
		var _allH = 0, _topH = 0;
		// 전체 높이
		if ($('div.view').is(':visible')) {
			_allH = $(window).height();
		}
		// 상단 높이 (버튼 영역)
		if ($('#container header').is(':visible')) {
			_topH = $('#container header').outerHeight();
		}
		// 상단 높이 (제목 영역)
		if ($('div.view h1').is(':visible')) {
			_topH = $('div.view h1').outerHeight() + 30;
		}
			
		// 상단 높이 (수신인 영역)
		if ($('div.view-items').is(':visible')) {
			_topH = _topH + $('div.view-items').outerHeight();
		}
		// 상단 높이 (첨부파일 영역)
		if ($('.addfile-box').is(':visible')) {
			_topH = _topH + $('.addfile-box').outerHeight();
		}
		// 상단 높이 (접기/펼치기 영역)
		if ($('div.view-items').is(':visible')) {
			_topH = _topH + 120;
		}
		
		if ($('#mimeBody').length > -1){
			$('.view').css({'overflow':'hidden'})
			$('#mimeBody').height(_allH - _topH );
		}
		if (opentype=='preview'||opentype=='imbed'||opentype=='tab') {
				if (parent != null && parent.isUnreadOpen == true) {
					parent.unread_mailcheck();
					parent.isUnreadOpen = false;
				} 
		} else {
				if (opener!= null && opener.isUnreadOpen == true) {
					opener.unread_mailcheck();
					opener.isUnreadOpen = false;
				} 
		}
	} else { // 편집모드
	//	setAttachDisplay();
	}
	/* 조직도 */
	$('.get-user .btn-org').unbind().click(function (e) {
		var id = '#orgModal';
		var maskHeight = $(document).height();
		var maskWidth = $(window).width();
		$('#mask, #mask iframe').css({
			'width': maskWidth,
			'height': maskHeight
		});
		$('#mask').fadeIn(500);
		$('#mask').fadeTo("fast");
		var winH = $(window).height();
		var winW = $(window).width();
		if (opentype != 'popup') {
			//좌측 영역 레이어처리
			$('#mask_left', parent.document).css({
				'width': $('#mask_left', parent.document).next().width() + 1,
				'height':$('#mask_left', parent.document).next().height()
			});
			$('#mask_left', parent.document).fadeIn(500);	
			$('#mask_left', parent.document).fadeTo("fast");
			//상단영역 레이어처리
			$('#mask_top', parent.document).css({
				'width': $('#mask_top', parent.document).next().width(),
				'height':$('#mask_top', parent.document).next().height()+2, 
				'left':$('#mask_top', parent.document).next().css('left')
			});
			$('#mask_top', parent.document).fadeIn(500);	
			$('#mask_top', parent.document).fadeTo("fast");
		}
		//조직도창
		$(id).css('top', winH / 2 - $(id).height() / 2);
		$(id).css('left', winW / 2 - $(id).width() / 2);
		$(id).fadeIn(500);
		init_org();
    	
	});
	//검은바탕 클릭 막기
	$('#mask').click(function () {
		return false;
	});
$('.secret-user .btn-org').unbind().click(function (e) {
		var id = '#orgModal';
		var maskHeight = $(document).height();
		var maskWidth = $(window).width();
		$('#mask, #mask iframe').css({
			'width': maskWidth,
			'height': maskHeight
		});
		$('#mask').fadeIn(500);
		$('#mask').fadeTo("fast");
		var winH = $(window).height();
		var winW = $(window).width();
		if (opentype != 'popup') {
			//좌측 영역 레이어처리
			$('#mask_left', parent.document).css({
				'width': $('#mask_left', parent.document).next().width() + 1,
				'height':$('#mask_left', parent.document).next().height()
			});
			$('#mask_left', parent.document).fadeIn(500);	
			$('#mask_left', parent.document).fadeTo("fast");
			//상단영역 레이어처리
			$('#mask_top', parent.document).css({
				'width': $('#mask_top', parent.document).next().width(),
				'height':$('#mask_top', parent.document).next().height()+2, 
				'left':$('#mask_top', parent.document).next().css('left')
			});
			$('#mask_top', parent.document).fadeIn(500);	
			$('#mask_top', parent.document).fadeTo("fast");
		}
		//조직도창
		$(id).css('top', winH / 2 - $(id).height() / 2);
		$(id).css('left', winW / 2 - $(id).width() / 2);
		$(id).fadeIn(500);
		init_org();
    	
	});
	/* 조직도 */
	if( typeof(PopupSave) == "undefined" ) { PopupSave="N" ; }
	if( opener && PopupSave=="Y" && opentype == 'popup' ) { 
		var oldX = window.screenX, oldY = window.screenY;
		var interval = setInterval(function(){
			try{
				if(oldX != window.screenX || oldY != window.screenY){
					if( window.screenX < (screen.availWidth * -1) ) {  
						//창 최소화의 경우, pass
					} else {
						var cookieString = ((window.screenX < 0) ? 0 : window.screenX) + "^" + ((window.screenY < 0) ? 0 : window.screenY)
						cookieString += "^" + $(window).outerWidth(true) + "^" + $(window).outerHeight(true);
						opener.Popup_SetCookie("mailPopupinfo", cookieString , 30)
					}
				}
				oldX = window.screenX;
				oldY = window.screenY;
			} catch(e) { clearInterval(interval); }
		}, 500);
	}
	var resizeTimer, resizeTimer_btn;
	$(window).resize(function () {
		if( opener && opentype == 'popup' ) {
			if (PopupSave=="Y") {
				clearTimeout(resizeTimer); 
				resizeTimer = setTimeout(function() { 
					try{
						var cookieString = ((window.screenX < 0) ? 0 : window.screenX) + "^" + ((window.screenY < 0) ? 0 : window.screenY)
						cookieString += "^" + $(window).outerWidth(true) + "^" + $(window).outerHeight(true);
						opener.Popup_SetCookie("mailPopupinfo", cookieString, 30); 
					} catch(e) { clearTimeout(resizeTimer);  }
				}, 500); 
			} 
			if(resizeTimer_btn){
				clearTimeout(resizeTimer_btn);
			}
			resizeTimer_btn = setTimeout(function() { //리사이즈할 때마다 버튼 재계산시 성능 이슈가 발생되므로 0.2초 간격 유지
					show_button("header_menu_memo", 4);
					setBodyHeight();
					resizeTimer_btn = null;
			}, 200);
		} else {
			setBodyHeight();
		} 
		setAttachDisplay();
		
		//_form.iframeResize(document.getElementById('mimeBody'));
		resizeMid();
		var box = $('#boxes .modalpop');
		$('#mask, #mask iframe').css({
			'width': $(window).width(),
			'height': $(document).height()
		});
		var winH = $(window).height();
		var winW = $(window).width();
		$.each(box, function(){
			$(this).css('top', winH / 2 - $(this).height() / 2);
			$(this).css('left', winW / 2 - $(this).width() / 2);
		})
	});
	$('.nolink').on('click', function (e) {
		e.preventDefault();
	});
	if (docoptions != '0') setBodyHeight(); //읽기모드는 form.initRead에서 수행함 (iframe이 늦게 로딩되는 현상 때문)
	
	// 상단 숨기기(에디터와 첨부파일 사이에 있는 버튼)
	$('.write-btn-toggle').click(function () {
		$('.view-items').slideToggle(function () {
			if ($('.write-btn-toggle').hasClass('on')) {
				$('.write-btn-toggle').removeClass('on');
				setBodyHeight();
			} else {
				$('.write-btn-toggle').addClass('on');
				setBodyHeight();
			};
		});
	});
	//파일첨부 열기/닫기
	$('#BtnMinus2').bind('click', function () {
		var file_mode = "";
		if (BrowserType == "Microsoft---BBBBBB") {
			if ($('#ActiveXMode').height() == 0) {
				//$('#ActiveXMode').height(120);
				if( $('#FMPCtrl').height() == 72){
					$('#ActiveXMode').height(104);
				}else{
					$('#ActiveXMode').height(  $('#FMPCtrl').height() + 38 );
				}
			} else {
				$('#ActiveXMode').height(0);
			}
		} else {
			$file_list = $('#attach_layer');
			if ($file_list.hasClass('hide')) {
				$file_list.removeClass('hide');
			} else {
				$file_list.addClass('hide');
			}
		}
		setBodyHeight();
	});
});
function XMLHTTP(url) {
	var url = url + "&" + (new Date()).getTime()
	var resText = xmlHTTP(url);
	return resText;
}
// 문서를 초기화함. 읽기 모드인 경우에는 Body가 MIME인지 아닌지 검사함
function Doc_Initialize(status) {
	initUX(); //UX이벤트	
	if (status == "2") {
		if (formName == "F10"){
			BodyEdit();
		}
	} else if (status == "0") {
		//문서 최초 로딩시 form.initRead먼저 수행 후 여기 실행
		if ($('#mimeBody')){
			_form.iframeResize(document.getElementById('mimeBody')); //body리사이즈
		}else{
			setBodyHeight();
		}
	}
}
function setBodyHTML(_html) {
	if (typeof(_form.kEditor)=='undefined') {
		setTimeout(function(){ setBodyHTML(_html)}, 300);
	} else {
		_form.kEditor["do"](
			function(adapter){		
/*		
				_html =_html.replace(/<head>(.*?)<(\/?)head>/gi,"");//head에 포한됨 모든 내용 제거
				_html =_html.replace(/<(\/?)html>/gi,"");//html 태그 제거
				_html =_html.replace(/<(\/?)body>/gi,"");//body 태그 제거
				_html =_html.replace(/<style>(.*?)<(\/?)style>/gi,"");//style에 포한됨 모든 내용 제거
*/
				adapter.setHtml(KEditor.getInlineStyleHtml(_html));
			}
		);		
	}
}
//콤마찍기
function numberFormat(num) {
	var pattern = /(-?[0-9]+)([0-9]{3})/;
	while (pattern.test(num)) {
		num = num.replace(pattern, "$1,$2");
	}
	return (num ? num : 0);
}
var body_complete = "";
//본문 높이 계산하는 함수
function setBodyHeight(iframe_height) {
	
	if (_form && _form.kEditor && _form.kEditor.setHeight) {
		_form.kEditor.setHeight(504);
	}
	return;
	
	var fix_height = 0; //고정 높이
	var ex_height = 0; //예외설정 높이 (write-content클래스의 하단 padding과 border값)
	if (docoptions == "0") {
		ex_height += (30*2) + 30; //.view padding + .view-contents padding
		ex_height +=20; //.view-contents margin
		$('#container .view').css('overflow','auto');//본문영역 가로 스크롤 생성
	} else {
		$('#container .wrap-write').css('overflow-x','auto');//본문영역 가로 스크롤 생성
	}
	if (typeof(opentype) != 'undefined' && opentype != "print"){
		if ($('#container header').is(':visible')) fix_height = $('#container header').outerHeight(true);
		if ($('.view h1').is(':visible')) fix_height = $('.view h1').outerHeight(true);
		if ($('.view .view-items').is(':visible')) fix_height = $('.view .view-items').outerHeight(true);
	}	
	//에디터의 min-height값을 가져옴
	var m_height = 0;
	//iframe에 가로/세로 스크롤 없애기
	//$('#dispbody iframe').contents().find('body').css({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
	if (m_height == 0) m_height = 300;
	var disp_height = $(window).height() - fix_height - ex_height;
	$('#dispbody').stop();
	if (docoptions == "0") {
		var read_height = 0;
		var ifm = $('#dispbody #mimeBody'), ifm_aprv = $('#dispbody #aprvBody');
		if (iframe_height) { //iframe에서 리사이즈 호출한 경우(body가 로딩완료된 경우임)
			read_height = iframe_height;
			if ($('#dispbody p').height() > read_height) read_height = $('#dispbody p').height(); //iframe 바깥에 태그가 있는 경우가 있음
			if ($('#body_mail').height() > read_height) read_height = $('#body_mail').height(); //iframe 외에 별도 태그가 있는 경우
			body_complete = "Y";
		} else {
			if (ifm.length == 0&&ifm_aprv.length == 0) {
				read_height =  $('#dispbody').height;
			} else {
				if (body_complete == "") {
					setTimeout(function(){setIframeHeight(disp_height);}, 0);
					return;
				} else {
					if (ifm_aprv.is(':visible')) {
						read_height = $(ifm_aprv).height();
					} else {
						read_height = $(ifm).height();
					}
				}
			}
		}
		//console.log('disp_height:'+disp_height+',  read_height:'+read_height)	
		//body의 사이즈가 보여지는 사이즈 보다 작은 경우 화면사이즈를 뿌려줌
		if (read_height < disp_height) {
			/*
			$('#dispbody').animate({
				height: disp_height
			}, 'fast');
			*/
			$('#dispbody').height(disp_height);
			if (read_height == 0) {
				if (ifm.length > 0) {
					$(ifm).css('height', disp_height);
					//$('#body_mail').css('opacity', '1');
				}
			}
		} else {
			$('#dispbody').css('height', ''); //보여지는 사이즈가 창을 벗어나면 height제거
			if ($('#dispbody').height() < m_height) { //제거된 후 사이즈가 최소값 이하이면 새로 셋팅
				/*
				$('#dispbody').animate({
					height: disp_height
				}, 'fast');
				*/
				$('#dispbody').height(disp_height);
/*
				if (window.sr_survey == "Y") {
					$('#dispbody').find("#body_mail").css("height", "350");
					window.sr_survey = "N";
				}
*/
			}
		}
	} else {
		var _allH = 0, _topH = 0, _bottomH = 0, _resizeH = 600;
		if ($(window).width()>1400) {
			// 전체 높이
			if ($('#right_form').is(':visible')) {
				_allH = $('#right_form').outerHeight();
			}
			
			// 상단 높이 (제목영역)
			if ($('#subject_layer').is(':visible')) {
			//	_topH = $('#subject_layer').height() + 40; // 40px은 padding 영역
				_topH = $('#subject_layer').height() + 160; // 경재양식명 부분으로 인해 조정
			}
			// 하단 높이 (체크박스영역)
			if ($('#btm_check_layer').is(':visible')) {
				_bottomH = _bottomH //+ $('#btm_check_layer').height();
			}
			_resizeH = _allH-_topH-_bottomH-15;
		//	_resizeH = _allH-_topH-_bottomH-135;
		} else {
		}
		if (typeof(_form.kEditor)!='undefined') {
			_form.kEditor["do"](function(adapter){
				adapter.setHeight(_resizeH);
			})
		}
	}
}
var iframe_aprv_cnt = 0;
function setIframeHeight(disp_height) {
	var read_height, read_width
	, aprv_calc = false
	, ifm_aprv = $('#dispbody #aprvBody')
	, ifm_aprv_h = 0
	, ifm_aprv_h_sub = 0
	, ifm_aprv_complete
	, ifm_aprv_complete_sub
	if (ifm_aprv.is(':visible')) {
		if (iframe_aprv_cnt > 50) return; // loop가 15초가 넘으면 Skip (10회 수행 3초)
		// undoc.html
		ifm_aprv_h = ifm_aprv.contents().find('.frm_wrap').prop('scrollHeight')
		ifm_aprv_complete = ifm_aprv.contents().find('.frm_tbl')
		// undoc_inner.html
		ifm_aprv_h_sub = ifm_aprv.contents().find('iframe').contents().find('.frm_wrap').prop('scrollHeight')
		ifm_aprv_complete_sub = ifm_aprv.contents().find('iframe').contents().find('.frm_tbl')
		if (ifm_aprv_h_sub != undefined) {
			ifm_aprv_h = ifm_aprv_h_sub;
			ifm_aprv_complete = ifm_aprv_complete_sub;
		}
		if (ifm_aprv_complete.length > 0) {
			if (ifm_aprv_h < 650 ) { // 결재문서 높이가 650 이하라면 아직 로딩이 완료된 것이 아니기 때문에 다시 높이 계산
				setTimeout(function(){setIframeHeight(disp_height)},300);
				return
			}
			$('.view-contents').css('paddingTop', '20px');
			aprv_calc = true;
		} else {
			iframe_aprv_cnt += 1;
			setTimeout(function(){setIframeHeight(disp_height)},300);
			return;
		}
	}
	if (body_complete == "Y") {
		//$('#body_mail').css('opacity', '1');
		return;
	}
	if (ifm_aprv.is(':visible')) {
		read_height = ifm_aprv_h;
		if (aprv_calc == true) ifm_aprv.css('height', read_height+100);
		$('.view').css('overflow','auto');
		//$('#body_mail').css('opacity', '1');
		$('#id_related').css('opacity', '1');
		return;
	} else {
		read_height = $('#dispbody').find('iframe').contents().find('body').prop('scrollHeight');
	}
//	console.log('read_width : ' + read_width + ', read_height : ' + read_height);
	var ifm = $('#dispbody').find('iframe');
	if (typeof (read_height) == "undefined") return;
	$('#dispbody iframe').contents().find('body').css({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
	$('#dispbody').stop();
	if (read_height < disp_height) {
		/*
		$('#dispbody').animate({
			height: disp_height
		}, 'fast');
		*/
		$('#dispbody').css('height', disp_height);
		if (read_height == 0) {
			if (ifm.length > 0) {
				$(ifm).css('height', disp_height);
				//$('#body_mail').css('opacity', '1');
			}
		}
	} else {
		$(ifm).height(read_height);
		//$('#body_mail').css('opacity', '1');
		$('#dispbody').css('height', '');
	}
	if (aprv_calc == false) setTimeout(function(){setIframeHeight(disp_height)}, 0);
}
/* 오래된 메일 삭제 */
var _calendar = null;
var _msgbox = null;
function offset(el) {
	var offset = {
		top: 0,
		left: 0
	};
	while (el != undefined) {
		offset.left += el.offsetLeft;
		offset.top += el.offsetTop;
		el = el.offsetParent;
	}
	return offset;
}
//인쇄미리보기
function PreviewPrint(me, e) {
		// 버튼 더블클릭 방지 코드
		var el = $(me);
		if (el.hasClass('clicked')) {
			return;
		} else { 
			el.addClass('clicked');
			setTimeout(function(){el.removeClass('clicked')}, 2000);
		}
	var url = "/" + dbpath + "/preview/" + _form.info.unid + "?OpenDocument&opentype=print";
	var trans_win = open_subwin(url, "1020", "640", "auto", "", "yes");
	trans_win.focus();
}
//인쇄
function WebPrint(me, e) {
		// 버튼 더블클릭 방지 코드
		var el = $(me);
		if (el.hasClass('clicked')) {
			return;
		} else { 
			el.addClass('clicked');
			setTimeout(function(){el.removeClass('clicked')}, 2000);
		}
		window.print();
}
function BodyOpen() {
	removeAttachment(); //첨부파일 테이블 제거
	$('#body_mail iframe[src*="http:"]').remove(); //다른 도메인 iframe은 삭제 처리
	var ifm = $('#dispbody iframe');
	if (ifm.attr('src') && ifm.attr('src').indexOf(dbpath) >= 0) {
		$(ifm).css({
			'border': '0px',
			'width': '100%',
			'height': ''
		});
		$(ifm).attr({
			'id': 'mimeBody'
		});
		$('#dispbody').show();
	} else {
		var source = RemovePreTag(document.getElementById("body_mail").innerHTML);
		//본문에서 < 를 &lt로 자동변환해서 읽어오기 때문에 주석처리 부분 추가
		var RegExpDS = /&lt;!--[^>](.*?)--&gt;/g;
		source = source.replace(RegExpDS, "");
		source = source.replace(/<form .*?>|<\/form>/gi, "");
		var err_reg = /<\!--.*\/>/;
		var err_flag = err_reg.test(source) || source.indexOf("_formSubmitFrame") > 0;
		if ($("#body_mail").find("style").size() > 0 && !err_flag) {
			//본문에 대표 style태그가 포함된 경우 다른 영역에 영향을 줄 수 있으므로 iframe을 만들어서 셋해줌
			var t_iframe = '<iframe scrolling="auto" width="100%" style="border:0px;" id="mimeBody"></iframe>';
			//$("#body_mail").html('').append(t_iframe);
			document.getElementById("body_mail").innerHTML = t_iframe;
			setTimeout(function(){
				var css_link;	//메일CSS 추가
				$("#mimeBody").contents().find('body').get(0).innerHTML = source;
				_form.iframeResize(document.getElementById('mimeBody')); //body리사이즈
				resizeMid();
			}, 10);
		}else{
			document.getElementById("body_mail").innerHTML = source;
		}
		document.getElementById("dispbody").style.display = "";
		document.getElementById("dispbody").style.minHeight = "200px";
		if (docoptions == "0") {
			$('#container .view').css('overflow-x','auto');
		} else {
			$('#container .wrap-write').css('overflow-x','auto');
		}
	}
	setBodyHeight();
}
function XMLHTTP2(url) {
	var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp.open("Get", url + "&" + (new Date()).getTime(), false);
	xmlhttp.send("");
}
function resizeMid() {
	//$('#container').height($(window).height());
	var fix_height  = 0;
	if ($('#container header').is(':visible')) fix_height = $('#container header').outerHeight(true);
	if (docoptions == "0") {
		$('#container .view').height($(window).height()-fix_height -60);
	} else {
		$('#container .wrap-write').height($(window).height()-fix_height);
	}
}
//----Extraction left string
function Left(SourceStr, FindStr) {
		Index = SourceStr.indexOf(FindStr);
		if (Index < 0) {
			return ("");
		} else {
			return (SourceStr.substring(0, Index));
		}
	}
	//-----Extraction right string
function Right(SourceStr, FindStr) {
	Index = SourceStr.indexOf(FindStr);
	if (Index < 0) {
		return ("");
	} else {
		Len = SourceStr.length;
		return (SourceStr.substring(Index + FindStr.length, Len));
	}
}
//----Open popup window with scrollbar options
function openSubwin(url, width, height, scrollbars, win_name, resizable) {
	var opt_scrollbars = (scrollbars == null) ? "auto" : scrollbars;
	var window_name = (win_name == null) ? "subwin" : win_name;
	var winFeature = setCenter(width, height) + ",status=yes,menubar=no,resizable=" + (resizable == null ? "no" : resizable) + ",scrollbars=" + opt_scrollbars;
	var subwin = window.open(url, window_name, winFeature);
	return subwin;
}
function setCenter(winwidth, winheight) {
	winx = Math.ceil((screen.availWidth - winwidth) / 2);
	winy = Math.ceil((screen.availHeight - winheight) / 2);
	if (winwidth == screen.availWidth) winwidth = screen.availWidth - 10;
	if (winheight == screen.availHeight) winheight = screen.availHeight - 30;
	return "left=" + winx + ",top=" + winy + ",width=" + winwidth + ",height=" + winheight;
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function changeID(val) {
	if (val != "N") {
		var surl = "/" + dbpath + "/setDualCheckInfo?OpenAgent&skey=" + val;
		var res = XMLHTTP(surl);
		var retStr = getBodyHTML(res);
		var retVal = retStr.split("; ");
		var xData = new Array();
		for (i = 0; i < retVal.length - 1; i++) {
			xData.push(retVal[i]);
		}
		var from_info = from_cn + " " + retVal[0] + "/" + retVal[2]
		document.getElementById("authorInfo").value = xData;
		document.getElementById("DismyName").innerHTML = from_info;
	}
}
function removeIframe(editorDom) {
	try {
		var iframeTag = editorDom.all.tags("IFRAME");
		if (iframeTag != null) {
			for (var i = iframeTag.length - 1; i >= 0; i--) {
				if (iframeTag[i].src.search(/^\/[\S]*\.nsf\/[\S]*\/body\//i) != -1) {
					iframeTag[i].removeNode();
				}
			}
		}
	} catch (e) {}
}
function removeForm(editorDom) {
	try {
		var formTag = editorDom.all.tags("FORM");
		if (formTag != null) {
			for (var i = formTag.length - 1; i >= 0; i--) {
				if (formTag[i] != null) {
					formTag[i].removeNode();
				}
			}
		}
	} catch (e) {
		alert(e);
	}
}
function id(str) {
	return document.getElementById(str);
}
//목록으로 가기
function gotoList(status) {
	window.onbeforeunload = '';
	if (_form.info.callfrom == 'ep'){
		self.close();
		return;
	}
	if (opentype == 'popup') {
		try{
			if (opener){
				((opener.isSearchMode == "T" || opener.isSearchMode == "D" || opener.isDetailSearchMode == "Y") ? "" : opener.rePage());
				opener.devideContent(true, true); //목록으로 이동
			}
		}catch(e){
		}finally{self.close();}
		
	} else if (parent.gl_soption == 'H' || parent.gl_soption == 'W') { //미리보기 화면에서 넘어온경우
		if (opentype=='tab') {
			parent.close_tab(typeof(tabtitle)!='undefined' && tabtitle.indexOf('new')>-1?tabtitle:_form.info.unid);
		} else {
			parent.clearViewBody();
			window.parent.$('#Lnb').removeClass('write-lnb');
			window.parent.$('#Rt-wrap').removeClass('write-contents');
			window.parent.$('#Main-wrap > header').removeClass('write-header');
			if (status != "0")	((parent.isSearchMode == "T" || parent.isSearchMode == "D" || parent.isDetailSearchMode == "Y") ? "" : parent.rePage());	//편집시만 rePage호출
			parent.titlepath();
			parent.devideContent(true, true); //목록으로 이동
		}
	} else {
		if (opentype=='tab') {
			parent.close_tab(typeof(tabtitle)!='undefined' && tabtitle.indexOf('new')>-1?tabtitle:_form.info.unid);
		} else {
			parent.clearViewBody();
			window.parent.$('#Lnb').removeClass('write-lnb');
			window.parent.$('#Rt-wrap').removeClass('write-contents');
			window.parent.$('#Main-wrap > header').removeClass('write-header');
			((parent.isSearchMode == "T" || parent.isSearchMode == "D" || parent.isDetailSearchMode == "Y") ? "" : parent.rePage()); 
			parent.titlepath();
			parent.devideContent(true, true); //목록으로 이동
		}
	}
}
//스크롤 맨위로
function gotoScrollTop() {
	if (docoptions == "0") {
		$('#container .view').scrollTop(0);
	} else {
		$('#container .wrap-write').scrollTop(0);
	}
}
var mouse_out2;
function hix2() {
	mouse_out2 = false;
}
function eix2() {
	mouse_out2 = true;
}
function setAttachDisplay() {
	return false;
	if (docoptions != '0') { 
		if ($(window).width() >= 1400) {
			$('#attach_collaps').hide();
			$('.attach-area').show();
			$('#attach_layer').show();
			$('#attach_layer iframe').height(122);
		} else {
			$('#attach_collaps').show();
			$('#attach_collaps').find('span.ico-user-fold')
				.off()
				.on('click', function(){
					if ($(this).hasClass('on')) {
						$(this).removeClass('on');
						$('.attach-area').hide();
						$('#attach_layer').hide();
					} else {
						$(this).addClass('on');
						$('.attach-area').show();
						$('#attach_layer').show();
						$('#attach_layer iframe').height(122);
					}
				})
			if (_form.amHandler.attachmentName.join('')  != '') {
				$('#attach_count').html('(' + _form.amHandler.attachmentName.length + '개)')
			}
			if ($('#attach_collaps').find('.ico-user-fold').hasClass('on') == false) {
				$('.attach-area').hide();
				$('#attach_layer').hide();
			}
		}
	}
}
