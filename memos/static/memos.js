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
		});
	}).delegate(".create","click",function(event){
		event.preventDefault();
		create_button = $(this);
		$.ajax({
			url:create_button.attr("href"),
			type:"POST",
			data:{ajax:true,graph:$("#chart").data("name")},
			success:function(data){
				create_button.hide().next("ul").prepend('<li>'+data['content']+'</li>');
			}
		});
	}).delegate("form.memo","submit",function(event){
		event.preventDefault();
		form = $(this);
		$.ajax({
			url:form.attr("action"),
			type:form.attr("method"),
			data:form.serialize()+'&ajax=true',
			success:function(data){
				form.after(data['content']);
				$("#memos .create").show();
				form.remove();
			}
		})
	}).delegate(".memo a.update,.memo a.close,.memo a.delete","click",function(event){
		event.preventDefault();
		button = $(this);
		memo = button.parents(".memo:first");
		if(memo.attr("id")=="new"){
			memo.parent().remove();
			$("#memos .create").show();
			return false;
		}
		$.ajax({
			url:button.attr("href"),
			type:"POST",
			data:{ajax:true},
			success:function(data){
				memo.after(data['content']);
				memo.remove();
			}
		});
	});
});