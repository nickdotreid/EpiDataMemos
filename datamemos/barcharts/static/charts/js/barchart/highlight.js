$(document).ready(function(){
	$(".wrapper").delegate(".chart .bar","highlight",function(event){
		var bar = $(this);
		var highlight = $(".highlight",bar);	
		var canvas = bar.parents(".canvas:first");
		
		$("."+bar.attr("class").replace(" ","."),canvas).addClass("hover");
		
		var y = 0 - highlight.height() - Number(highlight.css("margin-bottom").replace("px",""));
		var x = 0 - highlight.width()/2 + bar.width()/2;
		
		combinded_height = bar.height()+highlight.height()+Number(highlight.css("margin-bottom").replace("px",""));
		
		if(bar.hasClass("stacked") || combinded_height > canvas.height()){
			if(bar.height()>highlight.height()){
				x = bar.width();
				y = bar.height()/2 - highlight.height()/2;
			}
		}
		
		highlight.css({
			top:y+'px',
			left:x+'px'
		}).show();
	}).delegate(".wrapper .bar","unhighlight",function(event){
		$(".bar.hover").removeClass("hover");
		$(".highlight",$(this)).hide();
	}).delegate(".chart .bar","mouseenter",function(event){
		$(this).trigger("highlight");
	}).delegate(".chart .bar","mouseleave",function(event){
		$(this).trigger("unhighlight");
	});
});