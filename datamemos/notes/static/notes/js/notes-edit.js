$(document).ready(function(){
	$("#notes-edit").delegate("a.bookmarks-add","click",function(event){
		event.preventDefault();
		$.ajax({
			url:"/statistics/save/",
			type:"POST",
			data:{
				chart_id:$.address.parameter("chart"),
				tags:$.address.parameter("tags")
			},
			success:function(data){
				if(data['statistic']['markup']){
					$("#notes-edit .bookmarks-list").append(data['statistic']['markup']);
				}
			}
		});
	}).delegate(".create-note","click",function(event){
		event.preventDefault();
		var button = $(this);
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
			success:function(data){
				if(data['form']){
					button.hide();
					$("#notes-edit .notes-container").append(data['form']);
				}
			}
		});
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
				if(data['message']){
					form.before('<span class="alert '+data['message']['type']+'">'+data['message']['text']+'</span>');
				}
				if(data['form']){
					form.after(data['form']);
					form.remove();
					return;
				}
				form.trigger("saved");
				if(data['note']){
					if(data['note']['markup']){
						form.after(data['note']['markup']);	
					}
					if(data['note']['type']){
						$("#notes-list .notes-nav a[note-type='"+data['note']['type']+"']").click();
					}
				}
				form.remove();
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
				var close_bttn = '<a href="#" class="close"><i></i>Close</a>';
				$("#notes-edit .notes-container").prepend(close_bttn).append(close_bttn);
			}
		})
	});
	$.address.change(function(){
		if($.address.parameter("note")){
			$("#notes-edit .notes-container").html("");
			$.ajax({
				url:'/notes/'+$.address.parameter("note")+'/get/',
				type:"GET",
				success:function(data){
					if(data['note']){
						if(data['note']['markup']){
							$("#notes-edit .notes-container").html(data['note']['markup']);	
						}
						if(data['note']['type']){
							$("#notes-list .notes-nav a[note-type='"+data['note']['type']+"']").click();
						}
					}
					if(data['message']){
						$("#notes-edit .notes-container").prepend('<span class="alert '+data['message']['type']+'">'+data['message']['text']+'</span>');
					}
					var close_bttn = '<a href="#" class="close"><i></i>Close</a>';
					$("#notes-edit .notes-container").prepend(close_bttn).append(close_bttn);
				}
			});
		}
	});
});