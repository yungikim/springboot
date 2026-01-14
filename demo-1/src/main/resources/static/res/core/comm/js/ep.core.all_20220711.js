/**
 *  2014.09.18
 *  - tony
 */
(function($) {
	"use strict";
	if(typeof $ep == "undefined") { return;};	
	$.datepicker.regional["global"] = {
			prevText: $ep.LangString("DATETIME.PREV"),
			nextText: $ep.LangString("DATETIME.NEXT"),
			currentText: $ep.LangString("DATETIME.TODAY"),
			monthNames: $ep.LangString("DATETIME.MONTHNAMES").slice(12),
			monthNamesShort: $ep.LangString("DATETIME.MONTHNAMES").slice(12),
			dayNames :  $ep.LangString("DATETIME.DAYNAMES").slice(7),                 
			dayNamesShort : $ep.LangString("DATETIME.DAYNAMES").slice(0,7),
			dayNamesMin : $ep.LangString("DATETIME.DAYNAMES").slice(0,7),
			weekHeader: "Wk", 
			dateFormat: $ep.LangString("DATETIME.FULLDATE"),
			firstDay: 0,
			isRTL: false,
			showMonthAfterYear: $ep.lang() == "en" ? false : true,
			yearSuffix:  $ep.LangString("DATETIME.YEAR"),
			yearRange: "c-60:c+60"
		};
		$.datepicker.setDefaults($.datepicker.regional["global"]);
})(jQuery);


(function(window) {
	"use strict";
    var re = {
        not_string: /[^s]/,
        number: /[dief]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fiosuxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    };
 
    function sprintf() {
        var key = arguments[0], cache = sprintf.cache;
        if (!(cache[key] && cache.hasOwnProperty(key))) {
            cache[key] = sprintf.parse(key);
        }
        return sprintf.format.call(null, cache[key], arguments);
    };

    sprintf.format = function(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = "";
        for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i]);
            if (node_type === "string") {
                output[output.length] = parse_tree[i];
            }
            else if (node_type === "array") {
                match = parse_tree[i]; // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]));
                        }
                        arg = arg[match[2][k]];
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]];
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++];
                }

                if (get_type(arg) == "function") {
                    arg = arg();
                }

                if (re.not_string.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)));
                }

                if (re.number.test(match[8])) {
                    is_positive = arg >= 0;
                }

                switch (match[8]) {
                    case "b":
                        arg = arg.toString(2);
                    break;
                    case "c":
                        arg = String.fromCharCode(arg);
                    break;
                    case "d":
                    case "i":
                        arg = parseInt(arg, 10);
                    break;
                    case "e":
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                    break;
                    case "f":
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                    break;
                    case "o":
                        arg = arg.toString(8);
                    break;
                    case "s":
                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg);
                    break;
                    case "u":
                        arg = arg >>> 0;
                    break;
                    case "x":
                        arg = arg.toString(16);
                    break;
                    case "X":
                        arg = arg.toString(16).toUpperCase();
                    break;
                };
                if (re.number.test(match[8]) && (!is_positive || match[3])) {
                    sign = is_positive ? "+" : "-";
                    arg = arg.toString().replace(re.sign, "");
                }
                else {
                    sign = "";
                }
                pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " ";
                pad_length = match[6] - (sign + arg).length;
                pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : "";
                output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg);
            }
        }
        return output.join("");
    };

    sprintf.cache = {};

    sprintf.parse = function(fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = match[0];
            }
            else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = "%";
            }
            else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list[field_list.length] = field_match[1];
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1];
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1];
                            }
                            else {
                                throw new SyntaxError("[sprintf] failed to parse named argument key");
                            }
                        }
                    }
                    else {
                        throw new SyntaxError("[sprintf] failed to parse named argument key");
                    }
                    match[2] = field_list;
                }
                else {
                    arg_names |= 2;
                }
                if (arg_names === 3) {
                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
                }
                parse_tree[parse_tree.length] = match;
            }
            else {
                throw new SyntaxError("[sprintf] unexpected placeholder");
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return parse_tree
    };

    var vsprintf = function(fmt, argv, _argv) {
        _argv = (argv || []).slice(0);
        _argv.splice(0, 0, fmt);
        return sprintf.apply(null, _argv);
    };

    /**
     * helpers
     */
    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    function str_repeat(input, multiplier) {
        return Array(multiplier + 1).join(input);
    }

    /**
     * export to either browser or node.js
     */
    if (typeof exports !== "undefined") {
        exports.sprintf = sprintf;
        exports.vsprintf = vsprintf;
    }
    else {
        window.sprintf = sprintf;
        window.vsprintf = vsprintf;

        if (typeof define === "function" && define.amd) {
            define(function() {
                return {
                    sprintf: sprintf,
                    vsprintf: vsprintf
                };
            });
        }
    }
})(typeof window === "undefined" ? this : window);



(function() {
	"use strict";
	if(typeof $ep == "undefined") { window.$ep= {};}
	$ep.Array = function(o){
		var _this = o;
		return {
			isArray : function (){ return Object.prototype.toString.call(_this) == '[object Array]';}
			,indexOf : function(searchElement, fromIndex) {
	 
			    var k;
	
			    // 1. Let O be the result of calling ToObject passing
			    //    the this value as the argument.
			    if (_this == null) {
			      throw new TypeError('"this" is null or not defined');
			    }
	
			    var O = Object(_this);
	
			    // 2. Let lenValue be the result of calling the Get
			    //    internal method of O with the argument "length".
			    // 3. Let len be ToUint32(lenValue).
			    var len = O.length >>> 0;
	
			    // 4. If len is 0, return -1.
			    if (len === 0) {
			      return -1;
			    }
	
			    // 5. If argument fromIndex was passed let n be
			    //    ToInteger(fromIndex); else let n be 0.
			    var n = +fromIndex || 0;
	
			    if (Math.abs(n) === Infinity) {
			      n = 0;
			    }
	
			    // 6. If n >= len, return -1.
			    if (n >= len) {
			      return -1;
			    }
	
			    // 7. If n >= 0, then Let k be n.
			    // 8. Else, n<0, Let k be len - abs(n).
			    //    If k is less than 0, then let k be 0.
			    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
	
			    // 9. Repeat, while k < len
			    while (k < len) {
			      var kValue;
			      // a. Let Pk be ToString(k).
			      //   This is implicit for LHS operands of the in operator
			      // b. Let kPresent be the result of calling the
			      //    HasProperty internal method of O with argument Pk.
			      //   This step can be combined with c
			      // c. If kPresent is true, then
			      //    i.  Let elementK be the result of calling the Get
			      //        internal method of O with the argument ToString(k).
			      //   ii.  Let same be the result of applying the
			      //        Strict Equality Comparison Algorithm to
			      //        searchElement and elementK.
			      //  iii.  If same is true, return k.
			      if (k in O && O[k] === searchElement) {
			        return k;
			      }
			      k++;
			    }
			    return -1;
			  } 
			,filter : function(fun/*, thisArg*/) {
			    'use strict';
			
			    if (_this === void 0 || _this === null) { throw new TypeError(); }
			
			    var t = Object(_this);
			    var len = t.length >>> 0;
			    if (typeof fun !== 'function') { throw new TypeError(); }
			    var res = [];
			    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			    for (var i = 0; i < len; i++) {
			      if (i in t) {
			        var val = t[i];
			        // NOTE: Technically this should Object.defineProperty at
			        //       the next index, as push can be affected by
			        //       properties on Object.prototype and Array.prototype.
			        //       But that method's new, and collisions should be
			        //       rare, so use the more-compatible alternative.
			        if (fun.call(val, i, val,t)) {
			          res.push(val);
			        } 
			      }
			    }
			
			    return res;
			}
			,datafilter : function(callBack) {
				if(!_this){return null;}
				var len = _this.length,_result = null;
				for(var _x = 0;len > _x; _x++) {
					if(!_result) {_result = [];};
					var _data = callBack.call(_this[_x],_x,_this[_x]);
					if(_data) {_result.push(_data);}}
				return _result;
			}
			,isMember : function(elt) {
				if(!_this){return null;}
				switch(typeof(elt)) {
					case "string": {if (this.indexOf(elt) > -1) {return true;}break;	}
					case "object": {
						if (Object.prototype.toString.call(elt) == "[object Array]") {
							for(var x = 0; elt.length>x;x++) {
								if(this.indexOf(elt[x]) > -1) {return true;}
							}
						};
						break;
					}
				} 
				return false;
			}
			,remove : function(from,to) {
				if(!_this){return null;} 
				var rest = _this.slice((to || from) + 1 || _this.length);
				_this.length = from < 0 ? _this.length + from : from;
				return _this.push.apply(_this, rest);
			}
		};
	}	
})();

/*
 * String/Number Object
 */
(function(Number,String) {
	"use strict";
	Number.prototype.toCurrency = function() {
		if(this==0) {return 0;}
		var reg = /(^[+-]?\d+)(\d{3})/,n = (this + '');
		while(reg.test(n)) { n=n.replace(reg,'$1,$2');}
		return n;
	};  
	Number.prototype.toSize = function() {
		var v1 = (this/1024);
		if (v1 < 1) {return this.toString() + "B";}
		var v2 = v1/1024;
		if (v2 < 1) { return (Math.round(v1*100)/100) + "K";}
		//return (Math.round(v2*100)/100).toCurrency() + " MB";
		var v3 = v2/1024;
		if (v3 < 1) { return (Math.round(v2*100)/100) + "M"; }
		return (Math.round(v3*100)/100).toCurrency() + "G";
	};

	String.prototype.toCurrency = function() {
		var num = parseFloat(this);
		if( isNaN(num)) { return "0";}
		return num.toCurrency();
	};
	String.prototype.toSize = function() {
		var num = parseFloat(this);
		if( isNaN(num)) { return "0B";}
		return num.toSize();
	};
	if(!String.prototype.trim) { 
		String.prototype.trim = function() {return this.replace(/^\s|\s\s+|\s+$/g,"");};
	}
	String.prototype.ltrim = function() {return this.replace(/^\s+/,"");};
	String.prototype.rtrim = function() {return this.replace(/\s+$/,"");};
	String.prototype.left = function(x) {
		if (typeof x === "string") {if (x == "") {return "";}var i = this.indexOf(x); return (i == -1 ? "" : this.substring(0, i));}
		else if (typeof x === "number") {return (this.length >= x ? this.substring(0,x) : this);}
		return "";
	}; 
	String.prototype.right = function(x) {
		if (typeof x === "string") {if (x == "") {return "";}var i = this.indexOf(x); return (i == -1 ? "" : this.substring(i+x.length, this.length));}
		else if (typeof x === "number") {return (this.length >= x ? this.substring(this.length - x,this.length) : this);}
		return "";
	}; 
	String.prototype.leftBack = function(a,b){
		var c = "", d = [], e = 0;
		d = a.split(b);
		e = d.length;
		for(var i = 0; i < e -1; i++) {
			if(c=="")	{c = d[i];}
			else {c = c + b + d[i];}
		}
		return c;
	};
	String.prototype.rightBack = function(a,b){
		var c = a.lastIndexOf(b);
		if (c < 0) {return "";}
		else {return (a.substring(c+b.length,a.length));}
	};
	String.prototype.toDate = function(mask) {
		var _d = new Date();
		var p= mask.search(/yyyy/);	p == -1 ?  '' : this.length < p ? '' : _d.setFullYear(parseInt(this.substr(p,4),10));
		p = mask.search(/MM/);	p == -1 ?  '' : this.length < p ? '' : _d.setMonth(parseInt(this.substr(p,2),10), 0);  
		p = mask.search(/dd/); 	p == -1 ?  '' : this.length < p ? '' : _d.setDate(parseInt(this.substr(p,2),10)); 
		p = mask.search(/hh/);	p == -1 ?  '' : this.length < p ? _d.setHours(0) : _d.setHours(parseInt(this.substr(p,2),10)); 
		p = mask.search(/mm/);	p == -1 ?  '' : this.length < p ? _d.setMinutes(0) : _d.setMinutes(parseInt(this.substr(p,2),10)); 
		p = mask.search(/ss/);p == -1 ?  '' : this.length < p ? _d.setSeconds(0) : _d.setSeconds(parseInt(this.substr(p,2),10));
		_d.setMilliseconds(0);
		return _d;
	};
	String.prototype.is8601Date = function() {
		return this.match(/^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/g) ? true : false;
	};
	String.prototype.isoToDate = function() {
		    var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
		    var date = this;
	        var timestamp, struct, minutesOffset = 0;

	        //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
	        if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
	            for (var i = 0, k; (k = numericKeys[i]); ++i) {
	                struct[k] = +struct[k] || 0;
	            }

	            // allow undefined days and months
	            struct[2] = (+struct[2] || 1) - 1;
	            struct[3] = +struct[3] || 1;
	            
	            if (struct[8] !== 'Z' && !(struct[4] || struct[5] || struct[6]) && !struct[9]) { 
	            	var _dst = (/([\+|\-])([0-9]{2})([0-9]{2})/g).exec((new Date(struct[1],parseInt(struct[2],10) - 1,struct[3])).format("o"));
	            	struct[9] = _dst[1];struct[10] = parseInt(_dst[2],10);struct[11] = parseInt(_dst[3],10);	
	            }
	            
	            if (struct[8] !== 'Z' && struct[9] !== undefined) {
	                minutesOffset = struct[10] * 60 + struct[11];

	                if (struct[9] === '+') {
	                    minutesOffset = 0 - minutesOffset;
	                }
	            }

	            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
	        }
	        else {
	            timestamp = origParse ? origParse(date) : NaN;
	        }

	        return isNaN(timestamp) ? NaN : new Date(timestamp);		 
	};
	String.prototype.toEscape = function() {
		return this.replace(/&/g,"&amp;")
				  .replace(/</g,"&lt;")
				  .replace(/>/g,"&gt;")
				  .replace(/"/g,"&quot;");		
	};
	String.prototype.unEscape = function() {
		return this.replace("&amp;","&")
				.replace(/&lt;/g,"<")
				.replace(/&gt;/g,">")
				.replace(/&quot;/g,"\"")
				.replace(/&#60;/g,"<")
				.replace(/&#62;/g,">")
				.replace(/&#33;/g,"!")
				.replace(/&#91;/g,"[")
				.replace(/&#93;/g,"]");
	};

})(Number,String);

(function(Date) {
	"use strict";
	Date.prototype.adjust = function(yr,mn,dy,hr,mi,se) {
		var m,t;
		this.setYear(this.getFullYear() + yr);
		m = this.getMonth() + mn;
		if(m != 0) 	this.setYear(this.getFullYear() + Math.floor(m/12));
		if(m == 0) 	this.setMonth(m);
		if(m < 0) {this.setMonth(12 + (m%12));} else if(m > 0) {	this.setMonth(m%12);} 
		t = this.getTime();
		t += (dy * 86400000);
		t += (hr * 3600000);
		t += (mi * 60000);
		t += (se * 1000);	
		this.setTime(t);
	};
	Date.prototype.diffday = function (oDate) {	return ((oDate.getTime() - this.getTime()) / (1000*60*60*24));};
	Date.prototype.getWeek = function() {
		var onejan = new Date(this.getFullYear(),0,1);
		return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
	};
	Date.prototype.getQuarter = function() {return Math.ceil((this.getMonth() + 1) / 3);};
})(Date);


 
/*  2011-03-30 Tony  Original : http://blog.stevenlevithan.com/archives/date-time-format 

Mask		Description
d			Day of the month as digits; no leading zero for single-digit days.
dd			Day of the month as digits; leading zero for single-digit days.
ddd		Day of the week as a three-letter abbreviation.
dddd		Day of the week as its full name.
m			Month as digits; no leading zero for single-digit months.
mm		Month as digits; leading zero for single-digit months.
mmm		Month as a three-letter abbreviation.
mmmm	Month as its full name.
yy			Year as last two digits; leading zero for years less than 10.
yyyy		Year represented by four digits.
h			Hours; no leading zero for single-digit hours (12-hour clock).
hh			Hours; leading zero for single-digit hours (12-hour clock).
H			Hours; no leading zero for single-digit hours (24-hour clock).
HH			Hours; leading zero for single-digit hours (24-hour clock).
M			Minutes; no leading zero for single-digit minutes.
			Uppercase M unlike CF timeFormat's m to avoid conflict with months.
MM		Minutes; leading zero for single-digit minutes.
			Uppercase MM unlike CF timeFormat's mm to avoid conflict with months.
s			Seconds; no leading zero for single-digit seconds.
ss			Seconds; leading zero for single-digit seconds.
l or L		Milliseconds. l gives 3 digits. L gives 2 digits.
t			Lowercase, single-character time marker string: a or p.
			No equivalent in CF.
tt			Lowercase, two-character time marker string: am or pm.
			No equivalent in CF.
T			Uppercase, single-character time marker string: A or P.
			Uppercase T unlike CF's t to allow for user-specified casing.
TT			Uppercase, two-character time marker string: AM or PM.
			Uppercase TT unlike CF's tt to allow for user-specified casing.
Z			US timezone abbreviation, e.g. EST or MDT. With non-US timezones or in the Opera browser, the GMT/UTC offset is returned, e.g. GMT-0500
			No equivalent in CF.
o			GMT/UTC timezone offset, e.g. -0500 or +0230.
			No equivalent in CF.
S			The date's ordinal suffix (st, nd, rd, or th). Works well with d.
			No equivalent in CF.
'…' or "…"	Literal character sequence. Surrounding quotes are removed.
			No equivalent in CF.
UTC:		Must be the first four characters of the mask. Converts the date from local time to UTC/GMT/Zulu time before applying the mask. The "UTC:" prefix is removed.
			No equivalent in CF.


named masks provided by default
Name				Mask									Example
default			ddd mmm dd yyyy HH:MM:ss		Sat Jun 09 2007 17:46:21
shortDate			m/d/yy								6/9/07
mediumDate		mmm d, yyyy							Jun 9, 2007
longDate			mmmm d, yyyy						June 9, 2007
fullDate			dddd, mmmm d, yyyy				Saturday, June 9, 2007
shortTime			h:MM TT								5:46 PM
mediumTime		h:MM:ss TT							5:46:21 PM
longTime			h:MM:ss TT Z						5:46:21 PM EST
isoDate			yyyy-mm-dd							2007-06-09
isoTime			HH:MM:ss							17:46:21
isoDateTime		yyyy-mm-dd'T'HH:MM:ss			2007-06-09T17:46:21
isoUtcDateTime	UTC:yyyy-mm-dd'T'HH:MM:ss'Z'	2007-06-09T22:46:21Z

<사용 예제>
var n = new Date();
var s = n.format("yyyy-mm-dd");			s = 2011-03-30
n.masks.testMasks = "yyyy-mm-dd";
var s = n.format("testMasks");			s = 2011-03-30
var s = n.format("longDate");			s = 5:46:21 PM EST

*/
 (function(Date){
	 "use strict";

	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */

	var dateFormat = function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}
			
			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (isNaN(date)) throw SyntaxError("invalid date");

			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dF.i18n.dayNames[D],
					dddd: dF.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dF.i18n.monthNames[m],
					mmmm: dF.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};
				
				/*var _arr = mask.match(token)
					,_result = mask;
				if(_arr) {
					$.each(_arr, function(_idx, _val) {
						_result = _result.replace( _val, _val in flags ? flags[_val] : _val.slice(1, _val.length - 1));
					});
				};
				return _result;*/
				return mask.replace(token, function ($0) {
					return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
				});
		};
	}();

	// Some common format strings
	dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};
	// Internationalization strings
	dateFormat.masks["today"] = typeof $ep !== "undefined" && $ep.LangString && $ep.LangString("DATEFORMAT.TODAY"); 
	dateFormat.masks["beforeDay"] = typeof $ep !== "undefined" && $ep.LangString && $ep.LangString("DATEFORMAT.BEFOREDAY");
	dateFormat.masks["beforeDayTime"]= typeof $ep !== "undefined" && $ep.LangString && $ep.LangString("DATEFORMAT.BEFOREDAYTIME");
	dateFormat.masks["fullDateTime"] = typeof $ep !== "undefined" && $ep.LangString && $ep.LangString("DATEFORMAT.FULLDATETIME");
	dateFormat.masks["fullDate"] = typeof $ep !== "undefined" && $ep.LangString && $ep.LangString("DATEFORMAT.FULLDATE");
	dateFormat.i18n = {  
		dayNames: typeof $ep !== "undefined" && $ep.LangString && $ep.LangString("DATETIME.DAYNAMES")
		,monthNames: typeof $ep !== "undefined" && $ep.LangString && $ep.LangString("DATETIME.MONTHNAMES")
	};
	
	// For convenience...
	Date.prototype.format = function (mask, utc) {
		return dateFormat(this, mask, utc);
	};
	Date.prototype.masks = dateFormat.masks;
})(Date);
 
(function(jQuery){
	"use strict";
	var keyString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var uTF8Encode = function(string) {
		string = string.replace(/\x0d\x0a/g, "\x0a");
		var output = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				output += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				output += String.fromCharCode((c >> 6) | 192);
				output += String.fromCharCode((c & 63) | 128);
			} else {
				output += String.fromCharCode((c >> 12) | 224);
				output += String.fromCharCode(((c >> 6) & 63) | 128);
				output += String.fromCharCode((c & 63) | 128);
			}
		}
		return output; 
	};
	var uTF8Decode = function(input) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < input.length ) {
			c = input.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = input.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = input.charCodeAt(i+1);
				c3 = input.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	};

	jQuery.extend({
		base64Encode: function(input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			input = uTF8Encode(input);
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output + keyString.charAt(enc1) + keyString.charAt(enc2) + keyString.charAt(enc3) + keyString.charAt(enc4);
			}
			return output;
		},
		base64Decode: function(input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = keyString.indexOf(input.charAt(i++));
				enc2 = keyString.indexOf(input.charAt(i++));
				enc3 = keyString.indexOf(input.charAt(i++));
				enc4 = keyString.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = uTF8Decode(output);
			return output;
		}
	});
})(jQuery);
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	"use strict";
	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

jQuery.CURI = function(v,arg) {
	"use strict";
	var _u = {
		_ou : {_$protocol : "", _$host : "", _$path : "", _$port : "", _$cmd : "", _$query : null, _$anchor : ""}
		,url :""
		,full : ""
		,isEncode : false			
		,arguments : null
		,host : function(_v) {if (_v){_ou._$host = _v;_update();return;} else {return _ou._$host ? _ou._$host : location.hostname == "" ? "localhost": location.hostname;}}
		,port : function(_v) { if (_v) {_ou._$port = _v;_update();	return;} else { return _ou._$port;}}
		,getNSF : function(){
			return this.url.match(/(.*\.nsf)/gi) ? RegExp.$1 : "";			
		}
		,getArguments : function(sep) { 
			var _r = "", 
			_q = _ou._$query;
			for(var _o in _q) {
			  _r = (_q[_o] ?_r ? _r + (sep ? sep : "&") + _o + "=" + 
					  (this.isEncode ? encodeURIComponent(_q[_o]) : _q[_o]) : _r + _o + "=" +(this.isEncode ? encodeURIComponent(_q[_o]) : _q[_o]) : _r);
			}
			return _r;
		}
		,server : function(server) {
			if(!server){ return this;}
			var _path = _ou._$path,_reg = new RegExp('^\/'+server+'\/',"gi");
			if(_reg.test(_path)) {return this;	}
			this.path("/" + _path);			
			return this;
		}
		,encode : function() {this.isEncode = true;_update();return this;}
		,decode : function() {
			if(this.isEncode) {this.isEncode = false;_update();return this;}
			/*이미 encode된 url을 강제로 decode 함.*/
			var _q = _ou._$query;for(var _o in _q) { _q[_o] = decodeURIComponent(_q[_o]);}
			_update();	return this;
		}
		,path : function(_v) { if (_v) {_ou._$path = _v;_update();return;} else { return _ou._$path;}}
		,protocol : function(_v) { if (_v) {_ou._$protocol = _v;_update();return;} else { return _ou._$protocol;}}
		,base : function() {
			return (_ou._$protocol ? _ou._$protocol : "http") + "://"
			  + _u.host()  + (_ou._$port ? ":" + (_ou._$port == "80" ? "" : _ou._$port) : ""); 
		}
		,cmd : function(_v) { if (_v) {_ou._$cmd = _v;_update();return;} else { return _ou._$cmd;}}
		,anchor : function(_v) {if (_v) {_ou._$anchor = _v;_update();return;} else { return _ou._$anchor;}}
		,getParam : function(_v) {return _ou._$query ? _ou._$query[_v] : undefined;}
		,setParam : function(k,_v) {if (typeof(k) == "object") {_OBJparse(k);} else { _ou._$query[k] = _v;};_update();return this;}
		,setArgv : function(_v) {
		  if(!_v) {return;}
		  if(typeof _v === "string") { _QParse(_v); }
		  else if(typeof _v === "object") {_OBJparse(_v);}
		  _update();
		  return this; 
		}
		,getBase : function() {	return _ou._$path + (_ou._$cmd ? "?"+_ou._$cmd : "");}
		,setBase : function(_v) { _URLparse(_v); _update();	return;	}
	}, _ou = _u._ou;
	
	function _init() {
		if (typeof v === "undefined") {v = document.location.href;}
		switch(typeof(v)) {	case "string": _URLparse(v);break;	case "object": _OBJparse(v);break;}
		switch(typeof(arg)) {case "object" :_OBJparse(arg);break;case "string": _QParse(arg);break;}
		_update();
	};
	function _QParse(_s) {
	  if (!_s) {return null;};
	  var _a = _s.split("&");
	  for (var o = 0; o < _a.length; o++) { var __a = _a[o].split("=");if(!_ou._$query) _ou._$query = {};
		  _ou._$query[__a[0]] = (__a.length > 1 ? __a.slice(1,__a.length).join("=") : ""); }; 
	};			
	function _URLparse(_s) {
	    if (!_s.match(/^(?:([a-z]*(?=[:]\/\/))[:]\/\/([^\/:]*(?=[:\/]|$))?[:]?([0-9]*)?)?([^?&]+)?(?:[?]?([^=&]+(?=(?=[&|$])|$)))?(?:[&|?]?([^#]+))?(?:[#]?(.*))/gi)) return;
	    _ou._$protocol = (RegExp.$1 ? RegExp.$1 : _ou._$protocol),_ou._$host = (RegExp.$2 ? RegExp.$2 : _ou._$host)
	    ,_ou._$port = (RegExp.$3 ? RegExp.$3 : _ou._$port), _ou._$path = (RegExp.$4 ? RegExp.$4 : _ou._$path)
	    ,_ou._$cmd = (RegExp.$5 ? RegExp.$5 : _ou._$cmd);
	    _QParse(RegExp.$6);
	    _ou._$anchor = (RegExp.$7 ? RegExp.$7 : _ou._$anchor);
	};
	function _OBJparse(_v) {
	  for (var __o in _v) {
	    if(typeof _ou[__o] !== "undefined") {_ou[__o] = (typeof _v[__o] === "function" ? _v[__o]() : _v[__o]) ;continue;}
	    if(__o == "base") {_URLparse(_v[__o]);continue;} 
	    if(!_ou._$query) {_ou._$query = {};}
	    _ou._$query[__o] = (typeof _v[__o] === "function" ? _v[__o]() : _v[__o]);
	  }
	};
	function _update() {
		var _argu = _u.getArguments("&");
	  _u.arguments = _ou._$query;
	  _u.url = (_ou._$protocol ? _ou._$protocol + "://" : (_ou._$port||_ou._$host != "") ? "http://" : "")
		  + (_ou._$port ? _u.host() : _ou._$host) + (_ou._$port ?  (_ou._$port == "80" ? "" : ":"+_ou._$port) : "") +_ou._$path + (_ou._$cmd ? "?"+_ou._$cmd : "")
		  + (_ou._$query ? (_argu ? _ou._$cmd ?  "&" : "?" : "" ) + _argu : "") + (_ou._$anchor ? "#"+_ou._$anchor : "");
	  _u.full = (_ou._$protocol ? _ou._$protocol : "http") + "://"
		  + _u.host()  + (_ou._$port ? ":" + (_ou._$port == "80" ? "" : _ou._$port) : "") 
		  + (_ou._$path.match(/^\//g) ? _ou._$path : "/" + _ou._$path) + (_ou._$cmd ? "?"+_ou._$cmd : "") 
		  + (_ou._$query ? (_argu ? _ou._$cmd ?  "&" : "?" : "" ) + _argu : "") + (_ou._$anchor ? "#"+_ou._$anchor : "");
	};
	_init(); 
	return _u;
};
jQuery.winOpen = function(url,target,ofeatures,isreplace) {
	"use strict";
	var _o = (function(_feat) {
		var __o = {}
			,__dLeft = typeof window.screenX !== "undefined" ? window.screenX : window.screenLeft
			,__dTop = typeof window.screenY !== "undefined" ? window.screenY : 
					typeof window.screenTop !== "undefined" ? window.screenTop - 60 :  0 
					  /*typeof window.outerHeight !== "undefined" ? window.outerHeight :
					  typeof window.screenTop !== "undefined" ? window.screenTop :  0 */
			,__outerHeight = typeof window.outerHeight !== "undefined" ? window.outerHeight : 870
			//,__innerHeight = (window.innerHeight ? window.innerHeight : 738)
			,__innerHeight = typeof window.innerHeight !== "undefined" ? window.innerHeight :
							typeof document.documentElement.clientHeight !== "undefined" ? document.documentElement.clientHeight :
							typeof document.body.clientHeight !== "undefined" ? document.body.clientHeight :  738
			,__dSkin =  __outerHeight - __innerHeight - 6
			,__innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		switch(typeof _feat) {
		case "string":
			var _f = _feat;
			while(_f.match(/(\w+)=(\w+)/g)){
				var _re = new RegExp(RegExp.$1+"=" + RegExp.$2,"g");
				if(RegExp.$1) {	__o[RegExp.$1] = RegExp.$2;}
				_f = _f.replace(_re,"");
			}
			break;
		case "object":
			__o = $.extend(true,__o,_feat);
			break;
		}
		__o.titlebar = typeof __o.titlebar !== "undefined" ? __o.titlebar :"1"; 
		__o.name = ""; 
		__o.width = __o.width|| 870; 
		__o.height =__o.height || (__innerHeight);  
		__o.resizable = __o.resizable || "1";
		__o.modal = "1"; 
		__o.top = typeof __o.top !== "undefined" ? __o.top : 
			parseInt(__innerHeight ? ((__innerHeight / 2) - (Number(__o.height) / 2) + __dTop) : 0, 10);
		__o.left = typeof __o.left !== "undefined" ? __o.left : 
			parseInt(__innerWidth ? ((__innerWidth / 2) - (Number(__o.width) / 2) + __dLeft) : 0 , 10);
		return __o;
	})(ofeatures); 
	function getFeatures() {
		var ret = "";	
		$.each(_o,function(_idx,_v) {
			if(_v !== "") {	ret += ((ret == "" ? "" : ",")+(_idx +"=" + _v ));}
		});
		return ret;
	}
	var _features = getFeatures();
	//if(console.log){console.log("features",_features);};
	var w = $.windowOpen(url,target,_features,isreplace);
	return w;
};
jQuery.windowOpen = function(url,target,features,isreplace) {
	var w = window.open(url,target,features,isreplace);
	if (w == null) {return null;	}
	w.focus(); 
	return w;
};
jQuery.goSiteLink = function(_so) {
	"use strict";
	if(typeof _so.type === "undefined") {return;}
	function _post(_w) {
		var _body = $("body")[0], f = $("<form />").appendTo($(_body));
		if(_so.url) {f.attr("action", _so.url);}
		f.attr("method","post");
		if(_so.target) {f.attr("target",_so.target);} 
		else {f.attr("target","_blank");}
		if(_so.data) {
			$.each(_so.data, function(idx,dd) {
				$('<input type="hidden" />').appendTo(f).attr("name",idx).val((typeof dd === "function" ? dd() : dd));
			});
		}
		f.submit().ready(function() {f.remove();if(_w) {_w.focus();}});		
		return;
	};
	function _get() {
		var ourl = $.CURI(_so.url, _so.data, true).decode().encode();	
		$.winOpen(ourl.url, (_so.target ? _so.target : ""), (_so.feature ? _so.feature : "" ));
		ourl = null;
	};
	function _open() {
		var _w = null;
		if (_so.target && _so.target != "_blank") {
			_w = $.winOpen("about:blank",  _so.target , (_so.feature ? _so.feature : "" ));
		}
		_post(_w);
	};	 
	switch(_so.type.toLowerCase()) {
	case "post":
		_open();		
		break;
	case "get":
		_get();
		break;
	}
};
(function($){
	$.Sleep = function(millis){
		  var date = new Date(),curDate = null;
		  do { curDate = new Date(); }
		  while(curDate-date < millis);
	};
})(jQuery);
(function($) { 
	$.fn.outerHTML = function(){
		 
	    // IE, Chrome & Safari will comply with the non-standard outerHTML, all others (FF) will have a fall-back for cloning
	    return (!this.length) ? this : (this[0].outerHTML || (
	      function(el){
	          var div = document.createElement('div');
	          div.appendChild(el.cloneNode(true));
	          var contents = div.innerHTML;
	          div = null;
	          return contents;
	    })(this[0]));
	 
	};
})(jQuery);


(function($) {
	"use strict";
	function _css(o) {
		var _o = o,_r = {};
		switch (typeof _o) {
		case "string":
			var _a = _o.split(";");
			$.each(_a,function(idx,v) {
				var _b = v.split(":");
				if(_b.length > 1 && _b[1] && _b[0]) {_r[_b[0]] = _b[1].trim();} 
			});
			break;
		default :
			_r = _o;
			break;
		}
		return _r;
	};
	function _getCss(o) {
		var _r = "";
		if(!o) {return _r;}
		$.each(o,function(idx,v) {
			_r += ((_r ? ";" : "" ) + idx + ":" + v);
		});
		return _r;
	};
	$.fn.inlineStyler = function(options) {
		if($(this).hasClass("frm-body")) {return;}
		var _this = $(this);
		var settings = $.extend({
			css : {
				".frm_wrap" : "font-family:맑은 고딕,Malgun Gothic,돋움,dotum,Arial,sans-serif,Helvetica;font-size:12px"
				,".formpage" : "display: block;margin: 0 10px 0 19px;height: 100%;position: relative;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"
				,".frm_header" : "overflow: hidden;height: 50px;position: relative;z-index: 10;width: 100%;"
				,".frm_header .frm_title" :"font-size: 20px;line-height: 42px;color: #333;font-weight: bold;letter-spacing: -1px;" 
			}		
		}, options );
		$.each(settings.css, function(idx,v) {
			$(_this).find(idx).each(function() {
				var _cc = $.extend(_css(v),_css($(this).attr("style")));
				$(this).attr("style",_getCss(_cc));
				//$(this).removeClass(idx);				
			});
		});
		return $(this);
	};
}( jQuery ));

(function($) {
	"use strict";	
	function _ObjectToStyle(o) {
		var _r = "";
		if(!o) {return _r;}
		$.each(o,function(idx,v) {
			_r += ((_r ? ";" : "" ) + idx + ":" + v);
		});
		return _r.trim();
	};
	function _StyleToObject(s) {
		var _o = s,_r = {};
		switch (typeof _o) {
		case "string":
			var _a = _o.split(";");
			$.each(_a,function(idx,v) {
				var _b = v.split(":");
				if(_b.length > 1 && _b[1] && _b[0]) {_r[_b[0].trim()] = _b[1].trim();} 
			});
			break;
		default :
			_r = _o;
			break;
		}
		return _r;
	};
	
	function fly(element,options) {
		var _element = element
			,_parent = $(_element).wrapAll('<div></div>').parent()
			,_options = options
			,_sheet = ""
			,_datakey = "__style";
		var _bgcolor_reg = /background(?:-color)?\s*:\s*(\#[a-fA-F0-9]{3,6}|rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))/i
			,_color_3digit = /\#([a-f0-9])([a-f0-9])([a-f0-9])/i
			,_color_rgb = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;
		return {
			loadStyle : function() {
				var _css = [],_def = [],_this = this;
				if(typeof _options.link == "string"){_css.push(_options.link);}
				else if($.isArray(_options.link)) {_css = _css.concat(_options.link);}
				$.each(_css, function(idx,val) {_def.push($.ajax(val));});
				return $.when.apply($,_def)
				.done(function() {
					if($.isArray(arguments[0])) {
						$.each(arguments, function(idx,v) {_sheet += _this.cleanStyle(v[0]);});
					} else {
						_sheet = _this.cleanStyle(arguments[0]);
					}
				});
			}
			,addStyle : function(style) {_sheet += style;}
			,doConvert : function() {
				var _reg = new RegExp("([^{}]+)?{([^}]+)?}","g")
					,result = null;				
				/**
				 * Bora Editor에 넣기 위한 style 조정
				 */
				$(".frm_title", _element).wrap($('<font class="frm_title"></font>'));
				var _tbl = $(".frm_tbl", _element);
				if(_tbl.length > 0){
					_tbl[0].style.borderTop = "2px solid #333333"; // 결재
				}else{// 게시판
					var _vd = $(".viewdetail-top", _element);
					if(_vd.length > 0){
						_vd.css("border-bottom", "0px");
						_vd.css("padding", "0 0 0 0");
						var _p = $('<table><tr><td style="padding:20px 0px 10px 0px;"></td></tr></table>');
						_p.css("border-top", "2px solid #333333").css("border-bottom", "1px solid #333333").css("width", "100%");
						_vd.wrap(_p);
						$(".tit", _vd).wrap($('<font class="tit"></font>'));
					}
				}
				$(".aprv_status",_element).closest("td").css("height", "auto");
				$(".aprv_status",_element).css("border-top", "0px");
				$(".aprv_status .ep-epgrid-header-table", _element).css("margin-bottom", "1px");
				$(".aprv_status .ep-epgrid-header-table th", _element).css({
					"border-top":"1px solid #e5e5e5",
					"border-bottom":"1px solid #e5e5e5",
					"border-collapse":"collapse"
				});
				this.removeTag();
				this.removeClass();
				while((result = _reg.exec(_sheet)) !== null) {
					var _sel = result[1] && result[1].trim(), _sty = result[2] && result[2].trim();
					if(_sel.match(/\:\:/g)) {continue;}
					if(!_sty) {continue;}
					try {var __ele = $(_parent).find(_sel);} catch(e) {continue;}
					if(__ele.size() == 0) { continue;}
					__ele.each(function() {
						var _arr = $(this).data(_datakey) || [];  
						_arr.push ({sel : _sel, style : _sty});
						$(this).data(_datakey,_arr);
					});
				};
				this._inlineStyle(_element);
			}
			,_inlineStyle : function(__ele) {
				var _this= this
					,_data = $(__ele).data(_datakey)
					,_o = {};
			
				if(__ele.hasClass("excludecopy")) {__ele.remove();return;}
				$(".excludecopy",__ele).remove(); 
				if(__ele.attr("id") == "ep_richbody") {__ele.removeAttr("id");__ele.removeAttr("class");return;}
				_data && $.each(_data, function(idx,v) {$.extend(_o,(v.style ? _StyleToObject(v.style) : {}));});
				$.extend(_o,_StyleToObject($(__ele).attr("style")));
				var _s = _ObjectToStyle(_o);
				if(_s) {
					/* 
					 * IE 10 mode에서 background-color가 RGB 값으로 변경되면서 Bora Editor에 적용이 안됨. 따라서 style을 bgcolor 속성으로 변경후 삭제함.
					 */
					var m = _s.match(_bgcolor_reg);
					if(m && m[1]){
						var _color = m[1];
						if(_color.charAt(0) == "#" && _color.length == 4){
							_color = _color.replace(_color_3digit, function(a, b, c, d){
								return "#" + b + b + c + c + d + d;
							});
						}else if(_color.charAt(0) != "#" && _color_rgb.test(_color)){
							_color = _color.replace(_color_rgb, function(a, b, c, d){
								return "#" + ("0" + parseInt(b, 10).toString(16)).slice(-2) 
									+ ("0" + parseInt(c, 10).toString(16)).slice(-2) 
									+ ("0" + parseInt(d, 10).toString(16)).slice(-2);
							});
						}
						$(__ele).attr("bgcolor",_color);
						_s = _s.replace(_bgcolor_reg, "");
					}
					if(_s) $(__ele).attr("style",_s);					
				}
				
				_this.cleanAttr(__ele);
				$(__ele).removeData(_datakey);
				if($(__ele).css("display") == "none") { $(__ele).remove();return;}		
				$(__ele).children().each(function() {_this._inlineStyle($(this));});
			}
			,getStyleText : function(html) {
				var _html = html instanceof jQuery ? html.html() : html
					,result = null
					,_style = ""
					,_reg = new RegExp('(<style.*?>)([\\s\\S]*?)(</style>)|<style.*[/]?>',"gi")	;
				while((result = _reg.exec(_html)) !== null) {_style += (result[2] ? result[2] : "");}				
				return this.cleanStyle(_style);
			}
			,cleanAttr : function(ele) {
				var __ele = $(ele),_attrs = _options.removeAttr||[];
				$.each(_attrs, function(idx,v) {__ele.removeAttr(v);});
				return ele;
			}
			,removeTag : function() {
				var _tags = _options.removeTag || [];
				$.each(_tags, function(idx,v) {
					$(v,_element).remove();
				});
			}
			,removeClass : function() {
				if(!_options.removeClass) {return;}
				$.each(_options.removeClass, function(idx,c) {
					_parent.find(idx).removeClass(c);
				});
			}
			,clear : function() {
				
			}
			,cleanStyle : function(style) {return style.replace(/\/\*[\w\W]*?\*\/|[\r\n\t\s]+|\@[^;]+\;/g," ");}
		};
	};	
	$.fn.inlineStyle = function(options) {
		var _Def = new $.Deferred()
			,_opt = {
				style : [
				   ".ep-epgrid .ep-epgrid-data-div {overflow:visible;}" 
					,".frm_wrap,.formpage{height:inherit;margin:0;position:static}" 
					,".frm_action{height:1px;}"
					," th {font-weight:bold;}" /* Bora Editor에 붙여넣기시 TH가 TD로 변경되면서 TH기본 속성이 제거됨 */
					,'body, th, td, p, span, div {font-family:맑은 고딕,Malgun Gothic,돋움,dotum,Arial,sans-serif,Helvetica}' /* 기본 폰트 */
				]
				,removeClass : {
					".frm_page_wrap" : "frm_page_wrap"
					,".frm_page_scroll" : "frm_page_scroll"
					,".appr-rep" : "appr-rep"	
					,".frm_action": "frm_action"
				}
				,removeTag : ["script","style","iframe"]
				,removeAttr : ["eptype","epdata","class","id"]
				,link :"/res/core/comm/css/core.comm.all.css"
					/*["/res/core/comm/css/core.comm.base.css"
				 	,"/res/core/comm/css/core.comm.content.css"
				 	,"/res/core/comm/css/core.comm.plugin.css"
				 	,"/res/core/comm/css/core.comm.organ.css"
				 	]	*/ 
			};
		options && $.extend(_opt,options);
		var _this = $(this)
			,_styles = ""
			,_fly = fly(_this,_opt);
		if(_opt.link) {
			_fly.loadStyle()
			.done(function() {	
				_fly.addStyle(_fly.getStyleText(_this));
				_opt.style && _fly.addStyle($.isArray(_opt.style) ? _opt.style.join(" ") : _opt.style);
				_fly.doConvert();
				_Def.resolve(_this);
				_fly.clear();
			});			
		} else {
			_styles += _fly.getStyleText(_this);
			_opt.style && _fly.addStyle($.isArray(_opt.style) ? _opt.style.join(" ") : _opt.style);
			_fly.doConvert();
			_Def.resolve(_this);
			_fly.clear();
		}
		return _Def.promise();
	};
	$.fn.selectText = function(docEle){
	   var doc = docEle||document;
	   var element = this[0];
	   if (doc.body.createTextRange) {
	       var range = doc.body.createTextRange();
	       range.moveToElementText(element);
	       range.select();
	   } else if (window.getSelection) {
	       var selection = doc.defaultView.getSelection();        
	       var range = doc.createRange();
	       range.selectNodeContents(element);
	       selection.removeAllRanges();
	       selection.addRange(range);
	   }
	};		
}(jQuery));

/**
 *  2014.09.18
 *  - tony
 */

 (function() {
	 "use strict";
	 $(document).off("keydown").on("keydown",function(e) { 
	    var doPrevent = false;
        var d = e.srcElement || e.target;
	    if (e.keyCode === 8 ) {
	        if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE')) 
	             || d.tagName.toUpperCase() === 'TEXTAREA') {
	            doPrevent = d.readOnly || d.disabled; 
	        }
	        else {
	            doPrevent = true;
	        }
	    }
	    if (e.keyCode === 13) {
	    	if(d.tagName.toUpperCase() === "INPUT") {doPrevent = true;}
	    }
	    if (doPrevent) { e.preventDefault();}
	});
	 
	var 
		_log = $ep.log	
		,_isPromise = function(value) {
		    if (typeof value.then !== "function") {
		        return false;
		    }
		    var promiseThenSrc = String($.Deferred().then);
		    var valueThenSrc = String(value.then);
		    return promiseThenSrc === valueThenSrc;
		}
		,_util = {
			ajax : function(opt) {
				//var _dfd = new $.Deferred();
								
				return $.ajax(opt);			
			}
			,blockUI  : function _blockUI(opt,_t) { 
				/* allowtransparency="true" 제거함 IE8에서 하단 Object 표시됨.*/
				var _$block = $('<iframe class="ep-ui-block-iframe" src="about:blank" frameborder="0" /><div class="ep-ui-block ep-ui-blockUI" />').appendTo(document.body),_$msg = null,_tmout=0;
				if(opt && typeof opt.message !== "undefined") {
					_$msg = _$block.filter(".ep-ui-block.ep-ui-blockUI").after('<div class="ep-ui-block ep-ui-blockUI-message" style="display:none;">' + (typeof opt.message == "string" ? opt.message : 
					typeof opt.message == "object" ? opt.message.text ? opt.message.text : "" : "") +'</div>').next().fadeIn();
					typeof opt.message == "object" ? opt.message.css ? _$msg.css(opt.message.css) : "" : "";
					typeof opt.message == "object" ? opt.message.classes ? _$msg.addClass(opt.message.classes) : "" : "";				
				}

				if (_util.isMobile.Any()){
					opt.css = {"opacity" : "0", "filter" : "alpha(opacity=0)"}
				}
				
				var _do = { unblock : function() {if(_tmout) {clearTimeout(_tmout);};$(_$block).add($(_$msg)).fadeOut().remove();_$block=null;_$msg=null;opt && typeof opt.success == "function" ? opt.success() : "";}};
				opt && opt.css && _$block.css(opt.css);
				opt && opt.classes && _$block.addClass(opt.classes);
				opt && opt.hide && $.isNumeric(opt.hide) && (opt.hide = parseInt(opt.hide,10));
				if(opt && opt.hide) {
					switch(typeof opt.hide) {
					case "string":	$(_$block).add($(_$msg)).on(opt.hide, _do.unblock);break;
					case "number":
						_tmout=setTimeout(function(){_do.unblock();}, opt.hide);
						/*$(_$block).add($(_$msg)).on("click", _do.unblock);*/
						break;
					case "object": typeof opt.hide.event === "string" ?  $(_$block).add($(_$msg)).on(opt.hide.event, _do.unblock) : "";
						typeof opt.hide.delay === "number" ?  _tmout=setTimeout(function() {_do.unblock();}, opt.hide.delay) : "";break;
					}
				}
				return _do;
			}
			,toast : function(message , delay , success,css) {
				if($(".ep-ui-toast").size() > 0) {return;} 
				var _css = css || {};
				_util.blockUI({
					message : {  
						text : message
						,classes : "ep-ui-toast"
						,css : _css
						/*,css : {
							"background" : "#eef6f9 none"		,"padding" : "14px 10px"
							,"color" : "#005193" 					,"width" : "500px"
							,"line-height" : "22px"					,"font-size" : "14px"
							,"margin-left" : "-250px"				,"margin-top" : "-50px" 
						}*/
					}
					,success : typeof delay === "function" ? delay : typeof success === "function" ? success : undefined 
					,hide : (typeof delay == "undefined" || typeof delay == "function") ? 1300 : delay 
					,css : {"background" : "#fff", "opacity" : "0"}
				}); 
			}
			,loadPage : function(sel,url,e) {
				var _self = this,
					_dfd = new $.Deferred()
					,_url = $ep.urlVersion(url)
					,_isiframe = false	
					,_osel = $(sel);
				
				function _loadPage() {
					var _delay = _self.delay();
					if(_osel.size() >0 ) {
						_osel.empty();
						_delay.run(function() {
							_osel.html('<div class="ep-progress box-size"><span class="ep-loading">' + $ep.LangPatternString("{TEXT.LOADING}") + '</span></div>');
						},300);
						_osel.data("page_href",_url);
						if(_osel.is("iframe")) {_isiframe = true;}						
					}					 
					_self.ajax({
						url : _url 
						,type : "get"
						,async:true
						,success : function(html,textStatus,xhr) {
							function _write(__html) {
								_delay.clear();
								!_isiframe && _osel.size() > 0 && _osel.html(__html);
								_isiframe && (function() {
									var myIFrame = _osel[0];
									var ifdoc  = (myIFrame.contentWindow) ? myIFrame.contentWindow : (myIFrame.contentDocument.document) ? myIFrame.contentDocument.document : myIFrame.contentDocument;
									
									ifdoc.document.open();
									ifdoc.document.write(__html);
									ifdoc.document.close();
									ifdoc.document.parentIFrameElement = _osel[0];
								})();
								if(_isiframe) {	return ;}
								_dfd.resolve(__html,textStatus);
								if(e && _osel.size()) {	
									if(typeof e.after === "function") {e.after(_osel,textStatus,xhr);}	
								}							
							}
							 
							if (!(e && typeof e.before === "function")) {_write(html);return;}
							$.when(e.before(html,textStatus,xhr)).done(function(html) {
								var _html = html;
								if(_html === false) { return _dfd.resolve(textStatus,"cancel");}
								if(_html !== true && _html !== undefined) {html = _html;}
								_write(html);
							});
							
						}
						,error : function(xhr,textStatus,error) {
							_delay.clear();
							_osel.empty();
							_osel.html('<div class="errormessage"><p class="warning">'+$ep.LangString("ERROR.RESPONSE_PAGE_EXCEPTION")+'</p></div>');
							if(e) {	if(typeof e.after === "function") {if(e.after(error,textStatus,xhr) === false) { return _dfd.resolve(textStatus,error);}	}}
							_dfd.resolve(textStatus,error);
						}
					});
					
				};
				if(_osel.size() > 0) {
					var _event = $.Event("beforedestroy");
					$("form",_osel).trigger(_event);
					if(_event.result) {						
						if(_event.result === false) {return;}
						if(_isPromise(_event.result)) {
							_event.result.done(function(iscontinue) {
								if(iscontinue === false){ return;}
								_loadPage();
							});
						} else {
							_loadPage();
						};						
					} else {
						_loadPage();
					}					
				} else {_loadPage();}
				return _dfd.promise();
			}
			,expression : function (_pattern,_parent,nullpass) {
				var _v = _pattern;
				if(!_parent) {return;}
				while(_v.match(/\{([a-zA-Z0-9\.\$\@]+)\}/g)) {
					var _o = RegExp.$1 ,_re = new RegExp("\\{" + _o + "\\}","g")
						,_ip = _o.split(".") ,_fv = _parent;
					$.each(_ip,function(_idx,__v) {
						_fv = _fv[__v];
						if(!_fv) {return false;}
					});
					if(!_fv) { _fv = nullpass === true ?  "-null-" : "";} 
					_v = _v.replace(_re,_fv);					
				}
				return _v;
			}
			,tagReplace : function(shtml,stag,srep,isInner) {
				var _reg = new RegExp('(<'+stag+'.*?>)([\\s\\S]*?)(</'+stag+'>)|<'+stag+'.*?[/]?>',"gi"); 
				return isInner === true ? shtml.replace(_reg,"$1"+srep+"$3") : shtml.replace(_reg,srep); 
			} 
			,removeTag : function(html,stag,isInner){
				var _reg = new RegExp('(<'+stag+'.*?>)([\\s\\S]*?)(</'+stag+'>)|<'+stag+'.*?[/]?>',"gi"); 
				return isInner === false ? html.replace(_reg,"$2") : html.replace(_reg,""); 
			}
			,patternCompletion:function(pattern,data,nullstr) {
				var _pattern = pattern;
				while(_pattern.match(/\[([\w\s\{\}\=\-\(\)\/\:\"\'\&\#\;\%\+]+)\]/g)) {
					var _cap = RegExp.$1
						,__re = _util.expression(_cap,data,true) 
						,_reg = new RegExp("\\[" + _cap.replace(/\(/g,"\\(").replace(/\)/,"\\)") + "\\]","g");
					_pattern = _pattern.replace(_reg,__re.match(/-null-/g) ? nullstr ? nullstr : "" : __re);				
				}
				return _util.expression(_pattern,data);			
			}
			,CURI : $.CURI
			,browser : {
				msie : /MSIE|rv:11\.0/i.test(navigator.userAgent)
				,ie8 : /MSIE 8/i.test(navigator.userAgent)
				,ie9 : /MSIE 9/i.test(navigator.userAgent)
				,ie10 : /MSIE 10/i.test(navigator.userAgent)
				,ie11 : /rv:11\.0/i.test(navigator.userAgent)
				,chrome : /Chrome/i.test(navigator.userAgent) 
			}
			,isMobile : {
		        Android: function(){
		        	return navigator.userAgent.match(/Android/i) == null ? false : true;
		        },
		        BlackBerry: function(){
		        	return navigator.userAgent.match(/BlackBerry/i) == null ? false : true;
		        },
		        IOS: function(){
		        	return navigator.userAgent.match(/iPhone|iPad|iPod/i) == null ? false : true;
		        },
		        Opera: function(){
		        	return navigator.userAgent.match(/Opera Mini/i) == null ? false : true;
		        },
		        Windows: function () {
		        	return navigator.userAgent.match(/IEMobile/i) == null ? false : true;
		        },
		        Any: function () {
		        	return (_util.isMobile.Android() || _util.isMobile.BlackBerry() || _util.isMobile.IOS() || _util.isMobile.Opera() || _util.isMobile.Windows());
		        }
			}
			,getApp : function(appcode,company,callBack,ajaxOpt) {
				if(!appcode) {return null;}
				var _self = this, _result = null
					,_callback = typeof company == "function" ? company : callBack
					,_company = typeof company == "string" ? company : $ep.user.companycode() 
					,_ajaxOpt = typeof callBack != "function" && typeof ajaxOpt == "undefined" ? callBack : ajaxOpt
					,_appcode = (_company ? _company + "." : "") + appcode;
				
				if(!_company) {_log("companycode is empty.",arguments);return;}
				if($ep.cache.app[_appcode]) {_callback && _callback($ep.cache.app[_appcode]);return $ep.cache.app[_appcode];} /* cache */
				var _uri = $.CURI( "/ngw/core/profile.nsf/api/data/collections/name/profilecode",{
					category : _appcode
				});
				_util.ajax($.extend({
					url : _uri.url
					,async : true
					,success : function(data,txtStatus,xhr) {
						if(typeof data != "object" || data.length == 0) {_callback && _callback(_result);return;}
						$ep.cache.app[data[0]["_companycode"] + "." + data[0]["_syscode"]] = _result = {
							company : data[0]["_company"]
							,companycode : data[0]["_companycode"]
							,name : data[0]["_sysname"]
							,title : data[0]["_title"]
							,noteid :  data[0]["@noteid"]
							,syscode : data[0]["_syscode"]
							,sysdir :  data[0]["_sysdir"] && ("/" + data[0]["_sysdir"].replace("\\","/"))
							,langprefix : data[0]["_langprefix"].toUpperCase()
							,languagepack : data[0]["_languagepack"]
							,ismastercompute : data[0]["_mailmasterhost"] == "1" ? true : false 
						};
						function _completed(__master) {
							_result.leftframe =  (function(o,m) {
								if(!o) {return "";}
								var _o = o.match(/^\//g) ? o : (_result.sysdir.match(/^\//g) ? "" : "/") + _result.sysdir + (_result.sysdir.match(/\/$/g) ? o :  "/" + o);  
								return  __master ? _util.patternCompletion(_o,__master) : _o;
							})(data[0]["_leftframe"],__master);
							_result.contentframe = (function(o,m) {
								if(!o) {return "";}
								var _o = o.match(/^\//g) ? o : (_result.sysdir.match(/^\//g) ? "" : "/") + _result.sysdir + (_result.sysdir.match(/\/$/g) ? o :  "/" + o);  
								return  __master ? _util.patternCompletion(_o,__master) : _o; 
							})(data[0]["_contentframe"],__master);
							_callback && _callback(_result);
							return;
						};
						if(_result.ismastercompute) {
							_self.getMasterHost(function(_r) {_completed(_r ? _r : null);});
						} else {_completed();}
						return;
					}					
				},_ajaxOpt));
				return _result;
			}
			,getMasterHost : function(callback,id, opt){
				var _uri = $.CURI( "/ngw/core/lib.nsf/mailmasterhost?readform",{id : id});
				if($ep.cache.master[id]) {callback($ep.cache.master[id]);return;}
				_util.ajax({
					url : _uri.url
					,success : function(data, txtStatus,xhr) {
						if(!data || !data.mailmasterhost) {callback && callback(null);return;} 
						var _r = data;
						$ep.cache.master[_r.id] = _r;
						callback && callback(_r); 
					}
				});
			}
			,objectFilter : function(o,pattern) {
				if(!o) {return null;}
				var _r = null
					,_pattern = pattern ? $ep.Array(pattern).isArray() ? pattern : pattern.split($$.SEPERATE.field) : null;				

				if($ep.Array(o).isArray()) {
					_r = $ep.Array(o).datafilter(function(__idx,__dat) { return _util.objectFilter(__dat,_pattern);});
				} else {
					_r = {};
					for(var _idx = 0; _pattern.length > _idx; _idx++){
						_r[_pattern[_idx]] = o[_pattern[_idx]] ? o[_pattern[_idx]] : null; 
					};
				}
				return _r;
			}
			,objectToString : function(o,pattern,sep) {
				var _r = ""
					,_pattern = pattern ? $ep.Array(pattern).isArray() ? pattern : pattern.split($ep._CONST.SEPERATE.col) : $ep._CONST.ORG_DEF_MASK
					,_sep = sep ?  sep : $ep._CONST.SEPERATE.col;
				if($ep.Array(o).isArray()) {
					for(var a = 0; o.length > a; a++) {_r += (_r ? $ep._CONST.SEPERATE.record : "" ) + _util.objectToString(o[a],_pattern,_sep);}; 
					return _r; 
				}
				if(_pattern) { 
					for(var _idx = 0;_pattern.length > _idx; _idx++) {	
						var _i = _pattern[_idx];	_r += (_r ? _sep : "") + (o[_i] ? o[_i] : "");
					}
				} else { $.each(o, function(idx,v) {	_r += (_r ? _sep : "")  + v;	});}
				return _r;
			}
			,stringToObject : function(s,mask,col,field) {
				if(!s) {return;};
				var result = [], _s = $ep.Array(s).isArray() ? s : s.split(field ? field : $ep._CONST.SEPERATE.field)
					,_mask = mask ? mask.split($ep._CONST.SEPERATE.col) : $ep._CONST.ORG_DEF_MASK.split($ep._CONST.SEPERATE.col);
					$ep.Array(_s).datafilter(function(idx,dat) {			 		
						var __s = dat.ltrim().rtrim().split(col ? col : $ep._CONST.SEPERATE.col)
							,_obj = null;
						if(__s.length == 0) {return;}
						if(__s.length == 1 && __s[0] == "") {return;}
						$ep.Array(_mask).datafilter(function(_idx,_dat) {
							if(!_obj) {_obj = {};};
							//if(__s[_idx]) { 메일에서 공백일때도 구조체를 만들어야 한다.
								_obj[_dat] = __s[_idx] ? __s[_idx] : "";
							//}; 
						});
						if(_obj) {result.push(_obj);}
					}); 
				return result;
			}
			,delay : function(){
				return (function() {
					var _timer = 0
						,_result = {
							clear : function(){
								clearTimeout(_timer);
								return this;
							},
							run : function(callback,ms){
								this.clear();
								_timer = setTimeout(callback,ms);
							}
						};
					return _result;
				})();
			}
			,keepObject : function() {
				return (function() {
					var _v = $("body object:visible")
						,_result = {
							hide : function() {return _v && _v.hide();}
							,show : function() {return _v && _v.show();}
							,clear : function() {_v = null;}
						};
					return _result;
				})();
			}
			,cleanAwareness : function() {
				var _list = $ep.cache.awareness;
				$.each(_list,function() {if(this.unusedtime() > 10) {this.destroy();}	});
			}
			,directURL : function(url,argv,argv2) {
				var _uri = $.CURI(url,argv);
				_uri.setArgv({_ver : ""});
				var _undock = $.CURI("/ngw/core/lib.nsf/undock.html?readform",argv2);
				_undock.setParam({url : encodeURIComponent(_uri.url)});
				return _undock;
			}
			,openPage : function(url,argv,features,argv2) {
				/*var _uri = $.CURI(url,argv);
				_uri.setArgv({_ver : ""});
				var _undock = $.CURI("/res/core/undock.html",argv2);
				_undock.setParam({url : encodeURIComponent(_uri.url)});*/
				var _undock = this.directURL(url,argv,argv2); 
				var _features = features ? features : {};
				return $.winOpen(_undock.url,"_blank",$.extend({"scrollbars" : "yes"},_features));
			}
			,windowTitle : function(title) {
				document.title = $.type(title) == "function" ? title.call(this,title) : title;
			}
			,abc : {
				status : 0,   					//0 - offline, 1 - online 
				live : 0,						/* timeout */
				alive : false,  				/* 살아 있는지 */
				lock : false,					/* 처리중.. */
				repeatlimit : 10,  				/* abc online 체크 반복 제한. 0 - 무한*/
				_repeat : 0, 					/* abc 온라인 체크 반복 횟수 */
				delayRefresh : 10000,    		/* IPT Awareness 확인 주기 */
				delayConnection : 60000,  		/* ABC Online Check 확인 주기 */
				req : function(re,o) {
					var _self = this;
					return _util.ajax($.extend({
						url : $ep._CONST.ABC.REQUESTURL
						,dataType : "jsonp"							
						,timeout : 1500
						,data : re
					},o));
				},
				_onLineCheck : function() {
					var _self = this;
					_self.alive = true;
					return this.req({reqType : "typeChat",subType : "none"})
					.always(function(xhr,txt,msg) {
						if(txt == "timeout") {
							_self.status = 0;
							_self._repeat++;
							setTimeout(function() {
								if(_self.repeatlimit != 0 && _self.repeatlimit < _self._repeat) {_self.alive = false;return;}
								_self._onLineCheck();
							},_self.delayConnection);
							return;
						}
						_self._repeat = 0;
						_self.status = 1;
						_self.vitalize();
					});
				},
				chat : function(ids) {
					//if(this.status == 0) {_log("messenger offline...");return;}
					if(window.ePortalConfig && window.ePortalConfig.username){
						if(!this.abc_login_id || (this.abc_login_id != window.ePortalConfig.username)) return $.Deferred().reject("");
					}else if(window.$ep && $ep.cache && $ep.cache.master){
						var userfn = '';
						for(var idx in $ep.cache.master){
							if($ep.cache.master[idx].id){
								userfn = $ep.cache.master[idx].id;
								break;
							}
						}
						if(!this.abc_login_user || (userfn && userfn != this.abc_login_user.replace(/\,/g, "/"))) return $.Deferred().reject("");
					}
					var comp = this.abc_login_user.replace(/,/, "/");

					for(var i = ids.length - 1; i >= 0; i--){
						if(ids[i].replace(/,/, "/") == comp){
							ids.splice(i, 1);
							break;
						}
					}
					if(ids.length == 0) return $.Deferred().reject("");
					return this.req({
						reqType : "typeChat"
						,subType : "chat"
						,param1 : $.isArray(ids) ? ids.join("|") : ids
					});
				},
				phone : function(phon) {
					//if(this.status == 0) {_log("abc messenger offline...");return;}
					//if(!phone) {return;}
					if(window.ePortalConfig && window.ePortalConfig.username){
						if(!this.abc_login_id || (this.abc_login_id != window.ePortalConfig.username)) return $.Deferred().reject("");
					}else if(window.$ep && $ep.cache && $ep.cache.master){
						var userfn = '';
						for(var idx in $ep.cache.master){
							if($ep.cache.master[idx].id){
								userfn = $ep.cache.master[idx].id;
								break;
							}
						}
						if(!this.abc_login_user || (userfn && userfn != this.abc_login_user.replace(/\,/g, "/"))) return $.Deferred().reject("");
					}
					return this.req({
						reqType : "typeChat"
						,subType : "phone"
						,param1 : phon	
					});
				},
				awareness : function(ids) {
					return this.req({
						reqType : "typeAW"
						,subType : "getStatus"
						,param1 : $.isArray(ids) ? ids.join("|") : ids
					});
				},
				cacheRefresh : function(){
					var _dfd = new $.Deferred();
					/*if(this.status == 0 ) {_dfd.resolve();return _dfd.promise();}*/
					_util.cleanAwareness();
					var _list = $ep.cache.awareness,_ids = [];
					$.each(_list, function(v) {_ids.push(v);});
					if(_ids.length == 0) { _dfd.resolve("none");return _dfd.promise();}
					return this.awareness(_ids)
					.done(function(data) {
						if(!data || !data.buddyState) {return;}
						$.each(data.buddyState, function(_idx,_data) {
							var _o = _list[_data.uid];
							if(!_o) {return;}
							if(_o.ipt.status != _data.ipt) {	_o.iptUpdateStatus(_data.ipt);}							
						});
					}).fail(function() {$.each(_list, function(_idx,_o) {_o.iptUpdateStatus(14);});});
					
				},
				vitalize : function() {
					return;
					var _self = this;
					if(this.lock == true) {_log("locked");return;}
					_self.lock = true;
					_self.alive = true;
					_self.cacheRefresh().always(function(xhr,txt) {
						if(txt == "timeout") {_self.devitalize();_self._onLineCheck();return;}
						if(xhr == "none" && _self.status == 0) {_self._onLineCheck();_self.lock = false;return;}
						_self.lock = false;
						//_self.status = 1;						
						_self.live = setTimeout(function() {_self.live != 0 && _self.vitalize();},_self.delayRefresh); 	
					});
					
				},
				devitalize : function() {
					clearTimeout(this.live);
					this.live = 0;
					this.alive = false;
					this.lock = false;
				}
			}
			,stproxy : {
				chat : function(ids) {
					var _ids = $.isArray(ids) ? ids : [ids];
					if($ep.util.abc.status == 1) {
						$ep.util.abc.chat(_ids).fail(function() {
							
						});
						return;
					}
					/*
					 * ABC AWARENESS
					 * if(!stproxy.isLoggedIn) {
						//$ep.util.toast("로그인 암됨.",4000);
						return;
					}
					_ids.length > 1 && stproxy.openGroupChat(_ids);
					_ids.length == 1 && stproxy.openChat(_ids[0]);*/
				}
			}
			,connUserID : function(email,callback) {
				var _userid = "",_callback = callback;
				if(!email) {return _userid;}
				return this.ajax({	url : "/profiles/atom/profile.do",async:true,dataType : "xml",data : {email : email}})
				.always(function(xml,stat) {
					if(stat == "success") {_userid = $(xml).find("contributor").children("snx\\:userid").text();}					
					_callback && _callback(_userid);
				});				
			}
	};
	$ep.util = _util; 
 })();
 
 
 /**
 *  2014.09.18
 *  - tony
 */

(function() {
	"use strict";
	var _log = typeof $ep === "undefined" || function(){};
	
	(function() {
		/* 
		 *  $(ele).viewlist 
		 */
		$.widget( "ep.epviewlist", {
			version: "1.11.1"
			,widgetEventPrefix: "epviewlist"
			,options : {
				column : null /* {
					created : {
						title : function(ele,col) {return "작성일";}   // this=plugin, (th element,col)
						,hidewidth : true 					
						,hcss : {width: "110px"}
						,hclasses : "" 
						,sortable : {descending : true, ascending: true}
						,css : {width : "100px"}
						,type : "isodate"
						,dateformat : "yyyy-mm-dd"
						//,render :  function(rele,cele,data,colset) {return data.created;}
							
					}
					//,selectable : "checkbox"  //checkbox,radio
				  	,subject : {	title : "제목"	,sortable : true}
				  	
				} */
				/*,hideheader : true*/
				,dataset : null /*[
						  {created : "20140921T090000",subject : "dafdsafdsfdsfds"}
						  ,{created : "20140922T090000", subject : "Dafdsafdsafdsfadsfdsafds"}
				]*/
				/*,click : function(e,rowele,target,data) {
					_log("rowclick",[e.target,rowele,target,data])
				}*/
				/*,rowrender : function(e,ele,data)*/ 
				/*,clickheader : function(e,_id,_clickid,_head) {
					_log("clickheader",[_id,_clickid,_head]);  //id=fieldid,clickid=header,ascending,descending , _head = th element
				}*/
				,level : 0
			 }
			,_destroy: function() { 
				this.widget().empty().removeClass(this.widgetFullName);
				this.elements = null;
				delete this.elements;
				//$.Widget.prototype.destroy.apply( this, arguments)
			} 
			,elements : {wrap : null, head : null, body : null, data : null}
			,_setOption: function(key, value){ $.Widget.prototype._setOption.apply(this, arguments);return this;}
			,_setOptions : function(options) { $.Widget.prototype._setOption.apply(this, options);return this;}
			,_create : function() {
				
				//if(this.options.column === null) {this.destroy();return;}
				this.element.addClass("ep-widget " + this.widgetFullName);
				this._makeElement();
				if(this.options.hideheader !== true) {this._initHeader();};
				if(this.options.dataset){ this.addData(this.options.dataset);}
				this.element.has(".viewlist-wrap").size() == 0 && this.element.html(this.elements.warp);
			}
			,_makeElement : function() {
				var _warp =  $(".viewlist-wrap",this.element).size() > 0 ? $(".viewlist-wrap",this.element) : $('<div class="viewlist-wrap" />')
					,_head = this.options.hideheader === true ? null : $('<div class="viewlist-head"><table class="viewlist-head-table" /></div>').appendTo(_warp)
					,_body = $('<div class="viewlist-body"><table class="viewlist-body-table"><tbody /></table></div>').appendTo(_warp)
					,_data = $(".viewlist-body-table tbody",_body); 
				this.elements = {
						warp : _warp
						,head : _head
						,body : _body
						,data : _data
				};			
			}
			,_selectable : function(ishead,ele,opt) {
				var _self = this,_html = "<span />";
				switch(opt.type) {
				case "checkbox":			
					ele.addClass("selectable");
					opt.css = opt.css||{width : "20px"};			
					_html = $('<input type="checkbox" name="'+ (ishead ? "checkall" : "check") + '">');
					_html.on("click",function(e) {
						e.stopPropagation();
						if(ishead === true) { 	_self.selectall($(this).prop("checked"));}
					});			
					break;
				case "radio":
					ele.addClass("selectable");
					opt.css = opt.css||{width : "20px"};
					if(ishead === false) {
						_html = $('<input type="radio" name="check">');
						_html.on("click",function(e) {e.stopPropagation();});							
					}
					break;
				}
				return $(_html);
			}
			,_initHeader : function() {
				var _self = this
					,_colset = this.options.column
					,_head = this.elements.head
					,_htable = $(".viewlist-head-table",_head)
					,_thead = $('<thead><tr class="viewlist-head-tr" /></thead>').appendTo(_htable)
					,_tr = $("tr",_thead)
					,_query = _self.options.query
					,_sortcol = _query ? _query.sortcolumn : ""
					,_order = _query ? _query.sortorder :"";	
				if(!_colset) { return;}
				$.each(_colset, function(idx,o) {
					var __col = $('<th class="column header" id="' + idx + '"/>')
						,__o = o
						,__data = idx == "selectable" ? _self._selectable(true,__col,typeof __o === "string" ? (__o = { type : o }) : __o) :  o.title ? (typeof __o.title === "function" ? __o.title.call(_self.element,__col,__o) : __o.title) : "";
					__col.html(__data);
					if(__o.sortable) {
						var _sortable = __col.wrapInner('<span class="sortable" />').children(".sortable");
						if (typeof _sortable === "object") {
							if (__o.sortable === true) {__o.sortable = {ascending : true, descending : true};}
							if(__o.sortable.ascending === true) {
								_sortable.append('<span class="ep-icon arrow-up'+ (_sortcol == idx && _order == "ascending" ? " on" : " off") + '"/>');}
							if(__o.sortable.descending === true) {_sortable.append('<span class="ep-icon arrow-down'+ (_sortcol == idx && _order == "descending" ? " on" : " off") + '"/>');}
							if(__o.sortable.descending && __o.sortable.ascending) {_sortable.addClass("both");} 
							
						}
					}
					__col.on("click",function(e) {
						var _target = $(e.target)
							,_head = _target.closest("th.column.header");
						if(_head.size() == 0) {return ;}
						if(_head.is(".selectable")) {return;}
						var _id = _head.attr("id")
							,_clickid = _target.is(".arrow-up") ? "ascending" : _target.is(".arrow-down") ? "descending" : "header"; 
						_self._trigger("clickheader",null,[_id,_clickid,_head]);
					});			
					__o.hidewidth === true && __col.addClass("dsp_none");
					if(__o.hcss){ __col.css(__o.hcss);} 
					else if(__o.css) {__col.css(__o.css);}
					if(__o.hclasses) {__col.addClass(__o.hclasses);}
					else if(__o.classes){__col.addClass(__o.classes);}
					__col.appendTo(_tr);				
				});
				$(".column.data:last",_tr).addClass("last");
			}
			,_formatter : function($row,$col,_opt, data,row) {
				var _type = _opt.type||"normal";
				switch(_type) {
				case "normal" : return data;break;
				case "isodate" :
					if (!data) {return;}
					var _date = typeof data === "string" && data ? data.isoToDate() : new Date()
						,tday = new Date()
						,istoday = tday.getDate() == _date.getDate() && tday.getMonth() == _date.getMonth() && tday.getFullYear() == _date.getFullYear()
						,_dateFormat = _opt.dateformat == "fullDateTime" ? istoday ? "today" : "beforeDayTime" :
									_opt.dateformat == "fullDate" ? istoday ? "today" : "beforeDay" : _opt.dateformat ; 
					return _date.format(_dateFormat);
					break;
				case "multilevel":
					var _ind = parseInt(row["@indent"],10)
						,_data = data
						,_level = this.options.level;
					
					if(_ind <= _level) {return data;}
					if(!isNaN(_ind)) {
						$col.addClass("rescol");
						_data = '<span class="multilevel" style="margin-left:'+ (20 * (_ind - 1) - (20 * _level)) +'px;" />' + _data;
					}
					return _data;
					break;
				case "date":break;
				case "userinfo":
					if(!data.trim()) {return;}
					if(!$ep.ui || !$ep.ui.makeUserInfo) {return data;}					
					$ep.ui.makeUserInfo($col,data,this.options.server,false,_opt.userinfo ? _opt.userinfo : null)
						.click(function(e) {e.stopPropagation();});
					return ;
					break;
				}
			}
			,_getPathData : function(data,path) {
				if(!path) {return data;}
				var _path = path.split(".")
					,_data = data;
				$.each(_path, function(idx,val) {
					if(!_data[val]) {return false;}
					_data = _data[val];
				});
				return _data;	
			}
			,_addData : function(o) {
				var _self = this
					,_colset = this.options.column
					,_data =  this.elements.data
					,_row = $('<tr class="viewlist-data-tr"/>') 
					,_rowdata = _self.options.datapath ? _self._getPathData(o,_self.options.datapath) : o;
				if(!_colset) { return;} 
				if(parseInt(_rowdata["@indent"],10) > 0) {_row.addClass("response");}
				_row.data("view-list-data",o);
				$.each(_colset, function(_idx,_o) {
					var __col = $('<td class="column data" id="'+ _idx + '"/>')
						,__opt = _o
						,__text = ""
					    ,__re = _idx == "selectable" ? _self._selectable(false,__col,typeof __opt === "string" ? (__opt = { type : _o }) : __opt)  : _self._formatter(_row,__col,__opt,_rowdata[_idx],o);
					    
					if(typeof __opt.render === "function") {
						__re = __opt.render(_row,__col,_rowdata,__opt,__re);
						if(__re === false) {return true;}
						if(__re !== undefined && __re !== true ) {__col.html(__re);__text = __col.text();}
					} else {
						if(typeof __re !== "undefined") {__col.html(__re);__text = __col.text();}				
					}
					__col.attr("title",__text);
					__opt.hidewidth === true && __col.addClass("dsp_none");
					if(__opt.css) {__col.css(__opt.css);}
					if(__opt.classes){ __col.addClass(__opt.classes);}
					if(__col) {__col.appendTo(_row);}
				});
				$(".column.data:first",_row).addClass("first");
				$(".column.data:last",_row).addClass("last");
				if(this._trigger("rowrender",null,[_row,_rowdata]) === false){ return; }
				_row.off("click").on("click", function(e) {
					if($(e.target).closest(".column.data").is(".selectable")) {return;}
					var __data = o;
					_self._trigger("click",e,[_row,$(e.target),__data]);	
				});
				_row.appendTo(_data);
			}
			,refreshHeaderByQuery : function(query) {
				var _head = this.elements.head
					,_sortcol = query ? query.sortcolumn : ""
					,_order = query ? query.sortorder :"";
					
				$(".sortable .ep-icon.on").removeClass("on").addClass("off");
				if(!_sortcol||!_order) {return;} 
				var _col = $("#"+_sortcol,_head).has(".sortable");
				if(_col.size() == 0) {return;}
				switch(_order) {
				case "ascending":
					$(".ep-icon.arrow-up",_col).removeClass("off").addClass("on");
					break;
				case "descending":
					$(".ep-icon.arrow-down",_col).removeClass("off").addClass("on");
					break;
				}
			}
			,addData : function(o) {
				var _self = this
					,_type = $.isArray(o) ? "array" : $.isFunction(o) ?  "function" : typeof o === "string" ? "" : "object";
				if(!_type) {return;}
				switch(_type) { 
				case "object":	if(!$.isEmptyObject(o)) {_self._addData(o);};break;
				case "array" :	$.each(o,function(idx,_o) {_self._addData(_o);});break;
				case "function":
					var _callback = function (_o) { return _self.addData(_o);};
					o.call(_self,_callback);
					break;
				}
			}
			,selectall : function(ischeck) {
				var _val = ischeck === false ? false : true;
				$(".viewlist-body .column.data.selectable input:checkbox",this.element).prop("checked",_val);
			}
			,getSelected : function() {
				var _r = []
					,_scop = this.options.column.selectable == "checkbox" ? "input:checkbox:checked" : this.options.column.selectable == "radio" ? "input:radio:checked" : ""; 
				if(!_scop) {return [];}
				$(".viewlist-body .viewlist-data-tr .column.data.selectable " + _scop,this.element).closest(".viewlist-data-tr").each(function() {
					_r.push({element : $(this), data : $(this).data("view-list-data")});	
				});
				return _r;
			}
			,clearData : function() {
				$(".viewlist-data-tr",this.widget()).remove();
				$(".errormessage",this.widget()).remove(); 
			}
			,errorShow : function(msg,cd) {
				this.clearData();
				$(this.elements.body)		
				.append($('<div class="errormessage" />').html('<P' + (cd ? ' class="' + cd + '"' : '') +'>' + msg+'</P>'));
			}
		});
	})();
	
	(function() {
		/*
		 *  - pageNavigator
		 */
		
		$.widget("ep.eppagenavigator", {
			version: "1.11.1"
			,options : {
				pageSize : 10  /* 네비게이션 페이지 수*/
				,page :0    /* 현재 페이지 */
				,maxPage : 0
				,hideTotal : false
				,total : "( Total: %s )"
				,title : {
					prev : "이전"
					,next : "다음"
					,prevpage : "이전페이지"
					,nextpage : "다음페이지"
				}
				,tag : {
					prev : " &lt; "
					,next : " &gt; "
					,prevpage : " &lt;&lt; "
					,nextpage : " &gt;&gt; "
				}
			}
			,_destroy: function() {
				this.widget().removeClass(this.widgetFullName).empty();
			} 
			,_create : function(){
				this.widget().addClass("ep-widget " + this.widgetFullName);
				if(this.options.maxPage == 0) {return;}
				if(this.options.page == 0) {return;}
				this._drawNavigator();
			}
			,_drawNavigator : function() {
				this.widget().empty();
				var _html = '<table cellpadding="0" cellspacing="0 border="0"><tbody><tr>';
				_html += this._prevpghtml();
				_html += this._prevhtml();
				_html += this._makePage(this._getStart(this.options.page));
				_html += this._nexthtml();
				_html += this._nextpghtml();
				_html += this._totalhtml();
				_html += '</tr></tbody></table>';
				this.widget().html(_html);
				this._bindEvent();
				
			}
			,_bindEvent : function() {
				var _self = this;
				$(".navigator", this.element)
				.off("click")
				.on("click", function(e) {
					e.preventDefault();
					e.stopPropagation();			
					var _cmd = $(e.target).attr("page");
					switch(_cmd) {
						case "prev":_self._prev();break;
						case "next":_self._next();break;
						case "prevpage":_self._prevPage();break;
						case "nextpage":_self._nextPage();break;
						case "total":return;break;
						default :_self.setPage(parseInt(_cmd,10));break;
					}
					_self._trigger("change",null,[_self.options.page]);
				});
			}
			,_getStart : function(page) {		
				var _page = page > this.options.maxPage ? this.options.maxPage : page;
				var _cp = (Math.ceil((_page ? _page : this.options.page) / this.options.pageSize) * this.options.pageSize) - this.options.pageSize + 1 ;
				return _cp;
			}
			//,_getLastPage : function() {return Math.ceil(this.options.maxPage / this.options.pageSize);}
			,_makePage : function(start) {
				var _html = "",i=0;
				while(true) {
					var _pg = (i + start);
					if(i >= this.options.pageSize) {break;}
					if(_pg > this.options.maxPage) {break;}
					_html += '<td class="navigator page' 
						+ (_pg == this.options.page ? ' selected' : '' ) 
						+ '" title="' + _pg 
						+ '" page="' + _pg + '">' 
						+ _pg + '</td>';
					i++;
				}
				return _html;
			}
			,_totalhtml : function() {
				if(this.options.hideTotal) {return "";}
				if(parseInt(this.options.maxPage,10) == 0) {return "";}
				return '<td class="navigator total" page="total">' + sprintf(this.options.total,parseInt(this.options.maxPage,10).toCurrency()) + '</td>';
			}
			,_prevhtml : function() {
				var _title = this.option("title.prev")
					,_html = '<td class="navigator prev"'+ (_title ? ' title="' + _title + '"' : '') + ' page="prev">' + this.option("tag.prev") + '</td>';
				return this._getStart() > 1 ? _html : ""; 
			}
			,_nexthtml : function() {
				var _title = this.option("title.next")
					,_html = '<td class="navigator next"'+ (_title ? ' title="' + _title + '"' : '') + ' page="next">' + this.option("tag.next") + '</td>';
				return this._getStart(this.options.maxPage) > this.options.page ? _html : "";
			}
			,_prevpghtml : function(){
				var _title = this.option("title.prevpage")
					,_html = '<td class="navigator prevpage"'+ (_title ? ' title="' + _title + '"' : '') + ' page="prevpage">' + this.option("tag.prevpage") + '</td>';
				return this._getStart() > 1 ? _html : "";
			}
			,_nextpghtml : function(){
				var _title = this.option("title.nextpage")
					,_html = '<td class="navigator nextpage"'+ (_title ? ' title="' + _title + '"' : '') + ' page="nextpage">' + this.option("tag.nextpage") + '</td>';
				return this._getStart(this.options.maxPage) > this.options.page ? _html : "";
			}
			,_setOption: function(key, value){
				if(key == "page") {	this.setPage(value);return;}
				if(key == "maxPage") {	this.setMaxPage(value);return;}
				$.Widget.prototype._setOption.apply(this, arguments);
			}
			,setPage : function(page) {
				if(parseInt(page,10) <= 0) { return; }
				this.options.page = parseInt(page,10);
				this._drawNavigator();		
			}
			,setMaxPage : function(page,isupdate) {
				//if(page <= 0) return;
				this.options.maxPage = page;
				if(isupdate === true) {this._drawNavigator();}		
			}
			,_prev : function() {
				var _page = this._getStart(this.options.page - this.options.pageSize);
				return this.setPage(_page < 1 ? 1 : _page); 
			}
			,_next : function() {
				var _page = this._getStart(this.options.page + this.options.pageSize);
				return this.setPage(_page < 1 ? 1 : _page); 
			}
			,_prevPage : function() {
				var _page = 1;
				return this.setPage(_page < 1 ? 1 : _page); 
			}
			,_nextPage : function() {
				var _page = this.options.maxPage;
				return this.setPage(_page < 1 ? 1 : _page);
			}
			
		});
	})();
	
	(function() {
		// Client 통신
		var awareness = new (function _awareness(data){
			this.data = data || {};
			this.curr_uid = '';
			this.unique_id = (new Date()).getTime().toString(16);
			this.req_queue = [];
			this.req_count = 0;
			this.req_id = 0;
			this.req_status_id = 0;
			this._started = false;
			this._req_loop_started = false;
			this.init = function(){
			};
			/* 연달아 여러명의 요청이 있을 수 있으므로 delay 500 줌. 한번에 처리 하기 위함 */
			this.reqStatus = function(id, callback){				
				var _self = this;
				_self.req_queue.push(id);
				if(_self.delay_req) _self.delay_req.clear();
				_self.delay_req = $ep.util.delay();
				_self.delay_req.run(function(){
					_self._reqStatus(callback);
				},500);
			};
			this._reqStatus = function(callback){
				var _self = this;
				if(_self._req_loop_started){
					_self.req_status_id++;
					return _self.getStatus(
							_self.unique_id,
							callback || _self.data.callback, _self.req_id, _self.req_status_id);
				}else{
					_self.req_id++;
					_self.start(callback, _self.req_id);
				}
			};
			this.reset = function(callback){
				var _self = this;
				_self.stop();
				_self.req_queue = [];
				_self.req_count = 0;
				$ep.util.cleanAwareness();
				$.each($ep.cache.awareness, function(_id, _obj){
					_self.req_queue.push(_id);
					_obj.localUpdateStatus({status:-1, ipt:14});
				})
//				console.log("reset", this.req_id, this.req_queue);
				this.start(callback, this.req_id);
			};
			this.stop = function(){
				this.req_id++;
				this._started = false;
				this._req_loop_started = false;
			};
			this.start = function(callback, req_id){
//				console.log("start", req_id);
				this._started = true;
				var _self = this;
				if(_self.req_id != req_id) return;
				if(this.delay_retry) this.delay_retry.clear();
				/*this.removeAll().then(
					function(){	// done
						return _self.getUID(callback);
					}
				)*/
				return _self.getUID(callback)
				.then(
					function(){
						if(_self.req_id == req_id){
							_self._req_loop_started = true;
							_self.req_status_id++;
							return _self.getStatus(
									_self.unique_id,
									callback || _self.data.callback, req_id, _self.req_status_id);
						}else{
							return $.Deferred().reject("req_id");
						}
					},
					function(){
//						console.log("start fail - ", req_id, arguments);
						// removeAll or getUID fail 재시도
						if(_self.delay_retry) _self.delay_retry.clear();
						if(_self.req_id == req_id){
							_self.delay_retry = $ep.util.delay();
							_self.delay_retry.run(function(){
								_self.start(callback, req_id);
							}, _self.data.repeattime);
						}
					}
				)
			};
			this.request = function _request(req, callback){
				var _self = this;
				return $.ajax({
					url:$ep._CONST.ABC.REQUESTURL,
					dataType:"jsonp",
					timeout:(req.subType == "getStatus"?_self.data.repeattime:1500),
					cache:false,
					async:true,
					data:req
				})
				.then(
					function(data, textStatus, xhr){
						// done
						var obj = {};
						try{
							obj = (typeof data == "object"?data:$.parseSJON(data));
						}catch(e){
							obj = data;
						}
						return obj;
					},
					function(xhr, textStatus, err){
					}
				);
			};
			this.removeAll = function _removeAll(callback){
				var _self = this;
				var req = {
					reqType:"typeAW",
					subType:"removeAll"
				};
				return _self.request(req, callback);
			};
			this.getUID = function _getUID(callback){
				var _self = this;
				var req = {
					reqType:"typeAW",
					subType:"getUID"
				};
				return _self.request(req, callback)
				.then(
					function(obj){
//						console.log("getUID - ", arguments);
						_self.curr_uid = obj.loginID[0].uid;
						$ep.util.abc.status = 1;
						$ep.util.abc.abc_login_user = obj.loginID[0].uid;
						$ep.util.abc.abc_login_id = obj.loginID[0].userid;
					},
					function(){
//						console.log("getUID fail - ", arguments);
						$ep.util.abc.status = 0;
						$ep.util.abc.abc_login_user = "";
						$ep.util.abc.abc_login_id = "";
					}
				);
			};
			this.getStatus = function(uniqueid, callback, req_id, req_status_id){
				var vids = [];
				for(var i = 0; i < 50; i++){
					if(this.req_queue.length == 0) break;
					vids.push(this.req_queue.shift().replace(/,/g, "/"));
				}
				this.req_count += vids.length;
				return this._getStatus(vids, uniqueid, callback, req_id, req_status_id);				
			};
			this._getStatus = function __getStatus(vids, uniqueid, callback, req_id, req_status_id){
//				console.log("req getStatus : ", req_id, req_status_id, uniqueid, "요청수 : ", vids.length, vids);
				var _self = this;
				var req = {
						reqType:"typeAW",
						subType:"getStatus",
						param0:uniqueid,
						param1:vids.join("|")
				};
				return this.request(req, callback)
				.then(function(data){
//					console.log("res getStatus : ", data);
					if(!data || !data.buddyState) {return data;}
					var _list = $ep.cache.awareness;
					$.each(data.buddyState, function(_idx,_data) {
						var _o = _list[_data.uid];
						if(!_o) {return;}
						_o.localUpdateStatus(_data);
					});
					return data;
				})
				.then(
					function(data){
						if(data && data.buddyCnt != null
								&& data.buddyCnt === 0){
//							console.log("response buddyCnt 불일치 : ", _self.req_count, data.buddyCnt);
							return $.Deferred().reject("nothing");
						}
						return data;
					},
					function(){
						// fail
//						console.log("getStatus 실패", arguments);
						return _self.getUID();
					}
				)
				.then(
					function(data){
						// getStatus, 또는 getStatus 실패 후 getUID 성공시
						// delaytime마다 다시 요청함.
						if(_self.req_id == req_id && _self.req_status_id == req_status_id){
							if(_self.delay_get_status) _self.delay_get_status.clear();						
							_self.delay_get_status = $ep.util.delay();
							_self.delay_get_status.run(function(){
//								console.log("delay_get_status run", req_id, req_status_id);
								_self.getStatus(uniqueid, callback, req_id, req_status_id);
							}, _self.data.delaytime);	
						}else{
//							console.log("req_status_id 불일치 종료",req_status_id, _self.req_status_id);
							return $.Deferred().reject("req_status_id");
						}
					},
					function(){
//						console.log("buddyCnt == 0, getStatus, getUID 실패");
						if(_self.req_status_id == req_status_id){
							_self.reset();
						}else{
//							console.log("req_status_id 불일치 종료",req_status_id, _self.req_status_id);
							return $.Deferred().reject("req_status_id");
						}
					}
				);
			}
		})(
			{
				interval:30000,
				repeattime:35000, 
				delaytime:1500,
				callback:null
			}
		);
		/*
		 * ep.epawareness
		 * 
		 */
		/*
		 * ABC AWARENESS : stproxy 사용안함.
		 if(typeof stproxy != "undefined" && !window.stproxy.uiControl.preferences.updateStore) {
			window.stproxy.uiControl.preferences.updateStore = function(){};
		}; 
		*/
		/* baseComps.js 오류  방어.... include.js 로드하면 불필요...*/
		function _stName(uid,info) {
			var _self = this
				,_stbind = []
				,_stHandler = null
				,_timer = 0
				,_info = info || {ipt : ""};
			this.id = uid;
			this.info = function(info) {info && $.extend(true,_info,info);return _info;};
			this.refCount = function() {return _stbind.length;};
			this.stproxy = {
				model : null
				,status : -1
				,statusMsg : ""
				,className : ""
				,isReady : false
				,isChat : false
			};
			/* ABC AWARENESS */
			this.awareness_type = {
					   AVAILABLE: 1,
					   AVAILABLE_MOBILE: 6,
					   AWAY: 2,
					   AWAY_MOBILE: 7,
					   DND: 3,
					   DND_MOBILE: 8,
					   IN_MEETING: 5,
					   IN_MEETING_MOBILE: 10,
					   NOT_USING: 4,
					   OFFLINE: 0,
					   UNKNOWN: -1
					};
			this.ipt = {
				status : 14,
				statusMsg : "",
				className : "tel_noStay"					
			};
			this.unusedtime = function() {
				return this.refCount() == 0 ? ((new Date().getTime() - _timer)/1000/60) : 0;
			};
			this.destroy = function(){
				/* ABC AWARENESS
				 * _stHandler && stproxy.hitch.disconnect(_stHandler);*/
				_self = null;				
				this.stproxy = null;
				this.ipt = null;
				$ep.cache.awareness[this.id] = null;
				delete $ep.cache.awareness[this.id];
			};
			this.abcStatus = function() {return $ep.util.abc.status;};
			this.abc = function() {return $ep.util.abc;};
			this.bindUpdate = function(parent,handler) {
				var _parent = parent,_handler = handler;
				var _src = {parent : _parent, event : _handler	};
				_stbind.push(_src);
				_timer = new Date().getTime();
			};
			this.unbindUpdate = function(handler) {
				_stbind = $.grep(_stbind,function(src) {return !(src.event == handler);});
				_timer = new Date().getTime();
			};
			this.phone = function(){
				//if(this.abcStatus() == 0) {_log("abc not ready");return;}
				//if(this.ipt.statusMsg !=  "available") {_log("abc not available");return;} //상태와 관계없이 전화
				if(!_info.ipt) {_log("empty phone number!!");return;}
				this.abc().phone(_info.ipt).fail(function() {_log("abc phone error!")});
				return;
			} ; 
			this.login = function() {
				/* ABC AWARENESS
				 * if(stproxy.isLoggedIn){_onLoggedIn();return;}
				stproxy.login.loginByToken(null, stproxy.awareness.AVAILABLE, null, _onLoggedIn, _loginFailed);*/
				//stproxy.login.loginAsAnonWithToken(null, stproxy.awareness.AVAILABLE, null, _onLoggedIn, _loginFailed);
				//stproxy.login.loginAsAnon(null, stproxy.awareness.AVAILABLE, null, _onLoggedIn, _loginFailed);
				
			};
			this.update = function(){
				/* ABC AWARENESS
				 * if(!_self.stproxy.model) {return;}
				_stChangeStatus(_self.stproxy.model.status,_self.ipt.status);*/
				_stChangeStatus.call(_self, _self.stproxy.status, _self.ipt.status);
			};
			this.iptUpdateStatus = function(s) {		
				return;
				/*if(this.ipt.status == s) {return;}				
				this.ipt.status = s;				
				_iptChangeStatus.call(this);*/
			};
			
			this.chat = function() {
				var _sts = this.stproxy.status
					,/* ABC AWARENESS
					_aware = stproxy.awareness*/
					_aware = this.awareness_type;
				
				if(_sts == _aware.UNKNOWN 	|| _sts == _aware.OFFLINE ||
					_sts ==  _aware.DND		|| _sts ==  _aware.NOT_USING ||
					_sts == _aware.IN_MEETING || _sts == _aware.IN_MEETING_MOBILE) {
					_log("not available");
					return;
				}
				this.abc().chat(this.id)
				.fail(function() {
					/* ABC AWARENESS
					 * stproxy && stproxy.openChat(_self.stproxy.model.id);*/ 						
				});
				return;
			};
			/* ABC AWARENESS */
			this.localUpdateStatus = function(res){
				var _st = res.status;
				var _ipt = res.ipt;
				_stChangeStatus.call(this, _st, _ipt);
			}
			
			function _triggerUpdate(){$.each(_stbind, function(idx,bind) {bind.event.apply(bind.parent,[_self]);});};
			function _stChangeStatus(st,ipt) {
				/* ABC AWARENESS
				 * var _aware = stproxy.awareness, _st = _self.stproxy,_ipt = _self.ipt;*/
				var _aware = this.awareness_type,
				_st = _self.stproxy,_ipt = _self.ipt;
				//if(_st.status == st && _ipt.status == ipt ) {return;}
				_st.status = st;
				_ipt.status = ipt;
				switch(_st.status) {
				/*  ABC AWARENESS
				 * 	case _aware.UNKNOWN				: _st.statusMsg = "unknown"; _st.className = "pc_offLine";break; 			//-1
					case _aware.OFFLINE				: _st.statusMsg = "offline";_st.className = "pc_offLine"; break;			//0
					case _aware.AVAILABLE			: _st.statusMsg = "available";_st.className = "pc_onLine";break;			//1
					case _aware.AWAY				: _st.statusMsg = "away"; _st.className = "pc_noStay";break;				//2
					case _aware.DND					: _st.statusMsg = "dnd"; _st.className = "pc_noRecive";break;				//3
					case _aware.NOT_USING			: _st.statusMsg = "unknown"; _st.className = "pc_offLine";break; 			//4
					case _aware.IN_MEETING			: _st.statusMsg = "inmetting"; _st.className = "pc_meeting";break;			//5
					case _aware.AVAILABLE_MOBILE	: _st.statusMsg = "availablemobile"; _st.className = "mobile_online";break;	//6
					case _aware.AWAY_MOBILE			: _st.statusMsg = "awaymobile"; _st.className = "mobile_noStay";break;		//7
					case _aware.DND_MOBILE			: _st.statusMsg = "dndmobile"; _st.className = "mobile_noRecive";break;		//8
					case _aware.IN_MEETING_MOBILE	: _st.statusMsg = "inmeetingmobile"; _st.className = "mobile_meting";break; //10*/
				case 0 : _st.statusMsg = "offline"; _st.className = "pc_offLine";break;
				case 1 : _st.statusMsg = "available"; _st.className = "pc_onLine";break;
				case 2 : _st.statusMsg = "away"; _st.className = "pc_noStay";break;
				case 3 : _st.statusMsg = "dnd"; _st.className = "pc_noRecive";break;
				case 8 : _st.statusMsg = "inmetting"; _st.className = "pc_meeting";break;
				case 544 : _st.statusMsg = "availablemobile"; _st.className = "mobile_online";break;
				case 608 : _st.statusMsg = "awaymobile"; _st.className = "mobile_noStay";break;
				case 640 : _st.statusMsg = "dndmobile"; _st.className = "mobile_noRecive";break;
				case 520 : _st.statusMsg = "inmeetingmobile"; _st.className = "mobile_meting";break;
				default : _st.statusMsg = "unknown"; _st.className = "pc_offLine";break;
				};
				switch(_ipt.status) {
					/* ABC AWARENESS
					 * case 0 							: _ipt.statusMsg = "available";_ipt.className = "tel_callPossible"; break;		
					case 7 							: _ipt.statusMsg = "busy";_ipt.className = "tel_calling"; break;
					case 14 						: _ipt.statusMsg = "unknown";_ipt.className = "tel_noStay"; break;					
					case 21 						: _ipt.statusMsg = "incoming";_ipt.className = "tel_receipt"; break;*/
				case 0 : _ipt.statusMsg = "busy";_ipt.className = "tel_calling"; break;
				case 7 : _ipt.statusMsg = "available";_ipt.className = "tel_callPossible"; break;
				case 14 : _ipt.statusMsg = "unknown";_ipt.className = "tel_noStay"; break;
				case 21 : _ipt.statusMsg = "incoming";_ipt.className = "tel_receipt"; break;
				}
				_triggerUpdate();
			};
			
			function _onLoggedIn() {
				/* ABC AWARENESS TODO model ?
				 * _self.stproxy.model = stproxy.getLiveNameModel(_self.id,{"isInBuddyList":false, "forceWatchlist" : false });
				_stHandler = stproxy.hitch.connect(_self.stproxy.model, "onUpdate", stproxy.hitch.bind(_self,_stOnUpdate));*/	
				//_stOnUpdate(_self.stproxy.model);
			};
			function _stOnUpdate(resp) {
				var _sts = resp.status,_ipts = _self.ipt.status;	
				_self.stproxy.isReady = true;				
				if(resp.statusMessage) {
					var _res = null;
					if((_res = resp.statusMessage.match(/[\x0d]([0-2])/g)) !== null) {
						var _i = parseInt(_res[0],10);
						_ipts = (_i == 0 ? 7 : _i == 1 ? 0 : _i == 2 ? 21 : 14);
					};
				}			
				_stChangeStatus.call(_self,_sts,_ipts);
			};
			function _loginFailed() {
				_log("loginFailed")
			};
			_timer = new Date().getTime();
			this.login();
			/* ABC AWARENESS */
			awareness.reqStatus(this.id);
			return;
		};
		function _getAwareness(uid,info) {
			var _aw;
			/* ABC AWARENESS
			 * if(typeof stproxy === "undefined") {return null;}*/
			$ep.util.cleanAwareness();
			if($ep.cache.awareness[uid]) { _aw = $ep.cache.awareness[uid];info && _aw.info(info);return _aw;}			
			return $ep.cache.awareness[uid] = new _stName(uid,info);				
		};
		
		$.widget("ep.epawareness", {
			version: "1.11.1"
			,options : {
				id : ""
				,message : {
					mail : "Send mail"
					,status : {
						offline 			: "Offline",
						available 			: "Available",
						away 				: "Away",
						dnd 				: "Do Not Disturb",
						inmetting			: "Meeting",
						availablemobile		: "Available(Mobile)",
						awaymobile			: "Away(Mobile)",
						dndmobile			: "Do Not Disturb(Mobile)",
						inmeetingmobile		: "Meeting(Mobile)",
						unknown 			: "Unknown"
					}					
					,iptstatus : {
						available 			: "Available",
						busy 				: "Busy",
						incoming 			: "Incoming",
						unknown 			: "Unknown"
					}
				}
				,server : ""			//master host 
				,mail : function(){}
				,sametime : function(){}
				,iptel : function(){} //return true cancel
				,info : {ipt : ""}
			}
			,listener : null
			,elements : {
				mail : null,
				sametime : null,
				iptel : null
			}
			,_create : function() {
				this.elements = {};
				this.listener = null;
				this.widget().addClass("ep-widget " + this.widgetFullName);
				this.options.classes && this.widget().addClass(this.options.classes); 
				!this.options.id && this.widget().attr("uid") && (this.options.id = this.widget().attr("uid"));
				
				!this.options.info["ipt"] && this.widget().attr("ipt")  && (this.options.info["ipt"] = this.widget().attr("ipt"));
				
			}
			,_init : function() {
				this._initSTProxy();
			}
			,_initSTProxy : function(){
				var _self = this;
				this.options.id && (this.options.id = this.options.id.replace(/\//g,","));
				this.options.id && (this.listener = _getAwareness(this.options.id,this.options.info));
				this.elements.mail = this.widget().hasClass("awareness_mail") ? $(".awareness_mail").removeAttr("class").addClass("icon mailC") : $('<span class="awareness_mail icon mailC" />').appendTo(this.widget());
				this.elements.mail.attr("title",this.options.message.mail);
				this.options.hidemail === true && this.elements.mail.hide();
				this.elements.sametime = this.widget().hasClass("awareness_sametime") ? $(".awareness_sametime").removeAttr("class").addClass("icon pc_offLine") : $('<span class="awareness_sametime icon pc_offLine" />').appendTo(this.widget()); 
				this.options.hidesametime === true && this.elements.sametime.hide();
				this.elements.iptel = this.widget().hasClass("awareness_iptel") ? $(".awareness_iptel").removeAttr("class").addClass("icon tel_noStay") : $('<span class="awareness_iptel icon tel_noStay" />').appendTo(this.widget());
				this.options.hideiptel === true && this.elements.iptel.hide();
				if(this.listener) {	this.listener.bindUpdate(this,this._bindSTUpdate = function(stx) { this.updateStatus(stx)});	}
				this.elements.mail.size() > 0 && this.elements.mail.off("click").on("click", function(e) {
					e.stopPropagation();
					if( _self._trigger("mail") === false) {	return;	};
					$.winOpen($ep._CONST.PATH.LIB + "/redirect_mail?readform&action=newmail&id=" + _self.options.id.replace(/\,/g,"/"));
				});
				this.elements.sametime.size() > 0 && this.elements.sametime.off("click").on("click", function(e) {
					e.stopPropagation();
					if(_self._trigger("sametime") === false) {	return;	};
					_self.listener && _self.listener.chat();}) ;
				this.elements.iptel.size() > 0 && this.elements.iptel.off("click").on("click", function(e){
					e.stopPropagation();
					if(_self._trigger("iptel") === false) {	return;	};
					_self.listener && _self.listener.phone();});
				this.listener && this.listener.update();
			}
			,updateStatus : function(x) {
				var className = x.stproxy.className;
				this.elements.sametime.removeClass(function(idx,cls) {
					return cls.replace(/(\W|^)icon(\W|$)/g," ").replace(/(\W|^)awareness_\w+(\W|$)/g,"").trim();
				}).addClass(className)
				.attr("title",this.options.message.status[x.stproxy.statusMsg]);
				
				//if(x.ipt.status == 14) {return;}
				className = x.ipt.className;
				this.elements.iptel.removeClass(function(idx,cls) {
					return cls.replace(/(\W|^)icon(\W|$)/g," ").replace(/(\W|^)awareness_\w+(\W|$)/g,"").trim();
				}).addClass(className)
				.attr("title",this.options.message.iptstatus[x.ipt.statusMsg]);
			}
			,destroy : function(){
				this._super('destroy');	
				this.listener && this.listener.unbindUpdate(this._bindSTUpdate);
			}
		});
	})();
	
	(function() {
		/*
		 *  - button
		 */
		
		$.widget("ep.epbutton", {
			version: "1.11.1"
			,locked : false
			,options : {
				//id: ""
				dblock : 300
				,defshow :true
				/*text : "dddd"
				 ,css:
				 ,classes :
				 ,highlight : true
				 ,dblock : 1000
				 ,click : function(e) {
					_log("click");
				 }
				,lockclick : function(e,unlock) {
					_log("lockClick");
				}
				,hook : {
					click : function(){
					
					}
				}
				*/
			}
			,_destroy: function() {
				this.widget().qtip("destroy",true);
				this.widget().off("showbutton hidebutton click").empty();		
			} 
			,_create : function() {
				var _self = this,_ele = this.widget();
				_ele.addClass("ep-widget " + _self.widgetFullName);
				if(typeof this.options.show === "undefined") {this.options.show = this.options.defshow;} 
				this.options.classes && _ele.addClass(this.options.classes);
				this.options.highlight === true && _ele.addClass("highlight");
				this.options.css && _ele.css(this.options.css); 
				this.options.show !== true && _ele.removeClass("show") && _ele.addClass("hide");
				this.options.show == true && _ele.removeClass("hide") && _ele.addClass("show");
				this.options.id && _ele.attr("id",this.options.id);
				if(!this.options.id && _ele.attr("id")) {this.options.id = _ele.attr("id");}
				 
				_self._makebutton();
				_self._bindbutton();
				_self._makesecondary();
				this.widget().on("showbutton", function(e,btns) {$.each(btns, function(idx,val){_self.show(val);});	});
				this.widget().on("hidebutton", function(e,btns) {$.each(btns, function(idx,val){_self.hide(val);});	});
			}
			,_makebutton : function() {		
				this.buttonElement = $('<span class="epbutton">'+ (this.options.text||"button" ) + '</span>').appendTo(this.widget());
				!$.isEmptyObject(this.options.children) && this.buttonElement.addClass("haschildren");
				this.options.children && $('<span class="secondary ep-icon"></span>').appendTo(this.widget());
			} 
			,_bindbutton : function() {
				var _self = this
					,_target = _self.buttonElement.hasClass("haschildren") ? _self.buttonElement : _self.widget();
					
				$(_target).on("click",function(e) {
					var _id = _self.options.bindchild ? _self.options.id + "." + _self.options.bindchild : _self.options.id;
					_self._click(e,_id);
				});
			}
			,_getButton : function(id,ele) {
				var _ids = id ? id.split(".") : [];
				return _ids.length > 1 ? this.options.children[_ids[1]] : this.options;
			}
			,_click : function(e,id) {
				var _self = this
				   ,_btn = this._getButton(id,$(e.target).closest(".ep-epbutton"));
				
				if(_btn.lockclick) { return _self._lockclick(e,id);}
				if(this.locked) {return;}
				this.options.dblock && (this.locked = true);
				this.options.dblock && setTimeout(function() {	_self.locked = false;},this.options.dblock);
				if(this.options.hook) {
					if ($.isFunction(this.options.hook["click"])) {
						this.options.hook.click.apply(this.widget(),[e,id,_btn]);
						return;
					} 
				} 
				return _btn.click ? _btn.click.apply(_self.widget(),[e,id,_btn]) : undefined;
				
			}
			
			,_lockclick : function(e,id) {
				var _self = this
					,_btn = _self._getButton(id,$(e.target).closest(".ep-epbutton"));
		
				if(this.alreadyClicked || this.locked) {_log("locked");return;}
				this.locked = true;
				if(this.options.hook) {
					if ($.isFunction(this.options.hook["click"])) {
						return this.options.hook.lockclick.apply(this.widget(),[e,id,_btn,function() {_self.unlock();}]);
					} 
				} 
				return _btn.lockclick ? _btn.lockclick.apply(_self.widget(),[e,id,_btn,function() {_self.unlock();}]) : undefined;
			}
			,_makeQtip : function() {
				var _self = this
					,_opt = _self.options
					,target = _self.widget();
				
				var _keep = null;
				
				$(target).qtip({
					overwrite: true
					,content : function(e,api) {
						var _$qtip = $(this)
							,_api = api
							,_wrap = $('<div class="epbutton"><ul class="epbutton-item" /></div>')
							,_ul = _wrap.find(".epbutton-item")
							,_fixed = [];
						_api.tooltip.css("min-width",_$qtip.outerWidth() - 2);
						
						$.each(_opt.children,function(idx,val) {
							if(val.fixed == true) {_fixed.push($.extend(true,{id : idx},val));return true;}
							if(val.show !== true) {return true;}
							
							$('<li class="epbutton-item" id="'+ _self.options.id + '.' + idx + '">'
							+ '<span title="'+ val.text + '">' + val.text + '</span></li>')
							.appendTo(_ul)
							.click(function(e){
								var _val = val
								   ,_id = $(e.target).closest("li").attr("id");
								_self._click(e,_id);
							});
						});
						_ul =  $('<ul class="epbutton-item fixed" />').appendTo(_wrap);
						$.each(_fixed,function(idx,val) {
							if(val.show !== true) {return true;}
							$('<li class="epbutton-item" id="'+ _self.options.id + '.' + val.id + '">'
								+ '<span title="'+ val.text + '">' + val.text + '</span></li>')
									.appendTo(_ul)
									.click(function(e){
										var _val = val
										   ,_id = $(e.target).closest("li").attr("id");
										_self._click(e,_id);
									}
							);
						});
						
						return _wrap;
					}
					,position: $.extend({at : 'bottom left',my : 'top left',adjust : { method: "shift flip" ,x : 0 ,y : 0,screen:true }, viewport: true},_self.options.position) 
					,hide : {	event : "unfocus mouseleave click" // 
								,target : !(_opt.bindchild||_opt.click||_opt.lockclick) ? target : $(".secondary",target)
								,delay : 200,fixed:true,effect : true}
					,show: {delay : 50, event: 'click',target : !(_opt.bindchild||_opt.click||_opt.lockclick) ? target : $(".secondary",target), solo: true, effect : true} 
					,style : {tip : false	,classes : _self.widgetFullName + "-qtip"}
					,events : {
						show : function(e,api) {
							var _show = _self.children > 0;
							if(_show && $ep.util.browser.msie){
								_keep && _keep.clear() && (_keep = null);
								_keep = $ep.util.keepObject();
								_keep.hide();
							}
							return _show;
						}
						,hide : function(e,api) {
							_keep && _keep.show();
							//api.destroy(true);
						}
					}
				});
			}
			,_makesecondary : function(){
				if(!this.options.children) {return;}
				var _self = this;
				this._updateChild();
				//if(this.children == 0) {_self.hide();return;}
				this._makeQtip(/*this.options.children*/);
				
			}
			,_updateChild : function(){
				var _self = this;
				this.children = (function(){
					var _cnt = 0;
					$.each(_self.options.children, function(idx,val){
						if(typeof val.show  === "undefined") {val.show = _self.options.defshow;}
						val.show == true && (_cnt++);
					});			
					return _cnt;
				})();		
			}
			,hide : function(key) {
				var _self = this;
				if(!key) {this.widget().removeClass("show").addClass("hide");this.options.show = false;return;}
				var _key = key.split(".");
				if(_key[0] !== this.options.id) {return;}
				if(_key.length == 1 ) {	_self.hide();return;}
				if(!_self.options.children) {return;}
				if(!_self.options.children[_key[1]]) {return;}
				_self.options.children[_key[1]].show = false;
				_self._updateChild();
				this.children == 0 && this.hide(); 
			}
			,show : function(key) {
				var _self = this;
				if(!key) {this.widget().removeClass("hide").addClass("show");this.options.show = true;return;}
				var _key = key.split(".");
				if(_key[0] !== this.options.id) {return;}
				if(_key.length >= 1 ) {	_self.show();}
				if(_key.length == 1) {return;}
				if(!_self.options.children) {return;}
				if(!_self.options.children[_key[1]]) {return;}
				_self.options.children[_key[1]].show = true;		
				_self._updateChild();
				this.children == 1 && this.show();
			}
			,disable : function(){this.widget().prop("disabled",true);}
			,enable : function() {this.widget().prop("disabled",false);}
			,unlock : function() {	this.locked = false;}
		});
	})();
	(function() {
		/*
		 *  - `
		 *  - dependecy
		 *    $ep.ui
		 */
		if(!$.ui) {return;} 
		$.widget("ep.epdialog",$.ui.dialog, {
			options : {
				modal : true
				,iframe : false
				,resizable: false
				,content : {}
				//,script : $ep
				,lang : {
					script : typeof $ep !== "undefined" ?  $ep : null
					,prefix : ""
				}
				,complete : function() {
					//_log("dialog","complete");
				}
			}
			//,active : null
			,content : null
			,_create : function() {
				if(this.options.lang.script) {this.options.lang.script.LangConvertObject(this.options,"title,text");}
				this._super('_create');
				this.content = $(this.element);
				this.widget().addClass("ep-widget " + this.widgetFullName);
				this._content();
				//this._super("_position");
			}
			,_content : function(){
				var _self = this
					,_opt = _self.options
					,_curi = _opt.content ? _opt.content.url ? $.CURI(_opt.content.url) : typeof _opt.content == "string" ? $.CURI(_opt.content) : null  : null;

				try {
						if (top.mailserver != undefined || top.LINKURL != undefined) {
							if (top.LINKURL != "" || top.mailserver != "") {
								_opt.position.at = "top";
							}	
						}
				} catch (e) {}				
					
				_curi && _curi.setArgv({dialogid : _opt.dialogid});
				if(_opt.iframe !== true && _curi) {			
					var _wuri = $.CURI();
					 if(_wuri.host().toLowerCase() != _curi.host().toLowerCase()) {_opt.iframe = true;}
				}
				
				if(_opt.iframe === true) {
					$(_self.content).css("overflow","hidden");
					_self.content = $('<iframe src="'+ (_curi ? _curi.url : "about:blank") + '" frameborder="0" style="display:inline-block;height:100%;width:100%;" />')
						.load(function() {
							_opt.content.html && $(this).contents().find("body").html(_opt.content.html) ;
							_self._trigger("complete");
						})
						.appendTo(_self.content);
					return;
				}
				$ep && $ep.ui && ((_self.options.active = $ep.ui.activeId()) && $ep.ui.active(_self.options.dialogid));
				if(!_curi && _opt.content.html){
					$(_self.content).html(_opt.content.html);
				}
				if(!_curi) {_self._trigger("complete");return;}
				var _lang = _opt.lang; 
				if(_lang.langpack && _lang.prefix) {
					$ep.ui.loadPageLangPack(_self.content,_curi.url,_lang.langpack,_lang.prefix).done(function() {_self._trigger("complete");});;
				} else {
					$ep.ui.loadPageLang(_self.content,_curi.url,_lang.script||$ep).done(function() {_self._trigger("complete");});;
				}
				
			}
			,_createOverlay: function() {
				if ( !this.options.modal ) {
					return;
				}
				/* allowtransparency="true" 제거함 IE8에서 하단 Object 표시됨.*/
				this.overlayIframe = $('<iframe src="about:blank" class="ui-widget-overlay-iframe" frameborder="0" style="z-index:99;"/>' )
					.appendTo( this._appendTo() ); 
				this._super('_createOverlay');
				
			}
			,close : function(e) {
				var _before = this.options.beforeClose;
				if ( !this._isOpen || this._trigger( "beforeClose", e ) === false ) {	return;	}
				this.overlayIframe && this.overlayIframe.size() > 0 && this.overlayIframe.remove();
				this.options.beforeClose = null;	
				this._super('close');
				this.options.beforeClose = _before;
				this.options.active && ($ep && $ep.ui && $ep.ui.active(this.options.active));
				this.destroy();
			}
			,destroy : function() {
				$(this.element).empty(); 
				this._super('destroy');
				//this.active = null; 
				$(this.element).remove();
			}
		});
	})();
	
	(function() {
		/*
		 * epsideMenu
		 */
		$.widget("ep.epSideMenu", {
			version: "1.11.1"
			,options : {
				speed : 150
				,mode : "multi"
				
		/*		title : "UI 공통 설계"
				,mode : "single"
				,speed : 150
				,positionTop : 87px
				,positionBottom : 0px
				,button : {
					
				}
				,items : [
				   { text : function(){return "function Menu 1";}
				   	  ,isopen : true
					  ,items : {
						   test : {
							   text : function(e) { e.html("innerHTML");}
							   ,isactive : true					   
						   }
					   }
				   }          
				   ,{ 
					   text : " Menu 2"
					   ,isopen : true 
					   ,items : [
					      { text : "Menu2-1" , classes : "menu21"
					    	, click : function(e,ele) {
					    		_log("--",arguments);
					      	} 
					      }
					      ,{ text : "Menu2-2" } 
					      ,{ text : "Menu2-3" ,items : [ {text : "Menu2-3-1"} ]} 
					   ] 
				   }
				   ,{  
					   text : " Menu 3"
					   ,href : "http://me.amorepacific.com/ngw/comm/prototype.nsf/viewpage?readform&alias=view01"
				   }		   
				]*/
			}
			,dataKey : function() {return this.widgetName +".data";}
			,elements : {
				wrap : null
				,top : null
				,title : null
			}
			,_create : function() {
				this.widget().addClass("ep-widget " + this.widgetFullName);
				this.elements.wrap = this.widget().wrapInner('<div class="side-wrap" />').children(":first").disableSelection();
				this.elements.top = $(this.elements.wrap).has('ul').size() > 0  ? $("ul:first",this.elements.wrap).addClass("side-ul") : $('<ul class="side-ul" />').appendTo(this.elements.wrap);
				this.elements.items = $(".side-ul.menu-wrapper",this.elements.wrap).size() > 0 ? $(".side-ul.menu-wrapper",this.elements.wrap) : $('<ul class="side-ul menu-wrapper" />').appendTo(this.elements.wrap);
				(typeof this.options.positionTop !== "undefined") && this.elements.items.css("top",this.options.positionTop) ; 
				(typeof this.options.positionBottom !== "undefined") && this.elements.items.css("bottom",this.options.positionBottom) ;
				this._draw();
			}
			,_closeAll : function(e,parent) {
				var _self = this;
				$(parent).children("li.open").each(function() {
					var _t = $(this);
					$("ul.side-ul:first",_t).slideToggle({ 
						duration : _self.options.speed
						,start : function() {return _self._eventTrigger("close",e,_t);}
						,complete : function() {
							$(_t).removeClass("open");
							$(this).css("display","");
						}
					});
				});
			}
			,_eventTrigger : function(ev,e,ele) { /*"click",e,ele,...*/
				var _o = $(ele).data(this.dataKey());
				if(!$(ele).hasClass("haschild")) {
					switch(ev) {
					case "click":
						$("li.active",this.widget()).removeClass("active");
						$(ele).addClass("active");
						break;
					}
				}
				/*evt,event,ele,object,....*/
				if($.isFunction(this.options.eventListener)) {
					return this.options.eventListener.apply(this.element,[ev,e,ele,_o].concat(Array.prototype.slice.call(arguments,3)));}
				switch(ev) {
				default: return _o && _o[ev] && _o[ev].apply(this.widget(),[e,ele,_o].concat(Array.prototype.slice.call(arguments,3)));break;
				}
			}
			,_toggleMenu : function(e,element) {
				var _self = this
					,_li = element;
		
				$("ul.side-ul:first",_li).slideToggle({
					duration : _self.options.speed
					,start : function(){
						return _li.hasClass("open") ? _self._eventTrigger.call(_self,"close",e,_li) :  _self._eventTrigger.call(_self,"open",e,_li) ;
					}
					,complete : function() {
						if(_li.hasClass("open")) {
							_li.removeClass("open");				
						} else {
							if(_self.options.mode == "single") { _self._closeAll(e,_li.closest("ul"));}
							_li.addClass("open");
						}
						$(this).css("display","");
					}
				});
			}
			,_draw : function() {
				var _self = this;
				this._drawTitle(); 
				this._drawButton();
				
				this._drawMenu(this.elements.items,this.options.items,0);
				$('li.item > span',this.widget()).click(function(e) {
					var _li = $(this).closest("li.item");
					_li.hasClass("haschild") && _self._toggleMenu(e,_li);
					_self._eventTrigger("click",e,_li);
				});
			}
			,_drawTitle : function(){
				var _opt = this.options
					,_$title = $("li.title",this.elements.top);
				
				if(!_opt.title) {return;}
				var _$title = _$title.size() > 0 ? $("li.title",this.elements.top) : $('<li class="side-li title" />').prependTo(this.elements.top);
				this.elements.title = _$title;
				switch(typeof _opt.title) {
					case "string":	_$title.html(_opt.title);break;
					case "function":_$title.html(_opt.title.apply(this,_$title));break;
				}
				_$title.wrapInner('<span class="side-item item-label" />');
				return;
			}
			,_drawButton : function(){
				var _opt = this.options;
				if(!_opt.button) {
					!(_opt["positionTop"]) && this.elements.items.css({"top": "87px"});
					return;}
				var _$b = $('li.side-li.button',this.elements.top);
				_$b = _$b.size() > 0 ? _$b :$('<li class="side-li button" />').insertAfter(this.elements.title || this.elements.top);
				var _$button = this.elements.button = $('<span class="side-button" />').appendTo(_$b.empty());
				var _$tr = $("<table><tbody><tr /></tbody></table>").appendTo(_$button).find("tr");
				
				$.each(_opt.button, function(idx,o){
					var _$td = $('<td></td>').appendTo(_$tr);
					if (o.width && _$td.css({width : o.width})) {delete o.width;}
					$('<span id="' + ($.isNumeric(idx) ? "side" + idx : idx) + '" />').appendTo(_$td).epbutton(o);
					
				});
				
			}
			,_drawMenu : function(parent,items,depth) {
				var _self = this
					,_items = items
					,_parent = parent;
				if(!_items) {return;}
				$.each(_items, function(idx,v) {
					var _$item = $('<li class="side-li item" />').appendTo(_parent)
						,_$label = $(v.tag ? v.tag : '<span class="side-item item-label" />').appendTo(_$item);
					_$item.data(_self.dataKey(),v);
					var _$data = v.text ? $.isFunction(v.text) ? v.text.apply(_self,[_$label]) : v.text : "";
					_$data instanceof jQuery ? _$label.append(_$data) :  _$label.html(_$data);			
					//v.href && _$item.attr("href",$.isFunction(v.href) ? v.href.call(_self,_$item) : v.href);
					v.classes && _$item.addClass(v.classes);
					v.isactive === true && _$item.addClass("active");
					v.ishide === true && _$item.hide();
					if(v.items) {
						_$item.addClass("haschild");
						v.isopen === true && _$item.addClass("open");
						//v.isactive === true && _$item.addClass("active");
						$('<span class="side-item holder" />').appendTo(_$item);
						_$item.wrapInner('<span class="side-item item-wrap" />');
						var __$item = $('<ul class="side-ul depth' + (depth+1)  + '" />').appendTo(_$item);
						_self._drawMenu(__$item,v.items,depth+1);
					}
					//$.isFunction(v.click) && _$item.click(function() {v.click.apply(_self,[_$item]);});  
				});		
			}
			,destroy: function() {
				this._super("destroy");
			} 
		});
	})();
	
	(function() {
		if(!$.ui) {return;}
		if(!$.ui.fancytree) {return;} 
		$.widget("ep.eptree",$.ui.fancytree, {
			_create : function() {
				this._super("_create"); 
				this.tree._triggerNodeEvent = function(type, node, originalEvent, extra) {
					//this.debug("_trigger(" + type + "): '" + ctx.node.title + "'", ctx);
					//_log("tree NodeEvent",type,originalEvent);
					var ctx = this._makeHookContext(node, originalEvent, extra),
						res = this.widget.options.hooking ? this.widget.options.hooking.apply(this.widget.element, [type,originalEvent,ctx]) : this.widget._trigger(type, originalEvent, ctx);
					if(res !== false && ctx.result !== undefined){
						return ctx.result;
					}
					return res;			
				};
				/* _trigger a widget event with additional tree data. */
				this.tree._triggerTreeEvent = function(type, originalEvent) {
		//			this.debug("_trigger(" + type + ")", ctx);
		//			_log("tree TreeEvent",type,originalEvent);
					var ctx = this._makeHookContext(this, originalEvent),
						res = this.widget._trigger(type, originalEvent, ctx);
		
					if(res !== false && ctx.result !== undefined){
						return ctx.result;
					}
					return res;
				};
			}
		});
		$.ui.fancytree.registerExtension({
			name: "mail.extension",
			version: "0.2.0",
		/*	options : {
				source : [
				   {title : "수신(0)",key : "to"	,type : "mailroot", 	folder : true}
				  ,{title : "참조(0)",key : "cc"	,type : "mailroot", 	folder : true}
				  ,{title : "비밀(0)",key : "bcc"	,type : "mailroot", 	folder : true}
				]
				,renderNode : function(e,ctx) {
					var node = ctx.node
						,_title = node.title;
					if(!node.isFolder()) {return;}
					if(node.isFolder() && node.children) {
						var _count = node.children.length;
						_title = _title.replace(/(^.*)\([0-9]+\)/g,"$1("+_count+")");
						node.setTitle(_title);
					}
				}
			},*/
			treeInit: function(ctx){
				var tree = ctx.tree;
				//$.extend(this.options, this.options["mail.extension"]);
				//this.options.renderNode = this.options["mail.extension"].renderNode;
				this._super(ctx);		
			},
			// Default options for this extension.
			treeRegisterNode : function(ctx, add, node) {
				if(node.isFolder()) {return;}
				this.options.dataRender && this.options.dataRender.call(this,ctx,add,node); 
				this._super(ctx);
			}
			/*,nodeRender: function(ctx) {
				var node = ctx.node,
					_title = node.title;
				this._super(ctx);
				_log("nodeRender",ctx);		
				
			}*/
		});
	})();
	(function() {
		if(!$.ui) {return;} 
		$.widget("ep.eptabs", $.ui.tabs, { 
			tabselect : function(index) {
				var self = this;//, $e = $(self.element),o = this.options;
				self._activate(index);
				return;
			}
			,getActivePanel : function() {
				var self = this//, $e = $(self.element),o = this.options
				,_panel = self.panels.filter( ".ui-tabs-panel[aria-hidden=false]" );
				return _panel;
			}
			,getPanel : function(tabid) {return this.panels.filter("#"+"tabid");}
		});	
	})();
	
	(function() {
		"use strict";
		/*
		 * ep.epgrid
		 * - options
		 * 		draggable :
		 * 		isduplicate : 중복 처리
		 * 		keycode : 
		 * 		reverse :
		 * 		numbering :	Object	N	순번 표시 - true 이거나 Object 선언이 되면 순번 표시 
		 *			- start	String	N	시작 지점을 순번 대신 텍스트로 표시
		 *			- end	String	N	종료 지점을 순번 대신 텍스트로 표시
		 *			- width	String	N	
		 * 		duplicate 
		 * 			- message
		 * 		headers
		 * 			id			String	Y	데이터 Object의 field명
		 *			label		String	Y	Grid Column title
		 *			width		String	Y	Column의 width로 px 단위 또는 "*"
		 *			hcss		Object	N	COlumn Header의 Style
		 *			css			Object	N	Data Column의 Style
		 *			format		String	N	Data 표시 형식(formatComplete사용)
		 *			expression	Function	N	(ele,colset,data), return되는 결과값 반영
		 *			inputType	Object	N	컬럼 입력 형식 정의
		 *				- type		String	Y	selectbox 만 현재 지원
		 *				- def		String	N	기본값
		 *				- itemset	ListArray	Y	selectbox 선택 값을 List Array로 정의
		 * 		itemRender
		 * 		selectType
		 * 		dataset
		 * 			- hidecheckbox
		 * 			- hideradio
		 * 			- disabled
		 * 			- selected
		 * 		rowclick 
		 *
		 */
		var __wait	= function(){return (function() {	var _timer = 0;	
		var _result = {	clear : function(){clearTimeout(_timer);return this;}
			,run : function(callback,ms){this.clear();	_timer = setTimeout(callback,ms);}};return _result;	})();};
		$.widget( "ep.epgrid", {
			version: "1.11.2"
			,options : {
				draggable 	: true,			/* drag 지원 여부*/
				isduplicate : false,			/* 중복 방지 여부 */
				keycode 	: "key",			/* 중복 방지 키 필드 기본값은 key */
				reverse 	: false,				/* 역 방향 추가 */
				numbering 	: false,			/* 순번 추가 */  
				duplicate 	: {	 message : "",type : "" /*alert,toast*/ },
				hideheader 	: false,
				headers 	: null,
				itemRender 	: undefined, 	/*callback */
				selectType 	: "", /*checkbox, radio, rowselect*/
				dataset 	: null,
				rowclick 	: null,
				dragstop 	: null,
				offresize	: false,
				className 	: "",		/* plugin class 명 변경.*/
				height		: null,
				width 		: null
			 }
			,_create : function() {
				if(!this.options.className) {this.options.className =  this.widgetFullName };
				this.element.addClass("ep-widget " + this.options.className);
				this.options.classes && this.element.addClass(this.options.classes);
				this.options.width !== null && this.element.css("width",this.options.width);
				this.options.height !== null && this.element.css("height",this.options.height);
				this.options.hideheader === true && this.element.addClass("hideheader");
				this._delay = __wait();
				this._initGrid();
				if(this.options.draggable == true) {	this._initSortable();return;}
				//$(this.element).disableSelection(); FF에서 문제..ㅜㅜ 
				//if(typeof this.options.complete == "function") { this.options.complete.call(this.Element);}
			}
			,_destroy: function() {this.element.removeClass("ep-widget " + this.options.className);	return this;} 
			,_setOption: function(key, value){ 	$.Widget.prototype._setOption.apply(this, arguments);return this;}
			,_setOptions : function(options) {$.Widget.prototype._setOptions.apply(this, arguments);return this;}
			,_initSortable : function() {
				var _self = this;
				if(!($.ui && $.ui.sortable)) {return;}
				$("table tbody",this.element).sortable({ axis: 'y' ,revert: 100, delay : 200, items : 'tr:not(.' + _self.options.className +'-disabled)' 
					,helper: function(e, tr)	{
						var orgs = tr.children(),
						_helper = tr.clone(); 
						_helper.children().each(
								function(index) {
									$(this).width(orgs.eq(index).width());
									$("select",this).val($("select",orgs.eq(index)).val());													
								}); 
						return _helper; 
					}
					,stop : function() {
						//e.stopImmediatePropagation();
						
						if(_self.options.numbering) {_self._refreshNumber();return;}
						_self._trigger("dragstop");						

					}
				});
			}
			,_initGrid : function() {
				this._Elements = {};
				var _self = this, ele = _self.element,opt = this.options, _iele = this._Elements;
				
				if(!opt.headers) {return;}				
				var _head = opt.headers
					,_hwrap = $('<div class="' + this.options.className +'-header-div" />').appendTo(ele)
					,_htbl = $('<table class="' + this.options.className +'-header-table" border="0" cellpadding="0" cellspacing="0" />').appendTo(_hwrap);
					
				_self._draw_colgroup(_htbl);
				var _hth = $('<thead />').appendTo(_htbl);
				_iele.htbl = _htbl; 
				  
				
				var _htr = $('<tr />').appendTo(_hth);
				if(opt.numbering) {	_self._drawNumber(_htr,true);}
				_self._selectTypeHandle(null,true,_htr);						
				for(var x = 0; _head.length > x; x++) {
					var __th = $('<th id="' + _head[x].id + '">' + (_head[x].label ? _head[x].label :"" ) + '</th>').appendTo(_htr);
					if(_head[x].hcss) {__th.css(_head[x].hcss);}
					_head[x].hclasses && __th.addClass(_head[x].hclasses);
				} 
				
				var _dwrap = $('<div class="' + this.options.className +'-data-div" />').appendTo(ele)
					,_dtbl = $('<table class="' + this.options.className +'-data-table" border="0" cellpadding="0" cellspacing="0" />').appendTo(_dwrap);
				_iele.dtbl = _dtbl;
				_self._draw_colgroup(_iele.dtbl);
				_iele.databody = $('<tbody class="' + this.options.className +'-data" />').appendTo(_dtbl);
				$(ele).bind("epgridresize",function() {_self._resizeHandle();});
				this.options.offresize !== true && $(window).on("resize",function() {_self._delay.run(function(){_self._resizeHandle();},200);});					
				if(opt.selectType == "checkbox") {
					$("#checkall input",_iele.htbl).click(function(_e) {if($(this).is(":checked")) {_self.allChecked(true);	} else {_self.allChecked(false);	}});
				}
				_self.addData(typeof opt.dataset === "function" ? opt.dataset.call(this.element) : opt.dataset);
			}
			,_resizeHandle : function() {
				this.options.offresize !== true && $(this._Elements.htbl).css({width: this._Elements.dtbl.width()-1});
			}
			,_draw_colgroup : function(_par) {
				var _self = this
					, ele = _self.element
					,opt = this.options
					,_head = opt.headers
					,_cg = $('<colgroup />').appendTo(_par);
				if(opt.numbering){$('<col width="' + (typeof opt.numbering === "object" ? opt.numbering.width ? opt.numbering.width : "40px" : "40px")+ '" />').appendTo(_cg);}
				if(opt.selectType != "rowselect" && opt.selectType) {$('<col width="26px" />').appendTo(_cg);} 
				for (var x=0; opt.headers.length > x; x++) { 
					$('<col width="' + (_head[x].width ? _head[x].width : '*' ) + '" />').appendTo(_cg);
				}
			}
			,_drawNumber : function(head,isheader) {
				if(!this.options.numbering) {return;}
				var _tag = isheader === true ? "th" : "td"
					,_num = $('<' + _tag + ' id="num">' + (isheader === true ? "No." : "")+'</'+ _tag + '>').appendTo(head);
				if(isheader === true ) {return;}
				return;
			}
			,_refreshNumber : function() {
				var _self = this,opt = _self.options;if(!opt.numbering) {return;}
				var _nodes = _self.getAllNodes();	if(_nodes.size() == 0 ) {return;}
				var _len = _nodes.size(),_cnt = opt.reverse ? _len + 1 : 0;
				_nodes.each(function() {
					var $num = $("#num",this);_cnt = opt.reverse ? _cnt-1 : _cnt+1;
					if(typeof opt.numbering === "object") { 
						$num.text(_cnt == 1 ? opt.numbering.start ? opt.numbering.start : _cnt 
									: _cnt == _len ? opt.numbering.end ? opt.numbering.end : _cnt : _cnt);
					} else {$num.text(_cnt);}
				});
			}
			,_selectTypeHandle : function(data,isheader,par) {
				var _self = this, opt = this.options;
				var _html = "";
				//if(isheader !== true && data && (data.hidecheckbox||data.hideradio)) {return '<td width="26px"></td>';}
				switch(opt.selectType) {
				case "checkbox":
					_html = '<' + (isheader === true ? 'th' : 'td') + (isheader === true ? ' id="checkall" class="checkbox"' : ' class="checkbox"') 
						+ '><input type="checkbox" name="grid_check"'+ (data && data.hidecheckbox ? ' style="display:none"' : '') + '></' + (isheader === true ? 'th' : 'td') +'>';
					if(isheader === true) { $(_html).appendTo(par);} 
					break;
				case "radio":
					_html = '<' + (isheader === true ? 'th' : 'td') + ' width="26px">' 
						+ (isheader === true ? '' : '<input type="radio" name="grid_check"'+ (data && data.hideradio ? ' style="display:none"' : '') + '>')
						+ '</' + (isheader === true ? 'th' : 'td') +'>';
					if(isheader === true) { $(_html).appendTo(par);} 
					break;
				}
				return _html;
			}
			,_makeInputType : function(colset,data) {
				var _colset = colset, _inType = _colset.inputType, _data = data, _$ret = null;
				switch(_inType.type) {
				case "selectbox":
					_$ret = $('<select class="organ_item_select" />');
					$.each(_inType.itemset, function(idx,val) {_$ret.append('<option value="' + idx + '">' + val + '</option>');});
					_$ret.val( _data[_colset.id] ? _data[_colset.id] : _inType.def ? _inType.def : "");
					_data[_colset.id] = _$ret.val();
					_$ret.on("change", function(e) {
						e.stopPropagation();
						_data[_colset.id] = $(this).val();
					});
					break;
				}
				return _$ret;
			}
			,_makeDataColumn : function(ele,colset,data) {
				var _td = $('<td />')
					,_txt = (colset.inputType ? this._makeInputType(colset,data) : 
								colset.format ? $ep.util.patternCompletion(colset.format,data) : 
									colset.expression ? colset.expression.apply(this.element,[_td,colset,data]) : 
										(data[colset.id] ? data[colset.id] : ""))
					,_email_txt = data[colset.id];
					if(!_td.attr("title")){
						if(typeof _txt == "string")	_td.attr("title",_email_txt);
					}
					colset.id && _td.attr("id",colset.id);
					colset.classes && _td.addClass(colset.classes);
					_td.append(_txt).appendTo(ele);
				if(colset.css) { _td.css(colset.css);}
			}
			,_throwMessage : function() {
				var opt = this.options;
				if(opt.duplicate.message) {
					opt.duplicate.type && opt.duplicate.type == "alert" && alert(opt.duplicate.message);
					opt.duplicate.type && opt.duplicate.type == "toast" && $ep.util.toast(opt.duplicate.message,opt.duplicate.delay ? opt.duplicate.delay : 1000);
				}
			}
			,_addData : function(node) {				
				var _self = this, opt = this.options,_node = node;
				var _tr = $('<tr class="' + this.options.className +'-item" />');
				if(typeof opt.itemRender === "function") {
					var _r = opt.itemRender.call(_self.element, _node,_tr) ;
					if (_r === false) {return;};
					if(_r) {_node = _r;}
				}
				if(opt.isduplicate === true ) {
					if(_self.getDataByKey(_node[opt.keycode]).length > 0 ) { 
						_self._throwMessage();
						return;
					}
				}		 
				
				if(opt.reverse === true) {$(this._Elements.databody).prepend(_tr);}
					else {_tr.appendTo(this._Elements.databody);	}
				if(opt.numbering) {	_self._drawNumber(_tr);}				
				_tr.append(_self._selectTypeHandle(_node));
				_node.selected  == true && _tr.find("input:radio,input:checkbox").prop("checked",true) && (delete _node.selected); 
				if(_node.disabled === true) {	_tr.addClass(_self.options.className + "-disabled");}
				
				for (var i=0; opt.headers.length > i; i++) { _self._makeDataColumn(_tr,opt.headers[i],_node);}
				
				$(_tr).data("data",_node);
				if($(_tr).hasClass(_self.options.className + "-disabled")) { $("select,input",_tr).attr("disabled",true);};
				var _dbclick = false;
				function __select(_this,force) {
					switch(opt.selectType) {
						case "rowselect":
							if(force===true) {
								$(_this).addClass(_self.options.className + "-selected");	
							} else {
								$(_this).toggleClass(_self.options.className + "-selected");	
							}
							break;  
						case "checkbox":
							if(force===true) {$("input[name=grid_check]",_this).prop("checked",true);return;}
							if($("input[name=grid_check]",_this).prop("checked")) {
								$("input[name=grid_check]",_this).prop("checked",false);	
							} else {
								$("input[name=grid_check]",_this).prop("checked",true);
							}							
							break;
						case "radio":
							if(force===true) {$("input[name=grid_check]",_this).prop("checked",true);return;}
							if($("input[name=grid_check]",_this).prop("checked")) { 
								$("input[name=grid_check]",_this).prop("checked",false);	
							} else {
								$("input[name=grid_check]",_this).prop("checked",true);
							}									
							break;
					}
				}
				$(_tr).click(function(e) {
					var _e = e,_opt = opt,_this = this,__node = _node;
					if(!$(_e.target).parent().is("tr")) {_e.stopPropagation();return;}
					setTimeout(function() {
						if (_dbclick === true) {return;}
						if(!$(_this).hasClass(_self.options.className + "-item")) {return;}
						if($(_this).hasClass(_self.options.className + "-disabled")) {return;};
						_self._trigger("rowclick",_e,__node); 
						__select(_this);
					},200);
				}).dblclick(function(e) {
					_dbclick = true; 
					setTimeout(function() {_dbclick = false;},300);	 
					var _e = e,__node = _node,_this = this;
					if(!$(_e.target).parent().is("tr")) {_e.stopPropagation();_e.preventDefault(); return;} 
					if(!$(_this).hasClass(_self.options.className + "-item")) {return;}
					if($(_this).hasClass(_self.options.className + "-disabled")) {return;};
					__select(_this,true);
					_self._trigger("rowdblclick",_e,__node);  
											
				}); 						
				_self._refreshNumber();
				_self._fireResize(); 
				_self._trigger("afterItemRender",null,_tr);
			} 
			,_fireResize : function() {var _self = this;setTimeout(function() {_self._trigger("resize");},200); }
			,allChecked : function(flag) {
				if(flag === true) {$('.' + this.options.className +'-item:not(.' + this.options.className +'-disabled) input[name=grid_check]',this._Elements.databody).prop("checked",true);}
				else {$('.' + this.options.className +'-item:not(.' + this.options.className +'-disabled) input[name=grid_check]',this._Elements.databody).prop("checked",false);}
			}
			,addData : function(node) {
				var _self = this;
				if(!node) {return;}
				if($.isArray(node)) {$.each(node,function(idx,data){_self._addData(data);});
				} else  { this._addData(node);	}
				_self._trigger("afterAddData");
			}
			,getAllData : function() {
				var _dataNodes = this.getAllNodes()
					,_result = [];_dataNodes.each(function(idx,ele) {_result.push($(this).data("data"));});
				return this.options.reverse === true ? _result.reverse() : _result;
			} 
			,getSelectedData : function() {
				var _dataNodes = this.getSelectedNodes()
					,_result = [];_dataNodes.each(function(idx,ele) {_result.push($(this).data("data"));});
				return this.options.reverse === true ? _result.reverse() : _result;
			}
			,getDataByKey : function(keyVal) {
				if(!keyVal) {return [];}
				var _self = this,_result = [],_data = this.getAllData(); 
				if(_data.length == 0) {return _result;} 
				_result = $ep.Array(_data).filter( function(idx,data) {
					return data[_self.options.keycode] === keyVal;});					
				return _result;  
			}
			,removeAll : function() {
				var _result = this.getAllNodes(':not(.' + this.options.className +'-disabled)').remove();
				this._refreshNumber();
				this._fireResize();
				return _result;
			}
			,removeSelected : function() {
				var nodes = this.getSelectedNodes();
				if(nodes) {nodes.remove();}
				this._refreshNumber();
				this._fireResize();
			}
			,getSelectedNodes : function() {
				var _self = this,opt = _self.options, _dataBody = _self._Elements.databody
					,dataNodes =null;
				switch(opt.selectType) {
					case "checkbox":
						dataNodes = $('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody)
									.closest('.' + this.options.className +'-item');
						break;
					case "radio":
						dataNodes = $('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody)
						.closest('.' + this.options.className +'-item');
						break;
					default:
						dataNodes =$('.' + this.options.className +'-item.' + this.options.className +'-selected',_dataBody);
						break;
				}
				return dataNodes;						
			} 
			,getColumnById : function(id,tr) {
				var _tr = tr;
				if(!_tr) {_tr = this.getSelectedNodes();}
				if(_tr.size() == 0) {return [];}				
				return _tr.find('td[id='+id+']');				
			}
			,getAllColumnById : function(id) {	return this.getColumnById(id,this.getAllNodes());}
			,deSelectedAll : function() {
				var _self = this,opt = _self.options, _dataBody = _self._Elements.databody;
				switch(opt.selectType) {
				case "checkbox":
					$('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody).prop("checked",false);
					break;
				case "radio":
					$('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody).prop("checked",false);
					break;
				default:
					$('.' + this.options.className +'-item.' + this.options.className +'-selected',_dataBody).removeClass( this.options.className +'-selected');
					break;
				}
			}
			,getAllNodes : function(sel) {	var _nodes = $('.' + this.options.className +'-item',this._Elements.databody); return sel ? _nodes.filter(sel) : _nodes;}
			,selectedUp : function(node) {
				var _self = this, _node = node ? node : this.getSelectedNodes();
				var _resolv = null
					,_done = {done : function(callback) {_resolv = callback;}};
				_node.each(function() {
					var prev = $(this).prev();
					
					while(prev.hasClass(_self.options.className +'-disabled')) {
						prev = $(prev).prev();									
					}
					if(prev.size() == 0 ) {return _done;}
					$(this).effect("transfer",{
						to : prev,className : "ep-epgrid-transfer"
					},300, function() {
							$(this).insertBefore(prev);
							_self._refreshNumber();
							_resolv && _resolv.call(_self,this);							
					});					
				});
				return _done;
			}
			,selectedDown : function(node) {
				var _self = this, _node = node ? node : this.getSelectedNodes(),_len = _node.size();
				var _resolv = null
					,_done = {done : function(callback) {_resolv = callback;}};
				for(var x=_len-1;x >= 0; x--) {
					var after = $(_node.eq(x)).next();
					while(after.hasClass(_self.options.className +'-disabled')) {
						after = $(after).next();
					}
					if(after.size() == 0 ) {continue;}; 
					
					$(_node.eq(x)).effect("transfer",{
						to : after,className : "ep-epgrid-transfer"
					},300, function() {
						$(this).insertAfter(after);
						_self._refreshNumber();
						_resolv && _resolv.call(_self,this);	
					});
				}
				return _done;
			}
			
		}); 
	})();
	/*
	 * ep.epupload
	 */
	(function (factory) {
	    'use strict';
	    factory(window.jQuery);
	}(function ($) {
		'use strict';
		var  _fext = $.fileext = {
			"bmp" 	: "img"		,"jpg" 	: "img"		,"png" 	: "img"		,"psd" : "img"		,"gif" 	: "img"		,"tiff" : "img"		
			,"doc" 	: "doc"		,"docx"	: "doc"		
			,"ppt" 	: "ppt"		,"pptx"	: "ppt"
			,"xls" 	: "xls"		,"xlsx" : "xls"
			,"hwp" 	: "hwp"		,"pdf" 	: "pdf"
			,"exe" 	: "exe"		
			,"html" : "html"	,"htm" 	: "html"	,"txt" 	: "txt"		,"text" : "txt"		 
			,"zip" 	: "zip"		,"etc" 	: "etc"
			,"getExt" : function(name) {
				(/\.(\w+)$/g).test(name);
				var _ext = RegExp.$1.toLowerCase();
   	  		 	return this[_ext] || "etc"
			}
		};
		$.widget('ep.epupload', $.ep.epgrid,{
			widgetEventPrefix : "epgrid",
	        options: {
	        	draggable : false,
	        	hideheader : false,
	        	numbering : false,
	        	keycode : "name",
	        	//selectType : "rowselect",
	        	i18n : {
	        		filename : "Name",
	        		filesize : "Size",
	        		filestatus : "Status",
	        		Attached : "Attached",
	        		AttachmentFiles : "Attachment Files",
	        		AttachmentTooltip : "Please select if you have a file attachment.",
	        		Failed : "Failed",
	        		Completed : "Completed"
	        	},
	        	isduplicate : true
	        	,duplicate : {
	        		message : "파일명이 중복입니다."
	        		,type : "toast"
	        		,delay: 1000
	        	},	        	
	        	headers : null,
	        	/* dataset :  [
		           {name : "첨부파일1.txt",size : 324342},
	 	           {name : "첨부파일3.txt",size : 43253425432}, 
		           {name : "첨부파일4.txt",size : 2542}
		    	], */
		    	itemRender : function(data,tr) {
		    		if(!data.upload) {return;}
		    		data.upload.context = tr;
		    	},
				className : "ep-epgrid",
				url : "", //"/devaphqapp/ngw/core/temporarily.nsf/Upload?OpenForm"
				formData : {}
	        }
			,widgetName : "epgrid"
			,_setHeader : function(){
				var _i18n = this.options.i18n;
				var _header =  [
	        	  	{id : "name" , 		label : _i18n.filename, 	width : "*", hcss : {"textAlign" : "left","paddingLeft":"5px"}, css : {"padding" : "0 5px"},
	        	  	  expression : function(e,c,d) {
	        	  		 var ext = _fext.getExt(d.name);
	        	  		 return d.name ? $('<span class="file_icon ' + ext + '" /><span class="file_name">'+ (d.name || "")  +'</span>') : "";
	        	  	  }
	        	  	},
	        	  	{id : "size" , 		label : _i18n.filesize, 	width : "100px", css : {"text-align" : "center","padding":"0 5px"},
	        	  		expression : function(e,c,f){return f.size ? f.size.toSize() : "";}
	        	  	},
	        	  	{id : "progress" , 	label : _i18n.filestatus, 	width : "150px", css : {"text-align" : "center","padding":"0 5px"},
	        	  		expression : function(ele,col,data) {
	        	  			if(data.isnew !== true){return _i18n.Attached;}
	        	  			var _tag = '<div class="progress progress-success progress-striped active" ' 
				        		 + 'role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' 
				        		 + '<div class="bar" style="width:0%;"></div>' 
				        		 + '</div>';
				        	return $(_tag);
	        	  		}
	        	  	}
	        	  	,{id : "process", label : "", width : "25px", css : {"text-align":"center"},classes : "nostrike",
	        	  		expression : function(ele,col,data) {
	        	  			var _this = this
	        	  				,_data = data
	        	  				,_ele = ele
	        	  				,_html = $('<span class="ep-icobutton"><span class="ep-icon cancel" /></span>').on("click",function(){
	        	  					$(_this).epupload(_data.isnew ? "removeElement" : "strikeElement",_ele,_data); 
	        	  				});
	        	  			return _html;
	        	  		}
	        	  	}
	        	  	
	        	];
				this.options.headers = _header;
			}
			,_create : function(){
				!this.options.headers && this._setHeader();
				this._super("create");
				this.widget().addClass("ep-widget "+ this.widgetFullName);
				this._createUI();
				this._initUploader();
			}
			,_createUI : function() {
				$(this.element).wrapInner('<div class="epuploader-files" />');
				$(this.element).prepend('<div class="epuploader-header"><span class="epuploader-input"><span class="epuploader-button" id="attach"></span><input id="attach" type="file" name="%%File" multiple title="'+ this.options.i18n.AttachmentTooltip + '"></span></div>');
				$("#attach.epuploader-button",this.element).epbutton({text : this.options.i18n.AttachmentFiles});			
			}
			,_setOptions : function(options){
				$.extend(true,this.options,options);
				/*if(options.formData && options.formData.unique) {
					$(".epuploader-input",this.element).fileupload("option","formData.unique",options.formData.unique);
				}*/
			}
			,_initUploader : function() {
				var _self = this;
				$(".epuploader-input",_self.element).fileupload({
					add : function(e,data) {
						var _data = data;
						_self.addData({	upload : _data	,name : _data.files[0].name	,size : _data.files[0].size ,isnew : true});	
					}
					,dataType : "json"
					,progress : _self._onProgress
					,fail : function(e,data){_self._onFail(e,data);}
					,done : function(e,data){_self._onDone(e,data);}
					,formData : function(f) {
						var _formData = $.extend(true,{},_self.options.formData,{idx : this.files[0].idx}),_arr = [];
						$.each(_formData, function(_idx,_val) {_arr.push({name : _idx, value : _val});});
						return _arr;
					}/*_self.options.formData */
					,url : _self.options.url ? _self.options.url : "/Upload?OpenForm" 
				});
			}		
			,_onFail : function(e,data){
				var _this = this, _data = data;
				var _prog = _this.getColumnById("progress",data.context);
				_prog.html(this.options.i18n.Failed);
			}
			,_onDone : function(e,data) {
				var _this = this, _data = data;
				var _prog = _this.getColumnById("progress",data.context);
				_prog.html(this.options.i18n.Completed);
				
			}
			,_onProgress : function(e,data) {
	            if (data.context) {
	                var progress = Math.floor(data.loaded / data.total * 100);
	                data.context.find('.progress')
	                    .attr('aria-valuenow', progress)
	                    .find('.bar').css('width',progress + '%'); 
	            }
	        }
			,getAllStrike : function() {
				return this.getAllNodes().filter(".strike");
			}
			,getAllFileNodes : function() {
				return this.getAllNodes().filter(":not(.strike)");
			}
			,getAllFileNames : function() {
				var _dataNodes = this.getAllFileNodes()
					,_result = _dataNodes && 
						$ep.Array(_dataNodes).datafilter(function(_idx,val) {
							var _data = $(this).data("data");
							return _data ? _data.name ? _data.name : null : null;
						});  
				return _result;
			}
			,getDelFileName : function(){
				var _nodes = this.getAllStrike()
					,_result = [];
				$.each(_nodes,function() {_result.push($(this).data("data").name);});
				return _result;
			}
			,getDataByKey : function(keyVal) {
				if(!keyVal) {return [];}
				var _self = this,_nodes = _self.getAllFileNodes()
					,_data = $ep.Array(_nodes).datafilter(function() {
						var _= $(this).data("data");
						return 	typeof _[_self.options.keycode] === "string" ? _[_self.options.keycode].match(new RegExp("^[\\s]*"+keyVal + "[\\s]*$","gi")) ? _ : null : _[_self.options.keycode] === keyVal ? _: null;}); 
				if(!_data) {return [];}
				return _data;  
			}
			,submit : function(){
				var _tmp = this.options.keycode;
				this.options.keycode = "isnew";
				var _self = this, _idx = 0 ,	_data = this.getDataByKey(true),_promise = new $.Deferred();
				this.options.keycode = _tmp;
				var _delFiles = this.getDelFileName();
				$.when.apply(this,$ep.Array(_data).datafilter(function() {	this.upload.files[0]["idx"] = _idx;_idx++;	return this.upload.submit.apply(this.upload);}))
				.done(function(data) {
					var _result = null;					
					_self._trigger("completed",data,_delFiles);
					_result = $.isArray(data) ? data[0] : data;
					_promise.resolve(_result,_delFiles);
				})
				.fail(function() {
					_self._trigger("failed");	
					_promise.reject(""); 
				});
				return _promise.promise();
			}
			,strikeElement : function(ele) {
				var _self = this,_ele = ele
					,_tr = _ele.closest("tr.ep-epgrid-item");
				if(_tr.hasClass("strike")) {
					var _data = _tr.data("data");
					if(_self.getDataByKey(_data[_self.options.keycode]).length > 0) {
						_self._throwMessage();
						return;
					} 
				}
				_tr.toggleClass("strike");
			}
			,removeElement : function(ele){
				var _self = this,_ele = ele;
				_ele.closest("tr.ep-epgrid-item").fadeOut(150,function() {$(this).remove();_self._fireResize();});			
			}
		});
		
		
		$.widget('ep.xamupload', $.ep.epgrid,{
			widgetEventPrefix : "epgrid"
			,widgetName : "epgrid"
			,_create : function(){
				this._super("create");
				this.widget().addClass("ep-widget "+ this.widgetFullName);
				this.widget().removeClass("ep-epgrid");
				$(this.element).wrapInner('<div class="epuploader-files" id="xamuploader-files" />');
				this._initUploader();
			}
			,_getDateFormat : function () {
				var _self = this
				var _date = new Date();
				var yyyy = _date.getFullYear().toString();
				var MM = _self._getPad(_date.getMonth() + 1,2);
				var dd = _self._getPad(_date.getDate(), 2);
				var hh = _self._getPad(_date.getHours(), 2);
				var mm = _self._getPad(_date.getMinutes(), 2);
				var ss = _self._getPad(_date.getSeconds(), 2);
				return yyyy + MM + dd+ hh + mm + ss;
			}
			,_getPad : function (number, length) {
				var str = '' + number;
				while (str.length < length) {
					str = '0' + str;
				}
				return str;
			}
			,_getRandomChar : function() { 
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) +
								Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}				
			,_setOptions : function(options){
				var _self = this;
				$.extend(true,this.options,options);
			}		
			,_attachunid : ""
			,_attachunique : ""
			,_initUploader : function() {
				var _self = this, def = $.Deferred();
				
				_self._attachunid = ((_self.options.formData&&_self.options.formData.unid)?_self.options.formData.unid:_self._getDateFormat());
				_self._attachunique = ((_self.options.formData&&_self.options.formData.unique)?_self.options.formData.unique:_self._getRandomChar());
				
				var isEdit = (_self.options.mode === 'edit'?true:false);
				_self.am = new XAM({
					disp_id          : $(this.element).attr('id'),
					parent_ele       : this.element,
					config_url       : '/config/app_xam_config' + ($ep.lang() == 'ko' ? '' : '_eng') + '.xml?open',							
					isEdit			 : isEdit,
					save_path		 : _self.options.url ? _self.options.url : "/Upload?OpenForm",		
					serverzip_path   : _self.options.url.replace(/Upload/g, 'xam_zipdownload'),							
					attachunid       : _self._attachunid,
					attachunique     : _self._attachunique,	
					deleteCallback    : "read_v3",
					OnMoveBefore     : function(file, el, move_type) {
						if (isEdit) {
							if (file.status == 'complete') {
								// 기첨부된 파일은 이동이 안되도록 처리
								$(el).removeClass('click-on');
								return false;
							} else {
								// 기첨부된 파일은 위,아래로 이동이 안되도록 처리
								var dstEl = (move_type == 'up' ? $(el).prev() : $(el).next());
								var dstStat = dstEl.find('.upload-status');
								if (dstStat.hasClass('complete')) { 
									return false; 
								}
							}
						}
						return true;
					},
					OnRemoveBefore   : function(file, el) {
						/*
						if (isEdit && file.status == 'Complete') {
							if ($(el).hasClass('remove')) {
								// 대기열에 동일 파일명이 있는 경우 삭제 해제 안되도록 처리
								var file_list = _self.am.g.getFileList();
								var remove_avail = true;
								$.each(file_list, function(idx, _file) {
									if (_file.status == 'wait' && _file.name == file.name) {
										remove_avail = false;
										return false;
									}
								});
								if (remove_avail) {
									$(el).removeClass('remove');
								} else {
									alert(_self.am.g('MSG.INVALID_DUP_FILE'));
								}
							} else {
								$(el).addClass('remove');
							}
							return false;
						}
						return true;
						*/
					},
					OnError : function(e){ 
						def.reject();
					},
					OnInitCompleted  : function(id){
						var att_list = _self.options.dataset;
						var lists = [];
						if(att_list.length != 0){
							for(var i = 0; i < att_list.length; i++){
				                var attach = {
				                    type: (isEdit?'edit':'read'),
				                    name: att_list[i].name,
				                    origname: att_list[i].name,
				                    size: att_list[i].size,
				                    downloadpath: att_list[i].url
				                };
				                lists.push(attach);
							}
							_self.am.g.setFileList(lists, isEdit);
						}				
						def.resolve();
					}
				});

			}
			,getDelFileName : function(){
				var _nodes = this.am.g.getFileList();
				var _result = [];
				$.each(_nodes,function(idx, file) {
					if (file.status == 'remove') {
						_result.push(file.name);
					}					
				});
				return _result;				
			}
			,getAllFileNames : function(){
				var _nodes = this.am.g.getFileList();
				var _result = [];
				$.each(_nodes,function(idx, file) {
					if (file.status != 'remove') {
						_result.push(file.name);
					}					
				});
				return _result;				
			}
			,submit : function(){				
				var _tmp = this.options.keycode;
				this.options.keycode = "isnew";
				var _self = this,_promise = new $.Deferred();
				this.options.keycode = _tmp;
				var _delFiles = _self.getDelFileName();

				if (_self.am.g.getIESupport()) { // IE10 이하의 브라우저인 경우
					var ifr_doc = $('#' + _self.am.g.iframe_id)[0].contentWindow;
					var _result = {"id":ifr_doc._XAM.uploaderid, "unique":_self._attachunique, "unid":_self._attachunid};
					_promise.resolve(_result,_delFiles);
				} else {				
	                var _attach_form = $('#' + _self.am.g.iframe_id).contents().find('form');				

	                _attach_form.find('input[name="unid"]').val(_self._attachunid);
	                _attach_form.find('input[name="unique"]').val(_self._attachunique);
					
					$('#' + _self.am.g.iframe_id)[0].contentWindow.OnUploadComplete = function(files, _result) {   
	                	_promise.resolve(_result,_delFiles);
	                }	
					
					if (_self.am.g.upload()) {
					} else {
						_promise.resolve([], _delFiles);
					}
				}
				return _promise.promise();				
			}
		});
		
	}));
	
	
})();

/**
 *  2014.09.18
 *  - tony
 */
 (function($) {
	"use strict";
	var
		_ui_options = {
			frameset : {
				body : "ep_body"
				,content_navigator : "ep_content_navigator"
				,content_body : "ep_content_body"
			}			
		}
		,_log = $ep.log
		,_util = $ep.util 
		,_frameId = function(id) {
			if(id) {_ui_options.frameset.body = id;}
			return $("#"+_ui_options.frameset.body);
		}
		,_contentNaviId = function(id) {
			if(id) {_ui_options.frameset.content_navigator = id;}
			return $("#"+_ui_options.frameset.content_navigator,_frameId());
		}
		,_contentBodyId = function(id) {
			if(id) {_ui_options.frameset.content_body = id;}
			return $("#"+_ui_options.frameset.content_body);
		}
		,_validateList =  {
			text		: [/[^\s]+/g
			    		   ,"{$CORE.VALIDATE.TEXT}"],
		    date		: [/^(?:[0-9]{4})\-(?:0[1-9]|1[0-2])\-(?:0[1-9]|[1-2][0-9]|3[0-1])$|^(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:[1-9]|0[1-9]|[1-2][0-9]|3[0-1])\,\s(?:[0-9]{4})$)/g
		        		   ,"{$CORE.VALIDATE.DATE}"],
		    number 		: [/^[0-9]+$/g
		           		   ,"{$CORE.VALIDATE.NUMBER}"],
		    currency 	: [/^[\$\\\+\-]?\d+(?:(?:\,\d{3})?)+(?:\.\d+)?$/g
		             	   ,"{$CORE.VALIDATE.CURRENCY}"], 
		    email 		: [/((^([a-zA-Z0-9_\.\-\+])+\@(((([a-zA-Z0-9\-])+\.)+[a-zA-Z0-9]{2,4})|(\[([0-9]{1,3}\.){3}[0-9]{1,3}\])))|(^((\".*\")|((?!\")(.*)))\s*<([a-zA-Z0-9_\.\-\+])+\@(((([a-zA-Z0-9\-])+\.)+[a-zA-Z0-9]{2,4})|(\[([0-9]{1,3}\.){3}[0-9]{1,3}\]))>))$/g
		          		   ,"{$CORE.VALIDATE.EMAIL}"],
			radio		: [/[^\s]+/g,"{$CORE.VALIDATE.RADIO}"],
			checkbox	: [/[^\s]+/g,"{$CORE.VALIDATE.CHECKBOX}"]
		};

	
	var _ui = $ep.ui = {
		frameId : _frameId
		,activeNav : _contentNaviId 
		,active : _contentBodyId 
		,activeId : function() {return _ui_options.frameset.content_body;}
		,layout : null
		,initLNBLayout : function() {
			return this.layout = $(_frameId()).layout(
					{	
							enableCursorHotkey 				: false
						/*,	slidable						: false*/
						,	resizerDblClickToggle			: false
						,	resizable						: false
						,	resizerClass					: "ep-resizer"
						,	togglerClass					: "ep-toggler"
						,	fxSpeed_open					: 200
						,	fxSpeed_close					: 300
						,	triggerEventsDuringLiveResize 	: false
						,	onload_end : function(inst, state, options, name) {
							//$("#ep_content_navigator-toggler").unbind("click");
							//inst.bindButton('#ep_content_navigator-toggler','slide','west');
						}
						,	west__paneSelector				: "#ep_content_navigator"
						,	west__spacing_open				: 11
						,	west__spacing_closed			: 11
						,	west__togglerLength_open		: 24
						,	west__togglerLength_closed		: 24
						,	west__togglerAlign_open			: 10   //top
						,	west__togglerAlign_closed		: 10
						,	west__size						: 230						
						,	center__paneSelector			: "#ep_content_body"
						/*,	center__onresize_end			: function(pname,ele,state,opt,lname) {
							//_log("resize",arguments);
						}*/
						,	center__size					: 'auto'
					}
			);
		}
		,getValidator : function() {return _validateList;}
		,validator : function(valid) {
			if(!valid) {return [true,""];}
			if(!valid.element) {return [true,""];}
			var _ele = $(valid.element);
			var _msg = _util.patternCompletion("[&#91;{label}&#93;] {message}",valid).replace(/&#91;/g,"[").replace(/&#93;/g,"]");
			if(!_ele.size()) { return [true,_msg]; }
			if(!valid.validate) {return [true,_msg];}
			var _valid = function(__v) {
					var _value = "", _result = [true,_msg];
					if(!__v.target && __v.element.is("[eptype],select")) {__v.target = __v.element.closest(".ep-widget");} 
					if(__v.element.is("input:radio,input:checkbox")) {
						_value = "";
						if(__v.element.size() > 0) {__v.target = $(__v.element[0]).parent().parent();}
						$(__v.element).filter(":checked").each(function(){_value += (_value == "" ? $(this).val() : "," + $(this).val());});
					}
					else if(__v.element.is("input,select,textarea")) {_value = __v.element.val();}
					//else {return _result;	} 
					var _validate = __v.validate;
					_result[0] =  _validate instanceof RegExp ? new RegExp(_validate).test(_value) : typeof _validate == "function"  ? _validate.call(this,__v.element,_value) : !!_validate;
					return _result;				
				}
				,_r = _valid(valid)
				,_target = (valid.target ? valid.target : valid.element)
				,_validProc = function(__v) {var _t = (__v.target ? __v.target : __v.element);	_t.removeClass("invalid");(_t.is("[data-hasqtip]")) && _t.qtip("destroy",true);};
			if(_r[0] === false) {
				if(_target.hasClass("invalid")) {return _r;}
				_target.addClass("invalid");
				//if(_target.is('[data-hasqtip]')) {_target.removeData('qtip');}
				_target.qtip({overwrite : true,content : {text : valid.message},
					position : {at : 'top left',my : 'bottom left',	target : _target, adjust : { method: "shift flip" ,x : 2 ,y : 0,screen:true },viewport: true	}
					//,show : true
					,show: { delay : 300,/*ready:$(_target).is(":visible"),*/event: 'focus mouseenter'}
					//,hide : false
					,hide : {delay : 200,fixed:true,event : "unfocus mouseleave"}
					,style : {classes: 'qtip-shadow ep-validatetip'}
				}); 
				var _delay = _util.delay(),_event = {type : "",target : ""}
					,_handler = function(e) {
						var _ele = $(this),__valid = _ele.data("valid-data");
						_delay.run(function(){
							if(_valid(__valid)[0] == true) {
								_ele.off(_event.type,_handler);
								_validProc(__valid);
							}
						},200);
				};
				if(valid.target && valid.target.is(".ep-epinput.hasdatepicker")) {	_event = {type : "change keydown",target : valid.element};	}
				else if (valid.target && valid.target.is(".ep-epselect")) {	_event = {type : "selectmenuchange",	target : valid.element};}
				else if (valid.target && valid.target.is(".ep-epbutton")) {	_event = {type : "change",	target : valid.element};}
				else if (valid.element.is("input:checkbox,input:radio")) {_event = {type : "click",	target : valid.target};}
				else if (valid.element.is("input:text,input:password")) {	_event = {type : "keydown",	target : valid.element};}
				else {	valid.target && (_event.target = valid.target);	}; 
				_event.target.data({"valid-data": valid});				
				_event.target && _event.target.size() > 0 &&  _event.type && _event.target.on(_event.type,_handler);				
			} else {_validProc(valid);};
			return _r;
		}
		,setReferer : function(url) {
			//_log("setReferer",url);
			var _act = this.active();
			return _act.data("http_refere",url);
		}
		,getReferer : function() {
			var _url = this.active().data("http_refere");
			//_log("getReferer",_url);
			return _url;
		}
		,getPageHref : function(){
			return this.active().data("page_href");
		}
		,loadFrame : function(cont,navi,langpack,langprefix) {
			function _frame(js) {
				var _req = [$ep.ui.loadPageLang(_contentBodyId(),cont, js)];
				if(navi) {_req.push($ep.ui.loadPageLang(_contentNaviId(),navi,js));}
				$.when.apply(this,_req).done(function(content,nav) {$(_frameId()).trigger("frameloaded");});				
			};
			if(!cont) {return;}
			if(langpack) {$ep.loadLangPack(langpack).wait(function() {_frame($ep.inheritStatic(function _(){},langprefix));});}
			else {_frame();}
		}
		,loadFrameSet : function(comcode,appcode,id) {
			var _sel = $("#"+id);
			if(id) {_frameId(id);}
			_sel.addClass("ep-sub-content").parent().addClass("ep-sub-portal").closest(".containerWrapper").addClass("subWrap");
			
			$('<div id="ep_content_navigator"></div><div id="ep_content_body"></div>').appendTo(_sel);
			_sel.closest(".component-container").removeClass("myPageLayout").addClass("fullPageLayout");
			
			_ui.initLNBLayout();
			//var _uri = $.CURI(),
			//	_appcode = _uri.getParam("appcode") || "comm.prototype";
			
			return $ep.ui.loadApp(comcode,appcode,id);			
		}
		,loadApp : function(comcode,appcode,id) {
			var _self = this;
			if(id) {_frameId(id);} 
			if(!appcode) {return;} 
			return _util.getApp(appcode, comcode,function(data) {
				if(!data) {return;}
				_self.loadFrame(
						data.contentframe
						,data.leftframe
						,data.languagepack
						,data.langprefix
				) ;
			},{async : true});
		}
		,loadPageLang : function(selecotr,url,js,e) { /* content js가 이미 로딩되어 있을때 랭기지 처리 하면서 페이지를 로딩 */
			var _selector = $(selecotr);// || $ep.ui.active();
			var _js = js||(js === null ? undefined : $ep);
			function _replaceLang(data) {
				var _data = data
					,_reg = _data.match(/\<\!--WITH_LANG_PREFIX:([^>]*)?-->/gi);
				_reg && _reg.reverse() && $.each(_reg, function(idx,v) {
					v.match(/\<\!--WITH_LANG_PREFIX:([^>]*)?-->/gi);
					var _v = RegExp.$1;
					var _re = new RegExp('<\\!--WITH_LANG_PREFIX\\:'+_v+'-->([\\s\\S]*)?<!--\\/WITH_LANG_PREFIX\\:'+_v + '-->',"gi");
					_data = _data.replace(_re,function(m,p1,idx,raw){
						return $ep.inheritStatic(function _(){},_v).LangPatternString(p1);
					});
				});
				_data = _js.LangPatternString(_data);
				return _data;
			};
			return $ep.util.loadPage(_selector,url, {
				before : function(data,textStatus,xhr){
					var _dfd = new $.Deferred();
					var _langpack = [];
					var _html = data.replace(/<!--[^>]*\[LANGPACK\:([^\[\]]*?)\][^>]*?-->/gi,function(match,p1,index,raw) {
						_langpack = _langpack.concat(p1.split(","));
						return "";});
					$ep.loadLangPack(_langpack).wait(function() {
						var _data = undefined;
						e && e.before && (_data = e.before(_html,textStatus,xhr));
						if(!_js) {return _data;}
						//if(_js.LangPatternString) {_data = _js.LangPatternString(_data ? _data : _html,textStatus,xhr);}
						_data = _replaceLang(_data ? _data : _html);
						_dfd.resolve(_data);
						
					});
					return _dfd;
				}
				/*,after : function(ele,textStatus,xhr){
					var _ele = undefined;
					e && e.after && (_ele = e.after(_ele ? _ele : ele,textStatus,xhr));
					if(!_js) {return;}
					if(_js.LangConvert) {_ele =  _js.LangConvert(_ele ? _ele : ele,textStatus,xhr);}
					return _ele; 
				}*/
			});			
		}
		,loadPageLangPack : function(selector,url,langpack,langprefix){
			
			var $ele = $(selector),_dfd = new $.Deferred();
			if($ele.size() == 0) {return;}
			function _frame(js) {
				return $ep.ui.loadPageLang($ele,url, js );
			};
			if(langpack) {
				$ep.loadLangPack(langpack).wait(function() {					
					_frame($ep.inheritStatic(function _(){},langprefix))
					.done(function() {
						_dfd.resolveWith(this,arguments);
					});
				});
				return _dfd.promise();
			} else {
				return _frame();
			} 
		}
		/*  홈 > APPNAME > 페이지네임
		 * 	ele : element
		 * 	opt : {
		 * 		appcode : application code
		 * 		,page : page name
		 * 	}
		 */
		,drawBreadCrumb : function(ele,opt,jx) {
			var _$bcrumb = $(ele),_jx = jx || $ep;
			if(_$bcrumb.size() == 0 ) {return;}
			if(!opt || !opt.appcode) {return;}
			_$bcrumb.empty();
			_$bcrumb.addClass("ep-breadcrumb excludecopy");
			$('<span class="icon breadcrumb home"></span><span class="icon breadcrumb divider"></span>').appendTo(_$bcrumb);
			if(!opt.appcode) {return;}
			
			_util.getApp(opt.appcode,opt.companycode
				,function(app){
					if(!app) {return;}
					app.title && $('<span class="breadcrumb appname">' + _jx.LangPatternString(app.title) + '</span><span class="icon breadcrumb divider"></span>').appendTo(_$bcrumb); 
					opt.page && $('<span class="breadcrumb page last">' + _jx.LangPatternString(opt.page) + '</span>').appendTo(_$bcrumb);
				}
				,{async : true});
		}
		,dialog : function(opt,jx) {
			var _dlg_id = "ep-epdialog-" + Math.random().toString().substr(2,6) + "-" + $(".ep-epdialog").size()
				,_dialog = $('<div id="'+ _dlg_id + '"></div>').appendTo("body");
			if(opt) {opt["dialogid"] = _dlg_id;}
			if(jx) {
				if(!opt.lang) {opt.lang = {};}
				opt.lang.script = jx;
			}
			return $(_dialog).epdialog(opt);
		}
		,setUserInfo : function(selector,info,server,photo,disptype) {
			var _ele = $(selector);
			
			_ele.addClass("userinfo");
			
			this.makeUserInfo(_ele,info,server,photo,disptype);
			/*
			$(_ele).html(_html).find(".ep-photo img").one("error", function(){
				$(this).attr("src",(server ? "/"+server : "" ) +'/photo/no_profile');
			});*/
		}
		,initFieldSet : function(selector,script,server) {
			var _self = this,_element = selector && $(selector)
				,_script = script ? (script.script || script) : undefined;
			$("select",_element).each(function() {
				$ep.ui.select($(this),{},_script);
			});
			$("[eptype]",_element).each(function() {
				var _ele = $(this) ,_type = _ele.attr("eptype");
				switch (_type) {
					case "datetime":setTimeout(function() {_self.fieldSetDateTime(_ele,_element);return;},0);break;
					case "datepicker":setTimeout(function() {_self.fieldSetDateTime(_ele,_element);return;},0);break;
					case "userinfo":setTimeout(function() {_self.fieldSetUserInfo(_ele,server);return;},0);break;
				}
				return;
							
			});
		}
		,fieldSetDateTime : function(ele,selector){
			var _element = selector && $(selector),_ele = ele;
			if($(_ele).is("input")) {
				var __opt = {
					icon : "datepicker"
					,datepicker : {
						beforeDisableDate : function() {
							var _val = $("input[name="+$(_ele).attr("fromdate")+"]",_element).val();
							return _val ? _val.is8601Date() ? _val.isoToDate() : new Date(_val) : undefined;}
						,afterDisableDate : function(){
							var _val = $("input[name="+$(_ele).attr("todate")+"]",_element).val();
							return _val ? _val.is8601Date() ? _val.isoToDate() : new Date(_val) : undefined;
						}						
					}
					,icoClick : function(e,ele) {
						$(ele).datepicker("show");
					} 
				};
				if($("input[name="+$(_ele).attr("fromdate")+"]",_element).size() == 0 &&
						$("input[name="+$(_ele).attr("todate")+"]",_element).size() == 0) {
					delete __opt.datepicker.beforeDisableDate;
					delete __opt.datepicker.afterDisableDate;
				}
				var _format = $(_ele).attr("dateFormat");
				_format && (__opt.datepicker["dateFormat"] = _format);
				($(_ele).attr("changeyear") == "true") && (__opt.datepicker["changeYear"] = true);
				($(_ele).attr("changemonth") == "true") && (__opt.datepicker["changeMonth"] = true);
				_ui.input($(_ele),__opt);
			} else if ($(_ele).has("input").size() > 0 ) {
				
			
			} else {
				var _val = $(_ele).is("[epdata]") ? $(_ele).attr("epdata") :  $(_ele).text()
					,_date = _val.isoToDate(_val);
				if(!_date) {return;}
				var _format = $(_ele).is("[format]") ? $(_ele).attr("format") : "fullDateTime";
				$(_ele).html((new Date(_date)).format(_format));				
			}
			return;
			
		}
		,fieldSetUserInfo : function(ele,server) {
			var _self = this
				,_val = $(ele).is("[epdata]") ? $(ele).attr("epdata") : $(ele).text()
				,_userinfo = $(ele).attr("userinfo");
			_self.setUserInfo($(ele),_val,server,$(ele).is("[hasphoto]"),_userinfo);
			return;
		}
		
		,makeUserInfo : function(ele,info,server,hasPhoto,/*tooltip,sep*/ type,sep) {
			/* ele - element
			 * info - 구조체
			 * server - 대표서버
			 * hasphoto - 사진 표시
			 * type - 사용자 정보 표시 형태
			 * sep - 구분자  
			 * */
			if(!info) {return "";}
			if(!ele) {return "";}
			if($(ele).size() == 0) {return;}
			var _sep = sep || ", "
				,_issep = false;
			$(ele).empty();
			var _obj = typeof info === "string" ? _util.stringToObject(info,$ep._CONST.ORG_PERSON_MASK,undefined,$ep._CONST.SEPERATE.record) : $.isArray(info) ? info : [info]
				,_server = server 
				,_tooltip = /*tooltip ? tooltip : */  "min"
				,_type = type ? type : "default";
			$.each(_obj,function(idx,o) {
				var _html = "", _o = o;
				_html += '<SPAN class="ep-name">';
				if(hasPhoto) {
					_html += '<span class="ep-photo">';
					_html += '<span class="thum_border"></span><img src="' + '/photo/' + (o.email ? encodeURI(o.email) : encodeURI(o.notesid.replace(/\//g,","))) +'">';
					_html += '</span>'; 
				}
				var _pf = $ep._CONST.ORG_DISPLAY_MASK[_type] || $ep._CONST.ORG_DISPLAY_MASK["default"],_p = _pf(o);
				_html += ('<span class="ep-nameinfo">'+_util.patternCompletion(_p,o)+'</span>') + '</SPAN>';
				if(_issep) {_html = '<SPAN>'+_sep + '</SPAN>' + _html;}
				var _ele = $(_html).appendTo(ele);
				_issep = true;
				if(hasPhoto === true) {	$(".ep-photo img",_ele).one("error", function(){$(this).attr("src",'/photo/no_profile');});	}
				var _$content = null;
				var _tipOpt = /*$.extend(*/{ 
					overwrite : true,
					content : {
						text : function(e,api) {
							if (_$content) {api.set("content.text",_$content);return _$content;}
							$(api.elements.content).html('<span class="ep-loading">' + $ep.LangPatternString("{TEXT.LOADING}") + '</span>');
							var _id = $(api.elements.tooltip).attr("id"),_def = new $.Deferred();
							_ui.loadPageLang(undefined,$ep._CONST.PATH.ORG + "/user_by_notesid_profile_min/" + (o.notesid ? encodeURI(o.notesid) : o.email ? encodeURI(o.email) : "") + "?opendocument",undefined,{
								 before : function(html) {return _id ? html.replace(/({\$layerid\$})/g,_id) : html;}
							 }) 
							 .done(function(html){ 
								 var _html = html;
								 if(_html == "error") { _html = '<div class="ep-epnamecard profile_min">' + $ep.LangString("ERROR.PROFILE_ERROR") + '</div>'; }
								 _$content = _html;_def.resolve(_$content);								 
							 });
							return _def.promise();							 
						}					
					},
					position : {
						at : 'bottom left',my : 'top left',
						target : $(".ep-nameinfo",_ele),
						adjust : { method: "shift flip" ,x : 12 ,y : 0,screen:true }, 
						viewport: true
						
					}
					,show: {
						delay : 100, 
						/*solo : true, */
						/*ready : true,*/
						target : $(".ep-nameinfo,.ep-photo",_ele)
						,event: 'click'
						/*,effect : function() {$(this).slideDown("fast");}*/
					} 
					,hide : {
						delay : 600,
						target : $(".ep-nameinfo",_ele),
						fixed:true, 
						event : "unfocus mouseleave"/*  */,effect : function() {$(this).slideUp("fast");}
					}
					,style : { 
						classes: 'qtip-shadow qtip-rounded ep-usertooltip',width : "350px" /*,height : "335px"*/
						,tip : { classes : "ui-icon ui-icon-closethick ", corner: true ,width : 12 ,height : 12 ,offset : 10	}
					}
				};				
				$(".ep-nameinfo",_ele).qtip(_tipOpt).on("remove", function() {$(this).qtip("destroy",true);});
			
			});
			
			return ele;
		}
		,userDetail : function(_id,server,opt) {
			//_log((server ? "/" + server : "" ) + $ep._CONST.PATH.ORG + "/user_by_notesid_profile/" + encodeURI(_id) /* encodeURIComponent(_id)*/ + "?opendocument");
			return this.dialog($.extend({
				width : 500
				,resize : "auto"
				,title : "{$CORE.TEXT.PROFILETITLE}"
				,position : {my : "center bottom", at : "center center", of : $("body")}
				,content : {
					url :$ep._CONST.PATH.ORG + "/user_by_notesid_profile/" + encodeURI(_id) /* encodeURIComponent(_id)*/ + "?opendocument"
				}
				
			},opt));
		}
		,isShowOrg : null
		,chkOrgPopup : function(){
			/*
			 * 조직도 팝업 아이콘 권한 처리
			 */
			if (location.href.indexOf('/mail/')>-1) return; //메일시스템에서 호출된 경우 수행하지 않음   


			
			var _url = "/ngw/core/lib.nsf/chkOrgPopup?openagent";
			_util.ajax({
				url:_url
				,type:"get"
				,async:false
				,success:function(data,txtstatus,xhr) {
					var _data = eval(data);
					_ui.isShowOrg = _data.ShowOrg;
				}
			});
		}
		/*,organgrid : function(element,server,opt) {
			var _ele = $(element);
			
			
		}*/
	};
	//조직도 팝업 아이콘 권한 체크 호출
	_ui.chkOrgPopup();
	
	function _super() {
		this._create = function(ele) {
			var _self = this;
			if(!ele) {return;}
			this.element = $(ele);
			this.element.data(this.moduleName,this);			
			$(this.element).on("remove", function(){
				$(this).off("remove");
				_self.destroy();				
			});
			$(this.element).on(this.moduleName + ".method", function(e,method) {
				return _self.isMethod(method) ? _self[method].apply(_self,Array.prototype.slice.call(arguments,2)) : undefined; 
			});	
			$(this.element).on("ep.method", function(e,method){
				return _self.isMethod(method) ? _self[method].apply(_self,Array.prototype.slice.call(arguments,2)) : undefined;
			});
		};
		this.getInstance = function(){return this;};
		this.isMethod = function(method) {	return $.isFunction(this[method]);};
		this.destroy = function() {
			$(this.element).removeData(this.moduleName);
			$(this.element).empty()
				.off("remove")
				.off(this.moduleName + ".method")
				.off("ep.method");
			this.element = null;
			//_log("super."+this.moduleName,"destroy");
		};
		this.setOptions = function(opts) {
			$.extend(true,this.options,opts);return this;};
		this.trigger = function(e) {
			var _self = this
				,_prefix = _self.moduleName
				,_callback = _self.options.events ? _self.options.events[e] : _self.options[e] ? _self.options[e] : null
				,data = Array.prototype.slice.call(arguments,1)
				,ev = $.Event();
			ev.type = (_prefix+"."+e).toLowerCase();
			ev.target = _self.element;
			$(_self.element).trigger(ev,data);
			return $.isFunction(_callback) ? _callback.apply(_self,data) : undefined;
		};
		this.isTrigger = function(e) {
			if(!this.options) {return false;}
			return this.options.events ? $.isFunction(this.options.events[e]) : $.isFunction(this.options[e]) ? true : false;
		};
	};
	function _inheritSuper(ele,constructor,prototype) {
		var _superInstance = new _super() 
			,_superConstructor = function(){};
			_superConstructor.prototype = {
				"_super" : function(method) {
					return $.isFunction(_superInstance[method]) && _superInstance[method].apply(this,Array.prototype.slice.call(arguments,1))
				}
			};
		$.extend(_superConstructor.prototype,_superInstance,prototype);
		var _instance = new _superConstructor();
		_instance._create(ele);
		_instance.create && _instance.create.apply(_instance);
		return _instance;
	};
	/*
	 *  sideMenu
	 */
	var _sidemenu = {
		_eventListener : function(widget,evt,e,ele,o) { 
			switch(evt) {
				case "click":
					var _href = $(ele).attr("href") || (o && o.href) || "";
					_href && _sidemenu._loadPage.apply(this,[_href]);
					break;
			} 
			return o && o[evt] && o[evt].apply(this,Array.prototype.slice.call(arguments,2));
		}
		,_loadPage : function(href) {
			return _ui.loadPageLang($ep.ui.active(),href,this.script);
		}
	};	
	$ep.ui.sidemenu = function(sel,options,jx) {
		var _$sel = sel instanceof jQuery ? $(sel) : $(sel, $ep.ui.activeNav());
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.sidemenu.method.moduleName)) {return _$sel.data($ep.ui.sidemenu.method.moduleName);}
		var _method = $.extend({},$ep.ui.sidemenu.method);
		_method.script = jx;
		_method.options = options;
		return _inheritSuper(_$sel,$ep.ui.sidemenu,_method);
	}; 
	$ep.ui.sidemenu.method = $ep.ui.sidemenu.prototype = {
		moduleName : "ep.ui.sidemenu"
		,create : function() {
			var _self = this;
			_self.script && _self.script.LangConvertObject(_self.options,"title,text"); 
			_self.options.eventListener = function() {_sidemenu._eventListener.apply(_self,[this].concat(Array.prototype.slice.call(arguments)));};
			 $(this.element).epSideMenu(this.options);
		}
		,widget : function() {	return $(this.element).epSideMenu ? $(this.element).epSideMenu.apply(this.element,arguments) : undefined;	}
		,destroy : function() {
			this.widget("destroy");
			this._super("destroy");
			//_log(this.moduleName,"destroy"); 
		}
	};


	/*
	 *  ep.ui.button
	 * 	 options 
	 * 		- button : String 버튼 스트링 구분자 ","
	 * 		- action : Object
	 * 			- [btnid] : Object
	 * 				- text : String
	 * 				- bindchild : String (자식 버튼을 바인딩)
	 * 				- children : Object (하위 자식 버튼 설정)
	 * 				- click	:
	 * 				- lockclick :
	 * 			- [btnid....]	
	 * 
	 */
	$ep.ui.button = function(sel,options,jx,hook) {
		var _$sel = $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.button.method.moduleName)) {return _$sel.data($ep.ui.button.method.moduleName);}
		var _inst = _inheritSuper(_$sel,$ep.ui.button,$ep.ui.button.method);
		_inst.script = jx;
		_inst.hook = hook;
		_inst.options = options;
		_inst.script&&_inst.script.LangConvertObject(_inst.options.action,"text");
		_inst.init();
		return _inst;
	};
	$ep.ui.button.method = $ep.ui.button.prototype = {
		moduleName : "ep.ui.button"
		,init : function() {
			var _self = this;
			_self.element.empty();
			_self.options.classes && $(_self.element).addClass(_self.options.classes);
			_self.options.action && $.each(_self.options.action, function(idx,val) {
				$.extend(val, {id :  idx
					,defshow : false
					,hook : _self.hook ? _self.hook : {
						click : function(e,ids,btn) {return btn.click ? btn.click.apply(_self,[e,ids,btn]) : undefined;	}
						,lockclick : function(e,ids,btn,unlock) {return btn.lockclick.apply(_self,arguments);}						
					}
				}); 
				$('<span id="'+idx+'"></span>').appendTo(_self.element).epbutton(val);
			});
			_self.options.button && _self.showbuttons(_self.options.button);
			$(".ep-epbutton.show",_self.element).first().addClass("first");
			_self.element.disableSelection();
		}
		,showbuttons : function(btns){
			if(!btns) {return;}
			$(".ep-epbutton",this.element).trigger("showbutton",[btns.split(",")]);
			$(".ep-epbutton.first",this.element).removeClass("first");
			$(".ep-epbutton.show",this.element).first().addClass("first");
		}
		,hidebuttons : function(btns){
			if(!btns) {return;}
			$(".ep-epbutton",this.element).trigger("hidebutton",[btns.split(",")]);
			$(".ep-epbutton.first",this.element).removeClass("first");
			$(".ep-epbutton.show",this.element).first().addClass("first"); 
		}
		,destroy : function(){
			$("button.ep-epbutton",this.element).each(function(idx,ele) {$(this).epbutton("destroy");	});
			this.options.classes && $(this.element).removeClass(this.options.classes); 
			this._super("destroy");
			this.script = null;
			this.hook = null;
			this.options = null;			
			//_log(this.moduleName,"destroy");			
		}
	};

	/*
	 * ui.select 
	 * 	options
	 * 		- items : [{id : "", text : "", data : {} }], {a : "dddd", b : "dddd"}, function() {return {};}
	 * 		- name :
	 * 		
	 * 
	 */
	$ep.ui.select = function(sel,options) {
		var _$sel = $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.select.method.moduleName)) {return _$sel.data($ep.ui.select.method.moduleName);}
		var _method = $.extend({},$ep.ui.select.method);
		_method.options = $.extend(true, {
			items : []
			,hide : null
			,name : ""
		}, options);
		return _inheritSuper(_$sel,$ep.ui.select,_method);
	};	
	$ep.ui.select.method = $ep.ui.select.prototype = {
		moduleName : "ep.ui.select"
		,create : function() {
			var _self = this;
			this.elements = {
				wrap : null
				,select : null 
			};
			this.elements.wrap = ($(this.element).is("select") ? $(this.element).wrap("<span></span>").parent() : this.element)
									.addClass("ep-widget ep-epselect");
			this.elements.select = $(this.element).is("select") ? $(this.element) : $(this.element).has("select").size() > 0 ? $("select",this.element) :  this._createSelect();
			
			if(this.options.hide === null && this.elements.select.css('display') == "none") {this.options.hide = true;}
			/*if(!this.options.width && /width[\s]*\:[\s]*([\d]+\%)/g.test(this.elements.select.attr("style"))) {
				this.elements.wrap.css("width",RegExp.$1);
				this.options.width = RegExp.$1;
			}*/
			this.options.hide === true && this.elements.wrap.hide(); 
			var _change = this.options.change
				,_select = this.options.select
				,_keep = null;
			$(this.elements.select).selectmenu($.extend(this.options,{
				change : function(e,ui) {
					_self.trigger("selectchange",e,ui);
					_change && _change.call(this,e,ui);
					
				}
				,select : function(e,ui){
					if(_self.elements.wrap.parent().hasClass("ep-epinput")) {_ui.input(_self.elements.wrap.parent().focus()).focus();}
					_self.trigger("selectitem",e,ui);
					_select && _select.call(this,e,ui);
				}
				,open : function(e,ui) {
					var _ui = $(this).closest(".ui-front");
					_ui.size() > 0 && $(this).selectmenu("menuWidget").parent().zIndex(_ui.css("z-index"));
					if(!_util.browser.msie) {return;}
					_keep && _keep.clear() && (_keep = null);
					_keep = _util.keepObject();
					_keep.hide();
				}
				,close : function() {_keep && _keep.show();}
				,appendTo : "body"
			}));
		}
		,_createSelect : function() {
			var _select = $('<select '+ (this.options.name ? 'name="' + this.options.name + '"' : '') +  '>').appendTo(this.elements.wrap);
			this.elements.select = _select;
			this._createItem(_select);
			return _select;
		}
		,_createItem : function() {
			var _ele = this.elements.select;
			if(!this.options.items){return;}
			this.addItems(this.options.items);
			return;
		}
		,_addItem : function(item) { 
			var _v = item
				,_ele = this.elements.select
				,_idx = $.isPlainObject(_v) ? _v.id : ""
				,_val = $.isPlainObject(_v) ? _v.text : _v
				,_selected = $.isPlainObject(_v) ? _v.selected : undefined ;
			var _$i = $('<option ' + (_idx ? ('value="' + _idx + '" ') : "" ) + '' + '></option>').appendTo(_ele)
				.append(_val)
				.data("ui.select.data",_v);
			_selected === true && _$i.prop("selected",true);
		}
		,addItems : function(items) {
			var _self = this, _items = items;
			if(!_items) {return;}
			if($.isArray(_items)) {
				$.each(_items, function(idx,v) {_self._addItem(v);});
			} else if($.isPlainObject(_items)) {
				if(_items.text) {_self._addItem(_items);_self.refresh();return;}
				$.each(_items, function(idx,v) {
					typeof v === "string" && _self._addItem({id : idx, text : v});
				});
			} else if($.isFunction(_items)) {
				var _result = _items.call(_self, function(_d) {_self.addItems(_d);});
				if(_result) {
					_self.addItems(_result);
				}
			} else {
				_self._addItem(_items);
			}
			_self.refresh();
		}
		,hide : function(){this.elements.wrap.hide();}
		,show : function() {this.elements.wrap.show();}
		,refresh : function() {
			var _ele = $(this.elements.select); 
			_ele.data("uiSelectmenu") && _ele.selectmenu("refresh");
		}
		,getSelectedValue : function(){
			return $(this.elements.select).val();
		}
		,getSelectedData : function(){
			var _ele =  $("option:selected",this.elements.select)
				,_d =_ele.data("ui.select.data");
			if(!_d) {_d = {id : _ele.val(), text : _ele.text()};}
			return _d;
		}
		,setSelected : function(v) {
			$(this.elements.select).val(v);
			$(this.elements.select).selectmenu("refresh");
		}
		,disable : function() {
			$(this.elements.wrap).addClass("disable");
			$(this.elements.select).selectmenu("disable",true);
		}
		,enable : function(){
			$(this.elements.wrap).removeClass("disable");
			$(this.elements.select).selectmenu("enable");
		}
		,setSelectedIndex : function(idx) {
			$("option",this.elements.select).eq(idx).prop('selected',true);
			$(this.elements.select).selectmenu("refresh");
		}
		,destroy : function(){
			$(this.elements.select).selectmenu("destroy");
			this._super("destroy");	 
		}
	};
	
	/*
	 * ui.input 
	 *  options
	 *  	icon : "search"
	 *  	,select : {
	 *  		items : []
	 *  	}
	 *  	,name : 
	 *  	,width :
	 *  	,classes : 
	 *  	,accesskey:
	 *  	,title :
	 *  	,placeholder :
	 *  	,icoClick
	 *  	,event
	 *  	,eventHandler
	 *  	,complete :
	 */
	$ep.ui.input = function(sel,options,jx) {
		var _$sel = $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.input.method.moduleName)) {return _$sel.data($ep.ui.input.method.moduleName);}
		var _method = $.extend({},$ep.ui.input.method);
		_method.script = jx || $ep; 
		_method.options = $.extend(true, {},options);
		_method.options.select && jx && jx.LangConvertObject(_method.options.select);
		return _inheritSuper(_$sel,$ep.ui.input,_method);
	};
	$ep.ui.input.method = $ep.ui.input.prototype = {
		moduleName : "ep.ui.input"
		,create : function() {
			var _self = this;
			/* 번역 */
			_self.script.LangConvertObject(this.options,"accesskey,title,placeholder,text");
			
			_self.elements = {
				wrap : null
				,input : null
				,inputwrap : null
				,select : null
				,icon : null
			};
			_self.api = {};
			_self.elements.wrap = ($(_self.element).is("input") ? $(_self.element).wrap("<span></span>").parent() : _self.element)
									.addClass("ep-widget ep-epinput");
			_self.options.classes && _self.elements.wrap.addClass(_self.options.classes); 
			_self.elements.input = ($(_self.element).is("input") ? $(_self.element)  
						 				: $(this.element).has("input").size() > 0 ? $("input:text",_self.element) 
						 				: ($('<input ' + (_self.options.name ? 'name="' + _self.options.name + '"' : '') + '>')
						 						.appendTo(_self.elements.wrap)))
						 						.prop("type","text")
						 						.addClass("box-size");
			_self.elements.input.size() > 0 && (_self.elements.inputwrap = _self.elements.input.wrap('<span class="ep-inputwrap box-size"></span>').parent());
			_self.options.title && $(_self.elements.input).prop("title",_self.options.title);
			_self.options.accesskey && $(this.elements.input).prop("accesskey",_self.options.accesskey);
			_self.options.placeholder && $(this.elements.input).prop("placeholder",_self.options.placeholder);
			
			if(_self.options.organ) { _self._initOrgan();} /* */
			
			_self.options.event && _self.options.eventHandler && $(_self.elements.input)
				.on(_self.options.event, function(e) {
					_self.options.eventHandler && _self.options.eventHandler.apply(_self,[e,_self.element]); 
				}); 
					
			
			if (_self.options.select) {_self._initselect();} 
			if(_self.options.icon) {
				if(_self.options.organ){
					if (_ui.isShowOrg == null){
						_ui.chkOrgPopup();				
					}
					if (_ui.isShowOrg == "T"){
						_self.elements.icon = $('<span></span>').appendTo(_self.elements.wrap).addClass("ep-icon ep-input-icon" + _self.options.icon);
						_self.element.addClass("hasicon");
						$(_self.elements.icon).on("click", function(e) {
							if($(_self.elements.input).is(":disabled")) {e.preventDefault();return;}
							_self.options.icoClick && _self.options.icoClick.apply(_self,[e,_self.element]);
							_self.trigger("iconclick",e,self.element);
						}); 					
					}				
				}else{
					_self.elements.icon = $('<span></span>').appendTo(_self.elements.wrap).addClass("ep-icon ep-input-icon" + _self.options.icon);
					_self.element.addClass("hasicon");
					$(_self.elements.icon).on("click", function(e) {
						if($(_self.elements.input).is(":disabled")) {e.preventDefault();return;}
						_self.options.icoClick && _self.options.icoClick.apply(_self,[e,_self.element]);
						_self.trigger("iconclick",e,self.element);
					}); 						
				}
			} 
			if(_self.options.datepicker) { _self._initDatepicker();}			
			if(_self.options.width) {
				var _wid = _self.options.width;
				if(/\%$/g.test(_wid)) {
					this.elements.wrap.css("width",_wid);
					_self.elements.inputwrap.css({width : "100%",position: "absolute",left : "0px",paddingLeft : _self.elements.select && _self.elements.select.width()	});
				} else {
					_self.elements.input.css("width" , _self.options.width);
				}				
			}
			_self.trigger("complete");
		}
		,_initOrgan : function(){
			var _self = this,_opt = _self.options, _orgopt = $.extend(true,{},_opt.organ)
			,_organ = null,/*_result = _opt.organresult,*/_type = _orgopt.type;
			if(!_type ) {return;}
			delete _orgopt.type;
			_self.api.organ  = _ui.organ({},_self.script);
			var _iconclick = _self.options.icoClick;
			_self.options.icoClick = function(e,ele) {	
				if($(_self.elements.input).is(":disabled")) {e.preventDefault();return;}
				if(_iconclick) {if(_iconclick.apply(_self,[e,ele]) === false) {return;}} 
				_self._bindOrgan(_type,_orgopt,function(data){_self.trigger("organresult",data,_self.api.organ);});
			};			
			
			_self.options.event = "keydown";
			var _eventHandler = _self.options.eventHandler;			
			_self.options.eventHandler = function(e,ele) {
				if(e.keyCode != 13) {return;}				
				e.preventDefault();
				var _v = $(ele).val(),_continue = true;
				_v = _v.replace(/\$|\"|\'|[|]|\?|\*/g,"");
				_v = _v.ltrim().rtrim().replace(/\s*\,\s*/g,",");
				if(!_v) {return ;}
				var __v = $.unique(_v.split(","));
				$.each(__v, function(idx,_) {
					if (!/[A-Za-z\s]{2,}|[^A-Za-z\s]{2,}/g.test(_)) {
						$ep.util.toast($ep.LangString("$CORE.ORGAN.TEXT.QUERYLIMIT"));
						_continue = false;
						return false;
					}	
				});
				if(!_continue) {return;}
				if(_eventHandler) {if(_eventHandler.call(_self,e,ele) === false) {return;}}
				_self.api.organ.searchSelect(_type,__v,_orgopt,function(data){_self.trigger("organresult",data,_self.api.organ);});
			};
		}
		,_bindOrgan : function(type,orgopt,callback){
			var _self = this,_call = null,_organ = _self.api.organ;
			switch(type) {
			case "single" :	_call = _organ.singleSelect;break;
			case "multiple": _call = _organ.multipleSelect;break;
			}
			_call && _call.apply(_organ,[orgopt,callback]);			
		}
		,_initselect : function(){
			var _self = this;
			_self.elements.select = $('<span></span>').prependTo(_self.elements.wrap);
			_self.api.select = $ep.ui.select(_self.elements.select, _self.options.select);
		}
		,_initDatepicker : function() {
			var _self = this;
			
			$(_self.elements.wrap).addClass("hasdatepicker");	
			var _beforeDay = _self.options.datepicker.beforeShowDay;
			var _keep = null;
			function _beforeShowDay(d) {
				var _result = [true,"",""];
				if(_beforeDay) {$.extend(_result , _beforeDay.call(this,d));};
				if(_self.options.datepicker.beforeDisableDate) {
					var _d = _self.options.datepicker.beforeDisableDate();
					if(_d && _d.setHours(0,0,0,0) > d.setHours(0,0,0,0)) {$.extend(_result , [false]);	}	
				}
				if (_self.options.datepicker.afterDisableDate) {
					var _d = _self.options.datepicker.afterDisableDate();
					if( _d && _d.setHours(0,0,0,0) < d.setHours(0,0,0,0)) {$.extend(_result , [false]);}								
				}
				_result[1] = ((_result[1] ? _result[1] + " " : "" ) + (d.getDay() == 0 ? "sunday" : d.getDay() == 6 ? "saturday" : "day")).trim();
				return _result;
			}			
			$.extend(_self.options.datepicker, {
					showOtherMonths: _self.options.datepicker.showOtherMonths === true ? true : false  
					,selectOtherMonths: _self.options.datepicker.selectOtherMonths === true ? true : false
					,beforeShow : function(inp,inst) {
						if(!$ep.util.browser.msie) {return;}
						_keep && _keep.clear() && (_keep = null);
						_keep = _util.keepObject();
						_keep.hide();
					}
					,onClose : function() {_keep && _keep.show();}
					,changeMonth: true
				    ,changeYear: true

			});
			if(_beforeDay||_self.options.datepicker.beforeDisableDate || _self.options.datepicker.afterDisableDate ) {
				_self.options.datepicker.beforeShowDay = _beforeShowDay;
			}
			if(!_self.options.icoClick) {
				$(_self.elements.icon).on("click", function(e) {
					if($(_self.elements.input).is(":disabled")) {e.preventDefault();return;}
					$(_self.elements.input).datepicker("show");
				});
			}
			
			$(_self.elements.input).datepicker(_self.options.datepicker);	
			var _val = $(_self.elements.input).val(),__val = null;
			if(_val.is8601Date()) {	__val = _val.isoToDate();}
			else if(!isNaN(new Date(_val))) {__val = new Date(_val);}
			__val && $(_self.elements.input).datepicker("setDate",__val);
		}
		,val : function(sVal) {
			var _self = this;
			return sVal != undefined ? $(_self.elements.input).val(sVal) :  $(_self.elements.input).val();
		}
		,focus : function(){$(this.elements.input).focus();}
		,getSelectedValue : function() {return this.api.select ? this.api.select.getSelectedValue() : undefined;}
		,disable : function() {
			$(this.elements.wrap).addClass("disabled");
			this.api.select && this.api.select.disable();
			$(this.elements.input).prop("disabled",true);			
		}
		,enable : function() {
			$(this.elements.wrap).removeClass("disabled");
			this.api.select && this.api.select.enable();
			$(this.elements.input).prop("disabled",false);
		}
		,destroy : function() {
			
			this.api && this.api.select && this.api.select.destroy();
			this.options.datepicker && ($(this.elements.input).datepicker("destroy"));
			
			this.elements.input = null;
			this.elements.icon = null;
			this.elements.select = null;
			this.elements.wrap = null;
			this.elements = null; 
			this._super("destroy");			
		}
	};
	
	/*
	 *  ui.Tree
	 *  
	 */		
	$ep.ui.tree = function(sel,options) {
		var _$sel = sel instanceof jQuery ? $(sel) : $(sel); 
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.tree.method.moduleName)) {return _$sel.data($ep.ui.tree.method.moduleName);}
		var _method = $.extend({},$ep.ui.tree.method);
		_method.options = $.extend(true, {source : []},options);
		return _inheritSuper(_$sel,$ep.ui.tree,_method);
	};
	$ep.ui.tree.method = $ep.ui.tree.prototype = {
		moduleName : "ep.ui.tree" 
		,create : function() {
			var _self = this;
			if(this.options.classes) {
				$(this.element).addClass(this.options.classes);
			}
			if(this.options.disableHook !== true) {
				$.extend(_self.options,{
					hooking : function(type, origiEvent, ctx) { return _self.trigger(type,origiEvent,ctx);}
				});					
			}
			$(this.element).eptree(this.options).disableSelection();
		}
		,getTree : function() {
			if(this.tree) {return this.tree;}
			this.tree = this.widget("getTree");
			return this.tree;
		}
		,reload : function() {
			return this.applyTree.apply(this,["reload"]);
		}
		,getRootNode : function() {return this.widget("getRootNode");	}
		,getActiveNode : function() {return this.widget("getActiveNode");}
		,getSelectedNodes : function() {return this.applyTree.apply(this, ["getSelectedNodes"].concat(Array.prototype.slice.call(arguments)));}
		,getNodeByKey : function() {return this.applyTree.apply(this, ["getNodeByKey"].concat(Array.prototype.slice.call(arguments)));}
		,getChildren : function(node){
			if(!node) {return null;};
			return node.getChildren();
		}
		,getChildrenByKey : function(key){
			var _node = this.getNodeByKey(key);
			return this.getChildren(_node);
		}
		,addChildrenByKey : function(key,node) {
			var _key = typeof key === "string" ? key : null
				,_parent = _key ? this.getNodeByKey(_key) : this.getRootNode()
				,_node = node ? node : typeof key != "string" ? key : null;
			if(!_node) {return null;}
			_parent.addChildren(_node);
			return _parent;	
			
		}		
		,deSelectedAll : function() {
			var _nodes = this.getSelectedNodes();
			if(!_nodes) {return;};
			for(var i = 0; _nodes.length > i; i++) {_nodes[i].setSelected(false);}
			return true;			
		}
		,deActivate : function() {	
			var _active = this.getActiveNode();
			if(!_active) {return;};
			return _active.setActive(false);
		}
		,childrenSelectedAll : function(node){
			var flag = true;
			if (!node) {return;}
			var childs = node.getChildren();
			if (!childs) {retun;}
			if(!$.isArray(childs)) {return;}
			if(childs.length == 0) {return;}
			if(childs[0].isSelected()) { flag = false;}
			$ep.Array(childs).datafilter(function(_idx,_dat) {
				_dat.setSelected(flag);
			});
		}
		,removeSelectedNodes : function(){
			var _nodes = this.getSelectedNodes();
			$.each(_nodes,function(idx,node) {
				if(!node.parent) {return true;}
				if(node.hasChildren()) { node.removeChildren();}
				node && node.remove();
			});
		}
		,expandKey : function(keyarr) {
			var _self = this, node = null, _keyarr = keyarr.reverse(),_val = _keyarr.pop();
			node = this.getNodeByKey(_val);
			if(!node) {return;}
			node.setExpanded(true)
			.done(function() {
				if(_keyarr.length > 0) { 
					_self.expandKey.call(_self,_keyarr.reverse());
				} else {
					if(!node) {return;}
					_self.element && $(_self.element).scrollTop($(node.li).offset().top - $(_self.element).offset().top);
				}
			}); 
			
			/*_util.ready(function() {
				node = _that.getNodeByKey(_val);
				return node ? true : false;
			},100).run(function() {
				//_log("node",node);
				if(node) {	node.expand(true);	}
				if(_keyarr.length > 0) { 
					_that.expandKey(_keyarr.reverse());
				} else {
					if(node) {	$(":first",$me).scrollTop($(node.li).offset().top - $me.offset().top);}; 
				}
			});*/
		}
		,applyTree : function(method) {
			var _Tree = (this.tree ? this.tree : this.getTree());
			return _Tree[method] ? _Tree[method].apply(_Tree, Array.prototype.slice.call(arguments,1)) : undefined; 
		}
		,widget : function() {
			return $(this.element).eptree ? $(this.element).eptree.apply(this.element,arguments) : undefined;	}
		,destroy : function() {
			this.widget("destroy");
			this._super("destroy"); 
			//_log(this.moduleName,"destroy"); 
		}
	};	
	/*
	 *  ep.ui.view
	 */
	var _view = {
		_viewListInit : function(){
			var _self = this;
			_self.elements.viewlist = $(_self.elements.viewlist).epviewlist({	
				column : _self.options.column
				,datapath : _self.options.datapath
				,rowdatapath : _self.options.rowdatapath
				,server : _self.options.server
				,query : _self.options.query
				,click : function(e,rowele,target,data) {_self.trigger("click",rowele,target,data);}
				,clickheader : function(e,_id,_clickid,ele) {
					if($(ele).has(".sortable").size() == 0 ) {return;}
					var _q = _self.options.query || {}
						,_bit = ($(ele).has(".arrow-up").size() > 0 ? 0x01 : 0);
						_bit = _bit | ($(ele).has(".arrow-down").size() > 0 ? 0x02 : 0);
					if(_q.sortcolumn !== _id) {	_q.sortorder = "";}
					_q.sortcolumn = _id;
					if(_q.sortorder == "") {_q.sortorder = _bit & 1 ? "ascending" : "descending" ;}
					else if(_q.sortorder == "ascending") {
						if(_bit & 2) {_q.sortorder = "descending";}
						else {_q.sortorder = "";_q.sortcolumn = "";}
					}
					else if(_q.sortorder == "descending") {_q.sortorder = "";_q.sortcolumn = "";} 
					
					$(this).epviewlist("refreshHeaderByQuery",_q);
					_self.redraw(false);					
				}
				,level : _self.options.query.category ? 1 : 0
			}); 
			
		}
		,_hookButton : function() {
			var _self = this;
			return {
				click : function(e,ids,btn) {return btn.click ? btn.click.apply(_self,[e,ids,btn]) : undefined;	}
				,lockclick : function(e,ids,btn,unlock) {return btn.lockclick.apply(_self,arguments);}};
		} 
		,_viewButtonInit : function() {
			var _self = this;
			if(!_self.options.actions) {return;}
			if(!_self.elements.buttonbar) {return;}
			_self.elements.buttonbar = _self.elements.buttonbar instanceof jQuery ? $(_self.elements.buttonbar) : $(_self.elements.buttonbar, _self.element);
			_self.buttons = _ui.button(_self.elements.buttonbar
					,_self.options.actions
					,_self.script
					,_view._hookButton.apply(_self));								
		}
		,_navInit : function() {
			var _self = this;
			if(!this.elements.navigator) {return;}
			this.elements.navigator = this.elements.navigator instanceof jQuery ? $(this.elements.navigator) : $(this.elements.navigator,this.element);
			if($(this.elements.navigator).size() == 0 ) {return;}

			
			$(this.elements.navigator).eppagenavigator({
				page : (this.options.query.page + 1 )
				,title : {
					prev : $ep.LangString("PGNAVI.PREV")
					,next : $ep.LangString("PGNAVI.NEXT")
					,prevpage : $ep.LangString("PGNAVI.PREVPAGE")
					,nextpage : $ep.LangString("PGNAVI.NEXTPAGE")
				}
				,change : function(e,page) {
					_self.options.query.page = (parseInt(page,10) - 1);
					_self.drawView();
				}
			});
			
		}
		/*
		 * search bar init
		 */
		,_searchInit : function() {
			var _self = this;
			if(!_self.elements.search) {return;}
			if($(_self.elements.search).size() < 1) {return;}
			if(_self.options.search) {
				$.extend(true, _self.options.search,{
					icon : "search"
					,name : "squery"
					//,width : 150
					,width : _self.options.appcode == "approval" && _self.options.alias == "budgetitem" ? 300 : 150
					,select : {	
						hide : false
						,change : function() {
							var _inst = _ui.input($(_self.elements.search));
							_inst.val() && _inst.elements.icon && _inst.elements.icon.trigger("click");
						}
					}
					,classes : "searchtxt foldable collapse" //expand
					,icoClick : function() {
						var __self = this,_val = this.val();
						if(!_val && $(this.element).hasClass("collapse")) {
							$(this.element).removeClass("collapse",300, function() {								
								$(__self.elements.input).focus();
							});							
						} else if(!_val ) {
							$(this.element).addClass("collapse",300);
							this.val("");
						} else {
							_self.doSearch(this.val(),this.getSelectedValue())	;
						}					
					}					
					,event : "keydown"
					,eventHandler : function(e) {
						if(e.keyCode != 13) {return;}
						if(this.val()=="") {
							$(this.element).addClass("collapse",300);
						}
						_self.doSearch(this.val(),this.getSelectedValue());
					}
						
				},_self.options.search);
				
				_self.options.search.select && (_self.options.search.select.name  = (_self.options.search.select.name || 'squeryfld'));   
				_self.searchInput = _ui.input($(_self.elements.search),_self.options.search,_self.script);
				_self.elements.closesearch = $('<span></span>').appendTo($(".view-search", _self.element));
				$(_self.elements.closesearch).epbutton({
					id : "closesearch"
					,text : $ep.LangString("VIEWLIST.CLOSESEARCH")
					,show : false
					,highlight : true
					,classes : "closesearch black"
					,click : function(){
						if(_self.trigger("closesearch") === false) { return;} 
						_self.closeSearch();
					}
				});
			}
			if(_self.options.hidepagesetup !== true) {
				_self.elements.pagesetup = $('<span class="pagesetup"></span>').appendTo($(".view-search", _self.element));
				$(_self.elements.pagesetup).epbutton({
					id : "pagesetup"
					,text : $ep.LangString("VIEWLIST.PAGESETUP")
					,show : true
					,hook : {
						click : function(e,id,opt) {
							if(id == "pagesetup") {return;}
							_self.setOptions({query : {ps : opt.val,page:0}});
							_self.refresh();							
						}
					}
					,children : (function() {
						var _list = $ep.LangString("VIEWLIST.PAGESETUPLIST"),_result = {};
						$.each(_list, function(idx,v){	var _v = v.split("-");_result['view'+_v[0]] = {text : _v[1],show : true, val : _v[0]}});
						return _result;	})()
					,position : {
						at : 'bottom right',my : 'top right'
					}
				});
			}
			
		}
		,_getViewURI : function(opt){
			var _self = this,_opt = (opt||_self.options),__q = $.extend(true,{},_opt.query),_uri = null;
			if(_opt.searchdefault && __q.search) {
				!(__q.sortorder || __q.sortcolumn) && $.extend(__q,_opt.searchdefault);
			}
			if(_self.isTrigger("viewuri")) {return _self.trigger("viewuri",_opt);}
			
			_uri = $.CURI("/" + _opt.dbpath + "/api/data/collections/" + (_opt.viewtype ? _opt.viewtype : "name") + "/" + 
					_opt.alias + (!__q.search && __q.category && __q.sortcolumn ? __q.sortcolumn : "" ) 
					+ (!__q.search && __q.category && __q.sortorder ? __q.sortorder == "ascending" ? "_asc" : "_des" : "")
					
			+ "?restapi", __q);
			//!__q.search && _opt.extcount && _uri.setArgv({"entrycount": "false"});
			//__q.search && _uri.setArgv({"entrycount" : ""}); 
			if(!_uri.url){return "";} 
			return _uri.decode().encode().url; 	
		}
		,_getViewInfo : function(opt) {
			return $.extend(true, {
				query : {
					page : 0
					,ps : 15
				}
			},opt);
		}
		,_getRange : function(xhr) {
			var _r = "0", _range = (xhr.getResponseHeader("Content-Range") || "");
			if(_range.match(/^items\s([0-9]{1,})-([0-9]{1,})\/([0-9]{1,})/g)) {_r = RegExp.$3;};
			return parseInt(_r,10);				
		}
		,_getExtRange : function(req) {
			return _util.ajax(req); 
		}
		,_setPageNavigator : function(xhr){
			var _self = this
				,_opt = this.options
				,_xhr = xhr;		
			    
			_self.navWidget("setPage",(parseInt(this.options.query.page,10) + 1));
 			
			if(!_opt.extcount){
				if(_opt.query["entrycount"] == "false") {return;}
				_opt.query["entrycount"] = "false";
				var _tot = _view._getRange(xhr);
				var _pgtot = Math.ceil( _tot / _self.options.query.ps);
				_self.navWidget("setMaxPage",_pgtot,true);
				_self.setCounter(_tot);
				return;
			}
			
			var _req = {async:true	};
			
			switch(typeof _opt.extcount) {
			case "object":
				_req.url = _opt.extcount.url ? _util.expression(_opt.extcount.url,_opt) : "";
				_req.expression = _opt.extcount.expression; 
				break;
			case "string":
				_req.url = _util.expression(_opt.extcount,_opt);
				break;
			case "function":
				_opt.extcount.apply(_self, [function(total) {
					if(!_self.element) {return;}
					if(total === undefined) {
						if(_opt.query["entrycount"] == "false") {return;}
						_opt.query["entrycount"] = "false";
						total = _view._getRange(_xhr);
					}
					_self.setCounter(total);
					if($.isNumeric(total)) {
						var _pg = Math.ceil(parseInt(total,10) / _self.options.query.ps);					
						_self.navWidget("setMaxPage",_pg,true);		
					}					
				}]);
				return; 
			};
			if(!_req.url) {return;}
			_view._getExtRange(_req)
			.done(function(data,txt,xhr) {
				if(!_self.element) {return;}
				var _tot = 0, _result = 0;
				switch(typeof data) {
				case "object":
					if (!this.expression) break;
					_tot = _util.expression(this.expression,data);
					break;
				case "string":
					if(data.match(/^\s+[0-9]+\s+/g)) {	_tot = parseInt(data,10);}
					break;
				}
				_result = parseInt(_tot,10);
				_selt.setCounter(_result); 
				_self.navWidget("setMaxPage",_result,true);
			});
		}
		,_getPathData : function(data,path) {
			if(!path) {return data;}
			var _path = path.split(".")
				,_data = data;
			$.each(_path, function(idx,val) {
				if(!_data[val]) {return false;}
				_data = _data[val];
			}); 
			return _data;	
		}
		,_getSearchQuery : function(q,fld) {
			var _self = this, _opt = _self.options;
			if(!q){return "";};
			if(this.isTrigger("beforeSearchQuery")) {
				var _result = this.trigger("beforeSearchQuery",q,fld,_opt.searchheader);
				if(_result !== true) {return _result;}
			}
			var h = (_opt.query.category && _opt.query.category.toUpperCase() == "ALL" ? undefined : 
				_opt.searchheader ? _util.expression(_opt.searchheader,_opt) : undefined);
			var _r = "",_fld = fld ? fld.split(":") : []
			 	,_h = (h ? "(" + h + ") AND " : "")
			 	,_q = q.replace(/"/g,"");
			if (_fld.length == 0 || _fld[0].toUpperCase() == "ALL") {	return (_h + "\"" + _q + "\"");}
			for(var _c = 0; _fld.length > _c;_c++) {
				_r += ((_r ? "," : "")+"[" + _fld[_c] + "]=" + "\"" + _q + "\"");
			}
			_r = _h + "(" + _r + ")";
			return _r;
		}
		,_breadCrumbInit : function() {
			return _ui.drawBreadCrumb(this.elements.breadcrumb,{companycode : this.options.companycode,appcode : this.options.appcode, page : this.options.breadcrumb},this.script);
		}
		,_Referer : function() {
			_ui.setReferer(this.url());
		}
	};	
	/*	$ep.ui.view  
	 *   options 
	 *   	- actions : Object(ep.ui.button Options)
	 *    	- column : Object
	 *    		- selectable : string 'checkbox,radio
	 *    		- [_field] : Object
	 *    			- title : String, function() 
	 *    			- hcss : headerCSS
	 *    			- hclasses
	 *    			- render : function(rele,cele,data,colset)
	 *     			- css : Object Or String 
	 *    			- type : formatter string(isodate,multilevel)
	 *    			- sortable : Boolean Or {ascending:true, descending : true }
	 *    			- dateformat : dateFormatter
	 *      - hideheader : Boolean
	 *      - breadcrumb : String 
	 *      - appcode : application Code
	 *      - server : 대표호스트
	 *      - search : ep.ui.input
	 *      - searchheader 
	 *    	- extcount : Object or url or function(callback)
	 *    		- url : URL String (전체문서 URL)
	 *    		- expression : Expression(결과 값을 위한 경로)
	 *  	- viewtype : String unid, name(REST API 보기 연결 방법)
	 *  	- dataset : Array Object
	 *  	- rowrender : function(e,ele,data)
	 *  	- clickheader : function(e,_id,_clickid,_head)
	 *  	- rowdatapath : data 의 row Array 경로
	 *  	- datapath :	data fieldset 경로
	 *  	- query : {
	 *  
	 *   	}
	 *  	- events : Object
	 *  		click : 
	 *  		viewuri :
	 *  		beforeData : 
	 *  		afterData :
	 *  		beforeSearchQuery
	 *  		
	 */
	$ep.ui.view = function(sel,opt,jx) {
		var _$sel = sel instanceof jQuery ? $(sel) : $(sel, $ep.ui.active());
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.view.method.moduleName)) {return _$sel.data($ep.ui.view.method.moduleName);}
		var _inst = _inheritSuper(_$sel,$ep.ui.view,$ep.ui.view.method);
		if(opt.column) {jx && jx.LangConvertObject(opt.column);}
		_inst.script = jx; 
		_inst.options = _view._getViewInfo.call(this,opt);
		_inst.options.events = $.extend({
			click : null
		},opt.events);
		_inst.elements = {
			viewlist : $("#viewlist",_inst.element)
			,navigator : $(".view-navigator",_inst.element)
			,buttonbar : $(".view-button",_inst.element)
			,search : $('<span></span>').appendTo($(".view-search", _inst.element))
			,pagesetup : null
			,counter : $(".view-counter",_inst.element)
			,breadcrumb : $(".view-breadcrumb",_inst.element)  /* 경로 */
		};
		_inst.init();
		return _inst;
	};
	$ep.ui.view.method = $ep.ui.view.prototype = {
		moduleName : "ep.ui.view"
		,init : function(){
			var _self = this;
			$(this.element).addClass("ep-bodycontent ep-viewpage");
			$(this.elements.counter).addClass("processing");
			_view._viewButtonInit.call(this); 	/* 버튼 초기화 				*/
			_view._viewListInit.call(this);		/* viewList 초기화 			*/
			_view._navInit.call(this);  		/* viewNavigator 초기화 	*/
			_view._breadCrumbInit.call(this);		/*	이동 경로 표시 */
			_self.elements.search.size() > 0 && _view._searchInit.call(this);
			if(_self.options.query && _self.options.query.search) {
				_self.elements.search && $(_self.elements.search).removeClass("collapse",300,function() {
					if(_self.searchInput) {
						var _txt = _self.options.query && _self.options.query.searchtxt
							,_key = _self.options.query && _self.options.query.searchkey;
						_key &&	_self.searchInput.api && _self.searchInput.api.select && _self.searchInput.api.select.setSelected(_key)&& delete _self.options.query.searchkey;						
						if(_txt && typeof(_txt) == "string") {
							_self.searchInput.elements.input.val(_txt);
							_self.searchInput.elements.input.select();
							_txt && delete _self.options.query.searchtxt;
						} else {
							_self.searchInput.elements.input.focus();	
						}						
					}
				});
				_self.elements.closesearch && $(_self.elements.closesearch).epbutton("show");
				_self.elements.pagesetup && $(_self.elements.pagesetup).epbutton("hide");
				_self._bopt = $.extend(true,{}, _self.options); //_extend(null,_opt);
				_self._bopt.search && delete _self._bopt.search;
				_self._bopt.query && _self._bopt.query.search && delete _self._bopt.query.search;
				$.extend(true,_self.options, {query : {entrycount : ""}}); 
			}
			this.drawView()
			.fail(function(xhr,txtStatus,msg) {
				//_self.throwError("ERROR.RESPONSE_EXCEPTION","error");
			});
			
		}
		,throwError : function(msgcd,errcd) {
			this.setCounter(0); 
			this.navWidget("setMaxPage",0,true);
			this.widget("errorShow",$ep.LangString(msgcd),errcd);
		}
		,setViewData : function(data){
			this.widget("clearData");				
			this.widget("addData",data);
		}
		,setCounter : function(x) { /* 전체 문서 개수*/
			if($(this.elements.counter).size() == 0) { return;}
			if(x == "processing" || x== "fail") {
				$(this.elements.counter).empty();
				x == "processing" && $(this.elements.counter).addClass("processing");
				x == "fail" && $(this.elements.counter).addClass("fail");
				return;
			}
			$(this.elements.counter).removeClass("processing");
			$(this.elements.counter).html('<strong>'+ parseInt(x,10).toCurrency() + '</strong>'); 
		}
		,getViewData : function(callback){
			var _promise = _util.ajax({url : _view._getViewURI.call(this)});
			$(this.element).off("abort").on("abort",function(){_promise.readystate != 4 && _promise.abort();});
			return _promise	.done(function() {if(typeof callback === "function")	callback.apply(this,this.arguments);});
		}
		,getSelected : function() {return this.widget("getSelected");	}
		,selectAll : function(ischeck) {return this.widget("selectall",ischeck);}
		,drawView : function() {
			var _self = this,_delay = _util.delay(),_block = null;
			_delay.run(function() {_block = $ep.util.blockUI({message : ""});},500);
			_self.isTrigger("beforeData") && _self.trigger("beforeData");
			//if(_self.options.extcount) {setTimeout(function() {_view._setPageNavigator.call(_self,undefined);return;},10);}
			$(".column.header.selectable input:checkbox",_self.element).prop("checked",false);
			return _self.getViewData()
			.done(function(data,txtStatus,xhr) {
				_delay.clear(); 
				_block && _block.unblock(); 
				if(!_self.element) {return;}
				if(txtStatus !== "success") { throw new Error(txtStatus);}
				if($.isArray(data) && data.length == 0 && _self.options.query&&_self.options.query.page != 0) {_self.options.query.page--;_self.refresh();return;}
				if($.isArray(data) && data.length == 0) {_self.throwError("ERROR.RESPONSE_EMPTY","warning");return;}
				if(typeof data !== "object"){
					var _data = _self.trigger("datarender",data);
					if(typeof _data !== "object"){	_self.throwError("ERROR.RESPONSE_EMPTY","warning");	return;	}
					data = _data;
				}
				if(_self.isTrigger("afterData") && _self.trigger("afterData",data) === false) {_self.throwError("ERROR.RESPONSE_EMPTY","warning");return;} ;
				if(typeof _self.options.rowdatapath === "string" ) {data = _view._getPathData(data,_self.options.rowdatapath);	}
				if((!data.length || data.length == 0) && _self.options.query&&_self.options.query.page != 0) {_self.options.query.page--;_self.refresh();return;}				
				if (!data.length || data.length == 0) {_self.throwError("ERROR.RESPONSE_EMPTY","warning");return;}
				_view._setPageNavigator.call(_self,xhr); /* 도미노에서 extcount를 쓸때 검색에서 extcount를 피할 수 있도록 */
				_self.setViewData(data,xhr);
				/*if(!_self.options.extcount) {_view._setPageNavigator.call(_self,xhr);}*/
			})
			.fail(function() {
				_delay.clear(); 
				_block && _block.unblock();
				_self.throwError("ERROR.RESPONSE_EXCEPTION","error");
			});
		}
		,doSearch : function(q,fld) {
			if(!q) {this.closeSearch();return;}
			if (!/[\w\W]{2,}/g.test(q)) {$ep.util.toast($ep.LangString("$CORE.VIEWLIST.QUERYLIMIT"));return;}
			var _self = this, _opt = _self.options,_query = q;
			_opt.search_option = {	query : _query	,field : fld};
			var _query = _view._getSearchQuery.call(_self,q,fld);
			return _self.doQuerySearch(_query);
		}
		,doQuerySearch : function(q) {
			var _self = this,_opt = _self.options;
			if(!q) {_self.closeSearch();return;}
			if(!_self._bopt) {
				_self._bopt = $.extend(true,{}, _opt); //_extend(null,_opt);
				delete _self._bopt.search_option;
			}
			_opt.query.page = "0";
			_opt.query.entrycount = "";
			_opt.query.search = q; 
			if(typeof _opt.extcount !== "function") {_opt.extcount = null;} /* 아카이빙을 위해 검색 카운트는 그대로 둠.*/
			_self.elements.closesearch && $(_self.elements.closesearch).epbutton("show");
			_self.elements.pagesetup && $(_self.elements.pagesetup).epbutton("hide");
			
			_self.elements.search && _self.elements.search.size() > 0 && $("input",_self.elements.search).select().focus();
			 return this.drawView();  
		}
		,closeSearch : function() {
			var _self = this;
			if(!_self._bopt){return;}
			if(_self.options.search_option) {delete _self.options.search_option;	}
			//검색후 category이동후 검색 닫기를 하면 이동했던 category 유지.
			_self.options = $.extend(true, {}, _self._bopt,{query : {category : _self.options.query.category}}); 
			_self._bopt = null; 
			delete _self._bopt;
			_self.elements.closesearch && $(_self.elements.closesearch).epbutton("hide");
			_self.elements.pagesetup && $(_self.elements.pagesetup).epbutton("show");
			_self.elements.search && $ep.ui.input(_self.elements.search).val("") && $(_self.elements.search).addClass("collapse",300);
			_self.setCounter("processing");
			_self.refresh();			
		}
		,redraw : function(searchclean) {
			var _clean = {
				query : {
					page : 0
					,entrycount : ""					
				}
			};
			if(searchclean !== false) {_clean.query.search = "";}
			$.extend(true, this.options, _clean);
			$(this.elements.viewlist).epviewlist("refreshHeaderByQuery",this.options.query || {});
			return this.drawView();			
		}
		,refresh:function() {
			var _opt = this.options;
            //_opt.entrycount = "0";
            _opt.query = $.extend(true,_opt.query, 	 
            	{ 
        			entrycount : _opt.query.search ? "true" : 
        				 _opt.extcount ? "false" : "true"  
            	}
            );  
            $(this.elements.viewlist).epviewlist("refreshHeaderByQuery",this.options.query || {});
        	return this.drawView(); 
		}
		,url : function() {
			var _cur = $.CURI(_ui.getPageHref());
			_cur.setParam("search","");
			_cur.setParam("searchtxt","");
			_cur.setParam("searchkey","");
			var _p = $.CURI(_view._getViewURI.call(this));			
			var _uri = $.CURI(_cur.url,$.extend({},_p.arguments,{entrycount : ""}));
			if(_p.getParam("search") && this.searchInput) {
				var _srh = this.searchInput;
				if(_srh.val()) {
					_uri.setParam("searchtxt",encodeURIComponent(_srh.val()));
					_srh.getSelectedValue() && _uri.setParam("searchkey",encodeURIComponent(_srh.getSelectedValue()));
				}
			}
			return _uri.url;
		}
		,getDocumentUrl : function(unid,query) {
			var _uri = null;
			if(unid.match(/^\//g)) {
				_uri = $.CURI(unid,query);
			} else {
				_uri = $.CURI({
					_$path :  "/" + this.options.dbpath + "/" + this.options.alias + "/" + unid
					,_$cmd : "opendocument"					
				},query);
				_uri.server(this.options.server); 
			}
			return _uri.url;
		}
		,openDocument : function(unid,query,isref) {
			var _url = this.getDocumentUrl(unid,query);
			isref !== false && _view._Referer.call(this);
			_ui.loadPageLang(_ui.active(),_url,this.script);
		}
		,editDocument : function(unid,query) {
			var _uri = $.CURI(this.getDocumentUrl(unid,query));
			if(!unid.match(/^\//g)) { _uri.cmd("editdocument");}
			_view._Referer.call(this);
			_ui.loadPageLang(_ui.active(),_uri.url,this.script);
		}
		,openForm : function(form,argv,isref) {
			var _uri = null;
			if(form.match(/^\//g)) {_uri = $.CURI(form,argv);} 
			else {
				_uri = $.CURI({_$path : "/" + this.options.dbpath + "/" + form,_$cmd : "openform"},argv);
				_uri.server(this.options.server); 
			}
			isref !== false && _view._Referer.call(this);
			_ui.loadPageLang(_ui.active(),_uri.url,this.script);
		}
		,showButton : function(key) {
			return this.buttons.showbuttons(key);
		}
		,hideButton : function(key) {
			return this.buttons.hidebuttons(key);
		}
		,widget : function() {	return $(this.elements.viewlist).epviewlist ? $(this.elements.viewlist).epviewlist.apply(this.elements.viewlist,arguments) : undefined;}
		,navWidget : function() {
			if(!this.elements.navigator || !$(this.elements.navigator).data("epEppagenavigator")) {return;}
			return  $(this.elements.navigator).eppagenavigator ? $(this.elements.navigator).eppagenavigator.apply(this.elements.navigator,arguments) : undefined;
		}
		,destroy : function(){
			$(this.element).trigger("abort");
			this.navWidget("destroy");
			this.widget("destroy");			
			if(this.buttons) {this.buttons.destroy();}
			this._super("destroy");
			this.elements = {
					viewlist : null
					,navigator : null
					,buttonbar : null
					,search : null
					,pagesetup : null
					,counter : null
					,breadcrumb : null
			};
			this.elements = null;
			this.script = null;
			this.options = null;
			//_log(this.moduleName,"destroy");
		}
	};
	/*
	 *  ep.ui.doc
	 */
	var _doc = {
		_initButton : function() {
			var _self = this;
			if(!_self.options.actions) {return;}
			if(!_self.elements.buttonbar) {return;}
			_self.elements.buttonbar = _self.elements.buttonbar instanceof jQuery ? $(_self.elements.buttonbar) : $(_self.elements.buttonbar, _self.element);
			_self.buttons = _ui.button(_self.elements.buttonbar
					,_self.options.actions
					,_self.script
					,_doc._hookButton.apply(_self));								
		}
		,_initAttachment : function() {
			var _self = this;
			if(!_self.options.attachment) {return null;}
			var _opt = _self.options.attachment === true ? {} : _self.options.attachment
				,_ele = $((_self.options.isedit === true ? ".frm_edit_attachment" : ".frm_view_attachment"),_self.element);
			if(_ele.size() == 0) {return null;}
			if(_self.options.isedit == false && (!_self.options.files || _self.options.files.length == 0)) { return null;}
			
			var _attopt = $.extend(true,{
				dataset : this.options.files
				,classes : "withoutscroll"
				,i18n : $ep.LangConvertObject({
					Attachments : "{$CORE.TEXT.ATTACHMENTS}",
					filename : "{UPLOADER.FILENAME}",
	        		filesize : "{UPLOADER.FILESIZE}",
	        		filestatus :"{UPLOADER.FILESTATUS}",
	        		AttachmentFiles : "{UPLOADER.SELECTFILE}",
	        		AttachmentTooltip : "{UPLOADER.SELECTTOOLTIP}",
	        		Attached : "{UPLOADER.ATTACHED}",
	        		Failed : "{UPLOADER.FAILED}",
	        		Completed : "{UPLOADER.COMPLETED}",
	        		AllDownload : "{UPLOADER.ALLDOWNLOAD}",
	        		Close : "{UPLOADER.CLOSE}"
				})
				,duplicate : {
					message : $ep.LangPatternString("{UPLOADER.DUPLIDATEMESSAGE}")
				}
				,mode : this.options.isedit ? "edit" : "read_tooltip"  
				,url : $ep._CONST.PATH.TEMPATTACH
				,base : $.CURI(this.url()).path() + "/$FILE"
				,formData : {
					__Click : "0"
					,unid : _self.options.unid
					,Body : ""
				}
				
			},_opt);
			if(this.trigger("initAttachment",_ele,_attopt) === false) {return null;};
			return $ep.ui.doc.attachment(_ele,_attopt);
		}
		,_hookButton : function() {
			var _self = this;
			return {
				click : function(e,ids,btn) {return btn.click ? btn.click.apply(_self,[e,ids,btn]) : undefined;	}
				,lockclick : function(e,ids,btn,unlock) {return btn.lockclick.apply(_self,arguments);}};
		}		
		,_mergeHeader : function(html) {
			var api = this.api.editor
				,_style = "color:{color};font-size:{fontSize};font-family:{fontFamily};line-height:{lineHeight};"
				,_strStyle = _util.expression(_style,api.getStyle());
			var _html ="";
			_html += "<html>";
			_html += "<head>";
			_html += "<style>";
			_html += 'p { margin:0; padding:0; }\r\nbody, td, button { ' + _strStyle+ '}';
			_html += "</style>";
			_html += '</head>';
			_html += '<body>' + html + '</body></html>';
			return _html;
		}
		,_replaceBodyStyle : function(shtml) {
			var _html = shtml
				,_reg = new RegExp('(<style.*?>)([\\s\\S]*?)(</style>)|<style.*[/]?>',"gi")
				,_matchs = _html.match(_reg);
			if(!_matchs) {return shtml;}
			function _tagReplace(_src,_tag,_rep) {
				var __reg = new RegExp('((?:\\,\\s*|\\}\\s*|^\\s*|\\>\\s*))'+_tag +'((?=[\\,|\\{|\\s]))',"gi");
				return _src.replace(__reg,"$1"+_rep+"$2");				
			};
			$.each(_matchs,function(idx,val) {
					var _src = val,_result = "";
					 _result = _tagReplace(_src,"body","#ep_richbody");
					 _result = _tagReplace(_result,"P","#ep_richbody P");
					 _result = _tagReplace(_result,"TR","#ep_richbody TR");
					 _result = _tagReplace(_result,"TD","#ep_richbody TD");
					 _result = _tagReplace(_result,"DIV","#ep_richbody DIV");
					 _result = _tagReplace(_result,"SPAN","#ep_richbody SPAN");
					 _result = _tagReplace(_result,"ul","#ep_richbody ul");
					 _result = _tagReplace(_result,"li","#ep_richbody li");
					 _result = _tagReplace(_result,"button","#ep_richbody button");
					 _html = _html.replace(_src, _result);
			}); 
			return _html; 
		}
		,_cleanBody : function(_html) {
			return 	_html.replace(/<p>\n[<\/p>]?<table border=\"1\" cellSpacing=\"2\" cellPadding=\"4\">[\s\S]*?<\/table>/ig, "");
		}
		,_initBody : function(){
			var _self = this
				,dfd = new $.Deferred();
			if(!_self.elements.editor) {dfd.resolve();return dfd.promise();}
			if($(_self.elements.editor).size() == 0) {dfd.resolve();return dfd.promise();}
			_self.hasEditor = true;
			_self.initEditor = false;
			_self.elements.editor.on("initEditorComplete", function(e,api) {
				api.init(_self);
				_self.initEditor = true;				
				_self.api["editor"] = api;
				dfd.resolve(api);
				_self.options.isnewdoc && _self.trigger("initEditorComplete",api);
			});
			_self.hasEditor && _self.elements.editor.trigger("initbody",this.element);			
			var _uri = $.CURI(this.url(),{unid : _self.options.unid});	
			if(!_self.options.isnewdoc && _self.options.isedit){
				$.when(_util.ajax({type : "get",url : $.CURI(_uri.getNSF() + "/EditBodyHtml?OpenAgent",_uri.arguments).url}),dfd)
				.done(function(b,e){
					var _html = b[0];
					_html = _doc._cleanBody(_html);
					_html = _util.removeTag(_html,"html",false);
					_html = _util.removeTag(_html,"head");
					_html = _util.removeTag(_html,"body",false);
					_html = _util.removeTag(_html,"style");
					_html = _util.removeTag(_html,"script");
					e.setHTML(_html);
					_self.trigger("initEditorComplete",e);
				});
			} else if(!_self.options.isnewdoc && !_self.options.isedit) {
				return _util.ajax({type : "get",url : $.CURI(_uri.path().replace(/\$first/gi,_self.options.unid) + "/Body?OpenField",_uri.arguments).url
					,success : function(html,txtstatus,xhr) {
						var _html = _doc._cleanBody(html),_tail = Math.random().toString().substr(2,6),__ = function(s,$1,$2,$3) {return $1+$.CURI($2,{_ : _tail}).url+$3;};
						_html = _doc._replaceBodyStyle(_html);
						_html = _util.removeTag(_html,"script",true);
						_html = _util.removeTag(_html,"link"); 
						_html = _html.replace(/id=[\"]?ep_richbody[\"]?/gi,"id=\"ep_innerbody\"")
							.replace(/(<img[^>]+src=["']?)(\/[^">'\s]+)(["']?[^>]+?>)/gi,__);
						_self.elements.editor.html(_html);
						//_self.elements.editor[0].innerHTML = _html; // TODO 테스트
					}
				});
			}
			return dfd.promise();
		}		
		,_initFieldSet : function() {return _ui.initFieldSet(this.element,this.script,this.options.server);}
	};
	/*  
	 * 	$ep.ui.doc  
	 *   options 
	 *   	- actions : Object(ep.ui.button Options)
	 *  	- breadcrumb : String (Lang Pack)
	 *  	- disableicon : []
	 */
	$ep.ui.doc = function(sel,options,jx) {
		var _$sel = sel instanceof jQuery ? $(sel) : $(sel, $ep.ui.active());
		if(_$sel.size() == 0) {return null;}

		if(_$sel.data($ep.ui.doc.method.moduleName)) {return _$sel.data($ep.ui.doc.method.moduleName);}
		var _method = $.extend({},$ep.ui.doc.method);
		_method.options = options;
		_method.script = jx;
		_method.api = {
			editor : null
			,attachment : null
		};
		return _inheritSuper(_$sel,$ep.ui.doc,_method);
	};
	$ep.ui.doc.method = $ep.ui.doc.prototype = {
		moduleName : "ep.ui.doc"
		,create : function() {
			var _self = this, _opt = _self.options;
			$(this.element).addClass("ep-bodycontent ep-formpage");
			if(!_opt.elements) {_opt.elements = {};}
			_self.buttons = null;
			if(!$ep.dock() && _self.options.windowTitle) {
				_util.windowTitle.call(_self,_self.options.windowTitle);
				try{
					if(window.parent && window.parent.document.getElementById("undockInnerFrame")) {
						window.parent.document.title = $.type(_self.options.windowTitle) == "function" ? _self.options.windowTitle.call(_self,_self.options.windowTitle) : _self.options.windowTitle;
					}
				}catch(err){}
			}
			this.elements = {
				form : _opt.elements.form || $(this.element).closest("form")
				,buttonbar : _opt.elements.buttonbar || $(".frm_button",this.element)
				,iconactions : _opt.elements.iconactions || $(".frm_icon",this.element)
				,breadcrumb : _opt.elements.breadcrumb || $(".frm_breadcrumb",this.element)
				,editor : _opt.elements.editor||$("#ep_richbody",this.element)
			};
			_self.trigger("initDocument");
			this.options.disableunload !== false && this.options.isedit === true && $(this.element).closest("form").on("beforedestroy", function() {				
				if(_self._forceClose === true) {return;}
				var _dfd = new $.Deferred();
				_ui.dialog({
					content : {
						html : '<div style="line-height:25px;font-size:10pt;">'+$ep.LangString("FORM.PAGEUNLOADMESSAGE") + '</div>'
					}
					,title : $ep.LangString("FORM.PAGEUNLOADTITLE")
					,width : 361
					,show : {effect : "fadeIn",duration: 200}
					,position : {my : "center bottom", at : "center center", of : $(window), collision : "fit"}
					,buttons : [
					   {
							text : $ep.LangString("FORM.PAGEUNLOADOK")
							,highlight : true
							,click : function() {_dfd.resolve(true);	$(this).epdialog("close");}   
					   }
					   ,{
						   text : $ep.LangString("FORM.PAGEUNLOADCANCEL")
						   ,click : function() { $(this).epdialog("close"); _dfd.resolve(false);}
					   }
					]					
				});
				return _dfd.promise();
			});			
			_self.bindWindowUnload();
			var _init = _doc._initBody.call(this);
			this.api.attachment = _doc._initAttachment.call(this);		
			_doc._initFieldSet.call(this); 
			_doc._initButton.call(this);
			this.initBreadCrumb();
			this.initIconActions();
			_init.always(function() {_self.trigger("loadcompleted");});			
		}
		,bindWindowUnload : function() {
			var _self = this;
			_self.beforeunload = function() {
				if(_self._forceClose === true) {return;}
				return $ep.LangString("FORM.WINDOWUNLOADMESSAGE");
			};
			_self.unload = function() {_self.trigger("unloadpage");};
			var _win = $(window); 
			_self.options.disableunload !== false && _self.options.isedit === true && _win.on("beforeunload",_self.beforeunload);
			_win.on("unload",_self.unload);
		}
		,unbindWindowUnload : function() {
			var _self = this;
			$(window)
			.off("beforeunload",_self.beforeunload)
			.off("unload",_self.unload);
		}
		,iconSet : function() {
			var _self = this;
			return {
				link : {
					classes : "link"
					,text : "{FORM.TOOLTIP.URLCOPY}"
					,run : function(e) {
						var _self = this,_e = e
							,__url = _self.direct().full
							,_event_url = _self.trigger("urlcopy",__url);
						if(_event_url) {__url = _event_url;}
						$(_e).qtip({
							overwrite : true,
							content : {
								text : function(e,api) {
									var _api = api
										,_html = $('<div class="content">'+
													'<div class="iconset_url_copy"><input type="text" readonly style="width:100%;"></div>'+
													'<div class="bottom_layer"><span class="message">'+ $ep.LangPatternString("{FORM.URLCOPY.MESSAGE}")+'</span><span class="btnclose">'+ $ep.LangPatternString("{FORM.URLCOPY.CLOSE}")+'</span></div>' +
													'</div>');
										_html.find(".iconset_url_copy input").val(__url);
										_html.find(".btnclose").on("click",function() {
											api.hide();
										});
									return _html;
								}					 
							},
							position : {
								at : 'bottom center',my : 'top center',
								target : $(_e),
								adjust : { method: "shift flip" ,/*x : 5 ,y : 0,*/screen:true }, 
								viewport: true								
							}
							,show: {
								solo : true,
								event: 'click',
								effect : function() {$(this).slideDown("fast");}
							} 
							,hide : {
								delay : 600,
								fixed:true, 
								event : "unfocus",effect : function() {$(this).slideUp("fast");}
							}
							,style : { 
								classes: 'qtip-shadow iconset-urlcopy',width : "480px" 
								,tip : { classes : "ui-icon ui-icon-closethick ", corner: true ,width : 9 ,height : 6 /*,offset : -148 */}
							}
							,events : {
								visible : function(e,api) {$(".iconset_url_copy input",api.elements.content).select();}
							}
						}); 
					}
				}
				,undock :{
					classes : "undock"
					,text : "{FORM.TOOLTIP.UNDOCK}"
					,click : function() {
						this.undock();
						//this.close();
					}
				}
				,copy : {
					classes : "copy"
					,text : "{FORM.TOOLTIP.COPY}"
					,click : function() {
						var _element = $(_self.element).clone(false)
							,_uri = $.CURI();
							_element.find(".frm_action").empty();
						$ep.ui.dialog({
							//iframe : true
							title : "{FORM.BODYCOPY.DIALOGTITLE}"
							,dialogClass : "copybody-dialog"
							,complete : function() {
								var _if = $(this).find(".copy_iframe");
								if(_if.size() == 0) {return false;}
								$('<iframe src="/res/core/comm/html/core/bodycopy.html" frameborder="0" style="display:inline-block;height:100%;width:100%;border:2px solid #999;box-sizing:border-box;"></iframe>')
								.load(function() {
									var _doc = $(this).contents();
									var _body = _doc.find("body");
									//_doc.find("head").append('<base href="'+ _uri.base() + '">')
									//.append('<meta http-equiv="X-UA-Compatible" content="IE=Edge">');
									//_head.append('<base href="'+ _uri.base() + '/">');
									
									if($(_body).size() === 0) {return false;}
									$(_body).empty(); 
									_body[0]["spellcheck"] && _body.prop("spellcheck",false);
									/* 
									_body[0]["contentEditable"] && _body.prop("contentEditable",true);
									_body[0]["designMode"] && _body.prop("designMode","on");
									*/
									_body.css({"zoom": "0.75","-moz-transform": "scale(0.75)" , "-moz-transform-origin": "0 0", "font-family":'"맑은 고딕","Malgun Gothic","돋움",dotum,Arial,sans-serif,Helvetica'});
									$(_element)
									.inlineStyle()									
									.done(function() {
										var _html = $(_element).html();
										/* 보라 currentColor rgb 인식 못함 */
										_html = _html.replace(/<[a-zA-Z]+[^>]*currentColor[^>]*>/gi, function(a){
											return a.replace(/currentColor/gi, "black");
										});
										/* rgb color 변경 */
										_html = _html.replace(/<[a-zA-Z]+[^>]*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)[^>]*>/gi, function(a){
											var _color = a.replace(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi, function(a, b, c, d){
												return "#" + ("0" + parseInt(b, 10).toString(16)).slice(-2) 
												+ ("0" + parseInt(c, 10).toString(16)).slice(-2) 
												+ ("0" + parseInt(d, 10).toString(16)).slice(-2) + "";
											});
											return _color;
										});
										/* color 값 없는 border */
										_html = _html.replace(/(border(?:-top|-right|-bottom|-left)?)\s*\:\s*((?:\d*\.)?\d+[a-zA-Z\%]+)\s+([a-zA-Z]+)\s*\;/gi, function(all, a, b, c){
											return a + ":windowtext " + b + " " + c + ";";
										});
										$(_body).html(_html);
										//$(_body).html($(_element).html());
										_body.focus();
										_body.selectText(_doc[0]);									
									});
								})
								.appendTo(_if);
							}
							,content : {
								html : '<div class="wrap">'+
									'<div class="message">'+$ep.LangPatternString("{FORM.BODYCOPY.MESSAGE}")+'</div>'+
									'<div class="copy_iframe"></div>'+
									'</div>'								
							}
							,width : $ep.util.browser.msie ? 870 : 600
							,height : 500
							,resizable : true
							,buttons : [
							    { text : "{$CORE.TEXT.CLOSE}"  	,highlight : true
							    	,click : function() {
							    		$(this).epdialog("close");
							    	}
							    }        
							]							
						});					
						
					}
				}
				,fold : {
					classes : "fold expanded"
					,text : "{FORM.TOOLTIP.FOLD}"
					,click : function(e) {
						var _fold = $(".extendible",this.element)
							,_isexpanded = _fold.is(':visible');						
						$(_fold).slideToggle("fast",function() {
							if(_isexpanded) {$(e).find(".fold.expanded").removeClass("expanded").addClass("collapsed");
							} else {$(e).find(".fold.collapsed").removeClass("collapsed").addClass("expanded");	}	
						});
						
					}
				}
				,close : {
					classes : "close"
					,text : "{FORM.TOOLTIP.CLOSE}"
					,click : function() {this.close();}
				}
			};
		}
		,initBreadCrumb : function() {
			return _ui.drawBreadCrumb(this.elements.breadcrumb,{companycode : this.options.companycode,appcode : this.options.appcode, page : this.options.breadcrumb},this.script);
		}
		,initIconActions: function() {
			var _self = this
				,_dread = ["link","undock","copy","fold","close"] /*조회 일때*/
				,_dedit = ["fold","close"] /* 편집일때 */
				,_undockhide = ["undock"] /* 새창일때 숨김*/
				,_disable = this.options.disableicon ? $.isArray(this.options.disableicon) 
							? this.options.disableicon : this.options.disableicon.split(",") : [];
			if(_disable.length > 0 && _disable[0].trim() == "") {_disable = [];}
			if($(this.elements.iconactions).size() == 0) {return;}
			
			var _vicons = this.options.isedit == true ? _dedit : _dread
				,_iconSet = $ep.LangConvertObject(this.iconSet(),"text")
				,_icons = $ep.Array(_vicons).datafilter(function(idx,val) {
				if (_disable.length > 0 && $ep.Array(_disable).isMember(val)) {return null;}
				if (!$ep.dock() && $ep.Array(_undockhide).isMember(val)) {return null;}
				return _iconSet[val];
			});
			
			if($.isEmptyObject(_icons)) {return;}
			
			var _$icon = $(this.elements.iconactions);
			_$icon.empty();
			var _$h = $('<ul class="iconset"></ul>'),_$l;
			$.each(_icons, function(idx,o) {
				var _o = o;
				var _l = '<li>';
				_l += '<span class="icon'+ ( o.classes ? ' '+ o.classes : '' ) + '"' + ( o.text ? (' title="' + o.text + '"') : '') + '></span>';
				_l += '</li>';
				_$l = $(_l).appendTo(_$h);
				_o.click && _$l.off("click")
						.on("click",function(){_o.click && _o.click.call(_self,this);});
				_o.run && _o.run.call(_self,_$l);  
			});
			_$l.find("span").addClass("last");
			_$icon.append(_$h);
		}
		,url : function(){	
			return _ui.getPageHref();
		}
		,direct : function(argv) {
			return _util.directURL(this.url(),argv,{langpack : this.script ? this.script.LANGPACK : "" , langprefix : this.script ? this.script.LANG : ""});
		}
		,getBodyElement : function() {	return $(this.elements.editor);}
		,setEditorHtml : function(html) {
			var _self = this;
			if(!_self.api["editor"]) {return;}
			_self.api["editor"].setHTML(html);
		}
		,getEditorHtml : function(mergeHeader) {
			// KEditorv2는 validateSubmit에서 처리함 
			var _html = this.api["editor"].saveHTML(this);			
			_html = (mergeHeader === false ? _html : _doc._mergeHeader.call(this,_html));
			_html = _util.removeTag(_html,"script","");
			_html = _html.replace(/id=[\"]?ep_richbody[\"]?/gi,"id=\"ep_innerbody\"");
			_html = _html.replace(/(javascript)\:/gi, "$1" + ";"); // 문서 submit시  javascript: 문구가 차단됨.
			return _html;
		}
		,editDocument : function(argv) {
			var _uri = $.CURI(this.url(),argv);
			_uri.cmd("editdocument");
			_ui.loadPageLang(_ui.active(),_uri.url,this.script);
		}
		,validateSubmit : function(complete,cnt, _icFlag) {
			var _self = this,_cnt = typeof cnt == "undefined" ? 0 : cnt + 1;
			if(_self.hasEditor) {
				if(!_self.initEditor)  {if(_cnt < 100) { setTimeout(function() {_self.validateSubmit(complete,_cnt);},10);return;}}
				if(!_self.initEditor) {	$ep.util.toast($ep.LangString("EDITOR.INITERROR"),1000);return;	}
				if(_self.api["editor"] && _self.api['editor'].kEditorV2Instance){
					_self.api['editor'].kEditorV2Instance.getSaveHtml().then(
						function(html){
							var _html = _self.api['editor'].saveHTML(_self, html);
							_html = _doc._mergeHeader.call(_self,_html);
							_html = _util.removeTag(_html,"script","");
							_html = _html.replace(/id=[\"]?ep_richbody[\"]?/gi,"id=\"ep_innerbody\"");
							_html = _html.replace(/(javascript)\:/gi, "$1" + ";"); // 문서 submit시  javascript: 문구가 차단됨.
							var _body = $("INPUT[name=body_editor]",_self.elements.form);
							if(_body.size() == 0 ) {
								_body = $('<input type="hidden" name="body_editor">').appendTo(_self.elements.form);
							}
							_body.val(_html); 
							complete();
						}
					);
					return;
				}
				try{
					if(!_icFlag && this.api["editor"] && this.api["editor"].imageControl){
						var _ic = this.api["editor"].imageControl;
						if(!_ic.isJavaAvailable && _ic.isChrome42 && _ic.uploadBodyImageNoneApplet){
							_ic.uploadBodyImageNoneApplet(_ic.editorDoc, function(){
								_self.validateSubmit(complete,_cnt, true);
							});
							return;
						}
					}
				}catch(_ice){}
				var _body = $("INPUT[name=body_editor]",_self.elements.form);
				if(_body.size() == 0 ) {
					_body = $('<input type="hidden" name="body_editor">').appendTo(_self.elements.form);
				}
				_body.val(_self.getEditorHtml()); 
			} 
			complete();
		}
		,doValidate : function() {
			var _self = this,_validate = _ui.getValidator(),_tmp = {},_msg = "",_result = true;//,_recd = [];			
			$("[validtype]",_self.element).each(function() {
				var __type = $(this).attr("validtype");if(__type == "") {return true;}
				var __name = $(this).attr("name");
				if(__name == "") {return true;}
				if((__type == "radio" || __type=="checkbox") && _tmp[__name]) { return true;} else {_tmp[__name] = true;}
				var __o = {	
					element : $(this).is(":radio,:checkbox") ? $("[name=" + __name + "]",_self.element) : $(this),
					name : __name,
					message : _self.script.LangPatternString($(this).is("[invalidmsg]") ? $(this).attr("invalidmsg") : _validate[__type][1]),
					label : _self.script.LangPatternString($(this).is("[validlabel]") ? $(this).attr("validlabel") : ""),
					validate : _validate[__type][0]
				};
				var __v = _ui.validator.call(_self,__o);
				if(__v[0] == false) {_msg+=(_msg ? "\n" : "")+__v[1];_result = false;}});
			
			_self.options.validator && $.each(_self.options.validator, function(_idx,_o) {
				var _ele = $('[name=' + _idx + ']',	_self.element);
				if(_ele.size() ==  0) {return true;}
				var __o = {	name : _idx,element : $(_ele)};
				_o.type && (__o.validate = _validate[_o.type][0]);_o.type && (__o.message = _validate[_o.type][1]);
				_o.validate && (__o.validate = _o.validate);
				_o.message && (__o.message = _o.message);
				_o.label && (__o.label = _o.label);
				_o.target && (__o.target = (_o.target instanceof jQuery ? _o.target : $(_o.target,_self.element))); 
				__o.message = _self.script.LangPatternString(__o.message);
				var __v = _ui.validator.call(_self,__o);
				if(__v[0] == false) {_msg+=(_msg ? "\n" : "")+__v[1];_result = false;}});

			if(_result === false) {
				var _fold = $(".extendible",this.element)
					,_isexpanded = _fold.is(':visible');
				!_isexpanded && $(_fold).show("fast");
				_util.toast(_msg.replace(/\n/g,"<br>"),"click",function() {
					$(".invalid",_self.element).first().focus();
				},{"textAlign" : "left","width":"450px","marginLeft":"-250px","lineHeight" : "21px"});
			}
			return [_result,_msg];
		}
		
		,undock : function(argv){
			var _t = $.CURI()
				,_argv = argv;
			var _Apply = this.trigger("beforeundock");
			if(_Apply) {$.extend(_argv,_Apply);}
			return _util.openPage(this.url(),_argv,{},$.extend(_t.arguments,{langpack : this.script ? this.script.LANGPACK : "" , langprefix : this.script ? this.script.LANG : ""}));
		} 
		,submit : function(isvalidate) {
			var _self = this,_blockmsg = null,_delay = _util.delay();			
			function _before() {
				_delay.run(function() { _blockmsg = _util.blockUI({ message : $ep.LangString("$CORE.TEXT.SUBMITTING") });},500);
				if(_self.options.attachment && _self.api.attachment) {
					_self.api.attachment.submit().done(function(post,delfiles) {
						var _post = post;
						//console.log('post')
						//console.log(post);
						delfiles && delfiles.length > 0 && $.each(delfiles, function(_idx,_val) {
							//console.log(_val)
							$('<input>').attr({name : '$detach',value : _val	,type : "hidden"}).appendTo(_self.elements.form);
						});
						$('input[name="%%File"]',_self.elements.form).remove();
						post && $.each(_post,function(_idx,_val) {
							$('<input>').attr({
								name : '$attach'+_idx  
								,value : _val
								,type : "hidden"
							}).appendTo(_self.elements.form);
						});						
						_submit();
					})
					.fail(function() {
						_delay.clear();
						_blockmsg && _blockmsg.unblock();
						_util.toast($ep.LangString("$CORE.UPLOADER.UPLOADINGFAIL"),"click");
						
					})	;
				} else {
					_submit();
				};
			};
			function _submit() {
				$(_self.elements.form).ajaxSubmit({
				 	iframe: _self.options.postIframe === "undefined" ? false : _self.options.postIframe
					,	dataType : _self.options.resultType || "text"
					,	cache: false
					,	beforeSubmit: function(arr,form,options) {
							
						}
					,	success : function(data,status,xhr,form) {
							_delay.clear();
							if(_self.trigger("afterSubmit",xhr,data,_blockmsg) == false) {return;}
							_blockmsg && _blockmsg.unblock();
							return;
						}
					,	error: function(xhr,textStatus) {
							_delay.clear();
							if(_self.trigger("afterSubmitError",xhr,xhr.responseText,_blockmsg) == false) {return;}
							_blockmsg && _blockmsg.unblock();
							return;
						}
					, complete : function(xhr , status) {
						if (xhr.responseText != "") {}
					} 
					
				})
				.data("jqxhr")
				.done(function(data,status,xhr){})
				.fail(function(xhr,status) {});
			};	
			if(_self.trigger("beforeSubmit") === false) {return;}
			if(isvalidate !== false && !this.doValidate()[0]) {return;}  
			this.validateSubmit(_before);			
		}

		,close : function() {
			this._forceClose = true;
			if(!$ep.dock() && $ep.embed() == false) {top.window.close();return;}
			if($ep.embed()) {this.reload();return ;}
			var _url = $.CURI(_ui.getReferer());
			_ui.loadPageLang(_ui.active(),_url.url,this.script);
		} 
		,reload : function() {
			var _uri = $.CURI(_ui.getPageHref());
			return _ui.loadPageLang(_ui.active(),_uri.url,this.script);			
		}
		,destroy : function() {
			var _self = this;
			_self.trigger("unloadpage");
			_self.unbindWindowUnload();
			_self.initEditor && _self.api["editor"] && _self.api.editor.destroy();
			_self.trigger("destroy");
			_self.buttons && _self.buttons.destroy();
			_self.buttons = null;
			this.elements = {
					form : null
					,buttonbar : null
					,iconactions : null
					,breadcrumb : null
			};
			this.elements = null;
			this.script = null;
			this.options = null;
			this._super("destroy");
			//_log(this.moduleName,"destroy");
		}
	};
	/*
	 *  문서 첨부 
	 *  
	 */
	$ep.ui.doc.attachment = function(sel,options,jx) {
		var _$sel =  $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.doc.attachment.method.moduleName)) {return _$sel.data($ep.ui.doc.attachment.method.moduleName);}
		var _method = $.extend({},$ep.ui.doc.attachment.method);
		_method.script = jx || $ep; 
		_method.options = options;
		_method.Deferred  = null;
		return _inheritSuper(_$sel,$ep.ui.doc.attachment,_method);
	};
	$ep.ui.doc.attachment.method = $ep.ui.doc.attachment.prototype = {
		moduleName : "ep.ui.doc.attachment",
		create : function() {
			$(this.element).addClass("attachment");
			if(this.options.mode !== "edit" && this.options.dataset.length == 0) {return;}
			if(this.options.mode !== "edit") {
				if(!($.isArray(this.options.dataset) && this.options.dataset.length > 0)) {return;}

				/*
				switch(this.options.mode) {
					case "read_tooltip":this._initTooltip();break;
					case "read_span":this._initSpan();break;
				}
				*/
				if (this._mode() == "pluginXAM") {
					this._loadXAMScrpt();
				} else {
					switch(this.options.mode) {
						case "read_tooltip":this._initTooltip();break;
						case "read_span":this._initSpan();break;
					}					
				}
				return;
			}
			//this.api = this._mode() == "activex" ?	this._initActiveX() : this._initBlueimp();
			if (this._mode() == "pluginXAM") {
				this._loadXAMScrpt();	
			} else if (this._mode() == "activex") {
				this.api = this._initActiveX();
			} else {
				this.api = this._initBlueimp();
			}
		}
		,_loadXAMScrpt : function() {
			var _self = this, c_KAMPATH = '/res/core/kam', att_id = 'attachment-uploadcontrol';
			if(this.options.mode !== "edit") $(this.element).html('');
			$ep
			.css(c_KAMPATH + '/css/bootstrap.css' + (window.ePortalConfig && window.ePortalConfig['static_ver']?'?_ver=' + window.ePortalConfig['static_ver']:''))
			.script(c_KAMPATH + '/js/xam.main.js' + (window.ePortalConfig && window.ePortalConfig['static_ver']?'?_ver=' + window.ePortalConfig['static_ver']:''))
			.wait(function(){
				$(_self.element).attr('id', att_id);
				_self.api = _self._initXAM();
			});
		}
		,_readHtml : function(ele,api) {
			var _self = this,_opt = this.options,_dataset = _opt.dataset
				,_cont = ele.filter(".file-cont"),_file = ele.filter(".ep-epfile")
				,_apitip = api;

			$.each(_dataset, function() {
				var _h = '<span class="ep-file">';
				_h += '<span class="file_icon ' + $.fileext.getExt(this.name) + '"></span>';
				_h += '<span class="file_name">' + this.name + '</span>';
				_h += '<span class="file_size">(' + this.size.toSize() + ')</span>';
				_h += '</span>';
				$(_h).appendTo(_file).data("file",this);
			});	
			
			return ele
				.on("click",".file_name", function() {
					var _data = $(this).closest(".ep-file").data("file");
					setTimeout(function() { _self.download(_data);},50);})
				.on("click",".bt-down-all", function() {
					var _list = _file.find(".file_name"); 
					if(_self._mode() == "activex") {_apitip && _apitip.hide();_self.api("StartDownload");return;}
					_list.trigger("click");							
				});
		}
		,_initSpan : function(){
			var _self = this,_opt = _self.options;
			$(this.element).addClass("read_span");
			var _html = $('<span class="attach_title"><p class="ep-icon attachment"></p>' + _opt.i18n.Attachments + '<span class="bt-down-all excludecopy">('+_opt.i18n.AllDownload+')</span></span><span class="ep-epfile"></span>');
			_self._readHtml(_html);
			$(this.element).html(_html);
			this._mode() == "activex" && (this.api = this._initActiveX());
		}
		,_initTooltip : function(){
			var _self = this,_opt = _self.options,_ele = $(".tooltip",this.element); 
			_self._mode() == "activex" && (_self.api = _self._initActiveX());  
			_ele.qtip({ 
				overwrite : true,
				content : {
					text : function(e,api) {
						var _html = $('<span class="ep-epfile tooltip"></span><span class="file-cont"><span class="bt-down-all">'+_opt.i18n.AllDownload+'</span><span class="bt-close">'+_opt.i18n.Close+'</span></span>')
							,_api = api;
						_self._readHtml(_html,_api);
						return $(_html)	.on("click",".bt-close",function() {_api.hide();});
					}					
				},
				position : {
					//at : 'bottom left',my : 'top center',
					at : 'bottom left',my : 'top left',
					target : $(".title",_ele),
					adjust : { method: "shift flip" ,x : 5 ,y : 0,screen:true }, 
					viewport: true
					
				}
				,show: {
					solo : true,
					event: 'click',
					effect : function() {$(this).slideDown("fast");}
				} 
				,hide : {
					delay : 600,
					fixed:true, 
					event : "unfocus",effect : function() {$(this).slideUp("fast");}
				}
				,style : { 
					classes: 'qtip-shadow attachment_tooltip',minWidth : "400px" /*,width : "320px" ,height : "335px"*/
					,tip : { classes : "ui-icon ui-icon-closethick ", corner: true ,width : 9 ,height : 9 ,offset : -148 }
				}
			});
		}
		,download : function(data) {
			var _filename = $.type(data) == "string" ? data : data.name 
				,_url = this._getUrl(data);/*$.type(data) == "object" ? $.type(data.url) ? data.url : this._getUrl(_filename) : this._getUrl(_filename)*/ ;
			var _$iframe = $('<iframe src="' + _url + '" style="width:1px;height:1px;"></iframe>').appendTo("body"); 
			setTimeout(function() {_$iframe.remove();},2000);
		}
		,_getUrl : function(data,hashost) {
			var _uri = null;
			
			if($.type(data) == "object" &&  $.type(data.url)) {_uri = $.CURI(data.url)}
			else {_uri = $.CURI((this.options.base||"") + "/" + encodeURIComponent($.type(data) == "object" ? data.name : data));	}
			
			return hashost ? _uri.full : _uri.url;
		}
		,_unique : function() {return Math.random().toString().substr(2,10);}
		,_mode : function() {
			//return $ep.util.browser.msie ? "activex" : "plugin"
			//return $ep.util.browser.msie ? "activex" : "pluginXAM"
			
			// 통합테스트 전용 소스 (실서버 적용 시 리마크 처리)
			//console.log(window._PILOT_USER)
			if (window._PILOT_USER&&window._PILOT_USER=='yes') {
				return "pluginXAM"
			} else {
				return $ep.util.browser.msie ? "activex" : "plugin"
			}
			// 실서버 적용 시 하기 리마크 제거
			//return "pluginXAM"
		}
		,_initActiveX : function() {
			var _target = $(this.element);
			$(this.element).addClass("activex");
			if(this.options.mode !== "edit") {
				_target = $('<span style="display:inline-block;position:absolute;top:0px;left:0px;width:1px;height:1px;"></span>').appendTo(this.element);
			}
			var _self = this
				,_activex = '<OBJECT width="100%" height="100%" id="fmpap" codeBase="/res/core/comm/ocx/fmp_ap.cab#version=1,1,1,2" ' + 
			' 	classid="clsid:34A0E7E8-8421-413a-B367-45C5EA1933AA" class="excludecopy">'+ 
			'	<PARAM NAME="CodePage" VALUE="65001">'+
			'	<PARAM NAME="UserLimit" VALUE="' + (this.options.userlimit||"200,10") + '">'+
			'	<PARAM NAME="ServerName" VALUE="http://'+ document.location.hostname + '">'+
			'	<PARAM NAME="ServerPort" VALUE="80">'+
			'	<PARAM NAME="PackageName" VALUE="K-Potal Attach Manager">'+
			'	<PARAM NAME="ColorFrameBk" VALUE="#FFFFFF">'+
			'	<PARAM NAME="ColorNormalText" VALUE="#615C1C">'+
			'	<PARAM NAME="ColorNotifyText" VALUE="#615C1C">'+
			'	<PARAM NAME="ColorBtnBkIn" VALUE="#E3E1C5">'+
			'	<PARAM NAME="ColorBtnFgIn" VALUE="#615C1C">'+
			'	<PARAM NAME="ColorBtnBkOut" VALUE="#DCE7ED">'+
			'	<PARAM NAME="ColorBtnFgOut" VALUE="#615C1C">'+
			'	<PARAM NAME="ColorBtnLTBorder" VALUE="#DDDAAA">'+
			'	<PARAM NAME="ColorBtnRBBorder" VALUE="#C9C39C">'+
			'	<PARAM NAME="MsgErrNoti" VALUE="">'+
			'	<PARAM NAME="SystemName" VALUE="">'+
			'	<PARAM NAME="CtrlType" VALUE="DOMINO">'+
			'	<PARAM NAME="Prefix" VALUE="">'+
			'	<PARAM NAME="StartIdx" VALUE="0">'+
			'	<PARAM NAME="AM_Width" VALUE="'+ $(this.element).width() + '">'+
			'	<PARAM NAME="EnableLargeFile" VALUE="0">'+
			'	<PARAM NAME="FServerName" VALUE="'+ document.location.hostname + '">'+
			'	<PARAM NAME="FServerPort" VALUE="0">'+
			'	<PARAM NAME="LargeFileSize" VALUE="-1">'+
			'	<PARAM NAME="LargeFileUnderSize" VALUE="-1">'+
			'	<PARAM NAME="LargeFileEDate" VALUE="2015/01/27">'+
			'	<PARAM NAME="RestrictedExt" VALUE="cgi;php;exe;asp;aspx;jsp;dll;pl;bat;sh">'+
			'	<PARAM NAME="RestrictedName" VALUE="">'+
			'</OBJECT>'; 
			 
			$(_target).html(_activex);
			this._com = _self.activeXMethods();
			setTimeout(function(){_self._initDataset();},20);
			return _self.activexApply;
		}
		,_initDataset : function() {
			var _self = this,_opt = this.options,_dataset = _opt.dataset || [];
			_self.api("SetAction","http://" + document.location.hostname + this.options.url);
			if(!$.isArray(_dataset) || _dataset.length == 0) {return;}
			$.each(_dataset,function() {
				_opt.mode == "edit" &&	_self.api("AddAttachedFileLink",this.name,this.size,_self._getUrl(this,true));
				_opt.mode !== "edit" &&	_self.api("AddDownloadFile",this.name,this.size,_self._getUrl(this,true));
			});
		}
		,_initBlueimp : function(){var _self = this;$(this.element).epupload(this.options);return this.pluginApply;	}
		,_initXAM : function(){var _self = this;$(this.element).xamupload(this.options);return this.pluginXAMApply;	}
		,activeXMethods : function() {
			var _com = $("#fmpap",this.element)[0];
			return  {
				AddAttachedFileLink 	: function(name,size,url) {return _com.AddAttachedFileLink(name,size,url);}
				,AddNewFile 			: function(){return _com.AddNewFile();}
				,GetNewAttachmentCount 	: function(){return _com.GetNewAttachmentCount();}
				,GetAttachFilesCount	: function() {return _com.GetAttachFilesCount();}  //기존/신규 포함 첨부 카운트
				,IsAttachingFile		: function(i) {return _com.IsAttachingFile(i);}  	//첨부 여부
				,GetAttachFileName		: function(i) {return _com.GetAttachFileName(i);}  	//첨부 파일 명
				,GetAttachFileSize		: function(i) {return _com.GetAttachFileSize(i);}  	//첨부 파일 사이즈
				,GetAttachTotalBytes	: function(){return _com.GetAttachTotalBytes();}
				,GetDelAttachmentCount	: function(){return _com.GetDelAttachmentCount();} // 삭제 체크된 첨부수
				,GetDelAttachmentName	: function(i){return _com.GetDelAttachmentName(i);} // 삭제 체크된 첨부 명 (index)
				,SetAction				: function(url){return _com.SetAction(url);} // Upload Post URL
				,SetReferer				: function(referer){return _com.SetReferer(referer);} // Referer Header 추가
				,AddPostData 			: function(type, name, value) {return _com.AddPostData(type, name, value);}/* Post Data  type : "file", name : "%%File" -> 신규첨부 수 만큼 생성*/
				,StartUpload			: function(){return _com.StartUpload();} // Upload 시작
				,GetResponse 			: function(){return _com.GetResponse();} // 응답 String 반환
				,option					: function(){}
				,AddDownloadFile		: function(strName,dwSize,strUrl) {return _com.AddDownLoadFile(strName,dwSize,strUrl);}
				,getDelFiles			: function() {
					var _delcnt = this.api("GetDelAttachmentCount"),_delfiles = [];
					if (_delcnt > 0) {for(var _i=0;_i<_delcnt;_i++) {	var _tmp = this.api("GetDelAttachmentName",_i);_tmp && _delfiles.push(_tmp);}};
					return _delfiles;
				}
				,getAllFileNames		: function() {
					var _cnt = this.api("GetAttachFilesCount")	,_delfiles = this.api("getDelFiles"),_idx = 0	,_result = [];
					while(_cnt > 0) {
						var _fname = this.api("GetAttachFileName",_idx);
						if(!_fname) {break;}
						if(_fname && !$ep.Array(_delfiles).isMember(_fname)) {_result.push(_fname);	_cnt--;}
						_idx++;
					}
					return _result;
				}
				,StartDownload			: function(ele) {return _com.StartDownload();	}
				,submit 				: function() {
					var _self = this,_promise = new $.Deferred();
					$.each(_self.options.formData,function(idx,val) {_self.api("AddPostData","hidden",idx,val);});					
					/*var _delcnt = _self.api("GetDelAttachmentCount"),_delfiles = [];
					if (_delcnt > 0) {for(var _i=0;_i<_delcnt;_i++) {	var _tmp = _self.api("GetDelAttachmentName",_i);_tmp && _delfiles.push(_tmp);}};*/
					var _delfiles = _self.api("getDelFiles");
					var cnt = _self.api("GetNewAttachmentCount");
					if(cnt ==0) {_promise.resolve("",_delfiles);return _promise.promise();}
					for(var x=0;x < cnt;x++) {	this.api("AddPostData","file","%%File."+x,"");}
					_self.api("StartUpload");
					var _result = this.api("GetResponse");
					if(_result.trim() == "") { 
						_promise.reject("NORESPONSE",""); } 
					else {
						var __result = null;	
						try {__result = $.parseJSON(_result);} catch(e) {_promise.reject("PARSEERROR",e);return _promise.promise();}
						_promise.resolve(__result,_delfiles);
					};					
					return _promise.promise();	
				}
			}; 
		}
		,activexApply : function(method) {
			if(!this._com) {return;}
			return typeof this._com[method] !== "undefined" ? this._com[method].apply(this,Array.prototype.slice.call(arguments,1)) : undefined; 
		}
		,pluginApply : function(method) {return this.element.epupload.apply(this.element,arguments);}
		,pluginXAMApply : function(method) {return this.element.xamupload.apply(this.element,arguments);}
		,submit : function() {
			//this.options.formData.unique = this._unique();
			
			var _tmpunique = this._unique();
			var _xamiframe = $("iframe",this.element);
			if (_xamiframe.length!=0) {
				var ifr_doc = _xamiframe[0].contentWindow;
				if (ifr_doc._XAM) _tmpunique = ifr_doc._XAM.args.attachunique
			}
			this.options.formData.unique = _tmpunique;
			
			this.api("option","formData.unique",this.options.formData.unique);			 
			return this.api("submit");			
		}
		,getAllFileNames : function() {return this.api("getAllFileNames");}
		,destroy : function() {
			$(".tooltip",this.element).is("[data-hasqtip]") && $(".tooltip",this.element).qtip("destroy",true); 
			$(this.element).is(".ep-epupload") && $(this.element).epupload("destroy");
			this._com && delete this._com; 
			this._super("destroy");
		}
	};
	
	/*
	 * organ protected property
	 */
	
	var _organ = {
		_children : function() {
			var _self = this,_opt = _self.options;
			function _callback(_d,iscon) {
				if(!_self.tree) {return;};
				_self.tree.getRootNode().addChildren(
						iscon === false ? _d : _organ._convertViewEntry.call(_self,_d));	
				return;
			};
			
			if(typeof _opt.children === "function") {
				var _data = _opt.children.call(_self,_opt.root ? _opt.root : undefined,_callback);
				return _data ? _data.viewentry ? _organ._convertViewEntry.call(_self,_data) : _data : undefined;
				
			} else if (typeof _opt.children === "object" || $.isArray(_opt.children)) { 
				return  _opt.children.viewentry ? _organ._convertViewEntry.call(_self, _opt.children) : _opt.children; 
			}
			return _organ._initTreeNodes.call(_self,_opt.root ? _opt.root : undefined);			
		}
		,_convertViewEntry : function(_d,opt) { /* display options 빼고 모두 적용. */
			var _r = null,_self = this,_opt = opt || _self.options;
			if(!_d) {return _r;};
			var _entries = _d.viewentry ? _d.viewentry : $.isArray(_d) ? _d : null;
			if(!_entries) {return _d;};	
			_r = [];
			$.each(_entries,function() {
				var __r = this.entrydata ? _organ._convertEntry.call(_self,this.entrydata) : this;
				var _compItem = _opt.item;
				if(typeof _compItem == "function") {_compItem = _compItem(__r);}				
				
				// 임시
				if (__r["type"] == "PC") {
					__r["title"] = _compItem ? _compItem.title ? _util.patternCompletion(_compItem.title, __r) : __r["InternetAddress"] : __r["InternetAddress"];
					__r["tooltip"] = _compItem ? _compItem.tooltip ? _util.patternCompletion(_compItem.tooltip, __r) : __r["InternetAddress"] : __r["InternetAddress"];
				} else {
					__r["title"] = _compItem ? _compItem.title ? _util.patternCompletion(_compItem.title, __r) : __r["name"] : __r["name"];
					__r["tooltip"] = _compItem ? _compItem.tooltip ? _util.patternCompletion(_compItem.tooltip, __r) : __r["title"] : __r["title"];
				}

				if(typeof _opt.itemRender === "function") {if(_opt.itemRender.call(_self,__r) === false){return true;};}
				if(typeof _opt.filter === "function") {if(!_opt.filter(__r)) {return true;}}
				if(__r) {_r.push(__r);}
			}); 
			return _r;
		}
		,_convertEntry : function(_entry) {
			var _r = null;if(!_entry) {return _r;};_r = {};
			if($.isArray(_entry)) {
				$.each(_entry,function(idx,val) {
					var _key =this["@name"].replace(/^_/g,"")
						,_data =(this["text"] || this["datetime"] ||(this["datetimelist"] ? this["datetimelist"]["datetime"][0] : "")|| this["number"] || this["textlist"]["text"][0]); 
					_r[_key] = _data[0];
				});				
			} else {
				$.each(_entry,function(idx,val) {
					if(idx.match(/^@/g)) {return true;}
					var _key =idx.replace(/^_/g,"")
						,_data =val;
					_r[_key] = _data;
				});
			} 
			return _r;
		}
		,_getOrganURI : function(_key,opt){
			var _opt = opt || this.options ;
			return $.CURI(
					_opt.view ? _opt.view.match(/^\//g) ? _opt.view : 
						 $ep._CONST.PATH.ORG +  (_opt.viewtype == "readviewentries" ? "/" + _opt.view + "?readviewentries" :  "/api/data/collections/name/" + _opt.view) :
							$ep._CONST.PATH.ORG  + (_opt.viewtype == "readviewentries" ? "/byorgan_tree_all?readviewentries" : "/api/data/collections/name/byorgan_tree_all")
					,_opt.viewtype == "readviewentries" ? {restricttocategory : _key ? _key : "company",outputformat : "json" ,count : "9999"} : {category : _key ? _key : "company",ps : $ep._CONST.DATASERVICEMAXVIEWENTRIES}
			);
					
		}
		/*
		,_getOrganURI : function(_key,opt){
			var _opt = opt || this.options ;
			return $.CURI(
					_opt.view ? _opt.view.match(/^\//g) ? _opt.view : 
						(_opt.server ? ("/"+ _opt.server) : "") + $ep._CONST.PATH.ORG +  (_opt.viewtype == "readviewentries" ? "/" + _opt.view + "?readviewentries" :  "/api/data/collections/name/" + _opt.view) :
							(_opt.server ? ("/"+ _opt.server) : "") + $ep._CONST.PATH.ORG  + (_opt.viewtype == "readviewentries" ? "/byorgan_tree_all?readviewentries" : "/api/data/collections/name/byorgan_tree_all")
					,_opt.viewtype == "readviewentries" ? {restricttocategory : _key ? _key : "company",outputformat : "json" ,count : "9999"} : {category : _key ? _key : "company",ps : $ep._CONST.DATASERVICEMAXVIEWENTRIES}
			);
					
		}
		*/
		,_initTreeNodes : function(_key,_callback) {
			var _self = this,_opt = _self.options, _result = null
				,dfd = new $.Deferred()
				,_uri = _organ._getOrganURI.call(_self,_key);
			_util.ajax({type:"get",async : true, url : _uri.url})
			.done(function(_data,txt,xhr) {
				if(!_self.element) {return;}
				_result = _organ._filter.call(_self,_data); 
				if(_callback) _callback(_result,false); 
				dfd.resolveWith(this, [_result ? _result : [],txt,xhr]);})
			.fail(function(xhr,txt,err) {dfd.rejectWith(this,[[],txt,xhr]);});
			return dfd.promise(); 
		}
		,_LazyRead : function(ctr,node) {
			var _self = this,_opt = _self.options,_node = node;
			if(!_opt) {return;}
			function _callback(_d,iscon) {
				_node.node.resetLazy(); 
				_node.node.addChildren(iscon === false ? _d ? _d : []  : _organ._convertViewEntry.call(_self,_d) );
				_node.node.setStatus("ok");
				if(_node.node.hasChildren()) {_node.node.setExpanded();} 
				return;
			};   
			if(typeof _opt.LazyRead === "function") {
				var _data = _opt.LazyRead.call(_self,_node,_callback); 
				return _data ? _organ._convertViewEntry.call(_self,_data) : undefined; 
			}
			return _organ._initTreeNodes.call(_self,_node.node.data.code); 
		}
		,_filter : function(_d) {
			var _r = null,_self = this,_opt = _self.options;
			if(!_d) {return _r;};
			var _each = _opt.viewtype !== "readviewentries" ? _d : _d.viewentry;
			if(!_each) {return _r;}
			//if(_opt.viewtype !== "readviewentries") {return _organ._restfilter.call(_self,_d);}			
			//if(!_d.viewentry) {return _r;};	
			_r = [];
			//$.each(_d.viewentry,function() {
			$.each(_each,function() {
				var __r = _organ._parse_org.call(_self,_opt.viewtype !== "readviewentries" ? this : this.entrydata);
				if(!__r) {return true;}
				if(typeof _opt.itemRender === "function") {if(_opt.itemRender.call(_self,__r) === false){return null;};} 
				if(typeof _opt.filter === "function") {if(!_opt.filter(__r)) {return true;}}
				__r = (_opt.display == "team" && __r["type"] != "D" ? undefined : __r); /* display options filtering*/ 
				if(__r) {_r.push(__r);}
			});
			return _r;
		}
/*		,_restfilter : function(_d) {
			var _r = null,_self = this,_opt = _self.options;
			if(!_d) {return _r;};
			_r = [];
			$.each(_d,function(idx,o) {
				var __r = _organ._parse_org.call(_self,o);
				if(!__r) {return true;}
				if(typeof _opt.itemRender === "function") {if(_opt.itemRender.call(_self,__r) === false){return null;};} 
				if(typeof _opt.filter === "function") {if(!_opt.filter(__r)) {return true;}}
				__r = (_opt.display == "team" && __r["type"] != "D" ? undefined : __r);  display options filtering 
				if(__r) {_r.push(__r);}
			});
			return _r;
		}*/
		,_parse_org : function(_entry) {
			
			var _self = this, _opt = _self.options, _r = null;
			if(!_entry) {return _r;}
			_r = _organ._convertEntry(_entry);
			switch(_r["type"]) {
			case "D":   /* 부서/팀 */
				//_r["icon"] = "/wise/common/images/gwcontent/ico_dept.png";
				_r.folder = true;
				/*_r.lazy = _opt.display == "team" && parseInt(_r["childs"],10) > 0 ? true : 
							_opt.display != "team"  && parseInt(_r["childs"],10) + parseInt(_r["members"],10) > 0 ? true : false ;*/
				_r.lazy = true;
				if(_opt.select == "person") {
					_r["unselectable"] = true; 
					_r["hideCheckbox"] = true;
				}
				_r["key"] = _r["code"];
				break;
			case "P":  /* 직원 */
				//_r["icon"] = "/wise/common/images/gwcontent/ico_per.png";
				if(_opt.select == "team") {
					_r["unselectable"] = true;
					_r["hideCheckbox"] = true;
				}
				_r["key"] = _r["orgcode"] + "_" + _r["empno"];
				_r["duty"] = _r["duty"] && _r["duty"].replace(/\(.*\)/g,"");
				_r["eduty"] = _r["eduty"] && _r["eduty"].replace(/\(.*\)/g,"");
				_r["post"] = _r["post"] && _r["post"].replace(/\(.*\)/g,"");
				_r["epost"] = _r["epost"] && _r["epost"].replace(/\(.*\)/g,"");
				break;
			}
			var _compItem = _opt.item;
			if(typeof _compItem == "function") {_compItem = _compItem(_r);}
			_r["title"] = _compItem ? _compItem.title ? _util.patternCompletion(_compItem.title, _r) : _r["name"] : _r["name"];
			
			/* tooltop 변경 */
			if (_r["type"] == "PM"||_r["type"] == "PC") {
				_r["tooltip"] = _r["InternetAddress"];
			} else {
				_r["tooltip"] = _compItem ? _compItem.tooltip ? _util.patternCompletion(_compItem.tooltip, _r) : _r["title"] : _r["title"];
			}
			
			//if(typeof _opt.itemRender === "function") {if(_opt.itemRender.call(_self,_r) === false){return null;};}
			return _r;
		}
		,_resultHandle : function(resultCallback,data) {
			var _self = this /* dialog onOK callback;*/
				,_opt = _self.options
				,_result = data || _self.getSelectedData();
			if(typeof resultCallback === "function") {if(resultCallback.call(_self,_result) === false) {return false;};}
			if(_opt.resultset) {_organ._resultsetHandle.call(_self,_result);}
			return true;
		}
		,_resultsetHandle : function(_data) {
			var _self = this 				,_opt = _self.options				,fieldset = _opt.resultset
				,_dat = _data;			
			$ep.Array(fieldset).datafilter(function(__idx,__dat) {
				if(!__dat) {return null;}
				if(!__dat.element) {return null;}
				var _element = typeof __dat.element === "function" ? __dat.element.call(_self) : $(__dat.element);
				var _sel = $(_element)
					,_pattern = __dat.pattern
					,_type = __dat.type
					,_express = __dat.expression
					,_recdsep = __dat.seperate
					,_sep = $.extend({},_opt.resultsetSeperate,_recdsep);
				
				if(!_sel) {return null;}
				if(_sel.size() == 0) {return null;}
				if(_type) {
					switch(_type) {
					case "grid":
						if(!$(_sel).hasClass("ep-epgrid")) {return null;}
						$(_sel).epgrid("removeAll");
						$(_sel).epgrid("addData",_data);
						break;
					case "organgrid":
						if(!$(_sel).hasClass("ep-eporgangrid")) {return null;}
						var _inst = $ep.ui.organ.grid(_sel);
						if(!_inst) {return null;}
						_inst.removeAll();
						_inst.addData(_data);
						break;
					}
				}

				var _f = null;
				if(typeof _express === "function") {
					_f = _express.call(_self,_dat) ;
				} else {
					_f = $ep.Array(_data).datafilter(
						function(___idx,___dat) {	
							return _pattern ? _util.patternCompletion(typeof _pattern === "function" ? _pattern(___dat) : _pattern ,___dat) :
										_self.toData.call(_self,___dat).string(
												_sep ? 	_sep.field ? _sep.field : undefined : undefined);});					
				}
				
				$(_sel).val(_f ? $ep.Array(_f).isArray() ? _f.join(_sep ?_sep.record ? _sep.record : $ep._CONST.SEPERATE.record : $ep._CONST.SEPERATE.record) : _f  : "" );
			});
				
		}
		 
		/*,_makequery : function(_f,_q) {
			var _self = this, _opt = _self.options, _sopt = _opt.search
				,_fopt = _sopt.selectbox[_f]; 
			return  _fopt.format ? _util.expression(_fopt.format,{query : _q}) : typeof _fopt.expression == "function" ? _fopt.expression.call(_self,_f,_q) : _q;
		}*/
		,_gridfilter : function(_d) {
			var _r = null,_self = this,_opt = _self.options;if(!_d) {return _r;};_r = [];		
			$.each(_d,function() {
				var __r = _organ._parse_org.call(_self,this); 
				if(!__r){return true;}
				if(typeof _opt.itemRender === "function") {if(_opt.itemRender.call(_self,__r) === false){return true;};}
				if(typeof _opt.filter === "function") {if(!_opt.filter(__r)) {return true;}}
				if(__r["unselectable"] === true) {return true;} 
				__r = (_opt.display == "team" && __r["type"] != "D" ? undefined : __r); /* display options filtering*/ 
				if(__r) {_r.push(__r);}
			});
			return _r;
		} 
		,_organOptions : function(type,opt,callback) {
			var _self = this,__opt = opt,_resultCallBack = callback;
			return {
				"single" : {
					
						content : "/res/core/comm/html/organ/organ.single.html"
						,title : __opt.title || "{$CORE.ORGAN.TITLE.SINGLE}"
						,organType : "single" 
						,height : __opt.height || 600 ,width : __opt.width || 400
						,activetab : __opt.activetab || "tab1"
						,resultset : __opt.resultset || undefined
						,resultsetSeperate : __opt.resultsetSeperate || undefined
						,resizable : true
						,server : __opt.server || "" //대표서버
						,display : __opt.display || "all"
						,select : __opt.select || "all"
						,tabs : {
							organ : {
								title : "{$CORE.ORGAN.TAB.ORGAN}"
								,url : "/res/core/comm/html/organ/organ.tab.organtree.html"
								,initPage : false  /*초기화 작업을 URL에서 처리.*/
								,tree : {
									root : __opt.root || ""
									,view : "byorgan_tree_all" 
									,display : __opt.display || "all"
									,select : __opt.select || "all"
									,server : __opt.server || "" //대표서버
									,expandTree : __opt.expandTree || ""
									,itemRender : __opt.treeItemRender || undefined
									,filter : __opt.filter
									,clickFolderMode : __opt.clickFolderMode ? __opt.clickFolderMode : 1
									,selectMode : __opt.selectMode ? __opt.selectMode : undefined
									,checkbox : false 
									//,radio : (__opt.radio === false ? false : __opt.radio || true) //기본값은 false Single이니까
									,radio : true
									,item : __opt.treeItemExpression || function(data) {
										return { 
											title : data.lang == $ep.lang() ? "{name} [ - {post}]" : data.ename ? "{ename} [ - {epost}]" : "{name} [ - {post}]"
											,tooltip : /*data.lang == $ep.lang() ?*/"{name} [ - {post}]"/* : data.ename ? "{ename} [ - {epost}]" : "{name} [ - {post}]"*/
										};
									}
									,dblclick : function(ctr,data) { 
										if(data.node.unselectable) {return;}
										if(data.node.folder && this.options.select != "team") {return;} 
										var _dlg = this.api.dialog;
										if(!_dlg) {return;}
										data.node.setSelected(true);
										return false;
									}
									,search : _organ._organSearchOptions({radio : (__opt.radio === false ? false : __opt.radio || true)}) 
								}
							}
							,pubgroup : __opt.pubgroup == true ? _organ._organPubGroup($.extend(true,{radio : true, checkbox : false},__opt)) : undefined
							,pergroup : __opt.pergroup == true ? _organ._organPerGroup(__opt) : undefined
							,peraddr : __opt.peraddr == true ? _organ._organPerAddr(__opt) : undefined
						} 
						,buttons : { 
						   OK : {
								text : "{$CORE.ORGAN.BUTTON.OK}"
								,highlight : true
								,click : function() {
									if(_organ._resultHandle.call(_self,_resultCallBack) === false) {return;} 
									$(this).epdialog("close");
								}
							}
						    ,CANCEL : {text : "{$CORE.ORGAN.BUTTON.CANCEL}",click : function() {$(this).epdialog("close");}}
						}
				}
				,"multiple" : {
					content : "/res/core/comm/html/organ/organ.multiple.html"				
					,title : __opt.title || "{$CORE.ORGAN.TITLE.MAIL}"
					,organType : "multiple"   /* custom, single, multiple*/
					,height : __opt.height||550 ,width : __opt.width||870
					,position: __opt.position 
					,resizable : __opt.resizable 
					,draggable : __opt.draggable
					,display : __opt.display || "all"
					,select : __opt.select || "all"
					//,modal : __opt.modal
					,initValue : __opt.initValue || ""
					,activetab : __opt.activetab || "tab1"
					,server : __opt.server || "" //대표서버
					,resultset : __opt.resultset || undefined
					,resultsetSeperate : __opt.resultsetSeperate || undefined
					//,close : __opt.close
					,tabs : {
						organ : {
							title : "{$CORE.ORGAN.TAB.ORGAN}"
							,url : "/res/core/comm/html/organ/organ.tab.organtree.html"
							,initPage : false  /*초기화 작업을 URL에서 처리.*/
							,tree : {
								root : __opt.root || ""
								,view : "byorgan_tree_all" 
								,display : __opt.display || "all"
								,select : __opt.select || "all"
								,server : __opt.server || "" //대표서버
								,expandTree : __opt.expandTree || ""
								,itemRender : __opt.treeItemRender || function(data) {
									if(data.type == "D" && data.orgcode == "") {
										data["unselectable"] = true;
										data["hideCheckbox"] = true;
									}
								}
								,filter : __opt.filter								 
								,clickFolderMode : __opt.clickFolderMode ? __opt.clickFolderMode : 1
								,selectMode : __opt.selectMode ? __opt.selectMode : undefined
								,checkbox : __opt.checkbox || true 
								,radio : (__opt.radio === false ? false : __opt.radio || false) //기본값은 false Single이니까
								,item : __opt.treeItemExpression || function(data) {
									return { 
										title : data.lang == $ep.lang() ? "{name} [ - {post}]" : data.ename ? "{ename} [ - {epost}]" : "{name} [ - {post}]"
										,tooltip :/* data.lang == $ep.lang() ?*/ "{name} [ - {post}]" /*: data.ename ? "{ename} [ - {epost}]" : "{name} [ - {post}]"*/
									};
								}
								,dblclick : function(ctr,data) { 
									if(data.node.unselectable) {return;}
									if(data.node.folder && this.options.select != "team") {return;} 
									var _dlg = this.api.dialog;
									if(!_dlg) {return;}
									data.node.setSelected(true);
									return false;
								}
								,search : _organ._organSearchOptions() 
							}
						}
						,pubgroup : __opt.pubgroup == true ? _organ._organPubGroup(__opt) : undefined
						,pergroup : __opt.pergroup == true ? _organ._organPerGroup(__opt) : undefined
						,peraddr : __opt.peraddr == true ? _organ._organPerAddr(__opt) : undefined
					}
					,tabchange : function(tabid,tabopt) {
						if(tabid=="organ") {
							$("#btndetail",this.element).epbutton("show");
						} else {
							$("#btndetail",this.element).epbutton("hide");
						}
					}
					,bindActions : {
						btnadd : {
							text : "{$CORE.ORGAN.BUTTON.BTNADD} &gt;"
							,show:true
							,classes : "organ-multiple-btn"
							,click : function() {
								var _act = this.getActive();
								if(_act.options.issearch && _act.api.search) {_act = _act.api.search;}
								var _d = this.getActiveSelectedData();
								if(!_d) {return;}
								if(!_d.name) { _d.name = _d.notesid;}
								_d && this.api.results.addData(_d) && _act.unselectedAll();
								
							} 
						}						
						,btndetail : {
							text : "{$CORE.ORGAN.BUTTON.BTNDETAIL}"
							,show:true
							,highlight : true
							,click : function() {
								var _self = this, _act = this.getActive();
								if(_act.options.issearch && _act.api.search) {_act = _act.api.search;}
								var _d = this.getActiveSelectedData();
								if(!_d) {return;}
								if(__opt.detailInfo) { __opt.detailInfo(_d);return;}
								$.each(_d,function() {
									if(this.type === "P") {
										_ui.userDetail(this.notesid,_self.options.server);
										return false;
									}
								});
								
							} 
						}
						,btndelete :{
							text : "{$CORE.ORGAN.BUTTON.BTNDELETEALL}"
							,show : true
							,click : function(){
								//return this.api.results.removeSelected();
								return this.api.results.removeAll();
							}
						}
					} 
					,results : {
						element : "#results.organ-multiple-result"
						,type : "organgrid"	
						,organgrid : {
							keycode : "notesid"
							,isduplicate :true
							,duplicate : {
								message : "{$CORE.ORGAN.TEXT.DUPLICATEDEXCLUDED}",type : "toast",delay: {delay:1500,event : "click"}
							}
							,draggable : true
							,hideheader : true 
							,classes : "orgType"
							,selectType : ""
							,dataset : __opt.dataset 
							,headers : [
							   { id : "display" , label : "{$CORE.ORGAN.GRID.NAME}", css : {"padding-left" : "5px"}
							   	 ,expression : function(td,colset,data) {
							   		 var _pattern = data.type == "P" || data.type == "D" ? data.lang != $ep.lang() ? data.ename ? "{ename}[/{eorgname}]" : "{name}[/{orgname}]" : "{name}[/{orgname}]" : 
							   			 '{name}';
							   		 return _util.patternCompletion(_pattern,data);
							   	 }							   	 
							   } 
							   ,{ id : "up" , width : "23px"
								   ,expression : function(td,colset,data) {
									  var _self = this,_td = td;
									  return $('<span style="padding:5px;"><span class="ep-icon up"></span></span>').on("click",function(e){
										   e.stopPropagation();
										   $(_self).epgrid("selectedUp",_td.closest(".ep-epgrid-item"));
									  });
								  }
							   }
							   ,{ id : "down" , width : "23px"
								   ,expression : function(td,colset,data) {
									   var _self = this, _td = td;
									  return $('<span style="padding:5px;"><span class="ep-icon down"></span></span>').on("click",function(e){
										   e.stopPropagation();
										   $(_self).epgrid("selectedDown",_td.closest(".ep-epgrid-item"));
									  });
									}
							   }
							   ,{ id : "delete" , width : "23px" , css : {textAlign:"center"}
								  ,expression : function(td,colset,data) {
									  var _self = this, _td = td;
									  return $('<span style="padding:5px;"><span class="ep-icon cancel"></span></span>').on("click", function(e) {
										  e.stopPropagation();
										  $(_td).closest(".ep-epgrid-item").fadeOut(300,function() {$(this).remove();});
									  });
								  }
							   }
							]
						}
					}
					,buttons : { 
					   OK : {
							text : "{$CORE.ORGAN.BUTTON.OK}"
							,highlight : true
							,click : function() {
								if(_organ._resultHandle.call(_self,_resultCallBack) === false) {return;} 
								$(this).epdialog("close");
							} 
						}
					    ,CANCEL : {text : "{$CORE.ORGAN.BUTTON.CANCEL}",click : function() {$(this).epdialog("close");}}
					}
				}
				,"custom" : {
					
				}
			}[type];
		}
		,_organSearchOptions : function(_opt) {
			return {
				type : "grid"
				,target : ".ep-organ-tab-search .ep-organ-search"
				,grid : {
					keycode : "key"
					,isduplicate :false
					,draggable : false
					,classes : "orgType"
					,selectType : _opt ? _opt.radio == true ? "radio" : "checkbox" : "checkbox" 
					/*,itemRender : function(data) {
						if(data.type == "D" && data.orgcode == "") {
							data["unselectable"] = true;
							data["hideCheckbox"] = true;
						}
					}*/
					,headers : [
						{ id : "icon" , label : "", 	width : "26px",  css : {"text-align":"left"}
							,expression : function(td,colset,data) {return $('<span class="ep-icon"></span>').addClass(data.type == "D" ? "organ-s" : "person-s");}
						}
					   ,{ id : "name" , label : "{$CORE.ORGAN.GRID.NAME}", 	width : "120px",  hcss : {"text-align":"left"}
					   	 ,expression : function(td,colset,data) {return $ep.lang() == data.lang ? data.name : data.ename;}
					   } 
					   ,{ id : "post" , label : "{$CORE.ORGAN.GRID.POST}", width : "70px", hcss : {"text-align":"left"}
					   	,expression : function(td,colset,data) {return $ep.lang() == data.lang ? data.post : data.epost;}}
					   ,{ id : "orgname" , label : "{$CORE.ORGAN.GRID.TEAM}", width : "*" 
						  ,expression : function(td,colset,data) {
							  return data.type == "D" ? $ep.lang() == data.lang ? data.company : data.ecompany 
									  : $ep.lang() == data.lang ? data.orgname : data.eorgname; 
							 // return $ep.lang() == data.lang ?  data.orgname : data.eorgname;
						  }
					   }
					   
					]
				}
			}
		}
		,_organSearchQuery : function(q,comp) {
			var _v = q
				,_comp = comp
				,_query = $ep.util.patternCompletion(
							'[&#91;eCompany&#93;="{ename}" AND &#91;companycode&#93;="{companycode}" AND ]'+
							'(&#91;korname&#93;="{query}" OR &#91;korname&#93;="{query}&#42;" OR '+
							'&#91;engname&#93;="{query}" OR &#91;engname&#93;="{query}&#42;" OR ' + 
							'&#91;groupname&#93;="{query}" OR &#91;groupname&#93;="{query}&#42;" OR ' + 
							'&#91;groupengname&#93;="{query}" OR &#91;groupengname&#93;="{query}&#42;" OR '+ 
							'&#91;teamname_1&#93;="{query}" OR &#91;teamname_1&#93;="{query}&#42;" OR '+
							'&#91;teamname_2&#93;="{query}" OR &#91;teamname_2&#93;="{query}&#42;" OR '+
							'&#91;teamname_3&#93;="{query}" OR &#91;teamname_3&#93;="{query}&#42;" OR '+
							'&#91;eteamname_1&#93;="{query}" OR &#91;eteamname_1&#93;="{query}&#42;" OR '+
							'&#91;eteamname_2&#93;="{query}" OR &#91;eteamname_2&#93;="{query}&#42;" OR '+
							'&#91;eteamname_3&#93;="{query}" OR &#91;eteamname_3&#93;="{query}&#42;"' +
							')'
							,$.extend({query : _v},_comp)
					).replace(/&#91;/g,"[").replace(/&#93;/g,"]").replace(/&#42;/g,"*");
			return _query;
		}
		,_organNameQuery : function(q,comp,opt) {
			var _v = q,_comp = comp	,_pattComp = $ep.util.patternCompletion	,_disp = opt ? opt.select ? opt.select : "all" : "all"
				,_qquery = function(_qv,_qt) {	
					var _qq = _qt == "user" ?  '&#91;form&#93;="user" AND ' : '&#91;form&#93;="group" AND '	,_qvv = "";
					$.each(_qv, function(_,__) {_qvv && (_qvv += " OR ");
					_qvv += _pattComp(_qt == 'user' ? '&#91;korname&#93;="{query}" OR &#91;korname&#93;="{query}&#42;" OR &#91;engname&#93;="{query}" OR &#91;engname&#93;="{query}&#42;"' : '&#91;groupname&#93;="{query}" OR &#91;groupname&#93;="{query}&#42;" OR &#91;groupengname&#93;="{query}" OR &#91;groupengname&#93;="{query}&#42;"',{query : __});});
					return _qq + _qvv;
				},_q = "";
			_comp && (_q = _pattComp('[&#91;eCompany&#93;="{ename}" AND &#91;companycode&#93;="{companycode}" AND ]',_comp));			
			_q += (_disp == "all" ? "((" + _qquery(_v,"user") + ") OR (" + _qquery(_v,"team") + "))" : _disp == "team" ? "(" + _qquery(_v,"team") + ")" : _disp == "person" ? "(" + _qquery(_v,"user") + ")" : "((" + _qquery(_v,"user") + ") OR (" + _qquery(_v,"team") + "))" );
			return _q.replace(/&#91;/g,"[").replace(/&#93;/g,"]").replace(/&#42;/g,"*");
		}
		,_organPubGroup : function(__opt) {
			return {
				title : "{$CORE.ORGAN.TAB.GROUPMAIL}"
				,url : "/res/core/comm/html/organ/organ.tab.pubgroup.html"
				,initPage : false  /*초기화 작업을 URL에서 처리.*/
				,tree : {
					view : "byorgan_tree_groupmail" 
					,server : __opt.server || "" //대표서버
					,expandTree : __opt.expandTree || ""
					,itemRender : function(_r){
						switch(_r.type) {
						case "M":
							_r["lazy"] = true;
							_r["folder"] = true;
							_r["unselectable"] = true; 
							_r["hideCheckbox"] = true;
							break;
						case "G":
							_r["key"] = _r["code"];
							break;
						}
					}
					,checkbox : typeof __opt.checkbox == "undefined" ? true : __opt.checkbox  
					,radio : typeof __opt.radio == "undefined" ? false : __opt.radio
					,item : __opt.treeItemExpression || function(data) {
						return {
							title : data.lang != $ep.lang() ? data.ename ? "{ename}" : "{name}" : "{name}" 
							,tooltip :  data.lang != $ep.lang() ? data.ename ? "{ename}" : "{name}" : "{name}"
						};
					}
					,dblclick : function(ctr,data) { 
						if(data.node.unselectable) {return;}
						if(data.node.folder && this.options.select != "team") {return;} 
						var _dlg = this.api.dialog;
						if(!_dlg) {return;}
						data.node.setSelected(true);
						return false;
					}
					//,search : _organ._organSearchOptions() 
				}
			};
		}
		,_organPerGroup : function(__opt) {
			return {
				title : "{$CORE.ORGAN.TAB.PERGROUP}"
				,url : "/ngw/core/lib.nsf/organ.tab.pergroup.html?open"
				,initPage : false
				,tree : {
					root : "pergroup"
					,server : __opt.server || "" //대표서버
					,itemRender : function(_r){
						switch(_r.type) {
						case "PG":
							_r["lazy"] = true;
							_r["folder"] = true;
							_r["key"] = _r["notesid"];
							_r["name"] = _r["notesid"];
							_r["title"] = _r["notesid"];
							break;
						case "PM":
							_r["key"] = _r["notesid"];
							_r["name"] = _r["notesid"];
							_r["title"] = _r["notesid"];
							break;
						}
					}
					,clickFolderMode : __opt.clickFolderMode ? __opt.clickFolderMode : 1
					,selectMode : __opt.selectMode ? __opt.selectMode : undefined
					,checkbox : true 
					,dblclick : function(ctr,data) { 
						if(data.node.unselectable) {return;}
						if(data.node.folder && this.options.select != "team") {return;} 
						var _dlg = this.api.dialog;
						if(!_dlg) {return;}
						data.node.setSelected(true);
						return false;
					}
				} 
			}
		}
		,_organPerAddr : function(__opt) { /*type = PC */
			return {
				title : "{$CORE.ORGAN.TAB.PERADDR}"
				,url : "/ngw/core/lib.nsf/organ.tab.peraddr.html?open"
				,initPage : false
				,grid : {
					keycode : "key"
					,isduplicate :false
					,draggable : false
					,selectType : "checkbox"
					,headers : [
					   { id : "name" , label : "{$CORE.ORGAN.GRID.NAME}", 	width : "80px",  hcss : {"text-align":"left"}
						,expression : function(td,colset,data) {return data.name.toEscape();}
					   } 
					   ,{ id : "email" , label : "{$CORE.ORGAN.GRID.TEAM}", width : "*", hcss : {"text-align":"left"}
					   /*,{ id : "email" , label : "EMail", width : "*", hcss : {"text-align":"left"}*/
					   	,expression : function(td,colset,data) {return (data.title||data.notesid).toEscape();}}
					   /* 	,expression : function(td,colset,data) {return (data.altname||data.notesid).toEscape();}} */
					   /*	,expression : function(td,colset,data) {return (data.altname||data.notesid).toEscape();}}*/
					   /*,{ id : "orgname" , label : "{$CORE.ORGAN.GRID.TEAM}", width : "50px" 
						  ,expression : function(td,colset,data) {return data.orgname.toEscape();}}*/
					]
				}
			};
		}
		
	};
	
	/*  
	 * 	$ep.ui.organ  
	 *  ** options ** 
	 *   
	 *	content						String			Y	조직도 선택 기본 UI를 가진 html 파일 경로
	 *	title						String			N	조직도 선택창의 title
	 *	height						Integer			Y	조직도 창의 높이
	 *	width						Ingeter			Y	조직도 창의 넓이
	 *	resizable					Boolean			N	창 사이즈 고정
	 *	draggable					Boolean			N 	이동.
	 *	buttons						Object Array	N	Dialog 버튼.(jquery dialog button과 같음.)
	 *	organType					String			N	single,multiple,custom  - 기본값은 single
	 *	getResultData				Function		N	custom 모드에서 선택값을 반환 하기 위한 callBack 함수
	 *													grid나 여러 데이터를 배열에 취합하여 반환 하면 결과callback에 반영 된다.
	 *	activetab					String			Y	기본 활성 tab 지정
	 *  tabchange 					Function		Y	function(tabid,taboption)
	 *	tabs						Object			Y	조직도 tree 탭 정보
	 *		initPage				Boolean			Y	false (고정 False로 )
	 *		title					String			Y	탭의 title
	 *		url 					String			Y 	탭의 URL
	 *		tree					List Object		Y	탭내의 tree 정보 설정.
	 *			root				String			N	root Node를 지정한다. ("S"를 지정하면 )
	 *			view				String			N	Tree데이터를 로드할 URL을 지정 한다."byorgan_tree_all" 
	 *													"/" 부터 지정하면 절대 URL로 간주 하고 "/" 없으면 조직도 DB의 View명으로 간주 함.
	 *			display				String			N	all,team
	 *			select				String			N	all,team,person
	 *			expandTree			String			N	기본 펼침 경로
	 *			itemRender			Function		N	Tree아이템을 그리기전 데이터를 변형 할 수 있음.(rowdata)
	 *			filter				Function		N	Tree아이템을 그리기전 데이터를 필터링 함.
	 *			clickFolderMode		Integer			N	jquery fancytree 의 clickFolderMode와 동일.
	 *			checkbox			Boolean			N	tree 선택을 checkbox형태로
	 *			radio				Boolean			N	tree 선택을 radio 형태로
	 *			source				Function
	 *								Object			N	tree Data를 CallBack이나 Object로 받을 수 있음.
	 *													function(rootcode,callback);
	 *													비동기 결과값은 callback을 통해 data를 넘긴다.
	 *			LazyRead			Function
	 *			item				Object			N	tree 표시 형식을 정의 함.
	 *				- title			String			N	tree title 지정
	 *				- tooltip		String			N	tree tooltip 지정.
	 *			dblclick			Function		N	(tree,node) , return이 false이면 기본 기능 중단.
	 *			search				Object			N	검색 설정(grid options)
	 *			selectMode			Boolean			N	fancytree 기본 옵션
	 *			init				Function		N	fancytree init  Event Callback 발생
	 *	bindActions					List Array		N	조직도내 각 버튼에 대한 설정.(ui.ep.button)
	 *	results						Object			Y	결과 Instance
	 *  	element : 결과에 Element
	 *  	type : "mailtree"	유형.
	 *  			- duplicate(data) - return true이면 cancel
	 *  			- duplicated(orig,data) return true이면 continue
	 *  	tree 
	 */
	$ep.ui.organ = function(options,jx) {
		var _method = $.extend({},$ep.ui.organ.method);
		_method.options = $.extend(true, {
			content : "/res/core/comm/html/organ/organ.multiple.html"
			,organType : "multiple"   /* custom, single, multiple*/
			,getResultData :   undefined /* organType이 custom 모드 일때 동작 */				
			,height : 550 ,width : 870
			,activetab :"tab1"
			,tabs : { 
				organ : {
					title : "{$CORE.ORGAN.TAB.ORGAN}"
					,url : "/res/core/comm/html/organ/organ.tab.organtree.html"
					,initPage : false  /*초기화 작업을 URL에서 처리.*/
					,tree : {
						root : ""
						,view : "byorgan_tree_all" 
						,display :"all"
						,select : "all"
						,server : "" //대표서버
						,expandTree :  ""
						,itemRender : function(data) {
							if(data.type == "D" && data.orgcode == "") {
								data["unselectable"] = true;
								data["hideCheckbox"] = true;
							}
						}
						,clickFolderMode : 1
						,checkbox : true 
						,item : function(data) {
							return { 
								title : data.lang == $ep.lang() ? "{name} [ - {post}]" + (data.duty?' [&#91;{duty}&#93;]':'') : data.ename ? "{ename} [ - {epost}]" + (data.eduty?' [&#91;{eduty}&#93;]':'') : "{name} [ - {post}]" + (data.duty?' [&#91;{duty}&#93;]':'')
								,tooltip :/* data.lang == $ep.lang() ?*/ "{name} [ - {post}]" + (data.duty?' [&#91;{duty}&#93;]':'') /*: data.ename ? "{ename} [ - {epost}]" : "{name} [ - {post}]"*/
							};
						}
						,dblclick : function(ctr,data) { 
							if(data.node.unselectable) {return;}
							if(data.node.folder && this.options.select != "team") {return;} 
							var _dlg = this.api.dialog;
							if(!_dlg) {return;}
							data.node.setSelected(true);
							return false;
						}
						,search : _organ._organSearchOptions() 
					}
				}
			}
			,tabchange : function(tabid,tabopt) {
				if(tabid=="organ") {
					$("#btndetail",this.element).epbutton("show");
				} else {
					$("#btndetail",this.element).epbutton("hide");
				}
			}
/*			,bindActions : null 
			,results : null
			,buttons : null*/
		},options);
		_method.script = jx || $ep;
		return _inheritSuper(undefined,$ep.ui.organ,_method);
	};
	$ep.ui.organ.method = $ep.ui.organ.prototype = {
		moduleName : "ep.ui.organ"
		,create : function() {
			var _self = this;
			_self.pattern =  {
					DEFMASK : $ep._CONST.ORG_DEF_MASK 
					,D : null /* type이 D일때 */
					,P : null /* type이 P일때 */
			}			
		}
		,setResultPattern : function(type,pattern) {
				if(!type) {return;}
				this.pattern[type] = pattern;
				return;
		}
		,mailSelect : function(opt,resultCallBack){
			var _self = this 
				,__opt = opt ? typeof opt === "object" ? opt : {} : {}
				,_resultCallBack = typeof opt === "function" ? opt :  typeof resultCallBack === "function" ? resultCallBack : undefined
				,_opt = {
					content : "/res/core/comm/html/organ/organ.mail.html"
					,title : __opt.title || "{$CORE.ORGAN.TITLE.MAIL}"
					,organType : "mailtree"   /* custom, single, multiple,mailtree*/
					,height : __opt.height||550 ,width : __opt.width||870
					,position: __opt.position 
					,resizable : __opt.resizable 
					,draggable : __opt.draggable
					,modal : __opt.modal
					,initValue : __opt.initValue || ""
					,activetab : __opt.activetab || "tab1"
					,close : __opt.close
					,tabs : {
						organ : {
							title : "{$CORE.ORGAN.TAB.ORGAN}"
							,url : "/res/core/comm/html/organ/organ.tab.organtree.html"
							,initPage : false  /*초기화 작업을 URL에서 처리.*/
							,tree : {
								root : __opt.root || ""
								,dragndrop : true
								,view : "byorgan_tree_all" 
								,display : __opt.display || "all"
								,select : __opt.select || "all"
								,server : __opt.server || "" //대표서버
								,expandTree : __opt.expandTree || ""
								,itemRender : __opt.treeItemRender || function(data) {
									if(data.type == "D" && data.orgcode == "") {
										data["unselectable"] = true;
										data["hideCheckbox"] = true;
									}
								}
								,filter : __opt.filter
								,clickFolderMode : __opt.clickFolderMode ? __opt.clickFolderMode : 1
								,selectMode : __opt.selectMode ? __opt.selectMode : undefined
								,checkbox : __opt.checkbox || true 
								,radio : (__opt.radio === false ? false : __opt.radio || false) //기본값은 false Single이니까
								,item : __opt.treeItemExpression || function(data) {
									var _tooltip = '';
									if (data.type == "D") {
										_tooltip = "{name} [ - {post}]" + (data.duty?' [[{duty}]]':'');
									} else {
										_tooltip = "{email}";
									}
									
									return { 
										title : data.lang == $ep.lang() ? "{name} [ - {post}]" + (data.duty?' [&#91;{duty}&#93;]':'') : data.ename ? "{ename} [ - {epost}]"  + (data.eduty?' [&#91;{eduty}&#93;]':'') : "{name} [ - {post}]" + (data.duty?' [&#91;{duty}&#93;]':'')
										,tooltip : _tooltip
									};
								}
								,dblclick : function(ctr,data) { 
									if(data.node.unselectable) {return;}
									if(data.node.folder && this.options.select != "team") {return;} 
									var _dlg = this.api.dialog;
									if(!_dlg) {return;}
									data.node.setSelected(true);
									return false;
								}
								,search : _organ._organSearchOptions() 
							}
						}
						,pubgroup : __opt.pubgroup != false ? _organ._organPubGroup(__opt) : undefined
						,pergroup : __opt.pergroup != false ? _organ._organPerGroup(__opt) : undefined
						,peraddr : __opt.peraddr != false ? _organ._organPerAddr(__opt) : undefined
					}
					,tabchange : function(tabid,tabopt) {
						if(tabid=="organ") {
							$("#btndetail",this.element).epbutton("show");
						} else {
							$("#btndetail",this.element).epbutton("hide");
						}
					}
					,bindActions : {
						btnto : {
							text : "{$CORE.ORGAN.BUTTON.BTNTO} &gt;"
							,show:true
							,classes : "organ-mail-btn"
							,click : function() {
								var _act = this.getActive();
								if(_act.options.issearch && _act.api.search) {_act = _act.api.search;}
								var _d = this.getActiveSelectedData();
								_d && this.api.results.addChildrenByKey("to",_d) && _act.unselectedAll();
								
							} 
						}
						,btncc : {
							text : "{$CORE.ORGAN.BUTTON.BTNCC} &gt;"
							,show:true
							,classes : "organ-mail-btn"
							,click : function() {
								var _act = this.getActive();
								if(_act.options.issearch && _act.api.search) {_act = _act.api.search;}
								var _d = this.getActiveSelectedData();
								_d && this.api.results.addChildrenByKey("cc",_d) && _act.unselectedAll();
							} 
						}
						,btnbcc : {
							text : "{$CORE.ORGAN.BUTTON.BTNBCC} &gt;"
							,show:true
							,classes : "organ-mail-btn"
							,click : function() {
								var _act = this.getActive();
								if(_act.options.issearch && _act.api.search) {_act = _act.api.search;}
								var _d = this.getActiveSelectedData();
								_d && this.api.results.addChildrenByKey("bcc",_d) && _act.unselectedAll();
							} 
						}
						,btndetail : {
							text : "{$CORE.ORGAN.BUTTON.BTNDETAIL}"
							,show:true
							,classes : "organ-mail-btn organ-detail"
							,click : function() {
								var _act = this.getActive();
								if(_act.options.issearch && _act.api.search) {_act = _act.api.search;}
								var _d = this.getActiveSelectedData();
								if(!_d) {return;}
								__opt.detailInfo && __opt.detailInfo(_d);
							} 
						}
						,btndelete :{
							text : "{$CORE.ORGAN.BUTTON.BTNSELECTEDDEL}"
							,show : true
							,click : function(){
								this.api.results.removeSelectedNodes();
								//removeSelectedNodes
							}
						}
					} 
					,results : {
						element : "#result_recipients"
						,type : "mailtree"	
						,mailtree : {
							item : __opt.resultItemExpression || function(data) {
								return {
									title : data.lang != $ep.lang() ? data.ename ? "{ename}[/{eorgname}]" : "{name}[/{orgname}]" : "{name}[/{orgname}]"
									,tooltip : /*data.lang != $ep.lang() ? data.ename ? "{ename}[/{epost}][/{eorgname}]" :*/ "{name}[/{orgname}]"/* : "{name}[/{post}][/{orgname}]"*/
								};
							}
							,duplicate : __opt.duplicate || undefined
							,duplicated : function(orig,dup) {
								_util.toast($ep.LangString("$CORE.ORGAN.TEXT.DUPLICATED"),600);
								return false;
							}
							,dataset : __opt.dataset || ""
						}
					}
					,buttons : { 
					   OK : {
							text : "{$CORE.ORGAN.BUTTON.OK}"
							,highlight : true
							,click : function() {
								if(_organ._resultHandle.call(_self,_resultCallBack) === false) {return;} 
								$(this).epdialog("close");
							} 
						}
					    ,CANCEL : {text : "{$CORE.ORGAN.BUTTON.CANCEL}",click : function() {$(this).epdialog("close");}}
					}
			};
			$.extend(true, _self.options, _opt);
			/* 번역 */
			this.script.LangConvertObject(this.options,"title,text,message");
			this._initDialog();
		}
		,singleSelect : function(opt,resultCallBack) {
			var _self = this 
				,__opt = opt ? typeof opt === "object" ? opt : {} : {}
				,_resultCallBack = typeof opt === "function" ? opt :  typeof resultCallBack === "function" ? resultCallBack : undefined
				,_opt = _organ._organOptions.call(_self,"single",__opt,_resultCallBack);
			$.extend(true, _self.options, _opt);
			/* 번역 */
			this.script.LangConvertObject(this.options,"title,text,message"); 
			this._initDialog(); 
		}
		,multipleSelect : function(opt,resultCallBack){
			var _self = this 
				,__opt = opt ? typeof opt === "object" ? opt : {} : {}
				,_resultCallBack = typeof opt === "function" ? opt :  typeof resultCallBack === "function" ? resultCallBack : undefined
				,_opt = _organ._organOptions.call(_self,"multiple",__opt,_resultCallBack);
			$.extend(true, _self.options, _opt);
			this.script.LangConvertObject(this.options,"title,text,message"); 
			this._initDialog(); 
		}
		,customSelect : function(opt){
			var __opt = opt ? typeof opt === "object" ? opt : {} : {};
			$.extend(true,this.options,{
				tabs : {
					pubgroup : __opt.pubgroup != false ? _organ._organPubGroup(__opt) : undefined,
					pergroup : __opt.pergroup != false ? _organ._organPerGroup(__opt) : undefined,
					peraddr : __opt.peraddr != false ? _organ._organPerAddr(__opt) : undefined
				}
			},__opt);
			this.script.LangConvertObject(this.options,"title,text,message"); 
			this._initDialog(); 
		} 
		,_initDialog : function(opt){
			var _self = this,_opt = opt ? opt : _self.options;
			_self.dialog = $ep.ui.organ.dialog.call(_self,_opt,_self.script);
		}
		,getSelectedData : function() {
			var _self = this
				,_odlg = _self.dialog
				,_data = _odlg ? _odlg.getSelectedData() : null;
			return _data;//_organ.toData.call(_self,_data).object();
		}
		,convertEntry :  _organ._convertEntry
		,search : function(type,keyword,opt,resultCallBack) { /* 유저는 이름만 부서는 부서명만 대상으로 검색*/
			var _self = this	,_type = type	,_resultCallBack = resultCallBack;
			if (opt) {$.extend(true, _self.options, _organ._organOptions.call(_self,_type,opt));}
			var _opt = _self.options,_apply = {options : _opt.tabs.organ.tree},_dfd = new $.Deferred();
			this.script.LangConvertObject(this.options,"title,text");
			var _block = null,_delay = _util.delay();
			_delay.run(function() {_block = $ep.util.blockUI({message : $ep.LangString("ORGAN.TEXT.ORGANSEARCHPROGRESS")});},500);
			return $ep.ui.organ.tree.method._doSearch.call(_apply,_organ._organNameQuery(keyword,undefined,_opt), resultCallBack || function(){})
			.done(function(){_delay.clear();_block && _block.unblock();})
			.fail(function() {_delay.clear();_block && _block.unblock();});
		}
		,searchSelect : function(type,keyword,opt,resultCallBack) {
			var _self = this, _dfd = new $.Deferred(),_resultCallBack = resultCallBack
			,_opt = _organ._organOptions.call(_self,type,opt);
			$.extend(true, _self.options, _opt);
			function _resultSuccess(data) {
				var _data = data;
				if(_opt.organType == "multiple" && _opt.results) {
					var _dataset = _opt.results.type && _opt.results[_opt.results.type].dataset
						,__data  = _dataset ? typeof _dataset == "function" ? _dataset.call(_self) : _dataset : [];
					 if(__data) {if($.isArray(__data) && __data.length > 0 ) {_data = __data.concat(_data);}}
				}
				if(_organ._resultHandle.call(_self,_resultCallBack,_data) === false) {return;}
				_dfd.resolve(_data);
			};
			var _keyword = keyword;
			this.search(type,_keyword)
			.done(function(data) {
				var _data = data;
				if(!($.isArray(_data) && _data.length > 1)) {	_resultSuccess.call(_self,_data);return;}
				if(_keyword.length > 1) {
					var _ = {},_l = _keyword.length;					
					$.each(_keyword, function(__x,__v) { _[__v] = {cnt : 0, idx : -1}; });
					$.each(_data, function(__x,__v) {
						if($.isEmptyObject(_)) {return false;}
						$.each(_,function(___k,___v) {
							if(__v["name"].indexOf(___k) > -1 || __v["ename"].indexOf(___k) > -1) {
								___v.cnt++;
								___v.idx = __x;
							}
						});
					});	
					var _ll = 0;
					$.each(_,function(__k,__v) {
						if(__v.cnt == 1) {
							_opt.organType !== "single" && (_data[__v.idx]["selected"] = true);
							_ll++;}
					});
					if(_opt.organType !== "single" && _ll == _l) {_resultSuccess.call(_self,_data);return;}
				}
				_self.selectResults(_data,function(__data) {_resultSuccess.call(_self,__data);});
			})
			.fail(function(data) {
				_util.toast($ep.LangString("ORGAN.ERROR.SEARCHERROR"),"click");
				_dfd.reject(null);
			});
			return _dfd.promise();
		}
		,selectResults : function(data,success,opt) {
			var _self = this,_data = data, _success = success
				,_opt = opt || _self.options,_grid = null;
			_ui.dialog({
				title : $ep.LangString("$CORE.ORGAN.TITLE.SELECTRESULTS")
				,width : 450
				,show : {effect : "fadeIn",duration: 200}
				,position : {my : "center center", at : "center center", of : $(window)}
				,content : {html : '<div class="ep-organ-wrap"></div>'}
				,create : function() {
					var _this = $(this).epdialog("widget").on("keydown",function(e) {
						if(e.which !== $.ui.keyCode.ENTER) {return;}
						e.preventDefault();
						_this.find('.ui-dialog-buttonpane button:first').trigger("click");
					});
				}
				,complete : function() {
					$(this).empty();
					
					_opt.organType == "single" && (_data[0].selected = true);
					var _h = $("<div></div>").appendTo(this);
					_grid = $ep.ui.organ.grid(_h,$.extend(true, _organ._organSearchOptions(_opt.tabs.organ.tree).grid,{
						height: 250
						,dataset : _data
					}));
				}
				,buttons : [
				   { 
					 text : $ep.LangString("$CORE.ORGAN.BUTTON.OK") ,highlight : true
					 ,click : function(){
						var _data = _grid.getSelectedData();
						success && setTimeout(function() { success(_data);},0);
						$(this).epdialog("close");
					 }
				   }
				   ,{ text : $ep.LangString("$CORE.ORGAN.BUTTON.CANCEL") ,click : function() { $(this).epdialog("close"); } }
				]					
			});
			
		}
		,__organ : _organ
		,toData : function(data) { 
			var _self = this,_data = data;
			function _pattern(_d) {
				return (_self.pattern[_d.type] ? _self.pattern[_d.type] : _self.pattern.DEFMASK).split($ep._CONST.SEPERATE.col);
			};
			return {
				"string" : function(fldsep,recdsep) {
					if(!_data) {return null;}
					var _strdata = "";
					if($ep.Array(_data).isArray()) {
						if(_data.length == 0) {return "";}
						_strdata = $ep.Array(_data).datafilter(function(_idx,_dat) {
							return _util.objectToString(_dat,_pattern(_dat), fldsep ? fldsep : undefined);
						}).join(recdsep ? recdsep : $ep._CONST.SEPERATE.field);
					} else {_strdata = _util.objectToString(_data,_pattern(_data), fldsep ? fldsep : undefined);}				 
					return _strdata;
				}
				,"patternString" : function(pattern,sep) {
					var _pattern = pattern,_sep = sep;
					if(!_data) {return null;}
					if(!$.isArray(_data)) {	return _util.patternCompletion(_pattern,_data);	}					
					var _f = $ep.Array(_data).datafilter(
							function(___idx,___dat) {	
								return _util.patternCompletion(_pattern ,___dat);
							}
						);
					return _f ? $ep.Array(_f).isArray() ? _f.join(_sep ?_sep.record ? _sep.record : $ep._CONST.SEPERATE.record : $ep._CONST.SEPERATE.record) : _f : "";					
				}
				,"arrayString" : function(fldsep){
					if(!_data) {return null;}
					var _strdata = [];
					if($ep.Array(_data).isArray()) {
						if(_data.length == 0) {return "";}
						_strdata = $ep.Array(_data).datafilter(function(_idx,_dat) {
							return _util.objectToString(_dat,_pattern(_dat), fldsep ? fldsep : undefined);
						});
					} else {_strdata = [_util.objectToString(_data,_pattern(_data), fldsep ? fldsep : undefined)];}				 
					return _strdata;
				}
				,"object" : function() {
					if(!_data) {return null;}
					var _obj = null;
					if($ep.Array(_data).isArray()) {
						_obj = $ep.Array(_data)
								.datafilter(function(_idx,_dat) {	
									return _util.objectFilter(_dat,_pattern(_dat));
								});
					} else { _obj = [_util.objectFilter(_data,_pattern(_dat))];	}
					return _obj;
				}
			};
		}
	};
	$ep.ui.organ.dialog = function(options,jx) {
		var _method = $.extend({},$ep.ui.organ.dialog.method, {
			options : $.extend(true,{},options)
			,script : jx || $ep
			,api : {
				organ : this
				,tabs : {}
			}
		});
		return _inheritSuper(undefined,$ep.ui.organ.dialog,_method);
	};
	$ep.ui.organ.dialog.method = $ep.ui.organ.dialog.prototype = {
		moduleName : "ep.ui.organ.dialog"
		,create : function(){
			var _self = this
				,_complete = this.options.complete;
			var _$sel = $ep.ui.dialog($.extend(true,this.options,{
					complete : function(e,o) {
						_self.init();
						_complete && _complete.call(this,e,o);
					}
				}),_self.script);
		
			this._super("_create",_$sel); /* ele가 없어서.. */
		}
		,init : function() {
			var _self = this
				,_opt = _self.options;
			
			_self._const = {
					tabs : {
						tabsid : "ep-organ-tabs"
						,contentid : "ep-organ-tabs-content"
					} 
			};
			_self._tab_index = [];
			_self._activetabs = {
					idx : 0
					,panel : null 
			};
			_self.initAction();
			_self.initTabs();
			_self.initResults();
		}
		,initTabs : function(){
			var _self = this, _opt = _self.options;
			if(!_opt.tabs) {return;}
			var _indx = 0, _tabs = $("."+_self._const.tabs.tabsid, _self.element)
				,_tabh = $("<ul></ul>").appendTo(_tabs);
			$.each(_opt.tabs, function(idx,v) {
				if(!v) {return true;}
				if(!v.title) {return true;}
				v._iscomplete = false;
				_self._tab_index[idx] = _indx;
				var _$tab =$("#"+idx, _tabs);
				$('<li><a href="#' + idx + '">' + v.title + '</a></li>').appendTo(_tabh);
				if(_$tab.size()  == 0) { 
					$('<div id="'+idx+'"></div>').appendTo(_tabs).data("tab_option",v).append('<div class="'+ _self._const.tabs.contentid+'"></div>');
				} else {
					_$tab.data("tab_option",v);
					if($("."+_self._const.tabs.contentid,_$tab).size() == 0 ) {_$tab.wrapInner('<div class="'+ _self._const.tabs.contentid+'"></div>');}						
				}			 		
				_indx++;
			});
			
			_self._tabs =$("."+_self._const.tabs.tabsid, _self.element).eptabs({
				activate: function( e, ui ) {
					var _panel = $(ui.newPanel);
					_self._activetabs["panel"] = _panel;
					_self._activetabs["id"] = $(_panel).attr("id"); 
					_self._activetabs["idx"] = $(this).eptabs("option","active");
					_self.initTab(_panel);
				}
				,active : _opt.activetab ? _self._tab_index[_opt.activetab] : 0
			}); 
			_self._activetabs["panel"] = _self._tabs.eptabs("getActivePanel");
			_self._activetabs["id"] = $(_self._activetabs["panel"]).attr("id");
			_self._activetabs["idx"] = $(_self._tabs).eptabs("option","active");	
			_self.initTab(_self._activetabs["panel"]); 
			
		} 
		,initTab : function(panel) {
			var _self = this, _topt = panel.data("tab_option");
			_self.trigger("tabchange",_self._activetabs["id"],_topt); 
			if(_topt._iscomplete === true) {return;}
			_topt.initPage && _topt.tree && _self.initTree(panel);
			_topt.url && this.loadPage(panel);
			_topt._iscomplete = true; 
		}
		,initAction : function(){
			var _self = this,_opt = _self.options;
			if(!_opt.bindActions) {return;}
			$.each(_opt.bindActions, function(idx,val) {
				$("#"+idx,_self.element).epbutton(val, {id :  idx
					,hook : {
						click : function(e,ids,btn) {return btn.click ? btn.click.apply(_self,[e,ids,btn]) : undefined;	}
						,lockclick : function(e,ids,btn,unlock) {return btn.lockclick.apply(_self,arguments);}						
					} 
				});
			});
		}
		,initResults : function(){
			var _self = this, _opt = _self.options;
			if(!_opt.results) {return;}
			_self._$result = $(_opt.results.element,_self.element);
			if(this._$result.size() == 0 ) {return;}
			switch(_opt.results.type) {
			case "mailtree":
				this.api.results = $ep.ui.organ.mailtree.call(_self, _self._$result,_opt.results.mailtree,_self.script);
				break;
			case "organgrid":
				this.api.results = $ep.ui.organ.grid.call(_self, _self._$result,_opt.results.organgrid,_self.script);
				break;
			default:
				if(typeof _opt.results.init !== "function") {return;}
				this.api.results = _opt.results.init.call(_self); 
				break;
			}
		}
		,initTree : function(panel) {
			var _self = this
			,_opt = _self.options	,_panel = panel
			,_tabid = $(_panel).attr("id")
			,_topt = _opt.tabs[_tabid]	,_tree = _topt ? _topt.tree : null
			,__tree = $.extend(true, {
				treePanel : _panel.children("."+_self._const.tabs.contentid)
			}, _tree);
			//$(_panel).data({"api" : {tree :$ep.ui.organ.tree.call(this,__tree)}});  
		}
		,loadPage : function(panel) {
			var _self = this, _topt =panel.data("tab_option") ,_uri = $.CURI(_topt.url,{dialogid : _self.dialogid});
			return $ep.ui.loadPageLang(panel,_uri.url, this.script, {before : function(data) {
				var _data = data.replace(/({\$dialogid\$})/g,_self.options.dialogid),_tabid = $(panel).attr("id");
				return _data.replace(/({\$tabid\$})/g,_tabid);}}); 				
		}		
		/*,getActiveTabOptions : function(tabid) {
			var _self = this
				,_id = tabid || _self._activetabs["panel"].attr("id");
			return _self.getTabPanel(_id).data("tab_option");
		}*/
		,getActiveTab : function(){
			var _self = this, _panel = _self._activetabs["panel"],_id = _panel.attr("id");
			return {
				panel : _panel
				,id : _id
				,idx : _self._activetabs["idx"]
				,options : _panel.data("tab_option")
				,api : _panel.data("tab_api") 
			};
		}
		,getActive : function() {	
			var _act = this.getActiveTab();
			 return  this.api.tabs[_act.id];
		}
		,getTabPanel : function(tabid) {
			return tabid ? $(this._tabs).organtabs("getActivePanel") : $(this._tabs).organtabs("getPanel",tabid);
		}
		,getSelectedData : function() { 
			var _self = this,opt = _self.options;
			return (opt.organType == "single" ?	 _self.getActiveSelectedData() :
					opt.organType == "multiple" ? _self.api.results.getAllData() :
					opt.organType == "mailtree" ? _self.api.results.getResultData() : 
					opt.organType == "custom" ? typeof opt.getResultData === "function" ? opt.getResultData() : null : null) ;
		}
		,getActiveSelectedData : function() {
			var _inst = this.getActive();
			return _inst.getSelectedData();
		}
		,getOrganURI : function() {return _organ._getOrganURI.apply(this,arguments);}
/*		,getActiveTree : function() {	return $(this._activetabs["panel"]).data("organ_tree");	}
		,getActiveTreeSelectedData : function() {
			var _orgtree =  this.getActiveTree();
			if(!_orgtree) {return null;} 
			return _orgtree.getSelectedData();
		}*/
	};
	$ep.ui.organ.tree = function(sel,options,jx) {
		var _$sel =  $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.organ.tree.method.moduleName)) {return _$sel.data($ep.ui.organ.tree.method.moduleName);}
		var _method = $.extend({},$ep.ui.organ.tree.method);
		_method.api = {dialog : this};
		_method.script = jx || $ep;
		_method.options = options;
		return _inheritSuper(_$sel,$ep.ui.organ.tree,_method);
	};
	$ep.ui.organ.tree.method = $ep.ui.organ.tree.prototype = {
		moduleName : "ep.ui.organ.tree"
		,create : function() {
			this.initTree();
		}
		,initTree : function() {
			var _self = this,_opt = _self.options,_dbl = $ep.util.delay(); 
			
			_self.api.tree = $ep.ui.tree($(_self.element),{
				source : typeof _opt.source == "function" ? _opt.source.call(_self) : function() {return _organ._children.call(_self);}				
				,extensions : ["dnd"]
				,checkbox : _opt.radio === true ? true : _opt.checkbox
				,clickFolderMode : _opt.clickFolderMode || 1
				,selectMode : _opt.selectMode ? _opt.selectMode : _opt.radio === true ? 1 : _opt.selectMode || 2
				,classes: _opt.radio ? "fancytree-radio" : ""
				,init : function(e, ctx) {
					if(typeof _opt.init === "function") {	setTimeout(function() {_opt.initComplete.call(_self,e,ctx);},50);}
					if(!_opt.expandTree) {return;};
					var _expand = _opt.expandTree;
					if(_opt.root) {
						_expand = _expand.replace(_opt.root + $ep._CONST.SEPERATE.col,"");
					}
					if(!_self.api.tree) {return;}
					_self.api.tree.expandKey(_expand.split($ep._CONST.SEPERATE.col)); 
				}
				,lazyLoad : function(e,data) {
					var _r = _organ._LazyRead.call(_self,_self.api.tree,data);
					if(_r) { data.result = _r;return true;};
					return false; 
				}
				,activate : function(e,data) {
					if(data.node.unselectable) {data.node.setActive(false);}	
				} 
				,click : function(e,data) {					
					var _targetType = data.targetType;
					if(!_targetType) {return;}
					if( ( $ep.Array(["title","icon"]).isMember(_targetType)) && (_opt.radio || _opt.checkbox)) {data.node.toggleSelected();}
					if(_opt.click) {
						_dbl.run(function() {_opt.click.call(_self,this,data);},300);					
					}
				}
				,dblclick : function(e,data) { 
					var _targetType = data.targetType;
					if(_targetType != "title") {return;}
					_dbl.clear();
					if(typeof _opt.dblclick === "function") {if(_opt.dblclick.call(_self,this,data) === false){return;};}
					if(_opt.checkbox && data.node.isExpanded()) {this.childrenSelectedAll(data.node);data.node.setSelected(false);} 
					if(data.node.hasChildren() || data.node.isLazy()) {if(!(_opt.checkbox && data.node.isExpanded())){	data.node.toggleExpanded();data.node.setSelected(false);}}					
				}
			});
			return;
		}
		,getSelectedData : function () {
			var _self = this,_opt = _self.options,getData = null,result = null;
			if(_opt.issearch === true) {
				 result = _self.api.search.getSelectedData();
				 if(_opt.deptTail) { 
					 result = $ep.Array(result).datafilter(function(_idx,_d) {
						 return _d;
					 });
				 }
			} else {
				if(!_self.api.tree) {return null;}
				getData =  _opt.checkbox || _opt.radio ? _self.api.tree.getSelectedNodes : _self.api.tree.getActiveNode;
				var _sel = getData.call(_self.api.tree); 	
				if($ep.Array(_sel).isArray()) {
					result = $ep.Array(_sel).datafilter(function(_idx,_d) {
						return _d.data;
					}); 					
				} else {
					result = _sel ? _sel.data : null;
				}				
			}				
			return  result;
		}
		,unselectedAll : function() {
			var _self = this,_opt = _self.options;
			if(!_self.api.tree) {return null;} 
			if(_opt.issearch === true ) {_self.api.search.deSelectedAll();return;	}
			
			( _opt.checkbox || _opt.radio ? _self.api.tree.deSelectedAll() : _self.api.tree.deActivate()); 
		}
		,doSearch : function(query) {
			return this._initSearch(query);		
		}
		,closeSearch : function() {
			var _self = this,_opt = _self.options;
			_opt.issearch = false;
			_self.api.search && _self.api.search.destroy();
			delete _self.api.search;
		}
		,_initSearch : function(query) {
			var _self = this,_opt = _self.options;
			if(!_opt.search) {return;}
			_opt.issearch = true;
			if(!_self.api.search) {
				var _$srch = $(_opt.search.target,_self.api.dialog.getActiveTab().panel);
				_self.api.search = _ui.organ.grid.call(_self.api.dialog,_$srch,_opt.search.grid);
			} else {_self.api.search.removeAll();};
			
			this._doSearch.call(_self,query);
			return;
		}
		,_doSearch : function(query,callResult) {
			var _self = this,_opt = _self.options,_callResult = callResult,_dfd = new $.Deferred()
			, _uri = $.CURI(
				_opt.search.view ? _opt.search.view.match(/^\//g) ? _opt.search.view :
					$ep._CONST.PATH.ORG + "/api/data/collections/name/" + _opt.search.view + "?restapi" :
				_opt.view ? _opt.view.match(/^\//g) ? _opt.view : 
					$ep._CONST.PATH.ORG + "/api/data/collections/name/" + _opt.view + "?restapi" :
					$ep._CONST.PATH.ORG + "/api/data/collections/name/byorgan_tree_all?restapi"
				, {search : query, ps : $ep._CONST.DATASERVICEMAXVIEWENTRIES,sortcolumn : $ep.lang() != "en" ? "_name" : "_ename" ,sortorder : "ascending"}
			).encode();
			_util.ajax({
				type:"get"
				,async : true
				, url : _uri.url				
			})
			.done(function(_data,txt,xhr) {
				var _result = _organ._gridfilter.call(_self,_data);
				_self.trigger && _self.trigger("aftersearch",_result);
				!(typeof _callResult == "function") && _self.api.search.addData(_result);
				(typeof _callResult == "function") && _callResult(_result);
				_dfd.resolve(_result,txt,xhr);
			})
			.fail(function(xhr,txt,res) {
				_dfd.reject(xhr,txt,res);
			});
			return _dfd.promise();
		}
		,convertEntry : _organ._convertEntry
		,convertViewEntry : _organ._convertViewEntry
		,reload : function(){	return this.api.tree && this.api.tree.reload();}
		,destroy : function() {
			if(this.options.issearch) {	this.closeSearch();}
			this._super("destroy"); 
			this.script = null;
			this.options = null;
			//_log(this.moduleName,"destroy");
		}
	};
	
	$ep.ui.organ.mailtree = function(sel,options,jx) {
		var _$sel =  $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.organ.mailtree.method.moduleName)) {return _$sel.data($ep.ui.organ.mailtree.method.moduleName);}
		var _method = $.extend({},$ep.ui.organ.mailtree.method);
		_method.api = {dialog : this.moduleName === "ep.ui.organ.dialog" ? this : null};
		_method.options = options;
		_method.script = jx || $ep; 
		return _inheritSuper(_$sel,$ep.ui.organ.mailtree,_method);
	};
	$ep.ui.organ.mailtree.method = $ep.ui.organ.mailtree.prototype = $.extend(true,{},$ep.ui.tree.method,{
		moduleName : "ep.ui.organ.mailtree"
		,create : function(){
			var _self = this;
			_self.options = $.extend(true,{
				classes : "mail-selection"				
				,extensions : ["mail.extension", "dnd"]
				,dnd : {
					autoExpandMS : 400
					,draggable : {
						containment : $(_self.element)
						,scroll : true
						,scrollSensitivity: 100
						//,revert : "invalid" 
					}
					,preventVoidMoves: true
					,preventRecursiveMoves: true 
					,dragStart: function(node, data) {
						return node.extraClasses == "mailroot" ? false : true;
					}
					,dragDrop: function(node, data) {
			          	data.otherNode.moveTo(node, data.hitMode);
			          	node.setExpanded(true);
			        }
					,dragEnter: function(node, data) {
						if(node.extraClasses == "mailroot") {return "over";};
						return ["before", "after"];
					}
				} 
				,checkbox : true
				,selectMode : 3
				,icons : false
				,source : [
				   {title : "{$CORE.ORGAN.TEXT.MAILSELECTED_TO}(0)"		,key : "to"		,folder : true, extraClasses: "mailroot"}
				  ,{title : "{$CORE.ORGAN.TEXT.MAILSELECTED_CC}(0)"		,key : "cc"		,folder : true, extraClasses: "mailroot"}
				  ,{title : "{$CORE.ORGAN.TEXT.MAILSELECTED_BCC}(0)"	,key : "bcc"	,folder : true, extraClasses: "mailroot"}
				]
				,renderNode : function(e,ctx) {
					var node = ctx.node	,_title = node.title;
					if(!node.isFolder()) {return;}
					if(node.isFolder() ) {
						var _count =  node.children ? node.children.length : 0;
						_title = _title.replace(/(^.*)\([0-9]+\)/g,"$1("+_count+")");
						node.setTitle(_title);
					}
				}
				,init : function(e,ctx) {
					var _opt = _self.options
					 	,_data = (typeof(_opt.dataset) == "function" ? _opt.dataset() : _opt.dataset)
					 	,_organ = _self.api.dialog ? _self.api.dialog.api.organ : null;
					
					if(!_data) {return;}
					if(typeof _data === "string") {
						_data = _util.stringToObject(_data,_organ ? _organ.pattern["P"] : undefined,$ep._CONST.SEPERATE.col,$ep._CONST.SEPERATE.field);
					}
					if($.isArray(_data)) {
						$.each(_data, function(idx,o) {
							if($.isPlainObject(o)) {
								o.mtype = o.mtype || "to";
								_self.addChildrenByKey(o.mtype,o);
							} else {								
								_r[0].mtype = _r[0].mtype || "to";
								_self.addChildrenByKey(o.mtype,o);
							}
						});
					} else {
						_data.mtype = _data.mtype || "to";
						_self.addChildrenByKey(_data.mtype,_data);
					}
				}
				,dataRender : function(ctx,add,node) {
					_self.dataRender(ctx,add,node);
				}
			},this.options);
			this.script.LangConvertObject(_self.options,"title,text");
			$ep.ui.tree.prototype.create.apply(_self);
			
		}
		,addChildrenByKey : function(key,node) {
			var _key = typeof key === "string" ? key : null
					,_parent = _key ? this.getNodeByKey(_key) : this.getRootNode()
					,_node = node ? node : typeof key != "string" ? key : null;
			if(!_node) {return null;}
			//var _node = $ep.ui.tree.prototype.addChildrenByKey.apply(this,[node,key]);
			this.addChildren(_parent,_node);
			return _parent.setExpanded(true);			
		}
		,addChildren : function(parent,data) {
			var _self = this,_parent = parent;
			if($.isArray(data)) {
				$.each(data, function(idx,o) {
					var _o = $.extend({},o);
					_o.folder && delete _o.folder;
					_o.mtype && delete _o.mtype;
					_o.lazy && delete _o.lazy;
					_self.addData(_parent,_o);
				});
			} else {
				var _o = $.extend({},data);
				_o.folder && delete _o.folder;
				_o.mtype && delete _o.mtype;
				_o.lazy && delete _o.lazy;
				_self.addData(_parent,_o);
			} 
			return _parent;	
			
		}
		,addData : function(parent,data) {
			var _isduplicate = false;
			data["key"] = data.notesid;
			if(this.isTrigger("duplicate")) {
				if(this.trigger("duplicate",data) == true) { return;}
			} else { 
				var _keynode = this.getNodeByKey(data["key"]);
				if(_keynode) { /* key duplicated*/
					if(this.trigger("duplicated",_keynode,data) !== true) { return;}				 
				} 
			}
			return parent.addChildren(data);
		}
		,dataRender : function(ctx,add,node) {
			var _self = this, _opt = _self.options	,_compItem = _opt.item;
			if(typeof _compItem == "function") {_compItem = _compItem(node.data);}
			node["title"] = _compItem.title ? _util.patternCompletion(_compItem.title, node.data) : "";
			node["tooltip"] = _compItem.tooltip ? _util.patternCompletion(_compItem.tooltip, node.data) : "";
			//node["key"] = node.data.notesid;
		}
		,getResultData : function(){
			var _result = []
				,_data = []
				,_node = this.getChildrenByKey("to");
			_node && $ep.Array(_node).datafilter(function(v,d) {_result.push($.extend({},d.data,{mtype: "to"}));});
			_node = this.getChildrenByKey("cc");
			_node && $ep.Array(_node).datafilter(function(v,d) {_result.push($.extend({},d.data,{mtype: "cc"}));});
			_node = this.getChildrenByKey("bcc");
			_node && $ep.Array(_node).datafilter(function(v,d) {_result.push($.extend({},d.data,{mtype: "bcc"}));});
			$ep.Array(_data).datafilter(function(idx,v) { 
				_result.push($.extend({},v.data));
			});
			return _result;
		}
		,removeSelectedNodes : function() {
			var _self = this
				,_nodes = _self.getSelectedNodes();
			$.each(_nodes,function(idx,node) {
				if(node.isFolder()) {return true;}
				if(!node.parent) {return true;}
				if(node.hasChildren()) { node.removeChildren();}
				var _parent = node.getParent();
				node && node.remove();
				if(_parent) {
					_self.options.renderNode.call(_parent.tree,{type : "renderNode"},_parent.tree._makeHookContext(_parent,null));
					_parent.partsel = false;
					$(_parent.span).removeClass(_parent.tree.options._classNames.partsel);
				}
			});
			_self.deSelectedAll();
		}

	});	
	$ep.ui.organ.grid = function(sel,options,jx) {
		var _$sel =  $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.organ.grid.method.moduleName)) {return _$sel.data($ep.ui.organ.grid.method.moduleName);}
		var _method = $.extend({},$ep.ui.organ.grid.method);
		_method.script = jx || $ep; 
		_method.options = options;
		return _inheritSuper(_$sel,$ep.ui.organ.grid,_method);
	};
	$ep.ui.organ.grid.method = $ep.ui.organ.grid.prototype = {
		moduleName : "ep.ui.organ.grid"
		,_apply : function() {return this.element.epgrid.apply(this.element,arguments);}
		,create : function(){
			var _self = this;
			this.element.addClass("ep-eporgangrid");
			this.script && this.script.LangConvertObject(this.options,"label,text");
			var _oriRender = this.options ? this.options.itemRender : undefined;
			var _oriDragstop = this.options ? this.options.dragstop : undefined;
			var _oridataset = this.options ? this.options.dataset : undefined;
			var _dataset = function(){
				if(typeof _oridataset === "function") {return _oridataset.call(_self);};
				return _oridataset;
			};
			$(this.element).epgrid($.extend(this.options, {
				itemRender : function(data){
					//var _data = _organ._parse_org.call(_self, data);
					var _data = data;
					if(_oriRender) {_oriRender.call(_self,_data);}	
					return _data;
				}
				,dataset : _dataset
				,dragstop : function() {_oriDragstop && _oriDragstop.call(_self,$(this));}
			}));
			return;
		}
		,addData : function(data) {return this._apply("addData",data);}
		,removeSelected : function() {this._apply("removeSelected");}
		,removeAll : function() {this._apply("removeAll");}
		,selectedUp : function(node) {return this._apply("selectedUp",node);}
		,selectedDown : function(node) {return this._apply("selectedDown",node);}
		,allChecked : function(flag) {return this._apply("allChecked",flag);} /*전체 선택/해제 */
		,getAllData : function() {return this._apply("getAllData");}
		,getSelectedData : function() {return this._apply("getSelectedData");} 
		,getDataByKey : function(keyVal) {return this._apply("getDataByKey",keyVal);}
		,getSelectedNodes : function() {return this._apply("getSelectedNodes");}
		,deSelectedAll : function(){return this._apply("deSelectedAll");}
		,unselectedAll : function(){return this._apply("deSelectedAll");}
		,getColumnById : function(id,ele){return this._apply("getColumnById",id,ele);}
		,getAllColumnById : function(id){return this._apply("getAllColumnById",id);}
		,getAllNodes : function(sel) {return this._apply("getAllNodes",sel);} 
		,destroy : function() {
			$(this.element).epgrid("destroy");
			this._super("destroy");
		}
	};
	
	/*
	 * ui.ograngrid options
	 * - display  
	 * - select
	 * - server
	 * - expandTree	
	 * - resultset : Array
	 * - isduplicate 
	 * - pubgroup
	 * - pergroup
	 * - peraddr
	 * - hideupdown : boolean
	 * - hidedelete : boolean
	 */
	$ep.ui.organgrid = function(sel,options,jx) {
		var _$sel =  $(sel);
		if(_$sel.size() == 0) {return null;}
		if(_$sel.data($ep.ui.organgrid.method.moduleName)) {return _$sel.data($ep.ui.organgrid.method.moduleName);}
		var _method = $.extend({},$ep.ui.organgrid.method);
		_method.script = jx || $ep;
		_method.options = options || {};
		return _inheritSuper(_$sel,$ep.ui.organgrid,_method);
	};
	$ep.ui.organgrid.method = $ep.ui.organgrid.prototype = {
		moduleName : "ep.ui.organgrid"
		,create : function() {
			$(this.element).empty();
			$(this.element).addClass("ep-widget ep-organgrid");
			this._resetApi();			
			this._initInput();
			this._initGrid();
		}
		,_resetApi : function(){
			this.elements && this.elements.btndelete && $(this.elements.btndelete).epbutton("destroy");
			this.elements = {input : null,grid : null,btndelete : null};
			this.api && this.api.grid && this.api.grid.destroy();
			this.api && this.api.input && this.api.input.destroy();
			this.api = {grid : null,input : null};
		}
		,_initInput : function() {
			var _self = this,_opt = _self.options;
			if(_opt.hideinput === true) {return;} 
			this.elements.input = $('<div class="ep-organgrid-first"><span class="ep-organgrid-input"><input type="text"></span><span class="ep-organgrid-delete"></span></div>')
									.appendTo(this.element).find(".ep-organgrid-input input");
			this.elements.btndelete = _opt.hidedeleteall !== true ? $(".ep-organgrid-first .ep-organgrid-delete",this.element).epbutton({
				text : $ep.LangString("ORGAN.BUTTON.BTNALLDEL") 
				,click : function() {_self.api.grid && _self.api.grid.removeAll();}
			}) : null;
			var _resultset = [	{element : function() {
				return _self.elements.grid;}, type : "organgrid" }];
			_opt.resultset && $.isArray(_opt.resultset) && _resultset.concat(_opt.resultset);
			var _organopt = $.extend(true,{
					icon : "organ"	,placeholder : $ep.LangString("ORGAN.TEXT.ORGANSEARCHTEXT")	
					,width : "100%"
					,organ: {type : "multiple",display : _opt.display || "all"		,select : _opt.select || "all"			,server : _opt.server
						,expandTree : _opt.expandTree || ""	,resultset : _resultset	,dataset : function() {return _self.api.grid.getAllData();}
						,pubgroup : _opt.pubgroup !== true ? false : true	,pergroup : _opt.pergroup !== true ? false : true	,peraddr : _opt.peraddr !== true ? false : true
					} 
					,organresult : function(data,api) {this.val("");}
				},_opt.organ ? _opt.organ : {});			
			this.api.input = _ui.input(this.elements.input,_organopt);			
		}
		,_initGrid : function() {
			var _self = this,_opt = _self.options;
			this.elements.grid = $('<div class="ep-organgrid-grid"></div>').appendTo(this.element);
			var _gridopt = $.extend(true, {
					keycode : "notesid"
					,isduplicate : typeof _opt.isduplicate == "undefined" ? true : _opt.isduplicate 
					,duplicate : {type : "toast",message : $ep.LangString("ORGAN.TEXT.DUPLICATEDEXCLUDED")}
					,draggable : _opt.draggable == false ? false : true
					,classes : "withoutscroll" 
					//,selectType : "checkbox"
					,offresize : true
					,userinfo : _opt.userinfo || "level4"
					,hideheader : true
					,dataset : _opt.dataset || null
					,headers : [
							{ id : "display" , label : "", css : {"padding-left" : "5px"}
						   	 ,expression : function(td,colset,data) {
						   		return data.type == "P" ? _ui.makeUserInfo(td,data,_opt.server,false,_gridopt.userinfo) : $ep.util.patternCompletion($ep._CONST.ORG_DISPLAY_MASK["default"](data),data);
						   		//return $ep.util.patternCompletion(_pattern,data);
						   	 }							   	 
						  	} 
						   ,{ id : "up" , width : "23px"
							   ,expression : function(td,colset,data) {
								  var _self = this,_td = td;
								  return $('<span style="padding:5px;"><span class="ep-icon up"></span></span>').on("click",function(e){
									   e.stopPropagation();
									   $(_self).epgrid("selectedUp",_td.closest(".ep-epgrid-item"));
								  });
							  }
						   }
						   ,{ id : "down" , width : "23px"
							   ,expression : function(td,colset,data) {
								   var _self = this, _td = td;
								  return $('<span style="padding:5px;"><span class="ep-icon down"></span></span>').on("click",function(e){
									   e.stopPropagation();
									   $(_self).epgrid("selectedDown",_td.closest(".ep-epgrid-item"));
								  });
								}
						   }
						   ,{ id : "delete" , width : "23px" , css : {textAlign:"center"}
							  ,expression : function(td,colset,data) {
								  var _self = this, _td = td;
								  return $('<span style="padding:5px;"><span class="ep-icon cancel"></span></span>').on("click", function(e) {
									  e.stopPropagation();
									  $(_td).closest(".ep-epgrid-item").fadeOut(300,function() {$(this).remove();});
								  });
							  }
						   }
					]
				},_opt.grid ? _opt.grid : {});
			if(_opt.hideupdown == true||_opt.hidedelete) {
				_gridopt.headers = $ep.Array(_gridopt.headers).filter(function() {
					return (_opt.hideupdown == true && this.id == "up" || this.id == "down") || (_opt.hidedelete == true && this.id == "delete") ? false : true;});}
			this.api.grid = _ui.organ.grid(this.elements.grid,_gridopt);
		}
		,getValue : function() {return this.api.grid ? this.api.grid.getAllData() : [];}
		,addValue : function(data) {return this.api.grid && this.api.grid.addData(data);}
		,getString : function() {
			if(!this.api.input) {return;}
			var _organ = this.api.input && this.api.input.api.organ;
			return _organ.toData(this.getValue()).string();
		}
		,getArrayString : function(){
			if(!this.api.input) {return;}
			var _organ = this.api.input && this.api.input.api.organ;
			return _organ.toData(this.getValue()).arrayString();
		}		
		,destroy : function(){
			this._resetApi();
			$(this.element).removeClass("ep-widget ep-organgrid");
			this._super("destroy");
		}
	};

 })(jQuery);
