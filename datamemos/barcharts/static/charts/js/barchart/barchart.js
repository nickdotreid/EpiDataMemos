$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart","load-chart",function(event){
		var chart = $(this);
		var pallet = make_color_pallet();
		chart.data("pallet",pallet);
		var tags = [];
		$(".tags,.tags-children",chart).each(function(){
			pallet(false);//resets pallet
			$(".tag input",$(this)).each(function(){
				tags.push(this.value);
				pallet(this.value);
			});
		});
		$(".tags input,.tags-children input",chart).each(function(){
			var tag = $(this).parents(".tag:first");
			if(!tag.hasClass("tag-has-children")){
				$(".color",tag).css("background-color",pallet(this.value));	
			}
		});
		$(".bar",chart).each(function(){
			var bar = $(this);
			var tag_arr = bar.attr("tags").split(",");
			for(var index in tag_arr){
				if(in_array(tags,tag_arr[index])){
					bar.css("background-color",pallet(tag_arr[index]));
				}
			}
			bar.data("tags",tag_arr);
		});
		$(".bar",chart).trigger("bar-init");
		var bars = $(".bar",$(".column:first",chart));
		var sorted_bars = bars.sort(function(a,b){
			if($(a).data("amount") >= $(b).data("amount")){
				return 1;
			}
			return -1;
		});
		var first_col_value = $(".column:first",chart).attr("value");
		for(var i=0;i<sorted_bars.length;i++){
			var bar = $(sorted_bars[i]);
			$(".column",chart).each(function(){
				var column = $(this);
				var tag_match = bar.attr("tags").replace(first_col_value,column.attr("value"));
				$('.bar[tags="'+tag_match+'"]',column).prependTo(column);
			});
		}
		$(".canvas-container",chart).append('<div class="top-fade"></div>');
		chart.data("tags",[]);
		chart.trigger("get-state-chart").trigger("resize").trigger("redraw");
	}).delegate(".chart.barchart","get-state-chart",function(){
		var tags = [];
		if($.address.parameter("tags")){
			tags = $.address.parameter("tags").split(",");
		}else{
			var chart = $(this);
			setTimeout(function(){
				$('.tag input:first',chart).click();
			},500);
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
				event.tags = [];
				if(chart.data("tags") && chart.data("tags").length){
					for(var i=0; i<chart.data("tags").length;i++){
						event.tags.push(chart.data("tags")[i]);
					}					
				}
			}
			if(event.percent == undefined){
				event.percent = chart.data("percent");
			}
			chart.trigger({
				type:"controls-redraw",
				tags:event.tags,
				percent:event.percent
			});
			chart.trigger("chart-resize");
			
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
				var total_number = 0;
				var biggest_match = 1;
				$(".bar",column).each(function(){
					var bar = $(this);
					var matches = 0;
					var sibling_matches = 0;
					for(var index in event.tags){
						if(event.tags[index] != column.attr("value") && in_array(bar.data("tags"),event.tags[index])){
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
						total_number = 0;
						biggest_match = matches;
					}
					if(matches >= biggest_match){
						total_number += bar.data("amount");
						if(event.percent){
							biggest_number += bar.data("percent");
						}else{
							biggest_number += bar.data("amount");	
						}
					}
				});
				$(".label .total .amount",column).html(format_number(total_number));
				if(biggest_number>chart_max){
					chart_max = biggest_number;
				}
			});
			var to_5 = function(num){
				num += num * 0.05;
				return Math.ceil(num/5)*5;
			}
			if(event.percent){
				chart_max = to_5(chart_max * 100)/100;
				if(chart_max > 1){
					chart_max = 1;
				}
			}else{
				chart_max = to_5(chart_max);
			}
			$(".column",chart).removeClass("selected").each(function(){
				if(in_array(event.tags,$(this).attr("value"))){
					$(this).addClass("selected");
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
				max:chart_max
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
				ticks:5,
				percent:event.percent
			});
		},100);
		chart.data("redraw-timeout",timeout);
	}).delegate(".chart.barchart","chart-resize",function(event){
		var chart = $(this);
		var canvas = $(".canvas",chart);
		var margin_bottom = 0;
		$(".column .label",canvas).each(function(){
			if($(this).height() > margin_bottom){
				margin_bottom = $(this).height();
			}
		});
		canvas.css("margin-bottom",margin_bottom + 'px');
	}).delegate(".chart.barchart","chart-resize",function(event){
		var chart = $(this);
		var canvas = $(".canvas",chart);
		var canvas_container = $(".canvas-container",chart);
		var total_height = $(window).height() - css_to_number(chart.css("margin-top")) - css_to_number(chart.css("margin-bottom"));
		var avail_height = total_height - canvas_container.position().top - css_to_number(canvas_container.css("margin-top")) - css_to_number(canvas_container.css("margin-bottom"))
		canvas_container.nextAll("div").each(function(){
			avail_height -= $(this).height();	
		});
		if(canvas_container.height() != avail_height){
			canvas_container.height(avail_height);
			canvas.height(avail_height - css_to_number(canvas.css("margin-top")) - css_to_number(canvas.css("margin-bottom")));
			$(".column .label",canvas).css("top",canvas.height());			
		}
	}).delegate(".chart.barchart","chart-resize",function(event){
		var chart = $(this);
		var canvas = $(".canvas",chart);
		var canvas_width = 0;
		$(".column,.scale",canvas).each(function(){
			canvas_width += $(this).width() + css_to_number($(this).css("margin-right")) + css_to_number($(this).css("margin-left"));
		});
		if(canvas_width < $(".canvas-container",chart).width()){
			canvas_width = $(".canvas-container",chart).width();
		}
		canvas.width(canvas_width);
	});
	
	$(window).resize(function(){
		$(".chart").trigger("redraw");
	});
	
	$.address.change(function(event){
		$(".chart.barchart").trigger("get-state-chart").trigger("redraw");
	});
});

function css_to_number(css){
	return Number(css.replace("px",""));
}