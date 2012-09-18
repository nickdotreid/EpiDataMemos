$(document).ready(function(){
	$("a.bookmarks-add").click(function(event){
		event.preventDefault();
		var button = $(this);
		if(button.hasClass("disabled")){
			return ;
		}
		button.parents(".bookmarks-list:first").trigger({
			type:'bookmark-add',
			chart_id:$.address.parameter("chart"),
			tags:$.address.parameter("tags")
		});
	});
	
	$(".bookmarks-list").bind("bookmark-add",function(event){
		$.ajax({
			url:"/notes/bookmark/",
			type:"POST",
			data:{
				chart_id:event['chart_id'],
				tags:event['tags']
			},
		});
	}).ajaxSuccess(function(event,xhr,settings){
		var data = $.parseJSON(xhr.responseText);
		if(data['bookmarks']){
			var list = $(this);
			var container = $(".bookmarks-container",list);

			var bookmarks = list.data("bookmarks");
			if(!bookmarks) bookmarks = [];
			
			var add_bookmark = function(bookmark){
				for(var i=0;i<bookmarks.length;i++){
					if(bookmarks[i]['id'] == bookmark['id']){
						bookmark['div'] = $(bookmark['markup']).after(bookmarks[i]['div']);
						bookmarks[i]['div'].remove();
						bookmarks[i] = bookmark;
						return true;
					}
				}
				bookmark['div'] = $(bookmark['markup']).appendTo(container);
				bookmarks.push(bookmark);
				return true;
			}
			for(var i=0;i<data['bookmarks'].length;i++){
				add_bookmark(data['bookmarks'][i]);
			}
			list.data("bookmarks",bookmarks).trigger("bookmark-addable-toggle");
		}
	}).bind("bookmark-addable-toggle",function(event){
		var list = $(this);
		var button = $(".bookmarks-add",list);
		if(!list.data("bookmarks")) return ;
		var chart_id = $.address.parameter("chart");
		var tags = $.address.parameter("tags").split(",");
		var matches = function(bookmark){
			if(bookmark['chart']['id'] != chart_id){
				return false;
			}
			for(var i=0;i<bookmark['tags'].length;i++){
				if(tags.indexOf(bookmark['tags'][i]) == -1){
					return false;
				}
			}
			return true;
		}
		for(var i=0;i<list.data("bookmarks").length;i++){
			if(matches(list.data("bookmarks")[i])){
				button.addClass("disabled");
				return ;				
			}
		}
		button.removeClass("disabled");
	}).bind("bookmark-remove",function(event){
		if(!event['bookmark_id']){
			return ;
		}
		var list = $(this);
		var bookmarks = [];
		for(var i=0;i<list.data("bookmarks").length;i++){
			var bookmark = list.data("bookmarks")[i];
			if(event['bookmark_id'] == bookmark['id']){
				bookmark['div'].remove();
				// send ajax delete request??
			}else{
				bookmarks.push(bookmark);
			}
		}
		list.data("bookmarks",bookmarks).trigger("bookmark-addable-toggle");
	});
	
	$(".bookmarks-list").delegate(".bookmark a","click",function(event){
		event.preventDefault();
	}).delegate(".bookmark a.remove","click",function(event){
		var bookmark = $(this).parents(".bookmark:first");
		$(".bookmarks-list").trigger({
			type:'bookmark-remove',
			bookmark_id:bookmark.attr("bookmark-id")
		});
	});
	
	$.address.change(function(){
		$(".bookmarks-list").trigger("bookmark-addable-toggle");
	});
	
	$(".wrapper").delegate("form.note.create","presubmit",function(event){
		var form = $(this);
		$("input[type='hidden'][name='chart_id']",form).remove();
		var bookmarks = [];
		$(".bookmarks-list .bookmark").each(function(){
			bookmarks.push($(this).attr("bookmark-id"));
		});
		form.append('<input type="hidden" name="bookmarks" value="'+bookmarks.join(",")+'" />');
		if(!$(".bookmarks-add").hasClass("disabled")){
			if($("input[type='hidden'][name='chart_id']",form).length < 1){
				form.append('<input type="hidden" name="chart_id" />');
			}
			$("input[type='hidden'][name='chart_id']",form).val($.address.parameter("chart"));
			if($("input[type='hidden'][name='tags']",form).length < 1){
				form.append('<input type="hidden" name="tags" />');
			}
			var tags = "";
			$("input[type='hidden'][name='tags']",form).val($.address.parameter("tags"));			
		}
	}).delegate("form.note.create","saved",function(event){
		$(".bookmarks-container").html("");
	});
});