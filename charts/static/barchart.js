$(document).ready(function(){
	$("#chart").bind("loadr",function(event){
		var chart = $(this);
		$.ajax({
			url:chart.data('src'),
			success:function(data){
				chart.data("data",data['columns']).data("order",data['order']).trigger("draw");
			}
		});
	}).bind("draw",function(event){
		var chart = $(this);
		data = $(this).data("data");
		
		$(".chart",chart).append('<div class="canvas"></div>');
		$(".chart .canvas",chart).css("top",$(".chart",chart).css("padding-top"));
		for(index in data){
			var col_data = data[index]
			$(".chart .canvas",$(this)).append($("#templates .column").clone());
			$(".chart .column:last",$(this)).data("data",data[index]).data("name",data[index]['Label']);
			$(".chart .column:last .label",$(this)).html(data[index]['Label']);
			// add bar for each value
			find_values(col_data,function(value,name,parent){
				if(value != col_data['Label']){
					$(".chart .column:last",chart).append($("#templates .bar").clone());
					$(".chart .column:last .bar:last",chart).data("name",name).data("amount",value).data("parent",parent);
					$(".chart .column:last .bar:last",chart).addClass(name_to_class(parent)).addClass(name_to_class(name));
					$(".chart .column:last .bar:last .amount",chart).html(value);
				}
			});
		}
		$(".chart .column .bar",$(this)).height("0px").css("top",$(".chart",$(this)).height());
		$(this).trigger("ext-draw");
		$(this).trigger("redraw");
	}).bind("redraw",function(event){
		var chart = $(this);
		var graph = $(".chart",chart);
		event = fill_in_values(event);
		
		set_button_state({
			filter:event.filter
		});
		
		has_children = false;
		chart_max = array_max(chart.data("data"),function(item){
			var biggest_number = 0;
			var total = item['Total'];
			find_values(item,function(value,index,parent){
				if(event.percent){
					value = value/total;
				}
				if(event.filter == index && value>biggest_number){
					biggest_number = value;
				}else if(event.filter == parent){
					biggest_number += value;
				}
			});
			return biggest_number;
		});
		chart.data("max",chart_max);
		
		$(".chart .column",$(this)).trigger({
			type:"draw_column",
			chart_max:chart_max
		});
		$(".chart",$(this)).trigger({
			type:"sort_columns",
			filter:event.filter,
			highlight:event.highlight
		});
	});
	$.address.change(function(event){
		$("#chart").trigger("redraw");
	});
	$("#chart").trigger("loadr");
});