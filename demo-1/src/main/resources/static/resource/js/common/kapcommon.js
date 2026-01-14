$(document).ready(function(){
	//kap.init();
});

function kapcommon(){
	this.id = "";
}

kapcommon.prototype = {
	"init" : function(){
		/*
		$(".btn.btn_left_menu.work").on("click", function(){    	
    		kap.LoadPage("area_content", "/WebApproval/index.jsp");
    		
    	});
    	$(".btn.btn_left_menu.home").on("click", function(){    	
    		kap.LoadPage("area_content", "/KPortalBox/index.jsp");
    		
    	});
    	*/
	},
	
	"LoadPage" : function(id, url){
		$("#" + id).hide();
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);
			}else if (status == "success"){
				$("#"+id).show();
				$("#bottom_content").show();
			}
		});
	}
}