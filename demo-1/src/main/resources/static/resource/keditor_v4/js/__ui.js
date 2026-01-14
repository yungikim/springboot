/**
 * __UI version 1.5
 * Copyrightⓒ 2009 - 2011 Hyung-goo Yeo All rights reserved.
 */
if(typeof(window.__UI) == "undefined"){
	window.__UI = {
		is_debug:false,	
		_instance_hash:{},
		_instance_count:0,
		_debug_dom:null,
		_unique_num:0,
		_set_instance:function(instance){
			var id = "_UI_INSTANCE_" + (__UI._instance_count++);
			__UI._instance_hash[id] = instance;
			instance._instance_id = id;
		},
		get_instance:function(id){
			return __UI._instance_hash[id];
		},
		remove_instance:function(id){
			try{delete __UI._instance_hash[id];}catch(e){}
		},
		set_debug_element:function(obj){
			__UI._debug_dom = obj;
		},
		create_uid:function(){
			return (((new Date()).getTime()).toString(16).toUpperCase()).fixed_length(15, "0", true) + ((++__UI._unique_num).zero_prefix(5));
		},
		_void:function(){}
	};
	__UI.CONST = {};
	__UI.NLS = {};
	__UI.STATIC = {};
	__UI._Merge = function(source){
		var _ui = this;
		function extend(object, source){
			var func_name = null;			
			for(var property in source){
				if(property == "_class_name") continue;
				if(object[property] != null && source[property].toString().indexOf("$super") != -1){
					func_name = object._class_name + property;
					object[func_name] = object[property];
					eval("object[property] =" + source[property].toString().replace(/\$super\s*\(/g, "this." + func_name + "("));
				}else{
					object[property] = source[property];
				}
			}
			if(source._class_name != null) object._class_name = source._class_name;
			return object;
		}
		function merge_method(func, src){
			if(src._parent != null){
				func = merge_method(func, _ui["_" + src._parent]);
			}
			extend(func.prototype, src);
			return func;
		}
		var tmp_func = function(){
			this._initialize.apply(this, arguments);
		};
		tmp_func = merge_method(tmp_func, source);
		return tmp_func;
	};
	__UI.ClassLoader = function(component_name){
		if(this["_$" + component_name]==null){
			this["_$" + component_name] = this._Merge(this["_" + component_name]);
		}
		return this["_$" + component_name];
	};
	__UI._STATE = { // 나중에 바꾸자. add, remove, set, clear
		_parent:null,
		_class_name:"STATE",
		_initialize:function(state){
			this._state = (state!=null?state:0);
		},
		set:function(state){
			this._state |= state;
		},
		get:function(){
			return this._state;
		},
		clear:function(state){
			this._state &= ~state;
		},
		check:function(state){
			return (this._state & state) != 0;
		},
		equals:function(state){
			return (this._state & state) == state;
		}
	};
	__UI._UI = {
		_parent:null,
		_class_name:"UI",
		_window:null,
		_instance_id:null,
		_data_provider:null,
		_event_adapter:null,
		_state:null,
		_initialize:function(data_provider, event_adapter, target_window){
			this._state = new (__UI.ClassLoader("STATE"))();
			
			this._event_adapter = event_adapter;
			this._window = (target_window?target_window:window);
			if(__browser.is_ie){
				var version = __browser.version;
				if(version.indexOf(".") != -1) version = version.left(".");
				/* IE8 호환성보기 Meta로 <meta http-equiv="X-UA-Compatible" content="IE=edge"> 사용한 경우 */
				if(this._window.navigator.userAgent.search(/Trident\/4/i) != -1){
					version = document.documentMode;
				}
				__dom.add_class(this._window.document.body, "ie" + version);
			}
			__UI._set_instance(this);
			if(data_provider) this._set_data_provider(data_provider);
			if(event_adapter) this._set_event_adapter(event_adapter);
		},
		update_ui:function(type, data){},
		_get_id_obj:function(id){
			return this._window.document.getElementById(id);
		},
		_get_obj:function(id){
			return this._window.document.getElementById(id + this._instance_id);
		},
		_set_data_provider:function(data_provider){
			this._data_provider = data_provider;
			if(this._data_provider) this._data_provider._connect_ui_instance(this);
		},
		_set_event_adapter:function(event_adapter){
			this._event_adapter = event_adapter;
			if(this._event_adapter) this._event_adapter._connect_ui_instance(this);
		},
		_get_event_target_by_tagname:function(e, tagnames/* Array or String*/){
			var obj = __dom.event.src_element(e);
			tagnames = "|" + (tagnames instanceof Array?tagnames.join("|").toLowerCase():tagnames.toLowerCase()) + "|";
			while(obj != null && obj.tagName != null){
				if(tagnames.indexOf("|" + obj.tagName.toLowerCase() + "|") != -1) break;
				obj = obj.parentNode;
			}
			return obj;
		},
		_get_event_target_by_id:function(e, ids/* Array or String*/){
			var obj = __dom.event.src_element(e);
			ids = "|" + (ids instanceof Array?ids.join("|"):ids) + "|";
			while(obj != null){
				if(obj.id && ids.indexOf("|" + obj.id + "|") != -1) break;
				obj = obj.parentNode;
			}
			return obj;
		},
		_get_event_target_by_classname:function(e, classname/*String*/){
			var obj = __dom.event.src_element(e);			
			while(obj != null){
				if(obj.className && obj.className.indexOf(classname) != -1){
					var classs = "|" + obj.className.split(/\s+/).join("|") + "|";
					if(classs.indexOf("|" + classname + "|") != -1) break;
				}
				obj = obj.parentNode;
			}
			return obj;
		},
		get_instance_id:function(){
			return this._instance_id;
		},
		get_data_provider:function(){
			return this._data_provider;
		},
		get_event_adapter:function(){
			return this._event_adapter;
		},
		is_instance_of:function(class_name){
			if(this._class_name == class_name) return true;
			var _ui = __UI["_" + this._class_name];
			var limit = 20;
			while(_ui._parent != null){
				limit--;
				if(limit <0) break;
				if(_ui._parent == class_name) return true;				
				_ui = __UI["_" + _ui._parent];
			}
			return false;
		}
	};
	__UI._DATA_PROVIDER = {
		_parent:null,
		_class_name:"DATA_PROVIDER",
		_instance_id:null,
		_initialize:function(){
			this._state = new (__UI.ClassLoader("STATE"))();
			this._ui_listener = {};
			__UI._set_instance(this);
		},
		_connect_ui_instance:function(object){
			this._ui_listener[object._instance_id] = object;
		},
		update_ui:function(type, data){
			for(var idx in this._ui_listener) this._ui_listener[idx].update_ui(type, data);
		},
		is_instance_of:function(class_name){
			if(this._class_name == class_name) return true;
			var _ui = __UI["_" + this._class_name];
			var limit = 20;
			while(_ui._parent != null){
				limit--;
				if(limit <0) break;
				if(_ui._parent == class_name) return true;				
				_ui = __UI["_" + _ui._parent];
			}
			return false;
		}
	};
	__UI._ACTIONS = {
		_parent:"DATA_PROVIDER",
		_class_name:"ACTIONS",
		_initialize:function(){
			this._items = {};
			$super();
		},
		add:function(action_item){
			action_item._actions_instance = this;
			this._items[action_item.get_id()] = action_item;
		},
		get_items:function(){
			return this._items;
		},
		get:function(id){
			return this._items[id];
		}
	};
	__UI._ACTION_ITEM = {
		_parent:null,
		_class_name:"ACTION_ITEM",
		_initialize:function(id, name, icon, action_func, is_enabled, type){
			this._type = new (__UI.ClassLoader("STATE"))();
			this._actions_instance = null;
			this._item_id = id;
			this._item_name = name;
			this._item_icon = icon;
			this._item_action = action_func;
			this._item_enabled = is_enabled==null?true:is_enabled;
			this._type.set(type==null||type==""?0:type);
		},
		is_enabled:function(){
			return this._item_enabled;
		},
		is_separator:function(){
			return !this._item_name && !this._item_icon;
		},
		set_enable:function(flag){
			var old = this._item_enabled;
			this._item_enabled = flag;
			if(old != flag && this._actions_instance) this._actions_instance.update_ui('item_update', this);
		},
		get_id:function(){
			return this._item_id;
		},
		get_name:function(){
			return this._item_name;
		},
		set_name:function(name){
			var old = this._item_name; 
			this._item_name = name;
			if(old != name && this._actions_instance) this._actions_instance.update_ui('item_update', this);
		},
		get_action:function(){
			return this._item_action;
		}
	};
	__UI.CONST.COMMON_DATA_PROVIDER = {
		APPEND 		: 1 << 0
		, INSERT	: 1 << 1
		, UPDATE	: 1 << 2
		, DELETE	: 1 << 3		
		, REFRESH	: 1 << 4
		, CLEAR		: 1 << 5
		, FLUSH		: 1 << 6
	};
	__UI._COMMON_DATA_PROVIDER = {
		_parent:"DATA_PROVIDER",
		_class_name:"COMMON_DATA_PROVIDER",
		_instance_id:null,
		_initialize:function(key_provider /* new function(){this.get_id=function(data){return id;};} */){
			$super();
			this._data = [];
			this._data_hash = {};
			this._data_index = {};
			this._cache = {};
			this._key_provider = key_provider;
		},
		get_data:function(index){
			return this._data[index];
		},
		get_data_by_id:function(id){
			return this._data_hash[id];
		},
		get_index_of:function(data){
			var id = this.get_id(data);
			return this._data_index[id];
		},
		get_id:function(data){
			return this._key_provider.get_id(data);
		},
		get:function(data, key){
			return this._key_provider["get_" + key]?
					this._key_provider["get_" + key](data):null;
		},
		set:function(data, key, value){
			if(this._key_provider["set_" + key]){
				if(this._key_provider["set_" + key](data, value)){
					this.update(data);
				}
			}
		},
		size:function(){
			return this._data.length;
		},
		add:function(data){
			var id = this.get_id(data);
			if(this._data_hash[id]) return -1;
			this._data.push(data);
			this._data_hash[id] = data;
			this._data_index[id] = this._data.length - 1;
			this.update_ui(__UI.CONST.COMMON_DATA_PROVIDER.APPEND, data);
			return this._data_index[id];
		},
		insert:function(index, data){
			var id = this.get_id(data);
			if(this._data_hash[id]) return -1;
			if(index < 0) index = 0;
			if(index >= this._data.length){
				return this.add(data);
			}
			this._data.splice(index, 0, data);
			this._update_data_index(index);
			this.update_ui(__UI.CONST.COMMON_DATA_PROVIDER.INSERT, data);
			return index;
		},
		update:function(index_or_id_or_data){
			var data = null;
			if(typeof(index_or_id_or_data) == "number"){
				data = this.get_data(index_or_id_or_data);
			}else if(typeof(index_or_id_or_data) == "string"){
				data = this.get_data_by_id(index_or_id_or_data);
			}else{
				data = index_or_id_or_data;
			}
			this.update_ui(__UI.CONST.COMMON_DATA_PROVIDER.UPDATE, data);
		},
		remove:function(index_or_data){
			var id, data, index;
			if(typeof(index_or_data) == "number"){
				if(this._data.length <= index_or_data) return;
				index = index_or_data;
				data = this._data[index];
			}else{
				data = index_or_data;
				index = this.get_index_of(data);
			}
			id = this.get_id(data);
			
			this.update_ui(__UI.CONST.COMMON_DATA_PROVIDER.DELETE, data);
			this._data.splice(index, 1);
			delete this._data_hash[id];
			this._update_data_index(index);
		},
		refresh:function(){
			this.update_ui(__UI.CONST.COMMON_DATA_PROVIDER.REFRESH, null);
		},
		clear:function(){
			this._data = [];
			this._data_hash = {};
			this._data_index = {};
			this._cache = {};
			this.update_ui(__UI.CONST.COMMON_DATA_PROVIDER.CLEAR, null);
		},
		flush:function(){
			this.update_ui(__UI.CONST.COMMON_DATA_PROVIDER.FLUSH, null);
		},
		_update_data_index:function(index){
			for(var i = index; i < this._data.length; i++){
				this._data_index[this.get_id(this._data[i])] = i;
			}
		},
		set_data:function(data_array){
			this._data = [];
			this._data_hash = {};
			this._data_index = {};
			for(var i = 0; i < data_array.length; i++){
				var data = data_array[i];
				var id = this.get_id(data_array[i]);
				this._data.push(data);				
				this._data_hash[id] = data;
				this._data_index[id] = i;
			}
			this.refresh();
		}
	};
	__UI._EVENT_ADAPTER = {
		_parent:null,
		_class_name:"EVENT_ADAPTER",
		_instance_id:null,
		_initialize:function(){
			this._ui_listener = {};
			__UI._set_instance(this);
		},
		_connect_ui_instance:function(object){
			this._ui_listener[object._instance_id] = object;
		},
		mouse_down:function(e){},
		mouse_over:function(e){},
		mouse_out:function(e){},
		return_value:function(result){},
		load_complete:function(){}
	};
	__UI.CONST.ANIMATION = {
		TOP 		: 1 << 0
		,RIGHT 		: 1 << 1
		,BOTTOM		: 1 << 2
		,LEFT		: 1 << 3
		,WIDTH		: 1 << 4
		,HEIGHT		: 1 << 5
		,INNER_HTML	: 1 << 6
	};
	__UI._ANIMATION = {
		_parent:null
		,_class_name:"ANIMATION"
		,_instance_id:null
		,_initialize:function(Kp, Ki, Kd, Kdt, err_offset){
			// Kp : 0.05, Ki : 0.1, Kd : 0.01, dt 1
			this._is_progress = false;
			this._Kp = Kp;this._Ki = Ki;this._Kd = Kd;this._Kdt = Kdt;
			this._err_offset = err_offset;
			this._targets = [];
			this._callback = null;
			this._TARGET = function(target_object, type, target_value, callback, err_offset){
				this._MAX_LOOP = 100;
				this._loop = 0;
				this._has_more = true;
				this._target = target_object;
				this._type = type;
				this._start_pos = null;
				this._target_pos = target_value;
				this._callback = callback;
				this._get = null;
				this._set = null;
				this._round = 1;
				this._err_offset = (err_offset != null?err_offset:0.1);
				switch(this._type){
				case __UI.CONST.ANIMATION.TOP: 
					this._get = function(){
						val = parseInt(this._target.style.top, 10);
						if(isNaN(val)) val = 0;
						return val;
					};
					this._set = function(val){
						var value = Math.round(val);
						try{
							this._target.style.top = value + "px";
						}catch(e){
							try{if(__UI.is_debug) throw e;}catch(ei){}
						}
						return value + "px";
					};
					break;
				case __UI.CONST.ANIMATION.RIGHT:
					this._get = function(){
						val = parseInt(this._target.style.right, 10);
						if(isNaN(val)) val = 0;
						return val;
					};
					this._set = function(val){
						var value = Math.round(val);
						try{
							this._target.style.right = value + "px";
						}catch(e){
							try{if(__UI.is_debug) throw e;}catch(ei){}
						}
						return value + "px";
					};
					break;
				case __UI.CONST.ANIMATION.BOTTOM:
					this._get = function(){
						val = parseInt(this._target.style.bottom, 10);
						if(isNaN(val)) val = 0;
						return val;
					};
					this._set = function(val){
						var value = Math.round(val);
						try{
							this._target.style.bottom = value + "px";
						}catch(e){
							try{if(__UI.is_debug) throw e;}catch(ei){}
						}
						return value + "px";
					};
					break;
				case __UI.CONST.ANIMATION.LEFT:
					this._get = function(){
						val = parseInt(this._target.style.left, 10);
						if(isNaN(val)) val = 0;
						return val;
					};
					this._set = function(val){
						var value = Math.round(val);
						try{
							this._target.style.left = value + "px";
						}catch(e){
							try{if(__UI.is_debug) throw e;}catch(ei){}
						}
						return value + "px";
					};
					break;
				case __UI.CONST.ANIMATION.WIDTH:
					this._get = function(){
						val = parseInt(this._target.style.width, 10);
						if(isNaN(val)) val = 0;
						return val;
					};
					this._set = function(val){
						if(val < 0) val = 0;
						var value = Math.round(val);
						try{
							this._target.style.width = value + "px";
						}catch(e){
							try{if(__UI.is_debug) throw e;}catch(ei){}
						}
						return value + "px";
					};
					break;
				case __UI.CONST.ANIMATION.HEIGHT:
					this._get = function(){
						val = parseInt(this._target.style.height, 10);
						if(isNaN(val)) val = 0;
						return val;
					};
					this._set = function(val){
						if(val < 0) val = 0;
						var value = Math.round(val);
						try{
							this._target.style.height = value + "px";
						}catch(e){
							try{if(__UI.is_debug) throw e;}catch(ei){}
						}
						return value + "px";
					};
					break;
				case __UI.CONST.ANIMATION.INNER_HTML:
					this._get = function(){
						val = parseFloat(this._target.innerHTML, 10);
						if(isNaN(val)) val = 0;
						return val;
					};
					this._set = function(val){
						var value = (Math.round(val * this._round) / this._round).toString();
						try{
							if(this._round!="1"){
								var offset = this._round.toString().substring(1);
								if(value.indexOf(".") != -1){
									var left = value.left(".");
									var right = value.right(".");
									right += offset;
									right = right.substring(0, offset.length);
									value = left + "." + right;
								}else{
									value += "." + offset;
								}
							}
							this._target.innerText = value;								
						}catch(e){
							try{if(__UI.is_debug) throw e;}catch(ei){}
						}
						return value;
					};
					if(this._target.getAttribute("animation_round")){
						this._round = parseInt(this._target.getAttribute("animation_round"), 10);
						if(isNaN(this._round)){
							this._round = 1;
						}
						this._err_offset = 0.1 / this._round;
					}
					break;
				}
				this.init = function(){
					this._loop = 0;
					this._has_more = true;
				};
				this._set_pos = function(){
					if(!this._has_more) return;
					this._loop++;
					var val = this.pid.get();
					var set_val = this._set(val);
					if(this._callback) this._callback(set_val);
					if(val > this._target_pos - this._err_offset && val < this._target_pos + this._err_offset) this._has_more = false;
					if(this._loop > this._MAX_LOOP) this._has_more = false;
					return this._has_more;
				};
				this._start_pos = this._get();
				this.pid = null;
			};
			this._PID = function(Kp, Ki, Kd, dt, start, target){
				this.Kp = Kp;this.Ki = Ki;this.Kd = Kd;this.dt = dt;
//				this.Kp = 0.2;this.Ki = 0.1;this.Kd = 0.02;this.dt = 1;
				if(this.Ki == null) this.Ki = 0;
				if(this.Kd == null) this.Kd = 0;
				if(this.dt == null) this.dt = 1;
				this.start = start;
				this.target = target;
				this.current = start;
				this.prev_err = 0;
				this.i_err = 0;
				this.get = function(){
					var err = this.target - this.current;
					var kp = this.Kp * err;
					this.i_err += err * this.dt;
					var ki = this.Ki * this.i_err;
					var d_err = (err - this.prev_err) / this.dt;
					var kd = this.Kd * d_err;
					this.prev_err = err;
					this.current += kp + ki + kd;
					return this.current;
				};
			};
		}
		,add:function(target_object, type, target_value, callback, Kp, Ki, Kd, Kdt, err_offset){
			if(err_offset == null) err_offset = this._err_offset;
			var t = new this._TARGET(target_object, type, target_value, callback, err_offset);
			t.pid = new this._PID(
					(Kp!=null?Kp:this._Kp)
					, (Ki!=null?Ki:this._Ki)
					, (Kd!=null?Kd:this._Kd)
					, (Kdt!=null?Kdt:this._Kdt), t._start_pos, t._target_pos);
			this._targets.push(t);
		}
		,clear:function(){
			this._targets = [];
		}
		,start:function(callback){
			if(this._is_progress) this.stop();
			this._is_progress = true;
			this._callback = callback;
			for(var i = 0; i < this._targets.length; i++){
				this._targets[i].init();
			}
			this._id = window.setInterval(Object.bind(window, this, this._process), 16);
			//setTimeout(Object.bind(window, this, this._process), 0);
		}
		,_process:function(){
			if(!this._is_progress) return;
			var end = true;
			for(var i = 0; i< this._targets.length; i++){
				if(this._targets[i]._set_pos()){
					end = false;
				}
			}
			if(!end){
//				if(this._interval != null){
//					var interval = this._interval;
//					this._interval = new Date();
//					interval = this._interval - interval;
//					if(interval > 300){
//						this.stop();
//						return;
//					}
//				}else{
//					this._interval = new Date();
//				}
//				setTimeout(Object.bind(window, this, this._process), 10);
			}else{
				this.stop();
			}
		}
		,stop:function(){
			if(!this._is_progress) return;
			this.is_progress = false;
			if(this._id) window.clearInterval(this._id);
			this._id = null;			
			if(this._callback) this._callback();
			this._callback = null;
		}
	};
	__UI.CONST.PANEL = {
		"LEFT"			: 1 << 0
		,"CENTER"		: 1 << 1
		,"RIGHT"		: 1 << 2
		,"TOP"			: 1 << 3
		,"MIDDLE"		: 1 << 4
		,"BOTTOM"		: 1 << 5
		,"FILL"			: 1 << 6
		,"AUTO"			: 1 << 7
	};
	__UI._PANEL = {
		_parent:null
		,_class_name:"PANEL"
		,_instance_id:null
		,_initialize:function(_window, container, class_name, class_att_suffix){
			this._window = _window?_window:window;
			this._cls_name = class_name?class_name:this._class_name.toLowerCase();
			this._cls_suffix = (class_att_suffix!=null?class_att_suffix:'');
			this._container = container;
			this._align = null;
			this._vertical_align = null;
			this._element_wrapper = this._window.document.createElement("DIV");
			if(this._container) this._container.appendChild(this._element_wrapper);
			
			this._element_wrapper.className = "cls_panel cls_" + this._cls_name
				+ (this._cls_suffix?' cls_' + this._cls_name + this._cls_suffix:'');
			this._element = this._window.document.createElement("DIV");
			this._element.className = "cls_panel_inner cls_" + this._cls_name + "_panel_inner"
				+ (this._cls_suffix?' cls_' + this._cls_name + '_panel_inner' + this._cls_suffix:'');
			this._element_wrapper.appendChild(this._element);
			
			this.layout(__UI.CONST.PANEL.AUTO, __UI.CONST.PANEL.AUTO);
		}
		,set_decorator:function(){
			if(this.init_decorator) return;
			
			this._decorator_top_bd = this._window.document.createElement("DIV");
			this._decorator_top_bd.className = "cls_panel_top_border";
			this._decorator_right_bd = this._window.document.createElement("DIV");
			this._decorator_right_bd.className = "cls_panel_right_border";
			this._decorator_bottom_bd = this._window.document.createElement("DIV");
			this._decorator_bottom_bd.className = "cls_panel_bottom_border";
			this._decorator_left_bd = this._window.document.createElement("DIV");
			this._decorator_left_bd.className = "cls_panel_left_border";
			this._decorator_top_lc = this._window.document.createElement("DIV");
			this._decorator_top_lc.className = "cls_panel_top_left_corner";
			this._decorator_top_rc = this._window.document.createElement("DIV");
			this._decorator_top_rc.className = "cls_panel_top_right_corner";
			this._decorator_bottom_lc = this._window.document.createElement("DIV");
			this._decorator_bottom_lc.className = "cls_panel_bottom_left_corner";
			this._decorator_bottom_rc = this._window.document.createElement("DIV");
			this._decorator_bottom_rc.className = "cls_panel_bottom_right_corner";
			
			this._element_wrapper.appendChild(this._decorator_top_bd);
			this._element_wrapper.appendChild(this._decorator_right_bd);
			this._element_wrapper.appendChild(this._decorator_bottom_bd);
			this._element_wrapper.appendChild(this._decorator_left_bd);
			this._element_wrapper.appendChild(this._decorator_top_lc);
			this._element_wrapper.appendChild(this._decorator_top_rc);
			this._element_wrapper.appendChild(this._decorator_bottom_lc);
			this._element_wrapper.appendChild(this._decorator_bottom_rc);
			this.init_decorator = true;
		}
		,get_element:function(){
			return this._element_wrapper;
		}
		,get_content_container:function(){
			return this._element;
		}
		,add_content_element:function(dom_obj){
			this._element.appendChild(dom_obj);
//			this._element_wrapper.appendChild(this._content_element);
		}
		,set_html:function(html){
			this._element.innerHTML = html;
		}
		,layout:function(align, vertical_align){
			if(align == null) align = this._align;
			if(vertical_align == null) vertical_align = this._vertical_align;
			this._align = align;
			this._vertical_align = vertical_align;
			if(align == __UI.CONST.PANEL.AUTO || vertical_align == __UI.CONST.PANEL.AUTO){
				this._element.style.position = "relative";
				this._element.style.width = "";
				this._element.style.height = "";
			}else{
				this._element.style.position = "absolute";
				this.set_align(align);
				this.set_vertical_align(vertical_align);
			}
		}
		,set_align:function(type){
			var val = ["","","",""];
			switch(type){
			case __UI.CONST.PANEL.LEFT:
				val = ["0px","","",""];
				break;
			case __UI.CONST.PANEL.CENTER:
				val = ["","","100%","center"];
				break;
			case __UI.CONST.PANEL.RIGHT:
				val = ["","0px","",""];
				break;
			case __UI.CONST.PANEL.FILL:
				val = ["0px","","100%",""];
				break;
			}
			this._element.style.left = val[0];
			this._element.style.right = val[1]; 
			this._element.style.width = val[2];
			this._element.style.textAlign = val[3];
		}
		,set_vertical_align:function(type){
			var val = ["","","","","",""];
			switch(type){
			case __UI.CONST.PANEL.TOP:
				val = ["0px","","",""];
				break;
			case __UI.CONST.PANEL.MIDDLE:
				val = ["","","100%","middle"];
				break;
			case __UI.CONST.PANEL.BOTTOM:
				val = ["","0px","",""];
				break;
			case __UI.CONST.PANEL.FILL:
				val = ["0px","","100%",""];
				break;
			}
			this._element.style.top =  val[0];
			this._element.style.bottom = val[1];
			this._element.style.height = val[2];
			this._element.style.verticalAlign = val[3];
		}
		,clear:function(){
			__dom.remove_node(this._element, true);
		}
	};
	__UI.CONST.LAYER = {
		"_TOP_LEFT"			: 1 << 0
		,"_TOP_RIGHT"		: 1 << 1
		,"_BOTTOM_LEFT"		: 1 << 2
		,"_BOTTOM_RIGHT"	: 1 << 3
		,"_SHOW"			: 1 << 4
		,"_HIDE"			: 1 << 5
	};
	__UI._LAYER = {
		_parent:"UI",
		_class_name:"LAYER",
		_initialize:function(_window, class_name, class_att_suffix, container){
			$super(null, null, _window);
			this._cls_name = class_name?class_name:this._class_name.toLowerCase();
			this._cls_suffix = (class_att_suffix!=null?class_att_suffix:'');
			this._container = container;
			if(this._container == null) this._container = this._window.document.body;
			this._element = this._window.document.createElement("DIV");
			this._prev_position = {"isShow":false};
			this._show_type = 0;
			this._layer_state = 0;
			this.hide();
			this._element.className = (this._cls_name != "layer"?'cls_layer ':'') 
				+ "cls_" + this._cls_name
				+ (this._cls_suffix?' cls_' + this._cls_name + this._cls_suffix:'');
			this._container.appendChild(this._element);
			this._bg_iframe = this._window.document.createElement("IFRAME");
			this._bg_iframe.className = (this._cls_name != "layer"?'cls_layer_bg_iframe ':'')
				+ "cls_" + this._cls_name + "_bg_iframe"
				+ (this._cls_suffix?' cls_' + this._cls_name + '_bg_iframe' + this._cls_suffix:'');
			this._bg_iframe.frameBorder = "0";
			this._element.appendChild(this._bg_iframe);
			this._bg_panel = this._window.document.createElement("DIV");
			this._bg_panel.className = (this._cls_name != "layer"?'cls_layer_bg_panel ':'')
				+ "cls_" + this._cls_name + "_bg_panel"
				+ (this._cls_suffix?' cls_' + this._cls_name + '_bg_panel' + this._cls_suffix:'');
			this._element.appendChild(this._bg_panel);
			
			this._panel_wrapper = this._window.document.createElement("DIV");
			this._panel_wrapper.className = (this._cls_name != "layer"?'cls_layer_panel_wrapper ':'')
				+ "cls_" + this._cls_name + "_panel_wrapper"
				+ (this._cls_suffix?' cls_' + this._cls_name + '_panel_wrapper' + this._cls_suffix:'');
			this._element.appendChild(this._panel_wrapper);
			
			this._shadow_panel = this._window.document.createElement("DIV");
			this._shadow_panel.className = (this._cls_name != "layer"?'cls_layer_shadow_panel ':'')
				+ "cls_" + this._cls_name + "_shadow_panel"
				+ (this._cls_suffix?' cls_' + this._cls_name + '_shadow_panel' + this._cls_suffix:'');
			this._panel_wrapper.appendChild(this._shadow_panel);
			
			this._panel = new (__UI.ClassLoader("PANEL"))(
					this._window
					, this._panel_wrapper
					, this._cls_name + "_panel"
					, class_att_suffix);
			this._panel.layout(__UI.CONST.PANEL.FILL, __UI.CONST.PANEL.FILL);
			__dom.add_class(this._panel.get_element(), "cls_layer_panel");
		}
		,get_element:function(){
			return this._element;
		}
		,get_panel:function(){
			return this._panel;
		}
		,set_html:function(html){
			this._panel.set_html(html);
		}
		,set_element:function(dom_obj){
			this._panel.add_content_element(dom_obj);
		}
		,show:function(e, position_x, position_y, set_layout){
			this.show_top_left(e, position_x, position_y, set_layout);
		}
		,show_top_left:function(e, position_x, position_y, set_layout){
			this._prev_position_set();
			if(set_layout == null) set_layout = true;
			this._layer_state = __UI.CONST.LAYER._SHOW;
			if(set_layout) this.layout();
			this._show_type = __UI.CONST.LAYER._TOP_LEFT;
			this._set_position(e, position_y + "px", "", "", position_x + "px");
		}
		,show_top_right:function(e, position_x, position_y, set_layout){
			this._prev_position_set();
			if(set_layout == null) set_layout = true;
			this._layer_state = __UI.CONST.LAYER._SHOW;
			if(set_layout) this.layout();
			this._show_type = __UI.CONST.LAYER._TOP_RIGHT;
			this._set_position(e, position_y + "px", position_x + "px", "", "");
		}
		,show_bottom_left:function(e, position_x, position_y, set_layout){
			this._prev_position_set();
			if(set_layout == null) set_layout = true;
			this._layer_state = __UI.CONST.LAYER._SHOW;
			if(set_layout) this.layout();
			this._show_type = __UI.CONST.LAYER._BOTTOM_LEFT;
			this._set_position(e, "", "", position_y + "px", position_x + "px");
		}
		,show_bottom_right:function(e, position_x, position_y, set_layout){
			this._prev_position_set();
			if(set_layout == null) set_layout = true;
			this._layer_state = __UI.CONST.LAYER._SHOW;
			if(set_layout) this.layout();
			this._show_type = __UI.CONST.LAYER._BOTTOM_RIGHT;
			this._set_position(e, "", position_x + "px", position_y + "px", "");
		}
		,get_show_type:function(){
			return this._show_type;
		}
		,hide:function(set_layout){
			if(set_layout == null) set_layout = false;
			this._layer_state = __UI.CONST.LAYER._HIDE;
			if(set_layout) this.layout();
			this._element.style.left = "-3000px";
			this._element.style.top = "0px";
			this._element.style.right = "";
			this._element.style.bottom = "";
		}
		,_set_position:function(e, top, right, bottom, left){
			this._element.style.left = left;
			this._element.style.top = top;
			this._element.style.right = right;
			this._element.style.bottom = bottom;
		}
		,is_show:function(){
			return this._layer_state == __UI.CONST.LAYER._SHOW;
		}
		,_parse_int:function(val){
			var value = parseInt(val, 10);
			return isNaN(value)?0:value;
		}
		,_prev_position_set:function(){
			var p = this._prev_position;
			p.isShow = this.is_show();
			if(!p.isShow) return;
			p.layer_top = this.get_element().offsetTop;
			p.layer_right = this._container.offsetWidth - (this.get_element().offsetLeft + this.get_element().offsetWidth);
			p.layer_bottom = this._container.offsetHeight - (this.get_element().offsetTop + this.get_element().offsetHeight);
			p.layer_left = this.get_element().offsetLeft;
			p.wrapper_top = this._panel_wrapper.offsetTop;
			p.wrapper_right = this.get_element().offsetWidth - (this._panel_wrapper.offsetLeft + this._panel_wrapper.offsetWidth);
			p.wrapper_bottom = this.get_element().offsetHeight - (this._panel_wrapper.offsetTop + this._panel_wrapper.offsetHeight);
			p.wrapper_left = this._panel_wrapper.offsetLeft;
			p.layer_width = this.get_element().offsetWidth;
			p.layer_height = this.get_element().offsetHeight;
			p.wrapper_width = this._panel_wrapper.offsetWidth;
			p.wrapper_height = this._panel_wrapper.offsetHeight;
			p.shadow_width = this._shadow_panel.offsetWidth;
			p.shadow_height = this._shadow_panel.offsetHeight;
			p.panel_width = this._panel.get_element().offsetWidth;
			p.panel_height = this._panel.get_element().offsetHeight;
		}
		,layout:function(){
			var panel_obj = this._panel.get_element();
			var panel_obj_inner = this._panel.get_content_container();
			
			var max_width = this._container.offsetWidth - 10;
			var max_height = this._container.offsetHeight - 10;
			
			panel_obj.style.width = "1px";
			panel_obj.style.height = "1px";
			
			panel_obj_inner.style.width = "100%";
			panel_obj_inner.style.height = "100%";
			panel_obj_inner.style.position = "relative";
			
//			var width = panel_obj.scrollWidth;
//			var height = panel_obj.scrollHeight;
			/*IE6,7에서 panel_obj.scrollWidth, Height문제*/
			var width = panel_obj_inner.scrollWidth;
			var height = panel_obj_inner.scrollHeight;
			if(width > max_width){
				width = max_width;
				height += 25;
				panel_obj_inner.style.overflowX = "auto";
			}else{
				panel_obj_inner.style.overflowX = "";
			}
			if(height > max_height){
				height = max_height;
				width += 25;
				if(width > max_width){
					width = max_width;
					panel_obj_inner.style.overflowX = "auto";
				}
				panel_obj_inner.style.overflowY = "auto";
			}else{
				panel_obj_inner.style.overflowY = "";
			}
			panel_obj.style.width = width + "px";
			panel_obj.style.height = height + "px";
			
			this._shadow_panel.style.width = width + "px";
			this._shadow_panel.style.height = height + "px";
			
			this._panel_wrapper.style.width = "0px";
			this._panel_wrapper.style.height = "0px";
			
			width = this._panel_wrapper.scrollWidth 
				+ this._parse_int(__dom.style.current_style(this._shadow_panel, "marginRight"));
			height = this._panel_wrapper.scrollHeight
				+ this._parse_int(__dom.style.current_style(this._shadow_panel, "marginBottom"));
			
			this._layout_background_element(width, height);
			this._panel.layout();
		}
		,_layout_background_element:function(width, height){
			this._element.style.width = width + "px";
			this._element.style.height = height + "px";
			
			this._panel_wrapper.style.width = width + "px";
			this._panel_wrapper.style.height = height + "px";
			
			this._bg_iframe.style.width = 
				this._bg_panel.style.width = "100%";
			this._bg_iframe.style.height = 
				this._bg_panel.style.height = "100%";
		}
		,clear:function(){
			__dom.remove_node(this._bg_iframe, true);
			__dom.remove_node(this._bg_panel, true);
			__dom.remove_node(this._shadow_panel, true);
			this._panel.clear();
			__dom.remove_node(this._panel.get_element(), true);
			__dom.remove_node(this._panel_wrapper, true);			
			__dom.remove_node(this._element, true);
		}
	};
}
