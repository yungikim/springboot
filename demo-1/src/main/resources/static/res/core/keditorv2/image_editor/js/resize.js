function ResizeTools(opt) {
    this.initialize(opt);
}
ResizeTools.prototype = {
    initialize: function (opt) {
        var _self = this;
        var _opt = opt || {};
        this.main = _opt.main;
        this.styleEl = _opt.styleEl || {};
        this.group = null;
    },
    createHandler: function () {
        this.activeTools = true;
        this.main.history.save();
        this.main.history.lock(); /* object:modified event 제어, 잡다한 변경사항을 history에 남기지 않는다. resize 결과만.*/
        var _self = this;
        this.main.status.canvas_fullsize_mode = true;
        var group = this.group = new fabric.Group();
        this.group.setControlsVisibility({
            bl: true,
            br: true,
            mb: true,
            ml: true,
            mr: true,
            mt: true,
            tl: true,
            tr: true,
            mtr: false
        });
        this.main.canvas.getObjects().map(function (o) {
            group.addWithUpdate(o);
        });
        this.main.setCanvasSize();
        this.main.canvas.add(group);
        this.main.canvas.discardActiveObject();
        this.group.left = 10;
        this.group.top = 10;
        this.group.setCoords();
        this.main.canvas.setActiveObject(this.group).renderAll();
        this.ratio = true;
        this.updateSize();
        this._originSize = this.group.getBoundingRect(); /* 변경사항 비교용 */
        this.styleEl.width && this.styleEl.width.unbind('keyup').on("keyup", function () {
            var val = parseInt(this.value, 10);
            if (isNaN(val)) this.value = '';
            else _self.setSize(val, null);
        });
        this.styleEl.height && this.styleEl.height.unbind('keyup').on("keyup", function () {
            var val = parseInt(this.value, 10);
            if (isNaN(val)) this.value = '';
            else _self.setSize(null, val);
        });
        this.styleEl.ratio && this.styleEl.ratio.unbind('click').on('click', function () {
            if ($(this).hasClass('toggle_on')) {
                $(this).removeClass('toggle_on');
                _self.ratio = false;
            } else {
                $(this).addClass('toggle_on');
                _self.ratio = true;
            }
        });
        if (this.styleEl.ratio) this.ratio = $(this.styleEl.ratio).hasClass('toggle_on');
        this.styleEl.origin && this.styleEl.origin.unbind('click').on('click', function () {
            // _self.setSize(null, null, true);
            var a = _self.main.status.angle; //% 90;
            // if((a >= 0 && a <= 45) || (a >= 180 && a <= 225) || (a >= 315 && a <= 360) || (a >= 135 && a <= 180)){
            if (a == 0 || a == 180) {
                _self.setSize(_self.main.originImgInfo.width, _self.main.originImgInfo.height, false);
            } else {
                _self.setSize(_self.main.originImgInfo.height, _self.main.originImgInfo.width, false);
            }
        });
        this._req = null;
        this.main.canvas.on('object:scaling', function (e) {
            if (e.target === _self.group) {
                if (_self._req) clearTimeout(_self._req);
                _self._req = setTimeout(function () { _self.updateSize(); }, 800);
            }
        });
    },
    removeHandler: function () {
        if (!this.activeTools) return;
        var _self = this;
        this.activeTools = false;
        this.main.status.canvas_fullsize_mode = false;
        this.styleEl.width && this.styleEl.width.unbind('keyup');
        this.styleEl.height && this.styleEl.height.unbind('keyup');
        this.styleEl.ratio && this.styleEl.ratio.unbind('click');
        this.styleEl.origin && this.styleEl.origin.unbind('click');

        if (!this.group) return;
        this.main.canvas.off('object:scaling');
        var items = this.group.getObjects();
        this.group.remove(items);
        var rect = this.group.getBoundingRect();
        this.main.setCanvasSize(rect.width, rect.height);
        // this.main.canvas.setDimensions({width:rect.width, height:rect.height});
        this.main.canvas.centerObject(this.group);
        this.group.setCoords();
        this.main.canvas.remove(this.group);
        this.group.destroy();
        this.group = null;
        this.main.canvas.renderAll();
        this.main.history.unlock();
        if(rect.width != this._originSize.width || rect.height != this._originSize.height){
            this.main.history.add(true, (function(m, w, h){
                return function(){
                    // m.setCanvasSize(w, h);
                };
            })(this.main, rect.width, rect.height)).save();
        }
    },
    updateSize: function () {
        var rect = this.group.getBoundingRect();
        this.styleEl.width && this.styleEl.width.val(Math.round(rect.width));
        this.styleEl.height && this.styleEl.height.val(Math.round(rect.height));
    },
    setSize: function (width, height, origin) {
        var _self = this;
        if (this._req) clearTimeout(this._req);
        var scaleX = this.group.scaleX;
        var scaleY = this.group.scaleY;
        if (width != null) scaleX = width / this.group.width;
        if (height != null) scaleY = height / this.group.height;
        if (origin) {
            scaleX = scaleY = 1;
        }
        if (width != null && this.ratio) scaleY = scaleX;
        if (height != null && this.ratio) scaleX = scaleY;
        // this.main.canvas.renderAll();
        this.group.animate({ scaleX: scaleX, scaleY: scaleY, left: 10, top: 10 }, {
            duration: 200,
            onChange: this.main.canvas.renderAll.bind(this.main.canvas),
            onComplete: function () {
                _self.group.setCoords();
                _self._req = setTimeout(function () { _self.updateSize(); }, 100);
            }
        });
    }
}