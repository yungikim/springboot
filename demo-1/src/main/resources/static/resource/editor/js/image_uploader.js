function ImageUploader(){
}
ImageUploader.APPLET_CODEBASE = document.location.protocol + "//" + document.location.host + "/keditor/";
ImageUploader.APPLET_CODE = "com.kmslab.imgctrl.ImageControl";
ImageUploader.APPLET_ARCHIVE = "ImageControl.2.0.0.3.jar";
ImageUploader.APPLET_WIDTH = "10";
ImageUploader.APPLET_HEIGHT = "10";
ImageUploader.APPLET_MINIMUM_VERSION = "1.6.0_24";
ImageUploader.DISABLED = false;
ImageUploader.IS_DEPLOYED = false;
ImageUploader.IS_INIT = false;
ImageUploader.JS_CONNECTOR = null;
ImageUploader.CONTROL = null;
ImageUploader.JRE_INSTALLED = null;
ImageUploader.PARAM = {};
ImageUploader.deploy = function(codebase){
	if(codebase) ImageUploader.APPLET_CODEBASE = codebase;
    function isChromeJavaAvailable() {
	    function _isJavaAvailable(){
		    var javaRegex = /(Java)(\(TM\)| Deployment)/,
		    plugins = navigator.plugins;
		    if (navigator && plugins) {
    			for (plugin in plugins){
				    if(plugins.hasOwnProperty(plugin) &&
						    javaRegex.exec(plugins[plugin].name)) {
					    return true;
				    }
			    }
		    }
		    return false;
	    }
	    var chromeVersion = window.navigator.userAgent.match(/Chrome\/(\d+)\./);
	    return !(chromeVersion && chromeVersion[1] && parseInt(chromeVersion[1], 10) >= 42 && !_isJavaAvailable());
    }
    var nv = navigator.userAgent;
	var nv_l = nv.toLowerCase();
	var is_mobile = (nv_l.indexOf('mobile')>-1) || (nv_l.indexOf('android')>-1) || (nv_l.indexOf('iphone')>-1) || (nv_l.indexOf('ipad')>-1) || (nv_l.indexOf('blackberry')>-1) || (nv_l.indexOf('opera mini')>-1) || (nv_l.indexOf('iemobile')>-1);
	if(is_mobile || !isChromeJavaAvailable()){
		ImageUploader.DISABLED = true;
		ImageUploader.JRE_INSTALLED = true;
        return;
    }
    if(ImageUploader.IS_DEPLOYED) return;
	/* Applet Tag Write */
	var att = {
		"id":"idImageUploader"
		, "type":"application/x-java-applet"
		, "codebase":ImageUploader.APPLET_CODEBASE
		, "code":ImageUploader.APPLET_CODE
		, "archive":ImageUploader.APPLET_ARCHIVE
		, "width":ImageUploader.APPLET_WIDTH
		, "height":ImageUploader.APPLET_HEIGHT
		, "style":"z-index:4000;position:absolute;left:-200px;top:-200px;"
			+ "width:" + ImageUploader.APPLET_WIDTH + "px;"
			+ "height:" + ImageUploader.APPLET_HEIGHT + "px;"
			+ "overflow:hidden;"
	};
	ImageUploader.JS_CONNECTOR = "_ImageUploader";
	window[ImageUploader.JS_CONNECTOR] = ImageUploader;
	ImageUploader.PARAM["JSConnectName"] = ImageUploader.JS_CONNECTOR;
	if(window.deployJava && window.deployJava.runApplet && !ImageUploader.is_mobile){
		var res = window.deployJava.runApplet(att, ImageUploader.PARAM, ImageUploader.APPLET_MINIMUM_VERSION);
		ImageUploader.JRE_INSTALLED = !(res === false);
	}else{
		var html = '';
		html += '<applet id="' + att.id + '" '
					+ 'codebase="' + att.codebase + '" '
					+ 'code="' + att.code + '" '
					+ 'archive="' + att.archive + '" '
					//+ (att.type?'type="' + att.type + '" ':"")
					+ 'width="' + att.width + '" '
					+ 'height="' + att.height + '" '
					//+ 'style="' + att.style + '"'
					+ '>';
		for(var idx in ImageUploader.PARAM){
			html += '<param name="' + idx + '" value="' + ImageUploader.PARAM[idx] + '">';
		}
		html += '<param name="java_version" value="' + ImageUploader.APPLET_MINIMUM_VERSION + '+">';
		html += '</applet>';

		var applet_div = document.createElement("div");
		applet_div.style.zIndex = 4000;
		applet_div.style.position = "absolute";
		applet_div.style.left = "-200px";
		applet_div.style.top = "-200px";
		applet_div.style.width = "10px";
		applet_div.style.height = "10px";
		applet_div.innerHTML = html;
		document.body.appendChild(applet_div);
		ImageUploader.JRE_INSTALLED = true;
	}
	ImageUploader.CONTROL = document.getElementById(att.id);
	ImageUploader.IS_DEPLOYED = true;
};
ImageUploader.checkJRE = function(_$){
	var _def = _$.Deferred();

	function _jre(){
		_def.resolve(ImageUploader.JRE_INSTALLED);
	}
	// if(ImageUploader.JRE_INSTALLED != null){
	// 	_jre();
	// }else{
		var _inte = setInterval(function(){
			if(ImageUploader.JRE_INSTALLED != null){
				_jre();
				clearInterval(_inte);
			}
		}, 1000);
	// }
	return _def.promise();
};
ImageUploader.installJRE = function(){
	if(navigator.platform.toLowerCase().indexOf("win32") != -1){
		// 32bit
		// alert(Trex._I18N.g('jre_win32_install', 'Java JRE(Win32)가 필요합니다.\n\n다운로드 되는 파일을 실행 후 양식을 다시 열어 주십시오.'));
		url = ImageUploader.APPLET_CODEBASE + 'jre-6u24-windows-i586.exe';
	}else if(navigator.platform.toLowerCase().indexOf("win64") != -1){
		// 64bit
		// alert(Trex._I18N.g('jre_win64_install', 'Java JRE(Win64)가 필요합니다.\n\n다운로드 되는 파일을 실행 후 양식을 다시 열어 주십시오.'));
		url = ImageUploader.APPLET_CODEBASE + 'jre-6u24-windows-x64.exe';
	}
	window.open(url);
};
ImageUploader.onLoadComplete = function(){
	ImageUploader.IS_INIT = true;
};
ImageUploader.isLoadComplete = function(){
    return !ImageUploader.DISABLED && ImageUploader.IS_INIT
};
ImageUploader.getClipboardData = function(){
    return ImageUploader.CONTROL.getAllowEditorClipboardData();
};
ImageUploader.uploadImage = function(editor, elem){
	//var imgs = doc.body.getElementsByTagName("img");
	var uploadImages = {};
	var hasImage = false;

	$.each(
		$('img', elem),
		function(index, img){
			var src = img.src;
			if(editor._checkUploadImage(src)) {
				if(uploadImages[img.src] == null){
					uploadImages[img.src] = [];
				}
				uploadImages[img.src].push(img);
				hasImage = true;
			}else{
				/** width, height가 0으로 설정되는 case가 생김. */
				// if(img.width != "0" && img.height != "0"){
				// 	img.width = img.width;
				// 	img.height = img.height;
				// }
			}
		}
	);
	if(!hasImage) return null;

    var uploadImageById = {};
	var uploadedImage = {};
	for(var img_path in uploadImages){
		var originFilePath = filePath = img_path;
		var ext = null;
		var isWMZ = false;
		var wmzExt = "";
		if(originFilePath.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1){
			filePath = decodeURIComponent(filePath);
			filePath = filePath.replace("file:///", "").replace("\\", "/");
		}else{
			filePath = decodeURIComponent(filePath).split("?")[0];
		}
		ext = filePath;
		if(ext.lastIndexOf("/") != -1) ext = ext.substring(ext.lastIndexOf("/") + 1);
		if(ext.lastIndexOf(".") != -1) ext = ext.substring(ext.lastIndexOf(".") + 1);
		else ext = "gif";
		isWMZ = ext.toLowerCase() == "wmz"?true:false;
		if(isWMZ){
			//ext = "jpg";
			//ext = "svg";
		}
		var _info = editor._getUploadImageInfo('', '', ext, 'control');
		var imageSeq = _info.cid;
		var imageName = _info.name;
		var formAction = _info.url;

		ImageUploader.CONTROL.imageUploadPostUrl(formAction);
		ImageUploader.CONTROL.imageUploadFileField(_info.fieldname);

		if(_info.type == 'domino'){
			ImageUploader.CONTROL.imageUploadTextField("__Click", "0");
			ImageUploader.CONTROL.imageUploadTextField("%%PostCharset", "UTF-8");
			ImageUploader.CONTROL.imageUploadTextField("Body", "");
		}
		for(var idx in _info.postdata){
			ImageUploader.CONTROL.imageUploadTextField(idx, _info.postdata[idx]);
		}
		if(originFilePath.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1){
			uploadImageById[imageName] = uploadImages[img_path];
			ImageUploader.CONTROL.imageUploadFile(imageName, filePath);//, isWMZ);
		}else{
			uploadImageById[imageName] = uploadImages[img_path];
			ImageUploader.CONTROL.imageUploadURL(imageName, filePath);
		}

		var uploadResult = ImageUploader.CONTROL.imageUpload();

		_info.uploadedImage = uploadedImage;
		_info.uploadImageById = uploadImageById;
		editor._parseUploadResponse(uploadResult, _info, 'applet');
	}
	var uploadInfo = {uploadedImage:uploadedImage, uploadId:uploadImageById};
	for(var idx in uploadInfo.uploadedImage){
		var imgs = uploadInfo.uploadId[idx];
		if(imgs != null){
			for(var j = 0; j < imgs.length; j++){
				imgs[j].src = uploadInfo.uploadedImage[idx];
			}
		}
	}
	return elem;
}