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