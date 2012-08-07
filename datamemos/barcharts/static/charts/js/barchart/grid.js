$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart","grid-draw",function(){
		$(".canvas",$(this)).append('<div class="grid"></div>');
		$(".grid:last",$(this)).css({
			top:'0px',
			left:'0px'// will set css to scale column
		});
	}).delegate(".chart.barchart .grid","grid-redraw",function(event){
		event = fill_in_values(event);
		var grid = $(this);
		var graph = grid.parents(".canvas:first");
		var chart = grid.parents(".chart:first");
		if(!event.chart_max){
			return true;
		}
		var ticks = make_ticks(0,event.chart_max,event.ticks);
		for(var i=0;i<ticks.length;i++){
			tick = ticks[i];
			if($(".grid .tick[data-value='"+tick+"']",graph).length<1){
				$(".grid").append('<div class="tick" data-value="'+tick+'">'+format_number(tick,event.percent)+'</div>');
				$(".grid .tick:last").css("top",graph.height()+'px').css("opacity",0);
			}
		}
		
		$(".grid .tick",graph).each(function(){
			var tick = $(this);
			var opacity = 1;
			if(!in_array(ticks,tick.data("value"))){
				var opacity = 0;
			}
			if(!event.chart_max){
				return true;
			}
			tick.animate({
				top:(graph.height()-(graph.height()*(tick.data("value")/event.chart_max)))+'px',
				opacity:opacity
			},{
				duration:chart.data("animation-time")*1.5,
				queue:false
			});
		});	
	});
});