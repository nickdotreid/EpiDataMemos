$(document).ready(function(){
	$("#chart").delegate(".bar","dblclick",function(event){
		if(event.target!=this){
			return true;
		}
		$.address.parameter("filter",$(this).data("name"));
	}).delegate(".bar","mouseenter",function(event){
		$(this).trigger("highlight");
	}).delegate(".bar","mouseleave",function(event){
		$(this).trigger("unhighlight");
	}).delegate(".chart","dblclick",function(event){
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
	});
});