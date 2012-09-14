$(document).ready(function(){
	$(".wrapper").delegate("#chart-container","get-chart",function(event){
		// unload existing chart
		$("#chart-container .chart").remove();
		$("#chart-container,#note-container").show().trigger("loading");
		if(!event.chart_id){
			alert("No Chart ID to load");
			return false;
		}
		$.ajax({
			url:"/charts/"+event.chart_id+"/",
			success:function(data){
				var markup = '<div class="chart table"></div>';
				if(data['title']){
					var title = document.title.split(":");
					document.title = title[0] + ": " + data['title'];
				}
				if(data['markup']){
					markup = data['markup'];
				}
				$("#chart-container .inner").append(markup);
				$("#chart-container .chart").trigger("load-chart");
				
				setTimeout(function(){
					$("#notes-list").trigger({
						type:"get-notes",
						chart_id:event['chart_id']
					});	
				},500);
			}
		});
	});
		
	$(".wrapper").delegate("form.note.create","presubmit",function(event){
		var form = $(this);
		$("input[type='hidden'][name='chart_id']",form).remove();
		var bookmarks = [];
		$(".bookmarks-list .bookmark").each(function(){
			bookmarks.push($(this).attr("bookmark-id"));
		});
		form.append('<input type="hidden" name="bookmarks" value="'+bookmarks.join(",")+'" />');
		if(!$(".bookmarks-add").hasClass("disabled")){
			if($("input[type='hidden'][name='chart_id']",form).length < 1){
				form.append('<input type="hidden" name="chart_id" />');
			}
			$("input[type='hidden'][name='chart_id']",form).val($.address.parameter("chart"));
			if($("input[type='hidden'][name='tags']",form).length < 1){
				form.append('<input type="hidden" name="tags" />');
			}
			var tags = "";
			$("input[type='hidden'][name='tags']",form).val($.address.parameter("tags"));			
		}
	}).delegate("form.note.create","saved",function(event){
		$(".bookmarks-list").html("");
	});
	$(".chart-links a").click(function(event){
		event.preventDefault();
		if($(this).data("id")){
			$.address.parameter("chart",$(this).data("id"));
			$.address.parameter("page",false);
		}
	})
	$(".navbar a").click(function(event){
		event.preventDefault();
		$(".navbar li.active").removeClass("active");
		if($.address.parameter("page") && $.address.parameter("page") == $(this).attr("href").replace("/","")){
			$.address.parameter("page",false);
		}else{
			$(this).parents("li:first").addClass("active");
			$.address.parameter("page",$(this).attr("href").replace("/",""));	
		}
	});
	$.address.change(function(){
		$(".page").hide();
		$(".navbar li.active").removeClass("active");
		if($.address.parameter("page")){
			$("#"+$.address.parameter("page")+".page").show();
		}
	});

	$('#chart-container').data("charts",[]);
	$.address.change(function(){
		if($.address.parameter('chart')){
			if(!in_array($("#chart-container").data("charts"),$.address.parameter("chart"))){
				$("#chart-container").data("charts").push($.address.parameter("chart"));
				$("#chart-container").trigger({
					type:"get-chart",
					chart_id:$.address.parameter("chart")
				});
			}
		}
	});
	
	$(".page,#chart-container,#note-container").hide();
	if(!$.address.parameter("chart") && !$.address.parameter("note") && !$.address.parameter("statistic")){
		$(".navbar .nav a").click();
	}
});