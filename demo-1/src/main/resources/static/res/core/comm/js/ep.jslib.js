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
			this.path("/" + server + _path);			
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
			,__outerHeight = typeof window.outerHeight !== "undefined" ? window.outerHeight : 768
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
		__o.width = __o.width|| 850; 
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

