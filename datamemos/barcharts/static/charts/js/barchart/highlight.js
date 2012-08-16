$(document).ready(function(){
	$(".wrapper").delegate(".chart .bar","highlight",function(event){
		var bar = $(this);
		var column = bar.parents(".column:first");
		var canvas = bar.parents(".canvas:first");
		
		$(".highlight:not(.bar .highlight)",canvas).remove();
		
		var highlight = $(".highlight",bar).clone();
		var arrow = $(".arrow",highlight);
		canvas.append(highlight);
		
		var x_offset = bar.position().left + column.position().left;
		var y_offset = bar.position().top;
		
		var x = 0;
		var y = 0;
		
		$("."+bar.attr("class").replace(" ","."),canvas).addClass("hover");
		
		if(bar.hasClass("stacked")){
			x = x_offset + bar.width();
			y = y_offset + bar.height()/2 - highlight.height()/2;
		}else{
			y = y_offset - highlight.height() - Number(highlight.css("margin-bottom").replace("px",""));
			x = x_offset - highlight.width()/2 + bar.width()/2;

			if(y < 0){
				x = x_offset + bar.width();
				y = canvas.height()/2 - highlight.height()/2;
			}else{
				highlight.addClass("above");
			}	
		}
		
		if(highlight.hasClass("above")){
			 arrow.css("top",highlight.height() +arrow.height() - 9 + "px");
		}else{
			arrow.css("top",highlight.height()/2 - arrow.height()/2 + "px");
		}		
		
		highlight.css({
			top:y+'px',
			left:x+'px'
		});
		highlight.show();
	}).delegate(".wrapper .bar","unhighlight",function(event){
		$(".bar.hover").removeClass("hover");
		$(".highlight:not(.bar .highlight)",$(this).parents(".canvas:first")).remove();
	}).delegate(".chart .bar","mouseenter",function(event){
		$(this).trigger("highlight");
	}).delegate(".chart .bar","mouseleave",function(event){
		$(this).trigger("unhighlight");
	});
});