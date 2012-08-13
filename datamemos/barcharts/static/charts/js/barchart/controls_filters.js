$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart","redraw",function(event){
		var chart = $(this)
		if(!event.tags){
			event.tags = chart.data("tags");
		}
		if(event.percent == undefined){
			event.percent = chart.data("percent");
		}
		
		$(".filters input:checked").attr("checked",false);
		$(".tags-children").hide();
		for(var index in event.tags){
			var tag = event.tags[index]
			var input = $(".tag input[value='"+tag+"']");
			input.attr("checked",true);
			input.parents(".tags-children:first").show();
			$(".tags-children[parent='"+tag+"']",chart).show();
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
		if(event['percent']){
			$("input.percent",chart).attr("checked",true);
		}else{
			$("input.percent",chart).attr("checked",false);
		}
	}).delegate(".chart.barchart input.percent","click",function(){
		if(this.checked){
			$.address.parameter("percent",this.value);
		}else{
			$.address.parameter("percent",false);
		}
	}).delegate(".chart.barchart .filters .tag input","click",function(){
		$.address.parameter("tags",this.value);
	}).delegate(".column .label","click",function(event){
		event.preventDefault();
		var column = $(this).parents(".column:first");
		column_values = [];
		$(".column",column.parents(".canvas:first")).removeClass("selected").each(function(){
			column_values.push($(this).attr("value"));
		});
		var elements = $.address.parameter("tags").split(",");
		var new_elements = [];
		var removed = false;
		for(var i in elements){
			if(elements[i] == column.attr("value")){
				removed = true;
			}else if(column_values.indexOf(elements[i])>-1){
				// dump the value
			}else{
				new_elements.push(elements[i]);
			}
		}
		if(!removed){
			new_elements.push(column.attr("value"));
			column.addClass("selected");
		}
		$.address.parameter("tags",new_elements.join(","));
	});
});