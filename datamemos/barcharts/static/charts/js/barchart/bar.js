$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart .bar","bar-init",function(event){
		var bar = $(this);
		bar.data("amount",Number(bar.attr("amount")));
		bar.data("total",Number(bar.attr("total")));
		bar.data("percent",Number(bar.attr("percent")));
		bar.height("0px").css("top",bar.parents(".canvas:first").height());
	}).delegate(".chart.barchart .bar","bar-calculate",function(event){
		var bar = $(this);
		var match = bar.data("matches");
		var _height = 0;
		var _y = 0;
		var _x = 0;
		bar.removeClass("stacked");
		var prev = bar.prev(".bar");
		if(prev.length>0){
			_x = prev.data("x");
			if(!event.stacked && prev.data("height")>0){
				var offset = bar.width()/10;
				if(bar.parents(".column:first").hasClass("selected")){
					offset += offset*2;
				}
				_x += offset;	
			}
			if(event.stacked){
				bar.addClass("stacked");
				_y = prev.data("y") + prev.data("height");
			}
		}
		if(match>0){
			var value = bar.data("amount")/event.max;
			_height = bar.parents(".canvas:first").height()*value;
		}
		bar.data({
			"height":_height,
			"x":_x,
			"y":_y
		});
	}).delegate(".chart.barchart .bar","bar-animate",function(event){
		var bar = $(this);
		bar.removeClass("selected");
		for(var i in event.tags){
			if(event.tags[i] != bar.parents(".column:first").attr("value") && in_array(bar.data("tags"),event.tags[i])){
				bar.addClass("selected");
			}
		}
		bar.animate({
			height:bar.data("height")+'px',
			top:Math.round(bar.parents(".canvas:first").height()-bar.data("height")-bar.data("y"))+"px",
			left:bar.data("x")+"px"
		},{
			duration:bar.parents(".chart:first").data("animation-time"),
			queue:false
		})
	});
});