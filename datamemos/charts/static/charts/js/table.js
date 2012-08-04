if(!statistic_save_uri){
	var statistic_save_uri = '/statistics/save/';
}
if(!statistic_get_uri){
	var statistic_get_uri = '/statistics/';
}

$(document).ready(function(){
	$(".wrapper").delegate(".chart .table .point","click",function(event){
		$.address.parameter("tags",$(this).data("tags"));
	}).delegate(".chart .table .legend","click",function(event){
		$.address.parameter("tags",$(this).data("tags"));
	}).delegate(".chart .table","highlight",function(event){
		var table = $(this);
		$(".point.highlight,.legend.highlight",table).removeClass("highlight").removeClass("selected");
		$(".point,.legend",table).each(function(){
			var tags = $(this).data("tags");
			if(!tags){
				return;
			}
			tags = String(tags).split(",");
			var matches = 0;
			for(var index in tags){
				if( event.tags.indexOf(tags[index])>-1){
					matches++;
				}
			}
			if(matches > 0){
				$(this).addClass("highlight");
			}
			if(matches > 1){
				$(this).addClass("selected");
			}
		});
	});
	
	$.address.change(function(event){
		$(".chart .table").trigger({
			type:"highlight",
			tags:$.address.parameter("tags").split(","),
		});
		
	});
});