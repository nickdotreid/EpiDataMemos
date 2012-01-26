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
		
		$(this).trigger("ext-draw");
		$(this).trigger("redraw");
	}).bind("redraw",function(event){
		var chart = $(this);
		var graph = $(".chart",chart);
		event = fill_in_values(event);
		
		set_button_state({
			filter:event.filter
		});
		/* DEFINE MAX VALUE */
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
		chart.data("max",chart_max);
		
		
		/* DRAW BARS  */
		$(".chart .column",$(this)).each(function(){
			column = $(this);
			data = column.data("data");
			column.addClass(String(data['Label']));
			
			get_active_bars = function(){
				bar = $(this);
				add = false;
				if(bar.data("name") == event.filter || bar.data("parent") == event.filter){
					add = true;
				}
				if(!add){
				for(index in active_bars){
					if($(active_bars[index]).data("parent")==bar.data("parent")){
						add = true;
					}
				}
				}
				if(add && !in_array(active_bars,this)){
					active_bars.push(this);
				}
			}
			active_bars = [];
			$(".bar",column).each(get_active_bars);
			$(".bar",column).each(get_active_bars); // twice to catch them all
			
			// sort active bars
			active_bars = active_bars.sort(function(a,b){
				if($(a).data("amount")>$(b).data("amount")){
					return true;
				}
				return false;
			});
			// animate bars
			height=0;
			$(".bar",column).each(function(){
				bar = $(this);
				if(!in_array(active_bars,this)){
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
			});
			$(".bar",column).removeClass("active");
			
			ypos = 0;
			for(i in active_bars){
				bar = $(active_bars[i]);
				bar.addClass("active");
				value = bar.data("amount");
				if(event.percent){
					percent = value/data['Total'];
				}else{
					percent = value/chart_max;
				}
				height = graph.height()*percent;
				y = graph.height() - height;
				z = 10-i;
				x = i*5;
				if(event.percent){
					y = ypos;
					x=0;
				}
				bar.animate({
						height:height+'px',
						top:y+'px',
						left:x+'px',
						'z-index':z,
						opacity:1
					},{
						duration:500,
						queue:false					
				});
				ypos += height;
			}
			
			/*  MOVE HIGHLIGHT */
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
	}).delegate(".column","expand",function(){
		column = $(this);
		if($(".bar.active",column).length>1){
			bars = $(".bar.active",column);
			bars = bars.sort(function(a,b){
				if($(a).data("amount")>$(b).data("amount")){
					return true;
				}
				return false;
			});
			for(var i=0;i<bars.length;i++){
				bar = $(bars[i]);
				bar.animate({
					left:(i*10)+'px'
				},{
					duration:250,
					queue:false
				});
			}
		}
	}).delegate(".column","collapse",function(event){
		column = $(this);
		if($(".bar",column).length>1){
			$(".bar",column).each(function(i){
				$(this).animate({
					left:(i*5)+'px'
				},{
					duration:250,
					queue:false
				})
			});
		}
	}).delegate(".column .bar","mouseenter",function(event){
		$.address.parameter("highlight",false);
		$(this).addClass("hover");
//		$(this).trigger("highlight");
	}).delegate(".column .bar","mouseleave",function(event){
		$(this).removeClass("hover");
	}).delegate(".column","mouseenter",function(event){
		$(this).trigger("expand");
	}).delegate(".column","mouseleave",function(event){
			column = $(this);
			column.trigger("collapse");
			if($.address.parameter("highlight")!=column.data("data")['Label']){
				$(".highlight",column).hide();
			}
	}).delegate(".column .bar","click",function(event){
		$.address.parameter("filter",$(this).data("name"));
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
});