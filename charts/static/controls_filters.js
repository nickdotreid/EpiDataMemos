$(document).ready(function(){
	$("#chart").bind("ext-draw",function(){
		var chart = $(this);
		var data = chart.data("data");
		
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
		order = chart.data("order");
		$(".filters .row").each(function(){
			row = $(this);
			items = $(".filter",row);
			items = items.sort(function(a,b){
				a_value = $("input",$(a)).val();
				b_value = $("input",$(b)).val();
				if(order.indexOf(a_value)>order.indexOf(b_value)){
					return true;
				}
				return false;
			});
			for(var i=0;i<items.length;i++){
				row.append(items[i]);
			}
		})
		set_button_state();
		if(!$.address.parameter("filter")){
			$(".filters input:first").click()
		}
	}).bind("redraw",function(){
		
	});
	$("#chart").delegate("input.percent","click",function(){
		if(this.checked){
			$.address.parameter("percent",this.value);
		}else{
			$.address.parameter("percent",false);
		}
		
	});
	$("#chart").delegate(".filters input","click",function(){
		$.address.parameter("filter",this.value);
	});
	$.address.change(set_button_state);
});

function set_button_state(obj){
	obj = fill_in_values(obj);
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