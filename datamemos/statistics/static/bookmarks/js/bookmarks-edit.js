$(document).ready(function(){
	$("a.bookmarks-add").click(function(event){
		event.preventDefault();
		var button = $(this);
		if(button.hasClass("disabled")){
			return ;
		}
		$.ajax({
			url:"/statistics/save/",
			type:"POST",
			data:{
				chart_id:$.address.parameter("chart"),
				tags:$.address.parameter("tags")
			},
			success:function(data){
				if(data['statistic']['markup']){
					$("#notes-edit .bookmarks-list").append(data['statistic']['markup']);
				}
				button.addClass("disabled");
			}
		});
	});
	
	$.address.change(function(){
		$("a.bookmarks-add").removeClass("disabled");
	});
	
	$(".wrapper").delegate("form.note.create","presubmit",function(event){
		var form = $(this);
		$("input[type='hidden'][name='chart_id']",form).remove();
		var bookmarks = [];
		$(".bookmarks-list .bookmark").each(function(){
			bookmarks.push($(this).attr("bookmark-id"));
		});
		form.append('<input type="hidden" name="bookmarks" value="'+bookmarks.join(",")+'" />');
		if(!$(".bookmarks-add").hasClass("disabled")){
			if($("input[type='hidden'][name='chart_id']",form).length < 1){
				form.append('<input type="hidden" name="chart_id" />');
			}
			$("input[type='hidden'][name='chart_id']",form).val($.address.parameter("chart"));
			if($("input[type='hidden'][name='tags']",form).length < 1){
				form.append('<input type="hidden" name="tags" />');
			}
			var tags = "";
			$("input[type='hidden'][name='tags']",form).val($.address.parameter("tags"));			
		}
	}).delegate("form.note.create","saved",function(event){
		$(".bookmarks-list").html("");
	});
});