
(function(window, undefined) {
	'use strict'; 

	 
    var portalUIController = (function() {
    	
    	var $portalUICntl = function() {},
    	globalOption ={
    		httpMethod :{
    			get:'get'
    			,post:'post'
    		},
    		openType:{
				'domino':'domino'
				,'iframe':'iframe'
				,'popup':'popup'
				,'dominoPopup':'dominoPopup'
				,'location':'location'
			}
    		,defaultPopupMethod:'post'
    	};
    	
    	$portalUICntl.pausePage = function(divId, jsonData) {
        	var fileNm = jsonData.type;
        	if(!fileNm)	fileNm = "pause";
        	
        	var htmlUrl = "/res/portal/html/static/"+fileNm+".html";
        	
			ajaxUtils.getText(htmlUrl,true, function(flag, resultData){
				if(flag){
	            	var htmlObj = resultData;
	            	htmlObj=$(htmlObj);
	            	htmlObj.find('.date').html(jsonData.from_date + ' ~ ' + jsonData.to_date);
	            	htmlObj.find('.src').html(jsonData.p_message);
	            	htmlObj.find('.src').prepend("<strong>시스템 점검중</strong");
	            	$('#'+divId).html(htmlObj.html());
				}
			})        	
        };
        $portalUICntl.showProfile = function(email){
        	var searchURL = "/wps/PA_APEP_userSearch/userSearch.jsp?s_object=";
        	var s_object = {};
        	s_object.s_txt = email;
        	s_object.s_opt="email";
        	
        	ajaxUtils.getJson(searchURL+s_object, true, function(flag, retData){
        		
        	});
        }
        $portalUICntl.getDominoJson = function(type, url, callback) {
        	var self_ = this;
        	
        	var retJson = {};
        	retJson.unreadcount =0;
        	retJson.data =[];
        	
        	if(!url) return retJson;
        	
        	if(type=='email'){
        		ajaxUtils.getText(url, true, function(flag, retData){
        			try{
        				retJson.flag  = flag;
        				if(flag){
        					var fn = new Function ('data','var reval = '+retData+';return reval;');
							var obj = fn.call(fn,retData);
							/* 안 읽은 메일 수 가져오기
							var count_url = "/" + ePortalConfig.mailFile + "/agGetUnreadMailCountPortal?openagent";
							ajaxUtils.getText(count_url, false, function(flg, rdat){
								var cfn = new Function ('data','var reval = '+rdat+';return reval;');
								var cobj = cfn.call(cfn,rdat);
								retJson.unreadcount = cobj.count;
							});
							*/
							retJson.unreadcount = obj["@toplevelentries"];
							var jsonData = obj.viewentry;
							
        					if(jsonData){        						
        						var data_ = [];        						
        						var array;
        						for(var idx=0;idx<jsonData.length;idx++){
        							array = {};
        							var item = jsonData[idx].entrydata;
        							var itemLen = item.length -1;
        							
        							array.title = item[4].text[0];
        							array.date = self_.parseTime(item[5].datetime[0]);
        							
        							if(item[itemLen]){
        								if(item[itemLen].text){
	        								array.fullname = item[itemLen].text[0];
	        								array.photo = self_.getUsrPhoto(item[itemLen].text[0]);
        								}else{
        									array.fullname = "";
            								array.photo = "";
        								}
        							}else{
        								array.fullname = "";
        								array.photo = "";
        							}
        							array.writer = item[2].text[0];
        							array.unid = jsonData[idx]["@unid"];
        							array.attach = (item[3].number ? item[3].number[0] : "");
        							array.importance =(item[itemLen-1].number ? item[itemLen-1].number[0] : "");

            						data_.push(array);   							
        						}
        						retJson.data =	data_;
        					}
        				}else{
        					retJson.flag = false; 
        					retJson.data ={message:retData};
        				}
        			}catch(e){
        				retJson.flag = false; 
    					retJson.data ={message:e.name+'\n'+e.number+'\n'+e.message};
        			}
        			if(callback != null)	callback(retJson);
        		});
        	}else if(type=='calendar'){
        		ajaxUtils.getText(url, true, function(flag, retData){
        			try{
        				retJson.flag  = flag;
        				if(flag){
        					var fn = new Function ('data','var reval = '+retData+';return reval;');
							var obj = fn.call(fn,retData);
							
							var jsonData = obj.viewentry;
							
							if(jsonData){
								var data_ = [];  
								var data_allday = [];     						
	    						var array;
	    						for(var idx=0;idx<jsonData.length;idx++){
	    							array = {};
	    							var item = jsonData[idx].entrydata;
	    							var custom = (item[12]? item[12].text[0] : "").split("|");
	    							
	    							array.type = item[8].text[0];
	    							
	    							array.title = ("textlist" in item[6] ? (item[6].textlist.text[0])[0] : item[6].text[0]) ;
	    							
	    							array.spot = (custom.length > 1 ? custom[1]: "")//(item[6].textlist.text[1])[0];
	    							array.unid = jsonData[idx]["@unid"];
	    							array.date = "datetime" in item[0] ? item[0].datetime[0] : item[0].datetimelist.datetime[0][0];
	    							if("1" == array.type || "2" == array.type || "4" == array.type){			    								
		    							//array.startTime = portalUICntl.parseCalendarTime("datetime" in item[3] ? item[3].datetime[0] : item[3].text[0], true);
		    							//array.endTime = portalUICntl.parseCalendarTime("datetime" in item[5] ? item[5].datetime[0] : item[5].text[0], true);

		    							//array.sTimeStr = ("datetime" in item[3] ? item[3].datetime[0] : item[3].text[0]);
		    							//array.eTimeStr = ("datetime" in item[5] ? item[5].datetime[0] : item[5].text[0]);		    							
	    							}else{
		    							//array.startTime = portalUICntl.parseCalendarTime("datetime" in item[3] ? item[3].datetime[0] : item[3].datetimelist.datetime[0][0], true);
		    							//array.endTime = portalUICntl.parseCalendarTime("datetime" in item[5] ? item[5].datetime[0] : item[5].datetimelist.datetime[0][0], true);
		    							
		    							//array.sTimeStr = ("datetime" in item[3] ? item[3].datetime[0] : item[3].datetimelist.datetime[0][0]);
		    							//array.eTimeStr = ("datetime" in item[5] ? item[5].datetime[0] : item[5].datetimelist.datetime[0][0]);
	    							}
	    							
	    							array.startTime = portalUICntl.parseCalendarTime(portalUICntl.scheduleDt(item[3]), true);
	    							array.endTime = portalUICntl.parseCalendarTime(portalUICntl.scheduleDt(item[5]), true);
	    							
	    							array.sTimeStr = portalUICntl.scheduleDt(item[3]);
	    							array.eTimeStr = portalUICntl.scheduleDt(item[5]);
	    							
	    							array.member = custom[0];
                                    array.inotesHoliday = (custom.length > 2 && custom[2] == 'Holiday' ? true : false);

	    							if("1" == array.type || "2" == array.type){
	    								data_allday.push(array);
	    							}else{
	    								data_.push(array);
	    							}
	    							
	    						}
	    						
	    						data_.sort(function (left,right) { 
	    							 return (left.date < right.date ? -1 :(left.date == right.date? 0 : 1));
	    						}) ;

	    						retJson.data =	data_allday.concat(data_);
							}
        				}else{
        					retJson.flag = false; 
        					retJson.data ={message:retData};
        				}
        			}catch(e){
        				retJson.flag = false; 
    					retJson.data ={message:e.name+'\n'+e.number+'\n'+e.message};
        			}
        			if(callback != null)	callback(retJson);
        		});
        	}else if(type == "wait" || type == "rejected" || type == "progressing" || type == "completed"){
        		var _alias = (type == "rejected" ? "reject" : (type == "progressing" ? "progress" : type));
        		var _category = (type == "progressing" ? ePortalConfig.username : "-=notesid=-");
        		url = url + "/cs_search?openagent&alias=" + _alias + "&category=" + _category + "&start=0&ps=30";
        		ajaxUtils.getJson(url, true, function(flag, jsonData){
        			try{
        				retJson.flag  = flag;        				
        				if(flag){
        					var data_ = [];  
        					var array;
        					jsonData = jsonData.hits.hits;
        					if(jsonData.length){
        						retJson.unreadcount = jsonData.length;
        						for(var idx=0;idx<jsonData.length;idx++){
        							array = {};
        							var item = jsonData[idx]._source;
        							var _approver = "";
        							
        							if(type == "wait" || type == "rejected"){
        								array.approver = item.writerinfo;
        								_approver = item.writerinfo.split("^");
        							}else if(type == "progressing"){
        								array.approver = item.aprvlinkeddoc_currapproverinfo;
        								_approver = item.aprvlinkeddoc_currapproverinfo.split("^");
        							}else{
        								array.approver = item.aprvlinkeddoc_lastapproverinfo;
        								_approver = item.aprvlinkeddoc_lastapproverinfo.split("^");
        							}
        							
        							array.fullName = _approver[8];
        							array.writer = _approver[2];
        							array.title = item.subject;
        							array.date = portalUICntl.convertTime((type == "completed" ? item.aprvlink_last_approve_date : item.aprvlinkeddoc_createddate));
        							array.link = '/' + item.aprvlinkeddoc_origindbpath  + '/all/' + item.aprvlinkeddoc_originunid  + "?opendocument";
        							
        							data_.push(array);
        						}
        						retJson.data =	data_;
        					}
        				}else{
        					retJson.data ={message:jsonData};
        				}
        			}catch(e){
        				retJson.flag  = false;
        				retJson.data ={message:e.name+'\n'+e.number+'\n'+e.message};
        			}
        			if(callback != null)	callback(retJson);
        		});
        	}
        	
        	//else	return retJson;	
        };
        $portalUICntl.contentUrl = function(type , options, callback) {        		
        	var mailfile = options.mailfile ? options.mailfile :'';

        	if(!mailfile) return '';
        	
        	if(type=='email'){
					var start = options.Start ? options.Start :1,
					count = options.Count ? options.Count :-1,
					resortdescending = options.resortdescending ? options.resortdescending :5,
					tztype = options.TZType ? options.TZType :'UTC',
					form = options.Form ? options.Form :'s_ReadViewEntries_JSON';
				// ★★★
				var ret_url = '';
				ret_url =  '/'+mailfile+'/portal_view?ReadViewEntries&outputformat=JSON'
						+'&Start='+start
						+'&Count='+count
			        	+'&resortdescending='+resortdescending						
			        	+'&KeyType=time'
			        	+'&TZType='+tztype
			        	+'&charset=utf-8';
	        	return ret_url;
        	}else if(type=='calendar'){
        			var startKey = options.startKey ? options.startKey : '',
        			utilKey = options.utilKey ? options.utilKey : '',
        			count = options.Count ? options.Count :-1,
        			tztype = options.TZType ? options.TZType :'UTC',
        			form = options.Form ? options.Form :'s_ReadViewEntries_JSON';
				// ★★★
        		var ret_url = '';
				ret_url =  '/'+mailfile+'/portal_calendar?ReadViewEntries&outputformat=JSON'
					+'&Start=1'
        			+'&Count='+count
        			+'&KeyType=time'
        			+'&TZType='+tztype
        			+'&StartKey='+startKey
        			+'&UntilKey='+utilKey;
	        	return ret_url;
        	}else if(type=='aprv'){  
        		var view = options.view ? options.view : 'wait';

           		$ep.wait(function(){
        			$ep.util.getApp(type,ePortalConfig.companyCode, function(data){
        				var defaultHost = data.sysdir.split("/"); 
        				var ret = "/"+defaultHost[1]+"/aprv/aprv_link.nsf/api/data/collections/name/"
        				+view+"?ps=1500"
        				+"&entrycount=false"
        				+(view != "completed" ? "&category="+ePortalConfig.username:"" );
        				
        				if(callback != null)	callback(ret);
        			});
        		}); 

        	}
        }
        $portalUICntl.scheduleDt = function(item){
			var startDT = "";
			try{
				if("datetimelist" in item){
					startDT = item.datetimelist.datetime[0][0];
				}else if("datetime" in item){
					startDT = item.datetime[0];
				}else{
					startDT = item.text[0];
				}
			}catch(e){
				
			}
			return startDT;    	
        }
        
    	$portalUICntl.ie8Date = function(datestr){
    		if(/MSIE 8/i.test(navigator.userAgent)){
    			datestr = datestr.replace(/-/gi, "/");
    		}
    		
    		return datestr;
    	}
    	$portalUICntl.openMailDocument = function(mailfile, unid){
    		
			var w = 800;
			var h = 600;
			var left_ = (window.screen.width/2)-(w/2);
			var top_ = (window.screen.height/2)-(h/2);	
			var feather = "width="+w+",height="+h+",left="+left_+",top="+top_+",toolbar=no,menubar=no,status=no,location=no,resizable=yes";	
						
    		var url = "/"+mailfile+"/XML_Inbox/"+unid+"?opendocument&viewname=XML_Inbox&folderkey=&opentype=popup&relatedyn=N";
    		
    		//email을 HTTP로 서비스 하기 위해서 추가한다.
    		//url = "http://" + location.host + url;
			
			this.page.view(url,'popup',{gubun:'menu', name:'', method:'get',viewOption:feather});
    	}
    	$portalUICntl.openAprvDocument = function(url){
    		portalUICntl.page.view(url,'dominoPopup',{argv:'', feathers:{},langpack:{langpack:"approval", langprefix:"APPROVAL"}});
    	}
    	$portalUICntl.openAppsDocument = function(url, popup_yn, popup_option, ie_yn, msg, mailfile){
		  	if( "Y" == ie_yn ){
			    var ua = window.navigator.userAgent;
			    if(ua.indexOf('MSIE') < 0 && ua.indexOf('Trident') < 0) {
				    if ( msg == 'undefined' || msg.trim().length == 0 ) {
				   		msg = "App is optimized for IE browser.";
				    } 
				    $ep.wait(function() { 
				    	$ep.util.blockUI({ message : msg });
				    });
				    setTimeout( "portalUICntl.openAppsWin('"+url+"', '"+popup_yn+"', '"+popup_option+"')", 1500);
			    } else {
			    	portalUICntl.openAppsWin(url, popup_yn, popup_option, mailfile);
			    }
		    } else {
		    	portalUICntl.openAppsWin(url, popup_yn, popup_option, mailfile);
		    }   		
    	}
    	$portalUICntl.openAppsWin = function(url, popup_yn, popup_option, mailfile){
			if(popup_yn == "Y"){
				if(popup_option == "undefined")	popup_option="";
				if( url.indexOf("applcode=") == 0 ) {
					var appsUrl = url.replace("applcode=", ""); 
					url = "/portaleip.nsf/app_stay/"+ePortalConfig.companyCode + "^" + appsUrl;
		        }			
				portalUICntl.page.view(url,'popup',{gubun:'menu', name:'', method:'get',viewOption:popup_option});
			}else{
				var menuUrl = document.location + "?uri=nm:oid:" + url;
				portalUICntl.page.view(menuUrl,'location',{gubun:'menu', name:'', method:'get',viewOption:''});		
			}    		
    	}    	
    	$portalUICntl.mailMore = function(mailfile){
    		
    		if (mailfile.indexOf('devaphqmail/mail/ko1.nsf')>-1||mailfile.indexOf('devaphqmail/mail/ko2.nsf')>-1) {
    			portalUICntl.page.view("/"+mailfile+"/iNotes/Mail/?OpenDocument",'popup',{gubun:'menu', name:'', method:'get',viewOption:''});
    		} else {
    			//var uu = "http://" + location.host + "/"+mailfile+"/FrameMail?openform"
    			//portalUICntl.page.view(uu,'popup',{gubun:'menu', name:'', method:'get',viewOption:''});
    			portalUICntl.page.view("/"+mailfile+"/FrameMail?openform",'popup',{gubun:'menu', name:'', method:'get',viewOption:''});
    		}
    	}
    	$portalUICntl.chatMore = function(mailfile){
    		portalUICntl.page.view("/"+mailfile.split("/")[0]+"/WebChat/wm.nsf/chat?readform",'popup',{gubun:'menu', name:'', method:'get',viewOption:''});
    	}  
    	$portalUICntl.chatShow = function(){
    		var is_dev = false;
    		try{
    			is_dev = document.location.host.search(/devportal/i) != -1;
    		}catch(err){}
    		
    		if (is_dev){
    			$("#webchat_icon").show();
    		}else{
    			ajaxUtils.sendAjax({
    				url : '/portaleip.nsf/agIsPilotChatUser?openagent'
    				,type : "get"
    				,async: true
    				,data : {
    					userid : ePortalConfig.username
    					,mail : ePortalConfig.email
    				}
    				,success : function ( data, txt, xhr ) {
    					if (data.indexOf("Y") > -1) {
    					//	$("#webchat_icon").show()
    						$("#webchat_icon").hide();
    					}
    				}
    				,error: function (x) {
    				}
    			});	   			
    		}
    	}
    	$portalUICntl.calendarMore = function(mailfile){
    			var cal_prefix = mailfile.split('/')[0];
        		portalUICntl.page.view("/"+cal_prefix+"/cal/calendar.nsf/main?readform",'popup',{gubun:'menu', name:'', method:'get',viewOption:''}); 	
    	}    
    	$portalUICntl.aprvMore = function(){
    		var url = location.href+"?uri=nm:oid:com.ap.workplace.aprv";
    		portalUICntl.page.view(url,'location',{gubun:'menu', name:'', method:'get',viewOption:''});   		
    	}
    	$portalUICntl.addDays = function(dateObj, numDays){
			dateObj.setDate(dateObj.getDate() + numDays);
			return dateObj;
    	}
    	$portalUICntl.parseTime = function(dateStr){
			var splitTag = "-";

			var dd = dateStr.replace(",","."); 
			dd = dd.substring(0,4) +splitTag+ dd.substring(4,6)+splitTag+ dd.substring(6,11) +":"+ dd.substring(11,13)+":"+ dd.substring(13, dd.length);

			return this.convertTime(dd);    		
    	}
    	$portalUICntl.parseCalendarTime = function(dateStr, apmYN){
    		var self_ = this; 
    		var splitTag = "-";
			if(dateStr.length <= 0)	return "";
			//apmYN = (apmYN ? apmYN : true);
			
			var dd = dateStr.replace(",",".");
			dd = dd.substring(0,4) +splitTag+ dd.substring(4,6)+splitTag+ dd.substring(6,11) +":"+ dd.substring(11,13)+":"+ dd.substring(13, dd.length);
			var gmtDt = portalUICntl.parseISO8601Date(dd);
			
			if(apmYN){
	    		var hours = 12 - gmtDt.getHours();
	    		var apm = (hours <= 0 ?"PM ":"AM ");
	    		
	    		hours = (hours == 0 ? "12" : (hours > 0 ? gmtDt.getHours() : hours));
	            return apm + (Math.abs(hours)<10?"0"+Math.abs(hours):Math.abs(hours)) + ":" + (gmtDt.getMinutes()<10 ? "0"+gmtDt.getMinutes():gmtDt.getMinutes());			
			}else{
				var hours = gmtDt.getHours();
				return (hours<10?"0"+hours:hours)+(gmtDt.getMinutes()<10 ? "0"+gmtDt.getMinutes():gmtDt.getMinutes());
			}
			
    	}
    	
    	$portalUICntl.dateFromISO8601 =function (isostr){
    		isostr = isostr.replace(/\D/g," ");
    		var dtcomps = isostr.split(" ");

    	  // modify month between 1 based ISO 8601 and zero based Date
    		dtcomps[1]--;

    		return new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));
    	}
    	
    	$portalUICntl.getTextToXml =function (xml){
			var agt = navigator.userAgent.toLowerCase();
			if (agt.indexOf("msie") != -1) return $.parseXML(xml); 
			return $(xml);
    	}
    	
        $portalUICntl.convertTime = function(gmtTime){   
        	var self_ = this; 
        	//var gmtDt = gmtTime.isoToDate(); //this.parseISO8601Date(gmtTime); //new Date(gmtTime);
        	var gmtDt = self_.dateFromISO8601(gmtTime);
        	if(isNaN(gmtDt))	return gmtTime;
        	
        	if(self_.dateFormat(gmtDt,"yyyy-mm-dd") == self_.dateFormat(new Date(),"yyyy-mm-dd")){
        		return self_.dateFormat(gmtDt,"isoShortTime");
        	}else{
        		if(ePortalConfig.locale == "ko" || ePortalConfig.locale == "zh"){
            		return self_.dateFormat(gmtDt,"yyyy-mm-dd");
            	}else{
            		return self_.dateFormat(gmtDt,"mediumDate");
            	}
        	}
        	
        	/*	
            if(gmtDt.diffday(new Date()) == 0){	//today
            	return gmtDt.format("isoTime");
            }else{
            	if(ePortalConfig.locale == "ko" || ePortalConfig.locale == "zh"){
            		return gmtDt.format("yyyy-mm-dd");
            	}else{
            		return gmtDt.format("longDate");
            	}
            }
            */
        }
        
        $portalUICntl.dateFormat = function(date, masks){
        	return dateFormat(date, masks);
        }
        
        $portalUICntl.parseISO8601Date = function(gmtTime){
        	  // parenthese matches:
        	  // year month day    hours minutes seconds  
        	  // dotmilliseconds 
        	  // tzstring plusminus hours minutes
        	  var re = /(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(\.\d+)?(Z|([+-])(\d\d):(\d\d))/;
        	 
        	  var d = [];
        	  d = gmtTime.match(re);
        	 
        	  // "2010-12-07T11:00:00.000-09:00" parses to:
        	  //  ["2010-12-07T11:00:00.000-09:00", "2010", "12", "07", "11",
        	  //     "00", "00", ".000", "-09:00", "-", "09", "00"]
        	  // "2010-12-07T11:00:00.000Z" parses to:
        	  //  ["2010-12-07T11:00:00.000Z",      "2010", "12", "07", "11", 
        	  //     "00", "00", ".000", "Z", undefined, undefined, undefined]
        	 
        	  if (! d) {
        	    throw "Couldn't parse ISO 8601 date string '" + gmtTime + "'";
        	  }
        	 
        	  // parse strings, leading zeros into proper ints
        	  var a = [1,2,3,4,5,6,10,11];
        	  for (var i in a) {
        	    d[a[i]] = parseInt(d[a[i]], 10);
        	  }
        	  d[7] = parseFloat(d[7]);
        	 
        	  // Date.UTC(year, month[, date[, hrs[, min[, sec[, ms]]]]])
        	  // note that month is 0-11, not 1-12
        	  // see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/UTC
        	  var ms = Date.UTC(d[1], d[2] - 1, d[3], d[4], d[5], d[6]);
        	 
        	  // if there are milliseconds, add them
        	  if (d[7] > 0) {  
        	    ms += Math.round(d[7] * 1000);
        	  }
        	 
        	  // if there's a timezone, calculate it
        	  if (d[8] != "Z" && d[10]) {
        	    var offset = d[10] * 60 * 60 * 1000;
        	    if (d[11]) {
        	      offset += d[11] * 60 * 1000;
        	    }
        	    if (d[9] == "+") {
        	      ms -= offset;
        	    }
        	    else {
        	      ms += offset;
        	    }
        	  }
        	 
        	  return new Date(ms);        
        }
        
        $portalUICntl.dispErr = function(divId, message){
        	var fileNm = "error";
        	var htmlUrl = "/res/portal/html/static/"+fileNm+(ePortalConfig.locale != "ko" ? "_"+ePortalConfig.locale:"")+".html";
        	
			ajaxUtils.getText(htmlUrl,false, function(flag, resultData){
				if(flag){
	            	//var htmlObj = "";
	            	//htmlObj=$(resultData);
	            	//htmlObj.find('.src').html("<strong>Error</strong>"+message);

	            	$(divId).html(resultData);
				}
			});	        	
        	//$(divId).html(message);
        }
        
        $portalUICntl.noData = function(divId, message){
        	var fileNm = "no_data";
        	var htmlUrl = "/res/portal/html/static/"+fileNm+".html";
        	
			ajaxUtils.getText(htmlUrl,false, function(flag, resultData){
				if(flag){
					var htmlObj = "";
	            	htmlObj=$(resultData);
	            	htmlObj.find('.src').html("<strong></strong>"+message);

	            	if(divId) $(divId).html(htmlObj.html());
	            	else return htmlObj.html();
				}
			});	

        	//$(divId).html(message);
        }
        $portalUICntl.ext = function(fileName){
        	return (fileName.indexOf(".") < 0 ? "" : fileName.substring(fileName.lastIndexOf(".")+1, fileName.length));        	
        }
        $portalUICntl.getUsrCN = function(usrFullNm){
			var attr = "CN=";
			var cn = usrFullNm.substring(usrFullNm.indexOf(attr) + attr.length, usrFullNm.indexOf("\/"));
			return cn;
        }
        $portalUICntl.getUsrPhoto = function(userId){
			return "/photo/"+userId.replace(/\//g,",");
		}
		$portalUICntl.getImgPath = function(imgPath){
			//return "/"+ePortalConfig.mailServer+imgPath;
			return imgPath;
		}
		
		$portalUICntl.charLength=function(str){ 
			var s = str;
			var len = 0; 
			
			if (!s) return 0;
			
			s = $portalUICntl.trim(s.trim());
			
			for(var i=0;i<s.length;i++){ 
				var c = escape(s.charAt(i)); 
				if ( c.length == 1 ) len ++; 
				else if ( c.indexOf("%u") != -1 ) len += 2; 
				else if ( c.indexOf("%") != -1 ) len += c.length/3; 
			}
			return len; 
		}
		
		$portalUICntl.trim=function(str){ 
			return str.replace(/^\s|\s\s+|\s+$/g,"");
		}
		
		$portalUICntl.logWrite = function (url , type , options){
			/*
			userid	사용자 ID
			mail	사용자 메일
			browser	사용자 Browser
			act_type	구분 ( Action 구분 )
			act_name	구문명( Action명 )
			remotoip	접속자 IP 
			create_date	생성일시
			 * */
			
			ajaxUtils.logAjax({
				url : '/ngw/comm/portalLog.nsf/logform?openform'
				,type : "post"
				,data : {
					__Click : "0" /* 들어가야 합니다. */
					,userid : ePortalConfig.username
					,mail	: ePortalConfig.email
					,browser : (navigator?navigator.userAgent:'')
					,act_type : options.gubun
					,act_name : options.name
					,url : url
				}
				,success : function ( data, txt, xhr ) {
					
				}
			});
			return false; 
		}
		
		/**
		* url open 메소드
		* view 필수 항복  url, type , options{gubun:'menu , portlet, sso 등등'}
		* ex : 
		* domino ex : portalUICntl.page.view("comm.prototype",'domino',{gubun:'portlet', target:'contentArea'});
		* popup ex : portalUICntl.page.view("http://devportal01.amorepacific.com/",'popup',{gubun:'menu', name:'popup name', mehtod:'get or post',viewOption:'toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400'});
		* location ex : portalUICntl.page.view("http://devportal01.amorepacific.com/",'location',{gubun:'menu'});
		* dominoPopup ex : portalUICntl.page.view("/bbs/app.nsf/0/?opendocument",'dominoPopup',{argv:'&type=1&aa=ss', feathers:{width:'800',height:'500'},langpack:{langpack:"bbs.comm", langprefix:"BBS.COMM"});
		* 
		*/
		$portalUICntl.page ={
			view : function(url, type, options){
				
				$portalUICntl.logWrite(url ,type , options);
				
				if(globalOption.openType.domino== type){
					this._domino(url, options);
				}else if(globalOption.openType.iframe== type){
					this._iframe(url, options);
				}else if(globalOption.openType.popup== type){
					this._popup(url, options);
				}else if(globalOption.openType.dominoPopup == type){
					this._dominoPopup(url, options);
				}else{
					this._location(url);
				}
			}
			,_location:function (url){
				$('.fullPageLayout').empty(); // 페이지 나가기 메시지 때문에 추가.
				location.href=url;
			}
			,_domino:function (url , options){
				var tmpCorp = options.corp;
				tmpCorp = tmpCorp ?tmpCorp :(typeof ePortalConfig === 'undefined' ? '': ePortalConfig.companyCode);
				//$ep.wait(function() { 
					$ep.ui.loadFrameSet(tmpCorp,url,options.target);
				//}); 
			}
			,_popup:function (url, options){
				
				if (options.name == "메일1" || options.name == "메일" || options.name == "Mail" || options.name ==  "邮件") {		// My App 메일의 경우
					options.method = "get";
					url = "/" + ePortalConfig.mailFile + "/FrameMail?openform&opentype=popup";
					
				//	url = "http://" + location.host + url;
					
				} else if (options.name == "일정" || options.name == "일정관리" || options.name == "Calendar" || options.name ==  "日程" || options.name ==  "日程管理") {	// My App 일정의 경우
					options.method = "get";
					var cal_prefix = ePortalConfig.mailFile.split('/')[0];
					url = "/" + cal_prefix + "/cal/calendar.nsf/main?readform";
				} else if (url == "/wps/redirectSite.jsp?type=mail") {								// App 스토어 메일의 경우
					options.method = "get";
					url = "/" + ePortalConfig.mailFile + "/FrameMail?openform&opentype=popup";
				//	url = "http://" + location.host + url;
				} else if (url == "/wps/redirectSite.jsp?type=schedule") {								// App 스토어 일정의 경우
					options.method = "get";
					var cal_prefix = ePortalConfig.mailFile.split('/')[0];
					url = "/" + cal_prefix + "/cal/calendar.nsf/main?readform";
				} else if (url.indexOf("/($Drafts)/$new/?EditDocument") > -1) {								// 목록 상단 메일 작성 메뉴
					options.method = "get";
					url = "/" + ePortalConfig.mailFile + "/Memo?openform&opentype=popup";
					
					//메일을 HTTP로 서비스하기 위해서 수정한다.
					//url = "http://" + location.host + url;
				}		
				// 일정 조회
				if (url.indexOf("thisStartDate") > -1) {
					options.method = "get";
					var t_unid = url.split("/")[5].split("?")[0];
					var t_date = url.split(";")[1];
					url = "/" + ePortalConfig.mailServer + "/cal/calendar.nsf/main?open&unid=" + t_unid + "&ThisStartDate=" + t_date;
				}	
				
				var targetId = 'AP_'+generateUUID().replace(/-/g,''); 
				var tmpParam = options.param?options.param:{};
				var tmpMethod = options.method?options.method:globalOption.defaultPopupMethod;
				var tmpPopOption = options.viewOption?options.viewOption:'';
				var tmpName ='AP_'+(options.name?( options.name.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-+┼<>@\#$%&\'\"\\(\=]/gi,'') ):targetId.replace(/-/g,''));
				
				tmpParam=getParameter(url , tmpParam);

				var urlIdx = url.indexOf('?');
				var openUrl = urlIdx > 0 ?url.substring(0,urlIdx):url;
				
				
				// get method
				if(globalOption.httpMethod.get ==tmpMethod){
					tmpParam=paramToArray(tmpParam);

					openUrl= (tmpParam.length > 0) ?(openUrl+'?'+tmpParam.join('&')):url;
					
					try{
						var myWindow=window.open(openUrl,tmpName, tmpPopOption);
						myWindow.focus();
					}catch(e){}
				}else{  // post method
					var inputStr = [];
					
					inputStr.push('<form action="'+openUrl+'" method="post" id="'+targetId+'" name="'+targetId+'">');
					
					var tmpVal;
					for(var key in tmpParam){
						tmpVal = tmpParam[key];
						inputStr.push('<input type="hidden" name="'+key+'" value=\''+((typeof tmpVal==='string')?tmpVal:JSON.stringify(tmpVal))+'\'/>');
					}
					inputStr.push('</form>');
					inputStr.push('<script type="text/javascript">document.'+targetId+'.submit();</script>');
					
					//var tmpPopupObj=window.open('about:blank', tmpName, tmpPopOption);
					var tmpPopupObj=window.open('about:blank', "", tmpPopOption);
					
					try{
						tmpPopupObj.document.write(inputStr.join(''));
						tmpPopupObj.focus();
					}catch(e){
						console.log(inputStr.join(''))
						console.log(e);
					}
					
					
				}
			}
			,_dominoPopup:function(url, options){
				var arguments_ = options.argv?options.argv:'';
				var feathers_ = options.feathers?options.feathers:{};
				var langpack_ = options.langpack?options.langpack:{};
				
				$ep.wait(function() { 
					$ep.util.openPage(url,arguments_,feathers_,langpack_);
				});
			}
			,_iframe:function (url,options){
				var tmpiframe =$(options.target);
				var tmpParam = options.param?options.param:{};
				tmpParam=getParameter(url , tmpParam);
				
				var urlIdx = url.indexOf('?');
				var openUrl = urlIdx > 0 ?url.substring(0,urlIdx):url;
				
				tmpParam=paramToArray(tmpParam);
				openUrl= (tmpParam.length > 0) ?(openUrl+'?'+tmpParam.join('&')):url;
				
				tmpiframe.attr('src', openUrl);
				var cstyle=tmpiframe.attr('style');
				tmpiframe =tmpiframe.attr('style', cstyle+';'+ options.viewOption);
			}
		}
		
		function generateUUID() {
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c=='x' ? r : (r&0x7|0x8)).toString(16);
			});
			return uuid;
		};
		
		function getParameter(url, param){
			
			var paramSplit  = url.split('?');
			var paramLen = paramSplit.length;
			
			if(paramLen < 2) return param;
			
			var rtnval = param ? param : new Object();
			var parameters = paramSplit[1].split('&');
			
			var tmpKey='';
			for(var i = 0 ; i < parameters.length ; i++){
				var tmpPara = parameters[i].split('=');
				tmpKey=tmpPara[0];
				if(!rtnval[tmpKey]){
					rtnval[tmpKey]=tmpPara[1];
				}
			}

			if(paramLen > 2){
				var lastParam = '';
				for(var i=2; i<paramLen; i ++){
					lastParam = lastParam+'?'+paramSplit[i];
				}
				rtnval[tmpKey] = rtnval[tmpKey]+lastParam
			}
			
			return rtnval; 
		}
		
		// array으로 변환
		function paramToArray(param){
			var tmpArr = new Array();
			var tmpVal;	
			for(var key in param) {
				if(key) {
					tmpVal = param[key];
					if(tmpVal){
						tmpArr.push( key+'='+ ( (typeof tmpVal=='string')?tmpVal:JSON.stringify(tmpVal) ) );
					}else{
						tmpArr.push(key);
					}
					
				}
			}
			return tmpArr; 
		}
		
		var dateFormat = function () {
    		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    			timezoneClip = /[^-+\dA-Z]/g,
    			pad = function (val, len) {
    				val = String(val);
    				len = len || 2;
    				while (val.length < len) val = "0" + val;
    				return val;
    			};

    		// Regexes and supporting functions are cached through closure
    		return function (date, mask, utc) {
    			var dF = dateFormat;

    			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
    				mask = date;
    				date = undefined;
    			}

    			// Passing date through Date applies Date.parse, if necessary
    			date = date ? new Date(date) : new Date;
    			if (isNaN(date)) throw SyntaxError("invalid date");

    			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    			// Allow setting the utc argument via the mask
    			if (mask.slice(0, 4) == "UTC:") {
    				mask = mask.slice(4);
    				utc = true;
    			}

    			var	_ = utc ? "getUTC" : "get",
    				d = date[_ + "Date"](),
    				D = date[_ + "Day"](),
    				m = date[_ + "Month"](),
    				y = date[_ + "FullYear"](),
    				H = date[_ + "Hours"](),
    				M = date[_ + "Minutes"](),
    				s = date[_ + "Seconds"](),
    				L = date[_ + "Milliseconds"](),
    				o = utc ? 0 : date.getTimezoneOffset(),
    				flags = {
    					d:    d,
    					dd:   pad(d),
    					ddd:  dF.i18n.dayNames[D],
    					dddd: dF.i18n.dayNames[D + 7],
    					m:    m + 1,
    					mm:   pad(m + 1),
    					mmm:  dF.i18n.monthNames[m],
    					mmmm: dF.i18n.monthNames[m + 12],
    					yy:   String(y).slice(2),
    					yyyy: y,
    					h:    H % 12 || 12,
    					hh:   pad(H % 12 || 12),
    					H:    H,
    					HH:   pad(H),
    					M:    M,
    					MM:   pad(M),
    					s:    s,
    					ss:   pad(s),
    					l:    pad(L, 3),
    					L:    pad(L > 99 ? Math.round(L / 10) : L),
    					t:    H < 12 ? "a"  : "p",
    					tt:   H < 12 ? "am" : "pm",
    					T:    H < 12 ? "A"  : "P",
    					TT:   H < 12 ? "AM" : "PM",
    					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
    					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
    					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
    				};

    			return mask.replace(token, function ($0) {
    				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    			});
    		};
    	}();

    	// Some common format strings
    	dateFormat.masks = {
    		"default":      "ddd mmm dd yyyy HH:MM:ss",
    		shortDate:      "m/d/yy",
    		mediumDate:     "mmm d, yyyy",
    		longDate:       "mmmm d, yyyy",
    		fullDate:       "dddd, mmmm d, yyyy",
    		shortTime:      "h:MM TT",
    		mediumTime:     "h:MM:ss TT",
    		longTime:       "h:MM:ss TT Z",
    		isoDate:        "yyyy-mm-dd",
    		isoTime:        "HH:MM:ss",
    		isoShortTime:   "HH:MM",
    		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    	};

    	// Internationalization strings
    	dateFormat.i18n = {
    		dayNames: [
    			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    		],
    		monthNames: [
    			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    		]
    	};
		
        return $portalUICntl;
    })();

    window.portalUICntl = portalUIController;
})(window);

$.fn.errimgload = function(imgOpt) {
	
	var changeImg = '/res/portal/img/no_photo.png';
	if(imgOpt){
		if(typeof imgOpt ==='string'){
			changeImg =imgOpt; 
		}else if(typeof imgOpt ==='object'){
			changeImg = imgOpt.changeImg?imgOpt.changeImg:changeImg;
		}
	}
	var base = this; 
	
	return base.each(function() {
		if (this.tagName.toLowerCase() != 'img') return;
		
		var $_orig = $(this);

		$_orig.one('error', function() {
			$_orig.attr('src',changeImg);
		});

		return ; 
	})
	
};

+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop';
  var toggle   = '[data-toggle="dropdown"]';
  var Dropdown = function (element, option) {
	Dropdown._options = option;
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.2'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }
      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()){
 		 if($this.attr('bgiframe')=='true') $($parent.find('.dropdown-menu')).bgiframe();
 		return
 	  }

       $this
         .trigger('focus')
         .attr('aria-expanded', 'true')

       $parent
         .toggleClass('open')
         .trigger('shown.bs.dropdown', relatedTarget)
 	
 		if($this.attr('bgiframe')=='true') $($parent.find('.dropdown-menu')).bgiframe();
    }

    return false;
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--                        // up
    if (e.which == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
	option = $.extend({
		opt:(typeof option === 'string')?option:false
		,bgiframe:true
	}, option);
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')
	  $this.attr('bgiframe',option.bgiframe);

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this, option)))
      if (option.opt) data[option.opt].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
//    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
//    .on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown)
//    .on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown)

}(jQuery);



/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version 3.0.1
 *
 * Requires jQuery >= 1.2.6
 */
(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ( typeof exports === 'object' ) {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.fn.bgiframe = function(s) {
        s = $.extend({
            top         : 'auto', // auto == borderTopWidth
            left        : 'auto', // auto == borderLeftWidth
            width       : 'auto', // auto == offsetWidth
            height      : 'auto', // auto == offsetHeight
            opacity     : true,
            src         : 'javascript:false;',
            conditional : true//(navigator.userAgent.toLowerCase().indexOf("msie") != -1) // expression or function. return false to prevent iframe insertion
        }, s);

        // wrap conditional in a function if it isn't already
        if ( !$.isFunction(s.conditional) ) {
            var condition = s.conditional;
            s.conditional = function() { return condition; };
        }
        
        var $iframe = $('<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"style="display:block;position:absolute;z-index:-1;"/>');

        return this.each(function() {
            var $this = $(this);
            if ( !s.conditional(this)) { return; }
            var existing = $this.children('iframe.bgiframe');
            var $el = existing.length === 0 ? $iframe.clone() : existing;
            $el.css({
                'top': s.top == 'auto' ?
                    ((parseInt($this.css('borderTopWidth'),10)||0)*-1)+'px' : prop(s.top),
                'left': s.left == 'auto' ?
                    ((parseInt($this.css('borderLeftWidth'),10)||0)*-1)+'px' : prop(s.left),
                'width': s.width == 'auto' ? (this.offsetWidth + 'px') : prop(s.width),
                'height': s.height == 'auto' ? (this.offsetHeight + 'px') : prop(s.height),
                'opacity': s.opacity === true ? 0 : undefined
            });

            if ( existing.length < 1 ) {
                $this.prepend($el);
            }
        });
    };

    // old alias
    $.fn.bgIframe = $.fn.bgiframe;

    function prop(n) {
        return n && n.constructor === Number ? n + 'px' : n;
    }

}));

/*
 * page navigation
 * $('#viewnavigator').pagingNav({
		total :60
		,pageno:1
		,countPerPage :10
		,unitPage:10
	}, function (no){
		alert(no)
	});
 */
$.fn.pagingNav = function(options, callback) {
	if(!options){
		$(this).html('');
		return false;
	}
	function getPageObject(count, cPage, vPage, uPage) {
		var totalCount=parseInt(count,10); // 전체 데이터 row 개수 저장
		var currPage = parseInt(cPage,10); // 현재 페이지 지정 ( 기본 : 1)
		var countPerPage = parseInt(vPage,10); // 한 페이지에 출력할 갯수 지정
		var unitPage = parseInt(uPage,10); // 페이지 단위
		var unitCount = 100; // 자료 표시 단위
		var totalPage; // 전체 페이지 수 저장
		var currStartCount; // 현재 화면에 표시되는 첫라인
		var currEndCount; // 현재 화면에 표시되는 마지막라인
		var prePage; // 이전 페이지
		var prePage_is; // 이전 페이지 존재 여부
		var currStartPage; // 페이지 번호 시작값
		var currEndPage; // 페이지 번호 마지막값
		var nextPage; // 다음 페이지
		var nextPage_is; // 이후 페이지 존재 여부
		var listBackPage; // 돌아갈 페이지
		var isFirst = false; // 처음인 경우는 totalCount를 구함.

		function getMaxNum(allPage, list_num) {
			var tmpMaxNum = parseInt((allPage / list_num),10);
			return (allPage % list_num) == 0 ? tmpMaxNum :tmpMaxNum+1;
		}
		
		if (totalCount == 0) {
			countPerPage = unitCount;
		} else if (totalCount < countPerPage) {
			countPerPage = parseInt((totalCount / unitCount),10) * unitCount;
			if ((totalCount % unitCount) > 0) {
				countPerPage += unitCount;
			}
		}

		totalPage = getMaxNum(totalCount, countPerPage);

		if (totalPage < currPage) {
			currPage = totalPage;
		}

		if (currPage != 1) {
			currEndCount = currPage * countPerPage;
			currStartCount = currEndCount - countPerPage;
		} else {
			currEndCount = countPerPage;
			currStartCount = 0;
		}

		if (currEndCount > totalCount) {
			currEndCount = totalCount;
		}

		if (totalPage <= unitPage) {
			currEndPage = totalPage;
			currStartPage = 1;
		} else {
			currEndPage = parseInt(((currPage - 1) / unitPage),10) * unitPage + unitPage;
			currStartPage = currEndPage - unitPage + 1;
		}

		if (currEndPage > totalPage) {
			currEndPage = totalPage;
		}

		if (currStartPage != 1) {
			prePage_is = true;
			prePage = currStartPage - 1;
		} else {
			prePage_is = false;
			prePage = 0;
		}

		if (currEndPage != totalPage) {
			nextPage_is = true;
			nextPage = currEndPage + 1;
		} else {
			nextPage_is = false;
			nextPage = 0;
		}
		
		return {
			"currPage":currPage
			,"unitPage":unitPage
			,"prePage": prePage
			,"prePage_is": prePage_is
			,"nextPage": nextPage
			,"nextPage_is": nextPage_is
			,"currStartPage" : currStartPage
			,"currEndPage": currEndPage
			,"totalCount": totalCount
			,"totalPage": totalPage
		};
	}
	
	options = getPageObject(
		options.total
		,options.pageno
		,options.countPerPage
		,options.unitPage
		,options.totalPage
	);

	var currP = options.currPage ;
	if(currP == "0") currP = 1;
	var preP_is = options.prePage_is;
	var nextP_is = options.nextPage_is;
	var currS = options.currStartPage;
	var currE = options.currEndPage;
	var totP  = options.totalPage;
	var unitP = options.unitPage;

	if(currE == "0") currE = 1;
	//var nextO = 1*currP+1;
	//var preO = currP - 1;
	var nextO = currE + 1;
	var preO = currS - 1;
	
	var strHTML=new Array();
/*
	strHTML.push('<table cellpadding="0" cellspacing="0 border="0"><tbody><tr>');
	if (preP_is){
		strHTML.push('	<td class="navigator prev page-click" pageno="'+preO+'"><a href="javascript:">&laquo;</a></td>');
	}else{
		if (currP<=1)
		{
			strHTML.push('	<td class="navigator prev disabled"><a href="javascript:">&laquo;</a></td>');
		}else{
			strHTML.push('	<td class="navigator prev page-click" pageno="'+preO+'"><a href="javascript:">&laquo;</a></td>');
		}
	}
	var no=0;

	for (no = currS*1; no <= currE*1; no++){
		if ( no == currP ){
			strHTML.push('	<td class="navigator page selected" title="'+no+'">'+no+'</td>');
		}else{
			strHTML.push('	<td class="navigator page page-click" title="'+no+'" pageno="'+no+'">'+no+'</td>');
		}
	}

	if(nextP_is){
		strHTML.push('	<td class="navigator next page-click" pageno="'+nextO+'"><a href="javascript:">&raquo;</a></td>');		
	}else{
		if (currP==currE)
		{
			strHTML.push('	<td class="navigator next disabled"><a href="javascript:">&raquo;</a></td>');
		}else{
			strHTML.push('	<td class="navigator next page-click" pageno="'+nextO+'"><a href="javascript:">&raquo;</a></td>');	
		}
	}

	strHTML.push('	</tr></tbody></table>');
*/
	strHTML.push('<ul class="pagenav">');
	if ( currS > unitP ){
		strHTML.push('	<li class="first page-click" pageno="1"><span></span></li>');
		strHTML.push('	<li class="prev  page-click" pageno="'+preO+'"><span></span></li>');
	}
	
	var no=0;	
	for (no = currS*1; no <= currE*1; no++){
		if ( no == currP ){
			strHTML.push('	<li class="current" title="'+no+'"><span>'+no+'</span></li>');
		}else{
			strHTML.push('	<li class="page-click" title="'+no+'" pageno="'+no+'"><span>'+no+'</span></li>');
		}
	}
	if (currE != totP) {
		strHTML.push('	<li class="next page-click" pageno="'+nextO+'"><span></span></li>');
		strHTML.push('	<li class="last page-click" pageno="'+totP+'"><span></span></li>');
	}	
	
	
	
	var pagingEle = $(this);
	pagingEle.html(strHTML.join(''));
	
	pagingEle.disableSelection();

	pagingEle.find('.page-click').click(function (){
		
		$('.page-click.selected').removeClass('selected');
		$(this).addClass('selected');

		var sNo = $(this).attr('pageno');
		
		if (typeof callback == 'function') {
			callback(sNo);
		}else{
			try{
				nextPage(sNo);
			}catch(e){}
		}
	});
};
