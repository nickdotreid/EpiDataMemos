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
		
		$(".chart .column",$(this)).each(function(){
			column = $(this);
			data = column.data("data");
			column.addClass(String(data['Label']));
			
			sorted_active_bars = get_sorted_active_bars(column,event);
			$(".bar",column).removeClass("active").removeClass("selected");
			ypos = graph.height();
			for(i=sorted_active_bars.length-1;i>=0;i--){
				bar = $(sorted_active_bars[i]);
				bar.addClass("active");
				
				value = bar.data("amount");
				if(event.percent){
					value = value/data['Total'];
				}
				percent = value/chart_max;
				height = graph.height()*percent;
				
				y = graph.height() - height;
				if(bar.data("parent")==event.filter){
					ypos -= height;
					y = ypos;
					if(y<1){
						y=0;
					}
				}
				bar.data("_height",height).data("_top",y);
				bar.trigger("animate").trigger({type:"format",percent:event.percent,filter:event.filter});
			}

			var z_pos = active_bars.length + 10;
			var above = false;
			$(".bar",column).removeClass("left").removeClass("right").addClass("sibling");
			for(i in sorted_active_bars){
				bar = $(sorted_active_bars[i]);
				
				if(above){
					z_pos = z_pos-1;
					bar.addClass("right");
				}else{
					z_pos = z_pos+1;
					bar.addClass("left");
				}
				bar.css("z-index",z_pos).data("z-index",z_pos);
				if(bar.data("name")==event.filter){
					above = true;
					bar.removeClass("left").removeClass("right").removeClass("sibling");
				}
			}
			
			if(!above){
				$(".bar",column).removeClass("sibling").removeClass("left").removeClass("right");
			}
			
			column.trigger({
				type:"stagger_bars",
				filter:event.filter,
				highlight:event.highlight,
				percent:event.percent
			});
			
			$(".bar:not(.active)",column).each(function(){
				if(!in_array(active_bars,this)){
					$(this).data("_top",graph.height()).data("_height",0);
					$(this).trigger("animate");
					$(this).trigger({type:"format",percent:event.percent,filter:event.filter});
				}
			});
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