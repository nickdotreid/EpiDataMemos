$(document).ready(function(){
	
	$(".wrapper").delegate(".barchart .column","mouseenter",function(){
		var column = $(this);
		if(column.data("hover-timeout")){
			clearTimeout(column.data("hover-timeout"));
		}
		column.data("hover-timeout",setTimeout(function(){
			column.data("hover-timeout",false);
			column_values = [];
			$(".column",column.parents(".canvas:first")).each(function(){
				column_values.push($(this).attr("value"));
			});
			var tags = [];
			if($.address.parameter("tags")){
				tags = $.address.parameter("tags").split(",");
			}
			tags = add_and_filter_array(tags, column.attr("value"), column_values);
			$(".barchart").trigger({
				type:"redraw",
				tags:tags
				});
			$(".notes").trigger({
				type:"sort",
				tags:tags
			});			
		},500));
	}).delegate(".barchart .column","mouseleave",function(){
		var column = $(this);
		if(column.data("hover-timeout")){
			clearTimeout(column.data("hover-timeout"));
			column.data("hover-timeout",false);
		}else{
			$(".barchart").trigger("redraw");
			$(".notes").trigger("sort");
		}
	});
	
	$(".wrapper").delegate(".notes .statistic","mouseenter",function(){
		var statistic = $(this);
		if(statistic.data("hover-timeout")){
			clearTimeout(statistic.data("hover-timeout"));
		}
		statistic.data("hover-timeout",setTimeout(function(){
			statistic.data("hover-timeout",false);
			tags = statistic.data("tags");
			$(".barchart").trigger({
				type:"redraw",
				tags:tags
				});			
		},500));
	}).delegate(".notes .statistic","mouseleave",function(){
		var statistic = $(this);
		if(statistic.data("hover-timeout")){
			clearTimeout(statistic.data("hover-timeout"));
			statistic.data("hover-timeout",false);
		}
		$(".barchart").trigger("redraw");
	});
});