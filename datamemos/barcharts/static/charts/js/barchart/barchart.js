Chart = Backbone.Model.extend({
	defaults:{
		rows:[],
		columns:[],
		points:[],
		id:1
	},
	fetch:function(){
		if(this.lock){
			return ;
		}
		this.lock = true;
		var chart = this;
		$.ajax({
			url:'/charts/'+this.id+'/',
			method:'GET',
			data_type:'JSON',
			data:{
				json:true
			},
			success:function(data){
				chart.load(data);
				chart.lock = false;
			}
		});
	},
	load: function(data){
		this.set(data);
		var chart = this;

		var rows = new TagCollection();
		_(data['rows']).forEach(function(tag){
			rows.add({
				short: tag['short'],
				name: tag['name'],
				parent: tag['parent'],
				children: tag['children'],
				siblings: tag['sibilings']
			});
		});
		rows.connect_tags();
		this.set("rows",rows);
		
		var columns = new TagCollection();
		_(data['columns']).forEach(function(tag){
			columns.add({
				short: tag['short'],
				name: tag['name'],
			});
		});
		this.set("columns",columns);
		
		var points = new PointCollection();
		_(data['points']).forEach(function(point){
			var point = point;
			var add_tag = function(tag){
				if(_.indexOf(point['tags'],tag.get("short")) > -1){
					return true;
				}
				return false;
			};
			points.add({
				value:point['value'],
				rows:_.filter(rows.models, add_tag),
				columns:_.filter(columns.models, add_tag)
			});
		});
		rows.bind("tag-changed",function(){
			_(points.models).forEach(function(point){
				point.toggle();
			})
		});
		this.set("points",points);
		
		rows.bind("change:selected",function(tag){
			if(tag.get("selected")){
				points.toggle();
			}
		});
		
		this.trigger("loaded");
	}
});

Point = Backbone.Model.extend({
	defaults: {
		rows:[],
		columns:[],
		value:0,
		visible: false,
		selected: false,
		highlighted: false
	},
	initialize: function(){
		var point = this;
	},
	toggle: function(){
		var visible = false;
		var selected = false;
		_(this.get("rows")).forEach(function(tag){
			if(tag.get("selected")){
				visible = true;
				selected = true;
			}else if(tag.get("parent") && tag.get("parent").get("selected")){
				visible = true;
			}else{
				_(tag.get("siblings")).forEach(function(sib){
					if(sib.get("selected")){
						visible = true;
					}
				});
			}
		});
		// check if column is selected -- if tag also selected || highlight!
		this.set("selected",selected);
		this.set("visible",visible);
	}
});

PointCollection = Backbone.Collection.extend({
	model:Point,
	toggle:function(){
		this.forEach(function(point){
			point.toggle();
		});
	}
});

ChartView = Backbone.View.extend({
	initialize: function(){
		this.template = _.template($("#barchart-template").html());
		this.pallet = make_color_pallet();
		var view = this;
		this.model.bind("loaded",function(){
			view.render();
		});
		
		this.tag_order = [];
	},
	render: function(){
		var chart_view = this;
		this.model.get("rows").bind("tag-changed",function(){
			chart_view.update();
		});
		
		this.el = $(this.template(this.model.toJSON())).appendTo("#barchart-container")[0];
		this.$el = $(this.el);
		
		var pallet = this.pallet;
		_(_(this.model.get("rows").models).filter(function(tag){
			return !tag.get("parent");
		})).forEach(function(tag){
			tag.set_color(pallet);
		});
		
		// render control field sets for columns & rows
		rows_control = new TagButtonField({
			collection:this.model.get("rows")
		});
		rows_control.render();
		rows_control.$el.appendTo(".controls",this.$el);
		
		columns_control = new TagButtonField({
			collection:this.model.get("columns")
		});
		columns_control.render();
		columns_control.$el.appendTo(".controls",this.$el);	
		
		var canvas = $(".canvas",$(this.el));
		var paper = Raphael(canvas[0],canvas.width(),canvas.height());
		
		var chart_view = this;
		this.columns = [];
		_(this.model.get("columns").models).forEach(function(tag){
			var column = new ColumnView({
				model:tag,
				paper:paper
			});
			chart_view.columns.push(column);
			
			_(_(chart_view.model.get("points").models).filter(function(point){
				return _(point.get("columns")).indexOf(tag) > -1;			
			})).forEach(function(point){
				var point_view = new PointView({
					model:point,
					paper:paper
				});
				column.points.push(point_view);
				point_view.render();
			});
			column.tag_order = column.get_order();
		});
		
		this.tag_order = _(this.model.get("rows").models).map(function(tag){
			return tag;
		});
		
		this.paper = paper;
		return this;
	},
	update: function(){
		var chart_max = 0;
		var tag_order = this.tag_order;
		var order_set = false;
		_(this.columns).forEach(function(column){
			var total = column.get_total();
			if(total > chart_max) chart_max = total;
			if(column.stacked && !order_set){
				order_set = true;
				tag_order = column.tag_order;
			}
		});
		chart_max = round_to_significant_number(chart_max);
		_(this.columns).forEach(function(column){
			column.set_order(tag_order);
		});
		var xpos = 0;
		_(this.columns).forEach(function(column){
			xpos += column.padding;
			column.x = xpos;
			column.calculate(chart_max);
			xpos = column.width + column.x + column.padding;
		});
		_(this.columns).forEach(function(column){
			column.update();
		});
	}
});

ColumnView = Backbone.View.extend({
	initialize:function(options){
		this.model = options.model;
		this.paper = options.paper;
		this.points = [];
		this.tag_order = [];
		this.padding = 10;
		this.width = 0;
		this.x = 0;
		this.stacked = true;
	},
	get_total: function(){
		var column = this;
		var selected = false;
		var total = 0;
		column.stacked = false;
		_(this.points).forEach(function(point_view){
			if(point_view.model.get('selected')){
				selected = true;
				total += point_view.model.get("value");
			}
		});
		if(!selected){
			column.stacked = true;
			_(this.points).forEach(function(point_view){
				if(point_view.model.get('visible')){
					total += point_view.model.get("value");
				}
			});
		}
		return total;
	},
	calculate: function(total){
		if(!total) return;
		var column = this;
		_(this.points).forEach(function(point_view){
			point_view.calculate(total);
		});
		if(!this.stacked){ // serial chart
			var xpos = 0 + this.x;
			var extra = 0;
			_(this.points).forEach(function(point_view){
				point_view.x = xpos;
				point_view.y = point_view.paper.height - point_view.height;
				if(point_view.height > 0){
					var offset = point_view.width/5
					xpos += offset;
					extra = point_view.width - offset;
					point_view.recolor(!point_view.model.get("selected"));
				}
			});
			this.width = xpos+extra - this.x;
		}else{ // stacked chart
			var ypos = 0;
			_(this.points).forEach(function(point_view){
				point_view.x = column.x;
				point_view.y = point_view.paper.height - ypos - point_view.height;
				if(point_view.height > 0){
					ypos += point_view.height;
					column.width = point_view.width;
					point_view.recolor();
				}
			});
		}
	},
	get_order: function(){
		var points = _(this.points).sortBy(function(point){
			return point.model.get('value') * -1;
		});
		return _(points).map(function(point){
			return point.model.get("rows")[0];	
		});
	},
	set_order: function(order){
		var new_order = order;
		this.points = _(this.points).sortBy(function(point){
			var row = point.model.get("rows")[0];
			return _(new_order).indexOf(row);
		});
		_(this.points).forEach(function(point){
			point.el.toFront();
		});
	},
	update: function(){
		_(this.points).forEach(function(point_view){
			point_view.update();
		});
	}
});

PointView = Backbone.View.extend({
	initialize:function(options){
		var point_view = this;
		this.paper = options.paper;
		
		// defaults
		this.width = 65;
		this.height = 0;
		this.y = 0;
		this.x = 0;
		
		var color = false;
		_(this.model.get("rows")).forEach(function(tag){
			if(tag.get("color")){
				color = Raphael.color(tag.get("color"));
			}
		});
		this.color = color;
	},
	render: function(){
		var paper = this.paper;
		var el = paper.rect(0,paper.height - this.height,this.width,this.height);
		el.attr("stroke-width",0);
		el.attr("fill",this.color);
		this.el = el;
	},
	calculate: function(total){
		if(!total) return ;
		if(this.model.get("visible")){
			var value = this.model.get("value");
			this.height = value/total * this.paper.height;
			this.y = this.paper.height - this.height;
			return this;
		}
		this.height = 0;
		return this;
	},
	recolor: function(desaturate){
		if(desaturate){
			var color = Raphael.hsb(this.color.h,this.color.s * 0.3,1);
			this.el.attr("fill",color);
			return this;
		}
		this.el.attr("fill",this.color);
		return this;
	},
	update: function(){
		this.el.attr({
			width:this.width,
			height:this.height,
			y:this.y,
			x:this.x
			});
		if(this.model.get("selected")){
			this.el.toFront();
		}
	}
});