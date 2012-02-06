$(document).ready(function(){
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
	event.stagger_width = 20;
	event.type = "stagger_bars";
	column.trigger(event);
}).delegate(".column","collapse",function(event){
	column = $(this);
	event = fill_in_values(event)
	event.type = "stagger_bars";
	column.trigger(event);
}).delegate(".column","stagger_bars",function(event){
	column = $(this);
	event = fill_in_values(event);
	if(!event.stagger_width){
		event.stagger_width = 5;
	}
	if(column.data("name") == event.highlight && event.stagger_width<20){
		event.stagger_width = 20;
	}
	var bars = get_sorted_active_bars(column,event);
	var xpos = 0;
	var bar_pos = 0;
	var center_bar = false
	if($(".bar.hover",column).length>0){
		center_bar = $(".bar.hover:first",column);
		bar_pos = in_array_position(bars,center_bar[0]);
		xpos = Number(center_bar.css("left").replace("px",""));
	}
	for(var i=0;i<bars.length;i++){
		var bar = $(bars[i]);
		if(event.filter != bar.data("parent")){
			bar.data("_left",i*event.stagger_width);
			if(center_bar){
				if(bar.data("amount")<center_bar.data("amount")){
					//xpos -= event.stagger_width;
					bar.data("_left",xpos-((bar_pos-i)*event.stagger_width));
				}else{
					xpos += event.stagger_width;
					if(center_bar.data("name")==bar.data("name")){
						xpos = Number(center_bar.css("left").replace("px",""));
					}
					bar.data("_left",xpos);
				}
			}
		}else{
			bar.data("_left",0);
		}
	}
	$(".bar",column).trigger("animate");
	column.parents(".chart:first").trigger("sort_columns");
}).delegate(".column","draw_column",function(event){
	var column = $(this);
	var data = column.data("data");
	var graph = column.parents(".chart:first");
	
	event = fill_in_values(event);
	if(!event.chart_max){
		event.chart_max = data['Total'];
	}
	var sorted_active_bars = get_sorted_active_bars(column,event);
	$(".bar",column).removeClass("active").removeClass("selected");
	var ypos = graph.height();
	for(var i=sorted_active_bars.length-1;i>=0;i--){
		var bar = $(sorted_active_bars[i]);
		bar.addClass("active");
		
		var value = bar.data("amount");
		if(event.percent){
			value = value/data['Total'];
		}
		var percent = value/event.chart_max;
		var height = graph.height()*percent;
		
		var y = graph.height() - height;
		if(bar.data("parent")==event.filter){
			ypos -= height;
			y = ypos;
			if(y<1){
				y=0;
			}
		}
		bar.data("_height",height).data("_top",y);
	}
	var z_pos = active_bars.length + 10;
	var above = false;
	$(".bar",column).removeClass("left").removeClass("right").addClass("sibling");
	for(i in sorted_active_bars){
		var bar = $(sorted_active_bars[i]);
		
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
		$(".bar",column).removeClass("left").removeClass("right");
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
		}
	});
	$(".bar",column).trigger("animate").trigger({type:"format",percent:event.percent,filter:event.filter});
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