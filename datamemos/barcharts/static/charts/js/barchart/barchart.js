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
		// append grid?
		$(".chart .column .bar",chart).height("0px").css("top",$(".canvas",chart).height());
		chart.data("tags",[]);
		chart.trigger("get-state-chart").trigger("redraw");
	}).delegate(".chart.barchart","get-state-chart",function(){
		var tags = [];
		if($.address.parameter("tags")){
			tags = $.address.parameter("tags").split(",");
		}
		$(this).data("tags",tags);
		if($.address.parameter("percent")){
			$(this).data("percent",true);
		}else{
			$(this).data("percent",false);
		}
	}).delegate(".chart.barchart","redraw",function(event){
		
		// redraw delay
		
		var chart = $(this);
		var canvas = $(".canvas",this);
		var stacked = false;
		
		if(!event.tags){
			event.tags = chart.data("tags");
		}
		if(event.percent == undefined){
			event.percent = chart.data("percent");
		}
		var sibling_tags = [];
		for(var index in event.tags){
			var tag = event.tags[index];
			$(".tags-children[parent='"+tag+"'] .tag input").each(function(){
				event.tags.push(this.value);
				stacked = true;
			});
			$(".tag input:not([value='"+tag+"'])",$(".tag input[value='"+tag+"']",chart).parents(".tags-children:first")).each(function(){
				sibling_tags.push(this.value);
			});
		}
		$(".column",chart).each(function(){
			var column = $(this);
			var total = 0;
			$(".bar",column).each(function(){
				var bar = $(this);
				matches = 0;
				for(var index in event.tags){
					if(in_array(bar.data("tags"),event.tags[index])){
						total += bar.data("amount");
						matches++;
					}
				}
				for(var index in sibling_tags){
					if(in_array(bar.data("tags"),sibling_tags[index])){
						matches++;
					}
				}
				if(matches>0){
					total += bar.data("amount");
					bar.data("matches",matches);
				}
			});
			column.data("amount",total);
		});
		
		
		var chart_max = 0;
		$(".column",chart).each(function(){
			var column = $(this);
			var biggest_number = 0;
			var biggest_match = 1;
			$(".bar",column).each(function(){
				var bar = $(this);
				var matches = 0;
				for(var index in event.tags){
					if(in_array(bar.data("tags"),event.tags[index])){
						matches++;
					}
				}
				bar.data("matches",matches);
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
		$(".bar").each(function(){
			var bar = $(this);
			var match = bar.data("matches");
			var _height = 0;
			var _y = 0;
			var _x = 0;
			var prev = bar.prev(".bar");
			if(prev.length>0){
				_x = prev.data("x");
				if(!stacked && prev.data("height")>0){
					var offset = bar.width()/10;
					_x += offset;	
				}
				if(stacked){
					_y = prev.data("y") + prev.data("height");	
				}
			}
			if(match>0){
				var value = 0;
				if(event.percent){
					value = bar.data("amount")/bar.parents(".column:first").data("amount");
				}else{
					value = bar.data("amount")/chart_max;
				}
				_height = canvas.height()*value;
			}
			bar.data({
				"height":_height,
				"x":_x,
				"y":_y
			});
		});
		$(".bar").each(function(){
			var bar = $(this);
			bar.animate({
				height:bar.data("height")+'px',
				top:(canvas.height()-bar.data("height")-bar.data("y"))+"px",
				left:bar.data("x")+"px"
			},{
				duration:500
			})
		})
		$(".column",chart).each(function(){
			var column = $(this);
			var widest = 0;
			$(".bar",column).each(function(){
				var right_pos = $(this).width() + Number($(this).css("left").replace("px",""));
				if(right_pos > widest){
					widest = right_pos;
				}
			});
			column.width(widest);
		});
		$(".grid",$(this)).trigger({
			type:"grid_redraw",
			filter:event.filter,
			highlight:event.highlight,
			percent:event.percent,
			chart_max:chart_max
		});
	});
	$.address.change(function(event){
		$(".chart.barchart").trigger("get-state-chart").trigger("redraw");
	});
});