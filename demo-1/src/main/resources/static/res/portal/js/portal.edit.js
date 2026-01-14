/**
 * author : ytkim
 */
(function(window) {

    var _portalController = (function() {
        var $portalCntl = function() {},
			epConfig = (typeof ePortalConfig === 'undefined' ? {} : ePortalConfig),
            epLang = (typeof epConfig.locale === 'undefined' ? 'ko' : epConfig.locale),
			localeResource={
				'morelang' : (epLang == 'ko' ? '이동' : 'Go'),
                'deletelang' : (epLang == 'ko' ? '삭제' : 'Delete'),
				'refreshlang' : (epLang == 'ko' ? '새로고침' : 'Refresh'),
                'deleteMessageLang' : (epLang == 'ko' ? '삭제 하시겠습니까?' : 'It Deleted?'),
				'accessMsg.add' : (epLang == 'ko' ? '등록 권한 없음' : 'No permission'),
				'accessMsg.del' : (epLang == 'ko' ? '삭제 권한 없음' : 'No permission')
			},
            portalOption = {
				maxItemCount:-1,
				defaultLang :'ko',
				editActionFlag: false,
				isWaitImg : false,
                addPortletPosition: 'last',
                container: 'div.component-container',
				sortableContainer: this.container,
				component: 'div.component-control',
                categoryId: 'category.menu',
				isVirturlCategory:false,
                dragHandle: '.component-control',
				skinPortletTitle:'span[dir="ltr"]',
				actionType:{
					move:'move'
					,add:'add'
					,del:'del'
					,mod:'mod'
				},
				actionObject:{
					category:'catg'
					,portlet :'porltet'
					,menu:'menu'
				},
				portalMenuObj:'.portal-gnb-menu',
				isAddPortletSkinTemplate:false,
				isPortalMenuMove:false,
				initPortletDrag:false,
				themeUniqueNM:'ep.themeMypage',
				tokenFormURI : '/wps/mycontenthandler/mashup/ra:collection?mime-type=text/plain&entry=wp_dnd_main__0.0%3aconfig_markup&deferred=true',
                portletPreviewDivId: '#portletPreviewDivId',
                config: epConfig,
                themeConfig: (typeof themeConfig === 'undefined' ? {} : themeConfig),
                portalLang: epLang,
                isConsole: false,
                isLogUse: false,
                isAccessMsg: false,
				tokenFormHTML:false,
                accessControl: {
                    createPage: true,
                    editLayout: true,
                    deletePage: false,
                    assignRoles: false
                },
                btnCntlFunc: function(id) {
                    $portalCntl.portlet._btnEvent(id)
                },
                deleteFunc: function(id) {
                    $portalCntl.portlet.del(id);
                },
				defaultSkin: function (){
					var skinHtm = new Array();
					skinHtm.push('<section class="type1">');
					skinHtm.push('	<div class="panel-heading portlet-title">');
					skinHtm.push('		<a rel="dynamic-content" href="lm:title"></a>');
					skinHtm.push('	</div>');
					skinHtm.push('	<div class="panel-body">');
					skinHtm.push('		<a rel="dynamic-content" href="lm:control"></a> ');
					skinHtm.push('	</div>	');
					skinHtm.push('</section>');
					
					return skinHtm.join('');
				},
				addPortletTemplate: function (){
					return '<li class="id-portlet_contorl_id_text"><span class="portlet-drag-item">@{lmtitleTextArea}</span></li>';
				}
				,replaceSkinHTML:''
				,atomXml: function (atomXml){
					var pageTemplate = new Array();
			
					pageTemplate.push('<?xml version="1.0" encoding="UTF-8"?>');
					pageTemplate.push('<atom:feed');
					pageTemplate.push('	xmlns:base="http://www.ibm.com/xmlns/prod/websphere/portal/v6.0/ibm-portal-composite-base"');
					pageTemplate.push('	xmlns:creation-context="http://www.ibm.com/xmlns/prod/websphere/portal/v6.1.0/portal-creation-context"');
					pageTemplate.push('	xmlns:model="http://www.ibm.com/xmlns/prod/websphere/portal/v6.0.1/portal-model-elements"');
					pageTemplate.push('	xmlns:portal="http://www.ibm.com/xmlns/prod/websphere/portal/v6.0.1/portal-model"');
					pageTemplate.push('	xmlns:thr="http://purl.org/syndication/thread/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
					pageTemplate.push('	xmlns:atom="http://www.w3.org/2005/Atom">');

					pageTemplate.push('<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">');
					pageTemplate.push(atomXml);
					pageTemplate.push('</atom:entry>');
					pageTemplate.push('</atom:feed>');

					return pageTemplate.join('');
				}
				,portletDragOption:{}
            },
            portletInfo = new Object(),
			g_portletInfoArr = new Array();
			
        $portalCntl.init = function(option) {
			_setDefaultOption(option);

            $portalCntl.portlet._btnInit();
            $portalCntl.portlet._setDrag(option.portletDragOption);
            _containerResize(portalOption.container);

			if(portalOption.initPortletDrag) _tokenFormLoad();
		}
		
		$portalCntl.getOption = function(key) {
			return portalOption[key];
        }

		$portalCntl.getPortletInfo = function() {
			return portletInfo;
        }

		$portalCntl.getEditFlag = function() {
			return portalOption.editActionFlag;
        }

		$portalCntl.maxItemCount = function() {
			return portalOption.maxItemCount;
        }

		$portalCntl.allPortletInfo = function() {
			return g_portletInfoArr;
        }

		$portalCntl.pagePortletObjectId = function(pageOID) {
			return $portalCntl.portlet.currentPageObjectId(pageOID);
        }

        $portalCntl.log = function() {
            if (!portalOption.isLogUse) return;
            if (portalOption.isConsole) {
                console.log(arguments);
            } else {
                var args = Array.prototype.slice.call(arguments);
                if (typeof JSON !== 'undefined') {
                    alert(JSON.stringify(args))
                } else {
                    alert(args.join('\n'));
                }
            }
        }

		$portalCntl.getOID = function(cssClass) {
            return getOID(cssClass);
        }

		$portalCntl.startPortletDrag=function(option) {
			portalOption.initPortletDrag = true; 
			$portalCntl.portlet._setDrag(option);
		}

		$portalCntl.stopPortletDrag=function(option) {
			$portalCntl.portlet._stopDrag(option);
		}

		$portalCntl.category ={
			list :function(option) {
				var pageOID, callback;
				pageOID = option.pageOID ? option.pageOID : portalOption.categoryId;
				callback = option.callback ? option.callback : function(data) {
					alert('callback define \n' + data)
				};
				
				$portalCntl.req.ajax({
					url: getContentHandlerUri(portalOption.actionObject.category) + "?uri=nm:oid:" + pageOID + "&levels=2&rep=full",
					cache: false,
					dataType: "text",
					contentType: 'application/xml; charset=utf-8',
					success: function(xml) {
						xml =_getTextToXml(xml); 
						var uniquename = '';
						var tmpEntry, tmpInfo, result = new Array();
						$(xml).find('atom\\:entry').each(function(i, item) {
							tmpEntry = $(item);
							uniquename = tmpEntry.find('atom\\:id').attr('portal:uniquename');

							if (uniquename != pageOID) {
								tmpInfo = new Object();
								tmpInfo['title'] = tmpEntry.find("base\\:nls-string[xml\\:lang=" + portalOption.portalLang + "]").text();
								tmpInfo['title'] = tmpInfo['title']?tmpInfo['title'] : tmpEntry.find("base\\:nls-string[xml\\:lang=" + portalOption.defaultLang + "]").text();
								tmpInfo['id'] = tmpEntry.find('atom\\:id').text().replace('nm:oid:', '');
								result.push(tmpInfo);
							}
						});

						 
						callback(result);
					},
					error: function(xhr, status, e) {
						$portalCntl.log(status + " : " + e + xhr.responseText);
					}
				});
				return true;
			},
			contentList : function(option) {
				var pageOID, callback;
				pageOID = option.pageOID ? option.pageOID : portalOption.categoryId;
				callback = (typeof option.callback  === "function") ? option.callback : function(data) {
					alert('callback define \n' + data)
				};
				
				$portalCntl.req.ajax({
					url: getContentHandlerUri(portalOption.actionObject.category) + "?uri=lm:oid:" + pageOID + "&rep=full",
					cache: false,
					dataType: "text",
					contentType: 'application/xml; charset=utf-8',
					success: function(xml) {
						xml =_getTextToXml(xml);
						var tmpEntry;
						var result = new Array();
						var tmpInfo;
						$(xml).find('atom\\:entry').each(function(i, item) {
							tmpEntry = $(item);
							if (tmpEntry.find("model\\:layout-control").length == 1) {
								tmpInfo = new Object();
								tmpInfo['title'] = tmpEntry.find("model\\:title").find("base\\:nls-string[xml\\:lang=" + portalOption.portalLang + "]").text();
								tmpInfo['title'] = tmpInfo['title']?tmpInfo['title'] : tmpEntry.find("model\\:title").find("base\\:nls-string[xml\\:lang=" + portalOption.defaultLang + "]").text();
								tmpInfo['control_id'] = (tmpEntry.find("atom\\:id").text()).replace("lm:oid:", "").split("@")[0];
								tmpInfo['unique_id'] = (tmpEntry.find("atom\\:link[portal\\:rel=portlet-definition]").attr("portal:uri")).replace("pm:oid:", "");
								tmpInfo['page_oid'] = pageOID;
								tmpInfo['desc'] = tmpEntry.find("model\\:description").find("base\\:nls-string[xml\\:lang=" + portalOption.portalLang + "]").text();
								tmpInfo['desc'] = tmpInfo['desc'] ? tmpInfo['desc'] : tmpEntry.find("model\\:description").find("base\\:nls-string[xml\\:lang=ko]").text();
								result.push(tmpInfo);
							}
						});
						callback(result);
					  
					},
					error: function(xhr, status, e) {
						$portalCntl.log(status + " : " + e + xhr.responseText);
					}
				});
				return true;
			},
			portletPrev : function(option) {
				$portalCntl.req.ajax({
					url: '/wps/mypoc?uri=lm:oid:' + option.control_id + '@oid:' + option.pageOID,
					cache: false,
					dataType: 'html',
					success: function(response) {
						if (option.devDefine) {
							option.renderHTML = response;
							option.callback(option);
						} else {
							$portalCntl.portlet._portletHtml(option.control_id, option.unique_id, option.title, response, option.callback);
						}
					}
				});
				return true;
			}
		}

		$portalCntl.portlet={
			currentPagePortletInfo:{}
			,add :function(pageOID, control_id, unique_id, title) {
				if (!isAccessAuthCheck('add')) return;
				$portalCntl.portlet._addContainer(control_id, unique_id, title);
			},
			del : function(control_id) {
				if (!isAccessAuthCheck('del')) return;
				if (!confirm(localeResource['deleteMessageLang'])) return;
				$portalCntl.portlet._delAction(control_id);
			},
			move:function (containerObj, moveItem, dragFlag){

				var controlObj = containerObj.children();
				var controlLen = controlObj.length;
				if (controlLen > 0) {
					var control_id = '',
						container_id = '',
						unique_id = '',
						prev_control_id = '',
						next_control_id = '';
					var idx = -1;
					
					var uiItem = $(moveItem); 
					container_id = getOID(containerObj.attr('class').split(/\s+/));
					control_id = getOID(uiItem.attr('class').split(/\s+/));
					
					if(dragFlag){
						idx = controlObj.index(uiItem);
					}else{
						idx = controlLen;
					}
					
					if (idx != -1) {
						
						next_control_id =controlLen > idx + 1 ? getOID(controlObj[idx+1].className.split(/\s+/)) : '';
						prev_control_id = idx > 1 ? getOID(controlObj[idx - 1].className.split(/\s+/)) : '';
						
						if (!portletInfo[control_id]) portletInfo[control_id] = new Object();
						portletInfo[control_id].be_prev_control_id = portletInfo[control_id].prev_control_id;
						portletInfo[control_id].be_next_control_id = portletInfo[control_id].next_control_id;
						portletInfo[control_id].prev_control_id = prev_control_id;
						portletInfo[control_id].next_control_id = next_control_id;
						
						if (uiItem.attr('prevmove') == 'Y') {
							var unique_id = uiItem.attr('unique_id'),
								portlet_ico = uiItem.attr('portlet_ico');
							uiItem.removeAttr('prevmove');
							uiItem.removeAttr('unique_id');
							uiItem.removeAttr('portlet_ico');
							uiItem.addClass('preview-add-portlet');
							uiItem.attr('id', 'addPortlet' + control_id);
							portletInfo[control_id].title = unescape(uiItem.attr('portlet_nm'));
							portletInfo[control_id].unique_id = unique_id;
							portletInfo[control_id].icon = portlet_ico;
							$portalCntl.portlet._addAction(container_id, control_id, dragFlag);
						} else {
							if (control_id != '') {
								var url = getContentHandlerUri(portalOption.actionObject.portlet) + "?uri=lm:oid:" + control_id + "@oid:" + portalOption.config.currentPageOID + "&rep=compact"
								
								$portalCntl.portlet._moveAction(container_id, control_id);
							}
						}
						_containerResize(portalOption.container);
					}
				}	
			},
			_moveAction : function(container_id, control_id) {
				portalOption.editActionFlag = true; 
				var prev_control_id = portletInfo[control_id].prev_control_id,
					next_control_id = portletInfo[control_id].next_control_id,
					currentPageOid = portalOption.config.currentPageOID;
				
				var form = $(_getTokenForm());
				var tmpID = generateUUID(); 
				form.attr('id',tmpID);

				form.append(getReqeustParamTag());
				
				form.append('<input type="hidden" name="action" value="move">');
				if(next_control_id){
					form.append('<input type="hidden" name="position" value="lm:oid:'+next_control_id+'@oid:'+currentPageOid+'">');
				}
				form.append('<input type="hidden" name="source" value="lm:oid:'+control_id+'@oid:'+currentPageOid+'">');

				_setActionForm(form);

				$portalCntl.req.ajaxSubmit('#'+tmpID,{
					type: 'post',
					url: $portalCntl.portlet._actionUrl(portalOption.actionType.move,container_id, control_id),
					success:function(){
						var be_prev_control_id = portletInfo[control_id].be_prev_control_id,
							be_next_control_id = portletInfo[control_id].be_next_control_id;
						if ($portalCntl.portlet._isPortletInfo(be_prev_control_id)) {
							portletInfo[be_prev_control_id].next_control_id = portletInfo[control_id].be_next_control_id;
						}
						if ($portalCntl.portlet._isPortletInfo(be_next_control_id)) {
							portletInfo[be_next_control_id].prev_control_id = portletInfo[control_id].be_prev_control_id;
						}
						if ($portalCntl.portlet._isPortletInfo(next_control_id)) {
							portletInfo[next_control_id].prev_control_id = control_id;
						}
						if ($portalCntl.portlet._isPortletInfo(prev_control_id)) {
							portletInfo[prev_control_id].next_control_id = control_id;
						}
						_cursorWaitStop();
					},
					error: function(xhr, status, e) {
						$portalCntl.log(status + " : " + e + xhr.responseText);
					}
				});
				return true;
			},
			_btnInit:function (){
		
				var beforeCntlId = '';

				$(portalOption.component).each(function(i, item) {
					var cntl_id = getOID(item.className.split(/\s+/));

					var option = $('.' + cntl_id + 'option');
					var sObj = new Object();
					
					sObj.control_id = cntl_id; 
					sObj.title = $('.id-'+cntl_id).find(portalOption.skinPortletTitle).html();
					sObj.move_flag = option.attr('portlet-move');
					sObj.del_flag = option.attr('portlet-delete');
					sObj.icon = option.attr('portlet-icon');
					
					if (0 == i) {
						sObj.prev_control_id = ''
					} else {
						portletInfo[beforeCntlId].next_control_id = cntl_id;
						sObj.prev_control_id = beforeCntlId;
					}
					sObj.next_control_id = '';
					beforeCntlId = cntl_id;
					g_portletInfoArr.push(sObj); 
					portletInfo[cntl_id] = sObj; 
					portalOption.btnCntlFunc(cntl_id);
				});
				return true;
			},
			_btnEvent:function(id) {
				if (id) {
					var tmpNode = $('.id-'+id);
					var option = $('.' + id + 'option');
		
					function _deleteBtnInit(){

						var delBtnObj = tmpNode.find(".portlet-delete-btn");
						if (delBtnObj) {

							if ('false' == option.attr('portlet-delete')) {
								$(delBtnObj).remove();
							} else {
								$(delBtnObj).addClass(id + 'deleteBtnCls');
								$(delBtnObj).attr('portlet_id', id);
								$(delBtnObj).attr('title', localeResource['deletelang']);
								$('.' + id + 'deleteBtnCls').click(function() {
									portalOption.deleteFunc(id);
								});
							}
						}
					}_deleteBtnInit();
					
					function _moreBtnInit(){
						var moreBtnObj = tmpNode.find('.portlet-more-btn')
						if(moreBtnObj){
							var moreFunction = option.attr('portlet-more');

							if (moreFunction != undefined && moreFunction != '') {
								$(moreBtnObj).addClass(id + 'moreBtnCls');
								$(moreBtnObj).attr('portlet_id', id);	
								
								$(moreBtnObj).attr('title', localeResource['morelang']);

								$('.' + id + 'moreBtnCls').click(function() {
									var fn = new Function ('data',moreFunction+';return ;');
									fn.call(fn,null);
								});
							}else{
								$(moreBtnObj).removeClass('cursor');
								//$(moreBtnObj).remove();
							}
						}
					}_moreBtnInit();

					function _refreshBtnInit(){
						var refreshBtnObj = tmpNode.find('.portlet-refresh-btn')
						if(refreshBtnObj){
							var refreshFunction = option.attr('portlet-refresh');

							if (refreshFunction != undefined && refreshFunction != '') {
								$(refreshBtnObj).addClass(id + 'refreshBtnCls');
								$(refreshBtnObj).attr('portlet_id', id);
								$(refreshBtnObj).attr('title', localeResource['refreshlang']);

								$('.' + id + 'refreshBtnCls').click(function() {

									var fn = new Function ('data',refreshFunction+';return ;');
									fn.call(fn,null);
								});
							}else{
								$(refreshBtnObj).remove();
							}
						}
					}_refreshBtnInit();
				}
			},
			_setDrag :function (option) {
				if(!portalOption.initPortletDrag){
					return false; 
				}else{
					_getTokenForm();
				}

				var dragDefaultOption = {
					sortableContainer: portalOption.sortableContainer,
					connectWith: portalOption.sortableContainer,
					handle: portalOption.dragHandle,
					cursor: 'move',
					placeholder: '',
					start: function(event, ui) {
						ui.placeholder.css('visibility', 'visible').css('border', '1px dotted black').css('backgroundColor', '#f5f6f7');
						ui.placeholder.height(ui.helper.height())
						ui.placeholder.width(ui.helper.width());
					},
					stop: function(event, ui) {},
					receive: function(event, ui) {},
					update: function(event, ui) {
						var containerObj = $(this);
						$portalCntl.portlet.move(containerObj, ui.item, true);
					}
				}
				for (var key in option) {
					if (option[key] !== undefined) dragDefaultOption[key] = option[key];
				}

				if (isBoolean(portalOption.accessControl.editLayout)) {
					portalOption.sortableContainer =dragDefaultOption.sortableContainer;

					if($(dragDefaultOption.sortableContainer).hasClass("ui-sortable")){
						$(dragDefaultOption.sortableContainer).sortable('enable');
					}else{						
						$(dragDefaultOption.sortableContainer).sortable(dragDefaultOption);
						$(dragDefaultOption.sortableContainer).disableSelection();
					}
				}
				return true;
			},
			_stopDrag :function (option) {

				var dragDefaultOption = {
					sortableContainer: portalOption.sortableContainer
					,connectWith: portalOption.sortableContainer
				}

				for (var key in option) {
					if (option[key] !== undefined) dragDefaultOption[key] = option[key];
				}
				
				if($(dragDefaultOption.sortableContainer).hasClass("ui-sortable")){
					portalOption.sortableContainer =dragDefaultOption.sortableContainer;
					$(dragDefaultOption.sortableContainer).sortable('disable');
				}
		
				return true;
			},
			_addContainer : function(control_id, unique_id, title) {
				var dndColumn = $(portalOption.sortableContainer);
				var dndLen = dndColumn.length;
				var tmpContainer;
				var prev_control_id = '',
					next_control_id = '',
					container_id = '';
				for (var i = 0; i < dndLen; i++) {
					tmpContainer = $(dndColumn[i]);
					if (tmpContainer.attr('name') != 'ibmHiddenWidgets') {
						var childLen = tmpContainer.children().length;
						container_id = getOID(tmpContainer.attr("class").split(" "));
						if (childLen > 0) {
							if (portalOption.addPortletPosition == 'first') next_control_id = getOID(tmpContainer.children()[0].className.split(' '));
							else prev_control_id = getOID(tmpContainer.children()[childLen - 1].className.split(' '));
						}
						break;
					}
				}
				portletInfo[control_id] = new Object();
				portletInfo[control_id].prev_control_id = prev_control_id;
				portletInfo[control_id].next_control_id = next_control_id;
				portletInfo[control_id].unique_id = unique_id;
				portletInfo[control_id].title = title;
				$portalCntl.portlet._addAction(container_id, control_id, false);
				return true;
			},
			_addAction: function(container_id, control_id, dragFlag) {
				var base = this; 
				portalOption.editActionFlag = true; 
				var currentPageOID = portalOption.config.currentPageOID;
				var xmlStr = base._addXml({
					'container_id': container_id,
					'unique_id': portletInfo[control_id].unique_id,
					'control_id':control_id
				});

				base._setCategoryContentClass(control_id, 'add');
	
				$portalCntl.req.ajax({
					type: "post",
					url: getContentHandlerUri(portalOption.actionObject.portlet) + "?uri=lm:oid:" + portalOption.config.currentPageOID + "&mode=download&rep=full&mdname=com.ibm.portal.layoutnode.localname&aspect=ac",
					cache: false,
					async: false,
					dataType: "text",
					contentType: 'application/xml; charset=utf-8',
					data: xmlStr,
					endLoadImg : false,
					success: function(xml) {
						xml =_getTextToXml(xml);
						var newControlId = $(xml).find("atom\\:entry").find("atom\\:id").text();
						newControlId = newControlId.replace("lm:oid:", "").split("@")[0];
						var newObj = portletInfo[control_id];
						newObj.control_id = newControlId;	
						portletInfo[newControlId]=newObj;

						base._addPortletContentHtml(container_id, control_id, dragFlag, newObj);
					},
					error: function(xhr, status, e) {
						$portalCntl.log(status + " : " + e + xhr.responseText);
					}
				});
				return true;
			},
			_addXml:function(option) {
				var xmlStr = new Array();
				xmlStr.push('<atom:id>cid:0</atom:id>');
				xmlStr.push('<atom:content type="application/xml">');
				xmlStr.push('<model:layout-control xmlns:model="http://www.ibm.com/xmlns/prod/websphere/portal/v6.0.1/portal-model-elements" xmlns:creation-context="http://www.ibm.com/xmlns/prod/websphere/portal/v6.1.0/portal-creation-context" creation-context:portlet-definition="pm:oid:' + option.unique_id + '">');
				xmlStr.push('<model:metadata name="com.ibm.portal.content.mashuppage">');
				xmlStr.push('<base:value xmlns:base="http://www.ibm.com/xmlns/prod/websphere/portal/v6.0/ibm-portal-composite-base" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xsd:string" value="true"/>');
				xmlStr.push('</model:metadata>');
				xmlStr.push('</model:layout-control>');
				xmlStr.push('</atom:content>');
				xmlStr.push('<thr:in-reply-to xmlns:thr="http://purl.org/syndication/thread/1.0" ref="lm:oid:' + option.container_id + '@oid:' + portalOption.config.currentPageOID + '" xmlns:ext="http://www.ibm.com/xmlns/prod/websphere/portal/v6.0.1/portal-model" ext:uri="lm:oid:' + option.container_id + '@oid:' + portalOption.config.currentPageOID + '"/>');
				
				var tmpNextId =portletInfo[option.control_id].next_control_id; 
				if(tmpNextId){
					xmlStr.push('<atom:link rel="next" type="application/atom+xml" href="?uri=lm:oid:'+tmpNextId+'@oid:' + portalOption.config.currentPageOID + '" 	xmlns:ext="http://www.ibm.com/xmlns/prod/websphere/portal/v6.0.1/portal-model" ext:uri="lm:oid:'+tmpNextId+'@oid:' + portalOption.config.currentPageOID + '" />')
				}
			   
				return portalOption.atomXml(xmlStr.join(''));
			},
			_addPortletContentHtml : function (container_id, beforeControlId, dragFlag, addPortletObj) {
				
				if(portalOption.isAddPortletSkinTemplate===false){
					
					var tmpTemplate =portalOption.addPortletTemplate();
					var newControlId = addPortletObj.control_id;

					skinTemplate=$portalCntl.portlet.replaceTemplateInfo(tmpTemplate, newControlId, addPortletObj.unique_id, addPortletObj.title, '', addPortletObj);
					
					if (dragFlag) {
						$('.preview-add-portlet').replaceWith(skinTemplate);
						$('.preview-add-portlet').removeClass('preview-add-portlet');
					}else{
						if (portalOption.addPortletPosition == 'first') {
							$(portalOption.sortableContainer).prepend(skinTemplate);
						} else {
							$(portalOption.sortableContainer).append(skinTemplate);
						}
					}
					
					$portalCntl.portlet._addControlIdChange(beforeControlId, newControlId);
					_cursorWaitStop();
					return ; 
				}

				$portalCntl.req.ajax({
					url: '/wps/mypoc?uri=lm:oid:' + newControlId + '@oid:' + portalOption.config.currentPageOID,
					cache: false,
					dataType: 'html',
					endLoadImg : false,
					success: function(renderHTML) {
						$portalCntl.portlet._portletHtml(newControlId, portletInfo[newControlId].unique_id, portletInfo[newControlId].title, renderHTML, function(strHtm) {
							try {
								if (dragFlag) {
									if (portalOption.addPortletPosition == 'first') {
										$('.id-' + container_id).prepend(strHtm);
									} else {
										$('.id-' + container_id).append(strHtm);
									}
								} else {
									$('.preview-add-portlet').replaceWith(strHtm);
									$('.preview-add-portlet').removeClass('preview-add-portlet');
								}
							} catch (e) {
								$portalCntl.log('$portalCntl.portlet._addPortletContentHtml', e);
							}
							$portalCntl.portlet._addControlIdChange(beforeControlId, newControlId);

							_cursorWaitStop();
						});
					}
				});
				return true;
			},
			_portletHtml : function (control_id, unique_id, title, renderHTML, callback) {
				var skinTemplate = portalOption.replaceSkinHTML;
				if (tmpSkin == '' || tmpSkin === undefined) {
					var tmpSkin = $('<div>'+portalOption.defaultSkin()+'</div>');
					tmpSkin.find('a[href="lm:title"]').replaceWith('@{lmtitleTextArea}');
					tmpSkin.find('a[href="lm:control"]').replaceWith('@{lmcontrolTextArea}');

					var skin = new Array();
					skin.push('<div class="component-control portletType id-portlet_contorl_id_text" portlet_nm="preview_portlet_title" id="addPortletportlet_contorl_id_text" prevmove="Y" unique_id="portlet_unique_id"> ');
					skin.push(tmpSkin.html());
					skin.push('</div> ');
					skinTemplate = portalOption.replaceSkinHTML = skin.join('');		
				}
				
				skinTemplate=$portalCntl.portlet.replaceTemplateInfo(skinTemplate, control_id, unique_id, title, renderHTML);
	
				callback($(skinTemplate));
				
				return true;
			},
			replaceTemplateInfo : function (skinTemplate, control_id, unique_id, title, renderHTML, replaceObj){
				skinTemplate = skinTemplate.split('portlet_contorl_id_text').join(control_id);
				skinTemplate = skinTemplate.replace('portlet_unique_id', unique_id)
				.replace('@{lmtitleTextArea}', title)
				.replace('preview_portlet_title', escape(title))
				.replace('@{icoClass}', replaceObj.icon?replaceObj.icon:'defaultIcon')
				.replace('@{lmcontrolTextArea}', renderHTML);

				return skinTemplate; 
			},
			_addControlIdChange : function (control_id, new_control_id) {
				var reFreshPortlet = $('#addPortlet' + new_control_id);
				if (!reFreshPortlet) {
					reFreshPortlet = $('#addPortlet' + control_id);
				}
				reFreshPortlet.removeAttr('unique_id prevmove portlet_nm id');
				reFreshPortlet.removeClass('id-' + control_id);
				reFreshPortlet.addClass('id-' + new_control_id);
				portalOption.btnCntlFunc(new_control_id);
				deletePortletInfo(control_id);
				return true;
			},
			_delAction : function (control_id) {
				var base = this; 
				portalOption.editActionFlag = true; 

				base._setCategoryContentClass(control_id, 'remove');

				var form = $(_getTokenForm());
				var tmpID = generateUUID(); 
				form.attr('id',tmpID);

				form.append(getReqeustParamTag());
				
				_setActionForm(form);

				$portalCntl.req.ajaxSubmit('#'+tmpID, {
					type: 'post',
					url: $portalCntl.portlet._actionUrl(portalOption.actionType.del,'', control_id),
					success:function(){
						var prev_control_id = portletInfo[control_id].prev_control_id,
							next_control_id = portletInfo[control_id].next_control_id;
						if ($portalCntl.portlet._isPortletInfo(prev_control_id)) {
							portletInfo[prev_control_id].next_control_id = portletInfo[control_id].next_control_id;
						}
						if ($portalCntl.portlet._isPortletInfo(next_control_id)) {
							portletInfo[next_control_id].prev_control_id = portletInfo[control_id].prev_control_id;
						}
						delete portletInfo[control_id];
						$('.id-' + control_id).remove();
						_cursorWaitStop();
					},
					error: function(xhr, status, e) {
						$portalCntl.log(status + " : " + e + xhr.responseText);
					}
				});
				return true;
			},
			_setCategoryContentClass:function (control_id , type){
				var base = this;

				var tmpContent = $('[unique_id='+portletInfo[control_id].unique_id+']');
				if(type == 'add'){
					base.currentPagePortletInfo[portletInfo[control_id].unique_id] = portletInfo[control_id];
					tmpContent.addClass('select');
					tmpContent.find('.portlet-add-btn').hide();
					tmpContent.draggable('disable');
				}else{
					delete base.currentPagePortletInfo[portletInfo[control_id].unique_id];
					tmpContent.removeClass('select');
					tmpContent.find('.portlet-add-btn').show();
					tmpContent.draggable('enable');
				}
			},
			_isPortletInfo:function (id) {
				var pi = portletInfo[id];
				return pi && undefined !== pi && '' != pi ? true : false;
			},
			_actionUrl : function (type, container_id,control_id) {
				var url;
				var currentPageOid = portalOption.config.currentPageOID;

				if(type == portalOption.actionType.move){
					url = portalOption.config.actionURI+'?uri=dnd:lm:oid:'+container_id+'@oid:'+currentPageOid;
				}else if(type == portalOption.actionType.add){
					url = portalOption.config.actionURI+'?uri=dnd:lm:oid:'+container_id+'@oid:'+currentPageOid;
				}else if(type == portalOption.actionType.del){
					var data = encodeURIComponent(encodeURIComponent('{"resourceURI":"pm:oid:'+control_id+'@oid:'+currentPageOid+'"}'));
					url = portalOption.config.actionURI+'?uri=op:ibm.portal.operations.deletePortlet('+data+')';
				}

				return url;
			},
			currentPageObjectId :function (pageOID){
				var base  = this; 
				var pageOID = pageOID ?pageOID:portalOption.config.currentPageOID;
				if(!$.isEmptyObject(base.currentPagePortletInfo)){
					return (base.currentPagePortletInfo); 
				}

				$portalCntl.req.ajax({
					url: getContentHandlerUri(portalOption.actionObject.portlet) + "?uri=lm:oid:" + pageOID + "&rep=full",
					cache: false,
					dataType: "text",
					async: false,
					contentType: 'application/xml; charset=utf-8',
					success: function(xml) {
						xml =_getTextToXml(xml);
						var tmpEntry;
						var tmpInfo;
						$(xml).find('atom\\:entry').each(function(i, item) {
							tmpEntry = $(item);
							if (tmpEntry.find("model\\:layout-control").length == 1) {
								tmpInfo = new Object();
								tmpInfo['control_id'] = (tmpEntry.find("atom\\:id").text()).replace("lm:oid:", "").split("@")[0];
								tmpInfo['unique_id'] = (tmpEntry.find("atom\\:link[portal\\:rel=portlet-definition]").attr("portal:uri")).replace("pm:oid:", "");
								
								base.currentPagePortletInfo[tmpInfo['unique_id']]= tmpInfo;
								portletInfo[tmpInfo['control_id']].unique_id=tmpInfo['unique_id'];
							}
						});
					},
					error: function(xhr, status, e) {
						$portalCntl.log(status + " : " + e + xhr.responseText);
					}
				});

				return base.currentPagePortletInfo;
			}
		}

		$portalCntl.req={
			ajax:function (option){
				//option.xhrFields= {
				//	withCredentials : true
				//};
				option.beforeSend= function( xhr ) {
					if(option.startLoadingImg !== false){
						_cursorWaitStart();
					}
					return true; 
				}
								
				$.ajax(option).fail(function(xhr, status, e) {
					$portalCntl.log(status + " : " + e + xhr.responseText);
					_cursorWaitStop();
				}).done(function (){
					if(option.endLoadImg !== false){
						_cursorWaitStop();
					}
					return true; 
				});
			},
			ajaxSubmit:function (formid , option){
				option.beforeSubmit=function(arr, $form, options) { 
					_cursorWaitStart();
					return true;
				}

				$(formid).ajaxSubmit(option);
			}
		}

		_setDefaultOption = function(option) {
            for (var key in option) {
				if(key =='localeResource'){
					_setLangResource(option[key]);
				}else if (option[key] !== undefined) portalOption[key] = option[key];
            }
        }

		_setLangResource =function (option){
			for (var key in option) {
                if (option[key] !== undefined) localeResource[key] = option[key];
            }
		}

		function _getTextToXml(xml){
			var agt = navigator.userAgent.toLowerCase();
			if (agt.indexOf("msie") != -1) return $.parseXML(xml); 
			return $(xml);
		}

		function isAccessAuthCheck(type) {
            var flag = false;
            var msg = '';
            if (type == 'add') {
                flag = isBoolean(portalOption.accessControl.editLayout);
                msg = localeResource['accessMsg.add'];
            } else if (type == 'del') {
                flag = isBoolean(portalOption.accessControl.editLayout);
                msg = localeResource['accessMsg.del'];
            } else {}
            if (!flag) {
                if (portalOption.isAccessMsg) {
                    alert(msg);
                }
            }
            return flag;
        }

		function getContentHandlerUri(actionObj){
			var uri = portalOption.config.contentHandlerURI;
			if(portalOption.actionObject.portlet == actionObj){
				uri=uri+portalOption.config.virtualPrefix;
			}else if(portalOption.actionObject.category == actionObj){
				if(portalOption.isVirturlCategory){
					uri=uri+portalOption.config.virtualPrefix;
				}
			}else if(portalOption.actionObject.menu == actionObj){
				
			}
			return uri;
		}

		function _setActionForm(formHtml){
			if($('#divActionForm').length  < 1){
				$('body').append('<div id="divActionForm" style="display:none;"></div>')
			}
			var tmpForm = $('#divActionForm'); 
			tmpForm.html('');
			tmpForm.html(formHtml);
		}
		
        function _cursorWaitStart() {
			if(portalOption.isWaitImg) $('.loading_area').show();
        }

		function _cursorWaitStop() {
            if(portalOption.isWaitImg) $('.loading_area').hide();
        }

		function getRandomId(){
			return 'ep'+(new Date().getTime()+Math.floor(Math.random() * 10) + 1);
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

		function _getTokenForm(){
			if(!portalOption.tokenFormHTML){
				$portalCntl.req.ajax({
					url: portalOption.tokenFormURI,
					cache: false,
					async: false,
					dataType: "text",
					startLoadingImg :false,
					endLoadImg : true,
					success: function(response) {
						portalOption.tokenFormHTML = response;
					},
					error: function(xhr, status, e) {
						$portalCntl.log('url : [' + portalOption.tokenFormURI + ']' + status + " : " + e + xhr.responseText);
					}
				});	
			}
			return portalOption.tokenFormHTML;
		}

		function getReqeustParamTag(type){
			return '<input type="hidden" name="successURI" value="nm:oid:com.empty.page">'
		}
		
        function isBoolean(flag) {
            return String(flag) === 'true' ? true : false;
        }

        function deletePortletInfo(id) {
            return delete portletInfo[id];
        }

        return $portalCntl;
    })();

    function _containerResize(containerNm) {
		return false;
		
        var dndColumn = $(containerNm);
        var dndLen = dndColumn.length;
        if (dndLen == 1) return;
        var tmpContainer, tmpSmallConainer;
        var tmpH = 0,
            maxH = 0,
            idx = 0;
        for (var i = 0; i < dndLen; i++) {
            tmpContainer = $(dndColumn[i]);
            tmpH = getContainerHeight(tmpContainer);
            if (tmpContainer !== undefined) {
                if (tmpH > maxH) {
                    maxH = tmpH;
                }
            }
        }
        for (var i = 0; i < dndLen; i++) {
            $(dndColumn[i]).css('height', (maxH + 120) + 'px');
        }
        return true;
    }

    function getContainerHeight(tmpCon) {
        var childArr = tmpCon.children();
        var controlLen = childArr.length;
        var tmpH = 0;
        for (var i = 0; i < controlLen; i++) {
            tmpH = tmpH + $(childArr[i]).height();
        }
        return tmpH;
    }

    function getOID(obj) {
		if(!obj) return ; 
		
		if(typeof obj ==='string'){
			obj = obj.split(/\s+/);
		}

        var id = "";
        $(obj).each(function(i, item) {
            if (item.indexOf("id-") >= 0) {
                id = item.replace("id-", "");
                return false;
            }
        });
        return id;
    }
    window.portalController = _portalController;
})(window);
