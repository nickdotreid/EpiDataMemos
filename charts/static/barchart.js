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
		}
	}).bind("redraw",function(event){
		
	});
	
	$("#chart").trigger("loadr");
});