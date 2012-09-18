$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart .scale","scale-draw",function(event){
		var scale = $(this);
		var graph = scale.parents(".canvas:first");
		var chart = scale.parents(".chart:first");
		
		if(!scale.data("grid")){
			scale.data("grid",$('<div class="grid"></div>').prependTo(graph));
		}
		var grid = scale.data("grid");
		
		scale.data("max",event.max);
		
		event_obj = {
			type:'tick-draw',
			max:event.max,
			ticks:event.ticks,
			percent:event.percent
		};
		
		grid.trigger(event_obj);
		scale.trigger(event_obj);
	}).delegate(".chart.barchart .scale","scale-remove",function(event){
		if($(this).data("grid")){
			$(this).data("grid").remove();
		}
		$(this).remove();
	}).delegate(".chart.barchart .scale,.chart.barchart .grid","tick-draw",function(event){
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
				scale.append('<div class="tick" data-value="'+tick+'"><span class="label">'+format_number(tick,event.percent)+'</span></div>');
				$(".tick:last",scale).css("top",graph.height()+'px').css("opacity",0);
			}
		}
		var widest = 0;
		$(".tick",scale).each(function(){
			var tick = $(this);
			var opacity = 1;
			if(!in_array(ticks,tick.data("value"))){
				var opacity = 0;
			}else{
				if(tick.width() > widest){
					widest = tick.width();
				}
			}
			tick.animate({
				top:(graph.height()-(graph.height()*(tick.data("value")/event.max)))+'px',
				opacity:opacity
			},{
				duration:chart.data("animation-time")*1.5,
				queue:false
			});
		});
		scale.width(widest);
	}).delegate(".chart.barchart .scale","grid-redraw",function(event){
		var scale = $(this);
		var graph = scale.parents(".canvas:first");
		var chart = scale.parents(".chart:first");
		var grid = scale.data("grid");
		if(!grid) return ;
		
		var border_width = css_to_number($(".grid:first").css("border-left-width")) + css_to_number($(".grid:first").css("border-right-width"));
		
		var left = scale.width() + css_to_number(scale.css("left"));
		var width = graph.width() - left - border_width;
		var next_scale = scale.nextAll(".scale:first");
		if(next_scale.length>0){
			width = css_to_number(next_scale.css("left")) - left - border_width;
		}
		
		grid.css({
			left:left +'px',
			width:width+'px'
		});
	});
});