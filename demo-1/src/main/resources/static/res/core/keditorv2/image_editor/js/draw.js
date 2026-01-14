(function (fabric) {

    fabric.MarkerBrush = fabric.util.createClass(fabric.PencilBrush, {

        color: "#000000",
        opacity: 1,
        width: 30,

        _baseWidth: 10,
        _lastPoint: null,
        _lineWidth: 3,
        _size: 0,

        initialize: function (canvas, opt) {
            opt = opt || {};

            this.canvas = canvas;
            this._points = [];
            this.width = opt.width || canvas.freeDrawingBrush.width;
            this.color = opt.color || canvas.freeDrawingBrush.color;
            this.opacity = opt.opacity || canvas.contextTop.globalAlpha;

            this.canvas.contextTop.lineJoin = 'round';
            this.canvas.contextTop.lineCap = 'round';
        },

        onMouseDown: function (pointer) {
            this._prepareForDrawing(pointer);
            this._captureDrawingPath(pointer);

            this._lastPoint = pointer;
            this.canvas.contextTop.strokeStyle = this.color;
            this.canvas.contextTop.lineWidth = this._lineWidth;
            this._size = this.width + this._baseWidth;
            this._render(pointer);
        },
        onMouseMove: function (pointer) {
            if (this.canvas._isCurrentlyDrawing) {
                this._captureDrawingPath(pointer);
                this._render(pointer);
            }
        },
        onMouseUp: function () {
            this.canvas.contextTop.globalAlpha = this.opacity;
            this._finalizeAndAddPath();
        },
        changeColor: function (color) {
            this.color = color;
        },
        changeOpacity: function (value) {
            this.opacity = value;
        },
        _render: function (pointer) {
            var ctx = this.canvas.contextTop, i, len,
                v = this.canvas.viewportTransform,
                p1 = this._points[0],
                p2 = this._points[1];

            ctx = this.canvas.contextTop;
            ctx.save();
            ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
            ctx.beginPath();
            for (i = 0, len = (this._size / this._lineWidth) / 2; i < len; i++) {
                var lineWidthDiff = (this._lineWidth - 1) * i;

                ctx.globalAlpha = 0.3 * this.opacity;
                ctx.moveTo(this._lastPoint.x + lineWidthDiff, this._lastPoint.y + lineWidthDiff);
                ctx.lineTo(pointer.x + lineWidthDiff, pointer.y + lineWidthDiff);
                ctx.stroke();
            }
            ctx.restore();
            this._lastPoint = new fabric.Point(pointer.x, pointer.y);
        },
        convertPointsToSVGPath: function (points) {
            var path = [], i, width = this.width / 1000,
                p1 = new fabric.Point(points[0].x, points[0].y),
                p2 = new fabric.Point(points[1].x, points[1].y),
                len = points.length;
            for (i = 1; i < len; i++) {
                for (var j = 0, len2 = (this._size / this._lineWidth) / 2; j < len2; j++) {
                    var lineWidthDiff = (this._lineWidth - 1) * j;
                    path.push('M ', p1.x + lineWidthDiff, ' ', p1.y + lineWidthDiff, ' ');
                    path.push('L ', p2.x + lineWidthDiff, ' ', p2.y + lineWidthDiff, ' ');
                }
                p1 = points[i];
                if ((i + 1) < points.length) {
                    p2 = points[i + 1];
                }
            }
            return path;
        },
        createPath: function (pathData) {
            var path = new fabric.Path(pathData, {
                fill: null,
                stroke: this.color,
                strokeWidth: this._lineWidth,
                strokeLineCap: this.strokeLineCap,
                strokeLineJoin: this.strokeLineJoin,
                strokeDashArray: this.strokeDashArray,
                opacity: 0.8 * this.opacity
                // opacity: this.opacity
            });
            var position = new fabric.Point(path.left + path.width / 2, path.top + path.height / 2);
            position = path.translateToGivenOrigin(position, 'center', 'center', path.originX, path.originY);
            path.top = position.y;
            path.left = position.x;
            if (this.shadow) {
                this.shadow.affectStroke = true;
                path.setShadow(this.shadow);
            }

            return path;
        }
    });
    fabric.Point.prototype.normalize = function (thickness) {
        if (null === thickness || undefined === thickness) {
            thickness = 1;
        }

        var length = this.distanceFrom({ x: 0, y: 0 });

        if (length > 0) {
            this.x = this.x / length * thickness;
            this.y = this.y / length * thickness;
        }

        return this;
    };
    fabric.util.getRandom = function (max, min) {
        min = min ? min : 0;
        return Math.random() * ((max ? max : 1) - min) + min;
    };

    fabric.util.clamp = function (n, max, min) {
        if (typeof min !== 'number') min = 0;
        return n > max ? max : n < min ? min : n;
    };
    fabric.CrayonBrush = fabric.util.createClass(fabric.SprayBrush, {
        _baseWidth: 2,
        _inkAmount: 10,
        _latestStrokeLength: 0,
        _point: null,
        _sep: 2,
        _size: 0,
        useIMAGE: true, /** rect group이 아닌 이미지로 처리 rect group 사용시 느리다.  */
        /**
       * Invoked on mouse down
       * @param {Object} pointer
       */
        onMouseDown: function (pointer) {
            this.sprayChunks.length = 0;
            this.canvas.clearContext(this.canvas.contextTop);
            this._size = this.width / 2 * this._baseWidth;
            this.set(pointer);
            this._setShadow();
            // this.addSprayChunk(pointer);
            // this.render();
        },

        /**
         * Invoked on mouse move
         * @param {Object} pointer
         */
        onMouseMove: function (pointer) {
            this.update(pointer);
            this.addSprayChunk(pointer);
            this.render();
        },

        onMouseUp: function () {
            var originalRenderOnAddRemove = this.canvas.renderOnAddRemove;
            this.canvas.renderOnAddRemove = false;
            var rects = [];
            var _self = this;
            for (var i = 0, ilen = this.sprayChunks.length; i < ilen; i++) {
                var sprayChunk = this.sprayChunks[i];

                for (var j = 0, jlen = sprayChunk.length; j < jlen; j++) {
                    
                    var _rect = {
                        width: sprayChunk[j].width,
                        height: sprayChunk[j].height,
                        left: sprayChunk[j].x,
                        top: sprayChunk[j].y,
                        originX: 'center',
                        originY: 'center',
                        fill: this.color
                    };
                    // _rect.width += _rect.width % 2 - 1;
                    // _rect.height += _rect.height % 2 - 1;
                    var rect = new fabric.Rect(_rect);
                    rect.setCustomImageSmoothing = _self._main.setImageSmoothing;
                    rect._CustomRender = rect.render;
                    rect.render = function(ctx){
                        this.setCustomImageSmoothing(ctx, false);
                        this._CustomRender(ctx);
                        this.setCustomImageSmoothing(ctx);
                    };
                    this.shadow && rect.setShadow(this.shadow);
                    rects.push(rect);
                }
            }

            if (this.optimizeOverlapping) {
                rects = this._getOptimizedRects(rects);
            }

            var group = new fabric.Group(rects, { originX: 'center', originY: 'center' });
            group.setCustomImageSmoothing = _self._main.setImageSmoothing;
            group._CustomRender = group.render;
            group.render = function(ctx){
                this.setCustomImageSmoothing(ctx, false);
                this._CustomRender(ctx);
                this.setCustomImageSmoothing(ctx);
            };
            group.set({left:Math.ceil(group.left), top:Math.ceil(group.top)});
            if(!this.useIMAGE){
                group.canvas = this.canvas;
                this.canvas.add(group);
                this.canvas.fire('path:created', { path: group });
                
                this.canvas.clearContext(this.canvas.contextTop);
                this._resetShadow();
                this.canvas.renderOnAddRemove = originalRenderOnAddRemove;
                this.canvas.requestRenderAll();
            }else{
                var imgData = group.toDataURL('png');
                fabric.Image.fromURL(imgData, function(img){
                    img.left = group.left;
                    img.top = group.top;
                    /**
                     * fabric.Image._render override
                     * ImageSmoothing 효과 제거를 위함.
                     */
                    img.setCustomImageSmoothing = _self._main.setImageSmoothing;
                    img._CustomRender = img.render;
                    img.render = function(ctx){
                        this.setCustomImageSmoothing(ctx, false);
                        this._CustomRender(ctx);
                        this.setCustomImageSmoothing(ctx);
                    };
                    _self.canvas.add(img);
                    _self.canvas.fire('path:created', { path: img });                    
                    _self.canvas.clearContext(_self.canvas.contextTop);
                    _self._resetShadow();
                    _self.canvas.renderOnAddRemove = originalRenderOnAddRemove;
                    _self.canvas.requestRenderAll();
                }, { originX: 'center', originY: 'center' });
            }
        },

        set: function (p) {
            if (this._point == null) this._point = new fabric.Point(0, 0);
            if (this._latest) {
                this._latest.setFromPoint(this._point);
            } else {
                this._latest = new fabric.Point(p.x, p.y);
            }
            fabric.Point.prototype.setFromPoint.call(this._point, p);
        },

        update: function (p) {
            this.set(p);
            this._latestStrokeLength = this._point.subtract(this._latest).distanceFrom({ x: 0, y: 0 });
        },

        render: function () {
            var ctx = this.canvas.contextTop;
            ctx.fillStyle = this.color;

            var v = this.canvas.viewportTransform, i, len;
            ctx.save();
            ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);

            for (i = 0, len = this.sprayChunkPoints.length; i < len; i++) {
                var point = this.sprayChunkPoints[i];
                if (typeof point.opacity !== 'undefined') {
                    ctx.globalAlpha = point.opacity;
                }
                // ctx.globalAlpha = 0.7;
                ctx.fillRect(point.x, point.y, point.width, point.height);
            }
            ctx.restore();
        },

        addSprayChunk: function (pointer) {
            this.sprayChunkPoints = [];

            var x, y, width, radius = this.width / 2, i;

            var v = this._point.subtract(this._latest);
            var s = Math.ceil(this._size / 2);
            var stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
            v.normalize(s);

            var dotSize = this._sep * fabric.util.clamp(this._inkAmount / this._latestStrokeLength * 3, 1, 0.5);
            var dotNum = Math.ceil(this._size * this._sep);

            var range = this._size / 2;

            for (var i = 0; i < dotNum; i++) {
                for (var j = 0; j < stepNum; j++) {
                    var p = this._latest.add(v.multiply(j));
                    var r = fabric.util.getRandom(range);
                    var c = fabric.util.getRandom(Math.PI * 2);
                    var w = fabric.util.getRandom(dotSize, dotSize / 2);
                    var h = fabric.util.getRandom(dotSize, dotSize / 2);
                    var x = p.x + r * Math.sin(c) - w / 2;
                    var y = p.y + r * Math.cos(c) - h / 2;

                    var point = new fabric.Point(x, y);
                    point.width = w;
                    point.height = h;
                    // point.width = Math.round(w);
                    // point.height = Math.round(h);
                    // point.x = Math.round(x);
                    // point.y = Math.round(y);
                    if (this.randomOpacity) {
                        point.opacity = fabric.util.getRandomInt(0, 100) / 100;
                    }
                    this.sprayChunkPoints.push(point);
                }
            }
            this.sprayChunks.push(this.sprayChunkPoints);
        }
    });

})(fabric);


function DrawTools(opt) {
    this.initialize(opt);
}

DrawTools.prototype = {
    initialize: function (opt) {
        var _opt = opt || {};
        var _self = this;
        this.main = _opt.main;
        this.styleEl = _opt.styleEl || {};
        var brush_size = this.styleEl.brush_size;
        var brush_size_wrap = this.styleEl.wrap_size;
        var brush_size_text = this.styleEl.size_text;
        var brush_text = this.styleEl.size_input;
        this.styleEl.pencil && this.styleEl.pencil.on('click', function () {
            if ($(this).hasClass('on')) return;
            _self.changeType('pencil', $(this).attr('title'));
        });
        this.styleEl.pen && this.styleEl.pen.on('click', function () {
            if ($(this).hasClass('on')) return;
            _self.changeType('pen', $(this).attr('title'));
        });
        this.styleEl.brush && this.styleEl.brush.on('click', function () {
            if ($(this).hasClass('on')) return;
            _self.changeType('brush', $(this).attr('title'));
        });
        if (this.styleEl.color && _self.styleEl.color[0].jscolor) {
            _self.styleEl.color[0].jscolor.eventChangeValue = function (color, flag) {
                _self.changeColor();
            };
        }
        this.styleEl.color && this.styleEl.color.on('click', function (e) {
            this.jscolor && this.jscolor.show();
        });
        this.styleEl.color_span && this.styleEl.color_span.on('click', function (e) {
            _self.styleEl.color[0].jscolor && _self.styleEl.color[0].jscolor.show();
        });
        this.styleEl.drag_objs && this.styleEl.drag_objs.on('mousedown', function (e) {
            _self.slider = true;
            _self.origX = e.clientX;
            _self.origY = e.clientY;
            return false;
        });
        brush_text.on('keyup', function () {
            var val = parseInt(this.value, 10);
            if (isNaN(val)) this.value = '';
            if (this.value == '') return true;
            if (val > 30) this.value = '30';
            else if (val < 1) this.value = '1';
            val = parseInt(this.value, 10);
            _setSizeDrag(val);
        });
        brush_text.on('blur', function () {
            var val = parseInt(this.value, 10);
            if (isNaN(val)) this.value = '1';
            else if (val > 30) this.value = '30';
            else if (val < 1) this.value = '1';
            val = parseInt(this.value, 10);
            _setSizeDrag(val);
        });
        $(window).on('mousemove', function (e) {
            if (_self.slider) _sizeDrag(e);
        });
        $(window).on('mouseup', function () {
            _self.slider = false;
        });
        function _setSizeDrag(val) {
            var unit = (brush_size.width() - 5) / 30;
            var cal = val == 1 ? 0 : unit * val;
            brush_size_text.text(val);
            brush_text.val(val);
            brush_size_wrap.css('left', cal + 'px');
            _self.changeBrushSize();
        }
        function _sizeDrag(e) {
            if (e.clientX == 0) return;
            if (Math.abs(_self.origX - e.clientX) < 3) return;

            var min = brush_size.offset().left,
                max = brush_size.offset().left + brush_size.width() - 5,
                left = brush_size_wrap.position().left,
                unit = (brush_size.width() - 5) / 30,
                cal, size;
            if (e.clientX <= min) {
                cal = 0;
            } else if (e.clientX >= max) {
                cal = brush_size.width() - 5;
            } else {
                cal = e.clientX - min;
            }
            cal = parseInt(cal, 10);
            size = parseInt(Math.round(cal / unit), 10);
            size++;
            size = (size > 30 ? 30 : size);

            brush_size_text.text(size);
            brush_text.val(size);
            brush_size_wrap.css('left', cal + 'px');
            _self.changeBrushSize();
        }
        _setSizeDrag(5);
        this.createBrush();
        this.changeBrushSize();
        this.changeColor();

        this.isDown = false;
        this.type = 'pencil';
        this.lineWidth = null;
        this.lineStyle = null;
        this.lineColor = null;
        this.bgColor = null;
        this.origX = null;
        this.origY = null;
        this.activeObject = null;
    },
    createHandler: function () {
        this.activeTools = true;
        this.main.canvas.selection = false;
        if (this.main.img && this.main.img.hoverCursor) {
            this.main.img.hoverCursor = 'crosshair';
        }
        this.main.canvas.isDrawingMode = true;
    },
    removeHandler: function () {
        if (!this.activeTools) return;
        this.activeTools = false;
        if (this.main.img && this.main.img.hoverCursor) {
            this.main.img.hoverCursor = 'default';
        }
        this.main.canvas.isDrawingMode = false;
        this.main.canvas.selection = true;
    },
    changeType: function (type, title) {
        $(this.styleEl.main).removeClass('btn_' + this.type);
        this.styleEl[this.type].removeClass('on');
        this.type = type;
        this.styleEl[this.type].addClass('on');
        $(this.styleEl.main).addClass('btn_' + this.type).attr('title', title);
        this.createBrush();
    },
    changeColor: function () {
        var color = this.styleEl.color_span[0].style.backgroundColor;
        this.main.canvas.freeDrawingBrush.color = color;
        if (this.main.canvas.freeDrawingBrush.changeColor) {
            this.main.canvas.freeDrawingBrush.changeColor(color);
        }
    },
    changeBrushSize: function () {
        this.main.canvas.freeDrawingBrush.width = this.lineWidth = parseInt(this.styleEl.size_input.val(), 10) || 1;
    },
    getPosition: function (e) {
        var pointer = canvas.getPointer(e.e);
        return { x: pointer.x, y: pointer.y };
    },
    createBrush: function () {
        switch (this.type) {
            case 'pencil':
                this.pencil();
                break;
            case 'pen':
                this.pen();
                break;
            case 'brush':
                this.brush();
                break;
        }
    },
    pencil: function () {
        var brush = new fabric.PencilBrush(this.main.canvas);
        this.main.canvas.freeDrawingBrush = brush;
        this.changeColor();
        this.changeBrushSize();
    },
    pen: function () {
        this.changeColor();
        this.changeBrushSize();

        var brush = new fabric.MarkerBrush(this.main.canvas, {
            width: this.main.canvas.freeDrawingBrush.width,
            color: this.main.canvas.freeDrawingBrush.color
        });

        this.main.canvas.freeDrawingBrush = brush;
    },
    brush: function () {
        var brush = new fabric.CrayonBrush(this.main.canvas, {
        });  
        brush._main = this.main;      
        this.main.canvas.freeDrawingBrush = brush;
        this.changeColor();
        this.changeBrushSize();
    }
}