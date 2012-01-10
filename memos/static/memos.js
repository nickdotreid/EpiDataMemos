$(document).ready(function(){
	$("#chart").bind("draw",function(){
		$("#memos").trigger("loadr");
	});
	
	$("#memos").bind("loadr",function(){
		$.ajax({
			url:$(this).data("src"),
			type:"POST",
			data:{ajax:true,graph:$("#chart").data("name")},
			success:function(data){
				$("#memos").html(data['content']);
			}
		})
	});
});