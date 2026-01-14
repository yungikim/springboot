(function(_global_key){
 function I18N(){
	this.words = this.init();
	this.regexp = /%\((\d+)\)s/g;
	this.reg_format = /\{\{([^\}]+)\}\}/g;
	this.language = "ko";
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
"tx_fontfamily-title":"글꼴"
,"tx_fontsize-title":"글자크기"
,"tx_bold-title":"굵게 (Ctrl+B)"
,"tx_bold":"굵게"
,"tx_underline-title":"밑줄 (Ctrl+U)"
,"tx_underline":"밑줄"
,"tx_italic-title":"기울임 (Ctrl+I)"
,"tx_italic":"기울임"
,"tx_strike-title":"취소선 (Ctrl+D)"
,"tx_strike":"취소선"
,"tx_forecolor":"글자색"
,"tx_forecolor-arrow":"글자색 선택"
,"tx_backcolor":"글자 배경색"
,"tx_backcolor-arrow":"글자 배경색 선택"
,"tx_alignleft-title":"왼쪽정렬 (Ctrl+,)"
,"tx_alignleft":"왼쪽정렬"
,"tx_aligncenter-title":"가운데정렬 (Ctrl+.)"
,"tx_aligncenter":"가운데정렬"
,"tx_alignright-title":"오른쪽정렬 (Ctrl+/)"
,"tx_alignright":"오른쪽정렬"
,"tx_alignfull":"양쪽정렬"
,"tx_indent-title":"들여쓰기"
,"tx_indent":"들여쓰기"
,"tx_outdent-title":"내어쓰기 (Shift+Tab)"
,"tx_outdent":"내어쓰기"
,"tx_lineheight":"줄간격"
,"tx_lineheight-arrow":"줄간격 선택"
,"tx_styledlist":"리스트"
,"tx_styledlist-arrow":"리스트 선택"
,"tx_link-title":"링크 (Ctrl+K)"
,"tx_link":"링크"
,"tx_specialchar":"특수문자"
,"tx_table":"표만들기"
,"tx_horizontalrule":"구분선"
,"tx_richtextbox":"글상자"
,"tx-menu-simple":"간단 선택"
,"tx-menu-advanced":"직접 선택"
,"tx_quote-title":"인용구 (Ctrl+Q)"
,"tx_quote":"인용구"
,"tx_undo-title":"실행취소 (Ctrl+Z)"
,"tx_undo":"실행취소"
,"tx_redo-title":"다시실행 (Ctrl+Y)"
,"tx_redo":"다시실행"
,"tx_switchertoggle-title":"에디터 타입"
,"tx_switchertoggle-editor":"에디터"
,"tx_switchertoggle-html":"HTML"
,"tx_fullscreen-title":"넓게쓰기 (Ctrl+M)"
,"tx_fullscreen":"넓게쓰기"
,"tx_advanced":"툴바 더보기"
,"tx_mergecells":"병합"
,"tx_insertcells":"삽입"
,"tx_deletecells":"삭제"
,"tx_cellslinepreview":"선 미리보기"
,"tx_cellslinecolor":"선색"
,"tx_cellslineheight":"두께"
,"tx_cellslinestyle":"스타일"
,"tx_cellsoutline":"테두리"
,"tx_tablebackcolor":"테이블 배경색"
,"tx_tabletemplate":"테이블 서식"
,"menu.pallete.revert":"기본색으로"
,"adoptor.label":"가나다"
,"adoptor.transparent":"투명"
,"menu.pallete.enter":"입력"
,"menu.pallete.more":"더보기"
,"setDataByJSONToEditor_error":"\r\n소스보기 모드로 전환합니다.\r\n잘못된 HTML이 있는지 확인해주세요."
,"changeMode_error":"\r\n에디터 타입 변경에 실패하였습니다.\r\n잘못된 HTML이 있는지 확인해주세요."
,"attacher.only.wysiwyg.alert":"에디터 상태에서만 본문에 삽입할 수 있습니다."
,"attacher.ins":"삽입"
,"attacher.del":"삭제"
,"attacher.delete.confirm":"삭제하시면 본문에서도 삭제됩니다. 계속하시겠습니까?"
,"attacher.delete.all.confirm":"모든 첨부 파일을 삭제하시겠습니까? 삭제하시면 본문에서도 삭제됩니다."
,"attacher.exist.alert":"이미 본문에 삽입되어 있습니다."
,"attacher.can.modify.alert":"기존에 등록된 #{title}을(를) 수정할 수 있는 화면으로 이동합니다."
,"attacher.can.modify.confirm":"#{title}은(는) 하나만 등록이 가능합니다.\r\n다시 올리시면 기존의 #{title}이(가) 삭제됩니다. 계속하시겠습니까?"
,"attacher.insert.alert":"에디터 상태에서만 삽입할 수 있습니다."
,"attacher.capacity.alert":"용량을 초과하였습니다."
,"attacher.size.alert":"용량을 초과하여 더이상 등록할 수 없습니다."
,"embeder.alert":"에디터 상태에서만 삽입할 수 있습니다."
,"switcher.wysiwyg":"에디터"
,"switcher.source":"HTML"
,"switcher.text":"텍스트"
,"font-size-l7":"가나다라마바사 %(1)s"
,"font-size-l3":"가나다 %(1)s"
,"font-size-l5":"가나다라마 %(1)s"
,"backcolor":"가나다"
,"insertcells-addRowUpper":"위로 삽입"
,"insertcells-addRowBelow":"아래 삽입"
,"insertcells-addColLeft":"왼쪽 삽입"
,"insertcells-addColRight":"오른쪽 삽입"
,"deletecells-deleteRow":"행 삭제"
,"deletecells-deleteCol":"열 삭제"
,"mergecells-merge":"병합"
,"mergecells-cancelmerge":"분할"
,"cellslinestyle.subtitle1":"테두리 없음"
,"cellslinestyle.subtitle2":"실선"
,"cellslinestyle.subtitle3":"점선"
,"cellslinestyle.subtitle4":"작은 점선"
,"cellsoutline-all":"모든 테두리"
,"cellsoutline-out":"바깥 테두리"
,"cellsoutline-in":"안쪽 테두리"
,"cellsoutline-top":"위쪽 테두리"
,"cellsoutline-bottom":"아래쪽 테두리"
,"cellsoutline-left":"왼쪽 테두리"
,"cellsoutline-right":"오른쪽 테두리"
,"cellsoutline-none":"테두리 없음"
,"styledlist.subtitle1":"취소"
,"styledlist.subtitle2":"동그라미"
,"styledlist.subtitle3":"네모"
,"styledlist.subtitle4":"숫자"
,"styledlist.subtitle5":"로마숫자"
,"styledlist.subtitle6":"알파벳"
,"insertlink.invalid.url":"URL을 입력해주세요."
,"insertlink.link.alt":"[#{title}]로 이동합니다."
,"insertlink.title":"선택된 부분에 걸릴 URL주소를 넣어주세요."
,"insertlink.onclick.target":"클릭 시"
,"insertlink.target.blank":"새 창"
,"insertlink.target.self":"현재창"
,"richtextbox.add":"더하기"
,"richtextbox.sub":"빼기"
,"richtextbox.alert":"1 이상 20 이하의 숫자만 입력 가능합니다."
,"richtextbox.bg.color":"배경색"
,"richtextbox.border.color":"선 색"
,"richtextbox.border.style":"선 스타일"
,"richtextbox.border.width":"선 굵기"
,"table.alert":"1 이상 30 이하의 숫자만 입력 가능합니다."
,"table.title.insert":"표삽입 &nbsp;"
,"table.title.setDirectly":"표 직접설정"
,"table.title.col":"열 개수"
,"table.title.row":"행 개수"
,"emoticon.subtitle.person":"사람"
,"emoticon.subtitle.animal":"동식물"
,"emoticon.subtitle.thing":"사물"
,"emoticon.subtitle.etc":"기타"
,"specialchar.subtitle1":"일반기호"
,"specialchar.subtitle2":"수학부호, 통화단위"
,"specialchar.subtitle3":"원 기호, 괄호"
,"specialchar.subtitle4":"일본어"
,"specialchar.subtitle5":"로마자, 그리스"
,"file.title":"파일"
,"media.title":"멀티미디어"
,"canvas.unload.message":"작성하신 내용이 저장되지 않았습니다. 페이지를 떠나시겠습니까?"
,"canvas.unload.message.at.modify":"작성하신 내용이 저장되지 않았습니다. 페이지를 떠나시겠습니까?"
,"align.image.align.center":"가운데정렬"
,"align.image.align.full":"오른쪽글흐름"
,"align.image.align.left":"왼쪽정렬"
,"align.image.align.right":"왼쪽글흐름"
,"align.text.align.center":"가운데정렬 (Ctrl+.)"
,"align.text.align.full":"양쪽정렬"
,"align.text.align.left":"왼쪽정렬 (Ctrl+,)"
,"align.text.align.right":"오른쪽정렬 (Ctrl+/)"
,"table.noselect.alert":"테이블을 선택하신 후 사용가능합니다."
,"contextmenu.table.insertrowabove":"위에 행 추가"
,"contextmenu.table.insertrowbelow":"아래에 행 추가"
,"contextmenu.table.insertcolleft":"왼쪽에 열 추가"
,"contextmenu.table.insertcolright":"오른쪽에 열 추가"
,"contextmenu.table.deleterow":"행 삭제"
,"contextmenu.table.deletecol":"열 삭제"
,"contextmenu.table.cellmerge":"셀 병합"
,"contextmenu.table.cellsplit":"셀 나누기"
,"contextmenu.table.samewidth":"셀 너비 같게"
,"contextmenu.table.sameheight":"셀 높이 같게"
,"contextmenu.table.samewh":"셀 너비/높이 같게"
,"contextmenu.table.propcell":"셀 속성"
,"contextmenu.table.proptable":"표 속성"
,"table-insert":"삽입"
,"table-sepa":"구분"
,"table-delete":"삭제"
,"table-merge":"병합"
,"table-split":"분할"
,"table-same":"조정"
,"table-attr":"속성"
,"table.merge.confirm":"셀을 병합하면 맨 위쪽 셀에 있는 값만 남고 나머지 값은 잃게 됩니다."
,"table.merge.more.select.cells":"두 개 이상의 셀을 선택해주세요."
,"resetMerge_error":"이미 합쳐진 셀만 분할 가능합니다."
,"exitEditor_desc":"에디터 영역 : 에디터 영역에서 빠져 나오시려면 Shift+ESC키를 누르세요"
,"fullscreen.attach.close.btn":"파일첨부박스"
,"fullscreen.noti.btn":"일반 글쓰기로"
,"fullscreen.noti.span":"넓게쓰기 버튼을 다시 누르시면 처음 글쓰기 창 크기로 돌아갑니다."
,"specialchar.title":"선택한 기호"
,"tx_image":"사진"
,"tx_media":"외부컨텐츠"
,"error_editor_load":"에디터가 로드되지 않았습니다. 잠시 후 다시 시도하여 주십시오."
,"error_editor_load_fail":"에디터실행을 실패 하였습니다."
,"multimedia_popup_title":"멀티미디어 첨부"
,"multimedia_popup_error":"잘못된 경로로 접근하셨습니다."
,"multimedia_addr_error":"첨부할 멀티미디어 주소를 바르게 입력해주세요."
,"multimedia_title":"외부컨텐츠 삽입"
,"multimedia_desc":"아래 <span>멀티미디어 </span> 등의 삽입 방식을 선택한 후, 주소를 입력하세요."
,"multimedia_html":"html(embed,object 소스입력)"
,"multimedia_link":"멀티미디어 링크"
,"multimedia_source":"소스입력"
,"multimedia_input_link":"링크입력"
,"multimedia_close":"<a href=\"#\" onclick=\"closeWindow();\" title=\"닫기\" class=\"close\">닫기</a>"
,"multimedia_reg":"<a href=\"#\" onclick=\"done();\" title=\"등록\" class=\"btnlink\">등록</a>"
,"image.title":"사진"
,"image_paste_confirm":"이미지로 붙여넣으시겠습니까?\r\n(취소를 선택하시면 로컬 이미지는 삭제됩니다.)"
,"_FONT_LIST":[
{ label: '<span f-style>맑은 고딕</span> (<span class="tx-txt">가나다라</span>)', title: '맑은 고딕', data: "'Malgun Gothic',맑은 고딕'", klass: '' },
{ label: '<span f-style>굴림</span> (<span class="tx-txt">가나다라</span>)', title: '굴림', data: 'Gulim,굴림', klass: '' },
{ label: '<span f-style>궁서</span> (<span class="tx-txt">가나다라</span>)', title: '궁서', data: 'Gungsuh,궁서', klass: '' },
{ label: '<span f-style>돋움</span> (<span class="tx-txt">가나다라</span>)', title: '돋움', data: 'Dotum,돋움,sans-serif', klass: '' },
{ label: '<span f-style>바탕</span> (<span class="tx-txt">가나다라</span>)', title: '바탕', data: 'Batang,바탕', klass: '' },
{ label: '<span f-style>아리따-돋움_TTF_SemiBold</span> (<span class="tx-txt">가나다라</span>)', title: '아리따-돋움_TTF_SemiBold', data: 'Arita-dotumSB,아리따-돋움_TTF_SemiBold', klass: '' },
{ label: '<span f-style>아리따-돋움_TTF_Medium</span> (<span class="tx-txt">가나다라</span>)', title: '아리따-돋움_TTF_Medium', data: 'Arita-dotumM,아리따-돋움_TTF_Medium', klass: '' },
{ label: '<span f-style>아리따-돋움_TTF_Bold</span> (<span class="tx-txt">가나다라</span>)', title: '아리따-돋움_TTF_Bold', data: 'Arita-dotumB,아리따-돋움_TTF_Bold', klass: '' },
{ label: '<span f-style>아리따-돋움_TTF_Thin</span> (<span class="tx-txt">가나다라</span>)', title: '아리따-돋움_TTF_Thin', data: 'Arita-dotumT,아리따-돋움_TTF_Thin', klass: '' },
{ label: '<span f-style>아리따-부리_TTF_Medium</span> (<span class="tx-txt">가나다라</span>)', title: '아리따-부리_TTF_Medium', data: 'Arita-buriM,아리따-부리_TTF_Medium', klass: '' },
{ label: '<span f-style>아리따-부리_TTF_Light</span> (<span class="tx-txt">가나다라</span>)', title: '아리따-부리_TTF_Light', data: 'Arita-buriL,아리따-부리_TTF_Light', klass: '' },
{ label: '<span f-style>Arial</span> (<span class="tx-txt">abcde</span>)', title: 'Arial', data: 'Arial', klass: '' },
{ label: '<span f-style>Trebuchet MS</span> (<span class="tx-txt">abcde</span>)', title: 'Trebuchet MS', data: "'Trebuchet MS'", klass: '' },
{ label: '<span f-style>Tahoma</span> (<span class="tx-txt">abcde</span>)', title: 'Tahoma', data: 'Tahoma', klass: '' },
{ label: '<span f-style>Verdana</span> (<span class="tx-txt">abcde</span>)', title: 'Verdana', data: 'Verdana', klass: '' },
{ label: '<span f-style>Times New Roman</span> (<span class="tx-txt">abcde</span>)', title: 'Times New Roman', data: "'Times New Roman'", klass: '' },
{ label: '<span f-style>宋体</span> (<span class="tx-txt">ABCDE</span>)', title: '宋体', data: 'SimSun', klass: '' },
{ label: '<span f-style>Meiryo</span> (<span class="tx-txt">ABCDE</span>)', title: 'Meiryo', data: 'Meiryo', klass: '' },
{ label: '<span f-style>MS YaHei</span> (<span class="tx-txt">ABCDE</span>)', title: 'MS YaHei', data: "'Microsoft YaHei'", klass: '' }
]
,"_FONT_DEFAULT":{
color: "#000000",
fontFamily: "'Malgun Gothic','맑은 고딕'",
fontSize: "10pt",
backgroundColor: "#fff",
lineHeight: "1.5",
padding: "8px"
}
,"_FONT_SAMPLE":"(<span class=\"tx-txt\">가나다라</span>)"
,"image_popup_title":"이미지 첨부"
,"image_popup_error":"잘못된 경로로 접근하셨습니다."
,"image_popup_close":"<a href=\"#\" onclick=\"closeWindow();\" title=\"닫기\" class=\"close\">닫기</a>"
,"image_popup_submit":"<a href=\"#\" onclick=\"imageUpload();\" title=\"등록\" class=\"btnlink\">등록</a>"
,"image_popup_cancel":"<a href=\"#\" onclick=\"closeWindow();\" title=\"취소\" class=\"btnlink\">취소</a>"
,"tx-more-down":"tx-more-down"
,"tx-more-up":"tx-more-up"
,"btn_cancel":"#iconpath/btn_cancel.gif?v=2"
,"btn_confirm":"#iconpath/btn_confirm.gif?v=2"
,"btn_confirm_img":"btn_confirm.gif"
,"btn_cancel_img":"btn_cancel.gif"
,"tx-btn-confirm":"tx-btn-confirm"
,"tx-btn-cancel":"tx-btn-cancel"
,"tx-btn-confirm_txt":"확인"
,"tx-btn-cancel_txt":"취소"
,"tx-more-button":"tx-more-button"
,"btn_l_cancel":"#iconpath/btn_l_cancel.gif?v=2"
,"btn_l_confirm":"#iconpath/btn_l_confirm.gif?v=2"
,"tx-enter":"tx-enter"
,"btn_remove":"#iconpath/btn_remove.gif?v=2"
,"citation_img":"#iconpath/quote/citation%(1)s.gif?v=2"
,"popup_footer":"<div class=\"footer\">"
,"table.detail.menual":"직접입력"
,"table.detail.style":"스타일선택"
,"table.detail.cell_bg":"셀 배경색"
,"table.detail.border_style":"테두리 스타일"
,"table.detail.border_line":"테두리 두께"
,"table.detail.border_color":"테두리 색"
,"table.detail.ok":"확인"
,"table.detail.cancel":"취소"
,"btn_down_arrow1":"펼치기"
,"btn_up_arrow":"추가"
,"btn_down_arrow":"삭제"
,"btn_down_arrow2":"펼치기"
,"table.popup.ok":"확인"
,"table.popup.cancel":"취소"
,"table.popup.cellsplit.rowinsert":"행 추가"
,"table.popup.cellsplit.columninsert":"열 추가"
,"table.popup.cellattr.lineselect":"테두리 선택"
,"table.popup.cellattr.h_align":"수평정렬"
,"table.popup.cellattr.v_align":"수직정렬"
,"cellattr_width":"너비"
,"cellattr_height":"높이"
,"cellattr.align.left":"왼쪽"
,"cellattr.align.center":"가운데"
,"cellattr.align.right":"오른쪽"
,"cellattr.align.top":"위쪽"
,"cellattr.align.middle":"중앙"
,"cellattr.align.bottom":"아래쪽"
,"num_validation":"입력된 값이 숫자가 아닙니다. 2~10 사이로 입력해주세요"
,"num_validation_2-10":"2~10 사이로 입력해주세요"
,"cellattr.btn_border1":"테두리없음"
,"cellattr.btn_border2":"모든 테두리"
,"cellattr.btn_border3":"바깥쪽 테두리"
,"cellattr.btn_border4":"안쪽 테두리"
,"cellattr.btn_border1.txt":"없음"
,"cellattr.btn_border2.txt":"전체"
,"cellattr.btn_border3.txt":"바깥쪽"
,"cellattr.btn_border4.txt":"안쪽"
,"cellattr.align.default":"안함"
,"table.detail.cell_padding":"셀 여백"
,"tx_spellcheck_dic":"맞춤법 검사 사전 언어"
,"tx_spellcheck":"맞춤법 검사"
,"number.alert":"%(1)s 이상 %(2)s 이하의 숫자만 입력 가능합니다."
,"tx_switchertoggle-title-html":"HTML 타입"
,"url_message":"클릭시 새창으로 열립니다."
,"tx_fullscreen-title-2":"원래대로 (Ctrl+M)"
	};
};
window[_global_key] = new I18N();
})(window._I18N_KEY?window._I18N_KEY:'_i18n_e');