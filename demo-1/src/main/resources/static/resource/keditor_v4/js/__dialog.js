/**
 * _DIALOG version 1.0
 * Copyrightⓒ 2013 Hyung-goo Yeo All rights reserved.
 */
if(typeof(window.__UI._DIALOG) == "undefined"){
	__UI.NLS.DIALOG = {};
	__UI.CONST.DIALOG = {
		"MODAL" 		: 1 << 0
		,"MOVE_WINDOW" 	: 1 << 1
		,"TITLE"			: 1 << 2
		,"CLOSE"		: 1 << 3
		,"CUSTOMIZE" 		: 1 << 4
		,"USE_ICON"		: 1 << 5
		
		,"INLINE_BLOCK_CLS"	:((/msie|MSIE (5|6|7)/.test(navigator.userAgent))?"cls_inline-block-ie6":"cls_inline-block")
	};
	__UI._DIALOG = {
		_parent:"LAYER"
		,_class_name:"DIALOG"
		,_initialize:function(_window 
				, type
				, dialog_event_adapter
				, class_att_suffix
				, container){
			$super(_window, "dialog", class_att_suffix, container);
			this._set_event_adapter(dialog_event_adapter);
			this._dialog_type = new (__UI.ClassLoader("STATE"))(type);
			this._dialog_panel = null;
			this._title_wrapper = null;
			this._title_icon = null;
			this._title_icon_inner = null;
			this._title = null;
			this._title_close = null;
			this._title_close_inner = null;
			this._content_wrapper = null;
			this._content_icon = null;
			this._content = null;
			this._event_window_move = false;
			this._start_window_move_x = 0;
			this._start_window_move_y = 0;
			this._animation = null;
			this._is_prev_modal_show = false;
			this._enable_delay_hide = false;
			this._delay_hide_millis = 0;
			this._delay_hide_id = null;
			if(this._dialog_type.check(__UI.CONST.DIALOG.TITLE)){
				this._title_wrapper = this._window.document.createElement("DIV");
				this._panel.add_content_element(this._title_wrapper);
				this._title_wrapper.className = "cls_" + this._cls_name + '_title_wrapper' 
					+ (this._cls_suffix?' cls_' + this._cls_name + '_title_wrapper' + this._cls_suffix:'');
				this._title_icon = this._window.document.createElement("DIV");
				this._title_icon.className = "cls_" + this._cls_name + '_title_icon ' 
					+ __UI.CONST.DIALOG.INLINE_BLOCK_CLS
					+ (this._cls_suffix?' cls_' + this._cls_name + '_title_icon' + this._cls_suffix:'');
				this._title = this._window.document.createElement("DIV");
				this._title.className = "cls_" + this._cls_name + '_title ' 
					+ __UI.CONST.DIALOG.INLINE_BLOCK_CLS
					+ (this._cls_suffix?' cls_' + this._cls_name + '_title' + this._cls_suffix:'');
				this._title_wrapper.appendChild(this._title_icon);
				this._title_wrapper.appendChild(this._title);
				if(this._dialog_type.check(__UI.CONST.DIALOG.CLOSE)){
					this._title_close = this._window.document.createElement("DIV");
					this._title_close.className = "cls_" + this._cls_name + '_title_close' 
						+ (this._cls_suffix?' cls_' + this._cls_name + '_title_close' + this._cls_suffix:'');
					this._title_wrapper.appendChild(this._title_close);
					this._title_close_inner = this._window.document.createElement("DIV");
					this._title_close_inner.className = "cls_" + this._cls_name + '_title_close_inner' 
						+ (this._cls_suffix?' cls_' + this._cls_name + '_title_close_inner' + this._cls_suffix:'');
					this._title_close.appendChild(this._title_close_inner);
					__dom.add_event_listener(this._title_close_inner
							, "mouseover"
							, Object.bind_event_listener(this._window, this, this._event_title_close_mouse_over));
					__dom.add_event_listener(this._title_close_inner
							, "mouseout"
							, Object.bind_event_listener(this._window, this, this._event_title_close_mouse_out));
					__dom.add_event_listener(this._title_close_inner
							, "click"
							, Object.bind_event_listener(this._window, this, this._event_dialog_close));
				}
				this._title_icon_inner = this._window.document.createElement("DIV");
				this._title_icon_inner.className = "cls_" + this._cls_name + '_title_icon_inner' 
					+ (this._cls_suffix?' cls_' + this._cls_name + '_title_icon_inner' + this._cls_suffix:'');
				this._title_icon.appendChild(this._title_icon_inner);
				this._dialog_panel = new (__UI.ClassLoader("PANEL"))(this._window, null, this._cls_name + "_content_panel", this._cls_suffix);
				this._panel.add_content_element(this._dialog_panel.get_element());
			}else{
				this._dialog_panel = this._panel;
			}
			
			if(!this._dialog_type.check(__UI.CONST.DIALOG.CUSTOMIZE)){
				this._content_wrapper = this._window.document.createElement("DIV");
				this._content_wrapper.className = "cls_" + this._cls_name + '_content_wrapper' 
					+ (this._cls_suffix?' cls_' + this._cls_name + '_content_wrapper' + this._cls_suffix:'');
				this._dialog_panel.add_content_element(this._content_wrapper);
				if(this._dialog_type.check(__UI.CONST.DIALOG.USE_ICON)){
					this._content_icon = this._window.document.createElement("DIV");
					this._content_icon.className = "cls_" + this._cls_name + '_content_icon ' 
						+ __UI.CONST.DIALOG.INLINE_BLOCK_CLS
						+ (this._cls_suffix?' cls_' + this._cls_name + '_content_icon' + this._cls_suffix:'');
					this._content_wrapper.appendChild(this._content_icon);
				}
				this._content = this._window.document.createElement("DIV");
				this._content.className = "cls_" + this._cls_name + '_content ' 
					+ __UI.CONST.DIALOG.INLINE_BLOCK_CLS
					+ (this._cls_suffix?' cls_' + this._cls_name + '_content' + this._cls_suffix:'');
				this._content_wrapper.appendChild(this._content);
			}
			
			if(this._dialog_type.check(__UI.CONST.DIALOG.MOVE_WINDOW)){
				var move_element = null;
				if(this._dialog_type.check(__UI.CONST.DIALOG.TITLE)){
					move_element = this._title_wrapper;
				}else{
					move_element = this._dialog_panel.get_element();
				}
				move_element.onselectstart = function(){return false;};
				__dom.add_event_listener(move_element
						, "mousedown"
						, Object.bind_event_listener(this._window, this, this._event_move_mouse_down));
				__dom.add_event_listener(this.get_element() //move_element
						, "mousemove"
						, Object.bind_event_listener(this._window, this, this._event_move_mouse_move));
				__dom.add_event_listener(this.get_element()
						, "mouseup"
						, Object.bind_event_listener(this._window, this, this._event_move_mouse_up));
			}
			__dom.add_event_listener(this._panel.get_element()
					, "mouseover"
					, Object.bind_event_listener(this._window, this, this._event_panel_mouse_over));
			__dom.add_event_listener(this._panel.get_element()
					, "mouseout"
					, Object.bind_event_listener(this._window, this, this._event_panel_mouse_out));
		}
		,get_type:function(){
			this._dialog_type.get();
		}
		,_event_title_close_mouse_over:function(e){
			__dom.add_class(this._title_close_inner, "cls_" + this._cls_name + '_title_close_inner-mouseOver');
		}
		,_event_title_close_mouse_out:function(e){
			__dom.remove_class(this._title_close_inner, "cls_" + this._cls_name + '_title_close_inner-mouseOver');
		}
		,_event_dialog_close:function(e){
			this.dialog_close();
		}
		,_event_move_mouse_down:function(e){
			if(this._event_window_move) return;
			this._event_window_move = true;
			this._start_window_move = {"x":e.clientX, "y":e.clientY,
					"cur_x":e.clientX, "cur_y":e.clientY};
			this._move_delay = 0.55;
			var top, left, right, bottom;
			if(!this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				this.get_element().style.width = "100%";
				this.get_element().style.height = "100%";
				switch(this._show_type){
				case __UI.CONST.LAYER._TOP_LEFT:
					top = this._parse_int(this.get_element().style.top);
					left = this._parse_int(this.get_element().style.left);
					this.get_element().style.top = "0px";
					this.get_element().style.left = "0px";
					this._panel_wrapper.style.top = top + "px";
					this._panel_wrapper.style.left = left + "px";
					break;
				case __UI.CONST.LAYER._TOP_RIGHT:
					top = this._parse_int(this.get_element().style.top);
					right = this._parse_int(this.get_element().style.right);
					this.get_element().style.top = "0px";
					this.get_element().style.right = "0px";
					this._panel_wrapper.style.top = top + "px";
					this._panel_wrapper.style.right = right + "px";
					break;
				case __UI.CONST.LAYER._BOTTOM_LEFT:
					bottom = this._parse_int(this.get_element().style.bottom);
					left = this._parse_int(this.get_element().style.left);
					this.get_element().style.bottom = "0px";
					this.get_element().style.left = "0px";
					this._panel_wrapper.style.bottom = bottom + "px";
					this._panel_wrapper.style.left = left + "px";
					break;
				case __UI.CONST.LAYER._BOTTOM_RIGHT:
					bottom = this._parse_int(this.get_element().style.bottom);
					right = this._parse_int(this.get_element().style.right);
					this.get_element().style.bottom = "0px";
					this.get_element().style.right = "0px";
					this._panel_wrapper.style.bottom = bottom + "px";
					this._panel_wrapper.style.right = right + "px";
					break;
				}
			}
			var interval_func = null;
			switch(this._show_type){
			case __UI.CONST.LAYER._TOP_LEFT:				
				this._start_window_move.top = this._parse_int(this._panel_wrapper.style.top);
				this._start_window_move.left = this._parse_int(this._panel_wrapper.style.left);				
				this._start_window_move.cur_top = this._start_window_move.top;
				this._start_window_move.cur_left = this._start_window_move.left;
				if(!window["dialog_move_top_left" + this._instance_id]) 
					window["dialog_move_top_left" + this._instance_id] = Object.bind(this._window
							, this, this._move_interval_top_left);
				interval_func = window["dialog_move_top_left" + this._instance_id];
				break;
			case __UI.CONST.LAYER._TOP_RIGHT:
				this._start_window_move.top = this._parse_int(this._panel_wrapper.style.top);
				this._start_window_move.right = this._parse_int(this._panel_wrapper.style.right);
				this._start_window_move.cur_top = this._start_window_move.top;
				this._start_window_move.cur_right = this._start_window_move.right;
				if(!window["dialog_move_top_right" + this._instance_id]) 
					window["dialog_move_top_right" + this._instance_id] = Object.bind(this._window
							, this, this._move_interval_top_right);
				interval_func = window["dialog_move_top_right" + this._instance_id];
				break;
			case __UI.CONST.LAYER._BOTTOM_LEFT:
				this._start_window_move.bottom = this._parse_int(this._panel_wrapper.style.bottom);
				this._start_window_move.left = this._parse_int(this._panel_wrapper.style.left);
				this._start_window_move.cur_bottom = this._start_window_move.bottom;
				this._start_window_move.cur_left = this._start_window_move.left;
				if(!window["dialog_move_bottom_left" + this._instance_id]) 
					window["dialog_move_bottom_left" + this._instance_id] = Object.bind(this._window
							, this, this._move_interval_bottom_left);
				interval_func = window["dialog_move_bottom_left" + this._instance_id];
				break;
			case __UI.CONST.LAYER._BOTTOM_RIGHT:
				this._start_window_move.bottom = this._parse_int(this._panel_wrapper.style.bottom);
				this._start_window_move.right = this._parse_int(this._panel_wrapper.style.right);
				this._start_window_move.cur_bottom = this._start_window_move.bottom;
				this._start_window_move.cur_right = this._start_window_move.right;
				if(!window["dialog_move_bottom_right" + this._instance_id]) 
					window["dialog_move_bottom_right" + this._instance_id] = Object.bind(this._window
							, this, this._move_interval_bottom_right);
				interval_func = window["dialog_move_bottom_right" + this._instance_id];
				break;
			}
			if(this._event_move_interval_id) window.clearInterval(this._event_move_interval_id);
			this._event_move_interval_id = window.setInterval(interval_func, 30);
		}
		,_move_interval_top_left:function(){
			var moveX, moveY;
			moveX = this._start_window_move.cur_x - this._start_window_move.x;
			this._start_window_move.x = this._start_window_move.cur_x;
			moveY = this._start_window_move.cur_y - this._start_window_move.y;
			this._start_window_move.y = this._start_window_move.cur_y;
			this._start_window_move.top += moveY;
			this._start_window_move.left += moveX;
			this._start_window_move.cur_top += Math.round((this._start_window_move.top - this._start_window_move.cur_top) * this._move_delay);
			this._start_window_move.cur_left += Math.round((this._start_window_move.left - this._start_window_move.cur_left) * this._move_delay);
			if(this._start_window_move.cur_top < 0) this._start_window_move.cur_top = 0;
			this._panel_wrapper.style.top = this._start_window_move.cur_top + "px";
			this._panel_wrapper.style.left = this._start_window_move.cur_left + "px";
		}
		,_move_interval_top_right:function(){
			var moveX, moveY;
			moveX = this._start_window_move.cur_x - this._start_window_move.x;
			this._start_window_move.x = this._start_window_move.cur_x;
			moveY = this._start_window_move.cur_y - this._start_window_move.y;
			this._start_window_move.y = this._start_window_move.cur_y;
			this._start_window_move.top += moveY;
			this._start_window_move.right -= moveX;
			this._start_window_move.cur_top += Math.round((this._start_window_move.top - this._start_window_move.cur_top) * this._move_delay);
			this._start_window_move.cur_right += Math.round((this._start_window_move.right - this._start_window_move.cur_right) * this._move_delay);
			this._panel_wrapper.style.top = this._start_window_move.cur_top + "px";
			this._panel_wrapper.style.right = this._start_window_move.cur_right + "px";
		}
		,_move_interval_bottom_left:function(){
			var moveX, moveY;
			moveX = this._start_window_move.cur_x - this._start_window_move.x;
			this._start_window_move.x = this._start_window_move.cur_x;
			moveY = this._start_window_move.cur_y - this._start_window_move.y;
			this._start_window_move.y = this._start_window_move.cur_y;
			this._start_window_move.bottom -= moveY;
			this._start_window_move.left += moveX;
			this._start_window_move.cur_bottom += Math.round((this._start_window_move.bottom - this._start_window_move.cur_bottom) * this._move_delay);
			this._start_window_move.cur_left += Math.round((this._start_window_move.left - this._start_window_move.cur_left) * this._move_delay);
			this._panel_wrapper.style.bottom = this._start_window_move.cur_bottom + "px";
			this._panel_wrapper.style.left = this._start_window_move.cur_left + "px";
		}
		,_move_interval_bottom_right:function(){
			var moveX, moveY;
			moveX = this._start_window_move.cur_x - this._start_window_move.x;
			this._start_window_move.x = this._start_window_move.cur_x;
			moveY = this._start_window_move.cur_y - this._start_window_move.y;
			this._start_window_move.y = this._start_window_move.cur_y;
			this._start_window_move.bottom -= moveY;
			this._start_window_move.right -= moveX;
			this._start_window_move.cur_bottom += Math.round((this._start_window_move.bottom - this._start_window_move.cur_bottom) * this._move_delay);
			this._start_window_move.cur_right += Math.round((this._start_window_move.right - this._start_window_move.cur_right) * this._move_delay);
			this._panel_wrapper.style.bottom = this._start_window_move.cur_bottom + "px";
			this._panel_wrapper.style.right = this._start_window_move.cur_right + "px";
		}
		,_event_move_mouse_move:function(e){
			if(!this._event_window_move){
				if(this._event_move_interval_id) window.clearInterval(this._event_move_interval_id);
				return;
			}
			if(__dom.event.button(e) != "left" && __dom.event.button(e) != "right"){	
				this._event_move_mouse_up(e);
				return;				
			}
			this._start_window_move.cur_x = e.clientX;
			this._start_window_move.cur_y = e.clientY;
		}
		,_event_move_mouse_up:function(e){
			if(!this._event_window_move) return;
			this._event_window_move = false;
			if(this._event_move_interval_id) window.clearInterval(this._event_move_interval_id);
			var top, left, right, bottom;
			if(!this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				switch(this._show_type){
				case __UI.CONST.LAYER._TOP_LEFT:
					top = this._parse_int(this._panel_wrapper.style.top);
					left = this._parse_int(this._panel_wrapper.style.left);
					this.get_element().style.top = top + "px";
					this.get_element().style.left = left + "px";
					this._panel_wrapper.style.top = "";
					this._panel_wrapper.style.left = "";
					break;
				case __UI.CONST.LAYER._TOP_RIGHT:
					top = this._parse_int(this._panel_wrapper.style.top);
					right = this._parse_int(this._panel_wrapper.style.right);
					this.get_element().style.top = top + "px";
					this.get_element().style.right = right + "px";
					this._panel_wrapper.style.top = "";
					this._panel_wrapper.style.right = "";
					break;
				case __UI.CONST.LAYER._BOTTOM_LEFT:
					bottom = this._parse_int(this._panel_wrapper.style.bottom);
					left = this._parse_int(this._panel_wrapper.style.left);
					this.get_element().style.bottom = bottom + "px";
					this.get_element().style.left = left + "px";
					this._panel_wrapper.style.bottom = "";
					this._panel_wrapper.style.left = "";
					break;
				case __UI.CONST.LAYER._BOTTOM_RIGHT:
					bottom = this._parse_int(this._panel_wrapper.style.bottom);
					right = this._parse_int(this._panel_wrapper.style.right);
					this.get_element().style.bottom = bottom + "px";
					this.get_element().style.right = right + "px";
					this._panel_wrapper.style.bottom = "";
					this._panel_wrapper.style.right = "";
					break;
				}
				this.layout();
			}
		}
		,_event_panel_mouse_over:function(e){
			if(this._enable_delay_hide && this._delay_hide_id){
				this._window.clearTimeout(this._delay_hide_id);
				this._delay_hide_id = null;
			}
		}
		,_event_panel_mouse_out:function(e){
			if(this._enable_delay_hide 
					&& this._delay_hide_id == null){
				this.dialog_delay_close(this._delay_hide_millis);
			}
		}
		,set_title:function(html){
			if(this._title){
				this._title.innerHTML = html;
				this.layout();
			}
		}
		,get_dialog_panel:function(){
			return this._dialog_panel;
		}
		,get_type:function(){
			return this._dialog_type;
		}
		,dialog_close:function(use_animation){
			use_animation = (use_animation==null?true:use_animation);
			if(this.get_event_adapter() != null){
				if(this.get_event_adapter().close()){
					if(use_animation){
						this.hide(true);
					}else{
						this._hide(false);
					}
				}
			}else{
				if(use_animation){
					this.hide(true);
				}else{
					this._hide(false);
				}
			}
		}
		,dialog_delay_close:function(millis, use_animation){
			this._enable_delay_hide = true;
			this._delay_hide_millis = millis;
			this._delay_hide_id = this._window.setTimeout(
					Object.bind(this._window, this, this.dialog_close, use_animation)
					, this._delay_hide_millis);
		}
		,set_animation:function(Kp, Ki, Kd, Kdt, err_offset){
			Kp = (Kp == null?0.2:Kp);
			Ki = (Ki == null?0:Ki);
			Kd = (Kd == null?0:Kd);
			Kdt = (Kdt == null?1:Kdt);
			this._animation = new (__UI.ClassLoader("ANIMATION"))(Kp, Ki, Kd, Kdt, err_offset);
		}
		,get_animation:function(){
			return this._animation;
		}
		,set_html:function(html){
			if(this._dialog_type.check(__UI.CONST.DIALOG.CUSTOMIZE)){
				this._dialog_panel.set_html(html);
			}else{
				this._content.innerHTML = html;
			}
		}
		,set_element:function(dom_obj){
			if(this._dialog_type.check(__UI.CONST.DIALOG.CUSTOMIZE)){
				this._dialog_panel.add_content_element(dom_obj);
			}else{
				this._content.appendChild(dom_obj);
			}
		}
		,get_icon_element:function(){
			return this._content_icon;
		}
		,set_icon_style:function(style_name, add){
			if(this._content_icon == null) return;
			if(!style_name) return;
			if(add){
				if(this._content_icon_custom_style){
					__dom.remove_class(this._content_icon, this._content_icon_custom_style);
				}
				__dom.add_class(this._content_icon, style_name);
				this._content_icon_custom_style = style_name;
			}else{
				__dom.remove_class(this._content_icon, style_name);
			}
		}
		,show_center:function(e, x, y){
			this._prev_position_set();
			this._layer_state = __UI.CONST.LAYER._SHOW;
			this.layout();
			this._show_type = __UI.CONST.LAYER._TOP_LEFT;
			
			var width = this._parse_int(this._panel_wrapper.style.width);
			var height = this._parse_int(this._panel_wrapper.style.height);
			
			var clientXOffset = this._container.scrollLeft;
			var clientYOffset = this._container.scrollTop;
			var clientWidth = this._window.document.body.clientWidth;
			var clientHeight = this._window.document.body.clientHeight;
			var position_x = this._parse_int((clientWidth - width) / 2);// + clientXOffset;
			var position_y = this._parse_int((clientHeight - height) / 2);// + clientYOffset;
			if(x != null) position_x = x;
			if(y != null) position_y = y;
			this._set_position(e, position_y + "px", "", "", position_x + "px");
		}
		,_set_show_animation:function(
				s_top, s_right, s_bottom, s_left
				,top, right, bottom, left
				){
			var pp = this._prev_position;
			callback = null;
			var menu_w, menu_h, pw_w, pw_h, shadow_w, shadow_h, panel_w, panel_h;
			if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				if(pp.isShow){
					this._set_element_position(this.get_element()
							, (top!=""?pp.layer_top:"")
							, (right!=""?pp.layer_right:"")
							, (bottom!=""?pp.layer_bottom:"")
							, (left!=""?pp.layer_left:""));
					this._set_element_position(this._panel_wrapper
							, (top!=""?pp.wrapper_top:"")
							, (right!=""?pp.wrapper_right:"")
							, (bottom!=""?pp.wrapper_bottom:"")
							, (left!=""?pp.wrapper_left:""));
				}else{
					this._set_element_position(this.get_element()
							, s_top, s_right, s_bottom, s_left);
					this._set_element_position(this._panel_wrapper
							, (s_top!=""?"0px":s_top)
							, (s_right!=""?"0px":s_right)
							, (s_bottom!=""?"0px":s_bottom)
							, (s_left!=""?"0px":s_left));
				}
				menu_w = this.get_element().offsetWidth;
				menu_h = this.get_element().offsetHeight;
			}else{
				if(pp.isShow){
					this._set_element_position(this.get_element()
							, (top!=""?pp.layer_top:"")
							, (right!=""?pp.layer_right:"")
							, (bottom!=""?pp.layer_bottom:"")
							, (left!=""?pp.layer_left:""));
					this._set_element_position(this._panel_wrapper
							, (top!=""?pp.wrapper_top:"")
							, (right!=""?pp.wrapper_right:"")
							, (bottom!=""?pp.wrapper_bottom:"")
							, (left!=""?pp.wrapper_left:""));
				}else{
					this._set_element_position(this.get_element(), s_top, s_right, s_bottom, s_left);
				}
				menu_w = parseInt(this.get_element().style.width, 10);
				menu_h = parseInt(this.get_element().style.height, 10);
			}
			
			pw_w = parseInt(this._panel_wrapper.style.width, 10);
			pw_h = parseInt(this._panel_wrapper.style.height, 10);
			shadow_w = parseInt(this._shadow_panel.style.width, 10);
			shadow_h = parseInt(this._shadow_panel.style.height, 10);
			panel_w = parseInt(this._panel.get_element().style.width, 10);
			panel_h = parseInt(this._panel.get_element().style.height, 10);
			
			if(pp.isShow){
				this.get_element().style.width = pp.layer_width + "px";
				this.get_element().style.height = pp.layer_height + "px";
				this._panel_wrapper.style.width = pp.wrapper_width + "px";
				this._panel_wrapper.style.height = pp.wrapper_height + "px";
				this._shadow_panel.style.width = pp.shadow_width + "px";
				this._shadow_panel.style.height = pp.shadow_height + "px";
				this._panel.get_element().style.width = pp.panel_width + "px";
				this._panel.get_element().style.height = pp.panel_height + "px";
			}else{
				this.get_element().style.width = "0px";
				this.get_element().style.height = "0px";
				this._panel_wrapper.style.width = "0px";
				this._panel_wrapper.style.height = "0px";
				this._shadow_panel.style.width = "0px";
				this._shadow_panel.style.height = "0px";
				this._panel.get_element().style.width = "0px";
				this._panel.get_element().style.height = "0px";
			}
			
			if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				if(!(pp.isShow && this._is_prev_modal_show)){
					if(top != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.TOP, 0);
					if(right != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.RIGHT, 0);
					if(bottom != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.BOTTOM, 0);
					if(left != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.LEFT, 0);
				}
				if(top != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.TOP, this._parse_int(top));
				if(right != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.RIGHT, this._parse_int(right));
				if(bottom != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.BOTTOM, this._parse_int(bottom));
				if(left != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.LEFT, this._parse_int(left));
			}else{
				if(top != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.TOP, this._parse_int(top));
				if(right != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.RIGHT, this._parse_int(right));
				if(bottom != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.BOTTOM, this._parse_int(bottom));
				if(left != "") this._animation.add(this.get_element(), __UI.CONST.ANIMATION.LEFT, this._parse_int(left));
				if((pp.isShow && this._is_prev_modal_show)){
					if(top != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.TOP, 0);
					if(right != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.RIGHT, 0);
					if(bottom != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.BOTTOM, 0);
					if(left != "") this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.LEFT, 0);
				}
			}
			this._animation.add(this.get_element(), __UI.CONST.ANIMATION.WIDTH, menu_w);
			this._animation.add(this.get_element(), __UI.CONST.ANIMATION.HEIGHT, menu_h);
			this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.WIDTH, pw_w);
			this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.HEIGHT, pw_h);
			this._animation.add(this._shadow_panel, __UI.CONST.ANIMATION.WIDTH, shadow_w);
			this._animation.add(this._shadow_panel, __UI.CONST.ANIMATION.HEIGHT, shadow_h);
			this._animation.add(this._panel.get_element(), __UI.CONST.ANIMATION.WIDTH, panel_w);
			this._animation.add(this._panel.get_element(), __UI.CONST.ANIMATION.HEIGHT, panel_h);
			
			callback = Object.bind(this._window, this, this._animation_end, menu_w, menu_h, pw_w, pw_h, shadow_w, shadow_h, panel_w, panel_h, top, right, bottom, left);
			
			return callback;
		}
		,_animation_end:function(
				menu_w, menu_h, pw_w, pw_h, shadow_w, shadow_h, panel_w, panel_h
				, top, right, bottom, left){
			if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				this.get_element().style.width = "100%";
				this.get_element().style.height = "100%";
			}else{
				this.get_element().style.width = menu_w + "px";
				this.get_element().style.height = menu_h + "px";
			}
			this._panel_wrapper.style.width = pw_w + "px";
			this._panel_wrapper.style.height = pw_h + "px";
			this._shadow_panel.style.width = shadow_w + "px";
			this._shadow_panel.style.height = shadow_h + "px";
			this._panel.get_element().style.width = panel_w + "px";
			this._panel.get_element().style.height = panel_h + "px";
			this._set_fixed_position(top, right, bottom, left);
		}
		,hide:function(set_layout){
			this._clear_delay_hide();
			if(this._animation != null && this.is_show()){
				var callback = this._set_hide_animation(set_layout);
				this._animation.start(callback);
			}else{
				this._hide(set_layout);
			}
		}
		,_hide:function(set_layout){
			this._clear_delay_hide();
			if(set_layout == null) set_layout = false;
			this._layer_state = __UI.CONST.LAYER._HIDE;
			if(set_layout) this.layout();
			if(this._dialog_type != null && this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				this._panel_wrapper.style.left = "";
				this._panel_wrapper.style.top = "";
				this._panel_wrapper.style.right = "";
				this._panel_wrapper.style.bottom = "";
			}
			this._element.style.left = "-7000px";
			this._element.style.top = "-7000px";
			this._element.style.right = "";
			this._element.style.bottom = "";
			this._element.style.width = "1px";
			this._element.style.height = "1px";
		}
		,_clear_delay_hide:function(){
			this._enable_delay_hide = false;
			if(this._delay_hide_id){
				this._window.clearTimeout(this._delay_hide_id);
				this._delay_hide_id = null;
				this._delay_hide_millis = null;
			}
		}
		,_set_hide_animation:function(set_layout){
			callback = null;
			var menu_w, menu_h, width, height;
			if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				menu_w = this.get_element().offsetWidth;
				menu_h = this.get_element().offsetHeight;
			}else{
				menu_w = parseInt(this.get_element().style.width, 10);
				menu_h = parseInt(this.get_element().style.height, 10);
			}
			
			this.get_element().style.width = menu_w + "px";
			this.get_element().style.height = menu_h + "px";
			
			width = this._parse_int(this._panel_wrapper.style.width);
			height = this._parse_int(this._panel_wrapper.style.height);
			
			var top, right, bottom, left;
			
			switch(this._show_type){
			case __UI.CONST.LAYER._TOP_LEFT:
				if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
					top = this._parse_int(this._panel_wrapper.style.top);
					left = this._parse_int(this._panel_wrapper.style.left);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.TOP, this._parse_int(top + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.LEFT, this._parse_int(left + (width / 2)));
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.TOP, 0);
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.LEFT, 0);
				}else{
					top = this._parse_int(this.get_element().style.top);
					left = this._parse_int(this.get_element().style.left);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.TOP, this._parse_int(top + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.LEFT, this._parse_int(left + (width / 2)));
				}
				break;
			case __UI.CONST.LAYER._TOP_RIGHT:
				if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
					top = this._parse_int(this._panel_wrapper.style.top);
					right = this._parse_int(this._panel_wrapper.style.right);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.TOP, this._parse_int(top + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.RIGHT, this._parse_int(right + (width / 2)));
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.TOP, 0);
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.RIGHT, 0);
				}else{
					top = this._parse_int(this.get_element().style.top);
					right = this._parse_int(this.get_element().style.right);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.TOP, this._parse_int(top + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.RIGHT, this._parse_int(right + (width / 2)));
				}
				break;
			case __UI.CONST.LAYER._BOTTOM_LEFT:
				if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
					bottom = this._parse_int(this._panel_wrapper.style.bottom);
					left = this._parse_int(this._panel_wrapper.style.left);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.BOTTOM, this._parse_int(bottom + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.LEFT, this._parse_int(left + (width / 2)));
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.BOTTOM, 0);
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.LEFT, 0);
				}else{
					bottom = this._parse_int(this.get_element().style.bottom);
					left = this._parse_int(this.get_element().style.left);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.BOTTOM, this._parse_int(bottom + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.LEFT, this._parse_int(left + (width / 2)));
				}
				break;
			case __UI.CONST.LAYER._BOTTOM_RIGHT:
				if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
					bottom = this._parse_int(this._panel_wrapper.style.bottom);
					right = this._parse_int(this._panel_wrapper.style.right);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.BOTTOM, this._parse_int(bottom + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.RIGHT, this._parse_int(right + (width / 2)));
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.BOTTOM, 0);
					this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.RIGHT, 0);
				}else{
					bottom = this._parse_int(this.get_element().style.bottom);
					right = this._parse_int(this.get_element().style.right);
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.BOTTOM, this._parse_int(bottom + (height / 2)));
					this._animation.add(this.get_element(), __UI.CONST.ANIMATION.RIGHT, this._parse_int(right + (width / 2)));
				}
				break;
			}
			
			this._animation.add(this.get_element(), __UI.CONST.ANIMATION.WIDTH, 1);
			this._animation.add(this.get_element(), __UI.CONST.ANIMATION.HEIGHT, 1);
			this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.WIDTH, 1);
			this._animation.add(this._panel_wrapper, __UI.CONST.ANIMATION.HEIGHT, 1);
			this._animation.add(this._shadow_panel, __UI.CONST.ANIMATION.WIDTH, 1);
			this._animation.add(this._shadow_panel, __UI.CONST.ANIMATION.HEIGHT, 1);
			this._animation.add(this._panel.get_element(), __UI.CONST.ANIMATION.WIDTH, 1);
			this._animation.add(this._panel.get_element(), __UI.CONST.ANIMATION.HEIGHT, 1);
			
			callback = Object.bind(this._window, this, this._hide, set_layout);
			
			return callback;
		}
		,_set_position:function(e, top, right, bottom, left){
			if(this._animation != null){
				var clientXOffset = this._container.scrollLeft;
				var clientYOffset = this._container.scrollTop;
				var clientWidth = this._window.document.body.clientWidth;
				var clientHeight = this._window.document.body.clientHeight;
				
				var callback = this._set_show_animation(
						(top==""||top==null?"":(e!=null?e.clientY + "px":(this._parse_int((clientHeight) / 2) + clientYOffset) + "px"))
						, (right==""||right==null?"":(e!=null?(clientWidth - e.clientX) + "px":(this._parse_int((clientWidth) / 2) + clientXOffset) + "px"))
						, (bottom==""||bottom==null?"":(e!=null?(clientHeight - e.clientY) + "px":(this._parse_int((clientHeight) / 2) + clientYOffset) + "px"))
						, (left==""||left==null?"":(e!=null?e.clientX + "px":(this._parse_int((clientWidth) / 2) + clientXOffset) + "px"))
						, top
						, right
						, bottom
						, left
						);
				this._animation.start(callback);
			}else{
				this._set_fixed_position(top, right, bottom, left);
			}
		}
		,_set_fixed_position:function(top, right, bottom, left){
			if(this._dialog_type != null && this._dialog_type.check(__UI.CONST.DIALOG.MODAL)){
				this._set_element_position(this._element
						, (top!=""?"0px":"")
						, (right!=""?"0px":"")
						, (bottom!=""?"0px":"")
						, (left!=""?"0px":""));
				this._set_element_position(this._panel_wrapper, top, right, bottom, left);
				this._is_prev_modal_show = true;
			}else{
				this._set_element_position(this._element, top, right, bottom, left);
				this._set_element_position(this._panel_wrapper, "", "", "", "");
				this._is_prev_modal_show = false;
			}
		}
		,_set_element_position:function(element, top, right, bottom, left){
			element.style.left = left;
			element.style.top = top;
			element.style.right = right;
			element.style.bottom = bottom;
		}
		,_prev_position_set:function(){
			if(this.is_show()){
				if(this._animation){
					this._animation.stop();
					this._animation.clear();
				}
				this._clear_delay_hide();
			}
			$super();
		}
		,set_modal:function(is_modal){
			if(is_modal){
				this._dialog_type.set(__UI.CONST.DIALOG.MODAL);
			}else{
				this._dialog_type.clear(__UI.CONST.DIALOG.MODAL);
			}
		}
		,layout:function(){
			var title_wrapper = null;
			var panel_obj = null;
			try{
				if(this._dialog_type.check(__UI.CONST.DIALOG.TITLE)){
					var max_width = this._container.offsetWidth - 30;
					var max_height = this._container.offsetHeight - 30;
					var heightOffset = 0;
					title_wrapper = this._title_wrapper;
					title_wrapper.style.width = "1px";
					var width = title_wrapper.scrollWidth
						+ (this._title_close != null?this._title_close.offsetWidth:0);
					
					panel_obj = this._dialog_panel.get_element();
					var panel_inner_obj = this._dialog_panel.get_content_container();
					panel_inner_obj.style.overflowX = '';
					panel_inner_obj.style.overflowY = '';
					
					panel_obj.style.width = "1px";
					panel_obj.style.height = "1px";
					
					panel_inner_obj.style.width = "100%";
					panel_inner_obj.style.height = "100%";
					panel_inner_obj.style.position = "relative";
					
					if(width < panel_obj.scrollWidth){
						width = panel_obj.scrollWidth;
					}
					
					var height = panel_obj.scrollHeight + heightOffset;
					
					if(width > max_width){
						width = max_width;
						panel_inner_obj.style.overflowX = "auto";
						heightOffset = 20;
					}else{
						panel_inner_obj.style.overflowX = "";
					}
					
					title_wrapper.style.width = width + "px";
					panel_obj.style.width = width + "px";
					
					
					if(title_wrapper.offsetHeight + height > max_height){
						height = max_height - title_wrapper.offsetHeight;
						panel_inner_obj.style.overflowX = "auto";
						panel_inner_obj.style.overflowY = "auto";
					}else{
						if(heightOffset == 0) panel_inner_obj.style.overflowX = "";
						panel_inner_obj.style.overflowY = "";
					}
					panel_obj.style.height = height + "px";
				}
				$super();
				if(this._dialog_type.check(__UI.CONST.DIALOG.TITLE)){
//					title_wrapper.style.width = "100%";
					panel_obj.style.width = "100%";
				}
			}catch(e){
				try{if(__UI.is_debug) throw e;}catch(ei){}
			}
		}
		,_layout_background_element:function(width, height){
			if(this._dialog_type.check(__UI.CONST.DIALOG.MODAL) && this.is_show()){
				this._element.style.width = "100%";
				this._element.style.height = "100%";
			}else{
				this._element.style.width = width + "px";
				this._element.style.height = height + "px";
			}
			this._panel_wrapper.style.width = width + "px";
			this._panel_wrapper.style.height = height + "px";
			
			this._bg_iframe.style.width = 
				this._bg_panel.style.width = "100%";
			this._bg_iframe.style.height = 
				this._bg_panel.style.height = "100%";
		}
	};
	__UI._DIALOG_EVENT_ADAPTER = {
		_parent:"EVENT_ADAPTER",
		_class_name:"DIALOG_EVENT_ADAPTER",
		close:function(){return true;}
	};
}
