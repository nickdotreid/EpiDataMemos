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
				$("#memos").trigger("loaded");
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
				create_button.hide().after(data['content']);
			}
		});
	}).delegate("form.memo","submit",function(event){
		event.preventDefault();
		form = $(this);
		query_string = '&ajax=true';
		if($('input[name=graph]',form).length<1){
			query_string += '&graph='+$("#chart").data("name");
		}
		if($.address.parameter('filter') && $('input[name=filter]',form).length<1){
			query_string += '&filter='+$.address.parameter('filter');
		}
		if($.address.parameter('highlight') && $('input[name=highlight]',form).length<1){
			query_string += '&highlight='+$.address.parameter('highlight');
		}
		$.ajax({
			url:form.attr("action"),
			type:form.attr("method"),
			data:form.serialize()+query_string,
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
			memo.remove();
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