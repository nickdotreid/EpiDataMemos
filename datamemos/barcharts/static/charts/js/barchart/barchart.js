Chart = Backbone.Model.extend({
	urlRoot:'/charts/',
	url:function(){
		return this.urlRoot + this.get("id");
	},
	defaults:{
		tags:[],
		rows:[],
		columns:[],
		points:[],
		percent:false,
		id:1,
		active:false
	},
	fetch: function(options){
		var success_func = false;
		if(options.success){
			success_func = options.success;
		}
		var chart = this;
		$.ajax({
			url:this.url(),
			data_type:"JSON",
			data:{
				json:true
			},
			success:function(data){
				chart.set(data);
				chart.parse_self();
				if(success_func){
					success_func(chart);
				}
			}
		});
	},
	parse_self: function(){
		var chart = this;
		
		var get_or_add_tag = function(data){
			var tag = false;
			var tags = chart.get("tags");
			var _tags = tags.where({short:tag['short']});
			if(_tags.length > 0){
				tag = _tags[0];
			}else{
				tag = new Tag(data);
				tags.add(tag);
			}
			return tag;
		}
		
		var rows = new TagCollection();
		_(this.get("rows")).forEach(function(data){
			var tag = get_or_add_tag(data);
			rows.add(tag);
		});
		rows.connect_tags();
		this.set("rows",rows);
		
		var columns = new TagCollection();
		_(this.get("columns")).forEach(function(data){
			var tag = get_or_add_tag(data);
			columns.add(tag);
		});
		columns.connect_tags();
		this.set("columns",columns);
		
		var points = new PointCollection();
		_(this.get("points")).forEach(function(point){
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
			points.forEach(function(point){
				point.toggle();
			})
		});
		this.set("points",points);
		
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
	model:Point
});

ChartView = Backbone.View.extend({
	initialize: function(options){
		this.container = options.container;
		
		this.template = _.template($("#barchart-template").html());
		this.pallet = make_color_pallet();
		
		this.tag_order = [];
		
		var chart_view = this;
		this.model.get("rows").bind("tag-changed",function(){
			chart_view.update();
		});
		this.model.get("columns").bind("tag-changed",function(){
			chart_view.update();
		});
		this.model.bind("change:percent",function(){
			chart_view.update();
		});
	},
	render: function(){
		var chart_view = this;
		
		this.setElement(this.template(this.model.toJSON()));
		var container = $(this.container);
		var existing_element = $("#chart-" + this.model.get("id") + ", .chart[chart-id="+this.model.get("id")+"]",container);
		if(existing_element.length > 0){
			this.$el.insertBefore(existing_element[0]);
			existing_element.remove();
		}else{
			this.$el.appendTo(container);
		}
		
		this.el = $().appendTo("#barchart-container")[0];
		
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
		
		var percent_control = new PercentCheckbox({
			model: this.model
		});
		var chart_model = this.model;
		percent_control.bind("percent-toggle",function(){
			if(chart_model.get("percent")){
				chart_model.set("percent",false);
				return ;
			}
			chart_model.set("percent",true);
		})
		percent_control.render();
		percent_control.$el.appendTo(".controls",this.$el);
		
		
		var canvas = this.$(".canvas");
		var paper = Raphael(canvas[0],canvas.width(),canvas.height());
		
		this.x_label = paper.text(0,0,this.model.get("x_label"));
		var xbox = this.x_label.getBBox();
		this.x_label.attr("x",paper.width/2 - xbox.width/2);
		this.x_label.attr("y",paper.height - xbox.height);
		
		this.y_label = paper.text(0,0,this.model.get("y_label"));
		this.y_label.transform('r-90');
		var ybox = this.y_label.getBBox();
		this.y_label.attr("x",0-(paper.height-ybox.height));
		this.y_label.attr("y",ybox.width);
		
		var chart_view = this;
		this.columns = [];
		_(this.model.get("columns").models).forEach(function(tag){
			var column = new ColumnView({
				model:tag,
				paper:paper,
				floor:paper.height - xbox.height,
				cieling:10
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
		
		this.trigger("rendered",this.model);
		
		return this;
	},
	update: function(){
		var chart_max = 0;
		var tag_order = this.tag_order;
		var order_set = false;
		var percent = this.model.get("percent");
		
		var active_tag = this.model.get("rows").find(function(tag){
			return tag.get("selected");
		});
		if(percent && active_tag.get("children").length < 1 && !active_tag.get("parent")){
			this.model.set("percent",false);
			return this;
		}
		
		_(this.columns).forEach(function(column){
			var total = column.get_total(percent);
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
		xpos += this.y_label.getBBox().width;
		_(this.columns).forEach(function(column){
			xpos += column.padding;
			column.x = xpos;
			column.calculate(chart_max,percent);
			xpos = column.width + column.x + column.padding;
		});
		_(this.columns).forEach(function(column){
			column.animate(750);
		});
	}
});

PercentCheckbox = Backbone.View.extend({
	events:{
		'click input':'toggle'
	},
	initialize:function(options){
		this.template = _.template('<fieldset class="percent-control"><label class="checkbox"><input type="checkbox" value="" />Show as percent</label></fieldset>');
		this.setElement(this.template({}));
		
		var checkbox = this;
		this.model.bind("change:percent",function(){
			checkbox.render();
		});
	},
	render: function(){
		if(this.model.get("percent")){
			this.$("input").attr("checked","checked");
			return true;
		}
		this.$("input").attr("checked",false);
		return false;
	},
	toggle: function(event){
		this.trigger("percent-toggle");
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
		
		this.cieling = options.cieling;
		this.floor = options.floor;
		
		this.stacked = true;
		
		this.current_total=0;
		
		this.make_label();
	},
	make_label: function(){
		var title = this.model.get("name");
		this.label_title = this.paper.text(0,0,title);
		this.label_total = this.paper.text(0,0,"foo");
		this.update_label();
		this.label_total.attr("y",this.floor - this.label_total.getBBox().height);
		this.label_title.attr("y",this.floor - this.label_total.getBBox().height - this.label_title.getBBox().height);
		this.floor = this.floor - this.label_title.getBBox().height - this.label_total.getBBox().height;
	},
	update_label: function(){
		this.label_total.attr("text",this.current_total);
		var total_box = this.label_total.getBBox();
		this.label_total.attr("x",this.x + this.width/2 - total_box.width/2);
		
		var xbox = this.label_title.getBBox();
		this.label_title.attr("x",this.x + this.width/2 - xbox.width/2);
	},
	get_total: function(percent){
		var column = this;
		var selected = false;
		var total = 0;
		var current_total = 0;
		var abs_total = 0;
		
		_(this.points).forEach(function(point_view){
			if(point_view.model.get('selected')){
				selected = true;
				if(percent) total += point_view.model.get("value");
				else total += point_view.model.get("value");
			}
			if(point_view.model.get('visible')){
				if(percent) current_total += point_view.model.get("value");
				else current_total += point_view.model.get("value");
			}
		});
		this.current_total = current_total;
		if(selected){
			this.stacked = false;
			return total;
		}
		this.stacked = true;
		return current_total;
	},
	calculate: function(total){
		if(!total) total = this.get_total();
		var column = this;
		_(this.points).forEach(function(point_view){
			point_view.calculate(total,column.floor - column.cieling);
		});
		if(!this.stacked){ // serial chart
			var xpos = 0 + this.x;
			var extra = 0;
			_(this.points).forEach(function(point_view){
				point_view.x = xpos;
				point_view.y = column.floor - point_view.height;
				if(point_view.height > 0){
					var offset = point_view.width/5;
					if(column.model.get("selected")){
						offset += offset;
					}
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
				point_view.y = column.floor - ypos - point_view.height;
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
		var behind = false;
		_(this.points).forEach(function(point){
			if(behind) point.el.insertBefore(behind.el);
			else point.el.toFront();
			if(point.model.get("selected") || behind){
				behind = point;
			}
		});
	},
	update: function(){
		_(this.points).forEach(function(point_view){
			point_view.update();
		});
		this.update_label();
	},
	animate: function(duration){
		_(this.points).forEach(function(point_view){
			point_view.animate(duration);
		});
		this.update_label();
	}
});

PointView = Backbone.View.extend({
	initialize:function(options){
		var point_view = this;
		this.paper = options.paper;
		
		this.updated = false;
		
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
		this.original_color = color;
		this.color = color;
	},
	render: function(){
		var paper = this.paper;
		var el = paper.rect(0,paper.height - this.height,this.width,this.height);
		el.attr("stroke-width",0);
		el.attr("fill",this.color);
		this.el = el;
	},
	calculate: function(total,floor){
		if(!total) return ;
		if(this.model.get("visible")){
			var value = this.model.get("value");
			this.height = value/total * floor;
			this.y = floor - this.height;
			return this;
		}
		this.height = 0;
		return this;
	},
	recolor: function(desaturate){
		this.color = this.original_color;
		if(desaturate){
			var color = Raphael.hsb(this.color.h,this.color.s * 0.3,1);
			this.color = color;
			return this;
		}
		return this;
	},
	update: function(){
		this.updated = true;
		this.el.attr({
			height:this.height,
			y:this.y,
			x:this.x,
			fill: this.color
			});
		if(this.model.get("selected")){
			this.el.toFront();
		}
	},
	animate: function(duration){
		if(!this.updated) this.update();
		if(this.in_position()) return true;
		var point = this;
		var duration = duration/2;
		point.el.animate({
			x: this.x,
			fill: point.color,
			callback:function(){
				point.el.animate({
					height: point.height,
					y: point.y
				},duration);
			}
		},duration);
	},
	in_position: function(){
		if(this.x != this.el.attr("x")) return false;
		if(this.y != this.el.attr("y")) return false;
		if(this.height != this.el.attr("height")) return false;
		if(this.color != this.el.attr("color")) return false;
		return true;
	}
});