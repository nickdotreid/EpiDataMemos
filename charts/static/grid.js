$(document).ready(function(){
	$("#chart").bind("ext-draw",function(){
		$(".chart",$(this)).prepend('<div class="grid"></div>');
	}).bind("redraw",function(){
		var chart = $(this);
		var graph = $(".chart",chart);
		var chart_max = chart.data("max");
		var ticks = make_ticks(0,chart_max,5);
		for(index in ticks){
			tick = ticks[index];
			if($(".grid .tick[data-value='"+tick+"']",graph).length<1){
				$(".grid").append('<div class="tick" data-value="'+tick+'">'+format_number(tick)+'</div>');
				$(".grid .tick:last").css("top",graph.height()+'px').css("opacity",0);
			}
		}
		$(".grid .tick",graph).each(function(){
			var tick = $(this);
			var opacity = 1;
			if(!in_array(ticks,tick.data("value"))){
				var opacity = 0;
			}
			tick.animate({
				top:(graph.height()-(graph.height()*(tick.data("value")/chart_max)))+'px',
				opacity:opacity
			},{
				duration:700,
				queue:false
			});
		});	
	});
})