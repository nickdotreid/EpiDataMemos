if(!statistic_save_uri){
	var statistic_save_uri = '/statistics/save/';
}
if(!statistic_get_uri){
	var statistic_get_uri = '/statistics/';
}

$(document).ready(function(){
	$(document).delegate(".chart .table .point","click",function(event){
		var point = $(this);
		$.ajax({
			url:statistic_save_uri,
			type:'POST',
			data:{
				tags:$(this).data("tags"),
				chart_id:point.parents(".chart:first").data("id"),
			},
			success:function(data){
				
			}
		})
	});
});