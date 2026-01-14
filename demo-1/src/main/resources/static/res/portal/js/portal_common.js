	// custom scroll
	$(function(){
		$(".view_scroll").mCustomScrollbar({
			theme:"minimal-dark"
		});
		$(".view_scroll2").mCustomScrollbar({
			theme:"minimal-dark"
		});
		$(".view_scroll3").mCustomScrollbar({
			theme:"3d"
		});
	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//로그인시 랜덤으로 내용보이기
	

	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//좌측상단 sitemap 호출
	var ux_portal = {
		initSitemap : function() {
			//$(".btn.ico_sitemap").on("click", function() {ux_portal.openLayer("popLayer_wrap",{top:61, left:0});});
			//$(".btn.ico_close").on("click", function() {ux_portal.closeLayer('popLayer_wrap');});
			//(".btn.ico_search").on("click", function() {ux_portal.openLayer("popSearch_wrap",{top:61, left:0});});
			//$(".btn.ico_close").on("click", function() {ux_portal.closeLayer('popSearch_wrap');});
			//this.initLayout();
		}
		//sub_layout
		//,initLayout : function() {
		//	$('.component-control').layout();
		//}
		,openLayer : function(targetID, options){
			var $layer = $('#'+targetID);
			var width = $layer.outerWidth();
			var ypos = options.top;
			var xpos = options.left;
			var marginLeft = 0;
			
			if(xpos==undefined){
				xpos = '50%';
				marginLeft = -(width/2);
			}

			if(!$layer.is(':visible')){
				$layer.css({'top':ypos+'px','left':xpos,'margin-left':marginLeft})
					.show();
			}
		}

		,closeLayer : function(IdName){
			var pop = document.getElementById(IdName);
			pop.style.display = "none";
		}
		
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//우측상단 qtip layer
	//$(function(){
	//	$('.header_layer').each(function() {
	//		$(this).qtip({
	//			overwrite : true,
	//			content: {
	//				text: $(this).next('.header_layerWrap'),
	//				title: {
	//					//text: '',
	//					//button: true 
	//					}
	//			},
	//			//width: 400,
	//			show: {
	//				event: 'click',
	//				effect: function() {
	//					$(this).slideDown();
	//				}
	//			},
	//			hide: 'unfocus',
	//			position : {at : 'bottom center',my : 'top center',adjust : { method: "shift flip" ,x : 0 ,y : 0,screen:true }, viewport: true},
	//			style: {
	//				classes : 'header_layerContainer',
	//				tip : { corner: true ,width : 12 ,height : 8 ,offset : 0	}
	//			}
	//			
	//		});
	//	});
	//});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Footer Famliy Site
	$(function(){
		/*
		$(".family_siteBtn").click(function(){
			$(".family_siteList").slideToggle("slow");
			if($(this).text() == '▼'){
				$(this).text('▲');
			} else {
				$(this).text('▼');
			}
		});
		*/
	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//검색결과 더보기 열리고 닫힘
	$(function() {
		$( ".open_moreView" ).accordion({
			active : true,
			collapsible: true, 
			heightStyle :'content',
			icons: { "header": "ui-icon-plus", "headerSelected": "ui-icon-minus" }
		});
	});



	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//사회공헌포털 하단게시글 자동롤링
	function fn_article(containerID, buttonID, autoStart){
		var $element = $('#'+containerID).find('.news_list');
		var $prev = $('#'+buttonID).find('.prev');
		var $next = $('#'+buttonID).find('.next');
		var $play = $('#'+containerID).find('.control > a.play');
		var $stop = $('#'+containerID).find('.control > a.stop');
		var autoPlay = autoStart;
		var auto = null;
		var speed = 4000;
		var timer = null;

		var move = $element.children().outerHeight();
		var first = false;
		var lastChild;

		lastChild = $element.children().eq(-1).clone(true);
		lastChild.prependTo($element);
		$element.children().eq(-1).remove();

		if($element.children().length==1){
			$element.css('top','0px');
		}else{
			$element.css('top','-'+move+'px');
		}

		if(autoPlay){
			timer = setInterval(moveNextSlide, speed);
			$play.addClass('on').text('▶');
			auto = true;
		}else{
			$play.hide();
			$stop.hide();
		}

		$element.find('>li').bind({
			'mouseenter': function(){
				if(auto){
					clearInterval(timer);
				}
			},
			'mouseleave': function(){
				if(auto){
					timer = setInterval(moveNextSlide, speed);
				}
			}
		});

		$play.bind({
			'click': function(e){
				if(auto) return false;

				e.preventDefault();
				timer = setInterval(moveNextSlide, speed);
				$(this).addClass('on').text('▶');
				$stop.removeClass('on').text('▣');
				auto = true;
			}
		});

		$stop.bind({
			'click': function(e){
				if(!auto) return false;

				e.preventDefault();
				clearInterval(timer);
				$(this).addClass('on').text('■');
				$play.removeClass('on').text('▷');
				auto = false;
			}
		});

		$prev.bind({
			'click': function(){
				movePrevSlide();
				return false;	
			},
			'mouseenter': function(){
				if(auto){
					clearInterval(timer);
				}
			},
			'mouseleave': function(){
				if(auto){
					timer = setInterval(moveNextSlide, speed);
				}
			}
		});

		$next.bind({
			'click': function(){
				moveNextSlide();
				return false;
			},
			'mouseenter': function(){
				if(auto){
					clearInterval(timer);
				}
			},
			'mouseleave': function(){
				if(auto){
					timer = setInterval(moveNextSlide, speed);
				}
			}
		});

		function movePrevSlide(){
			$element.each(function(idx){
				if(!first){
					$element.eq(idx).animate({'top': '0px'},'normal',function(){
						lastChild = $(this).children().eq(-1).clone(true);
						lastChild.prependTo($element.eq(idx));
						$(this).children().eq(-1).remove();
						$(this).css('top','-'+move+'px');
					});
					first = true;
					return false;
				}

				$element.eq(idx).animate({'top': '0px'},'normal',function(){
					lastChild = $(this).children().filter(':last-child').clone(true);
					lastChild.prependTo($element.eq(idx));
					$(this).children().filter(':last-child').remove();
					$(this).css('top','-'+move+'px');
				});
			});
		}

		function moveNextSlide(){
			$element.each(function(idx){

				var firstChild = $element.children().filter(':first-child').clone(true);
				firstChild.appendTo($element.eq(idx));
				$element.children().filter(':first-child').remove();
				$element.css('top','0px');

				$element.eq(idx).animate({'top':'-'+move+'px'},'normal');

			});
		}
	}


	function newEpCookie(name, val, options) {
		
		if (typeof val != 'undefined') { 
			options = options || {};
			if (val === null) {
				val = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(val), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	}
	
	var guide_portal = {
		init :function (){
			var base = this; 
			$('.ico_popclose').on('click',function (){
				base.close();
			});
			
			$('.pop_usedGuide input:checkbox').on('click',function (){
				base.close();
			});
			
			if(newEpCookie('guideOpenFlag')=='true'){
				$(".pop_usedGuide input:checkbox").prop('checked',true);
			}
		}
		,close:function (){
			//newEpCookie('guideOpenFlag',$(".pop_usedGuide input:checkbox").is(":checked"), {path:'/', secure:0, expires:'9999'});
			newEpCookie('guideOpenFlag',$(".pop_usedGuide input:checkbox").is(":checked"), {path:'/', expires: 9999});
			if(parent){
				parent.window.close();
			}else{
				window.close();
			}
		}
	}; $(document).ready(function (){guide_portal.init();});
	

