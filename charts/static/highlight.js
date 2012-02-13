$(document).ready(function(){
	$("#chart").delegate(".bar","highlight",function(event){
		bar = $(this);
		$(".highlight:not(.bar .highlight)").remove();
		if(bar.data("highlight")){
			bar.data("highlight").remove();
		}
		column = bar.parents(".column:first");
//		bar.trigger("format");
		
		highlight = $(".highlight",bar).clone();
		bar.data("highlight",highlight);
		canvas = bar.parents(".canvas:first");
		canvas.append(highlight);
		graph = bar.parents(".chart:first");
		
		$(".amount",highlight).show()
		
		var column_left = 0;
		if(column.data("_left")){
			column_left = column.data("_left");
		}
		x = column_left+bar.data("_left")+bar.width();
		if(x+highlight.width()>graph.width()){
			x = column_left+bar.data("_left")-highlight.width();
			highlight.addClass("left");
		}
//		x = column.position().left+bar.data("_left")+(bar.width()/2)-(highlight.width()/2);
		y = bar.data("_top")-(highlight.height()/2);
		if(!y || y<0-Number(graph.css("padding-top").replace("px",""))){
			y = 0-Number(graph.css("padding-top").replace("px",""));
		}
		
		highlight.css({
			top:y+'px',
			left:x+'px'
		})
	}).delegate(".bar","unhighlight",function(event){
		bar = $(this);
		column = bar.parents(".column:first");
		if(bar.data("highlight")){
			bar.data("highlight").remove();
		}
		bar.data("highlight",false);
	});
});