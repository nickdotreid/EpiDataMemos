if(!note_create_uri){
	var note_create_uri = "/notes/create/";
}
$(document).ready(function(){
	$("#note-container").delegate(".create-note","click",function(event){
		event.preventDefault();
		var button = $(this);
		if($("form.note.create").length>0){
			return;
		}
		$.ajax({
			url:note_create_uri,
			type:"GET",
			success:function(data){
				if(data['form']){
					button.after(data['form']);
					button.hide();
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
				$(".create-note").show();
				add_note(data['note']);
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
				if(data['notes']){
					for(var index in data['notes']){
						add_note(data['notes'][index]);
					}
					// sort notes
				}
			}
		});
	});
});

function add_note(data){
	if($("#note-id").length > 0){
		return false;
	}
	var note = $("#templates .note").clone();
	note.attr("id","note-"+data['id']);
	$(".text",note).html(data['text']);
	if(data['author']){
		$(".text",note).html(data['text']).show();
	}
	if(data['pub-date']){
		$(".pub-date",note).html(data['pub-date']).show();
	}
	if(data['editable']){
		$(".edit",note).attr("href","/notes/"+data['id']+'/edit/').show();
	}
	if(data['type']=="description"){
		note.addClass("description");
		$("#descriptions").append(note);
		return true;
	}
	$("#comments").append(note);
	return true;
}