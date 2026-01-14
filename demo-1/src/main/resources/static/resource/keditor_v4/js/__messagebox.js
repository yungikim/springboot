/**
 * _MESSAGEBOX version 1.0
 * Copyrightⓒ 2009 - 2011 Hyung-goo Yeo All rights reserved.
 */
if(typeof(window.__UI._MESSAGEBOX) == "undefined"){
	__UI.NLS.MESSAGEBOX = {
	};
	__UI.CONST.MESSEGEBOX = {
	};
	__UI._MESSAGEBOX = {
		_parent:"POPUP",
		_class_name:"MESSAGEBOX",
		_initialize:function(_window, type, content, class_att_suffix, group_id){
			this._message_box_content = content;
			this._msg_type = new (__UI.ClassLoader("STATE"))();
			this._msg_type.set(type);
			if(group_id == null) group_id = "msgbox"; 
			$super(_window
					, null
					, __UI.CONST.POPUP._TYPE_MESSAGEBOX
					, 0
					, 0
					, group_id
					, class_att_suffix
					, null
					, null
					, null
			);
		},
		get_content:function(){
			var html = '<div id="id_msgbox' + this._instance_id + '" class="cls_message_box_wrapper' + (this._cls_suffix?this._cls_suffix:'') + '">';
			html += '<table cellPadding="0" cellSpacing="0" style="border-collapse:collapse;"  class="cls_message_box_table' + (this._cls_suffix?this._cls_suffix:'') + '">';
			html += '<tbody><tr><td style="white-space:nowrap;overflow:visible;"  class="cls_message_box_td' + (this._cls_suffix?this._cls_suffix:'') + '">';
			html += this._message_box_content;
			html += '</td></tr></tbody>';
			html += '</table>';
			html += '</div>';
			return html;
		},
		show:function(content){
			this._message_box_content = content;
			this._show_popup();
		},
		hidden:function(){
			this._hidden_popup();
		},
		layout_content:function(){
		}
	};
}
