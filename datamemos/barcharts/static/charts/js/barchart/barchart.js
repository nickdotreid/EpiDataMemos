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
				var biggest_match_total = 0;
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
						biggest_match_total = bar.data("total");
						if(event.percent){
							biggest_number += bar.data("percent");
						}else{
							biggest_number += bar.data("amount");	
						}
					}
				});
				column.data("max",biggest_number);
				if(biggest_match_total == 0){
					biggest_match_total = biggest_number;
				}
				$(".label .total .amount",column).html(format_number(biggest_match_total));
				if(biggest_number>chart_max){
					chart_max = biggest_number;
				}
			});
			
			$(".column",chart).removeClass("selected").each(function(){
				if(in_array(event.tags,$(this).attr("value"))){
					$(this).addClass("selected");
				}
			});
			
			chart_max = round_to_significant_number(chart_max,event.percent);
			
			var last_max = chart_max;
			if($(".scale",canvas).length < 1){
				canvas.prepend('<div class="scale"></div>');
				$(".scale:first",chart).data("max",last_max);
			}
			$(".column",chart).each(function(){
				var column = $(this);
				var widest = 0;
				var bars = $(".bar.showing",column);
				bars.each(function(i){
					var right_pos = $(this).width();
					if(i > 1){
						right_pos += $(this).data("x");
					}
					if(right_pos > widest){
						widest = right_pos;
					}
				});
				column.width(widest);
				var target_columns = column;
				if(column.data("max") && !in_range_of(column.data("max"),last_max)){
					last_max = round_to_significant_number(column.data("max"),event.percent);
					column.before('<div class="scale"></div>');
					column.prev(".scale:first").data("max",last_max);
				}else{
					if(column.data("max") > last_max){
						last_max = round_to_significant_number(column.data("max"),event.percent);
						target_columns = column.prevUntil(".scale");
						target_columns.push(column[0]);
					}
				}
				$(".bar",target_columns).trigger({
					type:'bar-calculate',
					tags:event.tags,
					percent:event.percent,
					max:last_max,
					stacked:stacked
				}).trigger({
					type:'bar-animate',
					tags:event.tags,
					percent:event.percent,
					max:last_max
				});
				column.prevAll(".scale:first").trigger({
					type:'scale-draw',
					max:last_max,
					ticks:5,
					percent:event.percent
				});
			});
			$(".scale",chart).each(function(){
				var scale = $(this);
				if(scale.next().hasClass("scale")){
					scale.trigger("scale-remove");
				}else if(in_range_of(scale.data("max"),scale.prevAll(".scale:first").data("max"))){
					scale.trigger("scale-remove");
				}
			});
			var xpos = 0;
			$(".scale,.column",chart).each(function(){
				$(this).css("left",xpos + 'px');
				xpos += $(this).width() + css_to_number($(this).css("margin-right"));
			});
			$(".scale").trigger("grid-redraw");
		},100);
		chart.data("redraw-timeout",timeout);
	}).delegate(".chart.barchart","chart-resize",function(event){
		var chart = $(this);
		var canvas = $(".canvas",chart);
		var canvas_container = $(".canvas-container",chart);
		var margin_bottom = 0;
		$(".column .label",canvas).each(function(){
			var height = $(this).height();
			if(height > margin_bottom){
				margin_bottom = height;
			}
		});
		canvas.css("margin-bottom",margin_bottom + 'px');
		canvas_container.height(canvas.height() + margin_bottom);
		$(".column .label",canvas).css("top",canvas.height());
	}).delegate(".chart.barchart","chart-resize",function(event){
		// Horizontally expand canvas to fit chart columns
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

function round_to_significant_number(num,percent){
	if(percent){
		num = round_to_significant_number(num * 100, false)/100;
		if(num > 1){
			num = 1;
		}
		return num;
	}
	num += num * 0.05;
	return Math.ceil(num/5)*5;
}
function in_range_of(a,b){
	if(a < b && a > b/6){
		return true;
	}else if(a > b && b > a/6){
		return true;
	}else if( a == b){
		return true;
	}
	return false;
}
