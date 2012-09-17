if(!note_create_uri){
	var note_create_uri = "/notes/create/";
}
$(document).ready(function(){
	$("#notes-list").bind("sort",function(event){
		var list = $(this);
		var container = $(".notes-container",list);
		var notes = list.data("notes");
		if(!notes) return ;
		
		var ignore_values = [];
		$(".chart .column").each(function(){
			ignore_values.push($(this).attr("value"));
		});
		
		var tags = event.tags;
		
		var arr_similar_count = function(arr1,arr2,ignore_arr){
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
		
		var bookmark_count = function(bookmark){
			var count = 0;
			var tag_count = arr_similar_count(tags,bookmark['tags']);
			var parent_count = arr_similar_count(tags,bookmark['parent-tags'],ignore_values);
			var child_count = arr_similar_count(tags,bookmark['child-tags'],ignore_values);
			var sibling_count = arr_similar_count(tags,bookmark['sibling-tags'],ignore_values);
			return tag_count*3 + child_count + parent_count/2 + sibling_count/2;
		}
		
		var note_count = function(note){
			var count = 0;
			for(var i=0;i<note['bookmarks'].length;i++){
				mark_count = bookmark_count(note['bookmarks'][i]);
				if(mark_count > count) count = mark_count;
			}
			return count;
		}
		
		for(var i=0;i<notes.length;i++){
			var note = notes[i];
			note['activity'] = note_count(note);
		}
		sorted_notes = notes.sort(function(a,b){
			if(a['activity'] >= b['activity']){
				return -1
			}else{
				return 1;
			}
		});
		$(".note",container).removeClass("active");		
		for(var i=0;i<sorted_notes.length;i++){
			container.append(sorted_notes[i]['div'][0]);
			if(sorted_notes[i]['activity'] > 0){
				sorted_notes[i]['div'].addClass("active");
			}
		}
		list.data("notes",sorted_notes);
	}).bind("get-notes",function(event){
		var list = $(this);
		list.data("notes",[]);
		$(".note",list).remove();
		$.ajax({
			url:"/notes/",
			type:"GET",
			data:{
				chart_id:event['chart_id'],
				type:event['note_type']
			},
		});
	}).ajaxSuccess(function(event,xhr,settings){
		var list = $(this);
		var container = $(".notes-container",list);
		
		var notes = list.data("notes");
		if(!notes) notes = [];
		
		var notes_index_of = function(note){
			for(var i=0;i<notes.length;i++){
				if(notes[i]['id'] == note['id']){
					return i;
				}
			}
			return -1;
		}
		
		var data = $.parseJSON(xhr.responseText);
		if(data['notes']){
			for(var index in data['notes']){
				var note = data['notes'][index];
				var pos = notes_index_of(note);
				if(pos >= 0){
					notes[pos]['div'].remove();
					notes[pos] = note;
				}
				note['div'] = $(note['markup']).appendTo(container);
				if(pos < 0){
					notes.push(note);
				}
			}
			list.data("notes",notes).trigger("sort");
		}
	});
	
	$("#note-container").delegate(".note .share-btn","click",function(event){
		event.preventDefault();
		var note = $(this).parents(".note:first");
		if($(".share .close",note).length<1){
			$(".share",note).append("<a href='#' class='close'><i></i>Close</a>");
		}
		$(".share",note).show();
	}).delegate(".note .share .close","click",function(event){
		event.preventDefault();
		$(this).parents(".share:first").hide();
	});
	
	$.address.change(function(event){
		$("#note-container .notes").trigger({
			type:"sort",
			tags:String($.address.parameter("tags")).split(",")
		});
	});
	
	$("#notes-list .notes-nav li a").click(function(event){
		event.preventDefault();
		var link = $(this);
		$("li.active",link.parents(".notes-nav:first")).removeClass("active");
		link.parents("li").addClass("active");
		$("#notes-list").trigger({
			type:"get-notes",
			chart_id:$.address.parameter("chart")
			});
	});
	
	$("#notes-list .notes-nav li:first").addClass("active");
});