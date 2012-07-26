$(document).ready(function(){
	$.address.change(function(){
		$("#memos").trigger("filter");
	});
	$("#memos").bind("filter",function(event){
		event = fill_in_values(event);
		if($(this).hasClass("hover")){
			return true;
		}
		var memos = $("#memos .memo");
		if(memos.length<1){
			return true;
		}
		sorted_memos = memos.sort(function(a_div,b_div){
			var a = $(a_div);
			var b = $(b_div);
			if(event.filter && a.data("filter")!=b.data("filter")){
				if(a.data("filter") == event.filter){
					return 1;
				}
				if(b.data("filter") == event.filter){
					return -1;
				}
			}
			if(event.highlight && a.data("hightlight")!=b.data("highlight")){
				if(a.data("highlight") == event.highlight){
					return 1;
				}
				if(b.data("highlight") == event.highlight){
					return -1;
				}
			}

			if(a.data("weight")!=b.data("weight")){
				if(a.data("weight")<b.data("weight")){
					return 1;
				}
				return -1;
			}
			if(a.data("id")!=b.data("id")){
				if(a.data("id")<b.data("id")){
					return 1;
				}
				return -1;
			}
			return 0;
		});
		for(var i=0;i<sorted_memos.length;i++){
			$("#memos .create").after(sorted_memos[i]);
		}
	}).bind("loaded",function(){
		$(this).trigger("filter");
	}).bind("mouseenter",function(){
		$(this).addClass("hover");
	}).bind("mouseleave",function(){
		$(this).removeClass("hover");
	});
});
/*

function(a_div,b_div){
	a = $(a_div);
	b = $(b_div);
	if(filter && a.data("filter")!=b.data("filter")){
		if(a.data("filter") == event.filter){
			return 1;
		}
		if(b.data("filter") == event.filter){
			return -1;
		}
	}
	
	if(highlight && a.data("hightlight")!=b.data("highlight")){
		if(a.data("highlight") == event.highlight){
			return 1;
		}
		if(b.data("highlight") == event.highlight){
			return -1;
		}
	}
	
	if(a.data("weight")!=b.data("weight")){
		if(a.data("weight")<b.data("weight")){
			return 1;
		}
		return -1;
	}
	if(a.data("id")!=b.data("id")){
		if(a.data("id")<b.data("id")){
			return 1;
		}
		return -1;
	}
	return 1;
}

*/