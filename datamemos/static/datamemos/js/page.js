$(document).ready(function(){
	$.address.change();
});

$(document).ready(function(){
	$(".sticky").each(function(){
		$(this).data("top",$(this).offset().top);
	});
	$(window).scroll(function(event){
		$(".sticky").each(function(){
			var sticky = $(this)
			if($(window).scrollTop() > sticky.data("top") && sticky.width() != sticky.parents(".container").width()){
				sticky.css({
					position:'fixed',
					top:'0px'
				});
			}else{
				sticky.css({
					position:'static',
					top:'0px'
				});				
			}
		});
	});
});