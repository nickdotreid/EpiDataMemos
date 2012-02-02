$(document).ready(function(){
	$("#chart").delegate(".bar","click",function(event){
		if(event.target!=this){
			return true;
		}
		$.address.parameter("filter",$(this).data("name"));
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
	}).delegate(".column","mouseenter",function(event){
		$(this).trigger("expand");
	}).delegate(".column","mouseleave",function(event){
		$(this).trigger("collapse");
	}).delegate(".filter","mouseenter",function(){
		$(this).trigger("over");
	}).delegate(".filter","mouseleave",function(){
		$(this).trigger("out");
	});
});