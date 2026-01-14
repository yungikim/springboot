/*! XAM main */
var xam_core = function() {
    var core = function(){ return this.init.apply(this, arguments); };
    core.prototype.init = function(opt) {
        var _this = this;
        if (jQuery.fn.jquery.split[0] === '1' && parseInt(jQuery.fn.jquery.split('.')[1]) < 6) {
            alert('jQuery 1.6 이상이어야 합니다.');
            return
        };
        function boot(__opt, __xml){        	
            _this.g = XAM.g; 
            _this.args = __opt;
            _this.g.setEnvVal(__xml, __opt, _this);
            _this.g.iframe_id = "XAM_" + XAM.g.getRandomChar();
            //_this.g.iframe_id = opt.disp_id + '-uploadcontrol';
            _this.g.createIframe(__opt,_this);
        }
        $.customData = opt;        
        $.when.apply($, [
            $.ajax({
                url : (opt.config_url ? basePath + opt.config_url : basePath + '/config/kportal_xam_config.xml'),
                async : false,
                cache: false,
                customData : opt,
                dataType: 'xml'
            }),
            $.ajax({ url: scriptBasePath + 'xam.global.js?open&ver=2.0.0.35', async: false, cache:true, dataType: "script" }),
            $.ajax({ url: scriptBasePath + 'xam.browserInfo.js?open', async: false, cache:true, dataType: "script"})
        ]).done(function(data) {
            if(this[0]){
                var _customData = this[0].customData;
            } else {
                var _customData = $.customData;
            }
            $.each(data, function(a, b) {
                if($(b).find("kportal").length > 0){
                    boot(_customData, $(b).find("kportal"));
                }
            });
        });
    };
    return core;
};
var XAM = XAM || new xam_core();
var scriptEles = document['getElementsByTagName']('script');
var scriptEleLength = scriptEles['length'];
var scriptBasePath = '';
var basePath = '';
for (var count = 0; count < scriptEleLength; count++) {
    var scriptEle = scriptEles['item'](count);
    var scriptSrc = scriptEle['src'];
    if (scriptSrc['indexOf']('xam.main.js') > 0) {
        scriptBasePath = scriptSrc['substring'](0, scriptSrc['indexOf']('xam.main.js'));
        basePath = scriptSrc['substring'](0, scriptSrc['indexOf']('/js/xam.main.js'))
    }
}