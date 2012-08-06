$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart","redraw",function(event){
		var chart = $(this)
		if(!event.tags){
			event.tags = chart.data("tags");
		}
		
		$(".filters input:checked").attr("checked",false);
		$(".tags-children").hide();
		for(var index in event.tags){
			var tag = event.tags[index]
			var input = $(".tag input[value='"+tag+"']");
			input.attr("checked",true);
			input.parents(".tags-children:first").show();
			$(".tags-children[parent='"+tag+"']",chart).show();
		}
		if(event['percent']){
			$("input.percent",chart).attr("checked",true);
		}else{
			$("input.percent",chart).attr("checked",false);
		}
	}).delegate(".chart.barchart input.percent","click",function(){
		if(this.checked){
			$.address.parameter("percent",this.value);
		}else{
			$.address.parameter("percent",false);
		}
	}).delegate(".chart.barchart .filters .tag input","click",function(){
		$.address.parameter("tags",this.value);
	});
});