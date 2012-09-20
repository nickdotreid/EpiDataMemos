$(document).ready(function(){
	$(".wrapper").delegate(".chart.barchart","load-chart",function(event){
		var chart = $(this);
		
		// get data for chart (if not passed in event)
		if(!event.rows || !event.columns || !event.points){
			$.ajax({
				url:'/charts/'+chart.attr("chart-id")+'/',
				method:'GET',
				success:function(data){
					if(data['rows'] && data['columns'] && data['points']){
						chart.trigger({
							'type':'load-chart',
							'rows':data['rows'],
							'columns':data['columns'],
							'points':data['points']
						});
					}
				}
			});
			return ;
		}
		
		if(chart.data("initialized")){
			return ;
		}
		chart.data("initialized",true);
		
		// set up canvas
		var canvas = $(".canvas",chart);
		var paper = Raphael(canvas[0],canvas.width(),canvas.height());
		
		// set color pallet for bars
		var pallet = make_color_pallet();
		
		var tags = [];
		var rows = [];
		for(var i=0;i<event.rows.length;i++){
			var row = event.rows[i];
			rows[row['short']] = row;
			tags[row['short']] = row;
			pallet(row['short']);
		}
		// make siblings for rows
		var columns = [];
		for(var i=0;i<event.columns.length;i++){
			var column = event.columns[i];
			columns[column['short']] = column;
			tags[column['short']] = column;
		}
		
		for(short in tags){
			var tag = tags[short];
			tag['set'] = paper.set();
			tag['points'] = [];
		}
		var bars = paper.set();
		var points = [];
		var make_point_object = function(point){
			var _width = 50;
			var _height = 50;
			var bar = paper.rect(_width,canvas.height()-_height,_width,_height);
			bar.attr('stroke-width',0);
			bars.push(bar);
			return {
				value:point['value'],
				tags:point['tags'],
				bar:bar,
				get_scale:function(value){
					return canvas.height()*(this.value/value);
				},
				scale:function(value){
					var _height = this.get_scale(value);
					this.bar.attr('height',_height);
					this.bar.attr('y',canvas.height() - _height);
				}
			}
		}
		for(var i=0;i<event.points.length;i++){
			var point = make_point_object(event.points[i]);
			for(var q=0;q<point['tags'].length;q++){
				var tag = point['tags'][q];
				if(tags[tag]){
					tags[tag]['set'].push(point['bar']);
					tags[tag]['points'].push(point);
				}
				if(rows[tag]){
					point['bar'].attr('fill',pallet(tag));
				}
			}
		}
				
		chart.bind("chart-redraw",function(event){
			if(!event.tags) return ;
			bars.attr("height",0);
			var points = [];
			for(var i=0;i<event.tags.length;i++){
				var tag = event.tags[i];
				if(rows[tag]){
					points = rows[tag]['points'];
				}
			}
			for(var i=0;i<points.length;i++){
				// if not in range of prev (or prev scale) -- redefine scale
				points[i].scale(200);
			}
			// animate bars?
			// slide columns around
		});
		
		chart.bind("chart-resize",function(event){
			// slide columns around
		});
		
		// set initial state (pick first row)
		
		chart.trigger("chart-redraw");
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
