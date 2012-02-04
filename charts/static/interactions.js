$(document).ready(function(){
	$("#chart").delegate(".bar","click",function(event){
		$.address.parameter("filter",$(this).data("name"));
		$.address.parameter("highlight",$(this).parents(".column:first").data("name"));
	}).delegate(".bar","mouseenter",function(event){
		$(this).trigger("highlight").trigger("over");
	}).delegate(".bar","mouseleave",function(event){
		$(this).trigger("unhighlight").trigger("out");
	}).delegate(".chart","click",function(event){
		if(event.target!=this){
			return true;
		}
		event = fill_in_values(event);
		items = $(this).parents("#chart:first").data("data");
		find_values(items[0],function(value,index,parent){
			if(event.filter == index && parent){
				$.address.parameter("filter",parent);
			}
		});
	}).delegate(".filter","mouseenter",function(){
		$(this).trigger("over");
	}).delegate(".filter","mouseleave",function(){
		$(this).trigger("out");
	});
	
	$("#chart").delegate(".column","mouseenter",function(event){
		column = $(this);
		column.data("expand_timeout",setTimeout(function(){
			column.trigger("expand");
			if($.address.parameter("highlight")!=column.data("name")){
				$.address.parameter("highlight",false);
			}
		},500));
	}).delegate(".column","mouseleave",function(event){
		column = $(this);
		if(column.data("expand_timeout")){
			clearTimeout(column.data("expand_timeout"));
		}
		$(this).trigger("collapse");
	});
});