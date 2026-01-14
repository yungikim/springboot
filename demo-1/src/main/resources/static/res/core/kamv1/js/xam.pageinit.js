var _file_upload_win;
function pageInit(isPopup){

    $('#file_select').off("click").on("click", function(e){
    	var _self = $(this);
    	var $tr_obj = $('#files tr');

    	$.each($tr_obj, function(idx, obj) {
    		if ($(this).hasClass('template-empty')) {
    			e.preventDefault();
    		} else {
        		if (_self.is(':checked')) {
            		$(this).addClass('click-on');
            		$(this).find("input[type=checkbox]").prop('checked', true); 
        		} else {
            		$(this).removeClass('click-on');
            		$(this).find("input[type=checkbox]").prop('checked', false);        			  			
        		}    			
    		}
    	});
    });
    $('#btn_mypc').off("click").on("click", function(){
		//$.support.dragdrop = false;
    //$('#btn_mypc').on("click", function(){
    	if ($.support.dragdrop || isPopup){
    		$(':file').trigger('click');   
    	} else {
    		var _p = parent;
	    	var _url = _p.basePath + '/XAM_upload_popup.html?Open';
	    	var _w = 900;
	    	var _h = 389;
	    	var _l = _p.window.screenLeft + (_p.document.body.clientWidth - _w)/2;
	    	var _t = _p.window.screenTop + (_p.document.body.clientHeight - _h)/2;
	    	if(_file_upload_win)_file_upload_win.close();
	    	
	    	var msgDialog = window.showModalDialog(_url, self, 'dialogWidth:'+_w+'px; dialogHeight:'+_h+'px; center:yes; help:no; status:no; scroll:no; resizable:no');


	        /*
	    	_file_upload_win = window.open(_url, '', 'width=' + _w + 'px,height=' + _h + 'px,left=' + _l + 'px,top=' + _t + 'px,scrollbars=no,titlebar=no,toolbar=no,menubar=no,location=no')
			var readyStateCheckInterval = setInterval(function() {
			    if (_file_upload_win.document.readyState === "complete") {
			        clearInterval(readyStateCheckInterval);
			       
			        //_file_upload_win.document.write(child.document.documentElement.outerHTML)
			        //_file_upload_win.popupInit(o, scriptBasePath, basePath);
			    }
			}, 50);
			*/
    	}
        
        return false;
    });
    
        
    $('#btn_delete').off("click").on("click", function(){
    	var sel_obj = $('#file_list .click-on');
    	$.each(sel_obj, function(idx, obj) {
    		var deleteComplete = false;
    		var file = {
    				name: $(this).find('p.name').text().replace(/^\s*|\s*$/g, ''),
    				status: $(this).find('.upload-status').text().replace(/^\s*|\s*$/g, '')
    			};
    		    		
			if (_XAM.args.isEdit && file.status == 'Complete') {
				if ($(this).hasClass('remove')) {
					// 대기열에 동일 파일명이 있는 경우 삭제 해제 안되도록 처리
					var file_list = $("#fileupload").data('_XAM-fileupload').get_file_list();
					var remove_avail = true;
					$.each(file_list, function(idx, _file) {
						if (_file.status == 'wait' && _file.name == file.name) {
							remove_avail = false;
						}
					});
					if (remove_avail) {
						$(this).removeClass('remove');
					} else {
						alert(_XAM.xamlang.propStr('MSG.INVALID_DUP_FILE'));
					}
				} else {
					if ($(this).find('.download-path').length!=0&&$(this).find('.download-path').html()!='') {
						// 기존에 저장된 파일인 경우
						$(this).addClass('remove');
					} else {
						// 팝업창에서 업로드된 파일인 경우
						deletePost(file); // 서버로 삭제 요청
						
						deleteComplete = true
					}					
				}
				if (!deleteComplete) {$(this).removeClass('click-on');}
			}
			
    		if (typeof OnRemoveBefore == 'function') { 
    			if  (OnRemoveBefore(file, this)) {}
    		}
    	});
    	
    	sel_obj = $('#file_list .click-on');
        sel_obj.find('.btn_cancel').trigger('click');
        if (sel_obj.length == 1){
        	var $prev = sel_obj.prev();
            var $next = sel_obj.next();
            if ($next.hasClass('template-upload') || $next.hasClass('template-download')){
                $next.addClass('click-on');
            }else if ($prev.hasClass('template-upload') || $prev.hasClass('template-download')){
                $prev.addClass('click-on');
            }
        }
        $('#file_list input[type=checkbox]').prop('checked', false);
        return false;
    });
    
    $(document).find("#file_add").on("mouseup",function(e){
        var $tr_obj = $(e.target).closest('tr');
        if ($(e.target).hasClass('btn1') || $(e.target).hasClass('btn')) return false;
        if ($tr_obj.hasClass('template-upload') || $tr_obj.hasClass('template-download')){ 	
        	/*
            if (e.ctrlKey){
                $tr_obj.toggleClass('click-on');
                $tr_obj.find("input[type=checkbox]").prop('checked', true);
            }else{
                $tr_obj.addClass('click-on').siblings('tr').removeClass('click-on');
                $tr_obj.find("input[type=checkbox]").prop('checked', false);
            }
            */
        	$tr_obj.find("input[type=checkbox]").off().on("click", function(e){
        		e.preventDefault();	
            });

        	if ($tr_obj.hasClass('click-on')) {
        		$tr_obj.removeClass('click-on');
        		$tr_obj.find("input[type=checkbox]").prop('checked', false);
        	} else {
        		$tr_obj.addClass('click-on');
        		$tr_obj.find("input[type=checkbox]").prop('checked', true);
        	}
        	/*
        	$tr_obj.toggleClass('click-on');
        	$tr_obj.find("input[type=checkbox]").off().on("click", function(){
        		var _self = $(this);
            	if (_self.is(':checked')) {
            		_self.closest("tr").addClass('click-on');
            	} else {
            		_self.closest("tr").removeClass('click-on');
            	}    	
            });
            */
        }else{
        	/*
            $('#file_list .template-upload').removeClass('click-on');
            $('#file_list .template-download').removeClass('click-on');
            $('#file_list input[type=checkbox]').prop('checked', false);
            */
        }
    });

    $(document).ready(function () {
    	var _h = (isPopup?'192px':'120px');
    	$("#file_list table").freezeHeader({ 'height': _h, 'resize': '' });
    });
}

function deletePost(file){
    var postForm = {
    		'__Click'				: '0',
    		'deleteFileName'		: file.name,
    		'unid'					: _XAM.args.attachunid,
    		'unique'				: _XAM.args.attachunique 	
    };
	$.ajax({
        url: _XAM.args.save_path,
        type: "post",
        data: postForm,
        async: false,
        success: function (response) {

        },
        error: function(jqXHR, textStatus, errorThrown) {

        }
    });	
}
function end_period(){
    var date = new Date(); 
    date.setDate(date.getDate() + parseInt(_XAM.env.limit_period));
    var nd = new Date(date);

    return "~ " + (nd.getMonth()+1) + "." + nd.getDate();
}
function check_ext(filename){
    var eext = filename.lastIndexOf(".");
    var file_ext = filename.substr(parseInt(eext)+1).toLowerCase();

    var icon_ext = "";
    if (file_ext == "doc" || file_ext == "docx"){
        icon_ext = "doc";
    }else if (file_ext == "xls" || file_ext == "xlsx"){
        icon_ext = "xls"
    }else if (file_ext == "ppt" || file_ext == "pptx"){
        icon_ext = "ppt"
    }else if (file_ext == "html" || file_ext == "htm"){
        icon_ext = "html"
    }else if (file_ext == "zip" || file_ext == "jar" || file_ext == "rar"){
        icon_ext = "zip"
    }else if (file_ext == "jpg" || file_ext == "gif" || file_ext == "bmp" || file_ext == "png"){
        icon_ext = "img";
    }else if (file_ext == "exe" || file_ext == "hwp" || file_ext == "pdf" || file_ext == "txt"){
        icon_ext = file_ext;
    }else{
        icon_ext = "etc";
    }

    return icon_ext;
}


/* 이하 Table Header 고정 스크립트 */
/* ------------------------------------------------------------------------
Class: freezeHeader
Use:freeze header row in html table
Example 1:  $('#tableid').freezeHeader();
Example 2:  $("#tableid").freezeHeader({ 'height': '300px' });
Example 3:  $("table").freezeHeader();
Example 4:  $(".table2").freezeHeader();
Example 5:  $("#tableid").freezeHeader({ 'offset': '50px' });
Author(s): Laerte Mercier Junior, Larry A. Hendrix
Version: 1.0.8
-------------------------------------------------------------------------*/
(function ($) {
    var TABLE_ID = 0;

    $.fn.resizeHeader = function (obj_id, elem_width) {
		$('#hdScroll' + obj_id + ' #hd' + obj_id).css('width', elem_width+'px');
		$('#hdScroll' + obj_id + ' #hd' + obj_id + ' table').css('width', elem_width+'px');
		
		if (parent.window.innerWidth >= 1400) { // 1400 이상이면 화면이 분할되어 첨부영역이 좁아지므로 프로그레스바 너비 조정
			$('#file_list table colgroup col').eq(3).attr('width', '90px')
		} else {
			$('#file_list table colgroup col').eq(3).attr('width', '150px')
		}
    }
    
    $.fn.freezeHeader = function (params) {
        var copiedHeader = false;
        function freezeHeader(elem) {
            var idObj = elem.attr('id') || ('tbl-' + (++TABLE_ID));
            $.idObj = idObj;
            if (elem.length > 0 && elem[0].tagName.toLowerCase() == "table") {

                var obj = {
                    id: idObj,
                    grid: elem,
                    container: null,
                    header: null,
                    divScroll: null,
                    openDivScroll: null,
                    closeDivScroll: null,
                    scroller: null
                };

                if (params && params.height !== undefined) {
                    obj.divScroll = '<div id="hdScroll' + obj.id + '" style="height: ' + params.height + '; overflow-y: auto;">';
                    obj.closeDivScroll = '</div>';
                }

                obj.header = obj.grid.find('thead');

                if (params && params.height !== undefined) {
                    if ($('#hdScroll' + obj.id).length == 0) {
                        obj.grid.wrapAll(obj.divScroll);
                    }
                }

                obj.scroller = params && params.height !== undefined
                   ? $('#hdScroll' + obj.id)
                   : $(window);

                if (params && params.scrollListenerEl !== undefined) {
                    obj.scroller = params.scrollListenerEl;
                }
                obj.scroller.on('scroll', function () {
                    if ($('#hd' + obj.id).length == 0) {
                        obj.grid.before('<div id="hd' + obj.id + '"></div>');
                    }

                    obj.container = $('#hd' + obj.id);

                    if (obj.header.offset() != null) {
                        if (limiteAlcancado(obj, params)) {
                            elem.trigger("freeze:on");
                            if (!copiedHeader) {
                                cloneHeaderRow(obj);
                                copiedHeader = true;
                            }
                        }
                        else {

                            if (($(document).scrollTop() > obj.header.offset().top)) {
                            	obj.container.css("position", "absolute");
                                obj.container.css("top", (obj.grid.find("tr:last").offset().top - obj.header.height()) + "px");
                                obj.container.css("top", "0px");
                            }
                            else {
                                elem.trigger("freeze:off");
                                obj.container.css("visibility", "hidden");
                                obj.container.css("top", "0px");
                                obj.container.width(0);
                            }
                            copiedHeader = false;
                        }
                    }
                    
                    if (!$.support.dragdrop){
                    	obj.container.css("top", this.scrollTop + "px");	
                    }
                    
                });
                
            	$(window).resize(function () {
            		$(this).resizeHeader(obj.id, elem.width())
            		/*
            		$('#hdScroll' + obj.id + ' #hd' + obj.id).css('width', elem.width()+'px');
            		$('#hdScroll' + obj.id + ' #hd' + obj.id + ' table').css('width', elem.width()+'px');
            		*/
                })                
            }
        }

        function limiteAlcancado(obj, params) {
            if (params && (params.height !== undefined || params.scrollListenerEl !== undefined)) {
                return (obj.header.offset().top <= obj.scroller.offset().top);
            }
            else {
                var top = obj.header.offset().top;
                if (params) {
                    if (params.offset !== undefined) {
                       top -= parseInt(params.offset.replace('px',''),10);
                    }
                }

                var gridHeight = (obj.grid.height() - obj.header.height() - obj.grid.find("tr:last").height()) + obj.header.offset().top;
                return ($(document).scrollTop() > top && $(document).scrollTop() < gridHeight);
            }
        }

        function cloneHeaderRow(obj) {
            obj.container.html('');
            obj.container.val('');
            var tabela = $('<table style="margin: 0 0;"></table>');

            var atributos = obj.grid.prop("attributes");

            $.each(atributos, function () {
                if (this.name != "id" && this.value != "null" && this.value != "") {
                    tabela.attr(this.name, this.value);
                }
            });

            var clone = obj.header.clone(true);
            clone.appendTo(tabela);

            obj.container.append(tabela);
            obj.container.width(obj.header.width());
            obj.container.height(obj.header.height);
            obj.container.find('th').each(function (index) {
                var cellWidth = obj.grid.find('th').eq(index).width();
                if (cellWidth<=0) cellWidth = obj.grid.find('th').eq(index)[0].clientWidth;
                $(this).css('width', cellWidth);
/*
                console.log("th : " + obj.grid.find('th').eq(index).width())
                console.log("th offsetWidth : " + obj.grid.find('th').eq(index)[0].offsetWidth)
                console.log("th clientWidth : " + obj.grid.find('th').eq(index)[0].clientWidth)
*/
            });

            obj.container.css("visibility", "visible");

            if (params && params.height !== undefined) {
                if(params.offset !== undefined){
                    obj.container.css("top", obj.scroller.offset().top + (params.offset.replace("px","") * 1) + "px");
                }
                else
                {
                    obj.container.css("top", obj.scroller.offset().top + "px");
                }
                
                obj.container.css("position", "absolute");
                obj.container.css("z-index", "999");
                
            } else if (params && params.scrollListenerEl!== undefined) { 
                obj.container.css("top", obj.scroller.find("thead > tr").innerHeight() + "px");
                obj.container.css("position", "absolute");
                //obj.container.css("z-index", "2");
            } else if (params && params.offset !== undefined) {
                obj.container.css("top", params.offset);
                obj.container.css("position", "fixed");
            } else {
                obj.container.css("top", "0px");
                obj.container.css("position", "fixed");
            }

        }

        return this.each(function (i, e) {
            freezeHeader($(e));
        });

    };
})(jQuery);

