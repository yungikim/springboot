$.urlParam = function(name){
	var res = ''
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results) res = results[1] || results[1]; 
    return res;
}
if($.urlParam("domain") != ""){ document.domain = $.urlParam("domain"); }
var _XAM = {};
function iframeInit(o){
    $.ajaxSetup({ cache: true });
    _XAM.env = o.env;
    $.getScript(parent.scriptBasePath+"xam.loader.js", function(){
        _XAM.loader.script(parent.scriptBasePath + "xam.cores.js?open&ver=2.0.0.17").script(parent.scriptBasePath + "xam.lang.js?open&ver=2.0.0.17").wait(function(){
            _XAM.args = { 
            		config_url: o.args.config_url,
            		isEdit: o.args.isEdit,
            		save_path: o.args.save_path, 
            		l_save_path: o.args.l_save_path, 
            		serverzip_path: o.args.serverzip_path, 
            		uploadCallback: o.args.uploadCallback,
            		deleteCallback: o.args.deleteCallback,
            		historyCallback: o.args.historyCallback,
        			attachunid: o.args.attachunid,
        			attachunique: o.args.attachunique,    		
            		fileID : "file_list", 
            		filelistID : "files", 
            		fileSizeID : "total_file_size", 
            		LargefileSizeID : "total_large_file_size"
            };
            $.when.apply(null, [
                $.ajax({ 
                    url : parent.basePath + "/language/i18n_" + _XAM.env.lang + ".json?open&ver=2.0.0.17",
                    cache:false, dataType:"json"
                }),
                pageInit(o.args.isPopup)
            ]).done(function(ret){
                try {
                    _XAM.xamlang.langmap = ret[0];
                } catch(e){
                    _XAM.xamlang.langmap = eval("(" + ret[0] + ")");
                }
                _XAM.xamlang.setProperties($("body"));
                if(_XAM.env.is_chunk_upload){ 
                    $('#fileupload').fileupload({ maxChunkSize : _XAM.env.chunk_size * 1024 * 1024 }); 
                } else {  
                    $('#fileupload').fileupload();
                }
                $._XAM.fileupload._proto.initDisplay();
                if(window.OnInitCompleted){ OnInitCompleted(window.frameElement.id); }
            });
        });
    });    
}
