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
		obj['filter'] = $.address.parameter("filter")
	}
	if(!obj['highlight']){
		obj['highlight'] = $.address.parameter("highlight")
	}
	$("#memos .memo").hide().each(function(){
		memo = $(this);
		if(memo.data("filter") && memo.data("filter")==obj['filter']){
			memo.show();
		}
		if(memo.data("highlight") && memo.data("highlight")==obj['highlight']){
			memo.show();
		}
	});
}