$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart .bar","bar-init",function(event){
		$(this).height("0px").css("top",$(this).parents(".canvas:first").height());
	}).delegate(".chart.barchart .bar","bar-calculate",function(event){
		var bar = $(this);
		var match = bar.data("matches");
		var _height = 0;
		var _y = 0;
		var _x = 0;
		var prev = bar.prev(".bar");
		if(prev.length>0){
			_x = prev.data("x");
			if(!event.stacked && prev.data("height")>0){
				var offset = bar.width()/10;
				_x += offset;	
			}
			if(event.stacked){
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
		bar.animate({
			height:bar.data("height")+'px',
			top:(bar.parents(".canvas:first").height()-bar.data("height")-bar.data("y"))+"px",
			left:bar.data("x")+"px"
		},{
			duration:1500
		})
	});
});