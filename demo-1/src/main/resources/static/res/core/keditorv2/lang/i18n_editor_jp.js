(function(_global_key){
 function I18N(){
	this.words = this.init();
	this.regexp = /%\((\d+)\)s/g;
	this.reg_format = /\{\{([^\}]+)\}\}/g;
	this.language = "jp";
}
I18N.prototype={
	"get":function(){
		var args = [];
		for(var i = 0; i < arguments.length; i++) args.push(arguments[i]);
		var key = args.shift();
		var val = this.words[key];
		if(val == null) val = "";
		if(typeof val != 'string') return val;
		if(args.length > 0){
			val = val.replace(this.regexp, function($1, $2){return args[$2 - 1];});
		}
		return val;
	}
	,"format":function(template, iswrite){
		var html = template;
		var _self = this;
		html = html.replace(this.reg_format, function($1, $2){
			var keys = $2.split('|');
			var val = _self.words[keys[0]];
			if(val) return val;
			else return keys[1]||keys[0];
		})
		if(iswrite) document.write(html);
		else return html;
	}
	,"write":function(){
		document.write(this.get.apply(this, arguments));
	}
	,"get_string":function(key){
		var val = this.words[key];
		if(val == null) val = key;
		return val;
	}
	,"write_string":function(key){
		document.write(this.get_string(key));
	}
};
I18N.prototype.g = I18N.prototype.get;
I18N.prototype.f = I18N.prototype.format;
I18N.prototype.w = I18N.prototype.write;
I18N.prototype.gs = I18N.prototype.get_string;
I18N.prototype.ws = I18N.prototype.write_string;
I18N.prototype.init = function(){
	return {
"tx_fontfamily-title":"Font"
,"tx_fontsize-title":"Font Size"
,"tx_bold-title":"Bold (Ctrl+B)"
,"tx_bold":"Bold"
,"tx_underline-title":"Underline (Ctrl+U)"
,"tx_underline":"Underline"
,"tx_italic-title":"italic (Ctrl+I)"
,"tx_italic":"Italic"
,"tx_strike-title":"Strike (Ctrl+D)"
,"tx_strike":"Strike"
,"tx_forecolor":"Font Color"
,"tx_forecolor-arrow":"Select Font Color"
,"tx_backcolor":"Text Background"
,"tx_backcolor-arrow":"Select Text Background"
,"tx_alignleft-title":"Align left (Ctrl+,)"
,"tx_alignleft":"Align left"
,"tx_aligncenter-title":"Align center (Ctrl+.)"
,"tx_aligncenter":"Align center"
,"tx_alignright-title":"Align right (Ctrl+/)"
,"tx_alignright":"Align right"
,"tx_alignfull":"Align both"
,"tx_indent-title":"Indent"
,"tx_indent":"Indent"
,"tx_outdent-title":"Outdent (Shift+Tab)"
,"tx_outdent":"Outdent"
,"tx_lineheight":"Line Spacing"
,"tx_lineheight-arrow":"Select Line Spacing"
,"tx_styledlist":"List"
,"tx_styledlist-arrow":"Select List"
,"tx_link-title":"Link (Ctrl+K)"
,"tx_link":"Link"
,"tx_specialchar":"Special Character"
,"tx_table":"Create Table"
,"tx_horizontalrule":"Dividing line"
,"tx_richtextbox":"Text Box"
,"tx-menu-simple":"Simple Selection"
,"tx-menu-advanced":"Select directly"
,"tx_quote-title":"Quote (Ctrl+Q)"
,"tx_quote":"Quote"
,"tx_undo-title":"Undo (Ctrl+Z)"
,"tx_undo":"Undo"
,"tx_redo-title":"Re-run (Ctrl+Y)"
,"tx_redo":"Re-run"
,"tx_switchertoggle-title":"Editor Type"
,"tx_switchertoggle-editor":"Editor"
,"tx_switchertoggle-html":"HTML"
,"tx_fullscreen-title":"Wide Screen (Ctrl+M)"
,"tx_fullscreen":"Wide Screen"
,"tx_advanced":"View Toolbar"
,"tx_mergecells":"Merge"
,"tx_insertcells":"Insert"
,"tx_deletecells":"Delete"
,"tx_cellslinepreview":"Line Preview"
,"tx_cellslinecolor":"Line Color"
,"tx_cellslineheight":"Thickness"
,"tx_cellslinestyle":"Line Type"
,"tx_cellsoutline":"Outline"
,"tx_tablebackcolor":"Table Background Color"
,"tx_tabletemplate":"테이블 서식"
,"menu.pallete.revert":"Default color"
,"adoptor.label":"ABC"
,"adoptor.transparent":"Transparency"
,"menu.pallete.enter":"Enter"
,"menu.pallete.more":"More"
,"setDataByJSONToEditor_error":"\r\nSwitching to the source view mode.\r\nPlease make sure the HTML is correct."
,"changeMode_error":"\r\nFailed to change the editor type.\r\nPlease make sure that HTML is valid."
,"attacher.only.wysiwyg.alert":"You can insert a text only in edit"
,"attacher.ins":"Insert"
,"attacher.del":"Delete"
,"attacher.delete.confirm":"삭제하시면 본문에서도 삭제됩니다. 계속하시겠습니까?"
,"attacher.delete.all.confirm":"모든 첨부 파일을 삭제하시겠습니까? 삭제하시면 본문에서도 삭제됩니다."
,"attacher.exist.alert":"이미 본문에 삽입되어 있습니다."
,"attacher.can.modify.alert":"기존에 등록된 #{title}을(를) 수정할 수 있는 화면으로 이동합니다."
,"attacher.can.modify.confirm":"#{title}은(는) 하나만 등록이 가능합니다.\r\n다시 올리시면 기존의 #{title}이(가) 삭제됩니다. 계속하시겠습니까?"
,"attacher.insert.alert":"You can insert only in edit"
,"attacher.capacity.alert":"용량을 초과하였습니다."
,"attacher.size.alert":"용량을 초과하여 더이상 등록할 수 없습니다."
,"embeder.alert":"You can insert only in edit"
,"switcher.wysiwyg":"Editor"
,"switcher.source":"HTML"
,"switcher.text":"Text"
,"font-size-l7":"ABCDEFG %(1)s"
,"font-size-l3":"ABC %(1)s"
,"font-size-l5":"ABCDEF %(1)s"
,"backcolor":"ABC"
,"insertcells-addRowUpper":"Add upper row"
,"insertcells-addRowBelow":"Add row below"
,"insertcells-addColLeft":"Add left"
,"insertcells-addColRight":"Add right"
,"deletecells-deleteRow":"Delete row"
,"deletecells-deleteCol":"Delete column"
,"mergecells-merge":"Merge"
,"mergecells-cancelmerge":"Split"
,"cellslinestyle.subtitle1":"No borders"
,"cellslinestyle.subtitle2":"Solid line"
,"cellslinestyle.subtitle3":"Dotted line"
,"cellslinestyle.subtitle4":"Small dotted line"
,"cellsoutline-all":"All border"
,"cellsoutline-out":"Outer border"
,"cellsoutline-in":"Inner border"
,"cellsoutline-top":"Top border"
,"cellsoutline-bottom":"Bottom border"
,"cellsoutline-left":"Left border"
,"cellsoutline-right":"Right border"
,"cellsoutline-none":"No borders"
,"styledlist.subtitle1":"Cancel"
,"styledlist.subtitle2":"Circle"
,"styledlist.subtitle3":"Square"
,"styledlist.subtitle4":"Number"
,"styledlist.subtitle5":"Roman numerals"
,"styledlist.subtitle6":"Alphabet"
,"insertlink.invalid.url":"Please enter the URL"
,"insertlink.link.alt":"Go to [#{title}]"
,"insertlink.title":"In the selected area, please enter the URL address"
,"insertlink.onclick.target":"Click target"
,"insertlink.target.blank":"New window"
,"insertlink.target.self":"Current window"
,"richtextbox.add":"Plus"
,"richtextbox.sub":"Minus"
,"richtextbox.alert":"Only the number of 1 to 20 can be entered."
,"richtextbox.bg.color":"Background color"
,"richtextbox.border.color":"Border color"
,"richtextbox.border.style":"Border style"
,"richtextbox.border.width":"Border width"
,"table.alert":"Only the number of 1 to 30 can be entered."
,"table.title.insert":"Insert table &nbsp;"
,"table.title.setDirectly":"Set the table directly"
,"table.title.col":"Columns"
,"table.title.row":"Rows"
,"emoticon.subtitle.person":"사람"
,"emoticon.subtitle.animal":"동식물"
,"emoticon.subtitle.thing":"사물"
,"emoticon.subtitle.etc":"기타"
,"specialchar.subtitle1":"Basic symbols"
,"specialchar.subtitle2":"Mathematical operator, Currency Symbols"
,"specialchar.subtitle3":"Circle symbol, bracket"
,"specialchar.subtitle4":"Japanese"
,"specialchar.subtitle5":"Roman and Greek"
,"file.title":"파일"
,"media.title":"Multimedia"
,"canvas.unload.message":"The written information was not saved. Do you wish to leave the page?"
,"canvas.unload.message.at.modify":"The written information was not saved. Do you wish to leave the page?"
,"align.image.align.center":"Align center"
,"align.image.align.full":"Align right posts"
,"align.image.align.left":"Align left"
,"align.image.align.right":"Align left posts"
,"align.text.align.center":"Align center (Ctrl+.)"
,"align.text.align.full":"Align both"
,"align.text.align.left":"Align left (Ctrl+,)"
,"align.text.align.right":"Align right (Ctrl+/)"
,"table.noselect.alert":"You can use after selecting the table"
,"contextmenu.table.insertrowabove":"Insert Rows Above"
,"contextmenu.table.insertrowbelow":"Insert Rows Below"
,"contextmenu.table.insertcolleft":"Insert Columns to the Left"
,"contextmenu.table.insertcolright":"Insert Columns to the Right"
,"contextmenu.table.deleterow":"Delete row"
,"contextmenu.table.deletecol":"Delete column"
,"contextmenu.table.cellmerge":"Merge cells"
,"contextmenu.table.cellsplit":"Split cells"
,"contextmenu.table.samewidth":"Distribute Columns Evenly"
,"contextmenu.table.sameheight":"Distribute Rows Evenly"
,"contextmenu.table.samewh":"Distribute Columns/Rows Evenly"
,"contextmenu.table.propcell":"Cell Properties"
,"contextmenu.table.proptable":"Table Properties"
,"table-insert":"Insert"
,"table-sepa":"구분"
,"table-delete":"Delete"
,"table-merge":"Merge"
,"table-split":"Split"
,"table-same":"조정"
,"table-attr":"속성"
,"table.merge.confirm":"Merging into one cell will keep the upper-left most data only. "
,"table.merge.more.select.cells":"Please select two or more cells."
,"resetMerge_error":"You can only divide merged cells"
,"exitEditor_desc":"Editor area: Press Shift+Esc to exit the editor area"
,"fullscreen.attach.close.btn":"파일첨부박스"
,"fullscreen.noti.btn":"By general writing"
,"fullscreen.noti.span":"Pressing the Wide Write button again will return to the original writing window size. "
,"specialchar.title":"Selected symbols"
,"tx_image":"Picture"
,"tx_media":"External Contents"
,"error_editor_load":"Editor is not loaded. Please try again later"
,"error_editor_load_fail":"Failed to execute editor"
,"multimedia_popup_title":"Attach multimedia"
,"multimedia_popup_error":"\"You have accessed the wrong path."
,"multimedia_addr_error":"Please enter the correct address to the multimedia attachment."
,"multimedia_title":"Insert external content."
,"multimedia_desc":"Enter address after selecting inserting method below <span>multimedia </span>"
,"multimedia_html":"html(embed, object)"
,"multimedia_link":"Multimedia Link"
,"multimedia_source":"Source &nbsp;"
,"multimedia_input_link":"Enter Link"
,"multimedia_close":"<a href=\"#\" onclick=\"closeWindow();\" title=\"Close\" class=\"close_en\">Close</a>"
,"multimedia_reg":"<a href=\"#\" onclick=\"done();\" title=\"Register\" class=\"btnlink\">Register</a>"
,"image.title":"Picture"
,"image_paste_confirm":"Would you like to paste it as an image? \r\n( If you select Cancel, the local image is deleted.)"
,"_FONT_LIST":[
{ label: '<span f-style>Meiryo</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo', data: 'Meiryo', klass: '' },
{ label: '<span f-style>Meiryo Italic</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo Italic', data: 'Meiryo-Italic', klass: '' },
{ label: '<span f-style>Meiryo Bold</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo Bold', data: "'Meiryo Bold'", klass: '' },
{ label: '<span f-style>Meiryo Bold Italic</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo Bold Italic', data: 'Meiryo-BoldItalic', klass: '' },
{ label: '<span f-style>Meiryo UI</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo UI', data: 'MeiryoUI', klass: '' },
{ label: '<span f-style>Meiryo UI Italic</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo UI Italic', data: 'MeiryoUI-Italic', klass: '' },
{ label: '<span f-style>Meiryo UI Bold</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo UI Bold', data: 'MeiryoUI-Bold', klass: '' },
{ label: '<span f-style>Yu Gothic</span> (<span class="tx-txt">ABCDE</span>)', title: 'Yu Gothic', data: 'YuGothic-Regular', klass: '' },
{ label: '<span f-style>Yu Gothic Bold</span> (<span class="tx-txt">ABCDE</span>)', title: 'Yu Gothic Bold', data: 'YuGothic-Bold', klass: '' },
{ label: '<span f-style>Yu Gothic Light</span> (<span class="tx-txt">ABCDE</span>)', title: 'Yu Gothic Light', data: 'YuGothic-Light', klass: '' },
{ label: '<span f-style>Arial</span> (<span class="tx-txt">ABCDE</span>)', title: 'Arial', data: 'Arial', klass: '' },
{ label: '<span f-style>MS Gothic</span> (<span class="tx-txt">ABCDE</span>)', title: 'MS Gothic', data: "'MS Gothic'", klass: '' },
{ label: '<span f-style>MS JhengHei</span> (<span class="tx-txt">ABCDE</span>)', title: 'MS JhengHei', data: "'Microsoft JhengHei'", klass: '' },
{ label: '<span f-style>MS JhengHei Bold</span> (<span class="tx-txt">ABCDE</span>)', title: 'MS JhengHei Bold', data: "'Microsoft JhengHei Bold'", klass: '' },
{ label: '<span f-style>MS YaHei</span> (<span class="tx-txt">ABCDE</span>)', title: 'MS YaHei', data: "'Microsoft YaHei'", klass: '' },
{ label: '<span f-style>MS Mincho</span> (<span class="tx-txt">ABCDE</span>)', title: 'MS Mincho', data: "'MS Mincho'", klass: '' },
{ label: '<span f-style>MS PMincho</span> (<span class="tx-txt">ABCDE</span>)', title: 'MS PMincho', data: "'MS PMincho'", klass: '' },
{ label: '<span f-style>MingLiU</span> (<span class="tx-txt">ABCDE</span>)', title: 'MingLiU', data: 'MingLiU', klass: '' },
{ label: '<span f-style>MingLiU-ExtB</span> (<span class="tx-txt">ABCDE</span>)', title: 'MingLiU-ExtB', data: 'MingLiU-ExtB', klass: '' },
{ label: '<span f-style>Aharoni Bold</span> (<span class="tx-txt">ABCDE</span>)', title: 'Aharoni Bold', data: "'Aharoni Bold'", klass: '' },
{ label: '<span f-style>Algerian</span> (<span class="tx-txt">ABCDE</span>)', title: 'Algerian', data: 'Algerian', klass: '' },
{ label: '<span f-style>Arial Narrow</span> (<span class="tx-txt">ABCDE</span>)', title: 'Arial Narrow', data: "'Arial Narrow'", klass: '' },
{ label: '<span f-style>Arial Narrow Bold</span> (<span class="tx-txt">ABCDE</span>)', title: 'Arial Narrow Bold', data: "'Arial Narrow Bold'", klass: '' },
{ label: '<span f-style>Arial Narrow Bold Italic</span> (<span class="tx-txt">ABCDE</span>)', title: 'Arial Narrow Bold Italic', data: "'Arial Narrow Bold Italic'", klass: '' },
{ label: '<span f-style>Verdana</span> (<span class="tx-txt">ABCDE</span>)', title: 'Verdana', data: 'Verdana', klass: '' },
{ label: '<span f-style>Malgun Gothic</span> (<span class="tx-txt">ABCDE</span>)', title: 'Malgun Gothic', data: "'Malgun Gothic'", klass: '' },
{ label: '<span f-style>Gulim</span> (<span class="tx-txt">ABCDE</span>)', title: 'Gulim', data: 'Gulim', klass: '' }
]
,"_FONT_DEFAULT":{
color: "#000000",
fontFamily: "Meiryo",
fontSize: "10pt",
backgroundColor: "#fff",
lineHeight: "1.5",
padding: "8px"
}
,"_FONT_SAMPLE":"(<span class=\"tx-txt\">ABCD</span>)"
,"image_popup_title":"Insert Picture"
,"image_popup_error":"You have accessed the wrong path."
,"image_popup_close":"<a href=\"#\" onclick=\"closeWindow();\" title=\"Close\" class=\"close\">Close</a>"
,"image_popup_submit":"<a href=\"#\" onclick=\"imageUpload();\" title=\"Register\" class=\"btnlink\">Register</a>"
,"image_popup_cancel":"<a href=\"#\" onclick=\"closeWindow();\" title=\"Cancel\" class=\"btnlink\">Cancel</a>"
,"tx-more-down":"tx-more-down"
,"tx-more-up":"tx-more-up"
,"btn_cancel":"#iconpath/btn_cancel_en.gif?v=2"
,"btn_confirm":"#iconpath/btn_confirm_en.gif?v=2"
,"btn_confirm_img":"btn_confirm_en.gif"
,"btn_cancel_img":"btn_cancel_en.gif"
,"tx-btn-confirm":"tx-btn-confirm en"
,"tx-btn-cancel":"tx-btn-cancel en"
,"tx-btn-confirm_txt":"Confirm"
,"tx-btn-cancel_txt":"Cancel"
,"tx-more-button":"tx-more-button en"
,"btn_l_cancel":"#iconpath/btn_l_cancel_en.gif?v=2"
,"btn_l_confirm":"#iconpath/btn_l_confirm_en.gif?v=2"
,"tx-enter":"tx-enter en"
,"btn_remove":"#iconpath/btn_remove_en.gif?v=2"
,"citation_img":"#iconpath/quote/citation%(1)s_en.gif?v=2"
,"popup_footer":"<div class=\"footer en\">"
,"table.detail.menual":"Direct input"
,"table.detail.style":"Choose style"
,"table.detail.cell_bg":"Background"
,"table.detail.border_style":"Border style"
,"table.detail.border_line":"Border width"
,"table.detail.border_color":"Border color"
,"table.detail.ok":"Confirm"
,"table.detail.cancel":"Cancel"
,"btn_down_arrow1":"More"
,"btn_up_arrow":"Insert"
,"btn_down_arrow":"Delete"
,"btn_down_arrow2":"More"
,"table.popup.ok":"Confirm"
,"table.popup.cancel":"Cancel"
,"table.popup.cellsplit.rowinsert":"Insert Rows"
,"table.popup.cellsplit.columninsert":"Insert Columns"
,"table.popup.cellattr.lineselect":"Select Border"
,"table.popup.cellattr.h_align":"Horizontal"
,"table.popup.cellattr.v_align":"Vertical"
,"cellattr_width":"너비"
,"cellattr_height":"높이"
,"cellattr.align.left":"Left"
,"cellattr.align.center":"Center"
,"cellattr.align.right":"Right"
,"cellattr.align.top":"Top"
,"cellattr.align.middle":"Center"
,"cellattr.align.bottom":"Bottom"
,"num_validation":"This is not a valid number. The number must be between 2 and 10."
,"num_validation_2-10":"The number must be between 2 and 10."
,"cellattr.btn_border1":"No borders"
,"cellattr.btn_border2":"All border"
,"cellattr.btn_border3":"Outer border"
,"cellattr.btn_border4":"Inner border"
,"cellattr.btn_border1.txt":"None"
,"cellattr.btn_border2.txt":"All"
,"cellattr.btn_border3.txt":"Out"
,"cellattr.btn_border4.txt":"In"
,"cellattr.align.default":"None"
,"table.detail.cell_padding":"Cell margins"
,"tx_spellcheck_dic":"Select spell check dictionary language"
,"tx_spellcheck":"Check spelling"
,"number.alert":"Only the number of %(1)s to %(2)s can be entered."
,"tx_switchertoggle-title-html":"HTML Type"
,"url_message":"Click to open in new window"
,"tx_fullscreen-title-2":"Original size (Ctrl+M)"
	};
};
window[_global_key] = new I18N();
})(window._I18N_KEY?window._I18N_KEY:'_i18n_e');