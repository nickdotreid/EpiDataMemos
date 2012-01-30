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
		for(index in data){
			var col_data = data[index]
			$(".chart .canvas",$(this)).append($("#templates .column").clone());
			$(".chart .column:last",$(this)).data("data",data[index]);
			$(".chart .column:last .label",$(this)).html(data[index]['Label']);
			// add bar for each value
			find_values(col_data,function(value,name,parent){
				if(value != col_data['Label']){
					$(".chart .column:last",chart).append($("#templates .bar").clone());
					$(".chart .column:last .bar:last",chart).data("name",name).data("amount",value).data("parent",parent);
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
				x = i*5;
				if(bar.data("parent")==event.filter){
					ypos -= height;
					y = ypos;
					if(y<1){
						y=0;
					}
					x=0;
				}
				bar.data("_height",height).data("_top",y).data("_left",x);
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
				bar.css("z-index",z_pos);
				if(bar.data("name")==event.filter){
					above = true;
					bar.removeClass("left").removeClass("right").removeClass("sibling");
				}
			}
			if(!above){
				$(".bar",column).removeClass("sibling").removeClass("left").removeClass("right");
			}
			$(".bar:not(.active)",column).each(function(){
				if(!in_array(active_bars,this)){
					$(this).data("_top",graph.height()).data("_height",0).trigger("animate").trigger({type:"format",percent:event.percent,filter:event.filter});
				}
			});
		});
		$(".chart",$(this)).trigger({
			type:"sort_columns",
			filter:event.filter,
			highlight:event.highlight
			});
	});
	
	$("#chart").delegate(".chart","sort_columns",function(event){
		event = fill_in_values(event);
		xpos = 0;
		$(".column",$(this)).each(function(){
			column = $(this);
			xpos += Number(column.css("margin-left").replace("px",''));
			column.animate({
					left:xpos+'px'
				},{
					duration:500,
					queue:false
				});
			// get right most point
			right_most = $(".label",column).width();
			bars = get_sorted_active_bars(column,event);
			for(var i=0;i<bars.length;i++){
				bar = $(bars[i]);
				if(bar.data("_left")){
					bar_right = bar.width()+bar.data("_left");
					if(bar_right>right_most){
						 right_most = bar_right;
					}
				}
			}
			// add right most point to xpos
			xpos += right_most;
			// add margin-right to xpos
			xpos += Number(column.css("margin-left").replace("px",''));
		});
	}).delegate(".column","expand",function(event){
		column = $(this);
		event = fill_in_values(event);
		bars = get_sorted_active_bars(column,event);
		for(var i=0;i<bars.length;i++){
			bar = $(bars[i]);
			if(event.filter != bar.data("parent")){
				bar.data("_left",i*20);
			}
		}
		$(".bar",column).trigger("animate");
		column.parents(".chart:first").trigger("sort_columns");
	}).delegate(".column","collapse",function(event){
		column = $(this);
		event = fill_in_values(event)
		bars = get_sorted_active_bars(column,event);
		for(var i=0;i<bars.length;i++){
			bar = $(bars[i]);
			if(event.filter != bar.data("parent")){
				bar.data("_left",i*5);
			}
		}
		$(".bar",column).trigger("animate");
		column.parents(".chart:first").trigger("sort_columns");
	});
	
	$("#chart").delegate(".bar","format",function(event){
		var bar = $(this);
		event = fill_in_values(event);
		if(bar.data("name")==event.filter){
			bar.addClass("selected");
		}
		if(!bar.data("_height") || bar.data("_height")<1){
			$(".amount",bar).hide();
		}
		
		total = bar.parents(".column:first").data("data")['Total'];
		$(".total",bar).html(format_number(total));
		
		$(".amount",bar).html(format_number(bar.data("amount")));
		if(event.percent){
			percent = format_number((bar.data("amount")/total),event.percent);
			$(".amount",bar).html(percent);
		}
	}).delegate(".bar","animate",function(event){
		bar = $(this);
		bar.animate({
				height:bar.data("_height")+'px',
				top:bar.data("_top")+'px',
				left:bar.data("_left")+'px'
			},{
				duration:500,
				queue:false					
		})
	}).delegate(".bar","highlight",function(event){
		bar = $(this);
		column = bar.parents(".column:first");
		bar.trigger("format");
		highlight = $(".highlight",bar).clone();
		bar.data("highlight",highlight);
		canvas = bar.parents(".canvas:first");
		canvas.append(highlight);
		y = bar.data("_top")-highlight.height();
		if(!y || y<0){
			y = 0;
		}
		x = column.position().left+bar.data("_left")+(bar.width()/2)-(highlight.width()/2);
		highlight.css({
			top:y+'px',
			left:x+'px'
		})
	}).delegate(".bar","unhighlight",function(event){
		$(this).data("highlight").remove();
	});
	
	$("#chart").trigger("loadr");
	
	$.address.change(function(event){
		$("#chart").trigger("redraw");
	});
});

function get_sorted_active_bars(column,event){
	event = fill_in_values(event);
	get_active_bars = function(){
		bar = $(this);
		add = false;
		if(bar.data("name") == event.filter || bar.data("parent") == event.filter){
			add = true;
		}
		if(!add){
		for(index in active_bars){
			if($(active_bars[index]).data("parent")==bar.data("parent")){
				add = true;
			}
		}
		}
		if(add && !in_array(active_bars,this)){
			active_bars.push(this);
		}
	}
	active_bars = [];
	$(".bar",column).each(get_active_bars);
	$(".bar",column).each(get_active_bars); // twice to catch them all
	

	sorted_active_bars = active_bars.sort(function(a,b){
		if($(a).data("amount")>$(b).data("amount")){
			return 1;
		}
		return -1;
	});
	return sorted_active_bars;
}