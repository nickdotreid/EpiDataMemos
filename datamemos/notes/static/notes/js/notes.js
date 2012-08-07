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
					button.parents("li:first").addClass("active");
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
				place_note(data['note']);
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
						place_note(data['notes'][index]);
						$("#note-container .notes").trigger({
							type:"sort",
							tags:String($.address.parameter("tags")).split(",")
						});
					}
				}
			}
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

function place_note(data,note){
	if(!note){
		note = create_note(data)
	}
	if($("#note-"+data['id']).length > 0){
		var old = $("#note-"+data['id']);
		old.after(note);
		old.remove();
	}else{
		$("#notes").append(note);
	}
}

function create_note(data){
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
	note.addClass(data['type']);
	for(stat_index in data['statistics']){
		var stat = data['statistics'][stat_index];
		note.append(create_statistic(stat));
	}
	return note;
}

function create_statistic(data){
	var stat = $("#templates .statistic").clone();
	stat.attr("id","statistic-"+data['id']);
	stat.data("tags",data['tags']);
	stat.append("Statistic "+data['id']);
	for(var index in data['tags']){
		stat.append(" "+data['tags'][index]);
	}
	return stat;
}