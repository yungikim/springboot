function CropTools(opt){
	this.initialize(opt);
}

CropTools.prototype = {
	initialize: function (opt) {
		var _self = this;
		var _opt = opt || {};
		this.ROTATION_BUTTON_AREA = 0;//50;
		this.LR_MARGIN = 200;
		this.TB_MARGIN = 40;
        this.main = _opt.main;
		this.styleEl = _opt.styleEl || {};
		this.canvas = this.main.crop_canvas;
		this.canvas.selectable = false;
		this.bgImage = this.styleEl.image;
		this.selector = this.styleEl.selector;
		this.image = null;		
		this.imageOriginBound = null;
		this.imageBound = null;
		this.cropBound = {top:0,left:0,width:0,height:0};
		this.bgImageBound = null;
		this.processing = null;
		var map = {
			'lt':{'m':'xy'},
			'mt':{'m':'y'},
			'rt':{'m':'xy'},
			'lm':{'m':'x'}, 
			'rm':{'m':'x'}, 
			'lb':{'m':'xy'}, 
			'mb':{'m':'y'}, 
			'rb':{'m':'xy'}};
		this.canvas.clipTo = function(ctx){
			_self.clipTo(ctx);
		}
		this.cropAction = null;
		this._guide = {
			'resize':$('.resize_guide', this.selector),
			'rotation':$('.rotation_guide', this.selector)
		};
		$(window).on('mousemove', function(e){
			if(!_self.cropAction) return;
			var ac = _self.cropAction;
			ac.ox = e.pageX - ac.x;
			ac.oy = e.pageY - ac.y;
			if(ac.type != 'pos') _self.crop(e);
			else _self.move(e);
			e.preventDefault();
			e.stopPropagation();
		});
		$(window).on('mouseup', function(e){
			if(!_self.cropAction) return;
			var ac = _self.cropAction;
			ac.rx = (_self.cropBound.width / _self.cropBound.height);
			ac.ry = (_self.cropBound.height / _self.cropBound.width);
			if(ac.type != 'pos') _self.resizeCropZone(e);
			_self.bgImage.css('transition-duration', '0.25s');
			_self._guide[_self.cropAction.guide].removeClass('enabled');
			_self.bgImage.removeClass('enabled');
			_self.cropAction = null;
			e.preventDefault();
			e.stopPropagation();
		});
		$('.selector', this.selector).on('mousedown', function(e){
			var t = $(this).attr('crop_type');
			_self.cropAction = {
				type:t, info:map[t], 
				guide:'resize', 
				x:e.pageX, 
				y:e.pageY, 
				rx:(_self.cropBound.width / _self.cropBound.height),
				ry:(_self.cropBound.height / _self.cropBound.width)
			};
			_self._guide[_self.cropAction.guide].addClass('enabled');
			_self.bgImage.addClass('enabled');
			e.preventDefault();
			e.stopPropagation();
		});
		$(this.selector).on('mousedown', function(e){
			_self.cropAction = {
				type:'pos', 
				guide:'resize', 
				x:e.pageX, 
				y:e.pageY, 
				rx:(_self.cropBound.width / _self.cropBound.height),
				ry:(_self.cropBound.height / _self.cropBound.width)
			};
			_self._guide[_self.cropAction.guide].addClass('enabled');
			_self.bgImage.addClass('enabled');
			e.preventDefault();
			e.stopPropagation();
		});
	},
	createHandler: function () {
		var _self = this;
		this.activeTools = true;
		this._initSize = false;
		var imgData = this.main.canvas.toDataURL('png');		
		this.main.showPanel('crop');
		this.main.setCropCanvasSize();
		this.bgImage.attr('src', imgData);
		this.canvas.clear().renderAll();
		
		this.canvas.setBackgroundImage(imgData, function(){
			var img = _self.canvas.backgroundImage;
			_self.image = img;
			_self.imageOriginBound = img.getBoundingRect();
			img.hasControls = false;
			img.hasBorder = false;
			img.selectable  = false;
			_self.canvas.add(img);
			_self.initCalculateSize();
			_self.canvas.selectable = false;
		}, { originX: 'center', originY: 'center', selectable:false });
    },
	removeHandler: function(callback) {
		if (!this.activeTools) return;
		this.activeTools = false;
		this.apply(callback);
		this.canvas.clear().renderAll();
		this.main.showPanel('canvas');
	},
	apply:function(callback){
		var _self = this;
		var sel = _self.selector;
		var img = _self.image;
		img.setCoords();
		var imgB = img.getBoundingRect(true, true);
		var cropB = _self.cropBound;
		img.scaleX = img.scaleY = 1;
		img.setCoords();
		var imgB2 = img.getBoundingRect(true, true);
		_self.canvas.renderAll();

		var offset_scale = 1;
		var offset_width = 0;
		var offset_height = 0;
		offset_scale = imgB2.width / imgB.width;
		offset_width = (cropB.width * offset_scale) - cropB.width;
		offset_height = (cropB.height * offset_scale) - cropB.height;
		var n_sel = {
			'width':cropB.width + offset_width, 
			'height':cropB.height + offset_height, 
			'top':imgB.top + ((cropB.top - imgB.top) * offset_scale),
			'left':imgB.left + ((cropB.left - imgB.left) * offset_scale)
		};
		var n_img = {
			'scale_width':imgB2.width - imgB.width,
			'scale_height':imgB2.height - imgB.height
		};
		n_img.offset_top = -1 * (n_img.scale_height / 2);
		n_img.offset_left = -1 * (n_img.scale_width / 2);
		n_sel.top += n_img.offset_top  - imgB2.top;
		n_sel.left += n_img.offset_left - imgB2.left;

		/**
		 * 소수점 반올림
		 * Crop후 이미지가 미세하게 확대 축소가되는 문제 처리.
		 */
		n_sel.left = Math.round(n_sel.left);
		n_sel.top = Math.round(n_sel.top);
		n_sel.width = Math.round(n_sel.width);
		n_sel.height = Math.round(n_sel.height);

		_self.cropBound = null;
		_self.canvas.renderAll();

		this.main.loadData(img.toDataURL({
			format:'png',
			left:n_sel.left,
			top:n_sel.top,
			width:n_sel.width,
			height:n_sel.height
		}), callback);
	},
	resize:function(){
		if(this.activeTools) this.resizeCropZone();
	},
	clipTo:function(ctx){
		if(this.cropBound) ctx.rect(this.cropBound.left, this.cropBound.top, this.cropBound.width, this.cropBound.height);
	},
	crop:function(e){
		var _self = this;
		var ac = _self.cropAction;
		var offset = 0;		
		var bound = _self.cropBound;
		var __x, __y;
		// var limit = false;
		function _x(offset){
			var limit = false, ox, ol, oo;
			if(ac.type == 'lm' || ac.type == 'lt' || ac.type == 'lb'){
				// console.log(bound.left, offset, _self.imageBound.left);
				if(Math.round(bound.left + offset) < Math.round(_self.imageBound.left)){
					offset = _self.imageBound.left - bound.left;
					limit = true;
				}
				if(bound.width - offset < 24){
					offset = bound.width - 24;
					limit = true;
				}
				ox = -1 * offset;
				ol = offset;
			}else{
				if(_self.imageBound.left + _self.imageBound.width 
					<= bound.left + bound.width + offset) {
					offset = (_self.imageBound.left + _self.imageBound.width) - (bound.left + bound.width);
					limit = true;
				}
				if(bound.width + offset < 24){
					offset = 24 - bound.width;
					limit = true;
				}
				ox = offset;
				ol = null;
			}
			return {offset:ox, pos:ol, oo:(ac.type=="rt"||ac.type=="lb"?-1:1) * offset, limit:limit};
		}
		function _y(offset){
			var limit = false, oy, ot, oo;
			if(ac.type == 'mt' || ac.type == 'lt' || ac.type == 'rt'){
				if(Math.round(bound.top + offset) < Math.round(_self.imageBound.top)){
					offset = _self.imageBound.top - bound.top;
					limit = true;
				}
				if(bound.height - offset < 24){
					offset = bound.height - 24;
					limit = true;
				}
				oy = -1 * offset;
				ot = offset;
			}else{
				if(_self.imageBound.top + _self.imageBound.height 
					<= bound.top + bound.height + offset) {
					offset = (_self.imageBound.top + _self.imageBound.height) - (bound.top + bound.height);
					limit = true;
				}
				if(bound.height + offset < 24){
					offset = 24 - bound.height;
					limit = true;
				}
				oy = offset;
				ot = null;
			}
			return {offset:oy, pos:ot, oo:(ac.type=="rt"||ac.type=="lb"?-1:1) * offset, limit:limit};
		}
		if(ac.info.m == 'xy') {
			var scale = 0;			
			if(Math.abs(ac.ox) >= Math.abs(ac.oy)){
				__x = _x(ac.ox);
				__y = _y(ac.ry * __x.oo);
			}else{
				__y = _y(ac.oy);
				__x = _x(ac.rx * __y.oo);
			}
			if(__x.limit && __y.limit){
				if(__x.offset < __y.offset){
					__x = _x(ac.rx * __y.oo);
				}else{
					__y = _y(ac.ry * __x.oo);
				}
			}else if(__x.limit) {
				__y = _y(ac.ry * __x.oo);
			}else if(__y.limit) {
				__x = _x(ac.rx * __y.oo);
			}
		} else if(ac.info.m == 'x') {
			__x = _x(ac.ox);
		} else if(ac.info.m == 'y') {
			__y = _y(ac.oy);
		}
		if(!((__x && __x.limit) || (__y && __y.limit))){
			ac.x = e.pageX;
			ac.y = e.pageY;
		}
		if(__x) {
			bound.width += __x.offset;
			if(__x.pos) bound.left += __x.pos;
		}		
		if(__y) {
			bound.height += __y.offset;
			if(__y.pos) bound.top += __y.pos;
		}
		_self.selector.width(bound.width).height(bound.height).css({'top': (bound.top-2) +'px', 'left':(bound.left-2) + 'px'});
		_self.canvas.requestRenderAll();
	},
	move:function(e){
		var _self = this;
		var ac = _self.cropAction;
		var offset = 0;		
		var bound = _self.cropBound;
		var imgB = _self.imageBound;
		var img = _self.image;
		var bgImg = _self.bgImage;
		var bgB = _self.bgImageBound;
		var _xlimit = false, _ylimit = false;
		var _x = ac.ox, _y = ac.oy;
		console.log(imgB.top);
		
		if(imgB.top + _y > bound.top || imgB.height + imgB.top + _y <= bound.top + bound.height){
			_ylimit = true;
			_y = 0;
		}
		if(imgB.left + _x > bound.left || imgB.width + imgB.left + _x <= bound.left + bound.width){
			_xlimit = true;
			_x = 0;
		}
		img.top += _y;
		img.left += _x;
		bgB.translateX += _x;
		bgB.translateY += _y;
		bgImg.css('transition-duration', '0s');
		bgImg.css('transform', 'translate(' + (bgB.translateX) + 'px, ' + (bgB.translateY)  + 'px) scaleX(' + bgB.scale + ') scaleY(' + bgB.scale + ') rotate(' + bgB.rotate + 'rad) translateZ(0px)');
		if(!_xlimit) ac.x = e.pageX;
		if(!_ylimit) ac.y = e.pageY;
		
		img.setCoords();
		var bound = img.getBoundingRect(true, true);	
		_self.imageBound = $.extend(true, {}, bound);

		_self.canvas.requestRenderAll();
	},
	initCalculateSize:function(){
		var _self = this;
		if(!this.image) return;
		var img = _self.image;
		var bound = _self.imageOriginBound;
		var sel = _self.selector;
		var w = _self.canvas.getWidth();
		var h = _self.canvas.getHeight();
		var tw = w - this.LR_MARGIN;
		var th = h - this.TB_MARGIN;
		var ow = bound.width;
		var oh = bound.height;
		var scale = 1;
		
		if(tw / bound.width < th / bound.height){
			scale = tw / bound.width;
		}else{
			scale = th / bound.height;
		}
		img.scaleX = img.scaleY = scale;
		img.setCoords();
		bound = img.getBoundingRect();
		img.left = (w / 2) - _self.ROTATION_BUTTON_AREA;
		img.top = h / 2;
		var bgB = _self.bgImageBound = {
			translateX:(((w - ow) / 2) - _self.ROTATION_BUTTON_AREA),
			translateY:((h - oh) / 2),
			scale:scale,
			rotate:0
		};
		_self.bgImage.css('transform', 'translate(' + bgB.translateX + 'px, ' + bgB.translateY  + 'px) scaleX(' + bgB.scale + ') scaleY(' + bgB.scale + ') rotate(' + bgB.rotate + 'rad) translateZ(0px)');
		bound = img.getBoundingRect(true, true);
		_self.imageBound = $.extend(true, {}, bound);
		_self.cropBound = $.extend(true, {}, bound);

		sel.width(bound.width).height(bound.height).css({'top': (bound.top-2) +'px', 'left':(bound.left-2) + 'px'});
		_self.canvas.requestRenderAll();
		this._initSize = true;
	},
	resizeCropZone:function(e){
		if(!this._initSize) return;
		var _self = this;
		var ac = _self.cropAction;
		var sel = _self.selector;
		var img = _self.image;
		var bgImg = _self.bgImage;
		var originBound = _self.imageOriginBound;		
		var cropB = _self.cropBound;
		var bgB = _self.bgImageBound;
		var imgB = _self.imageBound;
		var w = _self.canvas.getWidth();
		var h = _self.canvas.getHeight();
		var tw = w - this.LR_MARGIN;
		var th = h - this.TB_MARGIN;
		var offset_scale = 1;
		var offset_width = 0;
		var offset_height = 0;
		if(tw / cropB.width < th / cropB.height){
			offset_scale = tw / cropB.width;			
		}else{
			offset_scale = th / cropB.height;			
		}
		offset_width = (cropB.width * offset_scale) - cropB.width;
		offset_height = (cropB.height * offset_scale) - cropB.height;
		bgB.scale *= offset_scale;
		var n_sel = {
			'width':cropB.width + offset_width, 
			'height':cropB.height + offset_height, 
			'top':imgB.top + ((cropB.top - imgB.top) * offset_scale),
			'left':imgB.left + ((cropB.left - imgB.left) * offset_scale)
		};
		var n_img = {
			'old_width':imgB.width,
			'old_height':imgB.height,
			'scale_width':(originBound.width * bgB.scale) - imgB.width,
			'scale_height':(originBound.height * bgB.scale) - imgB.height
		};
		n_img.offset_top = -1 * (n_img.scale_height / 2);
		n_img.offset_left = -1 * (n_img.scale_width / 2);
		n_sel.top += n_img.offset_top;
		n_sel.left += n_img.offset_left;

		var _left = (w / 2) - _self.ROTATION_BUTTON_AREA;
		var _top  = h / 2;
		var move_x = _left - (n_sel.left + (n_sel.width / 2));
		var move_y = _top - (n_sel.top + (n_sel.height / 2));

		bgB.translateX += move_x;
		bgB.translateY += move_y;
		n_sel.top += move_y;
		n_sel.left += move_x;

		bgImg.css('transition', '.25s all ease-in');
		sel.css('transition', '.25s all ease-in');
		sel.width(n_sel.width).height(n_sel.height).css({'top':(n_sel.top - 2) + 'px', 'left':(n_sel.left - 2) + 'px'});
		bgImg.css('transform', 'translate(' + (bgB.translateX) + 'px, ' + (bgB.translateY)  + 'px) scaleX(' + bgB.scale + ') scaleY(' + bgB.scale + ') rotate(' + bgB.rotate + 'rad) translateZ(0px)');
		img.animate({'top': (img.top + move_y), 'left': (img.left + move_x), 'scaleX':bgB.scale, 'scaleY':bgB.scale}, {
			duration: 250,
			onChange: function(){
				cropB.top = parseInt(sel.css('top'), 10) - 1;
				cropB.left = parseInt(sel.css('left'), 10) - 1;
				cropB.width = parseInt(sel.css('width'), 10);
				cropB.height = parseInt(sel.css('height'), 10);
				_self.canvas.renderAll();
			},
			onComplete: function () {
				sel.css('transition', '');
				bgImg.css('transition', '');
				cropB.top = n_sel.top;
				cropB.left = n_sel.left;
				cropB.width = n_sel.width;
				cropB.height = n_sel.height;
				img.setCoords();
				var bound = img.getBoundingRect(true, true);	
				_self.imageBound = $.extend(true, {}, bound);
				_self.canvas.renderAll();		
			}
		});
	}
};