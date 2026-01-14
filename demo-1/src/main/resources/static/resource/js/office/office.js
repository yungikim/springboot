

function Office(){	
	this.was_url = "https://one.kmslab.com";
	this.callback_url = "https://one.kmslab.com";
	
	if (location.href.indexOf("dev") > -1){
		this.was_url = "https://dev.kmslab.com";
	}
}

var config = "";
var docEditor = "";
var historyObject = {
  historyData: [] // 초기 빈 배열
};

var innerAlert = function (message, inEditor) {
    if (console && console.log)
        console.log(message);
    if (inEditor && docEditor)
        docEditor.showMessage(message);
};

var onDocumentStateChange = function (event) {  // the document is modified
    var title = document.title.replace(/^\*/g, "");
    document.title = (event.data ? "*" : "") + title;
};

var onRequestClose = function () {  // close editor
    docEditor.destroyEditor();
    innerAlert("Document editor closed successfully");
};

var onUserActionRequired = function () {
    console.log("User action required");
};

 var onMetaChange = function (event) {  // the meta information of the document is changed via the meta command
    if (event.data.favorite !== undefined) {
        var favorite = !!event.data.favorite;
        var title = document.title.replace(/^\☆/g, "");
        document.title = (favorite ? "☆" : "") + title;
        docEditor.setFavorite(favorite);  // change the Favorite icon state
    }

    innerAlert("onMetaChange: " + JSON.stringify(event.data));
};
        
var onError = function (event) {  // an error or some other specific event occurs
    if (event)
        innerAlert(event.data);
};

var onOutdatedVersion = function (event) {  // the document is opened for editing with the old document.key value
    location.reload(true);
};

// replace the link to the document which contains a bookmark
var replaceActionLink = function(href, linkParam) {
    var link;
    var actionIndex = href.indexOf("&action=");
    if (actionIndex != -1) {
        var endIndex = href.indexOf("&", actionIndex + "&action=".length);
        if (endIndex != -1) {
            link = href.substring(0, actionIndex) + href.substring(endIndex) + "&action=" + encodeURIComponent(linkParam);
        } else {
            link = href.substring(0, actionIndex) + "&action=" + encodeURIComponent(linkParam);
        }
    } else {
        link = href + "&action=" + encodeURIComponent(linkParam);
    }
    return link;
}

var onMakeActionLink = function (event) {  // the user is trying to get link for opening the document which contains a bookmark, scrolling to the bookmark position
    var actionData = event.data;
    var linkParam = JSON.stringify(actionData);
    docEditor.setActionLink(replaceActionLink(location.href, linkParam));  // set the link to the document which contains a bookmark
};

var onRequestSendNotify = function(event) {  // the user is mentioned in a comment
    event.data.actionLink = replaceActionLink(location.href, JSON.stringify(event.data.actionLink));
    var data = JSON.stringify(event.data);
    innerAlert("onRequestSendNotify: " + data);
};

var onRequestReferenceData = function(event) {  // user refresh external data source
    innerAlert("onRequestReferenceData");

    requestReference(event.data, function (data) {
        docEditor.setReferenceData(data);
    });
};

var onDocumentReady = function(){
    fixSize();
};
         
// get the editor sizes
var fixSize = function () {
    if (config.type !== "mobile") {
        return;
    }
    var wrapEl = document.getElementsByTagName("iframe");
    if (wrapEl.length) {
        wrapEl[0].style.height = screen.availHeight + "px";
        window.scrollTo(0, -1);
        wrapEl[0].style.height = window.innerHeight + "px";
    }
};

if (window.addEventListener) {
    //window.addEventListener("load", connectEditor);
    window.addEventListener("resize", fixSize);
    window.addEventListener("orientationchange", fixSize);
} else if (window.attachEvent) {
   // window.attachEvent("onload", connectEditor);
    window.attachEvent("onresize", fixSize);
    window.attachEvent("orientationchange", fixSize);
}



 var onRequestHistory = function (event) {  // the user is trying to show the document version history
 	
    var url = office.was_url + "/office_history.km";
    var data = JSON.stringify({"key" : config.document.key});
    
    $.ajax({
		method : "POST",
		url : url,
		dataType : "json",
		contentType : "application/json; charset=utf-8",
		data : data,
		success : function(res){
			if (res.result == "OK"){
				var item = res.data.data;
				var currentVersion = item.length;
				var history = [];
				
				for (var i = 0 ; i < item.length; i++){
					
					var citem = item[i];
					var obb = new Object();
					obb.created = citem.lastsave;
					obb.key = citem.key;
					obb.version = citem.version;
					obb.user = citem.history.changes[0].user;	
					obb.fileType = citem.filetype;		
					
					var dockey = citem.dockey;
					var category = "files";
					var ky = obb.user.id;
					var version = obb.version;
				//	obb.url =citem.surl;
				//	obb.changesUrl=citem.surl + "&zip=zip";		
					obb.url = citem.url;
					
					obb.changesUrl = citem.changesurl;		

					history.push(obb);					
				}
				historyObject.historyData.push(history);
				docEditor.refreshHistory({
					currentVersion: currentVersion,
					history : history					
				});
			}
		},
		error : function(e){
			alert(e);
		}
	})
    
};

var onRequestHistoryData = function (event) {  // the user is trying to click the specific document version in the document version history
 
	var version = event.data;		
	var info = historyObject.historyData;	
	var versionTwoObject = null;
	var item = info[0];
	var history = new Object();
	var k = 0;
	for (var i = 0 ; i < item.length; i++){
		var px = item[i];
		if (px.version == version){
			versionTwoObject = px;
		}
		k=k+1
		history["ver_" + k] = px;
		
	}	
	
	if (version > 1){
		var pre = history["ver_" + (version - 1)];
		var previous  = {
			fileType: pre.fileType,
			key : pre.key,
			url : pre.url
		}
	
		versionTwoObject["previous"] = previous;
	}
	
	var url = office.was_url + "/auth_office_temp.do";
	var data = JSON.stringify(versionTwoObject);
	$.ajax({
		method : "POST",
		url : url,
		data : data,
		dataType : "json",
		contenType : "application/json; charset=utf-8",
		success : function(res){			
			if (res.result == "OK"){
				console.log(res.auth);
				versionTwoObject.token = res.auth;
				docEditor.setHistoryData(versionTwoObject);  // send the link to the document for viewing the version history
			}			
		},
		error : function(e){
			alert(e);
		}
	})

  
};

var onRequestHistoryClose = function (event){  // the user is trying to go back to the document from viewing the document version history
    document.location.reload();
};

var onRequestRestore = function (event) { // the user is trying to restore file version\
debugger;
  const version = event.data.version;
  const url = event.data.url;
  var filename2 = config.document.title;
  var url2 = config.document.url;
  const fileName = filename2 || null;
  const directUrl = url2 || null;
  const restoreData = {
    version: version,
    url: url,
    fileName: fileName,
  };
  let xhr = new XMLHttpRequest();
  xhr.open("PUT", "restore");
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(restoreData));
  xhr.onload = function () {
    const response = JSON.parse(xhr.responseText);
    if (response.success && !response.error) {
      const dataForHistory = {
        fileName: fileName,
        directUrl: directUrl
      };
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "historyObj");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(dataForHistory));
      xhr.onload = function () {
        historyObject = JSON.parse(xhr.responseText);
        docEditor.refreshHistory(  // show the document version history
          {
            currentVersion: historyObject.countVersion,
            history: historyObject.history
          });
      }
    } else {
      innerAlert(response.error);
    }
  }
}

var onRequestRename = function(event) { //  the user is trying to rename file by clicking Rename... button	
	//innerAlert("파일의 제목이 변경되었습니다.", docEditor);
    var newfilename = event.data;
   	var filename = newfilename + "." + config.document.fileType;
    var data = JSON.stringify({
        filename: filename,
        key: config.document.key
    });
    
    var url = office.was_url + "/office_rename.km";
    $.ajax({
		method : "POST",
		dataType : "json",
		contentType : "application/json; charset=utf-8",
		url : url,
		data : data,
		success : function(res){
			
		},
		error : function(e){
			alert("ERROR");
		}
	})
};

var isMobile = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

Office.prototype = {	
	"init": function(){
		office.__event_init();
	},		
	"__event_init" : function(){
				
		var name = "";
		var ky = "";
		var dept = "";
		var image = "";
		var mo = isMobile();
		var type = "desktop";
		if (mo){
			type = "mobile";
		}
		var editmode = "edit";
		if (ctype == "view"){
			editmode = "view";
		}
		if (userinfo == ""){
			//anoymous 일경우
			name = "anonymous";
			ky = "anonymous";
			dept = "anonymous";
			image = office.was_url + "/resource/images/none.jpg";
		}else{
			name = userinfo.split("-spl-")[1];
			ky = userinfo.split("-spl-")[3];
			dept = userinfo.split("-spl-")[18];
			image = office.was_url + "/photo/" + ky + ".jpg";
		}
		
		real_dockey = category + "_" + dockey;
		console.log("real_dockey : " + real_dockey);
		
		var url = office.was_url  + "/auth_office.do";
  		var data = JSON.stringify({
  			"name" : name,
  			"key" : ky,
  			"image" : image,
  			"group" : dept,
  			"dockey" : real_dockey,
  			"category" : category,
  			"editmode" : editmode
  		});
  		
		$.ajax({
	        url: url,
	        type: "POST", // GET, POST, PUT, DELETE 등
	        data: data,   // 요청에 전달할 데이터
	        dataType: 'json', // 응답 데이터 타입 (json, text, html 등)
			beforeSend : function(xhr){
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
	        success: function(response) {
	            // 성공 시 콜백 호출
	          // console.log(response);
	            var obb = response.payloads;
	          	debugger;
	            //console.log(obb);
	            var token = response.auth;
	            console.log(token);
	            var url = obb.url;
	            url = url + "&category="+category;
	            console.log(url);

	            var documentType = obb.documentType;
	            var filetype = obb.fileType;
	            var filename = obb.filename;        
	            var mode = obb.mode;
	         //   var editmode = true;
	            if (mode == "view"){
	            	editmode = mode;
	            }

	            if (response.result == "OK"){
					var token = response.auth;
					
					config = {
					 document: {
					    fileType: filetype,
					    key: real_dockey,
					    title: filename,
					    url: url,
					    permissions: {
					        edit: true,
					        comment: true
					      }
					  },			  
					  documentType: documentType,
					  editorConfig:{
						callbackUrl : office.callback_url + "/onlyoffice_callback.km",
						user: {
						      id: ky,
						      name: name,
						      image: image
						    },		
						 lang : "ko",
						 mode : editmode
						 /*
						 coEditing : {
							mode : "strict",
							change: false,
						 }
						 */
					  },
					  
					  events : {
						 onRequestRename,
						 onRequestHistory,
						 onRequestHistoryData,
						 onRequestHistoryClose
					  },
					  
					  width: "100%",
					  height : "100%",
					  type : type,
					  /*
					  logo: {
				        image: "https://one.kmslab.com/resource/images/alarm_portal_search_ico.png",
				        imageDark: "https://one.kmslab.com/resource/images/alarm_portal_search_ico.png",
				        imageLight: "https://one.kmslab.com/resource/images/alarm_portal_search_ico.png",
				        url: "https://one.kmslab.com",
				        visible: true,
				      },
				      */
					  token: token,
					};
				//680b4b73569e94526c75a83e		
				 
				 docEditor = new DocsAPI.DocEditor("placeholder", config);
				
				
				 
				}	            
	        },
	        error: function(xhr, status, error) {
	          alert(error);
	        }
	    });
	}
  	
}



