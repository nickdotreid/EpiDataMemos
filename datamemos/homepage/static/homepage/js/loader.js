$(document).ready(function(){
	if($.address.parameter("chart")){
		var chart_id = $.address.parameter("chart");
		$.ajax({
			url:"/charts/"+chart_id+"/",
			success:function(data){
				$("#chart-container").append('<div class="chart table"></div>').trigger({
					type:"load",
					data:data,
				});
				// get all descriptions for chart
				// get all comments for chart
			}
		})
	}
});