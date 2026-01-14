"use strict";
(function ($) {
	$.fn.disableSelection = function () {
		return this
			//.attr('unselectable', 'on')
			//.css('user-select', 'none')
			.on('selectstart', false);
	};
})(jQuery);
(function () {
	var IMAGE;
	var _ua = navigator.userAgent;
	var isIE = _ua.search(/Trident/i) != -1;
	var isChrome = !isIE && _ua.search(/Chrome/i) != -1;
	var DEF_OPT = {
		transparentCorners: false,
		hoverCursor: 'default',
		cornerColor: 'rgb(255,255,255)',
		cornerSize: 8,
		centeredScaling: true,
		hasRotatingPoint: false,
		hasBorders: false,
		minScaleLimit: 0.1,
		lockScalingFlip: true,
		selectable: false,
		sizeType: 'original'
	};

	var _imgEdit = null;
	var ImageEditor = function(){
		var _self = this;
		fabric.devicePixelRatio = 1; /** 브라우져 확대 하고 작업시 오류 처리 */
		/** 
		 * draw, font등 smooth 효과 제거 
		 * - 이미지 확대시 이미지가 거칠어지는 문제로 여기서 안하고 Text, Draw tool 이 선택될때만 처리함.
		 */
		// fabric.StaticCanvas.prototype.imageSmoothingEnabled = false; 
		/**
		 * Fabricjs 2.0.0 beta7 _setImageSmoothing 오류로 소스를 수정함.
		 * Fabricjs version을 올릴때 해당 부분 확인 후 제거 할 것.
		 */
		fabric.StaticCanvas.prototype._setImageSmoothing = function(){
			var ctx = this.getContext();
			if(ctx.imageSmoothingEnabled !== undefined) ctx.imageSmoothingEnabled = this.imageSmoothingEnabled;
			else if(ctx.webkitImageSmoothingEnabled !== undefined) ctx.webkitImageSmoothingEnabled = this.imageSmoothingEnabled;
			else if(ctx.mozImageSmoothingEnabled !== undefined) ctx.mozImageSmoothingEnabled = this.imageSmoothingEnabled;
			else if(ctx.msImageSmoothingEnabled !== undefined) ctx.msImageSmoothingEnabled = this.imageSmoothingEnabled;
			else if(ctx.oImageSmoothingEnabled !== undefined) ctx.oImageSmoothingEnabled = this.imageSmoothingEnabled;
		};
		/**
		 * IText ImageSmoothingEnabled
		 * imageSmoothingEnabled을 IText에만 적용하기 위한 소스
		 * 글자 각도를 기울일 경우에는 ImageSmoothingEnabled을 사용함.
		 */
		fabric.IText.prototype.setCustomImageSmoothing = this.setImageSmoothing;
		fabric.IText.prototype._CustomRender = fabric.IText.prototype.render;
		fabric.IText.prototype.render = function(ctx) {
			this.setCustomImageSmoothing(ctx, this.angle != 0);
			this._CustomRender(ctx);
			this.setCustomImageSmoothing(ctx);
		};
		/**
		 * Fabricjs 2.0.0 beta7 
		 * IText initMousedownHandler 변경함.
		 * Text 입력에 사용하는 compositionend event가 IE에서는 한글 입력 완료시 발생을 안한다.
		 * Fabricjs version을 올릴때 해당 부분 확인 후 제거 할 것.
		 */
		if(isIE){
			fabric.IText.prototype.initMousedownHandler = function() {
				this.on('mousedown', function(options) {
					if (!this.editable || (options.e.button && options.e.button !== 1)) {
					  return;
					}
					if(this.inCompositionMode) this.onCompositionEnd();
					
					var pointer = this.canvas.getPointer(options.e);
			  
					this.__mousedownX = pointer.x;
					this.__mousedownY = pointer.y;
					this.__isMousedown = true;
			  
					if (this.selected) {
					  this.setCursorByClick(options.e);
					}
			  
					if (this.isEditing) {
					  this.__selectionStartOnMouseDown = this.selectionStart;
					  if (this.selectionStart === this.selectionEnd) {
						this.abortCursorAnimation();
					  }
					  this.renderCursorOrSelection();
					}
				});
			};
		}
		this.paste_wrap = $('#default_canvas');
		this.canvas_wrap = $('#canvas_wrap');
		this.crop_wrap = $('#canvas_crop_wrap');
		this.canvas = new fabric.Canvas('canvas_image');
		this.crop_canvas = new fabric.Canvas('canvas_crop_image');
		this.defaultImageSmoothing = this.canvas.imageSmoothingEnabled;
		this.img = null;
		this.tools = {};
		this.status = {
			angle:0, 
			canvas_fullsize_mode:false, 
			activeMenu:''
		};
		fabric.Object.prototype.set({
			transparentCorners: false,
			cornerColor: 'rgba(255,255,255,1)',
			cornerStrokeColor: 'rgba(102,153,255,0.5)',
			cornerSize:7
		});
		this.originImgInfo = null;
		this.wrap = $('#canvas_wrap');
		this.history = new History({
			main:this,
			styleEl: {
				prev:$('.btn_prev').attr('title', Trex._I18N.g('image_editor.undo', "실행취소")),
				next:$('.btn_next').attr('title', Trex._I18N.g('image_editor.redo', "다시실행"))
			},
			undoEvent:function(){
				if(_self.tools['crop'] && _self.tools['crop'].activeTools){
					_self.menuClear();
					return false;
				}else{
					return true;
				}
			},
			startHistory:1
		});
		/**
		 * 객체 변경시 history
		 * rotation, shape, resize, crop, draw 별도처리
		 * 생성된 객체에 변경 event만 처리함.
		 */
		this.canvas.on('object:modified', function(){
			_self.history.add().save();
		});
		/**
		 * draw history
		 */
		this.canvas.on('path:created', function(){
			_self.history.add().save();
		});

		if(Trex._TI){
			_createImgObject(Trex._TI.src, true, {width:Trex._TI.width, height:Trex._TI.height});
		}
	};
	ImageEditor.prototype = {
		'setCanvasSize':function(width, height){
			if(!width || !height){
				this.wrap.css('padding', '0');
				this.wrap.css('overflow', 'hidden');
				this.canvas.setDimensions({width:this.wrap.width(), height:this.wrap.height()});
				this.wrap.css('overflow', 'auto');
			}else{
				this.wrap.css('padding', '10px');
				this.canvas.setDimensions({width:width, height:height});
				// this.canvas.setWidth(width);
				// this.canvas.setHeight(height);
				// this.canvas.calcOffset();
			}
		},
		'setCropCanvasSize':function(){
			this.crop_canvas.setDimensions({width:this.crop_wrap.width(), height:this.crop_wrap.height()});
			if(this.tools['crop']) this.tools['crop'].resize();
		},
		'eventWindowResize':function(){
			this.setCropCanvasSize();
			if(this.status.canvas_fullsize_mode === true) this.setCanvasSize();
		},
		'merge':function(){
			var data = this.canvas.toDataURL('png');
			_createImgObject(data);
		},
		'loadData':function(data, _callback){
			_createImgObject(data, null, null, _callback);
		},
		'menuClear':function(){
			_navMenuClick(null, null);
			_navClick(null, null);
		},
		'btnEnabled':function(flag){
			_btnEnabled(flag);
		},
		'setImageSmoothing':function(ctx, flag){
			if(ctx.imageSmoothingEnabled !== undefined) ctx.imageSmoothingEnabled = flag !== null?flag:this.defaultImageSmoothing;
			else if(ctx.webkitImageSmoothingEnabled !== undefined) ctx.webkitImageSmoothingEnabled = flag !== null?flag:this.defaultImageSmoothing;
			else if(ctx.mozImageSmoothingEnabled !== undefined) ctx.mozImageSmoothingEnabled = flag !== null?flag:this.defaultImageSmoothing;
			else if(ctx.msImageSmoothingEnabled !== undefined) ctx.msImageSmoothingEnabled = flag !== null?flag:this.defaultImageSmoothing;
			else if(ctx.oImageSmoothingEnabled !== undefined) ctx.oImageSmoothingEnabled = flag !== null?flag:this.defaultImageSmoothing;
		},
		/**
		 * @param {'paste'|'canvas'|'crop'} type 
		 */
		'showPanel':function(type){ 
			this.paste_wrap[type=="paste"?'show':'hide']();
			this.canvas_wrap[type=="canvas"?'show':'hide']();
			this.crop_wrap[type=="crop"?'show':'hide']();
			_btnEnabled(type=='paste'?false:true);
		}
	}

	// 초기 설정
	function _init() {
		_imgEdit = new ImageEditor();
		
		// 버튼 Event
		_bindBtnEvent();

		// Drop Event
		_bindDrop();

		// Paste Event
		_bindPaste();

		// selector
		_initSelectorEvent();

		// crop
		_initCropEvent();

		// Rotate
		_initRotateEvent();

		// Resize
		__initResizeEvent();

		// Text 
		_initTextEvent();

		// Shape
		_initShapeEvent();

		// Draw
		_initDrawEvent();
		
		$(window).on('resize', function() {			
			if(this.resizeTO) clearTimeout(this.resizeTO);
			this.resizeTO = setTimeout(function() {
				$(this).trigger('resizeEnd');
			}, 200);
		});
		$(window).on('resizeEnd', function(){
			_imgEdit.eventWindowResize();
		});

		$('select').selectbox();
	}

	function _navClick(id, obj) {
		if (obj && $(obj).hasClass('on')) return;
		for (var idx in _imgEdit.tools) {
			_imgEdit.tools[idx].removeHandler(function(){
				_navClick(id, obj);
			});
		}

		id&&_imgEdit.tools[id]&&_imgEdit.tools[id].createHandler();
		$('nav:eq(0)').find('.on').removeClass('on');
		if(obj) $(obj).addClass('on');
		if(obj) _imgEdit.status.activeMenu = id;
		if(!obj){
			_navClick('selector', $('.btn_selector'));
		}
	}

	function _navMenuClick(id, obj) {
		$('.contents nav .detail_menu').hide();
		$('.contents nav em.btn_sub.on').removeClass('on');
		if (id) $('.contents nav .' + id + '_menu').show();
		if (obj) $(obj).addClass('on');
	}

	/**
	 * 객체 삭제
	 */
	function deleteObjects() {
		var _canvas = _imgEdit.canvas;
		var activeObjects = _canvas.getActiveObjects();
		if (activeObjects) {
			_canvas.discardActiveObject();
			activeObjects.forEach(function (object) {
				_canvas.remove(object);
			});
			_imgEdit.history.add().save();
		}
	}

	/**
	 * selector
	 */
	function _initSelectorEvent(){
		var btn = $('.btn_selector');
		btn.attr('title', Trex._I18N.g('image_editor.selection_tool', "선택 도구"));
		btn.on('click', function (e) {
			_navMenuClick(null, null);
			_navClick('selector', btn);
			_imgEdit.canvas.discardActiveObject().renderAll();
			_imgEdit.canvas.selectable = true;
		});

		$(document.body).on('keydown', function (e) {
			if(e.keyCode == 46 && _imgEdit.status.activeMenu == 'selector') deleteObjects();
		});
	}

	/**
	 * Crop
	 */
	function _initCropEvent(){
		_imgEdit.tools['crop'] = new CropTools({
			main:_imgEdit,
			styleEl: {
				image:$('#crop_background_img'),
				selector:$('#canvas_crop_wrap .crop_selector_wrap')
			}
		});
		var btn = $('.btn_crop');
		btn.attr('title', Trex._I18N.g('image_editor.crop_tool', "자르기 도구"));
		btn.on('click', function (e) {
			_navMenuClick(null, null);
			_navClick('crop', btn);
			e.stopPropagation();
			e.preventDefault();
		});
	}

	/**
	 * Rotate
	 */
	function _initRotateEvent() {
		var btn = $('.btn_rotate');
		btn.attr('title', Trex._I18N.g('image_editor.rotate_tool', "회전 도구"));
		var btn_em = $('.btn_rotate_sub');
		btn.on('click', function (e) {
			_navMenuClick(null, null);
			_navClick(null, null);
			__canvasRotation(true);
		});
		btn_em.on('click', function (e) {
			if($(this).hasClass('disabled')) return;
			if ($(this).hasClass('on')) {
				_navClick(null, null);
				_navMenuClick(null, null);
			} else {
				_navClick('rotate', btn);
				_navMenuClick('rotate', btn_em);
			}
			e.stopPropagation();
			e.preventDefault();
		});		
		$('.btn_left_rotate').on('click', function(){
			__canvasRotation(false);
		});
		$('.btn_right_rotate').on('click', function(){
			__canvasRotation(true);
		});
	}

	/**
	 * Group 생성 회전 cw/ ccw
	 * @param {*} cw 
	 */
	function __canvasRotation(cw){
		var angle = cw?90:-90;
		var _imgAngle = _imgEdit.img.angle;
		_imgEdit.history.save();
		if(_imgAngle < 0) _imgAngle = 360 + _imgAngle;
		var imgAngle = (Math.round(Math.abs(_imgAngle)) + angle) % 360;
		_imgEdit.status.angle = imgAngle;

		_imgEdit.canvas.discardActiveObject();

		var group = new fabric.Group();
		_imgEdit.canvas.getObjects().map(function(o){
            group.addWithUpdate(o);
		});
		_imgEdit.canvas.add(group);
		group.rotate(angle);
		group.setCoords();
		_imgEdit.canvas.setActiveObject(group).renderAll();

		var rect = group.getBoundingRect();
		_imgEdit.setCanvasSize(rect.width, rect.height);
		_imgEdit.canvas.centerObject(group);
		group.setCoords();
		_imgEdit.canvas.setActiveObject(group).renderAll();

		_imgEdit.canvas.discardActiveObject();
		
		var items = group.getObjects();
		group.remove(items);
		_imgEdit.canvas.remove(group);
		group.destroy();
		_imgEdit.canvas.renderAll();
		_imgEdit.history.add(true, (function(_angle, w, h){
			return function(){
				_imgEdit.img = _imgEdit.canvas.item(0);
				_imgEdit.status.angle = _angle;
				_imgEdit.setCanvasSize(w, h);
			};
		})(imgAngle, rect.width, rect.height)).save();
	}

	/**
	 * Resize
	 */
	function __initResizeEvent() {
		_imgEdit.tools['resize'] = new ResizeTools({
			main:_imgEdit,
			styleEl: {
				width:$('.resize_menu #reize_width'),
				height:$('.resize_menu #reize_height'),
				ratio:$('.resize_menu .btn_ratio'),
				origin:$('.resize_menu .btn_original')
			}
		});
		var btn = $('.btn_resize');
		btn.attr('title', Trex._I18N.g('image_editor.resize_tool', "크기조정 도구"));
		$('.resize_menu .btn_ratio').attr('title', Trex._I18N.g('image_editor.resize_tool_ratio', "비율유지"));
		var btn_em = $('.btn_resize_sub');
		btn.on('click', function (e) {
			_navMenuClick(null, null);
			_navClick('resize', btn);
			e.stopPropagation();
			e.preventDefault();
		});
		btn_em.on('click', function (e) {
			if($(this).hasClass('disabled')) return;
			if ($(this).hasClass('on')) {
				_navMenuClick(null, null);
			} else {
				_navClick('resize', btn);
				_navMenuClick('resize', btn_em);
			}
			e.stopPropagation();
			e.preventDefault();
		});
	}

	/**
	 * Text
	 */
	function _initTextEvent() {
		_imgEdit.tools['text'] = new TextTools({
			main:_imgEdit,
			styleEl: {
				font: $('.text_menu #sel_font').attr('title', Trex._I18N.g('image_editor.type_tool_font', "글꼴")),
				size: $('.text_menu #sel_size').attr('title', Trex._I18N.g('image_editor.type_tool_size', "글자크기")),
				bold: $('.text_menu .btn_bold').attr('title', Trex._I18N.g('image_editor.type_tool_bold', "굵게")),
				italic: $('.text_menu .btn_italic').attr('title', Trex._I18N.g('image_editor.type_tool_italic', "기울임")),
				underline: $('.text_menu .btn_underline').attr('title', Trex._I18N.g('image_editor.type_tool_underline', "밑줄")),
				color: $('.text_menu .btn_txt_color').attr('title', Trex._I18N.g('image_editor.type_tool_forecolor', "글자색")),
				bg_color: $('.text_menu .btn_bg_color').attr('title', Trex._I18N.g('image_editor.type_tool_backcolor', "글자 배경색"))
			}
		});
		var btn = $('.btn_text');
		btn.attr('title', Trex._I18N.g('image_editor.type_tool', "문자 도구"));
		var btn_em = $('.btn_text_sub');
		btn.on('click', function (e) {
			_navMenuClick(null, null);
			_navClick('text', btn);
		});
		btn_em.on('click', function (e) {
			if($(this).hasClass('disabled')) return;
			if ($(this).hasClass('on')) {
				_navMenuClick(null, null);
			} else {
				_navClick('text', btn);
				_navMenuClick('text', btn_em);
			}
			e.stopPropagation();
			e.preventDefault();
		});
	}

	/**
	 * Shape
	 */
	function _initShapeEvent(){
		_imgEdit.tools['shape'] = new ShapeTools({
			main:_imgEdit,
			styleEl: {
				main:$('.btn_shape'),
				rect:$('.shape_menu .btn_rect').attr('title', Trex._I18N.g('image_editor.ractangle_tool', "사각형 도구")),
				round_rect:$('.shape_menu .btn_round_rect').attr('title', Trex._I18N.g('image_editor.rounded_ractangle_tool', "둥근 사각형 도구")),
				circle:$('.shape_menu .btn_circle').attr('title', Trex._I18N.g('image_editor.ellipse_tool', "타원 도구")),
				line:$('.shape_menu .btn_line').attr('title', Trex._I18N.g('image_editor.line_tool', "라인 도구")),
				bg_color:$('.shape_menu .btn_shape_bg_color').attr('title', Trex._I18N.g('image_editor.background_color', "배경색")),
				bg_color_span:$('.shape_menu #btn_shape_bg_color_span'),
				size:$('.shape_menu .select.s_size'),
				style:$('.shape_menu .select.s_style'),
				line_color:$('.shape_menu .btn_shape_line_color').attr('title', Trex._I18N.g('image_editor.border_color', "선 색")),
				line_color_span:$('.shape_menu #btn_shape_line_color_span')
			}
		});
		var btn = $('.btn_shape');
		btn.attr('title', Trex._I18N.g('image_editor.ractangle_tool', "사각형 도구"));
		var btn_em = $('.btn_shape_sub');
		btn.on('click', function (e) {
			_navMenuClick(null, null);
			_navClick('shape', btn);
		});
		btn_em.on('click', function (e) {
			if($(this).hasClass('disabled')) return;
			if ($(this).hasClass('on')) {
				_navMenuClick(null, null);
			} else {
				_navClick('shape', btn);
				_navMenuClick('shape', btn_em);
			}
			e.stopPropagation();
			e.preventDefault();
		});
	}

	/**
	 * Draw
	 */
	function _initDrawEvent(){
		_imgEdit.tools['draw'] = new DrawTools({
			main:_imgEdit,
			styleEl: {
				main:$('.btn_draw'),
				pencil:$('.draw_menu .btn_pencil').attr('title', Trex._I18N.g('image_editor.pencil_tool', "연필 도구")),
				pen:$('.draw_menu .btn_pen').attr('title', Trex._I18N.g('image_editor.marker_tool', "마커 도구")),
				brush:$('.draw_menu .btn_brush').attr('title', Trex._I18N.g('image_editor.crayon_tool', "크레용 도구")),
				// eraser:$('.draw_menu .btn_eraser'),
				color:$('.draw_menu .btn_color').attr('title', Trex._I18N.g('image_editor.draw_color', "색상")),
				color_span:$('.draw_menu #draw_span_color'),
				brush_size:$('.draw_menu .brush_size'),
				wrap_size:$('.draw_menu .wrap_size'),
				size_drag:$('.draw_menu .btn_drag'),
				size_input:$('.draw_menu #draw_brush_size'),
				size_text:$('.draw_menu #size_text'),
				drag_objs:$('.draw_menu .wrap_size, .draw_menu #size_text, .draw_menu .btn_drag')
			}
		});
		var btn = $('.btn_draw');
		btn.attr('title', Trex._I18N.g('image_editor.pencil_tool', "연필 도구"));
		var btn_em = $('.btn_draw_sub');
		btn.on('click', function (e) {
			_navMenuClick(null, null);
			_navClick('draw', btn);
		});
		btn_em.on('click', function (e) {
			if($(this).hasClass('disabled')) return;
			if ($(this).hasClass('on')) {
				_navMenuClick(null, null);
			} else {
				_navClick('draw', btn);
				_navMenuClick('draw', btn_em);
			}
			e.stopPropagation();
			e.preventDefault();
		});
	}

	/**
	 * 버튼 Event
	 */
	function _bindBtnEvent() {
		// 이미지 삽입
		$('.btn_image').on('click', function () {
			$('#imagefile').click();
		});

		// 본문 더블클릭
		$('#default_canvas').on('dblclick', function () {
			$('#imgfile').click();
		});

		// PC 저장
		$('.btn_pc').on('click', function () {
			_save_image();
		});

		// 본문 삽입
		$('.btn_insert').on('click', function () {
			_insert_editor_body();
		});

		// input type = file
		$('#imgfile').on('change', function () {
			image_load(this.files);
		});
	}

	/**
	 * Image Drop
	 */
	function _bindDrop() {
		// $('#default_canvas').on('dragover', function(e){
		$(window.document).on('dragover', function (e) {
			var b;
			b = e.originalEvent, b.stopPropagation(), b.preventDefault();
		});
		$(window.document).on('dragenter', function (e) {
			var b;
			b = e.originalEvent, b.stopPropagation(), b.preventDefault();
		});
		$(window.document).on('dragleave', function (e) {
			var b;
			b = e.originalEvent, b.stopPropagation(), b.preventDefault();
		});
		// $('#default_canvas').on('drop', function(e){
		$(window.document).on('drop', function (e) {
			var b;
			b = e.originalEvent, b.stopPropagation(), b.preventDefault();
			var files = b.dataTransfer && b.dataTransfer.files;
			files && /*(1 !== files.length ? alert(Trex._I18N.g('image_editor.drop_alert', '한 개의 이미지만 처리 가능합니다')) :*/
			 image_load(files); //);
		});
	}

	/**
	 * Image Paste
	 */
	function _bindPaste() {
		function _getImageFile(ev) {
			var clip, len, file = null;
			if (clip = ev.clipboardData, clip && clip.items && (len = clip.items.length), "undefined" != typeof clip && len > 0) {
				for (var g = 0; g < len; g++) {
					var item = clip.items[g];
					if (item.type.indexOf("image") > -1) {
						file = item.getAsFile();
						break;
					}
				}
			} else if (clip = window.clipboardData, clip && clip.files && (len = clip.files.length), "undefined" != typeof clip && len > 0) {
				for (var g = 0; g < len; g++) {
					var item = clip.files[g];
					if (item.type.indexOf("image") > -1) {
						file = item;
						break;
					}
				}
			} else if(isIE && window.ImageUploader) {
				var data = window.ImageUploader.getClipboardData();
				if (!data) return false;
				var json = null;
				try {
					json = eval("(" + data + ")");
				} catch (e) {
					// console.log('json parse error', e);
					return false;
				}
				// Word인 경우 이미지 삭제 (배경색이 검은색으로 됨)
				if (json.type == "multi" && json.data.html && json.data.image){
					var _html = json.data.html;
					if(_html.search(/urn\:schemas\-microsoft\-com\:office\:word/i) != -1){
						json.data.image = null;
					}
				}
				if (json.type == "image" || (json.type == "multi" && json.data.image)){
					var _data = json.type == "multi"?json.data.image:json.data;
					file = _data[0].dataURL;
					_createImgObject(file);
					return true;
				}
			}
			if (file) {
				var render = new FileReader();
				render.onload = function (e) {
					_createImgObject(e.target.result);
				}
				render.readAsDataURL(file);
				return true;
			}
			return false;
		}
		if (isIE) {
			/**
			 * IE는 body에 clipboard 이미지 붙여넣기 Event가 실행되지 않으므로 편집가능 div로 focus이동.
			 */
			var _pateEl = $('.ie_paste');
			$(document.body).on('keydown', function (e) {
				var ev = e.originalEvent;
				if (ev.keyCode == 86 && ev.ctrlKey) _pateEl.focus();
			});
			_pateEl.on('paste', function (e) {
				if (_getImageFile(e.originalEvent)) {
					e.stopPropagation();
					e.preventDefault();
					return false;
				}
			});
		} else {
			$(document.body).on('paste', function (e) {
				if (_getImageFile(e.originalEvent)) {
					e.stopPropagation();
					e.preventDefault();
					return false;
				}
			});
		}
	}

	/**
	 * Base64 to Blob
	 * @param {*} base64 
	 * @param {*} contentType 
	 * @param {*} sliceSize 
	 */
	function base64ToBlob(base64, contentType, sliceSize) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(base64);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);
			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			var byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
		var blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}

	/**
	 * 이미지 PC 저장
	 */
	function _save_image() {
		_navMenuClick(null, null);
		_navClick(null, null);
		var src = _imgEdit.canvas.toDataURL('png');
		var reg = /data\:(image\/[^;]+)\;base64\,/i;
		var info = src.substring(0, src.indexOf(','));
		var data = src.substring(src.indexOf(',') + 1);
		var type = info.split(":")[1].split(";")[0];
		var blob = base64ToBlob(data, type);
		saveAs(blob, 'imageeditor_' + (new Date()).getTime().toString(16) + '.png');
	}

	/**
	 * 이미지 Editor 본문에 삽입
	 */
	function _insert_editor_body() {
		if(_imgEdit.tools['crop'] && _imgEdit.tools['crop'].activeTools){
			_imgEdit.tools['crop'].removeHandler(function(){
				_insert_editor_body();
			});
			return;
		}
		_navMenuClick(null, null);
		_navClick(null, null);
		var imgurl = _imgEdit.canvas.toDataURL('png');
		if(Trex._TI && Trex._TI.img){
			Trex._TI.img.src = imgurl;
			Trex._TI.img.width = _imgEdit.canvas.getWidth();
			Trex._TI.img.height = _imgEdit.canvas.getHeight();
			Trex._TI.img.style.width = _imgEdit.canvas.getWidth() + 'px';
			Trex._TI.img.style.height = _imgEdit.canvas.getHeight() + 'px';
			try{if(Trex.KEditor) Trex.KEditor.editor.getCanvas().history.saveHistory();}catch(e){}
			closeWindow();
		}else{
			var img = {
				'imageurl': imgurl
				, 'filename': 'imageeditor_' + (new Date()).getTime().toString(16) + '.png'
				, 'filesize': 10
				, 'imagealign': 'L'
				, 'originalurl': imgurl
				, 'thumburl': imgurl
			}
			done(img);
		}
	}

	/**
	 * 기본 버튼 활성화/비활성화
	 * @param {*} flag 
	 */
	function _btnEnabled(flag) {
		$('.btn_insert, .btn_pc, .btn_selector, .btn_crop, .btn_rotate, .btn_resize, .btn_text, .btn_shape, .btn_draw')
		[flag ? 'removeClass' : 'addClass']('disabled')
		[flag ? 'removeAttr' : 'attr']('disabled', 'disabled')
		.removeClass('on');
		$('nav .btn_sub')
		[flag ? 'removeClass' : 'addClass']('disabled');
		if(flag) $('.btn_selector').addClass('on');
	}

	/**
	 * Canvas에 이미지 로드
	 * @param {*} data 
	 */
	function _createImgObject(data, preventHistory, resize_info, _callback) {
		var wrap_width = $('#canvas_wrap').width(),
			wrap_height = $('#canvas_wrap').height();

		IMAGE = new Image();
		var opt = $.extend({}, DEF_OPT, { sizeType: 'original' });
		// opt = {};
		IMAGE.onload = function () {
			_navClick(null, null);
			_navMenuClick(null, null);
			_imgEdit.img = new fabric.Image(IMAGE, opt);
			_imgEdit.canvas.clear();
			_imgEdit.originImgInfo = { width: IMAGE.width, height: IMAGE.height };
			_imgEdit.canvas.setDimensions({ width: IMAGE.width, height: IMAGE.height });
			_imgEdit.canvas.add(_imgEdit.img).setActiveObject(_imgEdit.img);			
			_imgEdit.img.set('selectable', false);	//이미지 선택 안되도록 처리
			if(resize_info){
				if(resize_info.width) _imgEdit.img.scaleX = resize_info.width / IMAGE.width;
				if(resize_info.height) _imgEdit.img.scaleY = resize_info.height / IMAGE.height;
				_imgEdit.img.setCoords();
				_imgEdit.canvas.setDimensions({ width: resize_info.width, height: resize_info.height });
			}
			_imgEdit.canvas.discardActiveObject().renderAll();
			if(preventHistory !== true) {
				_imgEdit.history.add(false, (function(_IMG, _opt, _resize){
					return function(){
						_imgEdit.img = new fabric.Image(_IMG, _opt);
						_imgEdit.canvas.clear();
						_imgEdit.originImgInfo = { width: _IMG.width, height: _IMG.height };
						_imgEdit.canvas.setDimensions({ width: _IMG.width, height: _IMG.height });
						_imgEdit.canvas.add(_imgEdit.img).setActiveObject(_imgEdit.img);			
						_imgEdit.img.set('selectable', false);	//이미지 선택 안되도록 처리
						if(_resize){
							if(_resize.width) _imgEdit.img.scaleX = _resize.width / _IMG.width;
							if(_resize.height) _imgEdit.img.scaleY = _resize.height / _IMG.height;
							_imgEdit.img.setCoords();
							_imgEdit.canvas.setDimensions({ width: _resize.width, height: _resize.height });
						}
						_imgEdit.canvas.discardActiveObject().renderAll();
						_imgEdit.showPanel('canvas');
					};
				})(IMAGE, opt, resize_info)).save();
			}else{
				_imgEdit.history.defaultStatus(false, (function(_IMG, _opt, _resize){
					return function(){
						_imgEdit.img = new fabric.Image(_IMG, _opt);
						_imgEdit.canvas.clear();
						_imgEdit.originImgInfo = { width: _IMG.width, height: _IMG.height };
						_imgEdit.canvas.setDimensions({ width: _IMG.width, height: _IMG.height });
						_imgEdit.canvas.add(_imgEdit.img).setActiveObject(_imgEdit.img);			
						_imgEdit.img.set('selectable', false);	//이미지 선택 안되도록 처리
						if(_resize){
							if(_resize.width) _imgEdit.img.scaleX = _resize.width / _IMG.width;
							if(_resize.height) _imgEdit.img.scaleY = _resize.height / _IMG.height;
							_imgEdit.img.setCoords();
							_imgEdit.canvas.setDimensions({ width: _resize.width, height: _resize.height });
						}
						_imgEdit.canvas.discardActiveObject().renderAll();
						_imgEdit.showPanel('canvas');
					};
				})(IMAGE, opt, resize_info));
			}
			_imgEdit.showPanel('canvas');
			if(_callback) _callback();
		}
		IMAGE.src = data;
	}

	/**
	 * 이미지 로드
	 * @param {*} files 
	 */
	function image_load(files) {
		var file = files[0];
		var filepath = document.getElementById("imgfile").value;
		if (!file.type.match(/image.*/)) {
			return void alert(Trex._I18N.g('image_editor.alert_not_image', "이미지 파일이 아닙니다"));
		}
		var reader = new FileReader();
		reader.onload = function (e) {
			_createImgObject(e.target.result);
		}
		reader.readAsDataURL(file);
	}
	window.imageEditorInit = function(){
		_init();
	};
})();