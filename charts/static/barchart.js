$(document).ready(function(){
	$("#chart").bind("loadr",function(event){
		var chart = $(this);
		$.ajax({
			url:chart.data('src'),
			success:function(data){
				chart.data("data",data['columns']).data("filters",data['filters']).trigger("draw");
			}
		});
	}).bind("draw",function(event){
		var chart = $(this);
		
		filters = $(this).data("filters");
		for(index in filters){
			$(".filters",$(this)).append('<label class="radio"><input type="radio" name="filter" value="'+filters[index]+'" />'+filters[index]+'</label>');
		}
		
		data = $(this).data("data");
		$(".chart",chart).append('<div class="canvas"></div>');
		for(index in data){
			$(".chart .canvas",$(this)).append($("#templates .column").clone());
			$(".chart .column:last",$(this)).data("data",data[index]);
			$(".chart .column:last .label",$(this)).html(data[index]['Label']);
		}
		$(".chart .column .bar",$(this)).height("0px").css("top",$(".chart",$(this)).height());
		$(".chart",$(this)).prepend('<div class="grid"></div>');
		if(!$.address.parameter("filter")){
			$(".filters input:first").click()
		}
		set_button_state();
		$(this).trigger("redraw");
	}).bind("redraw",function(event){
		var chart = $(this);
		var graph = $(".chart",chart);
		if(!event.filter){
			event.filter = $.address.parameter("filter");
		}
		if(!event.highlight){
			event.highlight = $.address.parameter("highlight");
		}
		if(!event.percent){
			event.percent = $.address.parameter("percent");
		}
		
		set_button_state({
			filter:event.filter
		});
		
		chart_max = array_max(chart.data("data"),get_value);
		if(event.percent){
			chart_max = 100
		}
		$(".chart .column",$(this)).each(function(){
			column = $(this);
			data = column.data("data");
			column.addClass(String(data['Label']));
			if(event.percent){
				percent = data[event.filter]/data['Total'];
			}else{
				percent = data[event.filter]/chart_max;
			}
			height = graph.height()*percent;
			$(".bar",column).animate({
				height:height+'px',
				top:(graph.height()-height)+'px'
			},{
				duration:500,
				queue:false
			});
			
			$(".highlight .number",column).html(data[event.filter]);
			$(".highlight .total",column).html('of '+data['Total']);
			$(".highlight .qualify",column).html(event.filter+' people');
			
			highlight_top = graph.height()-height-$(".highlight",column).height()-$(".highlight .bottom",column).height();
			$(".highlight",column).animate({
				top:highlight_top+'px'
			},{
				duration:500,
				queue:false
			})
			
		});
		var ticks = make_ticks(0,chart_max,5);
		for(index in ticks){
			tick = ticks[index];
			if($(".grid .tick[data-value='"+tick+"']",graph).length<1){
				$(".grid").append('<div class="tick" data-value="'+tick+'">'+format_number(tick)+'</div>');
				$(".grid .tick:last").css("top",graph.height()+'px').css("opacity",0);
			}
		}
		$(".grid .tick",graph).each(function(){
			var tick = $(this);
			var opacity = 1;
			if(!in_array(ticks,tick.data("value"))){
				var opacity = 0;
			}
			tick.animate({
				top:(graph.height()-(graph.height()*(tick.data("value")/chart_max)))+'px',
				opacity:opacity
			},{
				duration:700,
				queue:false
			});
		});
		
		if(event.highlight){
			$(".column."+event.highlight,$(this)).trigger("highlight");
		}else{
			$(".column").trigger("mouseleave");
		}
		
	}).delegate(".column .bar","mouseenter",function(event){
		$.address.parameter("highlight",false);
		$(this).trigger("highlight");
	}).delegate(".column","mouseleave",function(event){
			column = $(this);
			if($.address.parameter("highlight")!=column.data("data")['Label']){
				$(".highlight",column).hide();
			}
	}).delegate(".column","click",function(event){
		$.address.parameter("highlight",$(this).data("data")['Label']);
	}).delegate(".column","highlight",function(event){
		column = $(this);
		$(".highlight").hide();
		$(".highlight",column).show();
		bar_top = Number($(".bar",column).css("top").replace("px",""));
		$(".highlight",column).css("top",(bar_top-$(".highlight",column).height()-$(".highlight .bottom",column).height())+'px');
	}).delegate(".column .highlight .highlink","click",function(event){
		event.preventDefault();
		$(this).parents(".column:first").trigger("highlight");
	});
	
	$("#chart").trigger("loadr");
	
	$.address.change(function(event){
		$("#chart").trigger("redraw");
	});
	
	$("#chart").delegate("input.percent","click",function(){
		if(this.checked){
			$.address.parameter("percent",this.value);
		}else{
			$.address.parameter("percent",false);
		}
		
	})
	
	$("#chart").delegate(".filters input","click",function(){
		$.address.parameter("filter",this.value);
	});
	$.address.change(set_button_state);
});

function set_button_state(obj){
	if(!obj){
		obj = {};
	}
	if(!obj['filter']){
		obj['filter'] = $.address.parameter("filter");
	}
	if(!obj['percent']){
		obj['percent'] = $.address.parameter("percent");
	}
	if(obj['filter']){
		$(".filters input:checked").attr("checked",false);
		$(".filters input[value='"+obj['filter']+"']").attr("checked",true);
	}
	if(obj['percent']){
		$("#chart input.percent").attr("checked",true);
	}else{
		$("#chart input.percent").attr("checked",false);
	}	
}

function get_value(item){
	return item[$.address.parameter("filter")];
}

function make_ticks(min,max,amount){
	ticks = [];
	range = max - min;
	step = range/(amount-1);
	num = min;
	while(step && num<=max && amount>=0){
		ticks.push(num);
		num += step;
		amount--;
	}
	return ticks;
}

function array_max(arr,value_function){
	max = 0;
	for(index in arr){
		value = value_function(arr[index]);
		if(value > max){
			max = value;
		}
	}
	return Number(max);
}
function array_sum(arr,value_function){
	total = 0;
	for(index in arr){
		value = value_function(arr[index]);
		if(value){
			total += value;
		}
	}
	return total;
}

function format_number(num){
	return Math.round(num);
}

function in_array(arr,value){
	for(var i=0;i<arr.length;i++){
		if(arr[i]==value){
			return true;
		}
	}
	return false;
}