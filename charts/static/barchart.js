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
		for(index in data){
			$(".chart",$(this)).append($("#templates .column").clone());
			$(".chart .column:last",$(this)).data("data",data[index]);
			$(".chart .column:last .label",$(this)).html(data[index]['Label']);
		}
		$(".chart .column .bar",$(this)).height("0px").css("top",$(".chart",$(this)).height());
		$(".chart",$(this)).append('<div class="grid"></div>');
		if(!$.address.parameter("filter")){
			$(".filters input:first").click()
		}
		$(this).trigger("redraw");
	}).bind("redraw",function(event){
		var chart = $(this);
		var graph = $(".chart",chart);
		chart_max = array_max(chart.data("data"),get_value);
		if($.address.parameter("percent")){
			chart_max = 100
		}
		$(".chart .column",$(this)).each(function(){
			column = $(this);
			data = column.data("data");
			if($.address.parameter("percent")){
				percent = data[$.address.parameter("filter")]/data['Total'];
			}else{
				percent = data[$.address.parameter("filter")]/chart_max;
			}
			height = graph.height()*percent;
			$(".bar",column).animate({
				height:height+'px',
				top:(graph.height()-height)+'px'
			},{
				duration:500
			});
			
			$(".highlight .number",column).html(data[$.address.parameter("filter")]);
			$(".highlight .total",column).html('of '+data['Total']);
			$(".highlight .qualify",column).html($.address.parameter("filter")+' people');
			
			highlight_top = graph.height()-height-$(".highlight",column).height();
			$(".highlight",column).animate({
				top:highlight_top+'px'
			},{
				duration:500
			})
			
		});
		ticks = make_ticks(0,chart_max,5);
		for(index in ticks){
			tick = ticks[index];
			if($(".grid .tick[data-value='"+tick+"']",graph).length<1){
				$(".grid").append('<div class="tick" data-value="'+tick+'">'+format_number(tick)+'</div>');
				$(".grid .tick:last").css("top",graph.height()+'px').css("opacity",0);
			}
		}
		$(".grid .tick",graph).each(function(){
			tick = $(this);
			opacity = 1;
			if(ticks.indexOf(tick.data("value"))==-1){
				opacity = 0;
			}
			tick.animate({
				top:(graph.height()-(graph.height()*(tick.data("value")/chart_max)))+'px',
				opacity:opacity
			},{
				duration:700
			});
		});
	}).delegate(".column","mouseenter",function(event){
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
		$(".highlight",column).css("top",(bar_top-$(".highlight",column).height())+'px');
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
	$.address.change(function(event){
		if($.address.parameter("filter")){
			$(".filters input:checked").attr("checked",false);
			$(".filters input[value='"+$.address.parameter("filter")+"']").attr("checked",true);
		}
		if($.address.parameter("percent")){
			$("#chart input.percent").attr("checked",true);
		}else{
			$("#chart input.percent").attr("checked",false);
		}
	});
});

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