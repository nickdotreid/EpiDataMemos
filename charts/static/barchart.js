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
		$(this).append('<ul class="chart"></ul><form class="filters"></form>')
		
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
		var chart = $(".chart",$(this));
		$(".chart .column",$(this)).each(function(){
			column = $(this);
			data = column.data("data");
			percent = data[$.address.parameter("filter")]/data['Total'];
			height = chart.height()*percent;
			$(".bar",column).animate({
				height:height+'px',
				top:(chart.height()-height)+'px'
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