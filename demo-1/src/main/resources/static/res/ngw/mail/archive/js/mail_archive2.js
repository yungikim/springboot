/**
 *  메일 아카이빙...
 */
function mail_archive2 (){}
$ep.inheritStatic(mail_archive2,"MAIL.ARCHIVE2");
$.extend(mail_archive2, {
	viewInit : function(obj){
		debugger;
		if(obj.title) {
			if (obj.title=='') {
				$('.view-title').html("{ALLLIST}");
			} else {
				$('.view-title').html(obj.title);
			}
		}
		
		$ep.ui.view(".viewpage",$.extend(true, {
			//url : "/arch/monitor.nsf/agt_essearch?openagent&ty=list&IsTotal=T&cpage=1&perpage=10&empno=&query=&sdate=&edate=&filter=all&companycode=1&category=&del=F"
			
			column : {
				selectable : "checkbox"
	
					
					
				,from : {
					title : "{FROM}"
					,css : {"text-align": "center",width: "150px"}
					/*,hcss : {"text-align": "center",width: "220px"}	*/		
				}				
				,dissendto:{
					title : "{RECIPIENTS}"
					,css : {"text-align": "center",width: "150px"}
				}
				,_icon : {
					css : {width: "20px"}
					,classes : "txtC"
					,render : function(tr,td,data,col){
						if (data.attachname != ""){
							return '<p class="ep-icon attachment" />';
						}else{
							return '';
						}
						
					}
					,hidewidth : true
				}				
				
				,subject : {
					title : "{SUBJECT}"
					,hcss : {"text-align": "center"}
				}
				
			//	,foldername : {
			//		title : "{FOLDERNAME}"
			//		,css : {"text-align": "center",width: "220px"}
			//		/*,hcss : {"text-align": "center",width: "220px"}*/
			//	}

				,timez : {
					title : "{DATE}"
					,type : "isodate"
					,dateformat : "fullDateTime"
					,css : {"text-align": "center",width : "150px"}
					/*,hcss : {"text-align": "center",width : "180px"}*/
				}
				
				,docsize : {
					title : "{SIZE}"
					,css : {"text-align" : "center", width: "120px"}
				}
			}
			,search : {
				icon : "search"
				,select : {
					items : {
						Total : "{TSEARCH}"
						,subject : "{SUBJECT}"
						,from : "{FROM}"
						,scb : "{RECIPIENTS}"
					}
					,width : 100
				}
			}
			,actions : {
				action : {
					
					btn1 : {
						text : "{FOLDERMNG}"
						,show : true 
						,click : function(a,b,c,d,e) {
						//	debugger;
						//	alert("DD");
						//	var rex = this.getSelected();
							debugger;
							
							$ep.ui.dialog({							
								
								content : { url : "/" + obj.mailmaster + "/mail/archive/archive.nsf/foldermanage?openform&epcall=y&act=mng"}
								,width : 600
							    ,height : 550
							    ,title : "{ARCHIVEFOLDERMNG}"
							    ,buttons : [
							    	{
							    			//취소
							    		text : "{OK}"
							    		,highlight : true
							    		,click : function(){
							    			$(this).epdialog("close")
							    		}
							    	}
							    ]
							},mail_archive2);
															
			
							
						}
					}
					,btn2 : {
						text : "{DELETE}"
						,show : true
						,click : function(){
							debugger;
							var _self = this;
							var _dialog = this;
							var rex = this.getSelected();
							var list = new Array();
							for (i =0 ; i < rex.length; i++){
								//alert(rex[i].data._id);
								list.push(rex[i].data._id)
							}
							if (list.length == 0){
								//삭제할 메일을 선택해 주세요
								alert(mail_archive2.LangString("DELCONFIRM"));return false;
							}
							
							
							var _userAction = "del_archive_doc";
							var baseurl = $.CURI("/arch/monitor.nsf/action_form?openform");
							var inputdata = {
									__Click : "0", ActKind : _userAction,
									DocUNIDs : list.join(","), EmpNo: obj.empno, uniquekey: obj.uniquekey
							}
																		//삭제중입니다.
							var _block = $ep.util.blockUI({message :   mail_archive2.LangString("DELING") + "......"});
							$.ajax({
								url: baseurl.url,
								type: "POST",
								data: inputdata,
								dataType: "html",
								async : true,
								success : function(data, status, xhr){
									setTimeout(function() {
										_self.refresh().done(function() {
											//alert("들어와")
										//	$ep.log("done2....1");
											_block.unblock();
										//	$ep.log("done2....2");
										
										});	
									},1000);
													
								}
							})
							
									
						}
					}
					,btn3 : {
						text : "{MOVE}"
						,show : true
						,click : function() {
							debugger;
							var _self = this;
							//debugger;
							 			
			    			
			    			var rex = _self.getSelected();
							var list = new Array();
							for (i =0 ; i < rex.length; i++){
								list.push(rex[i].data._id)
							}
							//alert(list.length);
							if (list.length == 0){
								//이동할 문서를 선택해 주세요
								alert(mail_archive2.LangString("MOVECONFIRM")); return false;
							}
							
							
							
							$ep.ui.dialog({							
								
								content : { url : "/" + obj.mailmaster + "/mail/archive/archive.nsf/foldermanage?openform&epcall=y&act=move"}
								,width : 600
							    ,height : 550
							    ,title : "{ARCHIVEFOLDERMOVE}"
							    ,buttons : [
							    	{
							    		     //확인
							    		text :"{OK}"
							    		
							    		,highlight : true
							    		,click : function() {
							    			//alert("확인 클릭");
							    			var _dialog = this;
							    			
											debugger;
											var tree = $ep.ui.tree($("#treeFolderSelect",this))											
											var _activenode = tree.getActiveNode();
											var targetNodeName = _activenode.title;
											var targetNodeCode = _activenode.key;
											
											var _userAction = "move_archive_doc";
											var baseurl = $.CURI("/arch/monitor.nsf/action_form?openform");
											var inputdata = {
													__Click : "0", ActKind : _userAction,
													DocUNIDs : list.join(","), EmpNo: obj.empno,
													FolderName : targetNodeName, FolderCode : targetNodeCode, uniquekey : obj.uniquekey
											}
													                                  //메일을 이동중입니다
											var _block = $ep.util.blockUI({message :   mail_archive2.LangString("MOVEMAIL") + "......"});
											$ep.util.ajax({
												url: baseurl.url,
												type: "POST",
												data: inputdata,
												dataType: "html",
												async : false,
												success : function(data, status, xhr){
													setTimeout(function (){
														_self.refresh().done(function() {														
															//	$ep.log("done2....1");
																_block.unblock();
															//	$ep.log("done2....2"); 	
																$(_dialog).epdialog("close");
															});	
													}, 1000)												
												}
											})									
							    			
							    		}
							    	}
							    	,{
							    			//취소
							    		text : "{CANCEL}"
							    		,click : function(){
							    			$(this).epdialog("close")
							    		}
							    	}
							    ]
							},mail_archive2);
						}
					}
					
				}
			}
			,rowdatapath : "hits.hits"
			,datapath : "fields"
			,events : {
				viewuri : function(opt) {
						debugger;
						
						var list_category = "";
						var filter = "";
						var query = "";
						var isTotal = "T";
						
						if (typeof(opt.search_option) == "undefined"){	

						}else if (opt.search_option.field == "Total"){
						//	debugger;
						//	alert("opt.search_option.field :  " + opt.search_option.field);
							isTotal = "T";
							query = "*" + encodeURIComponent(opt.search_option.query) + "*";
					    }else{
							query = opt.search_option.field + "-spl-" + "*" + encodeURIComponent(opt.search_option.query) + "*";
							isTotal = "F";
						}
						
						list_category = obj.category;
						if (typeof(opt.arch_category) != "undefined"){
							list_category = opt.arch_category;
						//	isTotal = "F";
						}

						var _uri = $.CURI("/arch/monitor.nsf/agt_essearch_mail?openagent" ,{						
							ty : "list"
							,IsTotal : isTotal
							,cpage : parseInt(opt.query.page) + 1
							,perpage : opt.query.ps
							,uniquekey : obj.uniquekey
							,empno : obj.empno
							,query : query
							,sdate : ""
							,edate : ""
							,filter : filter
							,companycode : obj.companycode
							,category : list_category
							,del : "F"
							,tmp : new Date().getTime()
						});
					return _uri.url;
				}
				,beforeData : function() {this.total = undefined;}
				,afterData : function(data) {
					this.total = data.hits.total;
					if (this.options.title != '') $('.view-title',$ep.ui.active()).html(this.options.title);
				}
				,click : function(a, b, c) {
					//목록에서 메일 상세 조회 클릭했을 경우
					debugger;
					
					$ep.util.ajax({						
						url : "/arch/monitor.nsf/agt_archive_restore_person?openagent&sabun="+obj.empno+"&unid="+c._id + "&ms="+ obj.curhost + "&" + new Date().getTime()
						,dataType : "text"
						,complete : function(data,stat,xhr) {
						//	debugger;							
							//alert(data.responseText);
						//	alert($ep.util.browser.msie);
						//	alert($ep.util.browser.ie9);
							var url = "/"+ obj.mailpath +"/0/"+data.responseText + "?opendocument"+ "&" + new Date().getTime();
							if ($ep.util.browser.msie){
								window.open(url,"","width=1000, height=700, resizable=yes");
							}else{
								$ep.ui.dialog({
									//content : { url : "/res/ngw/mail/archive/html/dialog_tree.html"}
									content : {url : url}
									,title : c.fields.subject
									,iframe : true 
									,width : 1100
								    ,height : 700
								});
							}
						}
					});

				}
			}
			,extcount : function(callback) {
				//debugger;
				var _self = this
					,_callback = callback;
				function _wait() {
					if(_self.total === undefined) {setTimeout(function() {_wait();},100);return;}
					_callback(_self.total);
				}
				_wait();
			}
		},obj),mail_archive2);
	}
	,sideInit : function(obj2) {
		$ep.ui.sidemenu($(".epSideMenu",$ep.ui.activeNav()),{
			title : "{MAILARCHIVE}"
			,items : [
			   {
				  text : "{ALLLIST}" //전체 리스트보기
				  //,href : "/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_list?readform&title=" + "{ALLLIST}"
				  ,click : function() {
					  mail_clickmenu("/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_list?readform", "", mail_archive2.LangString("ALLLIST"));
				   }				  
			   }

				,{
					text : "{SEARCH_TITLE}" //아카이빙 상세검색
					,ishide : (obj2.tempuser == "F" ? false : true)						
					,href : "/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_dsearch?readform"
				}
			   
			   ,{
				   text : "{ARCHIVE_INBOX}" //받은편지함
				   //,ishide : (obj2.tempuser == "T" ? false : true)
				   //,href : "/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_list?readform&category=inbox&title=" + "{ARCHIVE_INBOX}"
				   ,click : function() {
					   mail_clickmenu("/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_list?readform", "inbox", mail_archive2.LangString("ARCHIVE_INBOX"));
				   }
			   }
			   
			   ,{
				   text : "{ARCHIVE_SENT}" //보낸편지함
				   //,ishide : (obj2.tempuser == "T" ? false : true)
				   //,href : "/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_list?readform&category=sent&title=" + "{ARCHIVE_SENT}"
				   ,click : function() {
					   mail_clickmenu("/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_list?readform", "sent", mail_archive2.LangString("ARCHIVE_SENT"));
				   }
			   }
			   
			   /*
			   ,{
				   text : "{UPLOADMAIL}" //ODM에서 업로드 한 메일 보기
				   //,href : "/devapnhqmail01/mail/archive/archive.nsf/popup_archive_list?readform" 
				   ,click : function() {
				
					   $(".viewpage",$ep.ui.active()).trigger("ep.ui.view.method",["setOptions",{
						    arch_category : "upload"
					   }]);
					   $(".viewpage",$ep.ui.active()).trigger("ep.ui.view.method", ["redraw"]);
				   }
			   }
			   */
			   ,{
					  text : "{ARCHIVEFOLDER}"  //개인이 생성한 폴더 보기
					  ,isopen : true
					  ,items : [
							{
								  text : function(e) {
									  var _html = $('<div id="archive_tree" />');
									  return $ep.ui.tree(_html,{
							  			 source : [
//							  				      	{"title": "Tree1" },
//							  				    	{"title": "Tree2", folder : true 
//							  				    	  ,children : [ 
//							  				    	     {title : "Tree2-1"},
//							  				    	     {title : "Tree2-2"},
//							  				    	     {title : "Tree2-3"}
//							  				    	              
//							  				    	  ] 
//							  				    	},
//							  				    	{"title": "Tree3" }    			           
									    			 ] 
									  		,click : function(a,b,c,d,e) {
									  			if (b.targetType=='title') {
									  				mail_clickmenu("/"+obj2.mailmaster+"/mail/archive/archive.nsf/popup_archive_list?readform", b.node.key, b.node.title);
									  			}							  			
									  		}
									  }).element;  
								  }			          
							}         
					   ]
				   }
			]
		},mail_archive2); 
	}
});

function mail_clickmenu(url, category, title){
	if ($ep.ui.getPageHref().indexOf('popup_archive_list') > -1) {
		$(".viewpage",$ep.ui.active()).trigger("ep.ui.view.method",["setOptions",{
			arch_category : category
		}]);
		$(".viewpage",$ep.ui.active()).trigger("ep.ui.view.method", ["redraw"]);
		$ep.ui.view(".viewpage").options.title = title;
	} else {
		var _url = url + "&category="+category+"&title="+title;
		$ep.ui.loadPageLang($ep.ui.active(), _url, mail_archive2);									  					
	}	
}