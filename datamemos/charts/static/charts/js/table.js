if(!statistic_save_uri){
	var statistic_save_uri = '/statistics/save/';
}
if(!statistic_get_uri){
	var statistic_get_uri = '/statistics/';
}

$(document).ready(function(){
	$(document).delegate(".chart .table .point","click",function(event){
		$.address.parameter("tags",$(this).data("tags"));
	});
});