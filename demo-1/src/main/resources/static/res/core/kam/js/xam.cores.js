/*!  tmpl */
!function(a){"use strict";var b=function(a,c){var d=/[^\w\-\.:]/.test(a)?new Function(b.arg+",tmpl","var _e=tmpl.encode"+b.helper+",_s='"+a.replace(b.regexp,b.func)+"';return _s;"):b.cache[a]=b.cache[a]||b(b.load(a));return c?d(c,b):function(a){return d(a,b)}};b.cache={},b.load=function(a){return document.getElementById(a).innerHTML},b.regexp=/([\s'\\])(?!(?:[^{]|\{(?!%))*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g,b.func=function(a,b,c,d,e,f){return b?{"\n":"\\n","\r":"\\r","  ":"\\t"," ":" "}[b]||"\\"+b:c?"="===c?"'+_e("+d+")+'":"'+("+d+"==null?'':"+d+")+'":e?"';":f?"_s+='":void 0},b.encReg=/[<>&"'\x00]/g,b.encMap={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},b.encode=function(a){return(null==a?"":""+a).replace(b.encReg,function(a){return b.encMap[a]||""})},b.arg="o",b.helper=",print=function(s,e){_s+=e?(s==null?'':s):_e(s);},include=function(s,d){_s+=tmpl(s,d);}","function"==typeof define&&define.amd?define(function(){return b}):a.tmpl=b}(this);


(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else {
        factory(jQuery);
    }
}(function( $, undefined ) {

var uuid = 0,
    slice = Array.prototype.slice,
    _cleanData = $.cleanData;
    $.cleanData = function( elems ) {
        for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
            try {
                $( elem ).triggerHandler( "remove" );
            } catch( e ) {}
        }
    _cleanData( elems );
};

$.widget = function( name, base, prototype ) {
    var fullName, existingConstructor, constructor, basePrototype,
        proxiedPrototype = {},
        namespace = name.split( "." )[ 0 ];

    name = name.split( "." )[ 1 ];
    fullName = namespace + "-" + name;

    if ( !prototype ) {
        prototype = base;
        base = $.Widget;
    }

    $.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
        return !!$.data( elem, fullName );
    };

    $[ namespace ] = $[ namespace ] || {};
    existingConstructor = $[ namespace ][ name ];
    constructor = $[ namespace ][ name ] = function( options, element ) {
        if ( !this._createWidget ) {
            return new constructor( options, element );
        }
        if ( arguments.length ) {
            this._createWidget( options, element );
        }
    };
    $.extend( constructor, existingConstructor, {
        version: prototype.version,
        _proto: $.extend( {}, prototype ),
        _childConstructors: []
    });

    basePrototype = new base();
    basePrototype.options = $.widget.extend( {}, basePrototype.options );
    $.each( prototype, function( prop, value ) {
        if ( !$.isFunction( value ) ) {
            proxiedPrototype[ prop ] = value;
            return;
        }
        proxiedPrototype[ prop ] = (function() {
            var _super = function() {
                    return base.prototype[ prop ].apply( this, arguments );
                },
                _superApply = function( args ) {
                    return base.prototype[ prop ].apply( this, args );
                };
            return function() {
                var __super = this._super,
                    __superApply = this._superApply,
                    returnValue;

                this._super = _super;
                this._superApply = _superApply;

                returnValue = value.apply( this, arguments );

                this._super = __super;
                this._superApply = __superApply;

                return returnValue;
            };
        })();
    });
    constructor.prototype = $.widget.extend( basePrototype, {
        widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
    }, proxiedPrototype, {
        constructor: constructor,
        namespace: namespace,
        widgetName: name,
        widgetFullName: fullName
    });
    if ( existingConstructor ) {
        $.each( existingConstructor._childConstructors, function( i, child ) {
            var childPrototype = child.prototype;
            $.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
        });
        delete existingConstructor._childConstructors;
    } else {
        base._childConstructors.push( constructor );
    }

    $.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
    var input = slice.call( arguments, 1 ),
        inputIndex = 0,
        inputLength = input.length,
        key,
        value;
    for ( ; inputIndex < inputLength; inputIndex++ ) {
        for ( key in input[ inputIndex ] ) {
            value = input[ inputIndex ][ key ];
            if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
                if ( $.isPlainObject( value ) ) {
                    target[ key ] = $.isPlainObject( target[ key ] ) ?
                        $.widget.extend( {}, target[ key ], value ) :
                        $.widget.extend( {}, value );
                } else {
                    target[ key ] = value;
                }
            }
        }
    }
    return target;
};

$.widget.bridge = function( name, object ) {
    var fullName = object.prototype.widgetFullName || name;
    $.fn[ name ] = function( options ) {
        var isMethodCall = typeof options === "string",
            args = slice.call( arguments, 1 ),
            returnValue = this;

        options = !isMethodCall && args.length ?
            $.widget.extend.apply( null, [ options ].concat(args) ) :
            options;

        if ( isMethodCall ) {
            this.each(function() {
                var methodValue,
                    instance = $.data( this, fullName );
                if ( !instance ) {
                    return $.error( "cannot call methods on " + name + " prior to initialization; " +
                        "attempted to call method '" + options + "'" );
                }
                if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
                    return $.error( "no such method '" + options + "' for " + name + " widget instance" );
                }
                methodValue = instance[ options ].apply( instance, args );
                if ( methodValue !== instance && methodValue !== undefined ) {
                    returnValue = methodValue && methodValue.jquery ?
                        returnValue.pushStack( methodValue.get() ) :
                        methodValue;
                    return false;
                }
            });
        } else {
            this.each(function() {
                var instance = $.data( this, fullName );
                if ( instance ) {
                    instance.option( options || {} )._init();
                } else {
                    $.data( this, fullName, new object( options, this ) );
                }
            });
        }

        return returnValue;
    };
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
        disabled: false,
        create: null
    },
    _createWidget: function( options, element ) {
        element = $( element || this.defaultElement || this )[ 0 ];
        this.element = $( element );
        this.uuid = uuid++;
        this.eventNamespace = "." + this.widgetName + this.uuid;
        this.options = $.widget.extend( {},
            this.options,
            this._getCreateOptions(),
            options );

        this.bindings = $();
        this.hoverable = $();
        this.focusable = $();

        if ( element !== this ) {
            $.data( element, this.widgetFullName, this );
            this._on( true, this.element, {
                remove: function( event ) {
                    if ( event.target === element ) {
                        this.destroy();
                    }
                }
            });
            this.document = $( element.style ?
                element.ownerDocument :
                element.document || element );
            this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
        }

        this._create();
        this._trigger( "create", null, this._getCreateEventData() );
        this._init();
    },
    _getCreateOptions: $.noop,
    _getCreateEventData: $.noop,
    _create: $.noop,
    _init: $.noop,

    destroy: function() {
        this._destroy();
        this.element
            .unbind( this.eventNamespace )
            .removeData( this.widgetName )
            .removeData( this.widgetFullName )
            .removeData( $.camelCase( this.widgetFullName ) );
        this.widget()
            .unbind( this.eventNamespace )
            .removeAttr( "aria-disabled" )
            .removeClass(
                this.widgetFullName + "-disabled " +
                "ui-state-disabled" );
        this.bindings.unbind( this.eventNamespace );
        this.hoverable.removeClass( "ui-state-hover" );
        this.focusable.removeClass( "ui-state-focus" );
    },
    _destroy: $.noop,

    widget: function() {
        return this.element;
    },

    option: function( key, value ) {
        var options = key,
            parts,
            curOption,
            i;

        if ( arguments.length === 0 ) {
            return $.widget.extend( {}, this.options );
        }

        if ( typeof key === "string" ) {
            options = {};
            parts = key.split( "." );
            key = parts.shift();
            if ( parts.length ) {
                curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
                for ( i = 0; i < parts.length - 1; i++ ) {
                    curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
                    curOption = curOption[ parts[ i ] ];
                }
                key = parts.pop();
                if ( value === undefined ) {
                    return curOption[ key ] === undefined ? null : curOption[ key ];
                }
                curOption[ key ] = value;
            } else {
                if ( value === undefined ) {
                    return this.options[ key ] === undefined ? null : this.options[ key ];
                }
                options[ key ] = value;
            }
        }

        this._setOptions( options );

        return this;
    },
    _setOptions: function( options ) {
        var key;

        for ( key in options ) {
            this._setOption( key, options[ key ] );
        }

        return this;
    },
    _setOption: function( key, value ) {
        this.options[ key ] = value;

        if ( key === "disabled" ) {
            this.widget()
                .toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
                .attr( "aria-disabled", value );
            this.hoverable.removeClass( "ui-state-hover" );
            this.focusable.removeClass( "ui-state-focus" );
        }

        return this;
    },

    enable: function() {
        return this._setOption( "disabled", false );
    },
    disable: function() {
        return this._setOption( "disabled", true );
    },

    _on: function( suppressDisabledCheck, element, handlers ) {
        var delegateElement,
            instance = this;

        if ( typeof suppressDisabledCheck !== "boolean" ) {
            handlers = element;
            element = suppressDisabledCheck;
            suppressDisabledCheck = false;
        }

        if ( !handlers ) {
            handlers = element;
            element = this.element;
            delegateElement = this.widget();
        } else {
            element = delegateElement = $( element );
            this.bindings = this.bindings.add( element );
        }

        $.each( handlers, function( event, handler ) {
            function handlerProxy() {
                if ( !suppressDisabledCheck &&
                        ( instance.options.disabled === true ||
                            $( this ).hasClass( "ui-state-disabled" ) ) ) {
                    return;
                }
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }

            if ( typeof handler !== "string" ) {
                handlerProxy.guid = handler.guid =
                    handler.guid || handlerProxy.guid || $.guid++;
            }

            var match = event.match( /^(\w+)\s*(.*)$/ ),
                eventName = match[1] + instance.eventNamespace,
                selector = match[2];
            if ( selector ) {
                delegateElement.delegate( selector, eventName, handlerProxy );
            } else {
                element.bind( eventName, handlerProxy );
            }
        });
    },

    _off: function( element, eventName ) {
        eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
        element.unbind( eventName ).undelegate( eventName );
    },

    _delay: function( handler, delay ) {
        function handlerProxy() {
            return ( typeof handler === "string" ? instance[ handler ] : handler )
                .apply( instance, arguments );
        }
        var instance = this;
        return setTimeout( handlerProxy, delay || 0 );
    },

    _hoverable: function( element ) {
        this.hoverable = this.hoverable.add( element );
        this._on( element, {
            mouseenter: function( event ) {
                $( event.currentTarget ).addClass( "ui-state-hover" );
            },
            mouseleave: function( event ) {
                $( event.currentTarget ).removeClass( "ui-state-hover" );
            }
        });
    },

    _focusable: function( element ) {
        this.focusable = this.focusable.add( element );
        this._on( element, {
            focusin: function( event ) {
                $( event.currentTarget ).addClass( "ui-state-focus" );
            },
            focusout: function( event ) {
                $( event.currentTarget ).removeClass( "ui-state-focus" );
            }
        });
    },

    _trigger: function( type, event, data ) {
        var prop, orig,
            callback = this.options[ type ];

        data = data || {};
        event = $.Event( event );
        event.type = ( type === this.widgetEventPrefix ?
            type :
            this.widgetEventPrefix + type ).toLowerCase();
        event.target = this.element[ 0 ];
        orig = event.originalEvent;
        if ( orig ) {
            for ( prop in orig ) {
                if ( !( prop in event ) ) {
                    event[ prop ] = orig[ prop ];
                }
            }
        }

        this.element.trigger( event, data );
        return !( $.isFunction( callback ) &&
            callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
            event.isDefaultPrevented() );
    }
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
    $.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
        if ( typeof options === "string" ) {
            options = { effect: options };
        }
        var hasOptions,
            effectName = !options ?
                method :
                options === true || typeof options === "number" ?
                    defaultEffect :
                    options.effect || defaultEffect;
        options = options || {};
        if ( typeof options === "number" ) {
            options = { duration: options };
        }
        hasOptions = !$.isEmptyObject( options );
        options.complete = callback;
        if ( options.delay ) {
            element.delay( options.delay );
        }
        if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
            element[ method ]( options );
        } else if ( effectName !== method && element[ effectName ] ) {
            element[ effectName ]( options.duration, options.easing, callback );
        } else {
            element.queue(function( next ) {
                $( this )[ method ]();
                if ( callback ) {
                    callback.call( element[ 0 ] );
                }
                next();
            });
        }
    };
});

}));

var sendcount = 0;
var donecount = 0;
var text = [];
var text_bigfile = [];
var file_info = [];
var lfile_info = [];
        
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'jquery.ui.widget'
        ], factory);
    } else {
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    $.support.fileInput = !(new RegExp(
        '(Android (1\\.[0156]|2\\.[01]))' +
            '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' +
            '|(w(eb)?OSBrowser)|(webOS)' +
            '|(Kindle/(1\\.0|2\\.[05]|3\\.0))'
    ).test(window.navigator.userAgent) ||
    $('<input type="file">').prop('disabled'));
    $.support.xhrFileUpload = !!(window.XMLHttpRequestUpload && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    $.support.blobSlice = window.Blob && (Blob.prototype.slice ||
        Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

    $.support.utf8zip = !(new RegExp(
            '(Win16)|(Windows 95)|(Win95)|(Windows_95)|(Windows 98)|(Win98)|(Windows ME)' + 
            '|(Windows NT (4\\.0|5\\.0|5\\.1|5\\.2|6\\.0|6\\.1|6\\.2))'
    ).test(window.navigator.userAgent));

    $.support.dragdrop = !(new RegExp(
            'MSIE [1-9]\.'
    ).test(window.navigator.userAgent));
    
    $.widget('_XAM.fileupload', {

        options: {
            dropZone: $(document),
            pasteZone: $(document),
            fileInput: undefined,
            replaceFileInput: true,
            paramName: undefined,
            singleFileUploads: true,
            limitMultiFileUploads: undefined,
            sequentialUploads: false,
            limitConcurrentUploads: undefined,
            forceIframeTransport: false,
            redirect: undefined,
            redirectParamName: undefined,
            postMessage: undefined,
            multipart: true,
            maxChunkSize: undefined,
            uploadedBytes: undefined,
            recalculateProgress: true,
            progressInterval: 100,
            bitrateInterval: 500,
            autoUpload: true,
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },
            i18n: function (message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    $.each(context, function (key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },
            formData: function (form) {
                return form.serializeArray();
            },
            add: function (e, data) {
                if (data.autoUpload || (data.autoUpload !== false &&
                        $(this).fileupload('option', 'autoUpload'))) {
                    data.process().done(function () {
                        data.submit();
                    });
                }
            },
            processData: false,
            contentType: false,
            cache: false
        },
        _specialOptions: [
            'fileInput',
            'dropZone',
            'pasteZone',
            'multipart',
            'forceIframeTransport'
        ],
        _blobSlice: $.support.blobSlice && function () {
            var slice = this.slice || this.webkitSlice || this.mozSlice;
            return slice.apply(this, arguments);
        },
        _BitrateTimer: function () {
            this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },
        _isXHRUpload: function (options) {
            return !options.forceIframeTransport &&
                ((!options.multipart && $.support.xhrFileUpload) ||
                $.support.xhrFormDataFileUpload);
        },
        _getFormData: function (options) {
            var formData;
            if (typeof options.formData === 'function') {
                return options.formData(options.form);
            }
            if ($.isArray(options.formData)) {
                return options.formData;
            }
            if ($.type(options.formData) === 'object') {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _initProgressObject: function (obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                $.extend(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        },

        _initResponseObject: function (obj) {
            var prop;
            if (obj._response) {
                for (prop in obj._response) {
                    if (obj._response.hasOwnProperty(prop)) {
                        delete obj._response[prop];
                    }
                }
            } else {
                obj._response = {};
            }
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = ((Date.now) ? Date.now() : (new Date()).getTime()),
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                loaded = Math.floor(
                    e.loaded / e.total * (data.chunkSize || data._progress.total)
                ) + (data.uploadedBytes || 0);
                this._progress.loaded += (loaded - data._progress.loaded);
                this._progress.bitrate = this._bitrateTimer.getBitrate(
                    now,
                    this._progress.loaded,
                    data.bitrateInterval
                );
                data._progress.loaded = data.loaded = loaded;
                data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                this._trigger('progress', e, data);
                this._trigger('progressall', e, this._progress);
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            if (xhr.upload) {
                $(xhr.upload).bind('progress', function (e) {
                    var oe = e.originalEvent;
                    e.lengthComputable = oe.lengthComputable;
                    e.loaded = oe.loaded;
                    e.total = oe.total;
                    that._onProgress(e, options);
                });
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _isInstanceOf: function (type, obj) {
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        },

        _initXHRData: function (options) {
            var that = this,
                formData,
                file = options.files[0],
                multipart = options.multipart || !$.support.xhrFileUpload,
                paramName = options.paramName[0];
            options.headers = $.extend({}, options.headers);
            if (options.contentRange) {
                options.headers['Content-Range'] = options.contentRange;
            }
            if (!multipart || options.blob || !this._isInstanceOf('File', file)) {
                options.headers['Content-Disposition'] = 'attachment; filename="' +
                encodeURIComponent(file.name) + '"';
            }
            if (!multipart) {
                options.contentType = file.type;
                options.data = options.blob || file;
            } else if ($.support.xhrFormDataFileUpload) {
                if (options.postMessage) {
                    formData = this._getFormData(options);
                    if (options.blob) {
                        formData.push({
                            name: paramName,
                            value: options.blob
                        });
                    } else {
                        $.each(options.files, function (index, file) {
                            formData.push({
                                name: options.paramName[index] || paramName,
                                value: file
                            });
                        });
                    }
                } else {
                    if (that._isInstanceOf('FormData', options.formData)) {
                        formData = options.formData;
                    } else {
                        formData = new FormData();
                        $.each(this._getFormData(options), function (index, field) {
                            formData.append(field.name, field.value);
                        });
                    }
                    if (options.blob) {
                        formData.append(paramName, options.blob, file.name);
                    } else {
                        $.each(options.files, function (index, file) {
                            if (that._isInstanceOf('File', file) ||
                                    that._isInstanceOf('Blob', file)) {
                                formData.append(
                                    options.paramName[index] || paramName,
                                    file,
                                    file.name
                                );
                            }
                        });
                    }
                }
                options.data = formData;
            }
            options.blob = null;
        },

        _initIframeSettings: function (options) {
            var targetHost = $('<a></a>').prop('href', options.url).prop('host');
            options.dataType = 'iframe ' + (options.dataType || '');
            options.formData = this._getFormData(options);
            if (options.redirect && targetHost && targetHost !== location.host) {
                options.formData.push({
                    name: options.redirectParamName || 'redirect',
                    value: options.redirect
                });
            }
        },

        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                this._initIframeSettings(options);
            }
        },

        _getParamName: function (options) {
            var fileInput = $(options.fileInput),
                paramName = options.paramName;
            if (!paramName) {
                paramName = [];
                fileInput.each(function () {
                    var input = $(this),
                        name = input.prop('name') || 'files[]',
                        i = (input.prop('files') || [1]).length;
                    while (i) {
                        paramName.push(name);
                        i -= 1;
                    }
                });
                if (!paramName.length) {
                    paramName = [fileInput.prop('name') || 'files[]'];
                }
            } else if (!$.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },

        _initFormSettings: function (options) {
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
                if (!options.form.length) {
                    options.form = $(this.options.fileInput.prop('form'));
                }
            }
            options.paramName = this._getParamName(options);
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            options.type = (options.type || options.form.prop('method') || '')
                .toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT' &&
                    options.type !== 'PATCH') {
                options.type = 'POST';
            }
            if (!options.formAcceptCharset) {
                options.formAcceptCharset = options.form.attr('accept-charset');
            }
        },
        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },
        _getDeferredState: function (deferred) {
            if (deferred.state) {
                return deferred.state();
            }
            if (deferred.isResolved()) {
                return 'resolved';
            }
            if (deferred.isRejected()) {
                return 'rejected';
            }
            return 'pending';
        },
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },
        _addConvenienceMethods: function (e, data) {
            var that = this,
                getPromise = function (data) {
                    return $.Deferred().resolveWith(that, [data]).promise();
                };
            data.process = function (resolveFunc, rejectFunc) {
                if (resolveFunc || rejectFunc) {
                    data._processQueue = this._processQueue =
                        (this._processQueue || getPromise(this))
                            .pipe(resolveFunc, rejectFunc);
                }
                return this._processQueue || getPromise(this);
            };
            data.submit = function () {
                if (this.state() !== 'pending') {
                    data.jqXHR = this.jqXHR =
                        (that._trigger('submit', e, this) !== false) &&
                        that._onSend(e, this);
                }
                return this.jqXHR || that._getXHRPromise();
            };
            data.abort = function () {
                if (this.jqXHR) {
                    return this.jqXHR.abort();
                }
                return that._getXHRPromise();
            };
            data.state = function () {
                if (this.jqXHR) {
                    return that._getDeferredState(this.jqXHR);
                }
                if (this._processQueue) {
                    return that._getDeferredState(this._processQueue);
                }
            };
            data.progress = function () {
                return this._progress;
            };
            data.response = function () {
                return this._response;
            };
        },
        _getUploadedBytes: function (jqXHR) {
            var range = jqXHR.getResponseHeader('Range'),
                parts = range && range.split('-'),
                upperBytesPos = parts && parts.length > 1 &&
                    parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        },
        _chunkedUpload: function (options, testOnly) {
            options.uploadedBytes = options.uploadedBytes || 0;
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes,
                mcs = options.maxChunkSize || fs,
                slice = this._blobSlice,
                dfd = $.Deferred(),
                promise = dfd.promise(),
                jqXHR,
                upload;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) || options.data) { return false; }
            if (options.data) { return false; }
            if (testOnly) { return true; }
            if (ub >= fs) {
                file.error = options.i18n('uploadedBytes');
                return this._getXHRPromise( false, options.context, [null, 'error', file.error] );
            }
            upload = function(s_byte) {
                if(s_byte){ ub = s_byte; }
                var o = $.extend({}, options), currentLoaded = o._progress.loaded;
                o.blob = slice.call( file, ub, ub + mcs, file.type );
                o.chunkSize = o.blob.size;
                o.contentRange = 'bytes ' + ub + '-' + (ub + o.chunkSize - 1) + '/' + fs;
                that._initXHRData(o);
                that._initProgressListener(o);

                jqXHR = ((that._trigger('chunksend', null, o) !== false && $.ajax(o)) || that._getXHRPromise(false, o.context))
                    .done(function (result, textStatus, jqXHR) {
                        ub = that._getUploadedBytes(jqXHR) || (ub + o.chunkSize);
                        if (currentLoaded + o.chunkSize - o._progress.loaded) {
                            that._onProgress($.Event('progress', {
                                lengthComputable: true,
                                loaded: ub - o.uploadedBytes,
                                total: ub - o.uploadedBytes
                            }), o);
                        }
                        options.uploadedBytes = o.uploadedBytes = ub;
                        o.result = result;
                        o.textStatus = textStatus;
                        o.jqXHR = jqXHR;
                        that._trigger('chunkdone', null, o);
                        that._trigger('chunkalways', null, o);
                        if (ub < fs) {
                            upload();
                        } else {
                            dfd.resolveWith(o.context, [result, textStatus, jqXHR]);
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        o.jqXHR = jqXHR;
                        o.textStatus = textStatus;
                        o.errorThrown = errorThrown;
                        that._trigger('chunkfail', null, o);
                        that._trigger('chunkalways', null, o);
                        dfd.rejectWith(o.context, [jqXHR, textStatus, errorThrown]);
                    });
            };
            this._enhancePromise(promise);
            promise.abort = function () {
                return jqXHR.abort();
            };
            var co = {}
            co.type = "GET";
            co.url = _XAM.env.normal_upload_url + "/checkID/" + encodeURIComponent(options.files[0].name) + "^" + options.files[0].size;
            co.dataType = "json";
            co.success = function(ret){
                if(ret.isExist === "true"){
                    upload(ret.start_byte);
                } else {
                    upload();
                }
            }
            co.error = function(xhr, status, error){
                alert("Check  Connection with AM Server.");
                that._onFail(xhr, status, error, options);                
                return;
            }
            $.ajax(co);
            return promise;
        },

        _beforeSend: function (e, data) {
             $('p.name').each(function(){
                 var content = $(this).text();
             });

            if (this._active === 0) {
                this._trigger('start');
                this._bitrateTimer = new this._BitrateTimer();
                this._progress.loaded = this._progress.total = 0;
                this._progress.bitrate = 0;
            }
            this._initResponseObject(data);
            this._initProgressObject(data);
            data._progress.loaded = data.loaded = data.uploadedBytes || 0;
            data._progress.total = data.total = this._getTotal(data.files) || 1;
            data._progress.bitrate = data.bitrate = 0;
            this._active += 1;
            this._progress.loaded += data.loaded;
            this._progress.total += data.total;
        },
        _onDone: function (result, textStatus, jqXHR, options){
            donecount += 1;
            
            var total = options._progress.total, response = options._response;
            if (options._progress.loaded < total) {
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: total,
                    total: total
                }), options);
            }
            
            response.result = options.result = result;
            response.textStatus = options.textStatus = textStatus;
            response.jqXHR = options.jqXHR = jqXHR;

            this._trigger('done', null, options);
            
            if($.isArray(result.files) && result.files[0].isBigfile){
                if(typeof OnLargeUploadEachComplete == "function"){ 
                    lfile_info.push(OnLargeUploadEachComplete(response.result.files[0]));
                } else {
                    lfile_info.push(response.result.files[0]);
                }
                options.url = "";
                // this._trigger("destroy", null, options); 대용량 완료되어도 목록에서 삭제 안함.
            } else if (result.isBigfile) {
                if(typeof OnLargeUploadEachComplete == "function"){ 
                    lfile_info.push(OnLargeUploadEachComplete(options.files[0], response.result));
                } else {
                    lfile_info.push(response.result);
                }
                options.url = "";
                // this._trigger("destroy", null, options);
            }
            if (donecount == sendcount){
                if(text_bigfile.length > 0 ){
                    if(OnLargeUploadComplete){
                        var _tmpl = tmpl("template-large-file");
                        var _html = _tmpl({ files: lfile_info, formatFileSize: this._formatFileSize, options: this.options });
                        OnLargeUploadComplete(_html);
                    }
                }
                if(OnUploadComplete){
                    OnUploadComplete(this.get_file_list("done"), result);
                } else {
                    parent.XAM.g.uploadComplete(); 
                }
            }
        },
        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            sendcount -= 1;
            var response = options._response;
            if (options.recalculateProgress) {
                this._progress.loaded -= options._progress.loaded;
                this._progress.total -= options._progress.total;
            }
            response.jqXHR = options.jqXHR = jqXHR;
            response.textStatus = options.textStatus = textStatus;
            response.errorThrown = options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
            alert(_XAM.xamlang.propStr("file_upload_failed"));
            if(typeof OnError == "function"){ OnError((jqXHR.responseJSON ? jqXHR.responseJSON : "Server Connection Failed")); }
        },
        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            this._trigger('always', null, options);
        },
        _onSend: function (e, data) {
            sendcount += 1;
            if (!data.submit) {
                this._addConvenienceMethods(e, data);
            }
            var that = this, jqXHR, aborted, slot, pipe, options = that._getAJAXSettings(data),
                send = function () {
                    
                    if (sendcount == 1){
                        text = [];
                        text_bigfile = [];
                    }
                    if(_XAM.env.is_large_file_upload){
                        if($("#"+_XAM.args.filelistID).find(".name:contains('" + options.files[0].name + "')").parent().next().next().next().children().hasClass("btn_change_"+_XAM.env.lang)){
                            text.push(options.files[0].name);
                            options.url = _XAM.env.normal_upload_url + $(window.frameElement).attr("save_path");
                        } else {
                            text_bigfile.push(options.files[0].name);
                            if(_XAM.env.is_limit_period){
                                //$(window.frameElement).attr("l_save_path", $(window.frameElement).attr("l_save_path") + "?end_date=" + nd.getFullYear() + "-" + (nd.getMonth()+1) + "-" + nd.getDate());
                                
                                if ($(window.frameElement).attr("l_save_path").indexOf('end_date')==-1) {
                                    var param = "";
                                    var date = new Date(); 
                                    param += "?start_date=" + date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2);

                                    date.setDate(date.getDate() + parseInt(_XAM.env.limit_period));
                                    var nd = new Date(date); 
                                    param += "&end_date=" + nd.getFullYear() + "-" + ("00" + (nd.getMonth() + 1)).slice(-2) + "-" + ("00" + nd.getDate()).slice(-2);
                                    
                                    param += "&period=" + _XAM.env.limit_period;
                                    
                                    var _comcode = parent._form.info.from_info.company_code;
                                    if (_comcode == "" || _comcode == undefined) {
                                        _comcode = "10";
                                    }
                                    
                                    param += "&comcode=" + _comcode;
                                    
                                    var _empno = parent._form.info.from_info.empno;
                                    if (_empno == "" || _empno == undefined) {
                                        _empno = "00000000";
                                    }
                                    
                                    param += "&empno=" + _empno;
                                    
                                    var _unid = parent.docid;
                                    if (_unid == "" || _unid == undefined) {
                                        _unid = getDateFormat();
                                    }
                                    
                                    param += "&unid=" + _unid;
                                    
                                    
                                    $(window.frameElement).attr("l_save_path", $(window.frameElement).attr("l_save_path") + param);
                                }
                            }
                            options.url = _XAM.env.large_file_upload_url + $(window.frameElement).attr("l_save_path");
                        }
                    } else {
                        text.push(options.files[0].name);
                        options.url = _XAM.env.normal_upload_url + $(window.frameElement).attr("save_path");
                    }

                    that._sending += 1;
                    options._bitrateTimer = new that._BitrateTimer();
                    
                    // debugger;
                    jqXHR = jqXHR || ( $.ajax(options)
                        ).done(function (result, textStatus, jqXHR) {
                            that._onDone(result, textStatus, jqXHR, options);
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            that._onFail(jqXHR, textStatus, errorThrown, options);
                        }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                            that._onAlways(
                                jqXHRorResult,
                                textStatus,
                                jqXHRorError,
                                options
                            );
                            that._sending -= 1;
                            that._active -= 1;
                            if (options.limitConcurrentUploads && options.limitConcurrentUploads > that._sending) {
                                var nextSlot = that._slots.shift();
                                while (nextSlot) {
                                    if (that._getDeferredState(nextSlot) === 'pending') {
                                        nextSlot.resolve();
                                        break;
                                    }
                                    nextSlot = that._slots.shift();
                                }
                            }
                            if (that._active === 0) {
                                that._trigger('stop');
                            }
                        });                    
                    return jqXHR;
                };
            this._beforeSend(e, options);
            if(typeof OnUploadBefore == "function"){ OnUploadBefore(data.files); }
            if (this.options.sequentialUploads || (this.options.limitConcurrentUploads && this.options.limitConcurrentUploads <= this._sending)) {
                if (this.options.limitConcurrentUploads > 1) {
                    slot = $.Deferred();
                    this._slots.push(slot);
                    pipe = slot.pipe(send);
                } else {
                    this._sequence = this._sequence.pipe(send, send);
                    pipe = this._sequence;
                }
                pipe.abort = function () {
                    aborted = [undefined, 'abort', 'abort'];
                    if (!jqXHR) {
                        if (slot) {
                            slot.rejectWith(options.context, aborted);
                        }
                        return send();
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },
        _validate : function(files){
            var ret = false;
            var _sf = 0;
            var _flist = [];
            $("#"+_XAM.args.filelistID).find("tr:not(.remove)").each(function(i, v){
                //2023.01.30 업로드 완료 파일 용량 제외 부분 주석처리
//               if ($(v).find(".download-path").length==0||$(v).find(".download-path").html()=='') {
                     if ($(v).find(".real-size").length!=0&&$(v).find(".name").length!=0) {
                               _sf = _sf + parseInt($(v).find(".real-size").text()); 
                                 _flist.push($(v).find(".name").text().replace(/^\s*|\s*$/g,""));                        
                     }
//               }
            });

            if(_XAM.env.is_large_file_upload){
                var lsize_chk = 0;
                for(var i=0; i<files.length;i++) {
                    if(files[i].size > parseInt(_XAM.env.large_file_size * 1024 * 1024)){
                        if((parseInt(_XAM.env.large_file_limit) * 1024 * 1024 < files[i].size)){ 
                            var l_disp_size;
                            if(_XAM.env.large_file_limit.length >= 4){
                                l_disp_size = (parseInt(_XAM.env.large_file_limit) /1024).toFixed(2) + "GB"
                            } else {
                                l_disp_size = _XAM.env.large_file_limit + "MB"
                            }
                            alert(_XAM.xamlang.propStr("large_limit_size", l_disp_size));
                            return false; 
                        }
                        if($('#'+_XAM.args.filelistID).find(".btn_bigfile_" + _XAM.env.lang).closest("tr").length >= parseInt(_XAM.env.large_file_limit_count)){
                            alert(_XAM.xamlang.propStr("large_limit_count", _XAM.env.large_file_limit_count));
                            return false;
                        }
                        lsize_chk += files[i].size;
                    } else {
                        if(parseInt(_XAM.env.file_size_max_mb) * 1024 * 1024 < files[i].size){ 
                            alert(_XAM.xamlang.propStr("kam_each_file_size", _XAM.env.file_size_max_mb+"MB"));
                            return false; 
                        }
                        _sf = _sf + parseInt(files[i].size);
                    }
                    _flist.push(files[i].name);
                }
                if(_flist.length > parseInt(_XAM.env.attach_limit_count)){
                    alert(_XAM.xamlang.propStr("kam_limit_count", _XAM.env.attach_limit_count));
                    return false;
                }
                if((parseInt(_XAM.env.large_file_limit) * 1024 * 1024) < (this.large_file_size_check() + lsize_chk)){
                    var l_disp_size;
                    if(_XAM.env.large_file_limit.length >= 4){
                        l_disp_size = (parseInt(_XAM.env.large_file_limit) /1024).toFixed(2) + "GB"
                    } else {
                        l_disp_size = _XAM.env.large_file_limit + "MB"
                    }
                    alert(_XAM.xamlang.propStr("large_limit_size", l_disp_size));
                    return false;
                }
            } else {
                for(var i=0; i<files.length;i++) {
                    if(parseInt(_XAM.env.file_size_max_mb) * 1024 * 1024 < files[i].size){ 
                        alert(_XAM.xamlang.propStr("kam_each_file_size", _XAM.env.file_size_max_mb+"MB"));
                        return false; 
                    }
                };
                if (_flist.length > parseInt(_XAM.env.attach_limit_count)){                
//                if (_flist.length + files.length > parseInt(_XAM.env.attach_limit_count)){
                    alert(_XAM.xamlang.propStr("kam_limit_count", _XAM.env.attach_limit_count));
                    return false;
                }

                //2023.01.31 추가 START//
                var _temp_total = parseInt(_XAM.env.attach_limit_size) * 1024 * 1024;
                var _temp_add_size = 0;
                $.each(files, function(n, f){ _temp_add_size += f.size; })
                _temp_add_size += _sf;

                if(_temp_add_size > _temp_total){ 
                    alert(_XAM.xamlang.propStr("kam_normal_size_over"));
                    return false;
                }
                //2023.01.31 추가 END//
            }
            
            //2023.01.31 수정
//          _sf = _sf + this.normal_file_size_check();
            _sf = _sf - this.large_file_size_check();
            if(_sf > (parseInt(_XAM.env.attach_limit_size) * 1024 * 1024)){
                var disp_size;
                if(_XAM.env.attach_limit_size.length >= 4){
                    disp_size = (parseInt(_XAM.env.attach_limit_size) /1024).toFixed(2) + "GB"
                } else {
                    disp_size = _XAM.env.attach_limit_size + "MB"
                }
                alert(_XAM.xamlang.propStr("kam_limit_size", disp_size)); return false; 
            }

            if(_XAM.env.attach_allow_ext_use){
                for (var i = 0; i < files.length; i++) {
                    ret = false;
                    for (var z = 0; z < _XAM.env.attach_allow_ext.split(",").length; z++) {
                        if(files[i].name.slice(files[i].name.lastIndexOf(".")+1).toLowerCase() == _XAM.env.attach_allow_ext.split(",")[z].toLowerCase().replace(/^\s+|\s+$/g, '')){
                            ret = true;
                        } 
                    };
                    if(!ret){ alert(_XAM.xamlang.propStr("kam_allow_ext",  _XAM.env.attach_allow_ext)); return false;}                    
                };
            }
            
            if(_XAM.env.attach_prevent_ext_use){
                for (var i = 0; i < files.length; i++) {
                   ret = false;
                   for (var z = 0; z < _XAM.env.attach_prevent_ext.split(",").length; z++) {
                        if(files[i].name.slice(files[i].name.lastIndexOf(".")+1).toLowerCase() == _XAM.env.attach_prevent_ext.split(",")[z].toLowerCase().replace(/^\s+|\s+$/g, '')){
                            ret = true;
                        }
                    };
                    if(ret){ alert(_XAM.xamlang.propStr("attach_prevent_ext",  _XAM.env.attach_prevent_ext.replace(/,/g, ', '))); return false;}
                };
            }
            return true;
        },
        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data),
                limit = options.limitMultiFileUploads,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i;
            
            if (!(options.singleFileUploads || limit) ||
                    !this._isXHRUpload(options)) {
                fileSet = [data.files];
                paramNameSet = [paramName];
            } else if (!options.singleFileUploads && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < data.files.length; i += limit) {
                    fileSet.push(data.files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else {
                paramNameSet = paramName;
            }
                        
            for (var x=0; x<data.files.length;x++) {

                if(data.files[x].name.length > 160){
                    alert(_XAM.xamlang.propStr("limit_file_name_size"));
                    return true;
                }
            }            
            
            if(data.files[0].size == 0){
                alert(_XAM.xamlang.propStr("no_file_size_zero"));
                return true;
            }
            if(data.files[0].name == "InvalidStateError"){
                alert(_XAM.xamlang.propStr("no_folder_add_in_ff"));
                return true;
            }
            if(typeof OnAttachBefore == "function"){ OnAttachBefore(data.files); }

            var filename_list = [];
            $("#"+_XAM.args.filelistID).find(".name").each(function(){
                if (!$(this).closest('tr').hasClass('remove')) {
                    filename_list.push($(this).text().replace(/^\s*|\s*$/g,""));
                }
            });

            if(typeof OnFileAdd == "function"){ if(!OnFileAdd(data.files, filename_list)){ return; }}
            if(!this._validate(data.files)){ return; }

            data.originalFiles = data.files;
            if(typeof OnAttachComplete == "function"){ OnAttachComplete(data.files); }
            
            $.each(fileSet || data.files, function (index, element) {
                if($.inArray(this.name, filename_list) >= 0){
                    alert(_XAM.xamlang.propStr("kam_limit_duplicate", this.name));
                    return true;
                }
                var newData = $.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                that._initResponseObject(newData);
                that._initProgressObject(newData);
                that._addConvenienceMethods(e, newData);
                result = that._trigger('add', e, newData);
                return result;
            });
            return result;
        },

        _replaceFileInput: function (input) {
            var inputClone = input.clone(true);
            $('<form></form>').append(inputClone)[0].reset();
            input.after(inputClone).detach();
            $.cleanData(input.unbind('remove'));
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
            if (input[0] === this.element[0]) {
                this.element = inputClone;
            }
        },
        _handleFileTreeEntry: function (entry, path) {
            var that = this,
                dfd = $.Deferred(),
                errorHandler = function (e) {
                    if (e && !e.entry) {
                        e.entry = entry;
                    }
                    dfd.resolve([e]);
                },
                dirReader;
            path = path || '';
            if (entry.isFile) {
                if (entry._file) {
                    entry._file.relativePath = path;
                    dfd.resolve(entry._file);
                } else {
                    entry.file(function (file) {
                        file.relativePath = path;
                        dfd.resolve(file);
                    }, errorHandler);
                }
            } else if (entry.isDirectory) {
                dirReader = entry.createReader();
                dirReader.readEntries(function (entries) {
                    that._handleFileTreeEntries(
                        entries,
                        path + entry.name + '/'
                    ).done(function (files) {
                        dfd.resolve(files);
                    }).fail(errorHandler);
                }, errorHandler);
            } else {
                dfd.resolve([]);
            }
            return dfd.promise();
        },

        _handleFileTreeEntries: function (entries, path) {
            var that = this;
            return $.when.apply(
                $,
                $.map(entries, function (entry) {
                    return that._handleFileTreeEntry(entry, path);
                })
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _getDroppedFiles: function (dataTransfer) {
            dataTransfer = dataTransfer || {};
            var items = dataTransfer.items;
            if (items && items.length && (items[0].webkitGetAsEntry ||
                    items[0].getAsEntry)) {
                return this._handleFileTreeEntries(
                    $.map(items, function (item) {
                        var entry;
                        if (item.webkitGetAsEntry) {
                            entry = item.webkitGetAsEntry();
                            if (entry) {
                                entry._file = item.getAsFile();
                            }
                            return entry;
                        }
                        return item.getAsEntry();
                    })
                );
            }
            return $.Deferred().resolve(
                $.makeArray(dataTransfer.files)
            ).promise();
        },
        
        _getSingleFileInputFiles: function (fileInput) {
            fileInput = $(fileInput);
            var entries = fileInput.prop('webkitEntries') ||
                    fileInput.prop('entries'),
                files,
                value;
            if (entries && entries.length) {
                return this._handleFileTreeEntries(entries);
            }
            files = $.makeArray(fileInput.prop('files'));
            
            if (!files.length) {
                value = fileInput.prop('value');
                if (!value) {
                    return $.Deferred().resolve([]).promise();
                }
                
                /* IE10 이하에서 XAM 구동되도록 처리 */
                if(this._getIESupport()){
                    filesize = this._getSingleFileSize(value);
                    files = [{name: value.replace(/^.*\\/, ''), size: filesize}];
                } else {
                    files = [{name: value.replace(/^.*\\/, '')}];   
                }
                /* IE10 이하에서 XAM 구동되도록 처리 */
                
            } else if (files[0].name === undefined && files[0].fileName) {
                $.each(files, function (index, file) {
                    file.name = file.fileName;
                    file.size = file.fileSize;
                });
            }
            return $.Deferred().resolve(files).promise();
        },
        /* IE10 이하에서 XAM 구동되도록 처리 */           
        _getIESupport : function(){
            return typeof document === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)
        },        
        /* IE10 이하에서 XAM 구동되도록 처리 */        
        _getSingleFileSize: function (filepath) {
            var sizeinbytes = '';
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            var thefile = fso.getFile(filepath);
            sizeinbytes = thefile.size;
            return sizeinbytes;
        },
        _getFileInputFiles: function (fileInput) {
            if (!(fileInput instanceof $) || fileInput.length === 1) {
                return this._getSingleFileInputFiles(fileInput);
            }
            return $.when.apply(
                $,
                $.map(fileInput, this._getSingleFileInputFiles)
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },
        _onChange: function (e) {
            var that = this,
                data = {
                    fileInput: $(e.target),
                    form: $(e.target.form)
                };
            this._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                if (that.options.replaceFileInput) {
                    that._replaceFileInput(data.fileInput);
                }
                if (that._trigger('change', e, data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onPaste: function (e) {
            var items = e.originalEvent && e.originalEvent.clipboardData &&
                    e.originalEvent.clipboardData.items,
                data = {files: []};
            if (items && items.length) {
                $.each(items, function (index, item) {
                    var file = item.getAsFile && item.getAsFile();
                    if (file) {
                        data.files.push(file);
                    }
                });
                if (this._trigger('paste', e, data) === false ||
                        this._onAdd(e, data) === false) {
                    return false;
                }
            }
        },

        _onDrop: function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var that = this,
                dataTransfer = e.dataTransfer,
                data = {};
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
                e.preventDefault();
                this._getDroppedFiles(dataTransfer).always(function (files) {
                    data.files = files;
                    if (that._trigger('drop', e, data) !== false) {
                        that._onAdd(e, data);
                    }
                });
            }
        },

        _onDragOver: function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var dataTransfer = e.dataTransfer;
            if (dataTransfer) {
                if (this._trigger('dragover', e) === false) {
                    return false;
                }
                if ($.inArray('Files', dataTransfer.types) !== -1) {
                    dataTransfer.dropEffect = 'copy';
                    e.preventDefault();
                }
            }
        },

        _initEventHandlers: function () {
            if (this._isXHRUpload(this.options)) {
                this._on(this.options.dropZone, {
                    dragover: this._onDragOver,
                    drop: this._onDrop
                });
                this._on(this.options.pasteZone, {
                    paste: this._onPaste
                });
            }
            if ($.support.fileInput) {
                this._on(this.options.fileInput, {
                    change: this._onChange
                });
            }
        },

        _destroyEventHandlers: function () {
            this._off(this.options.dropZone, 'dragover drop');
            this._off(this.options.pasteZone, 'paste');
            this._off(this.options.fileInput, 'change');
        },

        _setOption: function (key, value) {
            var reinit = $.inArray(key, this._specialOptions) !== -1;
            if (reinit) {
                this._destroyEventHandlers();
            }
            this._super(key, value);
            if (reinit) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input[type="file"]') ?
                        this.element : this.element.find('input[type="file"]');
            } else if (!(options.fileInput instanceof $)) {
                options.fileInput = $(options.fileInput);
            }
            if (!(options.dropZone instanceof $)) {
                options.dropZone = $(options.dropZone);
            }
            if (!(options.pasteZone instanceof $)) {
                options.pasteZone = $(options.pasteZone);
            }
        },

        _getRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _isRegExpOption: function (key, value) {
            return key !== 'url' && $.type(value) === 'string' &&
                /^\/.*\/[igm]{0,3}$/.test(value);
        },

        _initDataAttributes: function () {
            var that = this,
                options = this.options;
            $.each(
                $(this.element[0].cloneNode(false)).data(),
                function (key, value) {
                    if (that._isRegExpOption(key, value)) {
                        value = that._getRegExp(value);
                    }
                    options[key] = value;
                }
            );
        },

        _create: function () {
            this._initDataAttributes();
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = 0;
            this._initProgressObject(this);
            this._initEventHandlers();
        },
        active: function () {
            return this._active;
        },
        progress: function () {
            return this._progress;
        },
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            if (data.fileInput && !data.files) {
                this._getFileInputFiles(data.fileInput).always(function (files) {
                    data.files = files;
                    that._onAdd(null, data);
                });
            } else {
                data.files = $.makeArray(data.files);
                this._onAdd(null, data);
            }
        },
        send: function (data) {
            if (data && !this.options.disabled) {
                if (data.fileInput && !data.files) {
                    var that = this,
                        dfd = $.Deferred(),
                        promise = dfd.promise(),
                        jqXHR,
                        aborted;
                    promise.abort = function () {
                        aborted = true;
                        if (jqXHR) {
                            return jqXHR.abort();
                        }
                        dfd.reject(null, 'abort', 'abort');
                        return promise;
                    };
                    this._getFileInputFiles(data.fileInput).always(
                        function (files) {
                            if (aborted) {
                                return;
                            }
                            if (!files.length) {
                                dfd.reject();
                                return;
                            }
                            data.files = files;
                            jqXHR = that._onSend(null, data).then(
                                function (result, textStatus, jqXHR) {
                                    dfd.resolve(result, textStatus, jqXHR);
                                },
                                function (jqXHR, textStatus, errorThrown) {
                                    dfd.reject(jqXHR, textStatus, errorThrown);
                                }
                            );
                        }
                    );
                    return this._enhancePromise(promise);
                }
                data.files = $.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });

}));


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    var counter = 0;

    $.ajaxTransport('iframe', function (options) {
        if (options.async) {
            var form,
                iframe,
                addParamChar;
            return {
                send: function (_, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    form.attr('accept-charset', options.formAcceptCharset);
                    addParamChar = /\?/.test(options.url) ? '&' : '?';
                    if (options.type === 'DELETE') {
                        options.url = options.url + addParamChar + '_method=DELETE';
                        options.type = 'POST';
                    } else if (options.type === 'PUT') {
                        options.url = options.url + addParamChar + '_method=PUT';
                        options.type = 'POST';
                    } else if (options.type === 'PATCH') {
                        options.url = options.url + addParamChar + '_method=PATCH';
                        options.type = 'POST';
                    }
                    counter += 1;
                    iframe = $(
                        '<iframe src="javascript:false;" name="iframe-transport-' +
                            counter + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones,
                            paramNames = $.isArray(options.paramName) ?
                                    options.paramName : [options.paramName];
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                try {
                                    response = iframe.contents();
                                    if (!response.length || !response[0].firstChild) {
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                $('<iframe src="javascript:false;"></iframe>')
                                    .appendTo(form);
                                window.setTimeout(function () {
                                    form.remove();
                                }, 0);
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        //console.log(options.fileInput)
                        if (options.fileInput && options.fileInput.length &&
                                options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function (index) {
                                    $(this).prop(
                                        'name',
                                        paramNames[index] || options.paramName
                                    );
                                });
                            }
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                .prop('encoding', 'multipart/form-data');
                        }
                        //console.log(form)
                        form.submit();
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                $(input).prop('name', clone.prop('name'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        iframe
                            .unbind('load')
                            .prop('src', 'javascript'.concat(':false;'));
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return iframe && $(iframe[0].body).text();
            },
            'iframe json': function (iframe) {
                return iframe && $.parseJSON($(iframe[0].body).text());
            },
            'iframe html': function (iframe) {
                return iframe && $(iframe[0].body).html();
            },
            'iframe xml': function (iframe) {
                var xmlDoc = iframe && iframe[0];
                return xmlDoc && $.isXMLDoc(xmlDoc) ? xmlDoc :
                        $.parseXML((xmlDoc.XMLDocument && xmlDoc.XMLDocument.xml) ||
                            $(xmlDoc.body).html());
            },
            'iframe script': function (iframe) {
                return iframe && $.globalEval($(iframe[0].body).text());
            }
        }
    });

}));

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            './jquery.fileupload'
        ], factory);
    } else {
        factory(
            window.jQuery
        );
    }
}(function ($) {
    'use strict';

    var originalAdd = $._XAM.fileupload.prototype.options.add;

    $.widget('_XAM.fileupload', $._XAM.fileupload, {

        options: {
            processQueue: [
                /*
                {
                    action: 'log',
                    type: 'debug'
                }
                */
            ],
            add: function (e, data) {
                var $this = $(this);
                data.process(function () {
                    return $this.fileupload('process', data);
                });
                originalAdd.call(this, e, data);
            }
        },

        processActions: {
            /*
            log: function (data, options) {
                console[options.type](
                    'Processing "' + data.files[data.index].name + '"'
                );
            }
            */
        },

        _processFile: function (data) {
            var that = this,
                dfd = $.Deferred().resolveWith(that, [data]),
                chain = dfd.promise();
            this._trigger('process', null, data);
            $.each(data.processQueue, function (i, settings) {
                var func = function (data) {
                    return that.processActions[settings.action].call(
                        that,
                        data,
                        settings
                    );
                };
                chain = chain.pipe(func, settings.always && func);
            });
            chain
                .done(function () {
                    that._trigger('processdone', null, data);
                    that._trigger('processalways', null, data);
                })
                .fail(function () {
                    that._trigger('processfail', null, data);
                    that._trigger('processalways', null, data);
                });
            return chain;
        },

        _transformProcessQueue: function (options) {
            var processQueue = [];
            $.each(options.processQueue, function () {
                var settings = {},
                    action = this.action,
                    prefix = this.prefix === true ? action : this.prefix;
                $.each(this, function (key, value) {
                    if ($.type(value) === 'string' &&
                            value.charAt(0) === '@') {
                        settings[key] = options[
                            value.slice(1) || (prefix ? prefix +
                                key.charAt(0).toUpperCase() + key.slice(1) : key)
                        ];
                    } else {
                        settings[key] = value;
                    }

                });
                processQueue.push(settings);
            });
            options.processQueue = processQueue;
        },

        processing: function () {
            return this._processing;
        },

        process: function (data) {
            var that = this,
                options = $.extend({}, this.options, data);
            if (options.processQueue && options.processQueue.length) {
                this._transformProcessQueue(options);
                if (this._processing === 0) {
                    this._trigger('processstart');
                }
                $.each(data.files, function (index) {
                    var opts = index ? $.extend({}, options) : options,
                        func = function () {
                            return that._processFile(opts);
                        };
                    opts.index = index;
                    that._processing += 1;
                    that._processingQueue = that._processingQueue.pipe(func, func)
                        .always(function () {
                            that._processing -= 1;
                            if (that._processing === 0) {
                                that._trigger('processstop');
                            }
                        });
                });
            }
            return this._processingQueue;
        },

        _create: function () {
            this._super();
            this._processing = 0;
            this._processingQueue = $.Deferred().resolveWith(this)
                .promise();
        }

    });

}));


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            './jquery.fileupload-process'
        ], factory);
    } else {
        factory(
            window.jQuery
        );
    }
}(function ($) {
    'use strict';

    $._XAM.fileupload.prototype.options.processQueue.push(
        {
            action: 'validate',
            always: true,
            acceptFileTypes: '@',
            maxFileSize: '@',
            minFileSize: '@',
            maxNumberOfFiles: '@',
            disabled: '@disableValidation'
        }
    );

    $.widget('_XAM.fileupload', $._XAM.fileupload, {

        options: {
            getNumberOfFiles: $.noop,
            messages: {
                maxNumberOfFiles: 'Maximum number of files exceeded',
                acceptFileTypes: 'File type not allowed',
                maxFileSize: 'File is too large',
                minFileSize: 'File is too small'
            }
        },

        processActions: {
            validate: function (data, options) {        
                if (options.disabled) {
                    return data;
                }
                var dfd = $.Deferred(),
                    settings = this.options,
                    file = data.files[data.index];
                if ($.type(options.maxNumberOfFiles) === 'number' &&
                        (settings.getNumberOfFiles() || 0) + data.files.length >
                            options.maxNumberOfFiles) {
                    file.error = settings.i18n('maxNumberOfFiles');
                } else if (options.acceptFileTypes &&
                        !(options.acceptFileTypes.test(file.type) ||
                        options.acceptFileTypes.test(file.name))) {
                    file.error = settings.i18n('acceptFileTypes');
                } else if (options.maxFileSize && file.size >
                        options.maxFileSize) {
                    file.error = settings.i18n('maxFileSize');
                } else if ($.type(file.size) === 'number' &&
                        file.size < options.minFileSize) {
                    file.error = settings.i18n('minFileSize');
                } else {
                    delete file.error;
                }
                if (file.error || data.files.error) {
                    data.files.error = true;
                    dfd.rejectWith(this, [data]);
                } else {
                    dfd.resolveWith(this, [data]);
                }
                return dfd.promise();
            }

        }

    });

}));


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'tmpl',
            './jquery.fileupload-image',
            './jquery.fileupload-audio',
            './jquery.fileupload-video',
            './jquery.fileupload-validate'
        ], factory);
    } else {
        factory(
            window.jQuery,
            window.tmpl
        );
    }
}(function ($, tmpl, loadImage) {
    'use strict';

    $._XAM.fileupload.prototype._specialOptions.push(
        'filesContainer',
        'emptyTemplateId',
        'uploadTemplateId',
        'downloadTemplateId',
        'readTemplateId'
    );

    $.widget('_XAM.fileupload', $._XAM.fileupload, {

        options: {
            autoUpload: false,
            emptyTemplateId: 'template-empty',   
            uploadTemplateId: 'template-upload',
            downloadTemplateId: 'template-download',
            readTemplateId: 'template-read',
            filesContainer: undefined,
            prependFiles: false,
            dataType: 'json',
            getNumberOfFiles: function () {
                return this.filesContainer.children().length;
            },
            getFilesFromResponse: function (data) {
                if (data.result && $.isArray(data.result.files)) {
                    return data.result.files;
                }
                if ($.isArray(data.files)) {
                    return data.files;
                }
                return [];
            },
            add: function (e, data) {
                var $this = $(this), that = $this.data('_XAM-fileupload') || $this.data('fileupload'), options = that.options, files = data.files;
                data.process(function () {
                    return $this.fileupload('process', data);
                }).always(function () {
                    data.context = that._renderUpload(files).data('data', data);
                    that._renderPreviews(data);
                    options.filesContainer[options.prependFiles ? 'prepend' : 'append'](data.context);
                    that._forceReflow(data.context);
                    that._transition(data.context).done(function(){
                        $("<div>", { "style": 'display:none;',"class":"finfo" }).appendTo(data.context.find('td:first-child')).append("<span class='real-size'>" + data.files[0].size + "</span>");
                        if ((that._trigger('added', e, data) !== false) && (options.autoUpload || data.autoUpload) && 
                            data.autoUpload !== false && !data.files.error) {
                            data.submit();
                        }
                    });
                    that.draw_file_size();
                });
            },
            send: function (e, data) {
                var that = $(this).data('_XAM-fileupload') || $(this).data('fileupload');
                if (data.context && data.dataType &&
                    data.dataType.substr(0, 6) === 'iframe') {
                        data.context.find('.progress').addClass(!$.support.transition && 'progress-animated')
                        .attr('aria-valuenow', 100).children().first().css('width','100%');
                }
                return that._trigger('sent', e, data);
            },
            done: function (e, data) {
                var that = $(this).data('_XAM-fileupload') || $(this).data('fileupload'),
                    getFilesFromResponse = data.getFilesFromResponse || that.options.getFilesFromResponse,   
                    files = getFilesFromResponse(data), template, deferred;
                if (data.context) {
                        data.context.each(function (index) {
                            var file = files[index] || {error: 'Empty file upload result'};
                            deferred = that._addFinishedDeferreds();
                            that._transition($(this)).done(function(){
                                var node = $(this);
                                if(node.find(".bigfile").hasClass("btn_bigfile_"+_XAM.env.lang)){ file.isBigfile = true; }
                                template = that._renderDownload([file], true).replaceAll(node);
                                that._forceReflow(template);
                                that._transition(template).done(function(){
                                    data.context = $(this);
                                    that._trigger('completed', e, data);
                                    that._trigger('finished', e, data);
                                    deferred.resolve();
                                    
                                    if (data.result && $.isArray(data.result.files)) {
                                        $("<div>", { "style": 'display:none;',"class":"finfo" }).appendTo(data.context.find('td:first-child'))
                                        .append("<span class='real-size'>" + data.result.files[0].size + "</span>")
                                        .append("<span class='real-name'>" + (data.result.files[0].r_name==undefined?data.result.files[0].name:data.result.files[0].r_name) + "</span>")
                                        .append("<span class='content-type'>" + data.result.files[0].type + "</span>")
                                        .append("<span class='download-path'>" + (data.result.files[0].url==undefined?'':data.result.files[0].url) + "</span>");   
                                    } else {
                                        $("<div>", { "style": 'display:none;',"class":"finfo" }).appendTo(data.context.find('td:first-child'))
                                        .append("<span class='real-size'>" + data.files[0].size + "</span>")
                                        .append("<span class='real-name'>" + (data.files[0].r_name==undefined?data.files[0].name:data.files[0].r_name) + "</span>")
                                        .append("<span class='content-type'>" + data.files[0].type + "</span>")
                                        .append("<span class='download-path'>" + (data.files[0].url==undefined?'':data.files[0].url) + "</span>");                                          
                                    }
                                  
                                });
                            }
                        );
                    });                        
                } else {
                    template = that._renderDownload(files)[that.options.prependFiles ? 'prependTo' : 'appendTo'](that.options.filesContainer);
                    that._forceReflow(template);
                    deferred = that._addFinishedDeferreds();
                    that._transition(template).done(function(){
                            data.context = $(this);
                            that._trigger('completed', e, data);
                            that._trigger('finished', e, data);
                            deferred.resolve();                                 
                        }
                    );
                }
            },
            fail: function (e, data) {
                var that = $(this).data('_XAM-fileupload') || $(this).data('fileupload'), template, deferred;
                if (data.context) {
                    data.context.each(function (index) {
                        if (data.errorThrown !== 'abort') {
                            var file = data.files[index];
                            file.error = file.error || data.errorThrown || true;
                            deferred = that._addFinishedDeferreds();
                            that._transition($(this)).done(function(){
                                    var node = $(this);
                                    if(node.find(".bigfile").hasClass("btn_bigfile_"+_XAM.env.lang)){ file.isBigfile = true; }
                                    template = that._renderDownload([file]).replaceAll(node);
                                    that._forceReflow(template);
                                    that._transition(template).done(function(){
                                            data.context = $(this);
                                            that._trigger('failed', e, data);
                                            that._trigger('finished', e, data);
                                            deferred.resolve();
                                        }
                                    );
                                }
                            );
                        } else {
                            deferred = that._addFinishedDeferreds();
                            that._transition($(this)).done(function(){
                                    $(this).remove();
                                    that._trigger('failed', e, data);
                                    that._trigger('finished', e, data);
                                    deferred.resolve();
                                }
                            );
                        }
                    });
                } else if (data.errorThrown !== 'abort') {
                    data.context = that._renderUpload(data.files)[
                        that.options.prependFiles ? 'prependTo' : 'appendTo'
                    ](that.options.filesContainer).data('data', data);
                    that._forceReflow(data.context);
                    deferred = that._addFinishedDeferreds();
                    that._transition(data.context).done(function(){
                            data.context = $(this);
                            that._trigger('failed', e, data);
                            that._trigger('finished', e, data);
                            deferred.resolve();
                        }
                    );
                } else {
                    that._trigger('failed', e, data);
                    that._trigger('finished', e, data);
                    that._addFinishedDeferreds().resolve();
                }
            },
            progress: function (e, data) {
                var progress = Math.floor(data.loaded / data.total * 100);
                if (data.context) {
                    data.context.each(function(){
                        $(this).find('.progress').attr('aria-valuenow', progress).children().first().css('width',progress + '%');
                    });
                }
            },
            progressall: function (e, data) {
                var $this = $(this), progress = Math.floor(data.loaded / data.total * 100),
                    globalProgressNode = $this.find('.fileupload-progress'),
                    extendedProgressNode = globalProgressNode.find('.progress-extended');
                if (extendedProgressNode.length) {
                    extendedProgressNode.html(
                        ($this.data('_XAM-fileupload') || $this.data('fileupload'))._renderExtendedProgress(data)
                    );
                }
                globalProgressNode.find('.progress').attr('aria-valuenow', progress).children().first().css('width',progress + '%');
            },
            start: function (e) {
                var that = $(this).data('_XAM-fileupload') || $(this).data('fileupload');
                that._resetFinishedDeferreds();
                that._transition($(this).find('.fileupload-progress')).done(function(){
                    that._trigger('started', e);
                });
            },
            stop: function (e) {
                var that = $(this).data('_XAM-fileupload') || $(this).data('fileupload'), deferred = that._addFinishedDeferreds();
                $.when.apply($, that._getFinishedDeferreds()).done(function(){
                    that._trigger('stopped', e);
                });
                that._transition($(this).find('.fileupload-progress')).done(function(){
                    $(this).find('.progress').attr('aria-valuenow', '0').children().first().css('width', '0%');
                        $(this).find('.progress-extended').html('&nbsp;');
                        deferred.resolve();
                });
            },
            processstart: function () {
                $(this).addClass('fileupload-processing');
            },
            processstop: function () {
                $(this).removeClass('fileupload-processing');
            },
            destroy: function (e, data) {
                var that = $(this).data('_XAM-fileupload') ||
                        $(this).data('fileupload'),
                    removeNode = function () {
                        that._transition(data.context).done(
                            function () {
                                $(this).remove();
                                that._trigger('destroyed', e, data);
                            }
                        );
                    };
                if (data.url) {
                    $.ajax(data).done(removeNode);
                } else {
                    removeNode();
                }
            }
        },
        _resetFinishedDeferreds: function () {
            this._finishedUploads = [];
        },
        _addFinishedDeferreds: function (deferred) {
            if (!deferred) {
                deferred = $.Deferred();
            }
            this._finishedUploads.push(deferred);
            return deferred;
        },
        _getFinishedDeferreds: function () {
            return this._finishedUploads;
        },
        _enableDragToDesktop: function () {
            var link = $(this),
                url = link.prop('href'),
                name = link.prop('download'),
                type = 'application/octet-stream';
            link.bind('dragstart', function (e) {
                try {
                    e.originalEvent.dataTransfer.setData(
                        'DownloadURL',
                        [type, name, url].join(':')
                    );
                } catch (ignore) {}
            });
        },
        _formatFileSize: function (bytes) {
            if (typeof bytes !== 'number') {
                bytes = parseInt(bytes);
                //return '';
            }
            if (bytes >= (1024*1024*1024)) {
                return parseFloat((bytes / (1024*1024*1024)).toFixed(2)) + 'GB';
            }
            if (bytes >= (1024*1024)) {
                return parseFloat((bytes / (1024*1024)).toFixed(2)) + 'MB';
            }
            return parseFloat((bytes / 1024).toFixed(2)) + 'KB';
        },
        _formatBitrate: function (bits) {
            if (typeof bits !== 'number') {
                return '';
            }
            if (bits >= 1000000000) {
                return (bits / 1000000000).toFixed(2) + 'Gbit/s';
            }
            if (bits >= 1000000) {
                return (bits / 1000000).toFixed(2) + 'Mbit/s';
            }
            if (bits >= 1000) {
                return (bits / 1000).toFixed(2) + 'kbit/s';
            }
            return bits.toFixed(2) + 'bit/s';
        },
        _formatTime: function (seconds) {
            var date = new Date(seconds * 1000),
                days = Math.floor(seconds / 86400);
            days = days ? days + 'd ' : '';
            return days +
                ('0' + date.getUTCHours()).slice(-2) + ':' +
                ('0' + date.getUTCMinutes()).slice(-2) + ':' +
                ('0' + date.getUTCSeconds()).slice(-2);
        },
        _formatPercentage: function (floatValue) {
            return (floatValue * 100).toFixed(2) + ' %';
        },
        _renderExtendedProgress: function (data) {
            return this._formatBitrate(data.bitrate) + ' | ' +
                this._formatTime(
                    (data.total - data.loaded) * 8 / data.bitrate
                ) + ' | ' +
                this._formatPercentage(
                    data.loaded / data.total
                ) + ' | ' +
                this._formatFileSize(data.loaded) + ' / ' +
                this._formatFileSize(data.total);
        },
        _renderTemplate: function (func, files) {
            if (!func) {
                return $();
            }
            var result = func({
                files: files,
                formatFileSize: this._formatFileSize,
                options: this.options
            });
            if (result instanceof $) {
                return result;
            }
            $(this.options.templatesContainer).html(result);
            return $(this.options.templatesContainer).children();
        },
        _renderPreviews: function (data) {
            data.context.find('.preview').each(function (index, elm) {
                $(elm).append(data.files[index].preview);
            });
        },
        _renderEmpty: function(){ return this._renderTemplate(this.options.emptyTemplate, null); },
        _renderUpload: function (files) {   
            return this._renderTemplate(
                this.options.uploadTemplate,
                files
            );
        },
        _renderDownload: function (files) {
            return this._renderTemplate(
                this.options.downloadTemplate,
                files
            ).find('a[download]').each(this._enableDragToDesktop).end();
        },
        _renderRead: function(files) {          
            return this._renderTemplate(
                this.options.readTemplate,
                files
            ).find('a[download]').each(this._enableDragToDesktop).end();
        },
        _startHandler: function (e) {
            e.preventDefault();
            var button = $(e.currentTarget),
                template = button.closest('.template-upload'),
                data = template.data('data');
            if (data && data.submit && !data.jqXHR && data.submit()) {
                button.prop('disabled', true);
            }
        },
        _cancelHandler : function (e) {
            e.preventDefault();
            var template = $(e.currentTarget).closest('.template-upload,.template-download'),
                data = template.data('data') || {};
            var temp = {
                deleteType : "DELETE",
                deleteUrl : _XAM.env.normal_upload_url + "/" + this.safe_url(window.frameElement.getAttribute("save_path")) + "/" + template.find(".real-name").text(),
                name : template.find(".name").text(),
                r_name : template.find(".real-name").text(),
                size : parseInt(template.find(".real-size").text()),
                type : template.find(".content-type").text(),
                url : _XAM.env.normal_upload_url + "/" + this.safe_url(window.frameElement.getAttribute("save_path")) + "/" + template.find(".real-name").text()
            };
            if(typeof OnDeleteBefore == "function"){ OnDeleteBefore(temp); }
            if (!data.jqXHR) {
                data.context = data.context || template;
                data.errorThrown = 'abort';
                this._trigger('fail', e, data);
            } else {
                data.jqXHR.abort();
            }
            this.draw_file_size();
            if($("#"+_XAM.args.filelistID).find("tr").not(".template-empty").length === 0){
                var _empty = this._renderEmpty();
                this._forceReflow(_empty);
                this.options.filesContainer["append"](_empty);
                _empty.toggleClass('in');
                if($("#"+_XAM.args.filelistID).find(".template-empty").length > 0){
                    var _cells = $("#"+_XAM.args.filelistID).closest('table').find('col').length;
                    $("#"+_XAM.args.filelistID).find(".template-empty td").attr('colspan', _cells);    
                    $("#"+_XAM.args.filelistID).find(".template-empty").height($("#"+_XAM.args.fileID).height()-$("#"+_XAM.args.fileID).find('th').height()-10);
                    /*
                    $("#"+_XAM.args.filelistID).find(".template-empty").off("click").on("click", function(){
                        $(':file').trigger('click');
                    })
                    */
                }
                if (!$.support.dragdrop){
                    $("#" + _XAM.args.filelistID).find(".template-empty").remove();   
                } 
            }            
            if(typeof OnDeleteComplete == "function"){ OnDeleteComplete(temp); }
        },
        _biguploadHandler: function(e){
            e.preventDefault();
            var button = $(e.currentTarget);
            if($(button).parent().prev().prev().children().text() == "Complete"){
                alert(_XAM.xamlang.propStr("already_upload_complete"));
                return;
            }
            if((parseInt(_XAM.env.large_file_size) * 1024 * 1024) < parseInt(button.closest("tr").find(".real-size").text().replace(/^\s+|\s+$/g, ''))){
                alert(_XAM.xamlang.propStr("no_change_file_type", _XAM.env.large_file_size));
                return;
            }
                     
            if(button.hasClass("btn_bigfile_" +_XAM.env.lang)){
                if($('#'+_XAM.args.filelistID).find(".btn_bigfile_" + _XAM.env.lang).closest("tr").length - 1 > parseInt(_XAM.env.large_file_limit_count)){
                    alert(_XAM.xamlang.propStr("large_limit_count", _XAM.env.large_file_limit_count));
                    return false;
                }
            } else {
                if($('#'+_XAM.args.filelistID).find(".btn_bigfile_" + _XAM.env.lang).closest("tr").length + 1 > parseInt(_XAM.env.large_file_limit_count)){
                    alert(_XAM.xamlang.propStr("large_limit_count", _XAM.env.large_file_limit_count));
                    return false;
                }
                
                if((parseInt(_XAM.env.large_file_limit) * 1024 * 1024) 
                    < (this.large_file_size_check() + parseInt(button.closest("tr").find(".real-size").text().replace(/^\s+|\s+$/g, '')))){ 
                    var l_disp_size;
                    if(_XAM.env.large_file_limit.length >= 4){
                        l_disp_size = (parseInt(_XAM.env.large_file_limit) /1024).toFixed(2) + "GB"
                    } else {
                        l_disp_size = _XAM.env.large_file_limit + "MB"
                    }
                    alert(_XAM.xamlang.propStr("large_limit_size", l_disp_size));
                    return false; 
                }
            }            

            if(button.hasClass("btn_change_" +_XAM.env.lang)){
                button.removeClass("btn_change_"+_XAM.env.lang).addClass("btn_bigfile_" +_XAM.env.lang);
                if(_XAM.env.is_limit_period){
                    var date = new Date(); 
                    date.setDate(date.getDate() + parseInt(_XAM.env.limit_period));
                    var nd = new Date(date);
                    button.parent().next().children()[0].innerHTML = "~ " + (nd.getMonth()+1) + "." + nd.getDate();                    
                }
                $(button).html(_XAM.xamlang.propStr("kam_big_file"));
            } else {
                if((parseInt(_XAM.env.attach_limit_size) * 1024 * 1024) < this.normal_file_size_check() + (parseInt(button.closest("tr").find(".real-size").text().replace(/^\s+|\s+$/g, '')))){
                    alert(_XAM.xamlang.propStr("kam_limit_size", _XAM.env.attach_limit_size + "MB"));
                    return;
                }

                button.removeClass("btn_bigfile_"+_XAM.env.lang).addClass("btn_change_" +_XAM.env.lang);
                if(_XAM.env.is_limit_period){
                    button.parent().next().children()[0].innerHTML = _XAM.xamlang.propStr("am_file_nolimit");   
                }
                $(button).html(_XAM.xamlang.propStr("kam_normal"));
            }
            
            $(button).closest("tr").find(".name").trigger("click");
            
            this.draw_file_size();
        },
        _deleteHandler: function (e) {
            e.preventDefault();
            var button = $(e.currentTarget);
            this._trigger('destroy', e, $.extend({  context: button.closest('.template-download'),  type: 'DELETE'  }, button.data()));
        },
        _forceReflow: function (node) { return $.support.transition && node.length && node[0].offsetWidth; },
        _transition: function (node) {
            $("#" + _XAM.args.filelistID).find(".template-empty").remove();            
            if($("#"+_XAM.args.filelistID).find("tr").not(".template-empty").length === 0){
                var _empty = this._renderEmpty();
                this._forceReflow(_empty);
                this.options.filesContainer["append"](_empty);
                _empty.toggleClass('in');
            } 
            
            if($("#"+_XAM.args.filelistID).find(".template-empty").length > 0){
                var _cells = $("#"+_XAM.args.filelistID).closest('table').find('col').length;
                $("#"+_XAM.args.filelistID).find(".template-empty td").attr('colspan', _cells);
                $("#"+_XAM.args.filelistID).find(".template-empty").height($("#"+_XAM.args.fileID).height()-$("#"+_XAM.args.fileID).find('th').height()-10);
                /*
                $("#"+_XAM.args.filelistID).find(".template-empty").off("click").on("click", function(){
                    $(':file').trigger('click');
                })
                */
            }

            if (!$.support.dragdrop){
                $("#" + _XAM.args.filelistID).find(".template-empty").remove();   
            }            
            var dfd = $.Deferred();
            if ($.support.transition && node.hasClass('fade') && node.is(':visible')) {
                node.bind(
                    $.support.transition.end,
                    function (e) {
                        if (e.target === node[0]) {
                            node.unbind($.support.transition.end);
                            dfd.resolveWith(node);
                        }
                    }
                ).toggleClass('in');
            } else {
                node.toggleClass('in');
                dfd.resolveWith(node);
            }
            return dfd;
        },
        _initButtonBarEventHandlers: function () {
            var fileUploadButtonBar = this.element.find('.fileupload-buttonbar'),
                filesList = this.options.filesContainer;
            this._on(fileUploadButtonBar.find('.start'), {
                click: function (e) {
                    e.preventDefault();
                    filesList.find('.start').click();
                }
            });
            this._on(fileUploadButtonBar.find('.cancel'), {
                click: function (e) {
                    e.preventDefault();
                    filesList.find('.cancel').click();
                }
            });
            this._on(fileUploadButtonBar.find('.delete'), {
                click: function (e) {
                    e.preventDefault();
                    filesList.find('.toggle:checked')
                        .closest('.template-download')
                        .find('.delete').click();
                    fileUploadButtonBar.find('.toggle')
                        .prop('checked', false);
                }
            });
            this._on(fileUploadButtonBar.find('.toggle'), {
                change: function (e) {
                    filesList.find('.toggle').prop(
                        'checked',
                        $(e.currentTarget).is(':checked')
                    );
                }
            });
        },
        _destroyButtonBarEventHandlers: function () {
            this._off(
                this.element.find('.fileupload-buttonbar')
                    .find('.start, .cancel, .delete, .bigfile'),
                'click'
            );
            this._off(
                this.element.find('.fileupload-buttonbar .toggle'),
                'change.'
            );
        },
        _initEventHandlers: function () {
            this._super();
            this._on(this.options.filesContainer, {
                'click .start': this._startHandler,
                'click .cancel': this._cancelHandler,
                'click .delete': this._deleteHandler,
                'click .bigfile': this._biguploadHandler
            });
            this._initButtonBarEventHandlers();
        },
        _destroyEventHandlers: function () {
            this._destroyButtonBarEventHandlers();
            this._off(this.options.filesContainer, 'click');
            this._super();
        },
        _enableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', false)
                .parent().removeClass('disabled');
        },
        _disableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', true)
                .parent().addClass('disabled');
        },
        _initTemplates: function () {
            var options = this.options;
            options.templatesContainer = this.document[0].createElement(
                options.filesContainer.prop('nodeName')
            );
            if (tmpl) {
                if (options.emptyTemplateId) {
                    options.emptyTemplate = tmpl(options.emptyTemplateId);
                }               
                if (options.uploadTemplateId) {
                    options.uploadTemplate = tmpl(options.uploadTemplateId);
                }
                if (options.downloadTemplateId) {
                    options.downloadTemplate = tmpl(options.downloadTemplateId);
                }
                if (options.readTemplateId) {
                    options.readTemplate = tmpl(options.readTemplateId);
                }
            }
        },
        _initFilesContainer: function () {
            var options = this.options;
            if (options.filesContainer === undefined) {
                options.filesContainer = this.element.find('#'+_XAM.args.filelistID);
            } else if (!(options.filesContainer instanceof $)) {
                options.filesContainer = $(options.filesContainer);
            }
        },
        _initSpecialOptions: function () {
            this._super();
            this._initFilesContainer();
            this._initTemplates();
        },
        _create: function () {
            this._super();
            this._resetFinishedDeferreds();
            if (!$.support.fileInput) {
                this._disableFileInputButton();
            }
            this.draw_file_size();
            var options = this.options;
            var _empty = this._renderEmpty();
            this._forceReflow(_empty);
            options.filesContainer[options.prependFiles ? 'prepend' : 'append'](_empty);
            this._transition(_empty);  
        },
        enable: function () {
            var wasDisabled = false;
            if (this.options.disabled) {
                wasDisabled = true;
            }
            this._super();
            if (wasDisabled) {
                this.element.find('input, button').prop('disabled', false);
                this._enableFileInputButton();
            }
        },
        disable: function () {
            if (!this.options.disabled) {
                this.element.find('input, button').prop('disabled', true);
                this._disableFileInputButton();
            }
            this._super();
        },
        draw_file_size : function(){
            var sum = this.normal_file_size_check();
            var count = this.get_file_count();
            var sum_mb = sum / 1024 / 1024; var sum_gb = sum/1024/1024/1024;
            var disp_size;
            if(sum_gb >1 && (sum_gb+"").length > 1){
                disp_size = Math.round(sum_gb*100)/100;
                disp_size = this.numberFormat(disp_size+'') + 'GB';
            } else {
                if (sum_mb >= 1){
                    disp_size = Math.round(sum_mb * 100)/100;
                    disp_size = this.numberFormat(disp_size+'') + 'MB';
                } else {
                    disp_size = Math.round(sum / 1024 * 100)/100;
                    disp_size = this.numberFormat(disp_size+'') + 'KB';
                }
            }

            if (count > 0){
                var size_text = _XAM.xamlang.propStr("am_file_count_size", count, disp_size);
                $("#"+_XAM.args.fileSizeID).html(size_text);                
            } else {
                $("#"+_XAM.args.fileSizeID).html('');               
            }
            
            /*
            sum += (this.saved_size ? this.saved_size : 0);
            var sum_mb = sum / 1024 / 1024; var sum_gb = sum/1024/1024/1024;
            var disp_size;
            if(sum_gb >1 && (sum_gb+"").length > 1){
                disp_size = Math.round(sum_gb*100)/100;
                disp_size = this.numberFormat(disp_size+'') + 'GB';
            } else {
                if (sum_mb >= 1){
                    disp_size = Math.round(sum_mb * 100)/100;
                    disp_size = this.numberFormat(disp_size+'') + 'MB';
                } else {
                    disp_size = Math.round(sum / 1024 * 100)/100;
                    disp_size = this.numberFormat(disp_size+'') + 'KB';
                }
            }
            var disp_limit;
            if(_XAM.env.attach_limit_size.length >= 4){
                disp_limit = (parseInt(_XAM.env.attach_limit_size) /1024).toFixed(2) + "GB"
            } else {
                disp_limit = _XAM.env.attach_limit_size + "MB"
            }
            if(_XAM.env.attach_limit_size == "unlimited" ){  disp_limit = " "; }
            
            var size_text = "";
            if (_XAM.env.is_large_file_upload){
                size_text = _XAM.xamlang.propStr("am_file_normal", disp_size, disp_limit);
            } else {
                size_text = _XAM.xamlang.propStr("am_file_count_size", disp_size, disp_limit);
            }
            if($("#btn_zip_down").is(":visible")){
                var attach_count = $("#"+_XAM.args.filelistID).find("tr").length + "";
                size_text = _XAM.xamlang.propStr("down_file_count_size", attach_count, disp_size);
            }
            if(_XAM.env.attach_limit_size == "unlimited" ){  size_text = size_text.replace("/",""); }
            $("#"+_XAM.args.fileSizeID).html(size_text);
    
            if(_XAM.env.is_large_file_upload && !$("#btn_zip_down").is(":visible")){
                if(_XAM.env.large_file_limit.length >= 4){
                    disp_limit = (parseInt(_XAM.env.large_file_limit) /1024).toFixed(2) + "GB"
                } else {
                    disp_limit = _XAM.env.large_file_limit + "MB"
                }
                var l_sum = this.large_file_size_check();
                var sum_mb = l_sum / 1024 / 1024; 
                var sum_gb = l_sum /1024/1024/1024;
                disp_size = 0;
                if(sum_gb >1 && (sum_gb+"").length > 1){
                    disp_size = Math.round(sum_gb*100)/100;
                    disp_size = this.numberFormat(disp_size+'') + 'GB';
                } else {
                    if (sum_mb >= 1){
                        disp_size = Math.round(sum_mb * 100)/100;
                        disp_size = this.numberFormat(disp_size+'') + 'MB';
                    } else {
                        disp_size = Math.round(l_sum / 1024 * 100)/100;
                        disp_size = this.numberFormat(disp_size+'') + 'KB';
                    }
                }
                size_text = _XAM.xamlang.propStr("am_file_large", disp_size, disp_limit + "&nbsp;x" + _XAM.env.large_file_limit_count);
                $("#"+_XAM.args.LargefileSizeID).html("|&nbsp;"+size_text);
            } else {
                $("#"+_XAM.args.LargefileSizeID).html("");
            }
            */
            //var __ih = $('#' + _XAM.args.fileID).height() + 44;
            var __ih = $('#fileupload').height();
            $(window.frameElement).height(__ih + "px");
        },
        numberFormat : function(num) {
            var pattern = /(-?[0-9]+)([0-9]{3})/;
            while(pattern.test(num)){ 
                num = num.replace(pattern,"$1,$2");
            }
            return num;
        },
        setDownDisplay : function(isHide){      
            if (isHide) {
                
                $("#file_add").off();
                $(document).off("keyup");
                $(document).off("dragover").on('dragover', function() {return false;});
                $(document).off("dragleave drop").on('dragleave drop', function() {return false;});
                
                if (_XAM.args.deleteCallback==undefined||_XAM.args.deleteCallback=='') {
                    $("#" + _XAM.args.fileID + " table tr").off("click");
                }
                
                var remove_idx = $('#'+_XAM.args.fileID + ' table').find('col').length;
                if(remove_idx > 5){
                    var _t = remove_idx - 5;
                    for (var _z=0; _z < _t; _z++) {
                        $('#'+_XAM.args.fileID + ' table').find('col:nth-child(' + (remove_idx-_z) + '),th:nth-child(' + (remove_idx-_z) + ')').remove();                    
                    }
                }
                
                /*
                $('#'+_XAM.args.fileID + ' table').find('col:nth-child(1)').hide();
                $('#'+_XAM.args.fileID + ' table thead').find('th:nth-child(1)').hide();
                $('#'+_XAM.args.fileID + ' table').find('col:nth-child(4),th:nth-child(4)').hide();
                */              
                if (_XAM.args.deleteCallback==undefined||_XAM.args.deleteCallback=='') {
                    $('#'+_XAM.args.fileID + ' table').find('col:nth-child(1)').remove();
                    $('#'+_XAM.args.fileID + ' table thead').find('th:nth-child(1)').remove();
                    $('#'+_XAM.args.fileID + ' table').find('col:nth-child(3),th:nth-child(3)').remove();  
                } else {
                    $('#'+_XAM.args.fileID + ' table').find('col:nth-child(4),th:nth-child(4)').remove();                   
                }
            }
            
            _XAM.loader.script(parent.scriptBasePath + "xam.jszip.js?open&ver=2.0.0.32").script(parent.scriptBasePath + "xam.download.zip.js?open&ver=2.0.0.32").wait(function(e){
                parent.XAM.g.addScript("etc/jquery.blockUI.js?open", function(){

                    $("#btn_zip_down").off().on("click", function(){
                        var list = [];
                        $.each($("#"+_XAM.args.filelistID + " tr"), function(n, v){
                            if (!$(this).hasClass("template-upload")&&$(this).hasClass("click-on")) {
                                var file_info = {
                                        order: n,
                                        fileDownUrl: $(v).find(".file_name a").attr("href"),
                                        filename: $(v).find(".file_name a").text().replace(/^\s*|\s*$/g, ''),
                                        size: ($(v).find(".file_size").data('size')?$(v).find(".file_size").data('size'):$(v).find(".finfo .real-size").text())
                                    };

                                    list.push(file_info);                               
                            }
                        });
                        if (list.length == 0) {
                            alert(_XAM.xamlang.propStr("zip_compression_nofile"));return;
                        } else {
                            xamSaveZip.zipStart(list);
                        }
                    });                                         

            if ($("#"+_XAM.args.filelistID + " tr").length) {
                        $("#btn_zip_down").removeClass('disable');
                    } else {
                        $("#btn_zip_down").addClass('disable');
                    }
                    
            $("#btn_preview").off().on("click", function(){
                        var list = [];
                        $.each($("#"+_XAM.args.filelistID + " tr"), function(n, v){
                            if (!$(this).hasClass("template-upload")&&$(this).hasClass("click-on")) {
            
                                var file_info = {
                                        order: n,
                                        fileDownUrl: $(v).find(".file_name a").attr("href"),
                                        filename: $(v).find(".file_name a").text().replace(/^\s*|\s*$/g, ''),
                                        size: ($(v).find(".file_size").data('size')?$(v).find(".file_size").data('size'):$(v).find(".finfo .real-size").text())
                                    };

                                    list.push(file_info);                               
                            }
                        });
                        if (list.length == 0) {
                            alert(_XAM.xamlang.propStr("kam_preview_nofile"));return;
                        } else if (list.length > 1) {
                            alert(_XAM.xamlang.propStr("kam_limit_preview"));
                        } else {
                            callPreview(list);
                        }
                    });         

                    if ($("#"+_XAM.args.filelistID + " tr").length) {
                        $("#btn_zip_down").removeClass('disable');
                    } else {
                        $("#btn_zip_down").addClass('disable');
                    }
                });
            });             

        },
        large_file_size_check : function(){
            var sum = 0;
            //2023.09.06 real-size를 size로 수정
            $('#'+_XAM.args.filelistID).find(".btn_bigfile_"+_XAM.env.lang).closest("tr").find(".size").each(function(){
                var temp_file_size = $(this).text();
                var real_bit = 0;

                if (temp_file_size.indexOf("KB") > -1){
                    real_bit = parseFloat(temp_file_size.replace("KB","")) * 1024
                }else if (temp_file_size.indexOf("MB") > -1){
                    real_bit = parseFloat(temp_file_size.replace("MB","")) * 1024 * 1024
                }else if (temp_file_size.indexOf("GB") > -1){
                    real_bit = parseFloat(temp_file_size.replace("GB","")) * 1024 * 1024 * 1024
                } else {
                    real_bit = temp_file_size;
                }
                sum += parseInt(real_bit);
            });
            return sum;
        },
        normal_file_size_check : function(){
            /*
            var sum = 0;
            var file_list = this.get_file_list();
            for (var _ele in file_list){
                var f_ele = file_list[_ele];
                if (_XAM.args.isEdit) {
                    if (f_ele.status=='wait') {
                        sum += f_ele.size;
                    }
                } else {
                    sum += f_ele.size;
                }
            }
             $("#"+_XAM.args.filelistID).find("tr").find('.size').each(function(){
                var temp_file_size = $(this).text();
                var real_bit = 0;
                if (temp_file_size.indexOf("KB") > -1){
                    real_bit = parseFloat(temp_file_size.replace(" KB","")) * 1024
                }else if (temp_file_size.indexOf("MB") > -1){
                    real_bit = parseFloat(temp_file_size.replace(" KB","")) * 1024 * 1024
                }else if (temp_file_size.indexOf("GB") > -1){
                    real_bit = parseFloat(temp_file_size.replace(" KB","")) * 1024 * 1024 * 1024
                }
                sum += parseInt(real_bit);
            });
            */

            var sum = 0;
            var normal_list;
            if(_XAM.env.is_large_file_upload){
                normal_list = $("#"+_XAM.args.filelistID).find("tr:not('.remove')").find(".btn_change_"+_XAM.env.lang); 
            } else {
                normal_list = $("#"+_XAM.args.filelistID).find("tr:not('.remove')");
            }
            normal_list.closest("tr").find('.real-size').each(function(){
                var temp_file_size = $(this).text();
                var real_bit = 0;
                if (temp_file_size.indexOf("KB") > -1){
                    real_bit = parseFloat(temp_file_size.replace(" KB","")) * 1024
                } else if (temp_file_size.indexOf("MB") > -1){
                    real_bit = parseFloat(temp_file_size.replace(" KB","")) * 1024 * 1024
                } else if (temp_file_size.indexOf("GB") > -1){
                    real_bit = parseFloat(temp_file_size.replace(" KB","")) * 1024 * 1024 * 1024
                } else {
                    real_bit = parseFloat(temp_file_size);
                }
                sum += parseInt(real_bit);
            });
            return sum;
        },
        safe_url : function(url){
            var temp = "";
            return url;
        },
        get_file_list : function(status){ 
            var temp = [];
            var _file_list = $("#"+_XAM.args.filelistID + " tr .finfo" + (status == "done" ? " tr .upload-status:contains('Complete')" : " tr .finfo" ))
            for(var k=0; k < $("#"+_XAM.args.filelistID + " tr .finfo").length; k++){
                /*
                temp.push({
                    deleteType : "DELETE",
                    deleteUrl : _XAM.env.normal_upload_url + "/" + encodeURIComponent($(files).find(".finfo .real-name").get(k).innerText),
                    name : $(files).find(".name").get(k).innerText,
                    r_name : $(files).find(".finfo .real-name").get(k).innerText,
                    size : parseInt($(files).find(".finfo .real-size").get(k).innerText),
                    type : $(files).find(".finfo .content-type").get(k).innerText,
                    url : _XAM.env.normal_upload_url + "/" + encodeURIComponent($(files).find(".finfo .real-name").get(k).innerText)
                });
                */
                var $tr = $(files).find(".finfo:eq(" + k + ")").closest('tr');
                var statusEl = $tr.find('.upload-status');
                var status = '';
                if (statusEl.length == 0) {
                    status = 'wait';
                } else if ($tr.hasClass('remove')) {
                    status = 'remove';
                } else if (statusEl.hasClass('complete')) {
                    status = 'complete';
                } else if (statusEl.hasClass('error')) {
                    status = 'error';
                } else {
                    status = 'unknown';
                }
                temp.push({
                    name : $(files).find(".name").get(k).innerText,
                    size : parseInt($(files).find(".finfo .real-size").get(k).innerText),
                    status : status,
                    isbigfile : ($tr.find(".btn_bigfile_"+_XAM.env.lang).length==0?false:true)               
                });
            }
            return temp;
        },
        get_file_count : function(){
            /*
            var count = 0;
            var file_list = this.get_file_list();
            for (var _ele in file_list){
                var f_ele = file_list[_ele];
                if (_XAM.args.isEdit) {
                    if (f_ele.status=='wait') {
                        count = count + 1;
                    }
                } else {
                    count = count + 1;
                }
            } 
            return count;
            return $("#"+_XAM.args.filelistID + " tr").length; 
            */
            return $("#"+_XAM.args.filelistID + " tr:not('.remove')").length; 
        },    
        get_all_count : function(){
            var count = 0;
            var file_list = this.get_file_list();
            for (var _ele in file_list){
                var f_ele = file_list[_ele];
                if (f_ele.status!='remove') {
                    count = count + 1;  
                }
            } 
            return count;
        },    
        get_all_size : function(){
            var size = 0;
            var file_list = this.get_file_list();
            for (var _ele in file_list){
                var f_ele = file_list[_ele];
                if (f_ele.status!='remove') {
                    size = size + parseInt(f_ele.size); 
                }
            } 
            return size;
        },           
        initDisplay : function(){
            if (!$.support.dragdrop){
                $("#btn_mypc").html(_XAM.xamlang.propStr("popup_title"));
            }           
            $('#up').off().on("click", function(){
                if ( $('#'+_XAM.args.fileID + ' .click-on').length > 1 ){
                    alert(_XAM.xamlang.propStr("kam_limit_move"));
                    return false;
                }

                var row = $('#'+_XAM.args.fileID + ' .click-on:first');
                
                if (typeof OnMoveBefore == 'function') {
                    var file = {
                            name: row.find('.file_name').text().replace(/^\s*|\s*$/g, ''),
                            status: row.find('.upload-status').hasClass('complete') ? 'complete' : ''
                        };
                    if (!OnMoveBefore(file, row, 'up')) {
                        return false;
                    }
                }
                
                row.insertBefore(row.prev());
                return false;
            });
            
            $('#down').off().on("click", function(){
                if ( $('#'+_XAM.args.fileID + ' .click-on').length > 1 ){
                    alert(_XAM.xamlang.propStr("kam_limit_move"));
                    return false;
                }
                
                var row = $('#'+_XAM.args.fileID + ' .click-on:first');
                
                if (typeof OnMoveBefore == 'function') {
                    var file = {
                            name: row.find('.file_name').text().replace(/^\s*|\s*$/g, ''),
                            status: row.find('.upload-status').hasClass('complete') ? 'complete' : ''
                        };
                    if (!OnMoveBefore(file, row, 'down')) {
                        return false;
                    }
                }

                row.insertAfter(row.next());
                return false;
            });
            
            $(window).blur(function(){
                $('#'+_XAM.args.fileID).removeClass('click-on');
                $("#"+_XAM.args.filelistID).find(".ripple").remove();
                $("#"+_XAM.args.filelistID).find("tr").css({"background":""});
            });
            $(document).keyup(function(e){ 
                if (e.keyCode == 46) $('#btn_delete').click(); 
                if (e.keyCode == 38) $('#up').click(); 
                if (e.keyCode == 40) $('#down').click(); 
            });
            
            $('body').on('selectstart', function(){ return false; });
            $('body').on('dragstart', function(){ return false; });
            
            $(document).on('dragover', function(){ $('#'+_XAM.args.fileID).addClass('dragover'); });
            $(document).on('dragleave drop', function(){ $('#'+_XAM.args.fileID).removeClass('dragover'); });
            
            var remove_idx = $('#'+_XAM.args.fileID + ' table').find('col').length;
            if(!_XAM.env.is_limit_period){  $('#'+_XAM.args.fileID + ' table').find('col:nth-child(' + remove_idx + '),th:nth-child(' + remove_idx + ')').remove(); }
            remove_idx -= 1;
            if(!_XAM.env.is_large_file_upload){
                $('#'+_XAM.args.fileID + ' table').find('col:nth-child(' + remove_idx + '),th:nth-child(' + remove_idx + ')').remove();
                if($("#"+_XAM.args.filelistID).find(".template-empty").length > 0){
                    var _cells = $("#"+_XAM.args.filelistID).closest('table').find('col').length;
                    $("#"+_XAM.args.filelistID).find(".template-empty td").attr('colspan', _cells);
                    $("#"+_XAM.args.filelistID).find(".template-empty").height($("#"+_XAM.args.fileID).height()-$("#"+_XAM.args.fileID).find('th').height()-10);
                }                
            } else {
                if(_XAM.env.is_large_file_upload && _XAM.env.is_limit_period){
                    $('#'+_XAM.args.filelistID).addClass("large_file");
                } else {
                    $('#'+_XAM.args.filelistID).addClass("large_file_no_period");
                }
            }
        }
    });

}));