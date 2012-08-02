$(document).ready(function(){
	$(".wrapper").delegate("#chart-container","get-chart",function(event){
		// unload existing chart
		if(!event.chart_id){
			alert("No Chart ID to load");
			return false;
		}
		$.ajax({
			url:"/charts/"+event.chart_id+"/",
			success:function(data){
				var markup = '<div class="chart table"></div>';
				if(data['markup']){
					markup = data['markup'];
				}
				$("#chart-container").append(markup).trigger({
					type:"load-chart",
					data:data,
				});
				// get all descriptions for chart
				// get all comments for chart
			}
		});
	});
	if($.address.parameter("statistic")){
		
	}else if($.address.parameter("note")){
		
	}else if($.address.parameter("chart")){
		$("#chart-container").trigger({
			type:"get-chart",
			chart_id:$.address.parameter("chart"),
		});
	}

});