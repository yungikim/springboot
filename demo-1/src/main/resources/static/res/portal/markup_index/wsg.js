
var Layout = {
		
	uiActive: 'active',
		
	_progressList: function () {
		
		var table = $("#progressList");

		// line number
		table.find("tr td:first-child").each(function(i, v) {
			$(v).text(i + 1);
		});

		var stateFields = table.find("td.state");
		stateFields.each(function(i, v) {
			var current = $(v);
			var fields = current.parent().children();
			var prop = {
				//type: current.is("td:last-child") && "../html",
				update: current.is("td:last-child"),
				type: fields.eq(-2).text() && "../html",
				directory: fields.eq(-4).text(),
				pageId: fields.eq(-3).text()
			};

			var wrapAnchor = $("<a>")
				.attr("target", "_blank")
				.attr("href", prop.type + "/" + prop.directory + "/" + prop.pageId + ".html")
				.text(v.textContent);
			if(current.text() == "예정") {
				current.addClass("undecided");
			}
			else if(current.text() == "진행") {
				current.addClass("working");
			}
			else if(current.text() == "완료") {
				current.addClass("complete");
				
			}
			else if(current.text() == "수정") {
				current.addClass("modify");
			}
			else if(current.text() == "검증") {
				current.addClass("validation");
			}
			current.html(wrapAnchor);
		});
	},
		
	_supportUI: function (){
		
		$('#aside').prependTo('body');
		$('#gnb').wrap('<div id="gnbWrap" class="gnb-wrap"></div>');

		//current page
		var currentFileName = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.lastIndexOf("/") + 20);
		$('.gnb li a').each(function(){
			var thisPage = $(this).attr('href'); 
			if(thisPage == currentFileName){
				$(this).parent('li').addClass('active').siblings('li').removeClass('active');
			};
		});

		//fonnter info
		var elem = $('#copyright');
		elem.after('<p class="update">Update : <time>2014-02-05</time></p>');
	},

	/**
	 * skip aside
	 */
	_skipAside: function (){
		$('#container').css('min-height', $(window).height());
		$('#aside').prependTo('#wrap');
		
		var container = $('#wrap');
		var eventSwitch = $('#skipAside');
		var aside = $('#aside');
		var dimmed = $('#dimmedAll');

		eventSwitch.click(function(e){
			e.preventDefault();
			container.addClass('aside-active');
			aside.addClass(uiBase.uiActive);
			dimmed.addClass(uiBase.uiActive);
			
			setTimeout(function(){ 
				oScroll = new jindo.m.Scroll("gnbWrap", {
					bUseScrollbar : false,
					nZIndex : 1
				});
			},200);
		});
		
		dimmed.click(function(){
			container.removeClass('aside-active');
			dimmed.removeClass(uiBase.uiActive);
			setTimeout(function(){
				aside.removeClass(uiBase.uiActive);
			},600);
			oScroll.destroy();
		});
	},
	
	_init: function() {
		Layout._skipAside();
		Layout._progressList();
		Layout._supportUI();
		
		//window resize
//		$(window).resize(function(){
//			if(oScroll){
//				oScroll.refresh();
//			}
//		});
		// SyntaxHighlighter
		//SyntaxHighlighter.config.bloggerMode = true;
		//SyntaxHighlighter.defaults['toolbar'] = false;
		//SyntaxHighlighter.all();
	}
};

Layout._init();





