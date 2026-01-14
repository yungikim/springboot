XAM.g = {
    setConfig : function(xml, id){ this[id] = $(xml).find(id).text(); },
    setUploadURLKey : function(uniquekey,__obj){
        if (!uniquekey) return false;
        if (__obj.env.normal_upload_url.indexOf(uniquekey) > 0) return false;
        if (uniquekey.substring(0,1) != "/") uniquekey = "/" + uniquekey;
        if (uniquekey.substring(uniquekey.length-1) == "/") uniquekey = uniquekey.substring(0, uniquekey.length-1); 
        __obj.env.normal_upload_url = __obj.env.normal_upload_url + uniquekey;
        return true;
    },
    uploadComplete : function(fileinfo){  $.each(fileinfo, function(e,v){ console.log("file upload path :", v); }); },
    setEnvVal : function(_set, param, obj){
        obj.env = {};
        if(_set.find("multi_upload_url").attr("use") === "true"){
            if(_set.find("multi_upload_url url").length == 0){
                alert("xml 설정이 잘못되었습니다. config폴더의 xml 파일을 확인하세요.");
                return; 
            }
            obj.env.normal_upload_url = _set.find("multi_upload_url url")[Math.floor(Math.random() * _set.find("multi_upload_url url").length)].textContent;
        } else {
            obj.env.normal_upload_url = _set.find("normal_upload_url").text();
        }
        if(_set.find("large_file_upload").length > 0 && _set.find("large_file_upload").attr("use").toLowerCase() == "true"){
            if(param.l_save_path){
                obj.env.large_file_upload_url = _set.find("large_file_upload large_file_upload_url").text() + param.l_save_path;
            } else {
                alert("대용량 기능을 사용하기 위해서는 l_save_path 파라메터가 반드시 필요합니다.");
                return;
            }
            if(!param.OnLargeUploadComplete){ 
                alert("대용량 기능을 사용하기 위해서는 OnLargeUploadComplete 함수가 반드시 필요합니다."); 
                return; 
            }
        }
        this.setFileInfo(_set, param, obj);
    },
    getRandomChar : function() { 
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) +
                        Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    },
	changeClass : function(_doc) { 
		_doc.find('.file_btn').css({'position':'relative', 'right':'0px', 'width':'100%'});
		_doc.find('#btn_mypc').css({'width':'70px', 'margin-right':'4px'})
		_doc.find('#btn_delete').css({'width':'70px', 'margin-right':'4px'})
		_doc.find('.btn-top-file').css({'width':'28px', 'height':'28px', 'background-position':'-95px -1px'});
		_doc.find('.btn-bottom-file').css({'width':'28px', 'height':'28px', 'background-position':'-95px -31px'});
		_doc.find('#file_add').css({'padding-right':'0'});
		_doc.find('.file_sizedisplay').removeClass('file_sizedisplay').addClass('file_sizedisplay_popup');
		_doc.find('#file_list').css({'height':'194px', 'clear':'both'});		
	},
    createIframe: function(a,o){
    	var _self = this;
        //var _o = o.env;
        var ifr = $('<iframe/>', {
            id: _self.iframe_id,
            src: (o.env.installed_path && o.env.installed_path != "" ? o.env.installed_path : basePath ) + "/XAM_upload.html?Open&ver=2.0.0.35&domain=" + (o.env.site_domain != "" ?  o.env.site_domain : ""),
            width: (!a.width ? "100%" : a.width),
            height: (!a.height ? "100%" : a.height),
            frameborder: "0",
            save_path: a.save_path ? a.save_path : "",
            l_save_path: a.l_save_path ? a.l_save_path : ""                  
        });

        ifr.get(0).onload = function() {        
        	/* iNotes에서 XAM 구동되도록 처리 */ 
        	//var b = $("#" + $("#" + a.disp_id + " iframe")[0].id)[0].contentWindow;
            if (a.parent_ele) {
            	var b = $(a.parent_ele).find('iframe')[0].contentWindow;
            	//var b = $('#' + $('div[id="' + a.disp_id + '"] iframe')[0].id)[0].contentWindow;            	
            } else {
            	var b = $('#' + $('div[id="' + a.disp_id + '"] iframe')[0].id)[0].contentWindow;
            }
            
            // 버튼 처리
    		var ifr_doc = $(b.document);
        	if (o.args.isPopup) {
        		_self.changeClass(ifr_doc);
        	}
        	if (a.isEdit) {
        		ifr_doc.find("#btn_mypc").show(); 
        		//ifr_doc.find("#file_select").closest('div').show();
        		if(!_self.getIESupport()) {
            		ifr_doc.find("#btn_delete").show(); 
            		ifr_doc.find("#up").show(); 
            		ifr_doc.find("#down").show(); 
        		}    
				ifr_doc.find("#btn_preview").hide();
        	} else {
        		ifr_doc.find("#btn_zip_down").show();
				ifr_doc.find("#btn_preview").show();
        	}
        	
        	if (a.deleteCallback!=undefined&&a.deleteCallback!='') {
				if (a.deleteCallback!='read_v3') {
					ifr_doc.find("#btn_delete_read").show().on("click", function(event){
						var _fn = a.deleteCallback;
						var tempFunction = new Function("Arg1", _fn + "(Arg1)");
						tempFunction(event);;
					});
				}
        	}
        	
        	if (a.historyCallback!=undefined&&a.historyCallback!='') {
        		ifr_doc.find("#btn_history_read").show().on("click", function(event){
        			var _fn = a.historyCallback;
        			var tempFunction = new Function("Arg1", _fn + "(Arg1)");
        			tempFunction(event);;   			
        		});
        	}
        	                        
        	if(a.OnMoveBefore){  b.OnMoveBefore = a.OnMoveBefore; }
        	if(a.OnRemoveBefore){  b.OnRemoveBefore = a.OnRemoveBefore; }
        	if(a.OnAttachBefore){  b.OnAttachBefore = a.OnAttachBefore; }
            if(a.OnAttachComplete){ b.OnAttachComplete = a.OnAttachComplete; }
            if(a.OnDeleteBefore){  b.OnDeleteBefore = a.OnDeleteBefore; }
            if(a.OnDeleteComplete){ b.OnDeleteComplete = a.OnDeleteComplete; }
            if(a.OnInitCompleted){ b.OnInitCompleted = a.OnInitCompleted; }
            if(a.OnError){ b.OnError = a.OnError; }
            if(a.OnLargeUploadComplete){ b.OnLargeUploadComplete = a.OnLargeUploadComplete; }
            if(a.OnLargeUploadEachComplete){ b.OnLargeUploadEachComplete = a.OnLargeUploadEachComplete; }
            if(a.OnUploadBefore){  b.OnUploadBefore = a.OnUploadBefore; }
            if(a.OnUploadComplete){ b.OnUploadComplete = a.OnUploadComplete; }
            //b.iframeInit(_o);
            b.iframeInit(o);
        }
        /* iNotes에서 XAM 구동되도록 처리 */    
        //$(document).ready(function(){ $("#" + a.disp_id).append(ifr); });
        if (a.parent_ele) {
        	$(a.parent_ele).append(ifr);
        } else {
            $(document).ready(function(){
            	$('div[id="' + a.disp_id + '"]').append(ifr);
            });        	
        }
    },
    upload : function(){
        var child = $('#' + this.iframe_id).get(0).contentWindow;
        if(child.$(".label-danger").length > 0){ 
            alert(child._XAM.xamlang.propStr("error_file_exists")); 
            return false;
        };
        if (child.$('.template-upload').length > 0){ 
        	// 업로드 Bar 색상 변경
        	child.$(".progress").css({'background':'#b9c4d3'});
        	
            child.$("#submit_start").trigger("click"); 
            return true;
        } else {
            //alert(child._XAM.xamlang.propStr("no_file_exists"));
        	return false;
        }
    },
    clickAddButton : function() {
        var _fw = $('#' + this.iframe_id)[0].contentWindow;
    	try{
            if (_fw&&_fw.$('#btn_mypc').length!=0) {_fw.$('#btn_mypc').trigger('click');
            } else {
            	setTimeout(function(){XAM.g.clickAddButton()}, 500);
            }
        } catch (e) {
        	setTimeout(function(){XAM.g.clickAddButton()}, 1000);
        }

    },
    removeBigFile : function() {
        var _fw = $("#" + this.iframe_id)[0].contentWindow;
        var _files = _fw.$("#"+_fw._XAM.args.filelistID + " tr");
        $.each(_files, function(i) {
        	if ($(this).find(".btn_bigfile_"+_fw._XAM.env.lang).length!=0) {
        		$(this).remove();
        	}
        });         
    },
    getRemovedBigFile : function() {
    	var removedList = [];
        var _fw = $("#" + this.iframe_id)[0].contentWindow;
        var _files = _fw.$("#"+_fw._XAM.args.filelistID + " tr");
        $.each(_files, function(i) {
        	var bi_btn = $(this).find(".btn_bigfile_"+_fw._XAM.env.lang);
        	if (bi_btn.length!=0&&bi_btn.closest('tr').hasClass('remove')) {
        		removedList.push(bi_btn.closest('tr').find('p.name').text());
        	}
        });        
        return removedList;
    },    
    getBigFile : function() {
    	var _fileList = [];
        var _fw = $("#" + this.iframe_id)[0].contentWindow;
        var _files = _fw.$("#"+_fw._XAM.args.filelistID + " tr");
        $.each(_files, function(i) {
        	var bi_btn = $(this).find(".btn_bigfile_"+_fw._XAM.env.lang);
        	if (bi_btn.length!=0) {
        		_fileList.push(bi_btn.closest('tr').find('p.name').text());
        	}
        });        
        return _fileList;
    },     
    getSelectedItem : function(sType) {
    	var _fileList = [];
        var _fw = $("#" + this.iframe_id)[0].contentWindow;
        var _files = _fw.$("#"+_fw._XAM.args.filelistID + " tr");
        $.each(_files, function(i) {
        	var check_box = $(this).find("input[type=checkbox]");
        	if (check_box.length!=0&&check_box.is(':checked')) {
        		var sItem;
        		switch (sType) {
        			case 'name':
        				sItem = check_box.closest('tr').find('.finfo .real-name').text();
        				break;
        			case 'index':
        				sItem = i.toString();
        				break;
        			default : 
        				sItem = check_box.closest('tr').find('.finfo .real-name').text();
        				break;
        		}
        		_fileList.push(sItem);
        	}
        });        
        return _fileList;
    },     
    getFileStatus : function(){
    	var ret_val = 'done';
        var _fw = $("#" + this.iframe_id)[0].contentWindow;
        var _files = _fw.$("#"+_fw._XAM.args.filelistID + " div .progress-bar");
        
        $.each(_files, function(i) {
        	if ($(this).width()!=0) {
        		ret_val = 'wait';
        	}
        }); 
        return ret_val
    },
    setFileList : function(files, isEdit){
        var _fw = $("#" + this.iframe_id)[0].contentWindow;
        var _fu = _fw.$("#fileupload").data('_XAM-fileupload');
        var _f = null;
        
        _fw.$("#"+_fw._XAM.args.filelistID).html("");

        if(isEdit){
        	_f = _fu._renderDownload(files);
        } else {
        	_f = _fu._renderRead(files);_fu.setDownDisplay(true);
        }

        for(var x=0; x<_f.length; x++) {
            //_fw.$("#"+_fw._XAM.args.filelistID).append(_f[x].outerHTML);
        	_fw.$("#"+_fw._XAM.args.filelistID).append(isEdit?_f[x].outerHTML:_f[x].outerHTML.replace(/&amp;/g, '&'));

            /*
            _fw.$("#"+_fw._XAM.args.filelistID).find("tr").get(x).innerHTML = _fw.$("#"+_fw._XAM.args.filelistID).find("tr").get(x).innerHTML +
                "<div style='display:none;' class='finfo'>" +
                    "<span class='real-size'>" + files[x].size + "</span>" +
                    "<span class='real-name'>" + files[x].origname + "</span>" +
                    "<span class='content-type'>" + files[x].type + "</span>" +
                    "<span class='download-path'>" + files[x].downloadpath.slice(0,files[x].downloadpath.lastIndexOf("/")) + "/" +
                    encodeURIComponent(files[x].origname) + "</span></div>"
            */
            var last_td = _fw.$("#"+_fw._XAM.args.filelistID).find("tr:eq("+x+")").find('td:first-child');
            $("<div>", { "style": 'display:none;',"class":"finfo" }).appendTo(last_td).append(
                "<span class='real-size'>" + files[x].size + "</span>" +
                //"<span class='real-name'>" + files[x].origname + "</span>" +
                "<span class='real-name'>" + (isEdit?files[x].origname:files[x].origname.replace(/&/g, '&amp;')) + "</span>" +
                "<span class='content-type'>" + files[x].type + "</span>" +
                "<span class='download-path'>" + files[x].downloadpath.slice(0,files[x].downloadpath.lastIndexOf("/")) + "/" +
                encodeURIComponent(files[x].origname) + "</span>"
            );            
            //console.log(files[x].downloadpath)
        }
        _fw.$("#"+_fw._XAM.args.filelistID).find("tr").addClass("in");
        
        if(isEdit == false){
            _fw.$("#"+_fw._XAM.args.filelistID).find('input[type=checkbox]').off("click").on("click", function(){
            	var $tr_obj = $(this).closest('tr');
            	if ($tr_obj.hasClass('template-download')) {
                	if ($tr_obj.hasClass('click-on')) {
                		$tr_obj.removeClass('click-on');
                	} else {
                		$tr_obj.addClass('click-on');
                	}
            	}
            });        
        }

        _fu.draw_file_size();
       
    },
    setFileInfo : function(xml,param,_obj){
        //if(!param.disp_id || param.disp_id == ""){ alert("No disp_id!!"); return;}
        if(!this.check_config_xml(xml)){ alert("xml 설정이 잘못되었습니다. config폴더의 xml 파일을 확인하세요."); return; }

        if(xml.find("attach_ext_policy attach_prevent_ext_use").text().replace(/ /g, '').toLowerCase() == "true"){
            _obj.env.attach_prevent_ext_use = true;
            _obj.env.attach_prevent_ext = xml.find("attach_ext_policy attach_prevent_ext").text().replace(/ /g,'').toLowerCase();
        } else {
            _obj.env.attach_prevent_ext_use = false;
        }

        if(xml.find("attach_ext_policy attach_allow_ext_use").text().replace(/ /g, '').toLowerCase() == "true"){
            _obj.env.attach_allow_ext_use = true;
            _obj.env.attach_allow_ext = xml.find("attach_ext_policy attach_allow_ext").text().replace(/ /g,'').toLowerCase();
        } else {
            _obj.env.attach_allow_ext_use = false;
        }
        
        if(xml.find("chunk_upload").length > 0){
            if(xml.find("chunk_upload").attr("use").replace(/ /g, '').toLowerCase() == "true"){
                _obj.env.is_chunk_upload = true;
                if(!/^[0-9]*$/.test(_xml.find("chunk_upload chunk_size").text())){ alert("XML Load Failed"); return; }
                _obj.env.chunk_size = xml.find("chunk_upload chunk_size").text().replace(/ /g, '');
            } else {
                _obj.env.is_chunk_upload = false;
            }
        }

        if(xml.find("large_file_upload").length > 0){
            if(xml.find("large_file_upload").attr("use").replace(/ /g, '').toLowerCase() == "true"){
                _obj.env.is_large_file_upload = true;
                _obj.env.large_file_upload_url = xml.find("large_file_upload_url").text().replace(/ /g, '');
                _obj.env.large_file_size = xml.find("large_file_size").text().replace(/ /g, '');
                _obj.env.large_file_limit = xml.find("large_file_limit").text().replace(/ /g, '');
                _obj.env.large_file_limit_count = xml.find("large_file_limit_count").text().replace(/ /g, '');
                
                if(xml.find("large_file_upload limit_period").attr("use").replace(/ /g, '').toLowerCase() == "true"){  
                    _obj.env.is_limit_period = true;
                    _obj.env.limit_period = xml.find("large_file_upload limit_period").text().replace(/ /g, ''); 
                } else {
                    _obj.env.is_limit_period = false;
                }
            } else {
                _obj.env.is_large_file_upload = false;
            }
        }
        
        _obj.env.file_size_max_mb = xml.find("attach_ext_policy").attr("file_size_max_mb").replace(/ /g, '');
        _obj.env.attach_limit_size = xml.find("attach_ext_policy").attr("attach_limit_size").replace(/ /g, '');
        _obj.env.attach_limit_count = xml.find("attach_ext_policy").attr("attach_limit_count").replace(/ /g, '');
        _obj.env.lang = xml.find("language").text().replace(/ /g, '').toLowerCase();
        _obj.env.site_domain = xml.find("site_domain").text().replace(/ /g, '');

        if(xml.find("installed_path").length > 0){
            if(xml.find("installed_path").attr("absolute") == "1" && xml.find("installed_path").text().replace(/ /g, '') != ""){
                _obj.env.installed_path = this.urlTrim(xml.find("installed_path").text().replace(/ /g, ''));
            } else {
                _obj.env.installed_path = "./";
            }            
        } 

        try{
            if(_obj.env.site_domain != ""){ document.domain = _obj.env.site_domain; }
        } catch (e) {
            alert("Domain Setting Failed.\n plz Check config xml file.");
            return;
        }
        /* IE10 이하에서 XAM 구동되도록 처리 */    
        //if(this.getIESupport()){ alert("AM not working under IE10"); return; }        
        //this.setUploadURLKey(param.save_path, _obj);
    },
    check_config_xml : function(_xml){
        if(_xml.find("site_domain").length == 0){ return false; }
        //if(_xml.find("normal_upload_url").length == 0 || _xml.find("normal_upload_url").text() == ""){ return false; }
        if(_xml.find("normal_upload_url").length == 0){ return false; }
        if(_xml.find("language").length == 0 || _xml.find("language").text() == ""){ return false; }
        
        if(_xml.find("attach_ext_policy").length == 0){ return false; }
        if(!/^[0-9]*$/.test(_xml.find("attach_ext_policy").attr("file_size_max_mb")) ||
                !/^[0-9]*$/.test(_xml.find("attach_ext_policy").attr("attach_limit_size")) ||
                !/^[0-9]*$/.test(_xml.find("attach_ext_policy").attr("attach_limit_count"))){
                return false;
        }
        if(_xml.find("attach_ext_policy attach_allow_ext_use").length == 0 ||
                _xml.find("attach_ext_policy attach_allow_ext").length == 0 ||
                _xml.find("attach_ext_policy attach_prevent_ext_use").length == 0 ||
                _xml.find("attach_ext_policy attach_prevent_ext").length == 0){
            return false;
        }
        if(_xml.find("large_file_upload").length != 0){
            if(_xml.find("large_file_upload").attr("use").replace(/ /g,"").toLowerCase() == "true"){
            	/*
                if(_xml.find("large_file_upload_url").text() == "" ||
                    !/^[0-9]*$/.test(_xml.find("large_file_limit").text()) ||
                    !/^[0-9]*$/.test(_xml.find("large_file_size").text())){
                    return false;
                }*/
            	if(!/^[0-9]*$/.test(_xml.find("large_file_limit").text()) ||
                        !/^[0-9]*$/.test(_xml.find("large_file_size").text())){
                        return false;
                }
            }
            if(_xml.find("large_file_upload limit_period").attr("use").replace(/ /g,"").toLowerCase() == "true"){
                if(!/^[0-9]*$/.test(_xml.find("large_file_upload limit_period").text())){
                    return false;
                }
            }
        }
        return true;
    },
    urlTrim : function(url){ return (url.slice(0,1) == "/" ? "" : "/") + url + (url.slice(url.length-1,url.length) == "/" ? "" : "/"); },
    addScript : function(url, callback){ $.when.apply(null, [$.getScript(scriptBasePath + url)]).done(callback); },
    setIfrmHeight : function(height){ document.getElementById(this.iframe_id).style.height = (height + 44) + "px"; },
    getUploadURL : function(){  return document.getElementById(this.iframe_id).getAttribute("save_path"); },
    getFileList : function(){  return document.getElementById(this.iframe_id).contentWindow.$("#fileupload").data('_XAM-fileupload').get_file_list(); },
    getFileCount : function(){  return document.getElementById(this.iframe_id).contentWindow.$("#fileupload").data('_XAM-fileupload').get_file_count(); },
    getAllCount : function(){  return document.getElementById(this.iframe_id).contentWindow.$("#fileupload").data('_XAM-fileupload').get_all_count(); },
    getAllSize : function(){  return document.getElementById(this.iframe_id).contentWindow.$("#fileupload").data('_XAM-fileupload').get_all_size(); },
    getFilesHeight : function(id){ return document.getElementById(this.iframe_id).contentWindow.$.find("#file_list")[0].offsetHeight; }, 
    getIESupport : function(){ return typeof document === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent) }, 
    listClear : function(){
		$("#"+this.iframe_id)[0].contentWindow.$("#files").children().remove(); 
		$("#"+this.iframe_id)[0].contentWindow.$("#fileupload").data('_XAM-fileupload').draw_file_size();
	},    
    destroy : function(){
    	//document.getElementById(this.iframe_id).remove();
    	var _iframe = document.getElementById(this.iframe_id);
    	_iframe.parentNode.removeChild(_iframe);
    }
};