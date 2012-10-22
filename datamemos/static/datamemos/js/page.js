$(document).ready(function(){
	$.address.change();
});

$(document).ready(function(){
	$(".sticky").each(function(){
		$(this).data("top",$(this).offset().top);
		$(this).data("width",$(this).width());
	});
	$(window).scroll(function(event){
		$(".sticky").each(function(){
			var sticky = $(this);
			if($(window).scrollTop() > sticky.data("top")){
				sticky.addClass("sticky-stuck").css({
					position:'fixed',
					top:'0px',
					width: sticky.data("width")
				});
				// catch the bottom??
			}else{
				sticky.removeClass("sticky-stuck").css({
					position:'static',
					top:'0px',
					width:"auto"
				});
			}
		});
	});
});