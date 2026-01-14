function History(opt) {
    this.initialize(opt);
}
History.prototype = {
    initialize: function (opt) {
        var _self = this;
        var _opt = opt || {};
        this.main = _opt.main;
        this.undoEvent = _opt.undoEvent||null;
        this.redoEvent = _opt.redoEvent||null;
        this.styleEl = _opt.styleEl || {};
        this.MAX_HISTORY = _opt && _opt.MAX?_opt.MAX:50; /** 최대 50건의 history를 관리함. */
        this.bold = false;
        this._default = null;
        this._undo = [];
        this._redo = [];
        this._cache = [];
        this.canvas = this.main.canvas;
        this.prev = this.styleEl.prev;
        this.next = this.styleEl.next;
        this._lock = false;
        this._eventLock = false;
        this.prev.on('click', function(){
            _self.undo();
        });
        this.next.on('click', function(){
            _self.redo();
        });
        this.historyOverflow = false;
    },
    'add':function(isSetJSON, _fn){
        if(this._lock || this._eventLock) return this;
        this._cache.push({
            json:(isSetJSON !== false?this.canvas.toJSON(['selectable','transparentCorners', 'hoverCursor', 'cornerColor','cornerSize','centeredScaling','hasRotatingPoint','hasBorders','minScaleLimit','lockScalingFlip','sizeType']):null), 
            fn:_fn,
            w:this.canvas.getWidth(),
            h:this.canvas.getHeight()
        });
        return this;
    },
    'defaultStatus':function(isSetJSON, _fn){
        this._default = {
            json:(isSetJSON !== false?this.canvas.toJSON(['selectable','transparentCorners', 'hoverCursor', 'cornerColor','cornerSize','centeredScaling','hasRotatingPoint','hasBorders','minScaleLimit','lockScalingFlip','sizeType']):null), 
            fn:_fn,
            w:this.canvas.getWidth(),
            h:this.canvas.getHeight()
        };
    },
    'save':function(){
        if(this._lock || this._eventLock) return this;
        if(this._cache.length > 0){
            this._undo = this._undo.concat(this._cache);
            if(this._undo.length > this.MAX_HISTORY){
                this.historyOverflow = true;
                var tmp = this._undo.splice(0, this._undo.length - this.MAX_HISTORY);
                for(var i = 0; i < tmp.length; i++){
                    tmp[i].json = '';
                    tmp[i].fn = '';
                }
                // delete tmp;
            }
            this.emptyCache();
            this._redo = [];
        }
        this.updateState();
        return this;
    },
    'undo':function(){
        if(this._lock) return this;
        if(this.undoEvent && !this.undoEvent()) return this;
        this.main.menuClear();
        this.save();
        this._lock = true;
        var _self = this;
        var info = this._undo.pop();
        if(info == null) {this._lock = false; return this;}
        this._redo.push(info);
        info = this._undo.length>0?this._undo[this._undo.length-1]:null;
        this._load(info);
        this.updateState();
        return this;
    },
    'redo':function(){
        if(this._lock) return this;
        if(this.redoEvent && !this.redoEvent()) return this;
        this._lock = true;
        this.main.menuClear();
        var _self = this;
        var info = this._redo.pop();
        if(info == null) {this._lock = false; return this;}
        this._undo.push(info);
        this._load(info);
        this.updateState();
        return this;
    },
    '_load':function(info){
        var _self = this;        
        if(info){
            if(this.canvas.getWidth() != info.w || this.canvas.getHeight() != info.h){
                this.main.setCanvasSize(info.w, info.h);
            }
            this.canvas.clear().renderAll();            
            if(info.json){
                this.canvas.loadFromJSON(info.json, function(){
                    _self.canvas.renderAll();
                    if(info.fn) info.fn();
                    _self._lock = false;                    
                });
            }else if(info.fn){
                info.fn();
                _self._lock = false;
            }
        }else if(!this.historyOverflow){
            if(this._default){
                this._load(this._default);
            }else{
                this.canvas.clear().renderAll();
                _self.main.showPanel('paste');
                _self._lock = false;
            }            
        }else{
            _self._lock = false;
        }
        return this;
    },    
    'emptyCache':function(){
        this._cache = [];
        return this;
    },
    'updateState':function(){
        this.prev[this._undo.length>0?'removeClass':'addClass']('disabled');
        this.next[this._redo.length>0?'removeClass':'addClass']('disabled');
        return this;
    },
    'lock':function(){
        this._eventLock = true;
        return this;
    },
    'unlock': function(){
        this._eventLock = false;
        return this;
    }
};