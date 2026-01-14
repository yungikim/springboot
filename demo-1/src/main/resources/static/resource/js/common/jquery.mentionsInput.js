/*
 * Mentions Input
 * Version 1.0.2updateValues
 * Written by: Kenneth Auchenberg (Podio)
 *
 * Using underscore.js
 *
 * License: MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function ($, _, undefined) {

    // Settings
    var KEY = { BACKSPACE : 8, TAB : 9, RETURN : 13, ESC : 27, LEFT : 37, UP : 38, RIGHT : 39, DOWN : 40, COMMA : 188, SPACE : 32, HOME : 36, END : 35 }; // Keys "enum"

    //Default settings
    var defaultSettings = {
        triggerChar   : '@', //Char that respond to eventg
        onDataRequest : $.noop, //Function where we can search the data
        minChars      : 0, //Minimum chars to fire the event
        allowRepeat   : true, //Allow repeat mentions
        showAvatars   : true, //Show the avatars
        elastic       : false, //Grow the textarea automatically
        defaultValue  : '',
        onCaret       : true,
        classes       : {
            autoCompleteItemActive : "active" //Classes to apply in each item
        },
        templates     : {
            wrapper                    : _.template('<div class="mentions-input-box"></div>'),
            autocompleteList           : _.template('<span class="mentions-autocomplete-list"></span>'),
            autocompleteListItem       : _.template('<li data-ref-id="<%= id %>" data-ref-type="<%= type %>" data-display="<%= display %>"><dl><dt><%= content %></dt><dd><%= exist %></dd></dl></li>'),
            autocompleteListItemAvatar : _.template('<img src="<%= avatar %>" onError=this.src="../resource/images/none.jpg" />'),
            autocompleteListItemIcon   : _.template('<div class="icon <%= icon %>"></div>'),
            mentionsOverlay            : _.template('<div class="mentions" style="background:none"><div style="background:none"></div></div>'),
            mentionsDisplay            : _.template('<ul class="mention_comment">'),
            mentionItemSyntax          : _.template('-=otag=-mention data=-=quot=-<%= id %>-=quot=--=ctag=-<%= value %>-=otag=-/mention-=ctag=-'),
            //mentionItemSyntax          : _.template('@[<%= value %>](<%= type %>:<%= id %>)'),
            mentionItemHighlight       : _.template('<strong><span><%= value %></span></strong>'),
            selectedMention            : _.template('<li id="li-mention-<%= id %>"><span><%= value %></span><button id="<%= id %>" name="del-mention" class="ico btn_del_user">삭제</button></li>')
        }
    };

    //Class util
    var utils = {
	    //Encodes the character with _.escape function (undersocre)
        htmlEncode       : function (str) {
            return _.escape(str);
        },
        //Encodes the character to be used with RegExp
        regexpEncode     : function (str) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        },
	    highlightTerm    : function (value, term) {
            if (!term && !term.length) {
                return value;
            }
            return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
        },
        //Sets the caret in a valid position
        setCaratPosition : function (domNode, caretPos) {
            if (domNode.createTextRange) {
                var range = domNode.createTextRange();
                range.move('character', caretPos);
                range.select();
            } else {
                if (domNode.selectionStart) {
                    domNode.focus();
                    domNode.setSelectionRange(caretPos, caretPos);
                } else {
                    domNode.focus();
                }
            }
        },
	    //Deletes the white spaces
        rtrim: function(string) {
            return string.replace(/\s+$/,"");
        }
    };

    //Main class of MentionsInput plugin
    var MentionsInput = function (settings) {

        var domInput,
            elmInputBox,
            elmInputWrapper,
            elmAutocompleteList,
            elmWrapperBox,
            elmMentionsDisplay,
            elmMentionsOverlay,
            elmSelectedMention,
            elmActiveAutoCompleteItem,
            mentionsCollection = [],
            autocompleteItemCollection = {},
            inputBuffer = [],
            currentDataQuery = '';

	    //Mix the default setting with the users settings
        settings = $.extend(true, {}, defaultSettings, settings );

	    //Initializes the text area target
        function initTextarea() {
    
            elmInputBox = $(domInput); //Get the text area target

            //If the text area is already configured, return
            if (elmInputBox.attr('data-mentions-input') === 'true') {
                return;
            }

            elmInputWrapper = elmInputBox.parent(); //Get the DOM element parent
            elmWrapperBox = $(settings.templates.wrapper());
           	elmInputBox.wrapAll(elmWrapperBox); //Wrap all the text area into the div elmWrapperBox	
            elmWrapperBox = elmInputWrapper.find('> div.mentions-input-box'); //Obtains the div elmWrapperBox that now contains the text area

            elmInputBox.attr('data-mentions-input', 'true'); //Sets the attribute data-mentions-input to true -> Defines if the text area is already configured
            elmInputBox.bind('keydown', onInputBoxKeyDown); //Bind the keydown event to the text area
            elmInputBox.bind('keyup', onInputBoxKeyUp); //Bind the keyup event to the text area
            elmInputBox.bind('keypress', onInputBoxKeyPress); //Bind the keypress event to the text area
            elmInputBox.bind('click', onInputBoxClick); //Bind the click event to the text area
            
        	//mCustomScrollBar 라이브러리와 충돌남 blur이벤트에는 숨김처리 안함(23.01.04)
            //elmInputBox.bind('blur', onInputBoxBlur); //Bind the blur event to the text area

            if (navigator.userAgent.indexOf("MSIE 8") > -1) {
                elmInputBox.bind('propertychange', onInputBoxInput); //IE8 won't fire the input event, so let's bind to the propertychange
            } else {
                elmInputBox.bind('input', onInputBoxInput); //Bind the input event to the text area
            }

            // Elastic textareas, grow automatically
            if( settings.elastic ) {
                elmInputBox.elastic();
            }
        }

        //Initializes the autocomplete list, append to elmWrapperBox and delegate the mousedown event to li elements
        function initAutocomplete() {
            elmAutocompleteList = $(settings.templates.autocompleteList()); //Get the HTML code for the list
            elmAutocompleteList.appendTo(elmWrapperBox); //Append to elmWrapperBox element
            elmAutocompleteList.delegate('li', 'mousedown', onAutoCompleteItemClick); //Delegate the event
        }

        //Initializes the mentions' display - 상단에 선택된 사용자가 표시되는 영역 지정
        function initMentionsDisplay() {
            elmMentionsDisplay = $(settings.templates.mentionsDisplay()); //Get the HTML code of the mentions' display
            elmMentionsDisplay.prependTo(elmWrapperBox); //Insert into elmWrapperBox the mentions display
        }
        
        //Initializes the mentions' overlay
        function initMentionsOverlay() {
            elmMentionsOverlay = $(settings.templates.mentionsOverlay());
            elmMentionsOverlay.prependTo(elmWrapperBox);
          }

	    //Updates the values of the main variables
        //자동완성 리스트박스에서 값이 선택된 후 실행
        //멘션 수정 시 실행
        function updateValues() {
            var syntaxMessage = getInputBoxValue(); //Get the actual value of the text area
            
            _.each(mentionsCollection, function (mention) {
                var textSyntax = settings.templates.mentionItemSyntax(mention);
                syntaxMessage = syntaxMessage.replace(new RegExp(utils.regexpEncode(mention.value), 'g'), textSyntax);
            });
                
            var mentionText = utils.htmlEncode(syntaxMessage); //Encode the syntaxMessage
            var mentionListHtml = [];
            _.each(mentionsCollection, function (mention) {
                var formattedMention = _.extend({}, mention, {value: utils.htmlEncode(mention.value)});
                var textSyntax = settings.templates.mentionItemSyntax(formattedMention);
                var textHighlight = settings.templates.mentionItemHighlight(formattedMention);

                mentionListHtml.push(textHighlight);
                mentionText = mentionText.replace(new RegExp(utils.regexpEncode(textSyntax), 'g'), textHighlight);
            });

            mentionText = mentionText.replace(/\n/g, '<br />'); //Replace the escape character for <br />
            //mentionText = mentionText.replace(/ {2}/g, '&nbsp; '); //Replace the 2 preceding token to &nbsp;

            elmInputBox.data('messageText', syntaxMessage); //Save the messageText to elmInputBox
	        elmInputBox.trigger('updated');
	        elmMentionsOverlay.find('div').html(mentionText); //Insert into a div of the elmmentionsOverlay the mention text
	        //elmMentionsDisplay.html(mentionListHtml.join('')); //Insert into a div of the elmMentionsDisplay the mention text
        }

        //Cleans the buffer
        function resetBuffer() {
            inputBuffer = [];
        }

	    //Updates the mentions collection
        //입력란에 텍스트가 입력되면서 mentions collection을 업데이트 (값이 선택된 후)
        function updateMentionsCollection() {
            var inputText = getInputBoxValue(); //Get the actual value of text area

	        //Returns the values that doesn't match the condition
            mentionsCollection = _.reject(mentionsCollection, function (mention, index) {
                return !mention.value || inputText.indexOf(mention.value) == -1;
            });

            mentionsCollection = _.compact(mentionsCollection); //Delete all the falsy values of the array and return the new array
        }

	    //Adds mention to mentions collections
        //자동완성 리스트박스에서 값이 선택된 후 실행
        function addMention(mention) {
            var currentMessage = getInputBoxValue(),
                caretStart = elmInputBox[0].selectionStart,
                shortestDistance = false,
                bestLastIndex = false;

            // Using a regex to figure out positions
            var regex = new RegExp("\\" + settings.triggerChar + currentDataQuery, "gi"),
                regexMatch;

            while(regexMatch = regex.exec(currentMessage)) {
                if (shortestDistance === false || Math.abs(regex.lastIndex - caretStart) < shortestDistance) {
                    shortestDistance = Math.abs(regex.lastIndex - caretStart);
                    bestLastIndex = regex.lastIndex;
                }
            }

            var startCaretPosition = bestLastIndex - currentDataQuery.length - 1; //Set the start caret position (right before the @)
            var currentCaretPosition = bestLastIndex; //Set the current caret position (right after the end of the "mention")


            var start = currentMessage.substr(0, startCaretPosition);
            var end = currentMessage.substr(currentCaretPosition, currentMessage.length);
            var startEndIndex = (start + mention.value).length + 1;

            // See if there's the same mention in the list
            if( !_.find(mentionsCollection, function (object) { return object.id == mention.id; }) ) {
                mentionsCollection.push(mention);//Add the mention to mentionsColletions
            }

            // Cleaning before inserting the value, otherwise auto-complete would be triggered with "old" inputbuffer
            resetBuffer();
            currentDataQuery = '';
            hideAutoComplete();

            // Mentions and syntax message
            var updatedMessageText = start + mention.value + ' ' + end;
            //var updatedMessageText = start + end; //mention(사용자)를 선택하면 mention.value를 제외한 텍스트 값만 넣어준다.
            elmInputBox.val(updatedMessageText); //Set the value to the txt area
	        elmInputBox.trigger('mention');
            updateValues();

            // Set correct focus and selection
            elmInputBox.focus();
            utils.setCaratPosition(elmInputBox[0], startEndIndex);
        }
        
        //선택된 mention을 삭제함
        function removeSelectedMention(e) {
        	var removeId = e.target.id
        	mentionsCollection = $.grep(mentionsCollection, function(n, i) {
                return n.id != removeId;
            });
        	$('#li-mention-' + removeId).remove();
        }

        //Gets the actual value of the text area without white spaces from the beginning and end of the value
        function getInputBoxValue() {
            //return $.trim(elmInputBox.val());
        	return elmInputBox.val();
        }

        // This is taken straight from live (as of Sep 2012) GitHub code. The
        // technique is known around the web. Just google it. Github's is quite
        // succint though. NOTE: relies on selectionEnd, which as far as IE is concerned,
        // it'll only work on 9+. Good news is nothing will happen if the browser
        // doesn't support it.
        function textareaSelectionPosition($el) {
            var a, b, c, d, e, f, g, h, i, j, k;
            if (!(i = $el[0])) return;
            if (!$(i).is("textarea")) return;
            if (i.selectionEnd == null) return;
            g = {
                position: "absolute",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                boxSizing: "content-box",
                top: 0,
                left: -9999
              }, h = ["boxSizing", "fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "height", "letterSpacing", "lineHeight", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "textDecoration", "textIndent", "textTransform", "width", "word-spacing"];
            for (j = 0, k = h.length; j < k; j++) e = h[j], g[e] = $(i).css(e);
            return c = document.createElement("div"), $(c).css(g), $(i).after(c), b = document.createTextNode(i.value.substring(0, i.selectionEnd)), a = document.createTextNode(i.value.substring(i.selectionEnd)), d = document.createElement("span"), d.innerHTML = "&nbsp;", c.appendChild(b), c.appendChild(d), c.appendChild(a), c.scrollTop = i.scrollTop, f = $(d).position(), $(c).remove(), f
        }

        //same as above function but return offset instead of position
        function textareaSelectionOffset($el) {
            var a, b, c, d, e, f, g, h, i, j, k;
            if (!(i = $el[0])) return;
            if (!$(i).is("textarea")) return;
            if (i.selectionEnd == null) return;
            g = {
                position: "absolute",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                boxSizing: "content-box",
                top: 0,
                left: -9999
            }, h = ["boxSizing", "fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "height", "letterSpacing", "lineHeight", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "textDecoration", "textIndent", "textTransform", "width", "word-spacing"];
            for (j = 0, k = h.length; j < k; j++) e = h[j], g[e] = $(i).css(e);
            return c = document.createElement("div"), $(c).css(g), $(i).after(c), b = document.createTextNode(i.value.substring(0, i.selectionEnd)), a = document.createTextNode(i.value.substring(i.selectionEnd)), d = document.createElement("span"), d.innerHTML = "&nbsp;", c.appendChild(b), c.appendChild(d), c.appendChild(a), c.scrollTop = i.scrollTop, f = $(d).offset(), $(c).remove(), f
        }

        //Scrolls back to the input after autocomplete if the window has scrolled past the input
        function scrollToInput() {
            var elmDistanceFromTop = $(elmInputBox).offset().top; //input offset
            var bodyDistanceFromTop = $('body').offset().top; //body offset
            var distanceScrolled = $(window).scrollTop(); //distance scrolled

            if (distanceScrolled > elmDistanceFromTop) {
                //subtracts body distance to handle fixed headers
                $(window).scrollTop(elmDistanceFromTop - bodyDistanceFromTop);
              }
        }

        //Takes the click event when the user select a item of the dropdown
        function onAutoCompleteItemClick(e) {
        	var elmTarget = $(this); //Get the item selected
            var mention = autocompleteItemCollection[elmTarget.attr('data-uid')]; //Obtains the mention
            addMention(mention);
            scrollToInput();
            return false;
        }

        //Takes the click event on text area
        function onInputBoxClick(e) {
            resetBuffer();
        }

        //Takes the blur event on text area
        function onInputBoxBlur(e) {
       	    hideAutoComplete();
        }

        //Takes the input event when users write or delete something
        //InputBox(TextArea)에 텍스트 입력 시
        //KeyUP 이벤트에서 처리함
        function onInputBoxInput(e) {
        /*
        	if(e.keyCode !== KEY.BACKSPACE) {
                var InputBoxText = $("#msg_send").val();
                inputBuffer = Hangul.disassemble(InputBoxText);
        	}   

            updateValues();
            updateMentionsCollection();
         
            var triggerCharIndex = _.lastIndexOf(inputBuffer, settings.triggerChar); //Returns the last match of the triggerChar in the inputBuffer
            if (triggerCharIndex > -1) { //If the triggerChar is present in the inputBuffer array
                currentDataQuery = inputBuffer.slice(triggerCharIndex + 1).join(''); //Gets the currentDataQuery
                currentDataQuery = utils.rtrim(currentDataQuery); //Deletes the whitespaces
                currentDataQuery = Hangul.assemble(currentDataQuery);
                e.stopPropagation();
                _.defer(_.bind(doSearch, this, currentDataQuery)); //Invoking the function doSearch ( Bind the function to this)
            }
        */
        }
        
        //Search into data list passed as parameter
        function doSearch(query) {
        
        	if (useMention != "T"){
        		return;
        	}
        	//console.log("doSearch....");

        	// 선택된 채널에서만 멘션 사용 가능
        	if (typeof gBody3 != "undefined"){
        		if (gBody3.cur_window == "channel"){
                	if (gBody3.check_top_menu_new() && gBody3.popup_status == ""){
                		/*
                		 * 전체 컨텐츠 / 내가 올린 컨텐츠 / 공유된 컨텐츠 / 즐겨찾기 / 멘젼 이 클리된 경우 멘션 호출을 하지 않음
                		 * 단, 상기 메뉴가 선택되었어도 파일업로드 창에서는 멘션 을 호출함
                		 */
                		return;
                	}          			
        		}
        	}

            //If the query is not null, undefined, empty and has the minimum chars
            /*
             * 원래 쿼리가 있고 설정된 settings.minChars 크기보다 클때만 멘션 리스트가 표시됨.
            if (query && query.length && query.length >= settings.minChars) {
                //Call the onDataRequest function and then call the populateDropDrown
                settings.onDataRequest.call(this, 'search', query, function (responseData) {
                    populateDropdown(query, responseData);
                });
            } else { //If the query is null, undefined, empty or has not the minimun chars
                hideAutoComplete(); //Hide the autocompletelist
            }*/

        	// '@'으로 시작하는 경우 바로 멘션 리스트를 표시되게 변경.
            settings.onDataRequest.call(this, 'search', query, function (responseData) {
                populateDropdown(query, responseData);
            });
         
        }

        //Takes the keypress event
        //한글문제로 Keyup 이벤트에서 처리함
        function onInputBoxKeyPress(e) {
        /*
           if(e.keyCode !== KEY.BACKSPACE) { //If the key pressed is not the backspace
              var typedValue = String.fromCharCode(e.which || e.keyCode); //Takes the string that represent this CharCode
              inputBuffer.push(typedValue); //Push the value pressed into inputBuffer
           }
        */
        }
        
        //Takes the keyup event
        function onInputBoxKeyUp(e) {
            switch(e.keyCode) {
              case 40: // down arrow
              case 38: // up arrow
              case 16: // shift
              case 17: // ctrl
              case 18: // alt
              case 9:  // tab
              case 13: // enter
              case 27: // escape
                return;
            }

        	if(e.keyCode !== KEY.BACKSPACE) {
        		var InputBoxText = "";

        	/*	if (typeof gTodoM != "undefined"){
        			// Todo 모바일인 경우
        			 InputBoxText = $("#todo_reply_input").val();
        			 
        		}else{
        			if (gBody3.cur_window == "channel"){
        				if (gBody3.popup_status != ""){
        					// 업로드 레이어 팝업인 경우
        					InputBoxText = $("#fileupload_content").val();
        					
        				}else{
        					// 일반 채널에 있는 입력창
        					InputBoxText = $("#message_txt_channel").val();
        				}

        			}else if (gBody3.cur_window == "todo"){
        				if (gTodo.todo_reply_status == "edit"){
        					// Todo 댓글 수정 입력
            				InputBoxText = $("#rmtext").val();
        					
        				}else{
        					// Todo 댓글 입력
            				InputBoxText = $("#todo_reply_input").val();
        				}
        			}
        		}*/
        		
        		InputBoxText = $("#" + e.target.id).val();
                inputBuffer = Hangul.disassemble(InputBoxText);
           	}
        	
            updateValues();
            updateMentionsCollection();
         
            var triggerCharIndex = _.lastIndexOf(inputBuffer, settings.triggerChar); //Returns the last match of the triggerChar in the inputBuffer
            if (triggerCharIndex > -1) { //If the triggerChar is present in the inputBuffer array
                currentDataQuery = inputBuffer.slice(triggerCharIndex + 1).join(''); //Gets the currentDataQuery
                //currentDataQuery = utils.rtrim(currentDataQuery); //Deletes the whitespaces
                currentDataQuery = Hangul.assemble(currentDataQuery);
                e.stopPropagation();
                _.defer(_.bind(doSearch, this, currentDataQuery)); //Invoking the function doSearch ( Bind the function to this)
            }else{
            	// '@'이 다 지워진 경우
            	hideAutoComplete(); //Hide the autocompletelist
            }    	
        }        

	    //Takes the keydown event
        function onInputBoxKeyDown(e) {
            // This also matches HOME/END on OSX which is CMD+LEFT, CMD+RIGHT
            if (e.keyCode === KEY.LEFT || e.keyCode === KEY.RIGHT || e.keyCode === KEY.HOME || e.keyCode === KEY.END) {
                // Defer execution to ensure carat pos has changed after HOME/END keys then call the resetBuffer function
                _.defer(resetBuffer);

                // IE9 doesn't fire the oninput event when backspace or delete is pressed. This causes the highlighting
                // to stay on the screen whenever backspace is pressed after a highlighed word. This is simply a hack
                // to force updateValues() to fire when backspace/delete is pressed in IE9.
                if (navigator.userAgent.indexOf("MSIE 9") > -1) {
                  _.defer(updateValues); //Call the updateValues function
                }

                return;
            }

            //If the key pressed was the backspace
            if (e.keyCode === KEY.BACKSPACE) {
                inputBuffer = inputBuffer.slice(0, -1 + inputBuffer.length); // Can't use splice, not available in IE
                return;
            }
            
            //If the elmAutocompleteList is hidden
            if (!elmAutocompleteList.is(':visible')) {
                return true;
            }

            switch (e.keyCode) {
                case KEY.UP: //If the key pressed was UP or DOWN
                case KEY.DOWN:
                	//isEnterKeyEvent = false;
                    var elmCurrentAutoCompleteItem = null;
                    if (e.keyCode === KEY.DOWN) { //If the key pressed was DOWN
                        if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) { //If elmActiveAutoCompleteItem exits
                            elmCurrentAutoCompleteItem = elmActiveAutoCompleteItem.next(); //Gets the next li element in the list
                        } else {
                            elmCurrentAutoCompleteItem = elmAutocompleteList.find('li').first(); //Gets the first li element found
                        }
                    } else {
                    	elmCurrentAutoCompleteItem = $(elmActiveAutoCompleteItem).prev(); //The key pressed was UP and gets the previous li element
                    }

                    if (elmCurrentAutoCompleteItem.length) {
                        selectAutoCompleteItem(elmCurrentAutoCompleteItem);
                    }
                    return false;
                case KEY.RETURN: //If the key pressed was RETURN or TAB
                case KEY.TAB:
                    if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) { //If the elmActiveAutoCompleteItem exists
                        elmActiveAutoCompleteItem.trigger('mousedown'); //Calls the mousedown event
                        return false;
                    }
                break;
            }

            return true;
        }

        //Hides the autoomplete
        function hideAutoComplete() {
        //	return;
        	isEnterKeyEvent = true;
            elmActiveAutoCompleteItem = null;
            elmAutocompleteList.empty().hide();
        }

        //Selects the item in the autocomplete list
        function selectAutoCompleteItem(elmItem) {
            elmItem.addClass(settings.classes.autoCompleteItemActive); //Add the class active to item
            elmItem.siblings().removeClass(settings.classes.autoCompleteItemActive); //Gets all li elements in autocomplete list and remove the class active

            elmActiveAutoCompleteItem = elmItem; //Sets the item to elmActiveAutoCompleteItem
        }

	    //Populates dropdown
        function populateDropdown(query, results) {
            elmAutocompleteList.show(); //Shows the autocomplete list

            if(!settings.allowRepeat) {
                // Filter items that has already been mentioned
                var mentionValues = _.pluck(mentionsCollection, 'value');
                results = _.reject(results, function (item) {
                    return _.include(mentionValues, item.name);
                });
            }

            if (!results.length) { //If there are not elements hide the autocomplete list
                hideAutoComplete();
                return;
            }

            elmAutocompleteList.empty(); //Remove all li elements in autocomplete list
            var elmDropDownList = $("<ul>").appendTo(elmAutocompleteList).hide(); //Inserts a ul element to autocomplete div and hide it

            _.each(results, function (item, index) {
                var itemUid = _.uniqueId('mention_'); //Gets the item with unique id

                autocompleteItemCollection[itemUid] = _.extend({}, item, {value: item.name}); //Inserts the new item to autocompleteItemCollection

                function isEqID(element, index, array) {
                	return element.id == utils.htmlEncode(item.id)
                }
                if(mentionsCollection.some(isEqID)){
                	_exist = '@';
                } else {
                	_exist = '';
                }
            
                var elmListItem = $(settings.templates.autocompleteListItem({
                    'id'      : utils.htmlEncode(item.id),
                    'display' : utils.htmlEncode(item.name),
                    'type'    : utils.htmlEncode(item.type),
                    'content_dept' : utils.htmlEncode(item.dept),
                    'exist' : _exist,
                //  'content' : utils.highlightTerm(utils.htmlEncode((item.display ? item.display : item.name)), query)
                    'content' : utils.htmlEncode((item.display ? item.display : item.name))
                })).attr('data-uid', itemUid); //Inserts the new item to list

                //If the index is 0
                var elmAutocompleteListPosition = elmAutocompleteList.css('position');
                if (elmAutocompleteListPosition == 'absolute') {
                    if (index === 0) {		// 자동완성창을 아래에 표시하는 경우 맨 처음을 기본선택으로 표시
                        selectAutoCompleteItem(elmListItem);
                    }
                }
                else if (elmAutocompleteListPosition == 'fixed' || elmAutocompleteListPosition == '-ms-page') {
                    if (index === (results.length - 1)){	// 자동완성창을 위로 설정한 경우 맨 마지막을 기본선택으로 표시
                        selectAutoCompleteItem(elmListItem);
                    }
                }


                //If show avatars is true
                if (settings.showAvatars) {
                    var elmIcon;

                    //If the item has an avatar
                    if (item.avatar) {
                        elmIcon = $(settings.templates.autocompleteListItemAvatar({ avatar : item.avatar }));
                    } else { //If not then we set an default icon
                        elmIcon = $(settings.templates.autocompleteListItemIcon({ icon : item.icon }));
                    }
                    elmIcon.prependTo(elmListItem); //Inserts the elmIcon to elmListItem
                }
               
                elmListItem = elmListItem.appendTo(elmDropDownList); //Insets the elmListItem to elmDropDownList
            });

            elmAutocompleteList.show(); //Shows the elmAutocompleteList div
	        if (settings.onCaret) {
		        positionAutocomplete(elmAutocompleteList, elmInputBox);
            }
	       
	        elmDropDownList.show(); //Shows the elmDropDownList
	        isEnterKeyEvent = false;
        }

	    function positionAutocomplete(elmAutocompleteList, elmInputBox) {
	  
	    	var elmAutocompleteListPosition = elmAutocompleteList.css('position');
	    	if (elmAutocompleteListPosition == ""){
	    		// position이 없는 경우 다시 세팅
	    		if (elmInputBox.attr("id").indexOf("reply_compose") > -1){
	    			elmAutocompleteListPosition = 'absolute';
	    		}
	    	}
            if (elmAutocompleteListPosition == 'absolute') {
                var position = textareaSelectionPosition(elmInputBox),
                    lineHeight = parseInt(elmInputBox.css('line-height'), 10) || 18;

                //elmAutocompleteList.css('width', '15em'); // Sort of a guess
                //elmAutocompleteList.css('left', position.left);
                elmAutocompleteList.css('width', '500px');
                elmAutocompleteList.css('left', 5);
                console.log(">> " + lineHeight + position.top);
                
               
                
                var h1 = $(window).height();
                var h2 = elmAutocompleteList.offset().top;
                var h3 = h1 - h2;
                var h4 = h1 / 2;
                
                if (elmInputBox.attr("id").indexOf("reply_compose") > -1){
                	// position 초기화
                	elmAutocompleteList.css('top', "");
                	elmAutocompleteList.css('bottom', "");
                	
                	if (h4 > h3){
                		elmAutocompleteList.css('bottom', "70px");
                	}else{
                		elmAutocompleteList.css('top', "60px");
                	}
                	
                }
                
             
           //     elmAutocompleteList.css('top', "60px");
                
                //check if the right position of auto complete is larger than the right position of the input
                //if yes, reset the left of auto complete list to make it fit the input
                var elmInputBoxRight = elmInputBox.offset().left + elmInputBox.width(),
                    elmAutocompleteListRight = elmAutocompleteList.offset().left + elmAutocompleteList.width();
                if (elmInputBoxRight <= elmAutocompleteListRight) {
                    elmAutocompleteList.css('left', Math.abs(elmAutocompleteList.position().left - (elmAutocompleteListRight - elmInputBoxRight)));
                }
            }
            else if (elmAutocompleteListPosition == 'fixed' || elmAutocompleteListPosition == '-ms-page') {
            	
                var offset = textareaSelectionOffset(elmInputBox),
                    lineHeight = parseInt(elmInputBox.css('line-height'), 10) || 18;


                //elmAutocompleteList.css('width', '15em'); // Sort of a guess
                //elmAutocompleteList.css('left', offset.left + 10000);
                //elmAutocompleteList.css('top', lineHeight + offset.top);
                elmAutocompleteList.css('width', '400px');
                

                if (elmInputBox.attr("id") == "reply_content"){
                	elmAutocompleteList.css('left', offset.left + (10000 - 220));
                	
                }else if (elmInputBox.attr("id") == "todo_reply_input"){
                	console.log(offset.left);
                //	elmAutocompleteList.css('left', offset.left + (10000 - 470));
                	 
                }else{
                	 elmAutocompleteList.css('left', offset.left + 10000);
                }
               
                if (elmInputBox.attr("id") == "todo_reply_input"){              
                	
                	var left = $("#todo_reply_input").offset().left - 10;
                
                	elmAutocompleteList.css('left', left);
                	elmAutocompleteList.css('bottom', ($(window).height() - offset.top) + 15);
                	
                }else{	
                	elmAutocompleteList.css('bottom', ($(window).height() - offset.top) + 15);
                }
            }
        }

        //Resets the text area
        function resetInput(currentVal) {
            mentionsCollection = [];
            var mentionText = utils.htmlEncode(currentVal);
            mentionText = gap.textToHtml(mentionText);
            
            var regex = new RegExp("(" + settings.triggerChar + ")\\[(.*?)\\]\\((.*?):(.*?)\\)", "gi");
            var match, newMentionText = mentionText;
            while ((match = regex.exec(mentionText)) != null) {
                //newMentionText = newMentionText.replace(match[0], match[1] + match[2]);
            	newMentionText = newMentionText.replace(match[0], match[2]);
            	if (_.where(mentionsCollection, { 'id': match[4]}).length == 0){
            		mentionsCollection.push({ 'id': match[4], 'type': match[3], 'value': match[2], 'trigger': match[1] });
            	}
            }
            elmInputBox.val(newMentionText);
            updateValues();
        }
        // Public methods
        return {
            //Initializes the mentionsInput component on a specific element.
	        init : function (domTarget) {
        		
                domInput = domTarget;

                initTextarea();
                initAutocomplete();
                //initMentionsDisplay();
                initMentionsOverlay();
                resetInput(settings.defaultValue);

                //If the autocomplete list has prefill mentions
                if( settings.prefillMention ) {
                    addMention( settings.prefillMention );
                }
            },

	        //An async method which accepts a callback function and returns a value of the input field (including markup) as a first parameter of this function. This is the value you want to send to your server.
            val : function (callback) {
                if (!_.isFunction(callback)) {
                    return;
                }
                callback.call(this, mentionsCollection.length ? elmInputBox.data('messageText') : getInputBoxValue());
            },

        	//Resets the text area value and clears all mentions
            reset : function () {
                resetInput();
            },
            
        	//수정 시 textarea에 멘션 텍스트 재설정
            edit : function (editVal) {
                resetInput(editVal);
            },

            //Reinit with the text area value if it was changed programmatically
            reinit : function () {
                resetInput(false);
            },

	        //An async method which accepts a callback function and returns a collection of mentions as hash objects as a first parameter.
            getMentions : function (callback) {
                if (!_.isFunction(callback)) {
                    return;
                }
                callback.call(this, mentionsCollection);
            },
            
            hideMention : function(){
            	hideAutoComplete();
            },
            
            keyset : function(e){
            	$(this).bind('keydown', onInputBoxKeyDown); //Bind the keydown event to the text area
            	$(this).bind('keyup', onInputBoxKeyUp); //Bind the keyup event to the text area
            	$(this).bind('keypress', onInputBoxKeyPress); //Bind the keypress event to the text area
            	
            }
            
       
        };
    };

    //Main function to include into jQuery and initialize the plugin
    $.fn.mentionsInput = function (method, settings) {
        var outerArguments = arguments; //Gets the arguments
        //If method is not a function
        if (typeof method === 'object' || !method) {
            settings = method;
        }

        return this.each(function () {
            var instance = $.data(this, 'mentionsInput') || $.data(this, 'mentionsInput', new MentionsInput(settings));

            if (_.isFunction(instance[method])) {
                return instance[method].apply(this, Array.prototype.slice.call(outerArguments, 1));
            } else if (typeof method === 'object' || !method) {
                return instance.init.call(this, this);
            } else {
                $.error('Method ' + method + ' does not exist');
            }
        });
    };

})(jQuery, _);
