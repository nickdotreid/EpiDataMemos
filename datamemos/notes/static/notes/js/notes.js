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
					$("#notes-edit-area").html(data['form']);
					$("#notes-edit-area form").prepend('<a href="#" class="close">close</a>');
					button.parents("li:first").addClass("active");
				}
			}
		})
	}).delegate("#notes-edit-area .close","click",function(event){
		event.preventDefault();
		$("#notes-edit-area").html("");
		$("#note-container .create-note").parents("li:first").removeClass("active");
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
				$("#note-container .create-note").parents("li:first").removeClass("active");
				$("#note-type-selector a[note-type='comment']").click();	// should reload correct screen
			},
			error:function(data){
				if(data['form']){
					form.after(data['form']);
					form.remove();
				}
			}
		});
	});
	$("#note-container").delegate(".notes","sort",function(event){
		var container = $(this);
		var notes = $(".note",container);
		var tags = event.tags;
		var tag_count = function(div){
			var count = 0;
			var stat_tags = $(div).data("tags");
			for(var index in stat_tags){
				if(in_array(tags,stat_tags[index])){
					count++;
				}
			}
			return count;
		}
		sorted_notes = notes.sort(function(a,b){
			var a_count = 0;
			$(".statistic",$(a)).each(function(){
				var count = tag_count(this);
				if(count>a_count){
					a_count = count;
				}
			});
			var b_count = 0;
			$(".statistic",$(b)).each(function(){
				var count = tag_count(this);
				if(count>b_count){
					b_count = count;
				}
			});
			if(a_count >= b_count){
				return -1
			}else{
				return 1;
			}
		});
		for(var i=0;i<sorted_notes.length;i++){
			container.append(sorted_notes[i]);
		}
	}).delegate(".share-statistic","click",function(event){
		event.preventDefault;
	});
	$(".wrapper").delegate("#note-container","get-notes",function(event){
		noteType = false;
		$("#note-type-selector li.active a").each(function(){
			noteType = $(this).attr("note-type");
		})
		$(".notes .note").remove();
		$.ajax({
			url:"/notes/",
			type:"GET",
			data:{
				chart_id:event['chart_id'],
				type:noteType
			},
			success:function(data){
				if(data['notes']){
					for(var index in data['notes']){
						var note = data['notes'][index];
						if($("#note-"+note['id']).length > 0){
							var original = $("#note-"+note['id']);
							$(note['markup']).after(original);
							original.remove();
						}else{
							$("#note-container .notes").append(note['markup']);
						}
					}
					$("#note-container .notes .note").trigger("notes-init");
					$("#note-container .notes").trigger({
						type:"sort",
						tags:String($.address.parameter("tags")).split(",")
					});
				}
			}
		});
	}).delegate("#note-container .notes .note","notes-init",function(event){
		var note = $(this);
		if(note.data("init")){
			return;
		}
		note.data("init",true);
		$(".statistic",note).each(function(){
			$(this).data("tags",$(this).attr("tags").split(","));
		});
	});
	$.address.change(function(event){
		$("#note-container .notes").trigger({
			type:"sort",
			tags:String($.address.parameter("tags")).split(",")
		});
	});
	$("#note-type-selector li a").click(function(event){
		event.preventDefault();
		var link = $(this);
		$("li.active",link.parents(".nav:first")).removeClass("active");
		link.parents("li").addClass("active");
		$("#note-container").trigger({
			type:"get-notes",
			chart_id:$.address.parameter("chart")
			})
	})
	$("#note-type-selector li:first").addClass("active");
});