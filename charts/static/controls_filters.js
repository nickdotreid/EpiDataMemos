$(document).ready(function(){
	$("#chart").bind("ext-draw",function(){
		var chart = $(this);
		var data = chart.data(data);
		
		$(".filters",chart).append("<div class='row'></div>");
		for(label in data[0]){
			if(data[0][label]!=data[0]['Label']){
				$('.filters .row:first',chart).append($("#templates .filter").clone());
				$('.filters .row:first .filter:last .name',chart).html(label);
				$('.filters .row:first .filter:last input',chart).val(label);
				$('.filters',chart).append("<div class='row child'></div>");
				$(".filters .row:last",chart).data("parent",label);
				for(child in data[0][label]){
					$('.filters .row:last',chart).append($("#templates .filter").clone());
					$('.filters .filter:last .name',chart).html(child);
					$('.filters .filter:last input',chart).val(child);
				}
			}
		}
		set_button_state();
		if(!$.address.parameter("filter")){
			$(".filters input:first").click()
		}
	}).bind("redraw",function(){
		
	});
});

function set_button_state(obj){
	if(!obj){
		obj = {};
	}
	if(!obj['filter']){
		obj['filter'] = unescape($.address.parameter("filter"));
	}
	if(!obj['percent']){
		obj['percent'] = $.address.parameter("percent");
	}
	if(obj['filter']){
		$(".filters input:checked").attr("checked",false);
		$(".filters input[value='"+obj['filter']+"']").attr("checked",true);
	}
	$(".filters .row.child").hide();
	if(obj['filter']){
		$(".filters .row.child").each(function(){
			row = $(this);
			if(row.data("parent")==obj['filter']){
				row.show();
			}
			if($("input[value='"+obj['filter']+"']",row).length>0){
				row.show();
			}
		});
	}
	if(obj['percent']){
		$("#chart input.percent").attr("checked",true);
	}else{
		$("#chart input.percent").attr("checked",false);
	}	
}