$(document).ready(function(){
	$("#chart").delegate(".bar","dblclick",function(event){
		$.address.parameter("filter",$(this).data("name"));
	});
});