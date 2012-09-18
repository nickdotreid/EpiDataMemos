$(document).ready(function(){
	$("#notes-edit").delegate(".create-note","click",function(event){
		event.preventDefault();
		var button = $(this);
		if(button.hasClass("disabled")){
			return ;
		}
		if($("form.note.create").length>0){
			return;
		}
		bookmarks = [];
		$(".bookmarks-container .bookmark").each(function(){
			bookmarks.push($(this).attr("bookmark-id"));
		});
		$.ajax({
			url:note_create_uri,
			type:"GET",
			data:{
				bookmarks:bookmarks
			},
		});
	}).ajaxSuccess(function(event,xhr,settings){
		var data = $.parseJSON(xhr.responseText);
		if(data['form']){
			$("#notes-edit .create-note").hide();
			$("#notes-edit .notes-container").append(data['form']);
			var cancel_btn = '<a href="#" class="cancel note-create-cancel">Cancel</a>';
			$("#notes-edit .notes-container").prepend(cancel_btn).append(cancel_btn);
		}
	}).delegate(".note-create-cancel","click",function(event){
		event.preventDefault();
		$("#notes-edit .notes-container").html("");
		$("#notes-edit .create-note").show();
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
				if(data['form']){
					form.after(data['form']);
					form.remove();
					return;
				}
				form.trigger("saved");
				if(data['note']){
					$.address.parameter("note",data['note']['id']);
				}
				form.remove();
				$(".create-note").show();
				$("#notes-edit .notes-nav .active").removeClass("active");
			}
		});
	});
	$("#note-container").delegate(".note .edit","click",function(event){
		event.preventDefault();
		var note = $(this).parents(".note:first");
		$("#notes-edit .notes-container").html("");
		$.ajax({
			url:'/notes/'+note.attr("note-id")+"/edit/",
			type:"POST",
			success:function(data){
				if(data['form']){
					$("#notes-edit .notes-container").html(data['form']);
				}
				if(data['message']){
					$("#notes-edit .notes-container").prepend('<span class="alert '+data['message']['type']+'">'+data['message']['text']+'</span>');
				}
			}
		})
	});
	$.address.change(function(){
		if($.address.parameter("note")){
			var note_id = $.address.parameter("note");
			if($("#note-"+note_id).length < 1){
				// search for note on server
			}else{
				// scroll to note_id
				$.address.parameter("note",false);
			}
		}
	});
});