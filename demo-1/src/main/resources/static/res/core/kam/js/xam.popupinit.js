(function ($) {
	//var _o = window.opener;
	var _o = opener = window.dialogArguments;

	var _largeFile = [];
	var _largeRes = [];
	var xam;	
	$(document).ready(function(){
		$('#popup_title').html(_o._XAM.xamlang.propStr("popup_title"));
		$('#popup_close')
			.html(_o._XAM.xamlang.propStr("popup_close"))
			.on('click', function(){
				closeWin();
			});
		$('#popup_ok')
			.html(_o._XAM.xamlang.propStr("popup_ok"))
			.on('click', function(){
				ok();
			});
		$('#popup_cancel')
			.html(_o._XAM.xamlang.propStr("popup_cancel"))
			.on('click', function(){
				closeWin();
			});
		
		initializeXAM();
	});
	function closeWin() {
		top.close();
	}
	function ok(){
		var is_new_file = false;
		var del_file_name = [];

		$.each(xam.g.getFileList(), function(idx, file) {
			if (file.status == 'wait') {
				is_new_file = true; 
			} else if (file.status == 'remove') {
				del_file_name.push(file.name);
			}
		});

		var _attach_form = $('#' + xam.g.iframe_id).contents().find('form');
		if (is_new_file) {
			_attach_form.find('input[name="unid"]').val(_o._XAM.args.attachunid);
			_attach_form.find('input[name="unique"]').val(_o._XAM.args.attachunique);
		}
		
		var callbackName = _o._XAM.args.uploadCallback;
		if (callbackName!=undefined&&callbackName!='') {			
			var _fn = 'opener.parent.' + callbackName;
			var tempFunction = new Function("Arg1","Arg2", _fn + "(Arg1,Arg2)");
			tempFunction(is_new_file, del_file_name);
			//opener.iNotesHandler.XAM_set_field(is_new_file, del_file_name)
		}
		
		if (!xam.g.upload()) {
			uploadCompleteProcess();
		}
	}
	function uploadCompleteProcess() {
		var _fw = $("#" + xam.g.iframe_id)[0].contentWindow;
		var _fileList = _fw.$('#'+_fw._XAM.args.filelistID).html();
		if (_fw.$('#'+_fw._XAM.args.filelistID+' .template-empty').length==0) {
			_o.$('#'+_o._XAM.args.filelistID).html(_fileList);
		} else {
			_o.$('#'+_o._XAM.args.filelistID).html('');
		}
		headResize(_o);
		closeWin();
	}

	function headResize(_w) {
		var _table = _w.$("#"+_w._XAM.args.fileID+" table");
		_o.$.fn.resizeHeader(_w.$.idObj, _table.width());
		/*
		_w.$('#hdScroll' + _w.$.idObj + ' #hd' + _w.$.idObj).css('width', _table.width()+'px');
		_w.$('#hdScroll' + _w.$.idObj + ' #hd' + _w.$.idObj + ' table').css('width', _table.width()+'px');
		*/
	}
	function initializeXAM() {
		xam = new XAM({
			disp_id          : 'upload_div',
		    config_url       : _o._XAM.args.config_url,
			isEdit			 : _o._XAM.args.isEdit,
			isPopup          : true,
			save_path		 : _o._XAM.args.save_path,
			l_save_path		 : _o._XAM.args.l_save_path,	
			serverzip_path   : _o._XAM.args.serverzip_path,	
			attachunid       : _o._XAM.args.attachunid,
			attachunique     : _o._XAM.args.attachunique,
			OnUploadComplete     : function(file, result) {
				_o._XAM.uploaderid = result.id;
				uploadCompleteProcess();
			},					
			OnMoveBefore     : function(file, el, move_type) {
				if (_o._XAM.args.isEdit) {
					if (file.status == 'complete') {
						// 기첨부된 파일은 이동이 안되도록 처리
						$(el).removeClass('click-on');
						return false;
					} else {
						// 기첨부된 파일은 위,아래로 이동이 안되도록 처리
						var dstEl = (move_type == 'up' ? $(el).prev() : $(el).next());
						var dstStat = dstEl.find('.upload-status');
						if (dstStat.hasClass('complete')) { 
							return false; 
						}
					}
				}
				return true;
			},
			OnRemoveBefore   : function(file, el) {
			},
			OnError : function(e){ 
				uploadCompleteProcess();
			},
			OnInitCompleted  : function(id){
				var _fw = $("#" + xam.g.iframe_id)[0].contentWindow;
				var _openerFileList = _o.$('#'+_o._XAM.args.filelistID).html();
				if (_openerFileList!=undefined&&_openerFileList!='') _fw.$('#'+_fw._XAM.args.filelistID).html(_openerFileList);
				headResize(_fw)
				return;
			},
			OnLargeUploadComplete  : function(){		
				//_o.OnLargeUploadComplete();
			},
			OnLargeUploadEachComplete  : function(file, res){
				_o.OnLargeUploadEachComplete(file, res);
			}
		});
	}
})(jQuery);

