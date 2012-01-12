$(document).ready(function(){
	$("#chart").bind("loadr",function(event){
		var chart = $(this);
		$.ajax({
			url:chart.data('src'),
			success:function(data){
				chart.data("data",data['columns']).data("filters",data['filters']).trigger("draw");
			}
		})
	}).bind("draw",function(event){
		var chart = $(this);
		$(this).append('<h2 class="title"></h2><form class="filters"></form><ul class="chart"></ul><div class="foot"></div>')
		
		$(".title",chart).html(chart.data("name").replace('.xls',"").replace(/_/gi," "));
		
		filters = $(this).data("filters");
		for(index in filters){
			$(".filters",$(this)).append('<label class="radio"><input type="radio" name="filter" value="'+filters[index]+'" />'+filters[index]+'</label>');
		}
		
		data = $(this).data("data");
		for(index in data){
			$(".chart",$(this)).append('<li class="column"><div class="bar"></div><div class="label">'+data[index]['Label']+'</div></li>');
			$(".chart .column:last",$(this)).data("data",data[index]);
		}
		$(".chart .column .bar",$(this)).height("0px").css("top",$(".chart",$(this)).height());
		
		if(!$.address.parameter("filter")){
			$(".filters input:first").click()
		}
		$(this).trigger("redraw");
	}).bind("redraw",function(event){
		var chart = $(this);
		var graph = $(".chart",chart);
		chart_max = array_max(chart.data("data"),get_value);
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
		});
	});
	
	$("#chart").trigger("loadr");
	
	$.address.change(function(event){
		$("#chart").trigger("redraw");
	});
	
	$("#chart").delegate(".filters input","click",function(){
		$.address.parameter("filter",this.value);
	});
	$.address.change(function(event){
		if($.address.parameter("filter")){
			$(".filters input:checked").attr("checked",false);
			$(".filters input[value='"+$.address.parameter("filter")+"']").attr("checked",true);
		}
	});
});

function get_value(item){
	return item[$.address.parameter("filter")];
}

function array_max(arr,value_function){
	max = 0;
	for(index in arr){
		value = value_function(arr[index]);
		if(value > max){
			max = value;
		}
	}
	return max;
}