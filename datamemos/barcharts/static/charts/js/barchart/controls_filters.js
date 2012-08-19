$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart","controls-redraw",function(event){
		var chart = $(this);
		if(!event.tags){
			event.tags = chart.data("tags");
		}
		$(".filters .tag.active").removeClass("active").removeClass("active-parent");
		$(".filters input:checked").attr("checked",false);
		$(".tags-children").hide();
		
		for(var index in event.tags){
			var tag = event.tags[index]
			var input = $(".tag input[value='"+tag+"']");
			if(input.length > 0){
				input.attr("checked",true);
				input.parents(".tag:first").addClass("active");
				input.parents(".tags-children:first").show();
				$("#tag-"+input.parents(".tags-children:first").attr("parent")).parents(".tag:first").addClass("active").addClass("active-parent");
				$(".tags-children[parent='"+tag+"']",chart).show();
			}
		}
		
		$(".layout").show();
		if($(".tags-children:visible").length<1){
			$(".layout").hide();
			if(event['percent']){
				if($.address.parameter("percent")){
					$.address.parameter("percent",false);
				}else{
					event['percent'] = false;
					chart.trigger({
						type:"redraw",
						tags:event.tags,
						percent:false
					});
				}
				return;
			}
		}
	}).delegate(".chart.barchart .filters .tag input","click",function(event){
		event.preventDefault();
		var row_values = []
		$(".tags input, .tags-children input",$(this).parents(".chart:first")).each(function(){
			row_values.push(this.value);
		});
		var tags = [];
		if($.address.parameter("tags")){
			tags = $.address.parameter("tags").split(",");
		}
		new_elements = add_and_filter_array(tags, this.value, row_values);
		$.address.parameter("tags",new_elements.join(","));
	}).delegate(".chart.barchart","redraw",function(event){
		var chart = $(this)
		if(event.percent == undefined){
			event.percent = chart.data("percent");
		}
		if(event['percent']){
			$("input.percent",chart).attr("checked",true);
		}else{
			$("input.percent",chart).attr("checked",false);
		}
	}).delegate(".chart.barchart input.percent","click",function(){
		if(this.checked){
			$(this).parents(".chart:first").data("percent",true).trigger("redraw");
		}else{
			$(this).parents(".chart:first").data("percent",false).trigger("redraw");
		}
	}).delegate(".canvas .bar","click",function(event){
		event.preventDefault();
		$.address.parameter("tags",$(this).data("tags").join(","));
	}).delegate(".column .label","click",function(event){
		event.preventDefault();
		var column = $(this).parents(".column:first");
		column_values = [];
		$(".column",column.parents(".canvas:first")).each(function(){
			column_values.push($(this).attr("value"));
		});
		var tags = [];
		if($.address.parameter("tags")){
			tags = $.address.parameter("tags").split(",");
		}
		new_elements = add_and_filter_array(tags, column.attr("value"), column_values, true);
		$.address.parameter("tags",new_elements.join(","));
	});
});

function add_and_filter_array(original_arr,value,remove_values,removable){
	var new_arr = []
	var remove = false;
	for(var i in original_arr){
		if(removable && original_arr[i] == value){
			remove = true
		}else if(in_array(remove_values,original_arr[i])){
			// dump
		}else{
			new_arr.push(original_arr[i]);
		}
	}
	if(!remove){
		new_arr.push(value);
	}
	return new_arr;
}