$(document).ready(function(){
	$.address.change(function(){
		$("#memos .memo").show().each(function(){
			memo = $(this);
			if(memo.data("filter") && memo.data("filter")!=$.address.parameter("filter")){
				memo.hide();
			}
		})
	});
})