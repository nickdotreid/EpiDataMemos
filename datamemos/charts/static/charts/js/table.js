if(!statistic_save_uri){
	var statistic_save_uri = '/statistics/save/';
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
				alert("saved");
			}
		})
	});
});