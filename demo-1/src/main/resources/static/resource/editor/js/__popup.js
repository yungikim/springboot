/**
 * _POPUP version 1.0
 * Copyrightⓒ 2009 - 2011 Hyung-goo Yeo All rights reserved.
 */
if(typeof(window.__UI._POPUP) == "undefined"){
	__UI.CONST.POPUP = {
		_TYPE_HOVER 				: 1 << 0,
		_TYPE_CLICK 				: 1 << 1,
		_TYPE_TOGGLE 				: 1 << 2,
		_TYPE_CONTEXT 				: 1 << 3,
		_TYPE_MESSAGEBOX			: 1 << 4,
		_TYPE_HIDDEN_FOCUS_OUT		: 1 << 5,
		_TYPE_DISPLAY_TOP_DOWN		: 1 << 6,
		_TYPE_ALIGN_RIGHT			: 1 << 7,
		_TYPE_SHARED_LAYER			: 1 << 8,
		
		_STATE_DRAW_COMPLETE 		: 1 << 0,
		_STATE_SHOW 				: 1 << 1,
		_STATE_MOUSE_OVER 			: 1 << 2,
		_STATE_MOUSE_POPUP_OVER 	: 1 << 3,
		_STATE_SHOW_TIMER 			: 1 << 4,
		_STATE_HIDDEN_TIMER 		: 1 << 5,
		_STATE_BODY_SCROLL_EVENT	: 1 << 6
	};
	__UI.POPUP = {
		_group_hash:{},
		set_active_popup:function(group_id, object){
			if(__UI.POPUP._group_hash[group_id] == null) __UI.POPUP._group_hash[group_id] = {active:null,hover:null};
			if(__UI.POPUP._group_hash[group_id].active != null
					&& __UI.POPUP._group_hash[group_id].active._instance_id != object._instance_id){
				__UI.POPUP._group_hash[group_id].active._inactive();
			}
			__UI.POPUP._group_hash[group_id].active = object;
		},
		set_hover_popup:function(group_id, object){
			if(__UI.POPUP._group_hash[group_id] == null) __UI.POPUP._group_hash[group_id] = {active:null,hover:null};
			if(__UI.POPUP._group_hash[group_id].hover != null
					&& __UI.POPUP._group_hash[group_id].hover._instance_id != object._instance_id){
				__UI.POPUP._group_hash[group_id].hover._clear_delay_show_popup();
			}
			__UI.POPUP._group_hash[group_id].hover = object;
		},
		get_active_popup:function(group_id){
			return (__UI.POPUP._group_hash[group_id]!=null?__UI.POPUP._group_hash[group_id].active:null);
		},
		get_hover_popup:function(group_id){
			return (__UI.POPUP._group_hash[group_id]!=null?__UI.POPUP._group_hash[group_id].hover:null);
		}
	};
	__UI._POPUP = {
		_parent:"UI",
		_class_name:"POPUP",
		_initialize:function(_window
				, target
				, type
				, in_delay_time_ms
				, out_delay_time_ms
				, group_id
				, class_att_suffix
				, parent_control
				, data_provider
				, event_adapter){
			$super(data_provider, event_adapter, _window);
			
			this._active_object = target;
			this._parent_control = parent_control;
			this._runtime_child_control = null;
			this._cls_name = this._class_name.toLowerCase();
			this._cls_suffix = (class_att_suffix!=null?class_att_suffix:'');
			this._group_id = group_id;
			this._type = new (__UI.ClassLoader("STATE"))();
			this._type.set(type);
			this._in_delay_time = (in_delay_time_ms==null||in_delay_time_ms==""?(this._type.check(__UI.CONST.POPUP._TYPE_CLICK)?0:500):in_delay_time_ms);
			this._out_delay_time = (out_delay_time_ms==null||out_delay_time_ms==""?500:out_delay_time_ms);
			this._in_timeout_id = null;
			this._out_timeout_id = null;
			this._popup = {wrapper:null, iframe:null, bgdiv:null, content:null};
			this._z_index = 1000;
			this._init();
		},
		get_content:function(){return '<div style="background-color:white;border:1px solid black;">POPUP</div>';},
		layout_content:function(){/*get_content 내용의 width/height 조정;*/},
		popup_draw_complete:function(){},
		_init:function(){
			if(this._active_object && this._type.check(__UI.CONST.POPUP._TYPE_CLICK|__UI.CONST.POPUP._TYPE_TOGGLE|__UI.CONST.POPUP._TYPE_CONTEXT)){
				this._mousedown_target_event_fnc = __dom.add_event_listener(this._active_object, "mousedown", Object.bind_event_listener(window, this, this._click));
			}
			if(this._active_object) this._mouseover_target_event_fnc = __dom.add_event_listener(this._active_object, "mouseover", Object.bind_event_listener(window, this, this._mouse_over));
			if(this._active_object) this._mouseout_target_event_fnc = __dom.add_event_listener(this._active_object, "mouseout", Object.bind_event_listener(window, this, this._mouse_out));
			if(this._type.check(__UI.CONST.POPUP._TYPE_CONTEXT|__UI.CONST.POPUP._TYPE_HIDDEN_FOCUS_OUT)){
				this._mousedown_body_event_fnc = __dom.add_event_listener(this._window.document.body, "mousedown", Object.bind_event_listener(window, this, this._body_mouse_down));
			}
			if(this._type.check(__UI.CONST.POPUP._TYPE_CONTEXT)){
				this._context_body_event_fnc = __dom.add_event_listener(this._window.document.body, "contextmenu", Object.bind_event_listener(window, this, this._body_context));				
			}
			if(this._type.check(__UI.CONST.POPUP._TYPE_MESSAGEBOX)){
				this._mousedown_body_event_fnc = __dom.add_event_listener(this._window, "resize", Object.bind_event_listener(window, this, this._set_msgbox_position));
			}
		},
		_mouse_over:function(ev){
			this._state.set(__UI.CONST.POPUP._STATE_MOUSE_OVER);
			this._clear_delay_hidden_popup();
			if(!this._type.check(__UI.CONST.POPUP._TYPE_CLICK|__UI.CONST.POPUP._TYPE_TOGGLE|__UI.CONST.POPUP._TYPE_CONTEXT|__UI.CONST.POPUP._TYPE_MESSAGEBOX)) this._delay_show_popup();
		},
		_mouse_out:function(ev){
			this._state.clear(__UI.CONST.POPUP._STATE_MOUSE_OVER);
			if(!this._type.check(__UI.CONST.POPUP._TYPE_TOGGLE|__UI.CONST.POPUP._TYPE_CONTEXT|__UI.CONST.POPUP._TYPE_MESSAGEBOX)){
				this._clear_delay_show_popup();
				this._delay_hidden_popup();
			}
		},
		_click:function(ev){
			if(this._type.check(__UI.CONST.POPUP._TYPE_TOGGLE)
					&& this._state.check(__UI.CONST.POPUP._STATE_SHOW)){
				this._inactive();
			}else if(this._type.check(__UI.CONST.POPUP._TYPE_CONTEXT)){
				if(ev.button == 2){
					this._show_popup(ev);
				}else{
					this._inactive();
				}
			}else{
				this._show_popup();
			}
			__dom.event.cancel_bubble(ev, true);
			__dom.event.return_value(ev, false);
		},
		_body_mouse_down:function(ev){
			if(this._state.check(__UI.CONST.POPUP._STATE_MOUSE_POPUP_OVER)) return;
			this._inactive();
		},
		_body_context:function(ev){
			if(this._state.check(__UI.CONST.POPUP._STATE_MOUSE_OVER)){
				__dom.event.cancel_bubble(ev, true);
				__dom.event.return_value(ev, false);
			}
		},
		_popup_mouse_down:function(ev){
			if(this._event_adapter&&this._event_adapter.mouse_down) this._event_adapter.mouse_down(ev);
		},
		_popup_mouse_over:function(ev){
			this._state.set(__UI.CONST.POPUP._STATE_MOUSE_OVER|__UI.CONST.POPUP._STATE_MOUSE_POPUP_OVER);
			this._clear_delay_hidden_popup();
			this._delay_show_popup();
			if(this._event_adapter&&this._event_adapter.mouse_over) this._event_adapter.mouse_over(ev);
		},
		_popup_mouse_out:function(ev){
			this._state.clear(__UI.CONST.POPUP._STATE_MOUSE_OVER|__UI.CONST.POPUP._STATE_MOUSE_POPUP_OVER);
			if(!this._type.check(__UI.CONST.POPUP._TYPE_TOGGLE|__UI.CONST.POPUP._TYPE_CONTEXT|__UI.CONST.POPUP._TYPE_MESSAGEBOX)){
				this._clear_delay_show_popup();
				this._delay_hidden_popup();
			}
			if(this._event_adapter&&this._event_adapter.mouse_out) this._event_adapter.mouse_out(ev);
		},
		_delay_show_popup:function(){
			if(this._state.check(__UI.CONST.POPUP._STATE_SHOW|__UI.CONST.POPUP._STATE_SHOW_TIMER)) return;
			this._state.set(__UI.CONST.POPUP._STATE_SHOW_TIMER);
			__UI.POPUP.set_hover_popup(this._group_id, this);
			if(!this._in_timeout_id) this._in_timeout_id = window.setTimeout(Object.bind(window, this, this._show_popup), this._in_delay_time);
		},
		_clear_delay_show_popup:function(){
			if(this._in_timeout_id) window.clearTimeout(this._in_timeout_id);
			this._in_timeout_id = null;
			this._state.clear(__UI.CONST.POPUP._STATE_SHOW_TIMER);
		},
		_show_popup:function(ev){
			__UI.POPUP.set_active_popup(this._group_id, this);
			this._state.set(__UI.CONST.POPUP._STATE_SHOW);
			this._set_parent_control_runtime_child();
			if(!this._state.check(__UI.CONST.POPUP._STATE_DRAW_COMPLETE)){
				this._draw_popup();
			}else if(this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER|__UI.CONST.POPUP._TYPE_MESSAGEBOX)){
				this._popup.content.innerHTML = this.get_content();
			}
			if(this._type.check(__UI.CONST.POPUP._TYPE_MESSAGEBOX)){
				this._set_msgbox_position(ev);
			}else if(this._type.check(__UI.CONST.POPUP._TYPE_CONTEXT)){
				this._set_context_position(ev);
			}else{
				this._set_popup_position();
			}
		},
		_set_parent_control_runtime_child:function(){
			if(this.parent_control){
				this.parent_control.runtime_child_control = this;
			}
		},
		_is_show_child_control:function(){
			if(this.runtime_child_control){
				return this.runtime_child_control._state.check(__UI.CONST.POPUP._STATE_SHOW);
			}else{
				return false;
			}
		},
		get_event_target:function(type){
			switch(type){
			case "content":
				return this._popup.content;
				break;
			}
			return null;
		},
		_delay_hidden_popup:function(){
			if(this._is_show_child_control()) return;
			if(this._state.check(__UI.CONST.POPUP._STATE_HIDDEN_TIMER)) return;
			this._state.set(__UI.CONST.POPUP._STATE_HIDDEN_TIMER);
			if(!this._out_timeout_id) this._out_timeout_id = window.setTimeout(Object.bind(window, this, this._hidden_popup), this._out_delay_time);
		},
		_clear_delay_hidden_popup:function(){
			if(this._out_timeout_id) window.clearTimeout(this._out_timeout_id);
			this._out_timeout_id = null;
			this._state.clear(__UI.CONST.POPUP._STATE_HIDDEN_TIMER);
		},
		_hidden_popup:function(){
			if(this._is_show_child_control()){
				this._state.clear(__UI.CONST.POPUP._STATE_HIDDEN_TIMER);
				return;
			}
			this._state.clear(__UI.CONST.POPUP._STATE_SHOW|__UI.CONST.POPUP._STATE_HIDDEN_TIMER);
			this._set_popup_position();
			if(this.parent_control && !this.parent_control._state.check(__UI.CONST.POPUP._STATE_MOUSE_OVER)){
				this.parent_control._hidden_popup();
			}
		},
		_get_linked_obj_position:function(){
			var pos = __dom.get_position(this._active_object);
			pos.width = this._active_object.offsetWidth;
			pos.height = this._active_object.offsetHeight;
			return pos
		},
		_set_msgbox_position:function(ev){
			if(!this._state.check(__UI.CONST.POPUP._STATE_SHOW)) return;
			if(!this._popup.wrapper) return;
			if(!this._state.check(__UI.CONST.POPUP._STATE_BODY_SCROLL_EVENT)){
				this._mousedown_body_event_fnc = __dom.add_event_listener(this._window, "scroll", Object.bind_event_listener(window, this, this._set_msgbox_position));
				this._mousedown_body_event_fnc = __dom.add_event_listener(this._window.document.body, "scroll", Object.bind_event_listener(window, this, this._set_msgbox_position));
				this._state.set(__UI.CONST.POPUP._STATE_BODY_SCROLL_EVENT);
			}
			this._layout_msgbox();
			this._popup.wrapper.style.left = this._window.document.body.scrollLeft + "px";
			this._popup.wrapper.style.top = this._window.document.body.scrollTop + "px";
			var left, top;
			left = parseInt((this._window.document.body.clientWidth - this._popup.content.offsetWidth)/2, 10);
			top = parseInt((this._window.document.body.clientHeight - this._popup.content.offsetHeight)/2, 10);
			if(left<0) left = 0;
			if(top<0) top = 0;
			this._popup.content.style.left =  left + "px";
			this._popup.content.style.top = top + "px";
		},
		_set_context_position:function(ev){
			if(!this._popup.wrapper) return;
			this._layout();
			var x = 0, y = 0;
			if(this._window.document.body.clientWidth - ev.clientX > (this._popup.wrapper.offsetWidth + 5)){
				x = ev.clientX;
			}else{
				x = ev.clientX - this._popup.wrapper.offsetWidth;
			}
			if(x < 0) x = 0;
			if(this._window.document.body.clientHeight - ev.clientY > (this._popup.wrapper.offsetHeight + 5)){
				y = ev.clientY;
			}else{
				y = ev.clientY - this._popup.wrapper.offsetHeight;
			}
			if(y < 0) y = 0;
			this._popup.wrapper.style.left = x + "px";
			this._popup.wrapper.style.top = y + "px";
		},
		_set_popup_position:function(){
			if(!this._popup.wrapper) return;
			if(this._state.check(__UI.CONST.POPUP._STATE_SHOW)){
				this._layout();
				var pos = this._get_linked_obj_position();
				var pos_x, pos_y;
				pos_y = pos.y;
				if(this._type.check(__UI.CONST.POPUP._TYPE_DISPLAY_TOP_DOWN)){
					if(this._type.check(__UI.CONST.POPUP._TYPE_ALIGN_RIGHT) 
							|| (this._window.document.body.clientWidth - (pos.x - (this._window.document.body.parentNode.scrollLeft + this._window.document.body.scrollLeft)) - pos.width) < this._popup.wrapper.offsetWidth){
						pos_x = (pos.x + pos.width) - this._popup.wrapper.offsetWidth;
						if(pos_x < 0) pos_x = 0;
					}else{
						pos_x = pos.x;
					}
					if((pos_y - (this._window.document.body.scrollTop + this._window.document.body.scrollTop))  > ((this._window.document.body.clientHeight / 3) * 2)){
						pos_y = pos_y - this._popup.wrapper.offsetHeight;
						if(pos_y < 0) pos_y = 0;
					}else{
						pos_y = pos_y + pos.height;
					}
					this._popup.wrapper.style.left = pos_x + "px";
					this._popup.wrapper.style.top = pos_y + "px";
				}else{
					if((this._window.document.body.clientWidth - (pos.x - (this._window.document.body.parentNode.scrollLeft + this._window.document.body.scrollLeft)) - pos.width) < this._popup.wrapper.offsetWidth){
						pos_x = (pos.x) - this._popup.wrapper.offsetWidth;
						if(pos_x < 0) pos_x = 0;
					}else{
						pos_x = pos.x + pos.width;
					}
					if((pos_y - (this._window.document.body.parentNode.scrollTop + this._window.document.body.scrollTop)) > ((this._window.document.body.clientHeight / 3) * 2)){
						pos_y = pos_y + pos.height - this._popup.wrapper.offsetHeight;
						if(pos_y < 0) pos_y = 0;
					}
					this._popup.wrapper.style.left = pos_x + "px";
					this._popup.wrapper.style.top = pos_y + "px";
				}
			}else{
				this._popup.wrapper.style.left = -2000 + "px";
				this._popup.wrapper.style.top = -2000 + "px";
				this._popup.content.style.width = "1px";
				this._popup.content.style.height = "1px";
				if(this._state.check(__UI.CONST.POPUP._STATE_SHOW)){
					this._popup.wrapper.style.width = "1px";
					this._popup.wrapper.style.height = "1px";
				}	
			}
		},
		_draw_popup:function(){
			this._popup_wrapper = null;
			if(this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER)){
				this._popup.wrapper = this._get_id_obj("id_shared_popup_layer_wrapper" + this._group_id);
			}
			if(this._popup.wrapper == null){
				this._popup.wrapper = this._window.document.createElement("div");
				this._popup.wrapper.className = "cls_popup_wrapper" + (this._cls_suffix?" cls_" + this._cls_name + "_wrapper" + this._cls_suffix:'');
				this._popup.wrapper.style.position = "absolute";
				this._popup.wrapper.style.left = "-2000px";
				this._popup.wrapper.style.margin = "0 0 0 0";
				this._popup.wrapper.style.padding = "0 0 0 0";
				this._popup.wrapper.style.backgroundColor = "transparent";
				this._popup.wrapper.style.overflow = "hidden";
				this._popup.wrapper.zIndex = this._z_index++;
				if(this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER)){
					this._popup.wrapper.id = "id_shared_popup_layer_wrapper" + this._group_id;
				}
				document.body.appendChild(this._popup.wrapper);
				this._popup.wrapper.innerHTML = this._draw_wrapper_html();				
			}
			if(this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER)){				
				this._popup.iframe = this._get_id_obj("id_shared_popup_layer_iframe" + this._group_id);
				this._popup.bgdiv= this._get_id_obj("id_shared_popup_layer_bgdiv" + this._group_id);
				this._popup.content = this._get_id_obj("id_shared_popup_layer_content" + this._group_id);
			}else{
				this._popup.iframe = this._get_obj("id_iframe");
				this._popup.bgdiv= this._get_obj("id_bgdiv");
				this._popup.content = this._get_obj("id_content");
			}
			this._popup.content.innerHTML = this.get_content();
			this._state.set(__UI.CONST.POPUP._STATE_DRAW_COMPLETE);
			this._mousedown_event_fnc = __dom.add_event_listener(this._popup.content, "mousedown", Object.bind_event_listener(window, this, this._popup_mouse_down));
			this._mouseover_event_fnc = __dom.add_event_listener(this._popup.content, "mouseover", Object.bind_event_listener(window, this, this._popup_mouse_over));
			this._mouseout_event_fnc = __dom.add_event_listener(this._popup.content, "mouseout", Object.bind_event_listener(window, this, this._popup_mouse_out));	
			this.popup_draw_complete();
		},
		_draw_wrapper_html:function(){
			var html = '';
			html = '<iframe src="javascript:\'\';" id="' + (this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER)?"id_shared_popup_layer_iframe" + this._group_id:'id_iframe' + this._instance_id) + '" class="cls_popup_iframe' + (this._cls_suffix?' cls_' + this._cls_name + '_iframe' + this._cls_suffix:'') + '" '
			+ ' style="position:absolute;z-index:' + (this._z_index++) + ';background-color:' + 
			(this._type.check(__UI.CONST.POPUP._TYPE_MESSAGEBOX)?
				'white;opacity:0.1;filter:alpha(opacity=10);'
				:'transparent')
			+ '" frameBorder="0" marginWidth="0" marginHeight="0"></iframe>'
			+'<div id="' + (this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER)?"id_shared_popup_layer_bgdiv" + this._group_id:'id_bgdiv' + this._instance_id) + '" class="cls_popup_bgdiv' + (this._cls_suffix?' cls_' + this._cls_name + '_bgdiv' + this._cls_suffix:'') + '"'
				+ ' style="position:absolute;z-index:' + (this._z_index++) + ';background-color:' + 
			(this._type.check(__UI.CONST.POPUP._TYPE_MESSAGEBOX)?
				'white;opacity:0.6;filter:alpha(opacity=60);'
				:'transparent')
			+ '"></div>'
			+'<div id="' + (this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER)?"id_shared_popup_layer_content" + this._group_id:'id_content' + this._instance_id) + '" class="cls_popup_content' + (this._cls_suffix?' cls_' + this._cls_name + '_content' + this._cls_suffix:'') + '"'
				+ ' style="position:relative;margin:0 0 0 0;padding:0 0 0 0;width:1px;height:1px;z-index:' + (this._z_index++) + '"></div>';
			return html;
		},
		_layout:function(){
			var width, height;
			this.layout_content();
			width = this._popup.content.scrollWidth;
			height = this._popup.content.scrollHeight;
			if(width<10) width = 10;
			if(height<10) height = 10;
			this._popup.content.style.width = width + "px";
			this._popup.content.style.height = height + "px";
			this._popup.iframe.style.width = width + "px";
			this._popup.iframe.style.height = height + "px";
			this._popup.bgdiv.style.width = width + "px";
			this._popup.bgdiv.style.height = height + "px";
			this._popup.wrapper.style.width = width + "px";
			this._popup.wrapper.style.height = height + "px";
		},
		_layout_msgbox:function(){
			var width, height;
			this.layout_content();
			width = this._popup.content.scrollWidth;
			height = this._popup.content.scrollHeight;
			if(width<10) width = 10;
			if(height<10) height = 10;
			this._popup.content.style.width = width + "px";
			this._popup.content.style.height = height + "px";
			var back_width = "100%", back_height = "100%";
			back_width = this._window.document.body.clientWidth + 'px';
			back_height = this._window.document.body.clientHeight + 'px';
			this._popup.wrapper.style.width = back_width;
			this._popup.wrapper.style.height = back_height;
			this._popup.iframe.style.width = back_width;
			this._popup.iframe.style.height = back_height;
			this._popup.bgdiv.style.width = back_width;
			this._popup.bgdiv.style.height = back_height;
		},
		_inactive:function(){
			this._clear_delay_show_popup();
			this._clear_delay_hidden_popup();
			this._hidden_popup();
		},
		_remove_event_listener:function(){
			if(this._mousedown_body_event_fnc) __dom.remove_event_listener(this._window.document.body, "mousedown", this._mousedown_body_event_fnc);
			if(this._context_body_event_fnc) __dom.remove_event_listener(this._window.document.body, "contextmenu", this._context_body_event_fnc);
			if(this._mousedown_target_event_fnc && this._active_object) __dom.remove_event_listener(this._active_object, "mousedown", this._mousedown_target_event_fnc);
			if(this._mouseover_target_event_fnc && this._active_object) __dom.remove_event_listener(this._active_object, "mouseover", this._mouseover_target_event_fnc);
			if(this._mouseout_target_event_fnc && this._active_object) __dom.remove_event_listener(this._active_object, "mouseout", this._mouseout_target_event_fnc);
			if(this._mousedown_event_fnc && this._popup.content) __dom.remove_event_listener(this._popup.content, "mousedown", this._mousedown_event_fnc);
			if(this._mouseover_event_fnc && this._popup.content) __dom.remove_event_listener(this._popup.content, "mouseover", this._mouseover_event_fnc);
			if(this._mouseout_event_fnc && this._popup.content) __dom.remove_event_listener(this._popup.content, "mouseout", this._mouseout_event_fnc);
		},
		clear:function(){
			if(this._type.check(__UI.CONST.POPUP._TYPE_SHARED_LAYER)){
				this._remove_event_listener();
				this._inactive();
			}else{
				__dom.remove_node(this._popup.bgdiv, true);
				__dom.remove_node(this._popup.iframe, true);
				__dom.remove_node(this._popup.wrapper, true);				
			}
		}
	};
}
