function TextTools(opt) {
    this.initialize(opt);
}
TextTools.prototype = {
    initialize: function (opt) {
        var _self = this;
        var _opt = opt || {};
        this.main = _opt.main;
        this.styleEl = _opt.styleEl || {};
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.active_text_box = null;
        this.styleEl.bold.on('click', function (e) {
            _self.toggle('bold');
        });
        this.styleEl.italic.on('click', function (e) {
            _self.toggle('italic');
        });
        this.styleEl.underline.on('click', function (e) {
            _self.toggle('underline');
        });
        this.styleEl.color.on('click', function (e) {
            this.jscolor && this.jscolor.show();
        });
        this.styleEl.bg_color.on('click', function (e) {
            this.jscolor && this.jscolor.show();
        });
    },
    createHandler: function () {
        this.activeTools = true;
        this.main.canvas.selection = false;
        if (this.main.img && this.main.img.hoverCursor) {
            this.main.img.hoverCursor = 'text';
        }
        var _self = this;
        this.main.canvas.on('mouse:down', function(e){
            setTimeout(function(){
                _self.createTextbox(e);
            }, 0);            
        });
    },
    removeHandler: function () {
        if (!this.activeTools) return;
        this.activeTools = false;
        if (this.main.img && this.main.img.hoverCursor) {
            this.main.img.hoverCursor = 'default';
        }
        if (this.active_text_box) {
            this.active_text_box.exitEditing();
        }
        this.main.canvas.off('mouse:down');
        this.main.canvas.selection = true;
    },
    getPosition: function (e) {
        var pointer = this.main.canvas.getPointer(e.e);
        return { x: pointer.x, y: pointer.y };
    },
    createTextbox: function (e) {
        var self = this;
        //텍스트 상자 클릭한 경우 박스 생성 안되도록 예외처리
        if (e && e.target && e.target.type != 'image') {
            return true;
        }
        var pos = this.getPosition(e);
        var _opt = {
            left: pos.x,
            top: pos.y - 10,
            padding: 5,
            fontFamily: this.styleEl.font.val(),
            fontSize: fabric.util.parseUnit(this.styleEl.size.val() + 'pt')
        };
        if(this.bold) _opt.fontWeight = 'bold';
        if(this.italic) _opt.fontStyle = 'italic';
        if(this.underline) _opt.underline = this.underline;
        if (this.styleEl.color && this.styleEl.color[0] && this.styleEl.color[0].innerHTML) _opt.fill = "#" + this.styleEl.color[0].innerHTML;
        if (this.styleEl.bg_color && this.styleEl.bg_color[0] && this.styleEl.bg_color[0].innerHTML) _opt.textBackgroundColor = "#" + this.styleEl.bg_color[0].innerHTML;

        var box = new fabric.IText('', _opt);

        //크기 조정안되도록 설정
        // box.setControlsVisibility({
        //     bl: false,
        //     br: false,
        //     mb: false,
        //     ml: false,
        //     mr: false,
        //     mt: false,
        //     tl: false,
        //     tr: false,
        //     mtr: true
        // });
        box.on('editing:entered', function () {
            //현재 편집중인 박스의 정보를 변수에 셋팅한다.
            self.active_text_box = this;
        });
        box.on('editing:exited', function () {
            //입력된 값이 없으면 텍스트 박스를 삭제한다.
            var txt = this.text.replace(/\s*/g, '');
            if (txt == '') {
                self.main.canvas.remove(this);
            }else{
                (function(_canvas, _text, _box){
                    setTimeout(function(){
                        if(_text.active_text_box != _box){
                            _text.main.history.lock();
                            _canvas.remove(_box);
                            _canvas.add(_box);
                            _canvas.requestRenderAll();
                            _text.main.history.unlock();
                        }
                    },500);
                })(self.main.canvas, self, this);
            }
            self.main.canvas.requestRenderAll();
            self.active_text_box = null;
        });
        self.main.canvas.add(box).setActiveObject(box);
        box.enterEditing();
        self.active_text_box = box;
    },
    _styleChange: function (type) {
        this[type] = !this[type];
        if (this.styleEl[type]) {
            $(this.styleEl[type])[this[type] ? 'addClass' : 'removeClass']('on');
        }
    },
    toggle: function (type) {
        this._styleChange(type);
    }
}