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
			

			active_bars = active_bars.sort(function(a,b){
				if($(a).data("amount")>$(b).data("amount")){
					return true;
				}
				return false;
			});
			
			$(".bar",column).removeClass("active").removeClass("selected");
			ypos = graph.height();
			for(i in active_bars){
				bar = $(active_bars[i]);
				bar.addClass("active");
				
				value = bar.data("amount");
				if(event.percent){
					value = value/data['Total'];
				}
				percent = value/chart_max;
				height = graph.height()*percent;
				
				y = graph.height() - height;
				z = 10-i;
				x = i*5;
				if(bar.data("parent")==event.filter){
					ypos -= height;
					y = ypos;
					if(y<1){
						y=0;
					}
					x=0;
				}
				bar.animate({
						height:height+'px',
						top:y+'px',
						left:x+'px',
						'z-index':z,
						opacity:1
					},{
						duration:500,
						queue:false					
				}).trigger({type:"format",percent:event.percent,filter:event.filter});
			}
			$(".bar:not(.active)",column).each(function(){
				bar = $(this);
				if(!in_array(active_bars,this)){
					bar.animate({
							height:'0px',
							top:graph.height()+'px',
							opacity:0
						},{
							duration:500,
							queue:false					
					});
				}
			});
		});
	});
	
	$("#chart").delegate(".bar","format",function(event){
		var bar = $(this);
		event = fill_in_values(event);
		if(bar.data("name")==event.filter){
			bar.addClass("selected");
		}
		$(".amount",bar).html(format_number(bar.data("amount")));
		if(event.percent){
			total = bar.parents(".column:first").data("data")['Total'];
			$(".amount",bar).html(format_number((bar.data("amount")/total),event.percent));
		}
		
	});
	
	$("#chart").trigger("loadr");
	
	$.address.change(function(event){
		$("#chart").trigger("redraw");
	});
});