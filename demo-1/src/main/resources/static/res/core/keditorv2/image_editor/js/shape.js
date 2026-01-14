function ShapeTools(opt) {
    this.initialize(opt);
}

ShapeTools.prototype = {
    initialize: function (opt) {
        var _opt = opt || {};
        var _self = this;
        this.main = _opt.main;
        this.styleEl = _opt.styleEl || {};

        this.styleEl.rect.on('click', function () {
            if ($(this).hasClass('on')) return;
            _self.changeType('rect', $(this).attr('title'));
        });
        this.styleEl.round_rect.on('click', function () {
            if ($(this).hasClass('on')) return;
            _self.changeType('round_rect', $(this).attr('title'));
        });
        this.styleEl.circle.on('click', function () {
            if ($(this).hasClass('on')) return;
            _self.changeType('circle', $(this).attr('title'));
        });
        this.styleEl.line.on('click', function () {
            if ($(this).hasClass('on')) return;
            _self.changeType('line', $(this).attr('title'));
        });
        this.styleEl.bg_color.on('click', function (e) {
            this.jscolor && this.jscolor.show();
        });
        this.styleEl.line_color.on('click', function (e) {
            this.jscolor && this.jscolor.show();
        });
        this.styleEl.bg_color_span.on('click', function (e) {
            _self.styleEl.bg_color[0].jscolor && _self.styleEl.bg_color[0].jscolor.show();
        });
        this.styleEl.line_color_span.on('click', function (e) {
            _self.styleEl.line_color[0].jscolor && _self.styleEl.line_color[0].jscolor.show();
        });

        this.isDown = false;
        this.type = 'rect';
        this.lineWidth = null;
        this.lineStyle = null;
        this.lineColor = null;
        this.bgColor = null;
        this.origX = null;
        this.origY = null;
        this.activeObject = null;
        this.colorEl = this.styleEl.bg_color_span[0];
        this.lineColorEl = this.styleEl.line_color_span[0];
    },
    createHandler: function () {
        this.activeTools = true;
        this.main.canvas.selection = false;
        if (this.main.img && this.main.img.hoverCursor) {
            this.main.img.hoverCursor = 'crosshair';
        }
        this.main.canvas.on('mouse:down', this.createShape.bind(this));
        this.main.canvas.on('mouse:move', this.createShapeMouseMove.bind(this));
        this.main.canvas.on('mouse:up', this.createShapeMouseUp.bind(this));
    },
    removeHandler: function () {
        if (!this.activeTools) return;
        this.activeTools = false;
        if (this.main.img && this.main.img.hoverCursor) {
            this.main.img.hoverCursor = 'default';
        }
        this.main.canvas.off('mouse:down');
        this.main.canvas.off('mouse:move');
        this.main.canvas.off('mouse:up');
        this.main.canvas.discardActiveObject().requestRenderAll();
        this.main.canvas.selection = true;
    },
    changeType: function (type, title) {
        $(this.styleEl.main).removeClass('btn_' + this.type);
        this.styleEl[this.type].removeClass('on');
        this.type = type;

        this.styleEl[this.type].addClass('on');
        $(this.styleEl.main).addClass('btn_' + this.type);
        $(this.styleEl.main).attr('title', title);
    },

    getPosition: function (e) {
        var pointer = this.main.canvas.getPointer(e.e);
        return { x: pointer.x, y: pointer.y };
    },

    createShape: function (e) {
        if (e && e.target && e.target.type != 'image') {
            return true;
        }
        this.main.history.save().lock();
        this.isDown = true;
        var pos = this.getPosition(e);
        this.origX = pos.x;
        this.origY = pos.y;
        switch (this.type) {
            case 'rect':
                this.activeObject = this.rect();
                break;
            case 'round_rect':
                this.activeObject = this.rect();
                this.activeObject.set({ rx: 20, ry: 20 });
                break;
            case 'circle':
                this.activeObject = this.circle();
                break;
            case 'line':
                this.activeObject = this.line();
                break;
        }

        this.main.canvas.add(this.activeObject);
    },
    createShapeMouseMove: function (e) {
        if (!this.isDown) return;

        var pos = this.getPosition(e);
        if (this.type == 'rect' || this.type == 'round_rect') {
            var _set = {};
            if (this.origX > pos.x) {
                _set.left = Math.abs(pos.x);
            }
            if (this.origY > pos.y) {
                _set.top = Math.abs(pos.y);
            }
            _set.width = Math.abs(this.origX - pos.x);
            _set.height = Math.abs(this.origY - pos.y);
            /**
             * line이 흐리게 그려지는 현상 방지
             * line width가 홀수면 width, height를 홀수로, 아니면 짝수로 만듬.
             * 왜 이래야 하지는 못찾음 결과가 이럼.ㅋㅋ.
             */
            _set.width += _set.width % 2 + (this._isodd?-1:0);
            _set.height += _set.height % 2 + (this._isodd?-1:0);
            if(e&&e.e&&e.e.shiftKey){
                if(_set.width > _set.height) _set.height = _set.width;
                else _set.width = _set.height;
            }
            this.activeObject.set(_set);
        } else if (this.type == 'circle') {
            var rx = Math.abs(this.origX - pos.x) / 2;
            var ry = Math.abs(this.origY - pos.y) / 2;
            if (rx > this.activeObject.strokeWidth) {
                rx -= this.activeObject.strokeWidth / 2;
            }
            if (ry > this.activeObject.strokeWidth) {
                ry -= this.activeObject.strokeWidth / 2;
            }
            /**
             * line이 흐리게 그려지는 현상 방지
             * line width가 홀수면 width, height를 홀수로, 아니면 짝수로 만듬.
             * 왜 이래야 하지는 못찾음 결과가 이럼.ㅋㅋ.
             */
            rx += rx % 2 + (this._isodd?-1:0);
            ry += ry % 2 + (this._isodd?-1:0);
            if(e&&e.e&&e.e.shiftKey){
                if(rx > ry) ry = rx;
                else rx = ry;
            }
            this.activeObject.set({ rx: rx, ry: ry });

            if (this.origX > pos.x) {
                this.activeObject.set({ originX: 'right' });
            } else {
                this.activeObject.set({ originX: 'left' });
            }
            if (this.origY > pos.y) {
                this.activeObject.set({ originY: 'bottom' });
            } else {
                this.activeObject.set({ originY: 'top' });
            }
        } else if (this.type == 'line') {
            var _x = pos.x, _y = pos.y;
            if(e&&e.e&&e.e.shiftKey){
                if(Math.abs(this.origX - _x) > Math.abs(this.origY - _y)) _y = this.origY;
                else _x = this.origX;
            }
            this.activeObject.set({ x2: _x, y2: _y });
        }
        this.main.canvas.renderAll();
    },
    createShapeMouseUp: function () {
        if (!this.isDown) return;
        this.isDown = false;
        this.main.canvas.remove(this.activeObject);
        this.main.canvas.add(this.activeObject);
        this.activeObject = null;
        this.main.canvas.requestRenderAll();
        this.main.history.unlock().add().save();
    },
    rect: function () {
        var _lineStyle = this.styleEl.style.val();
        var _lineWidth =  this.__lineWidth = parseInt(this.styleEl.size.val(), 10);
        this._isodd = this.__lineWidth % 2 == 1;
        var _shape_color = ($(this.colorEl).hasClass('none') ? 'rgba(0,0,0,0)' : this.colorEl.style.backgroundColor);
        return new fabric.Rect({
            left: this.origX,
            top: this.origY,
            originX: 'left',
            originY: 'top',
            width: 0,
            height: 0,
            angle: 0,
            strokeDashArray: (_lineStyle == 'dash' ? [10, 5] : _lineStyle == 'dot' ? [5, 5] : [0, 0]),
            fill: _shape_color,
            strokeWidth: _lineWidth,
            stroke: (_lineWidth == 0 || $(this.lineColorEl).hasClass('none') ? this.colorEl.style.backgroundColor : this.lineColorEl.style.backgroundColor)
        });
    },
    circle: function () {
        var _lineStyle = this.styleEl.style.val();
        var _lineWidth = parseInt(this.styleEl.size.val(), 10);
        var _shape_color = ($(this.colorEl).hasClass('none') ? 'rgba(0,0,0,0)' : this.colorEl.style.backgroundColor);
        return new fabric.Ellipse({
            left: this.origX,
            top: this.origY,
            originX: 'left',
            originY: 'top',
            rx: 0,
            ry: 0,
            angle: 0,
            strokeDashArray: (_lineStyle == 'dash' ? [10, 5] : _lineStyle == 'dot' ? [5, 5] : [0, 0]),
            fill: _shape_color,
            strokeWidth: parseInt(_lineWidth),
            stroke: (_lineWidth == 0 || $(this.lineColorEl).hasClass('none') ? this.colorEl.style.backgroundColor : this.lineColorEl.style.backgroundColor)
        });
    },
    line: function () {
        var _lineStyle = this.styleEl.style.val();
        var _lineWidth = parseInt(this.styleEl.size.val(), 10);
        return new fabric.Line([this.origX, this.origY, this.origX, this.origY], {
            strokeWidth: parseInt(_lineWidth),
            stroke: this.lineColorEl.style.backgroundColor,
            strokeDashArray: (_lineStyle == 'dash' ? [10, 5] : _lineStyle == 'dot' ? [5, 5] : [0, 0]),
            originX: 'left',
            originY: 'top'
        });
    }
}