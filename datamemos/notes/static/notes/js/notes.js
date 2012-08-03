if(!note_create_uri){
	var note_create_uri = "/notes/create/";
}
$(document).ready(function(){
	$("#note-container").delegate(".nav .create-note","click",function(event){
		event.preventDefault();
		$.ajax({
			url:note_create_uri,
			type:"GET",
			success:function(data){
				if(data['form']){
					$("#note-container").append(data['form']);	
				}
			}
		})
	}).delegate("form.note.create","submit",function(event){
		event.preventDefault();
		var form = $(this);
		form.addClass("loading");
		form.trigger("presubmit");
		$.ajax({
			url:note_create_uri,
			type:"POST",
			data:form.serialize(),
			success:function(data){
				form.remove();
			},
			error:function(data){
				if(data['form']){
					form.after(data['form']);
					form.remove();
				}
			}
		});
	});
	$(".wrapper").delegate("#note-container","get-notes",function(event){
		$.ajax({
			url:"/notes/",
			type:"GET",
			data:{
				chart_id:event['chart_id'],
			},
			success:function(data){
				
			}
		});
	});
});