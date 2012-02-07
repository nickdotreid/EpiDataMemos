$(document).ready(function(){
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
		graph = bar.parents(".chart:first");
		graph_padding_top = Number(graph.css("padding-top").replace("px",""))
		graph_top = graph.height()+graph_padding_top;
		if(bar.data("_top") && bar.data("_top")<(graph.height()+graph_padding_top)){
			$(".amount",bar).css("top",0+'px')
		}
		
		total = bar.parents(".column:first").data("data")['Total'];
		$(".total",bar).html("of " + format_number(total));
		
		$(".qualify",bar).html(bar.data("name"));
		
		if(event.percent){
			var percent = format_number((bar.data("amount")/total),event.percent);
			$(".amount",bar).html(percent);
		}
	}).delegate(".bar","animate",function(event){
		var bar = $(this);
		if(bar.data("animation_delay")){
			clearTimeout(bar.data("animation_delay"));
			bar.data("animation_delay",false);
		}
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
		bar.data("animation_delay",setTimeout(function(){
			bar.animate({
					height:_height+'px',
					top:_top+'px',
					left:_left+'px'
				},{
					duration:500,
					queue:false					
			});
			if(bar.data("highlight")){
				bar.trigger("highlight");
			}
			bar.data("animation_delay",false);			
		},100));
	}).delegate(".bar,.filter","over",function(event){
		var bar = $(this);
		$(".bar,.filter").each(function(){
			if($(this).data("name") == bar.data("name")){
				$(this).addClass("hover");
//				$(this).data("z-index",$(this).css("z-index")).css("z-index",500);
			}
		});
	}).delegate(".bar,.filter","out",function(event){
		var bar = $(this);
		$(".bar,.filter").each(function(){
			if($(this).data("name") == bar.data("name")){
				$(this).removeClass("hover");
//				$(this).css("z-index",$(this).data("z-index"));
			}
		});
	});
});