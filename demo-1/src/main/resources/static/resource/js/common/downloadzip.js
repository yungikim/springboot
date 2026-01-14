var saveZip = saveZip || (function(window) {
    "use strict";
    //if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)){ alert("IE10 미만 버전의 브라우저는 지원하지 않습니다."); return; }
    
    try{
    	var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    }catch(e){
    	var save_link = document.createElement("http://www.w3.org/1999/xhtml", "a");
    }
    var can_use_save_link = "download" in save_link
    
    var xam_doc = window.document
        , get_URL = function(){ return window.URL || window.webkitURL || window; }
        , click = function(node){ var event = new MouseEvent("click"); node.dispatchEvent(event); }
        , is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
        , webkit_req_fs = window.webkitRequestFileSystem
        , req_fs = window.requestFileSystem || webkit_req_fs || window.mozRequestFileSystem
        , throw_outside = function(ex){(window.setImmediate || window.setTimeout)(function(){ throw ex; }, 0);}
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
                        var new_tab = window.open(object_url, "_blank");
                        if (new_tab === undefined && is_safari) {
                            window.location.href = object_url;
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
            if (window.chrome && type && type !== force_saveable_type) {
                slice = blob.slice || blob.webkitSlice;
                blob = slice.call(blob, 0, blob.size, force_saveable_type);
                blob_changed = true;
            }
//          if(webkit_req_fs && name !== "download") { name += ".download"; }
            if(type === force_saveable_type || webkit_req_fs){ target_view = window; }
            if(!req_fs){ fs_error(); return; }
            fs_min_size += blob.size;
            req_fs(window.TEMPORARY, fs_min_size, abortable(function(fs) {
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
        , saveZip = function(blob, name, no_auto_bom){ return new FileSaver(blob, name, no_auto_bom); }
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

    return saveZip;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content ));
if (typeof module !== "undefined" && module.exports){ module.exports.saveZip = saveZip;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)){ define([], function(){ return saveZip; });}
saveZip.options = null;
saveZip.zip = null;
saveZip._success = function(error,fname,file){
    if(error){ alert("Error!"); return null; }
    saveZip.zip.file(fname.replace(/^\s+|\s+$/g, ''), file, {binary: true });
    return fname;
}
saveZip.getFile = function(path, fname, size, idx, callback){
    try {
        var xhr = (window.ActiveXObject ? function(){ return new window.XMLHttpRequest() || new window.ActiveXObject("Microsoft.XMLHTTP") } : new window.XMLHttpRequest());
        xhr.open('GET', path, true);
        if ("responseType" in xhr){ xhr.responseType = "arraybuffer"; }
        xhr.addEventListener("progress", function(e){
        	size = parseInt(size);
        	var _n = document.getElementById(encodeURIComponent(fname + "_" + idx));
            setTimeout(function(){
                _n.style.width = Math.ceil((e.loaded / size) * 100) + "%"
            },50);
            if(e.loaded == size){ 
                setTimeout(function(){
                    _n.parentElement.parentElement.nextElementSibling.innerHTML = "<img src='img/ico_down_ok.png' border='0' width='20px' height='20px' style='vertical-align:middle'>&nbsp;&nbsp;OK";
                }, 350)
            }
        });
        xhr.onreadystatechange = function(evt) {
            var file, err;
            if(xhr.readyState === 4){
                if(xhr.status === 200 || xhr.status === 0){ 
                    file = null; err = null;
                    try{ file = xhr.response || xhr.responseText; } catch(e) { err = new Error(e); }
                    callback(saveZip._success(err, fname.replace(/^\s+|\s+$/g, ''), file));
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
saveZip.drawFileList = function(filelist){
    saveZip.filePro = new Array(filelist.length);
    var html = "";

    html += "<table id='file_list_progress' style='padding-top:7px; padding:20px;'>";
    for(var i = 0; i < filelist.length; i++){
        html += "<tr>";
        html +=     "<td style='width:35px;padding:0;'>";
        html +=         "<span class='ico ico-attach " + saveZip.getExtClass(filelist[i].filename) + "'></span>";
        html +=     "</td>" 
        html +=     "<td style='padding:0;text-align:left'><p style='width:260px; margin:0px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;'>" + filelist[i].filename + "</p></td>"
        html +=     "<td style='padding:8px 8px 8px 0; width:70px;'>";
        html +=         '<div class="zipprogress zipprogress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">';
        html +=             '<div class="zipprogress-bar zipprogress-bar-success" id=\"' + encodeURIComponent(filelist[i].filename) + "_" + filelist[i].order + '\" style="width:0%;"></div>';
        html +=         '</div>';
        html +=     "</td>";                
        html +=     "<td style='padding;0px; width:100px;'>Progress</td>";
        html += "</tr>";
    }
    html += "</table>";
	$.blockUI({ message : html, css: { width: '523px', left:(window.innerWidth - 523) * 1/2 + "px"} }); 
};
saveZip.getExtClass = function(filename){
    var icon_class = "";
	var _ext = filename.lastIndexOf(".");
    var file_ext = filename.substr(parseInt(_ext)+1).toLowerCase();

    if ('doc.docx.docm'.indexOf(file_ext)>-1){
        icon_class = "word";
    }else if ('xls.xlsx.xlsm.xlsb.csv'.indexOf(file_ext)>-1){
        icon_class = "excel"
    }else if ('ppt.pptx'.indexOf(file_ext)>-1){
        icon_class = "ppt"
    }else if ('pdf.psd'.indexOf(file_ext)>-1){
        icon_class = "pdf"
    }else if ('zip.jar.war.rar.a01.a02.a03.alz.ear.egg'.indexOf(file_ext)>-1){
        icon_class = "zip"
    }else if ('hwp'.indexOf(file_ext)>-1){
        icon_class = "hwp" 
    }else if ('jpg.gif.bmp.png.jpeg'.indexOf(file_ext)>-1){
        icon_class = "img";
    }else if ('avi.m4a.mmkv.mov.mp3.mp4.mpeg.mpg.swf.wav.wmv'.indexOf(file_ext)>-1){
        icon_class = "video";
    }else{
        icon_class = "unknown";
    }

    return icon_class;
};
saveZip.zipStart = function(filelist, callback){
    saveZip.zip = new JSZip();
    saveZip.filelist = filelist;
    var cnt = 0;
    var len = filelist.length;
    
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
 
    saveZip.drawFileList(filelist);
    for(var i=0; i<filelist.length; i++){ saveZip.getFile(filelist[i].fileDownUrl, filelist[i].filename, filelist[i].size, filelist[i].order, function(ret, path, file){ if(ret){ cnt = cnt + 1; } else { alert("Error!!"); return; } }); } 
    var inter = setInterval(function(){
        if(cnt == len){
            saveZip.zip.generateAsync({type:"blob"}).then(function(content){
                clearInterval(inter);
                /*
                var date = new Date();
                var _f = saveZip.filelist[0].filename.replace(saveZip.filelist[0].filename.slice(saveZip.filelist[0].filename.lastIndexOf(".")),"") + " " + (saveZip.filelist.length == 1 ? "" : "(" + (saveZip.filelist.length - 1) + ") ") + date.getFullYear() 
                        + ((date.getMonth()+1 + "").length == 1 ? "0" + (date.getMonth()+1) : date.getMonth()+1)
                        + (String(date.getDate()).length == 1 ? "0" + date.getDate(): String(date.getDate()))
                        + "_" + (String(date.getHours()).length == 1 ? "0" + date.getHours() : String(date.getHours()))
                        + (String(date.getMinutes()).length == 1 ? "0" + date.getMinutes() : String(date.getMinutes()))
                        + (String(date.getSeconds()).length == 1 ? "0" + date.getSeconds() : String(date.getSeconds()))

                saveZip(content, _f.trim()+ ".zip");
                */
                saveZip(content, saveZip.creatZipFileName(filelist) + ".zip");
                cnt = 0;
                setTimeout(function(){ $.unblockUI(); callback(); },800);
            }, function(e){
                console.log("saveZip Error!!");
            });
        }
    }, 200);
};
saveZip.creatZipFileName = function(filelist){
    var date = new Date();
    var zipFileName = '';

	zipFileName = filelist[0].filename.replace(filelist[0].filename.slice(filelist[0].filename.lastIndexOf(".")),"") + " " + (filelist.length == 1 ? "" : "(" + (filelist.length - 1) + ") ")
	+ date.getFullYear()
	+ ((date.getMonth()+1 + "").length == 1 ? "0" + (date.getMonth()+1) : date.getMonth()+1)
	+ (String(date.getDate()).length == 1 ? "0" + date.getDate(): String(date.getDate()))
    + "_" + (String(date.getHours()).length == 1 ? "0" + date.getHours() : String(date.getHours()))
    + (String(date.getMinutes()).length == 1 ? "0" + date.getMinutes() : String(date.getMinutes()))
    + (String(date.getSeconds()).length == 1 ? "0" + date.getSeconds() : String(date.getSeconds())).replace(/^\s+|\s+$/g, '');

    return zipFileName

}
