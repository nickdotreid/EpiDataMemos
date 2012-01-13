$(document).ready(function(){
	$.address.change(filter_memos);
	$("#memos").bind("loaded",filter_memos);
	$("#chart").delegate(".column","highlight",function(){
		column = $(this);
		filter_memos({highlight:column.data("data")['Label']});
	}).delegate(".column","mouseleave",function(event){
		filter_memos();
	});
});

function filter_memos(obj){
	if(!obj){
		obj = {};
	}
	if(!obj['filter']){
		obj['filter'] = $.address.parameter("filter");
	}
	if(!obj['highlight']){
		obj['highlight'] = $.address.parameter("highlight");
	}
	var memos = $("#memos .memo");
	if(memos.length<1){
		return false;
	}
	highlight = obj['highlight'];
	filter = obj["filter"];
	sorted_memos = memos.sort(function(a,b){
		a = $(a);
		b = $(b);
		if(highlight && a.data("hightlight")!=b.data("highlight")){
			if(a.data("highlight") == highlight){
				return true;
			}
			if(b.data("highlight") == highlight){
				return false;
			}
		}
		if(filter && a.data("filter")!=b.data("filter")){
			if(a.data("filter") == filter){
				return true;
			}
			if(b.data("filter") == filter){
				return false;
			}
		}
		if(a.data("weight")!=b.data("weight")){
			return a.data("weight")<b.data("weight");
		}
		if(a.data("id")!=b.data("id")){
			return a.data("id")<b.data("id");
		}
		return true;
	});
	for(var i=0;i<sorted_memos.length;i++){
		$("#memos .create").after(sorted_memos[i]);
	}
}