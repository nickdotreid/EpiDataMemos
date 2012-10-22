$(document).ready(function(){
	$.address.change();
});

$(document).ready(function(){
	$(".sticky").bind("sticky:reset",function(){
		var sticky = $(this);
		sticky.removeClass("sticky-stuck");
		sticky.data("top",sticky.offset().top);
		sticky.data("left",sticky.position().left);
		sticky.trigger("sticky:scroll");
	}).bind("sticky:scroll",function(){
		var sticky = $(this);
		if(!sticky.is(":visible")) return ;
		var stick_it = false;
		if($(window).scrollTop() > sticky.data("top")) stick_it = true;
		if(!sticky.hasClass('sticky-stuck') && sticky.height() > $(window).height() && sticky.offset().top + sticky.height() >= $(window).height() + $(window).scrollTop()){
			stick_it = false;
		}
		if(stick_it){
			var new_y = $(window).scrollTop();			
			sticky.siblings(':visible').each(function(){
				var sib = $(this);
				if((sib).hasClass("sticky")) return ;
				if(new_y + sticky.height() >= sib.offset().top + sib.height() ){
					new_y = sib.offset().top + sib.height() - sticky.height();
				}				
			});
			sticky.addClass("sticky-stuck").css({
				top: new_y + 'px',
				left: sticky.data("left") + 'px'
			});
		}else{
			sticky.removeClass("sticky-stuck");
		}
	});
	$(".sticky").trigger("sticky:reset");
	$(window).scroll(function(event){
		$(".sticky").trigger("sticky:scroll");
	});
});