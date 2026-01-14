function gLlm(){
	
	
	if (location.href.indexOf("dev.kmslab.com") > -1){
		this.plugin_domain_fast = "https://kgpt.kmslab.com:5100/";
	}else{
		this.plugin_domain_fast = "https://kgpt.kmslab.com:5005/";	
	}
	
}

gLlm.prototype = {
	
	"init" : function(){
		gllm.event();
	},
	
	"event" : function(){
		$("#search").on("keypress", function(e){
			if (e.keyCode == 13){
				var txt = $("#search").val();
				$("#query").html(txt);
				
				gllm.search_left();
				gllm.search_right();
				
				$("#search").val("");
				
			}
		});
	},
	
	"search_left" : function(){
		var obj = $("#left");		
		var txt = $("#search").val();		
		var postData = JSON.stringify({
			query : txt	
		});					
		var ssp = new SSE(gllm.plugin_domain_fast + "test/sllm", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	           method: 'POST'});		     
	           
	    var accumulatedMarkdown = "";
		obj.addClass("markdown-body");
		obj.parent().css("white-space", "inherit");		
	   	ssp.addEventListener('message', function(e) {	
			console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
		
			accumulatedMarkdown += pph;
            const html = marked.parse(accumulatedMarkdown);
            obj.html(html);							
				
		});
		ssp.stream();				

	},
	
	"search_right" : function(){
		var obj = $("#right");
		
		
		var txt = $("#search").val();		
		var postData = JSON.stringify({
			query : txt	
		});					
		var ssp = new SSE(gllm.plugin_domain_fast + "test/sllm2", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	           method: 'POST'});		     
	           
	    var accumulatedMarkdown = "";
		obj.addClass("markdown-body");
		obj.parent().css("white-space", "inherit");		
	   	ssp.addEventListener('message', function(e) {	
			console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
		
			accumulatedMarkdown += pph;
            const html = marked.parse(accumulatedMarkdown);
            obj.html(html);							
				
		});
		ssp.stream();				
	}
}