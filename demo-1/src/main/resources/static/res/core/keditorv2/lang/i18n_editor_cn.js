(function(_global_key){
 function I18N(){
	this.words = this.init();
	this.regexp = /%\((\d+)\)s/g;
	this.reg_format = /\{\{([^\}]+)\}\}/g;
	this.language = "cn";
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
"tx_fontfamily-title":"字体"
,"tx_fontsize-title":"字体大小"
,"tx_bold-title":"加粗 (Ctrl+B)"
,"tx_bold":"加粗"
,"tx_underline-title":"下划线 (Ctrl+U)"
,"tx_underline":"下划线"
,"tx_italic-title":"斜体 (Ctrl+I)"
,"tx_italic":"斜体"
,"tx_strike-title":"删除线 (Ctrl+D)"
,"tx_strike":"删除线"
,"tx_forecolor":"字体颜色"
,"tx_forecolor-arrow":"选择字体颜色"
,"tx_backcolor":"字体背景色"
,"tx_backcolor-arrow":"选择字体背景色"
,"tx_alignleft-title":"左侧整列 (Ctrl+,)"
,"tx_alignleft":"左侧整列"
,"tx_aligncenter-title":"居中 (Ctrl+.)"
,"tx_aligncenter":"居中"
,"tx_alignright-title":"右对齐 (Ctrl+/)"
,"tx_alignright":"右对齐"
,"tx_alignfull":"两端对齐"
,"tx_indent-title":"缩进"
,"tx_indent":"缩进"
,"tx_outdent-title":"减少缩进 (Shift+Tab)"
,"tx_outdent":"减少缩进"
,"tx_lineheight":"行间距"
,"tx_lineheight-arrow":"选择行间隔"
,"tx_styledlist":"编号列表"
,"tx_styledlist-arrow":"选择列表"
,"tx_link-title":"Link (Ctrl+K)"
,"tx_link":"Link"
,"tx_specialchar":"特殊符号"
,"tx_table":"创建表"
,"tx_horizontalrule":"区分线"
,"tx_richtextbox":"文本框"
,"tx-menu-simple":"简单选择"
,"tx-menu-advanced":"直接选择"
,"tx_quote-title":"引用 (Ctrl+Q)"
,"tx_quote":"引用"
,"tx_undo-title":"撤消 (Ctrl+Z)"
,"tx_undo":"撤消"
,"tx_redo-title":"恢复 (Ctrl+Y)"
,"tx_redo":"恢复"
,"tx_switchertoggle-title":"编辑器类型"
,"tx_switchertoggle-editor":"编辑器"
,"tx_switchertoggle-html":"HTML"
,"tx_fullscreen-title":"宽屏 (Ctrl+M)"
,"tx_fullscreen":"宽屏"
,"tx_advanced":"工具栏查看更多"
,"tx_mergecells":"合并"
,"tx_insertcells":"插入"
,"tx_deletecells":"删除"
,"tx_cellslinepreview":"线预览"
,"tx_cellslinecolor":"线色"
,"tx_cellslineheight":"粗细"
,"tx_cellslinestyle":"线类型"
,"tx_cellsoutline":"边框"
,"tx_tablebackcolor":"表背景色"
,"tx_tabletemplate":"테이블 서식"
,"menu.pallete.revert":"默认颜色"
,"adoptor.label":"ABC"
,"adoptor.transparent":"透明"
,"menu.pallete.enter":"输入"
,"menu.pallete.more":"查看更多"
,"setDataByJSONToEditor_error":"\r\n转换为源码查看模式。\r\n请确认HTML 是正确的"
,"changeMode_error":"\r\n编辑类型更换失败，确认HTML是否错误"
,"attacher.only.wysiwyg.alert":"只能在编辑状态下插入文本"
,"attacher.ins":"插入"
,"attacher.del":"删除"
,"attacher.delete.confirm":"삭제하시면 본문에서도 삭제됩니다. 계속하시겠습니까?"
,"attacher.delete.all.confirm":"모든 첨부 파일을 삭제하시겠습니까? 삭제하시면 본문에서도 삭제됩니다."
,"attacher.exist.alert":"이미 본문에 삽입되어 있습니다."
,"attacher.can.modify.alert":"기존에 등록된 #{title}을(를) 수정할 수 있는 화면으로 이동합니다."
,"attacher.can.modify.confirm":"#{title}은(는) 하나만 등록이 가능합니다.\r\n다시 올리시면 기존의 #{title}이(가) 삭제됩니다. 계속하시겠습니까?"
,"attacher.insert.alert":"只能在编辑状态下插入"
,"attacher.capacity.alert":"용량을 초과하였습니다."
,"attacher.size.alert":"용량을 초과하여 더이상 등록할 수 없습니다."
,"embeder.alert":"只能在编辑状态下插入"
,"switcher.wysiwyg":"编辑器"
,"switcher.source":"HTML"
,"switcher.text":"Text"
,"font-size-l7":"ABCDEFG %(1)s"
,"font-size-l3":"ABC %(1)s"
,"font-size-l5":"ABCDEF %(1)s"
,"backcolor":"ABC"
,"insertcells-addRowUpper":"在上方插入"
,"insertcells-addRowBelow":"在下方插入"
,"insertcells-addColLeft":"在左侧插入"
,"insertcells-addColRight":"在右侧插入"
,"deletecells-deleteRow":"删除行"
,"deletecells-deleteCol":"删除列"
,"mergecells-merge":"合并"
,"mergecells-cancelmerge":"分割"
,"cellslinestyle.subtitle1":"无框线"
,"cellslinestyle.subtitle2":"实线"
,"cellslinestyle.subtitle3":"虚线"
,"cellslinestyle.subtitle4":"小虚线"
,"cellsoutline-all":"所有框线"
,"cellsoutline-out":"外侧框线"
,"cellsoutline-in":"内部框线"
,"cellsoutline-top":"上框线"
,"cellsoutline-bottom":"下框线"
,"cellsoutline-left":"左框线"
,"cellsoutline-right":"右框线"
,"cellsoutline-none":"无框线"
,"styledlist.subtitle1":"取消"
,"styledlist.subtitle2":"Circle"
,"styledlist.subtitle3":"四边形"
,"styledlist.subtitle4":"数字"
,"styledlist.subtitle5":"罗马数字"
,"styledlist.subtitle6":"罗马字母"
,"insertlink.invalid.url":"请输入URL"
,"insertlink.link.alt":"移动至[#{title}]"
,"insertlink.title":"请在所选区域添加URL地址"
,"insertlink.onclick.target":"点击时"
,"insertlink.target.blank":"新窗口"
,"insertlink.target.self":"目前窗口"
,"richtextbox.add":"加"
,"richtextbox.sub":"Minus"
,"richtextbox.alert":"只可输入1到20之间的数字"
,"richtextbox.bg.color":"背景色"
,"richtextbox.border.color":"边框色"
,"richtextbox.border.style":"线类型"
,"richtextbox.border.width":"线粗细"
,"table.alert":"请输入1-30之间的数字"
,"table.title.insert":"插入表 &nbsp;"
,"table.title.setDirectly":"表直接设定"
,"table.title.col":"列数"
,"table.title.row":"行数"
,"emoticon.subtitle.person":"사람"
,"emoticon.subtitle.animal":"동식물"
,"emoticon.subtitle.thing":"사물"
,"emoticon.subtitle.etc":"기타"
,"specialchar.subtitle1":"一般符号"
,"specialchar.subtitle2":"数学符号， 货币单位"
,"specialchar.subtitle3":"圆符号， 括号"
,"specialchar.subtitle4":"日本语"
,"specialchar.subtitle5":"罗马字符， 希腊字符"
,"file.title":"파일"
,"media.title":"多媒体"
,"canvas.unload.message":"您编辑的内容未保存，确认要离开此页面么?"
,"canvas.unload.message.at.modify":"您编辑的内容未保存，确认要离开此页面么?"
,"align.image.align.center":"居中"
,"align.image.align.full":"右侧内容"
,"align.image.align.left":"左对齐"
,"align.image.align.right":"左侧内容"
,"align.text.align.center":"居中 (Ctrl+.)"
,"align.text.align.full":"两端对齐"
,"align.text.align.left":"左对齐 (Ctrl+,)"
,"align.text.align.right":"右对齐 (Ctrl+/)"
,"table.noselect.alert":"您可以再选择表格后使用."
,"contextmenu.table.insertrowabove":"上方添加行"
,"contextmenu.table.insertrowbelow":"下方添加行"
,"contextmenu.table.insertcolleft":"左侧添加列"
,"contextmenu.table.insertcolright":"右侧添加列"
,"contextmenu.table.deleterow":"删除行"
,"contextmenu.table.deletecol":"删除列"
,"contextmenu.table.cellmerge":"合并单元格"
,"contextmenu.table.cellsplit":"单元格分离"
,"contextmenu.table.samewidth":"单元格宽度等同"
,"contextmenu.table.sameheight":"单元格高度等同"
,"contextmenu.table.samewh":"单元格宽度/高度等同"
,"contextmenu.table.propcell":"单元格属性"
,"contextmenu.table.proptable":"表属性"
,"table-insert":"插入"
,"table-sepa":"구분"
,"table-delete":"删除"
,"table-merge":"合并"
,"table-split":"分割"
,"table-same":"조정"
,"table-attr":"속성"
,"table.merge.confirm":"如果合并单元格， 只会保留最上端的值，其余值会丢失"
,"table.merge.more.select.cells":"请选择两个以上的单元"
,"resetMerge_error":"已经合并的单元可以分离"
,"exitEditor_desc":"编辑器区域：如想要跳出编辑区域，请按Shift+ESC"
,"fullscreen.attach.close.btn":"파일첨부박스"
,"fullscreen.noti.btn":"以普通文字编辑"
,"fullscreen.noti.span":"Pressing the Wide Write button again will return to the original writing window size. "
,"specialchar.title":"选择的符号"
,"tx_image":"图片"
,"tx_media":"外部内容"
,"error_editor_load":"未能加载编辑器， 请稍后再试"
,"error_editor_load_fail":"编辑器执行失败"
,"multimedia_popup_title":"附加多媒体"
,"multimedia_popup_error":"通过错误的渠道访问"
,"multimedia_addr_error":"\"请输入正确的将要附加的多媒体地址"
,"multimedia_title":"插入外部内容"
,"multimedia_desc":"请选择以下<span>多媒体</span>等的插入方式后，输入地址"
,"multimedia_html":"html(embed, object)"
,"multimedia_link":"多媒体Link"
,"multimedia_source":"输入源码"
,"multimedia_input_link":"输入Link"
,"multimedia_close":"<a href=\"#\" onclick=\"closeWindow();\" title=\"Close\" class=\"close_en\">Close</a>"
,"multimedia_reg":"<a href=\"#\" onclick=\"done();\" title=\"登录\" class=\"btnlink\">登录</a>"
,"image.title":"图片"
,"image_paste_confirm":"要粘贴图片么？\r\n（如果点击取消，本地图片会被删除）"
,"_FONT_LIST":[
{ label: '<span f-style>宋体</span> (<span class="tx-txt">ABCDE</span>)', title: '宋体', data: 'SimSun', klass: '' },
{ label: '<span f-style>仿宋</span> (<span class="tx-txt">ABCDE</span>)', title: '仿宋', data: 'FangSong', klass: '' },
{ label: '<span f-style>幼圆</span> (<span class="tx-txt">ABCDE</span>)', title: '幼圆', data: 'YouYuan', klass: '' },
{ label: '<span f-style>微软雅黑</span> (<span class="tx-txt">ABCDE</span>)', title: '微软雅黑', data: "'Microsoft YaHei'", klass: '' },
{ label: '<span f-style>微软雅黑 Bold</span> (<span class="tx-txt">ABCDE</span>)', title: '微软雅黑 Bold', data: "'Microsoft YaHei Bold'", klass: '' },
{ label: '<span f-style>微软雅黑 Light</span> (<span class="tx-txt">ABCDE</span>)', title: '微软雅黑 Light', data: "'Microsoft YaHei Light'", klass: '' },
{ label: '<span f-style>华文中宋</span> (<span class="tx-txt">ABCDE</span>)', title: '华文中宋', data: 'STZhongsong', klass: '' },
{ label: '<span f-style>华文仿宋</span> (<span class="tx-txt">ABCDE</span>)', title: '华文仿宋', data: 'STFangsong', klass: '' },
{ label: '<span f-style>华文宋体</span> (<span class="tx-txt">ABCDE</span>)', title: '华文宋体', data: 'STSong', klass: '' },
{ label: '<span f-style>华文彩云</span> (<span class="tx-txt">ABCDE</span>)', title: '华文彩云', data: 'STCaiyun', klass: '' },
{ label: '<span f-style>华文新魏</span> (<span class="tx-txt">ABCDE</span>)', title: '华文新魏', data: 'STXinwei', klass: '' },
{ label: '<span f-style>华文楷体</span> (<span class="tx-txt">ABCDE</span>)', title: '华文楷体', data: 'STKaiti', klass: '' },
{ label: '<span f-style>华文琥珀</span> (<span class="tx-txt">ABCDE</span>)', title: '华文琥珀', data: 'STHupo', klass: '' },
{ label: '<span f-style>华文细黑</span> (<span class="tx-txt">ABCDE</span>)', title: '华文细黑', data: 'STXihei', klass: '' },
{ label: '<span f-style>华文行楷</span> (<span class="tx-txt">ABCDE</span>)', title: '华文行楷', data: 'STXingkai', klass: '' },
{ label: '<span f-style>新宋体</span> (<span class="tx-txt">ABCDE</span>)', title: '新宋体', data: 'NSimSun', klass: '' },
{ label: '<span f-style>楷体</span> (<span class="tx-txt">ABCDE</span>)', title: '楷体', data: 'KaiTi', klass: '' },
{ label: '<span f-style>黑体</span> (<span class="tx-txt">ABCDE</span>)', title: '黑体', data: 'SimHei', klass: '' },
{ label: '<span f-style>Arial</span> (<span class="tx-txt">ABCDE</span>)', title: 'Arial', data: 'Arial', klass: '' },
{ label: '<span f-style>Tahoma</span> (<span class="tx-txt">ABCDE</span>)', title: 'Tahoma', data: 'Tahoma', klass: '' },
{ label: '<span f-style>Verdana</span> (<span class="tx-txt">ABCDE</span>)', title: 'Verdana', data: 'Verdana', klass: '' },
{ label: '<span f-style>Malgun Gothic</span> (<span class="tx-txt">ABCDE</span>)', title: 'Malgun Gothic', data: "'Malgun Gothic'", klass: '' },
{ label: '<span f-style>Gulim</span> (<span class="tx-txt">ABCDE</span>)', title: 'Gulim', data: 'Gulim', klass: '' }
]
,"_FONT_DEFAULT":{
color: "#000000",
fontFamily: "SimSun",
fontSize: "10pt",
backgroundColor: "#fff",
lineHeight: "1.5",
padding: "8px"
}
,"_FONT_SAMPLE":"(<span class=\"tx-txt\">ABCD</span>)"
,"image_popup_title":"添加图片附件"
,"image_popup_error":"通过错误的渠道访问"
,"image_popup_close":"<a href=\"#\" onclick=\"closeWindow();\" title=\"Close\" class=\"close\">Close</a>"
,"image_popup_submit":"<a href=\"#\" onclick=\"imageUpload();\" title=\"登录\" class=\"btnlink\">登录</a>"
,"image_popup_cancel":"<a href=\"#\" onclick=\"closeWindow();\" title=\"取消\" class=\"btnlink\">取消</a>"
,"tx-more-down":"tx-more-down"
,"tx-more-up":"tx-more-up"
,"btn_cancel":"#iconpath/btn_cancel_en.gif?v=2"
,"btn_confirm":"#iconpath/btn_confirm_en.gif?v=2"
,"btn_confirm_img":"btn_confirm_en.gif"
,"btn_cancel_img":"btn_cancel_en.gif"
,"tx-btn-confirm":"tx-btn-confirm en"
,"tx-btn-cancel":"tx-btn-cancel en"
,"tx-btn-confirm_txt":"确认"
,"tx-btn-cancel_txt":"取消"
,"tx-more-button":"tx-more-button en"
,"btn_l_cancel":"#iconpath/btn_l_cancel_en.gif?v=2"
,"btn_l_confirm":"#iconpath/btn_l_confirm_en.gif?v=2"
,"tx-enter":"tx-enter en"
,"btn_remove":"#iconpath/btn_remove_en.gif?v=2"
,"citation_img":"#iconpath/quote/citation%(1)s_en.gif?v=2"
,"popup_footer":"<div class=\"footer en\">"
,"table.detail.menual":"直接输入"
,"table.detail.style":"选择类型"
,"table.detail.cell_bg":"单元格背景色"
,"table.detail.border_style":"边框类型"
,"table.detail.border_line":"边框厚度"
,"table.detail.border_color":"边框颜色"
,"table.detail.ok":"确认"
,"table.detail.cancel":"取消"
,"btn_down_arrow1":"展开"
,"btn_up_arrow":"增加"
,"btn_down_arrow":"删除"
,"btn_down_arrow2":"展开"
,"table.popup.ok":"确认"
,"table.popup.cancel":"取消"
,"table.popup.cellsplit.rowinsert":"添加行"
,"table.popup.cellsplit.columninsert":"添加列"
,"table.popup.cellattr.lineselect":"选择边框"
,"table.popup.cellattr.h_align":"水平整列"
,"table.popup.cellattr.v_align":"垂直整列"
,"cellattr_width":"너비"
,"cellattr_height":"높이"
,"cellattr.align.left":"左侧"
,"cellattr.align.center":"中间"
,"cellattr.align.right":"右侧"
,"cellattr.align.top":"上方"
,"cellattr.align.middle":"中央"
,"cellattr.align.bottom":"下方"
,"num_validation":"输入的值不是数字。 请输入2-10之间的数字"
,"num_validation_2-10":"请输入2-10之间的数字"
,"cellattr.btn_border1":"无框线"
,"cellattr.btn_border2":"所有框线"
,"cellattr.btn_border3":"外侧框线"
,"cellattr.btn_border4":"内部框线"
,"cellattr.btn_border1.txt":"无"
,"cellattr.btn_border2.txt":"整体"
,"cellattr.btn_border3.txt":"外侧"
,"cellattr.btn_border4.txt":"内侧"
,"cellattr.align.default":"无"
,"table.detail.cell_padding":"单元格余白"
,"tx_spellcheck_dic":"选择拼写检查字典的语言"
,"tx_spellcheck":"检查拼写"
,"number.alert":"请输入%(1)s-%(2)s之间的数字"
,"tx_switchertoggle-title-html":"HTML类型"
,"url_message":"点击在新窗口中打开。"
,"tx_fullscreen-title-2":"原始尺寸 (Ctrl+M)"
	};
};
window[_global_key] = new I18N();
})(window._I18N_KEY?window._I18N_KEY:'_i18n_e');