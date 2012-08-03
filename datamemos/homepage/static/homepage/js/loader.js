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
				$("#note-container").trigger({
					type:"get-notes",
					chart_id:event['chart_id'],
				})
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
	
	
	$(".wrapper").delegate("form.note.create","presubmit",function(event){
		var form = $(this);
		if($("input[type='hidden'][name='chart_id']",form).length < 1){
			form.append('<input type="hidden" name="chart_id" />');
		}
		$("input[type='hidden'][name='chart_id']",form).val($.address.parameter("chart"));
		if($("input[type='hidden'][name='tags']",form).length < 1){
			form.append('<input type="hidden" name="tags" />');
		}
		var tags = "";
		$("input[type='hidden'][name='tags']",form).val($.address.parameter("tags"));
	})
	
});