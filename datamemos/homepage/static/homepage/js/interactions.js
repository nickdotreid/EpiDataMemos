$(document).ready(function(){
	$(".wrapper").delegate(".barchart .column","mouseenter",function(){
		var column = $(this);
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
	}).delegate(".barchart .column","mouseleave",function(){
		$(".barchart").trigger("redraw");
	});
});