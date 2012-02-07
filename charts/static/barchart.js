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
		var data = $(this).data("data");
		
		$(".chart",chart).append('<div class="canvas"></div>');
		$(".chart .canvas",chart).css("top",$(".chart",chart).css("padding-top"));
		for(var i=0;i<data.length;i++){
			var col_data = data[i]
			$(".chart .canvas",$(this)).append($("#templates .column").clone());
			$(".chart .column:last",$(this)).data("data",data[i]).data("name",data[i]['Label']);
			$(".chart .column:last .label",$(this)).html(data[i]['Label']+'<span class="total">'+data[i]['Total']+' People Total</span>');
			find_values(col_data,function(value,name,parent){
				if(value != col_data['Label']){
					$(".chart .column:last",chart).append($("#templates .bar").clone());
					$(".chart .column:last .bar:last",chart).data("name",name).data("amount",value).data("parent",parent);
					$(".chart .column:last .bar:last",chart).addClass(name_to_class(parent)).addClass(name_to_class(name));
					$(".chart .column:last .bar:last .amount",chart).html(value);
				}
			});
		}
		$(".chart .column .bar",chart).height("0px").css("top",$(".chart",chart).height());
		$(this).trigger("ext-draw");
		$(this).trigger("redraw");
	}).bind("redraw",function(event){
		var chart = $(this);
		var graph = $(".chart",chart);
		event = fill_in_values(event);
		set_button_state({
			filter:event.filter
		});
		
		var has_children = false;
		var chart_max = array_max(chart.data("data"),function(item){
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
		
		$(".chart .column",$(this)).trigger({
			type:"draw_column",
			filter:event.filter,
			highlight:event.highlight, 
			chart_max:chart_max
		});
		
		$(".chart",$(this)).trigger({
			type:"sort_columns",
			filter:event.filter,
			highlight:event.highlight
		});
		$(".grid",$(this)).trigger({
			type:"grid_redraw",
			filter:event.filter,
			highlight:event.highlight,
			percent:event.percent,
			chart_max:chart_max
		});
		if(event.filter && event.highlight){
			$(".column",chart).each(function(){
				var column = $(this);
				if(column.data("name")==event.highlight){
					$(".bar",column).each(function(){
						var bar = $(this);
						if(bar.data("name")==event.filter){
							bar.trigger("highlight");
						}
					});
				}
			});
		}
	});
	$.address.change(function(event){
		$("#chart").trigger("redraw");
	});
	$("#chart").trigger("loadr");
});