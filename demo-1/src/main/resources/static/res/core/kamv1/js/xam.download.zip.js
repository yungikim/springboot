var xamSaveZip = xamSaveZip || (function(xam_window) {
    "use strict";
    //if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)){ alert("IE10 미만 버전의 브라우저는 지원하지 않습니다."); return; }
    
    try{
    	var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    }catch(e){
    	var save_link = document.createElement("http://www.w3.org/1999/xhtml", "a");
    }
    var can_use_save_link = "download" in save_link
    
    var xam_doc = xam_window.document
        , get_URL = function(){ return xam_window.URL || xam_window.webkitURL || xam_window; }
    	/*
    	, save_link = xam_doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
        , can_use_save_link = "download" in save_link
    	*/
        , click = function(node){ var event = new MouseEvent("click"); node.dispatchEvent(event); }
        , is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
        , webkit_req_fs = xam_window.webkitRequestFileSystem
        , req_fs = xam_window.requestFileSystem || webkit_req_fs || xam_window.mozRequestFileSystem
        , throw_outside = function(ex){(xam_window.setImmediate || xam_window.setTimeout)(function(){ throw ex; }, 0);}
        , force_saveable_type = "application/octet-stream"
        , fs_min_size = 0
        , arbitrary_revoke_timeout = 1000 * 40
        , revoke = function(file) {
            var revoker = function(){ if(typeof file === "string"){ get_URL().revokeObjectURL(file); } else { //file.remove(); 
            }};
            setTimeout(revoker, arbitrary_revoke_timeout);
        }
        , dispatch = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throw_outside(ex);
                    }
                }
            }
        }
        , auto_bom = function(blob) {
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
            }
            return blob;
        }
        , FileSaver = function(blob, name, no_auto_bom) {
            if(!no_auto_bom){ blob = auto_bom(blob); }
            var filesaver = this, type = blob.type, blob_changed = false, object_url, target_view
                , dispatch_all = function(){ dispatch(filesaver, "writestart progress write writeend".split(" ")); }
                , fs_error = function() {
                    if (target_view && is_safari && typeof FileReader !== "undefined") {
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            var base64Data = reader.result;
                            target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        };
                        reader.readAsDataURL(blob);
                        filesaver.readyState = filesaver.INIT;
                        return;
                    }
                    if(blob_changed || !object_url){ object_url = get_URL().createObjectURL(blob); }
                    if(target_view){
                        target_view.location.href = object_url;
                    } else {
                        var new_tab = xam_window.open(object_url, "_blank");
                        if (new_tab === undefined && is_safari) {
                            xam_window.location.href = object_url;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                }
                , abortable = function(func) {
                    return function() {
                        if (filesaver.readyState !== filesaver.DONE) {
                            return func.apply(this, arguments);
                        }
                    };
            }, create_if_not_found = {create: true, exclusive: false}, slice;
            filesaver.readyState = filesaver.INIT;
            if(!name){ name = "download"; }
            if(can_use_save_link){
                object_url = get_URL().createObjectURL(blob);
                setTimeout(function() {
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    dispatch_all();
                    revoke(object_url);
                    filesaver.readyState = filesaver.DONE;
                });
                return;
            }
            if (xam_window.chrome && type && type !== force_saveable_type) {
                slice = blob.slice || blob.webkitSlice;
                blob = slice.call(blob, 0, blob.size, force_saveable_type);
                blob_changed = true;
            }
//          if(webkit_req_fs && name !== "download") { name += ".download"; }
            if(type === force_saveable_type || webkit_req_fs){ target_view = xam_window; }
            if(!req_fs){ fs_error(); return; }
            fs_min_size += blob.size;
            req_fs(xam_window.TEMPORARY, fs_min_size, abortable(function(fs) {
                fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
                    var save = function() {
                        dir.getFile(name, create_if_not_found, abortable(function(file) {
                            file.createWriter(abortable(function(writer) {
                                writer.onwriteend = function(event) {
                                    target_view.location.href = file.toURL();
                                    filesaver.readyState = filesaver.DONE;
                                    dispatch(filesaver, "writeend", event);
                                    revoke(file);
                                };
                                writer.onerror = function() {
                                    var error = writer.error;
                                    if (error.code !== error.ABORT_ERR) {
                                        fs_error();
                                    }
                                };
                                "writestart progress write abort".split(" ").forEach(function(event) {
                                    writer["on" + event] = filesaver["on" + event];
                                });
                                writer.write(blob);
                                filesaver.abort = function() {
                                    writer.abort();
                                    filesaver.readyState = filesaver.DONE;
                                };
                                filesaver.readyState = filesaver.WRITING;
                            }), fs_error);
                        }), fs_error);
                    };
                    dir.getFile(name, {create: false}, abortable(function(file){ 
//                      file.remove();
                        save(); 
                    }), abortable(function(ex) { 
                        if(ex.name == "NotFoundError") { save(); } else { fs_error(); }
                    }));
                }), fs_error);
            }), fs_error);
        }
        , FS_proto = FileSaver.prototype
        , xamSaveZip = function(blob, name, no_auto_bom){ return new FileSaver(blob, name, no_auto_bom); }
    ;
    
    if (typeof navigator !== "undefined" && navigator.msSaveBlob) {
        return function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            return navigator.msSaveBlob(blob, name || "download");
        };
    }

    FS_proto.abort = function() {
        var filesaver = this;
        filesaver.readyState = filesaver.DONE;
        dispatch(filesaver, "abort");
    };
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;
    FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;

    return xamSaveZip;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content ));
if (typeof module !== "undefined" && module.exports){ module.exports.xamSaveZip = xamSaveZip;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)){ define([], function(){ return xamSaveZip; });}
xamSaveZip.options = null;
xamSaveZip.zip = null;
xamSaveZip._success = function(error,fname,file){
    if(error){ alert("Error!"); return null; }
    //var csvBinary = windows1252.encode(file);
    //xamSaveZip.zip.file(fname.trim(), csvBinary, {binary: false });
    xamSaveZip.zip.file(fname.replace(/^\s+|\s+$/g, ''), file, {binary: true });
    return fname;
}
xamSaveZip.getFile = function(path, fname, size, idx, callback){
    try {
        var xhr = (window.ActiveXObject ? function(){ return new window.XMLHttpRequest() || new window.ActiveXObject("Microsoft.XMLHTTP") } : new window.XMLHttpRequest());
        xhr.open('GET', path, true);
        if ("responseType" in xhr){ xhr.responseType = "arraybuffer"; }
        xhr.addEventListener("progress", function(e){
        	/*
            if(e.lengthComputable) {
                var _n = parent.document.getElementById(encodeURIComponent(fname + "_" + idx));
                setTimeout(function(){
                    _n.style.width = Math.ceil((e.loaded / e.total) * 100) + "%"
                },50);
                if(e.loaded == e.total){ 
                    setTimeout(function(){
                        _n.parentElement.parentElement.nextElementSibling.innerHTML = "<img src='xam/img/ico_down_ok.png' border='0' width='20px' height='20px' style='margin-bottom:-3px;'>&nbsp;&nbsp;OK";
                    }, 350)
                }
            } else {

            }
            */
        	size = parseInt(size);
        	var _n = parent.document.getElementById(encodeURIComponent(fname + "_" + idx));
            setTimeout(function(){
                _n.style.width = Math.ceil((e.loaded / size) * 100) + "%"
            },50);
            if(e.loaded == size){ 
                setTimeout(function(){
                    _n.parentElement.parentElement.nextElementSibling.innerHTML = "<img src='" + parent.basePath + "/img/ico_down_ok.png' border='0' width='20px' height='20px' style='vertical-align:middle'>&nbsp;&nbsp;OK";
                }, 350)
            }
        });
        xhr.onreadystatechange = function(evt) {
            var file, err;
            if(xhr.readyState === 4){
                if(xhr.status === 200 || xhr.status === 0){ 
                    file = null; err = null;
                    try{ file = xhr.response || xhr.responseText; } catch(e) { err = new Error(e); }
                    callback(xamSaveZip._success(err, fname.replace(/^\s+|\s+$/g, ''), file));
                } else {
                    callback(new Error("Ajax error for " + path + " : " + this.status + " " + this.statusText), null, null);
                }
            }
        };
        xhr.send();
    } catch (e) {
        callback(new Error(e), null);
    }
};
xamSaveZip.drawFileList = function(filelist){
    xamSaveZip.filePro = new Array(filelist.length);
    var html = "";

    html += "<table id='file_list_progress' style='padding-top:7px; padding:20px;'>";
    for(var i = 0; i < filelist.length; i++){
        html += "<tr>";
        html +=     "<td style='width:35px;padding:0;'>";
        html +=         "<img src=\"" + parent.basePath + "/img/file_icon/att_" + check_ext(filelist[i].filename) + ".png\" border=0 >";
        html +=     "</td>" 
        html +=     "<td style='padding:0;'><p style='width:260px; margin:0px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;'>" + filelist[i].filename + "</p></td>"
        html +=     "<td style='padding:8px 8px 0 0; width:70px;'>";
        html +=         '<div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">';
        html +=             '<div class="progress-bar progress-bar-success" id=\"' + encodeURIComponent(filelist[i].filename) + "_" + filelist[i].order + '\" style="width:0%;"></div>';
        html +=         '</div>';
        html +=     "</td>";                
        html +=     "<td style='padding;0 width:100px;'>Progress</td>";
        html += "</tr>";
    }
    html += "</table>";
	parent.$.blockUI({ message : html, css: { width: '523px', left:(parent.window.innerWidth - 523) * 1/2 + "px"} }); 
}
xamSaveZip.zipStart = function(filelist){
    xamSaveZip.zip = new JSZip();
    xamSaveZip.filelist = filelist;
    var cnt = 0;
    var len = filelist.length;

    // windows 10이 아니거나 IE11이 아니면 ServerZip 사용 ( Windows 10 이상이고 IE11 이상이면 ClientZip 사용)
    /* Window7 이하의 사용자들에게 UTF-8을 지원하는 상용Zip 프로그램을 사용하도록 가이드 하도록 고객 의사결정이 되었으므로 해당 기능 skip 
    if (!$.support.utf8zip || !$.support.dragdrop) {
    	xamSaveZip.serverZipStart(filelist);
    	return;
    }
    */
    
    if (filelist.length == 1) {
    	var link = document.createElement("a");
    	link.id = 'XAMOneLink'; 
    	if(filelist[0].filename.indexOf('.txt') > -1) {
    		link.target = 'new';
    	}
    	link.href = filelist[0].fileDownUrl;
    	document.body.appendChild(link);
    	link.click();
    	return;
    }
 
    
    xamSaveZip.drawFileList(filelist);
    for(var i=0; i<filelist.length; i++){ xamSaveZip.getFile(filelist[i].fileDownUrl, filelist[i].filename, filelist[i].size, filelist[i].order, function(ret, path, file){ if(ret){ cnt = cnt + 1; } else { alert("Error!!"); return; } }); } 
    var inter = setInterval(function(){
        if(cnt == len){
            xamSaveZip.zip.generateAsync({type:"blob"}).then(function(content){
                clearInterval(inter);
                /*
                var date = new Date();
                var _f = xamSaveZip.filelist[0].filename.replace(xamSaveZip.filelist[0].filename.slice(xamSaveZip.filelist[0].filename.lastIndexOf(".")),"") + " " + (xamSaveZip.filelist.length == 1 ? "" : "(" + (xamSaveZip.filelist.length - 1) + ") ") + date.getFullYear() 
                        + ((date.getMonth()+1 + "").length == 1 ? "0" + (date.getMonth()+1) : date.getMonth()+1)
                        + (String(date.getDate()).length == 1 ? "0" + date.getDate(): String(date.getDate()))
                        + "_" + (String(date.getHours()).length == 1 ? "0" + date.getHours() : String(date.getHours()))
                        + (String(date.getMinutes()).length == 1 ? "0" + date.getMinutes() : String(date.getMinutes()))
                        + (String(date.getSeconds()).length == 1 ? "0" + date.getSeconds() : String(date.getSeconds()))

                xamSaveZip(content, _f.trim()+ ".zip");
                */
                xamSaveZip(content, xamSaveZip.creatZipFileName(filelist) + ".zip");
                cnt = 0;
                setTimeout(function(){ parent.$.unblockUI(); },800);
            }, function(e){
                console.log("SaveZip Error!!");
            });
        }
    }, 200);
};
xamSaveZip.creatZipFileName = function(filelist){
    var date = new Date();
    var zipFileName = '';

    if (parent.zipFileName!=undefined&&parent.zipFileName!='') {
    	zipFileName = parent.zipFileName	
    } else {
    	zipFileName = filelist[0].filename.replace(filelist[0].filename.slice(filelist[0].filename.lastIndexOf(".")),"") + " " + (filelist.length == 1 ? "" : "(" + (filelist.length - 1) + ") ")
    	+ date.getFullYear()
		+ ((date.getMonth()+1 + "").length == 1 ? "0" + (date.getMonth()+1) : date.getMonth()+1)
		+ (String(date.getDate()).length == 1 ? "0" + date.getDate(): String(date.getDate()))
        + "_" + (String(date.getHours()).length == 1 ? "0" + date.getHours() : String(date.getHours()))
        + (String(date.getMinutes()).length == 1 ? "0" + date.getMinutes() : String(date.getMinutes()))
        + (String(date.getSeconds()).length == 1 ? "0" + date.getSeconds() : String(date.getSeconds())).replace(/^\s+|\s+$/g, '');
    }
    
    return zipFileName

}
xamSaveZip.serverZipStart = function(filelist){
    var html = "";
    var encodeList = [];
    encodeList.push(['Unicode', 'UTF-8']);
    encodeList.push(['Chinese', 'GB18030']);
    encodeList.push(['Chinese', 'Big5']);
    encodeList.push(['European', 'ISO-8859-1']);
    encodeList.push(['Japanese', 'Shift-JIS']);
    encodeList.push(['Japanese', 'EUC-JP']);
    encodeList.push(['Korean', 'EUC-KR']);
    encodeList.push(['Thai', 'TIS-620']);
    encodeList.push(['Turkish', 'windows-1254']);
    encodeList.push(['Vietnamese', 'windows-1258']);
    
    html += '<div class="zipcompression-box">';
    html +=   '<h1>' + _XAM.xamlang.propStr("zip_compression_title") + '</h1>';
    html +=   '<a id="closeico" class="zipcompression-closeico">' + _XAM.xamlang.propStr("zip_compression_description1") + '</a>';
    html +=   '<p class="zipcompression-description">' + _XAM.xamlang.propStr("zip_compression_description1") + '</p>';
    html +=   '<p class="zipcompression-description">' + _XAM.xamlang.propStr("zip_compression_description2") + '</p>';
    html +=   '<p class="zipcompression-caution">' + _XAM.xamlang.propStr("zip_compression_description3") + '</span>';
    html +=   '<h2>' + _XAM.xamlang.propStr("zip_compression_label") + '</h2>';
    html +=   '<select id="encodelist" class="zipcompression-selectbox" size="2">';
    for(i=0;i<encodeList.length;i++){
    	html += '<option value="' + encodeList[i][1] + '">' + encodeList[i][0] + ' (' + encodeList[i][1] + ')</option>'; 
    }
    html +=   '</select>';
    html +=   '<div class="zipcompression-bottom">';
    html +=     '<button id="ok">' + _XAM.xamlang.propStr("zip_compression_ok") + '</button>';
    html +=     '<button id="cancel">' + _XAM.xamlang.propStr("zip_compression_cancel") + '</button>';
    html +=   '</div>';
    
    html += '</div>';
    
    var _modalZip = $(html);
    var blockui_w = 600;
    var blockui_h = 432;
    _modalZip.find('#ok').click(function(){   	
    	var _selectedOption = parent.$('.zipcompression-box #encodelist option:selected').val();
    	if (_selectedOption==undefined) {
    		alert(_XAM.xamlang.propStr("zip_compression_noselectencode"));return;
    	}
    	var _self = $(this);
    	var loader_div = '';
    	_self.prop("disabled", true);
    	
    	if ($.support.dragdrop) {
    		loader_div = '<div class="ziploader"></div>';
    	} else {
    		loader_div = '<img src="' + parent.basePath + '/img/loading.gif" width="60px" height="auto">';
    	}
		var loader = $(loader_div).css({'position':'absolute', 'top': ((blockui_h * 1/2) - 30) + 'px', 'left': ((blockui_w * 1/2) - 30) + 'px'})    		    	
    	_modalZip.append(loader);
    	
    	xamSaveZip.serverZipPost(filelist, _selectedOption, _self);

    });
    _modalZip.find('#cancel').click(function(){
    	setTimeout(function(){ parent.$.unblockUI(); }, 0);
    });
    _modalZip.find('#closeico').click(function(){
    	setTimeout(function(){ parent.$.unblockUI(); }, 0);
    });
    
    window_h = top.window.innerHeight || Math.max(top.document.documentElement.clientHeight, top.document.body.clientHeight);
    window_w = top.window.innerWidth || Math.max(top.document.documentElement.clientWidth, top.document.body.clientWidth);

    var blockui_t = (window_h - blockui_h) * 1/2;
    var blockui_l = (window_w - blockui_w) * 1/2;

	parent.$.blockUI({ 
		message : _modalZip,
		css: { 
			width: blockui_w + 'px', height: blockui_h + 'px', top: blockui_t + 'px', left: blockui_l + 'px',
			margin: '0', padding: '0',
			border: '1px solid #AAAAAA', borderTop: '0'
		}
	});
};

xamSaveZip.serverZipPost = function(filelist, _charset, _self){
	
	//  "/devaphqmail/mail/ko1.nsf/0/D9D28E7CB8E76A01492582630009432E/$File/js_2fmain.js"
	var _downurl = filelist[0].fileDownUrl;
	var _downurl_split = _downurl.split('.nsf/');
	var _dbpath = _downurl_split[0] + '.nsf';
	_dbpath = _dbpath.replace(/^http:\/\/([a-z0-9-_\.]*)[\/\?]/i, '');
	_dbpath = (_dbpath.slice(0,1)=='/'?_dbpath.slice(1,_dbpath.length):_dbpath);
	//    0/D9D28E7CB8E76A01492582630009432E/$File/js_2fmain.js
	var _unid = _downurl_split[1].split('/$File')[0].split('/')[1];
	var _url = _XAM.args.serverzip_path;	
    var postForm = {
    		'__Click'		: '0',
    		'dbpath'		: _dbpath,
    		'unid'			: _unid,
      		'filename'		: xamSaveZip.creatZipFileName(filelist),    		
    		'charset'		: _charset
    };
	$.ajax({
        url: _url,
        type: "post",
        data: postForm,
        success: function (response) {
        	if (response.process) {		
        		var a = window.document.createElement('a');
        		a.href = response.downloadurl;
        		a.download = response.filename;
        		document.body.appendChild(a);
        		a.click();
        		document.body.removeChild(a);
            	parent.$('.ziploader').remove();
            	setTimeout(function(){ parent.$.unblockUI(); }, 0);
        	} else {
        		alert(response.message);
            	parent.$('.ziploader').remove();
        		_self.prop("disabled", false);
        	}
        },
        error: function(jqXHR, textStatus, errorThrown) {
           _self.prop("disabled", false);
       		parent.$('.ziploader').remove();
           setTimeout(function(){ parent.$.unblockUI(); }, 0);
        }
    });
};