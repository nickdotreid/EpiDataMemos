$(document).ready(function(){
	$("#chart").bind("loadr",function(event){
		chart = $(this);
		$.ajax({
			url:chart.data('src'),
			success:function(data){
				chart.data("data",data).trigger("draw");
			}
		})
	});
	
	$("#chart").trigger("loadr");
});