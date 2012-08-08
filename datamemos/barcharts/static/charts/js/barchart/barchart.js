$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart","load-chart",function(event){
		var chart = $(this);
		if(event.data){
			chart.data("data",event.data);
		}
		$(".bar",chart).each(function(){
			var bar = $(this);
			var tag_arr = bar.attr("tags").split(",");
			bar.data("tags",tag_arr);
			bar.data("amount",Number(bar.attr("amount")));
		});
		$(".bar",chart).trigger("bar-init");
		chart.data("tags",[]);
		chart.trigger("get-state-chart").trigger("redraw");
	}).delegate(".chart.barchart","get-state-chart",function(){
		var tags = [];
		if($.address.parameter("tags")){
			tags = $.address.parameter("tags").split(",");
		}else{
			$('.tag input:first',$(this)).click();
		}
		$(this).data("tags",tags);
	}).delegate(".chart.barchart","redraw",function(event){
		var chart = $(this);
		if(chart.data("redraw-timeout")){
			clearTimeout(chart.data("redraw-timeout"));
		}
		var timeout = setTimeout(function(){
			var canvas = $(".canvas",chart);
			var stacked = false;
		
			if(!event.tags){
				event.tags = chart.data("tags");
			}
			
			for(index in event.tags){
				var tag = event.tags[index];
				$(".tags-children[parent='"+tag+"'] .tag input").each(function(){
					event.tags.push(this.value);
					stacked = true;
				})
			}
			
			sibling_tags = [];
			for(index in event.tags){
				var tag = event.tags[index]
				$(".tag input:not([value='"+tag+"'])",$(".tag input[value='"+tag+"']",chart).parents(".tags-children:first")).each(function(){
					sibling_tags.push(this.value);
				})
			}
		
			var chart_max = 0;
			$(".column",chart).each(function(){
				var column = $(this);
				var biggest_number = 0;
				var biggest_match = 1;
				$(".bar",column).each(function(){
					var bar = $(this);
					var matches = 0;
					var sibling_matches = 0;
					for(var index in event.tags){
						if(in_array(bar.data("tags"),event.tags[index])){
							matches++;
							sibling_matches++;
						}
					}
					for(var index in sibling_tags){
						if(in_array(bar.data("tags"),sibling_tags[index])){
							sibling_matches++;
						}
					}
					bar.data("matches",matches+sibling_matches);
					if(matches > biggest_match){
						biggest_number = 0;
						biggest_match = matches;
					}
					if(matches >= biggest_match){
						biggest_number += bar.data("amount");
					}
				})
				if(biggest_number>chart_max){
					chart_max = biggest_number;
				}
			});
			$(".bar").trigger({
				type:'bar-calculate',
				tags:event.tags,
				percent:event.percent,
				max:chart_max,
				stacked:stacked
			}).trigger({
				type:'bar-animate',
				tags:event.tags,
				percent:event.percent,
				max:chart_max,
			});
			$(".column",chart).each(function(){
				var column = $(this);
				var widest = 0;
				$(".bar",column).each(function(){
					var right_pos = $(this).width() +$(this).data("x");
					if(right_pos > widest){
						widest = right_pos;
					}
				});
				column.width(widest);
			});
			if($(".scale",canvas).length < 1){
				canvas.prepend('<div class="scale"></div>');
			}
			$(".scale",canvas).trigger({
				type:'scale-draw',
				max:chart_max,
				ticks:5
			});
		},500);
		chart.data("redraw-timeout",timeout);
	});
	$.address.change(function(event){
		$(".chart.barchart").trigger("get-state-chart").trigger("redraw");
	});
});