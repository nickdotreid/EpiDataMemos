$(document).ready(function(){
	$("#chart").bind("loadr",function(event){
		var chart = $(this);
		$.ajax({
			url:chart.data('src'),
			success:function(data){
				chart.data("data",data['columns']).trigger("draw");
			}
		});
	}).bind("draw",function(event){
		var chart = $(this);
		data = $(this).data("data");
		
		$(".filters",chart).append("<div class='row'></div>");
		for(label in data[0]){
			if(data[0][label]!=data[0]['Label']){
				$('.filters .row:first',chart).append($("#templates .filter").clone());
				$('.filters .row:first .filter:last .name',chart).html(label);
				$('.filters .row:first .filter:last input',chart).val(label);
				$('.filters',chart).append("<div class='row child'></div>");
				for(child in data[0][label]){
					$('.filters .row:last',chart).append($("#templates .filter").clone());
					$('.filters .filter:last .name',chart).html(child);
					$('.filters .filter:last input',chart).val(child);
				}
			}
		}
		
		$(".chart",chart).append('<div class="canvas"></div>');
		for(index in data){
			var col_data = data[index]
			$(".chart .canvas",$(this)).append($("#templates .column").clone());
			$(".chart .column:last",$(this)).data("data",data[index]);
			$(".chart .column:last .label",$(this)).html(data[index]['Label']);
			// add bar for each value
			find_values(col_data,function(value,name,parent){
				if(value != col_data['Label']){
					$(".chart .column:last",chart).append($("#templates .bar").clone());
					$(".chart .column:last .bar:last",chart).data("name",name).data("amount",value).data("parent",parent);
					$(".chart .column:last .bar:last .amount",chart).html(value);
				}
			});
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
			event.filter = unescape($.address.parameter("filter"));
		}
		if(!event.highlight){
			event.highlight = unescape($.address.parameter("highlight"));
		}
		if(!event.percent){
			event.percent = $.address.parameter("percent");
		}
		
		set_button_state({
			filter:event.filter
		});
		
		chart_max = array_max(chart.data("data"),function(item){
			var biggest_number = 0;
			find_values(item,function(value,index,parent){
				if((event.filter == index || event.filter == parent) && value>biggest_number){
					biggest_number = value;
				}
			});
			return biggest_number;
		});
		if(event.percent){
			chart_max = 100
		}
		$(".chart .column",$(this)).each(function(){
			column = $(this);
			data = column.data("data");
			column.addClass(String(data['Label']));

			
			$(".bar",column).each(function(){
				bar = $(this);
				if(bar.data("name") != event.filter && bar.data("parent") != event.filter){
					bar.animate({
							height:'0px',
							top:graph.height()+'px',
							opacity:0
						},{
							duration:500,
							queue:false					
					});
					return true;
				}
				value = bar.data("amount");
				if(event.percent){
					percent = value/data['Total'];
				}else{
					percent = value/chart_max;
				}
				height = graph.height()*percent;
				bar.animate({
						height:height+'px',
						top:(graph.height()-height)+'px',
						opacity:1
					},{
						duration:500,
						queue:false					
				});
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
//		$(this).trigger("highlight");
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


function flatten(obj, includePrototype, into, prefix) {
    /* FROM http://stackoverflow.com/questions/963607/compressing-object-hierarchies-in-javascript */
	into = into || {};
    prefix = prefix || "";

    for (var k in obj) {
        if (includePrototype || obj.hasOwnProperty(k)) {
            var prop = obj[k];
            if (prop && typeof prop === "object" &&
                !(prop instanceof Date || prop instanceof RegExp)) {
                flatten(prop, includePrototype, into, prefix + k + "_");
            }
            else {
                into[k] = prop;// did read // into[prefix + k] = prop;
            }
        }
    }

    return into;
}

function find_values(obj,action,parent){
	for(index in obj){
		value = obj[index];
		if(value && typeof value == "object" && 
			!(value instanceof Date || value instanceof RegExp)){
				find_values(obj[index],action,index);
		}
		else if(action){
			action(value,index,parent);
		}
	}
}