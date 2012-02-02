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
			$(".chart .column:last",$(this)).data("data",data[index]);
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
				bar.css("z-index",z_pos);
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
				stagger_width:5,
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
	
	$("#chart").delegate(".chart","sort_columns",function(event){
		event = fill_in_values(event);
		var xpos = 0;
		$(".column",$(this)).each(function(){
			var column = $(this);
			xpos += Number(column.css("margin-left").replace("px",''));
			column.data("_left",xpos).animate({
					left:xpos+'px'
				},{
					duration:500,
					queue:false
				});
			// get right most point
			var right_most = $(".label",column).width();
			var bars = get_sorted_active_bars(column,event);
			for(var i=0;i<bars.length;i++){
				var bar = $(bars[i]);
				if(bar.data("_left")){
					var bar_right = bar.width()+bar.data("_left");
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
		// center canvas
		var graph = $(this);
		var canvas = $(".canvas",graph);
		var canvas_pos = 0;
		if(xpos<graph.width()){
			canvas_pos = (graph.width()/2) - (xpos/2);
		}
		$(".canvas",$(this)).animate({
			left:canvas_pos+'px',
			top:graph.css("padding-top")
		},{
			duration:500,
			queue:false
		})
		
	}).delegate(".column","expand",function(event){
		column = $(this);
		event = fill_in_values(event)
		event.stagger_width = 25;
		event.type = "stagger_bars";
		column.trigger(event);
	}).delegate(".column","collapse",function(event){
		column = $(this);
		event = fill_in_values(event)
		event.stagger_width = 5;
		event.type = "stagger_bars";
		column.trigger(event);
	}).delegate(".column","stagger_bars",function(event){
		column = $(this);
		event = fill_in_values(event);
		if(!event.stagger_width){
			stagger_width = 10;
		}
		bars = get_sorted_active_bars(column,event);
		for(var i=0;i<bars.length;i++){
			bar = $(bars[i]);
			if(event.filter != bar.data("parent")){
				bar.data("_left",i*event.stagger_width);
			}else{
				bar.data("_left",0);
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
		$(".amount",bar).css("top",'0px').html(format_number(bar.data("amount"))).show();
		if(!bar.data("_height") || bar.data("_height")<1){
			$(".amount",bar).hide();
		}
		if(bar.data("_top") && bar.data("_top")<0){
			$(".amount",bar).css("top",(0-bar.data("_top"))+'px')
		}
		
		total = bar.parents(".column:first").data("data")['Total'];
		$(".total",bar).html("of " + format_number(total));
		
		$(".qualify",bar).html(bar.data("name"));
		
		if(event.percent){
			percent = format_number((bar.data("amount")/total),event.percent);
			$(".amount",bar).html(percent);
		}
	}).delegate(".bar","animate",function(event){
		bar = $(this);
		var _height = 0;
		if(bar.data("_height")){
			_height = bar.data("_height");
		}
		var _top = 0;
		if(bar.data("_top")){
			_top = bar.data("_top");
		}
		var _left = 0;
		if(bar.data("_left")){
			_left = bar.data("_left")
		}
		bar.animate({
				height:_height+'px',
				top:_top+'px',
				left:_left+'px'
			},{
				duration:500,
				queue:false					
		})
	}).delegate(".bar,.filter","over",function(event){
		var bar = $(this);
		var cmp = function(){
			if($(this).data("name") == bar.data("name")){
				$(this).addClass("hover");
				$(this).data("z-index",$(this).css("z-index")).css("z-index",500);
			}
		}
		$(".bar").each(cmp);
		$(".filter").each(cmp);
	}).delegate(".bar,.filter","out",function(event){
		var bar = $(this);
		var cmp = function(){
			if($(this).data("name") == bar.data("name")){
				$(this).removeClass("hover");
				$(this).css("z-index",$(this).data("z-index"));
			}
		}
		$(".bar").each(cmp);
		$(".filter").each(cmp);
	}).delegate(".bar","highlight",function(event){
		bar = $(this);
		column = bar.parents(".column:first");
		bar.trigger("format");
		highlight = $(".highlight",bar).clone();
		bar.data("highlight",highlight);
		canvas = bar.parents(".canvas:first");
		canvas.append(highlight);
		var column_left = 0;
		if(column.data("_left")){
			column_left = column.data("_left");
		}
		x = column_left+bar.data("_left")+bar.width();
//		x = column.position().left+bar.data("_left")+(bar.width()/2)-(highlight.width()/2);
		y = bar.data("_top")-(highlight.height()/2);
		if(!y || y<0){
			y = 0;
		}
		
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