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
		var ignore_values = [];
		$(".chart .column").each(function(){
			ignore_values.push($(this).attr("value"));
		})
		var tags = event.tags;
		var tag_count = function(div){
			var count = 0;
			var stat = $(div);
			var tag_count = arr_similar_count(tags,stat.data("tags"));
			var parent_count = arr_similar_count(tags,stat.data("parent-tags"),ignore_values);
			var child_count = arr_similar_count(tags,stat.data("child-tags"),ignore_values);
			var sibling_count = arr_similar_count(tags,stat.data("sibling-tags"),ignore_values);
			return tag_count*3 + child_count + parent_count/2 + sibling_count/2;
		}
		notes.removeClass("active").each(function(){
			var note_count = 0;
			var note = $(this);
			$(".statistic",note).each(function(){
				var count = tag_count(this);
				if(count>note_count){
					note_count = count;
				}
			});
			if(note_count > 0){
				note.addClass("active");
			}
			note.data("count",note_count);
		});
		sorted_notes = notes.sort(function(a,b){
			if($(a).data("count") >= $(b).data("count")){
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
		note.data("date",new Date(note.attr("date")));
		$(".statistic",note).each(function(){
			$(this).data("tags",$(this).attr("tags").split(","));
			$(this).data("parent-tags",$(this).attr("parent-tags").split(","));
			$(this).data("sibling-tags",$(this).attr("sibling-tags").split(","));
			$(this).data("child-tags",$(this).attr("child-tags").split(","));
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
		$("li.active",link.parents("#note-type-selector:first")).removeClass("active");
		link.parents("li").addClass("active");
		$("#note-container").trigger({
			type:"get-notes",
			chart_id:$.address.parameter("chart")
			})
	})
	$("#note-type-selector li:first").addClass("active");
});

function arr_similar_count(arr1,arr2,ignore_arr){
	var count = 0;
	for(var i in arr1){
		if(!ignore_arr || !in_array(ignore_arr,arr1[i])){
			for( var q in arr2){
				if(!ignore_arr || !in_array(ignore_arr,arr2[q])){
					if(arr1[i] == arr2[q]){
						count += 1;
					}					
				}
			}			
		}
	}
	return count;
}