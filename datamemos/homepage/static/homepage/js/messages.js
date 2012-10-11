$(document).ready(function(event){
	$(document).ajaxComplete(function(event, XMLHttpRequest, ajaxOptions){
		var data = $.parseJSON(XMLHttpRequest.responseText);
		if(data && data['message']){
			alert(data['message']['text']);
		}
	});
});