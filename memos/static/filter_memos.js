$(document).ready(function(){
	$.address.change(filter_memos);
	$("#memos").bind("loaded",filter_memos);
});

function filter_memos(){
	$("#memos .memo").show().each(function(){
		memo = $(this);
		if(memo.data("filter") && memo.data("filter")!=$.address.parameter("filter")){
			memo.hide();
		}
	});
}