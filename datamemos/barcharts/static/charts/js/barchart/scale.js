$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart .scale","scale-draw",function(event){
		if(!event.max){
			return;
		}
		var scale = $(this);
		var graph = scale.parents(".canvas:first");
		var chart = scale.parents(".chart:first");
		
		var ticks = make_ticks(0,event.max,event.ticks);
		for(var i=0;i<ticks.length;i++){
			tick = ticks[i];
			if($(".tick[data-value='"+tick+"']",scale).length<1){
				scale.append('<div class="tick" data-value="'+tick+'">'+format_number(tick,event.percent)+'</div>');
				$(".tick:last",scale).css("top",graph.height()+'px').css("opacity",0);
			}
		}
		
		$(".tick",scale).each(function(){
			var tick = $(this);
			var opacity = 1;
			if(!in_array(ticks,tick.data("value"))){
				var opacity = 0;
			}
			tick.animate({
				top:(graph.height()-(graph.height()*(tick.data("value")/event.max)))+'px',
				opacity:opacity
			},{
				duration:chart.data("animation-time")*1.5,
				queue:false
			});
		});
	});
});