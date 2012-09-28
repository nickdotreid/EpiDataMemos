ChartView = Backbone.View.extend({
	padding:10,
	scales:[],
	tag_order:[],
	columns:[],
	pallet:make_color_pallet(),
	template:_.template($("#barchart-template").html()),
	initialize: function(options){
		this.container = options.container;
		
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
		
		/** SET UP DOM ELEMENT **/
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
		
		/** MAKE CHART COLORS **/
		var pallet = this.pallet;
		_(_(this.model.get("rows").models).filter(function(tag){
			return !tag.get("parent");
		})).forEach(function(tag){
			tag.set_color(pallet);
		});
		
		/** RENDER CONTROLS **/
		rows_control = new TagButtonField({
			collection:this.model.get("rows"),
			title: "Select a Row"
		});
		rows_control.render();
		rows_control.$el.appendTo(".controls",this.$el);
		
		columns_control = new TagButtonField({
			collection:this.model.get("columns"),
			title: "Select a Column"
		});
		columns_control.render();
		columns_control.$el.appendTo(".controls",this.$el);
		
		var percent_control = new PercentCheckbox({
			model: this.model
		});
		percent_control.render();
		percent_control.$el.appendTo(".controls",this.$el);
		
		/** SET UP SVG **/
		var canvas = this.$(".canvas");
		var paper = Raphael(canvas[0],canvas.width(),canvas.height());
		this.paper = paper;
		
		/** RENDER LABELS **/
		this.x_label = paper.text(0,0,this.model.get("x_label"));
		var xbox = this.x_label.getBBox();
		this.x_label.attr("x",paper.width/2 - xbox.width/2);
		this.x_label.attr("y",paper.height - xbox.height);
		
		this.y_label = paper.text(0,0,this.model.get("y_label"));
		this.y_label.transform('r-90');
		var ybox = this.y_label.getBBox();
		this.y_label.attr("x",0-(paper.height-ybox.height));
		this.y_label.attr("y",ybox.width);
		
		/** MAKE COLUMNS **/
		var chart_view = this;
		this.columns = [];
		this.points = [];
		var _points = this.points;
		this.model.get("columns").forEach(function(tag){
			var column = new ColumnView({
				model:tag,
				paper:paper,
				floor:paper.height - xbox.height,
				cieling:chart_view.padding * 2
			});
			chart_view.columns.push(column);
			
			_(_(chart_view.model.get("points").models).filter(function(point){
				return _(point.get("columns")).indexOf(tag) > -1;			
			})).forEach(function(point){
				var point_view = new PointView({
					model:point,
					paper:paper
				});
				_points.push(point_view);
				column.points.push(point_view);
				point_view.render();
			});
			column.tag_order = column.get_order();
		});
		
		this.tag_order = _(this.model.get("rows").models).map(function(tag){
			return tag;
		});
		
		this.trigger("rendered",this.model);
		return this;
	},
	update: function(){
		var chart_view = this;
		var chart_max = 0;
		
		if(this.columns.length < 1) return;
		
		/**		FIND ACTIVE TAG		**/
		var active_tag = this.model.get("rows").find(function(tag){
			return tag.get("selected");
		});
		if(!active_tag){
			this.model.get("rows").first().set("active",true); // totally not how to do this
		}
		if(this.model.get("percent") && active_tag.get("children").length < 1 && !active_tag.get("parent")){
			this.model.set("percent",false);
			this.update();
			return ;
		}
		
		/**		SET SCALES		**/
		if(this.scales.length < 1){
			scale = new ScaleColumn({
				paper: this.paper
			});
			this.scales.push(scale);
		}
		
		_(this.scales).forEach(function(scale){
			scale.columns = [];
		});
		
		var scales = this.scales;
		var new_scales = [];
		var scale = scales[0];
		
		var scale_first_set = false;
		var draw_items = [];
		
		new_scales.push(scale);
		draw_items.push(scale);
		scale.max = 0;
		_(this.columns).forEach(function(column){
			var total = round_to_significant_number(column.get_total(), 0.05);
			if(total != 0){
				if(!scale_first_set){
					scale.max = total;
					scale_first_set = true;
					_(scale.columns).forEach(function(col){
						col.max = scale.max;
					});
				}else if(!in_range_of(scale.max,total)){
					var existing_scale = _(scales).find(function(scale){
						return in_range_of(scale.max,total);
					});
					if(existing_scale){
						scale = existing_scale;
					}else{
						scale = new ScaleColumn({
							paper: chart_view.paper
						});					
					}
					new_scales.push(scale);
					draw_items.push(scale);
				}
				if(scale.max < total){
					scale.max = total;
					_(scale.columns).forEach(function(col){
						col.max = scale.max;
					});
				}
			}
			scale.columns.push(column);
			column.max = scale.max;
			draw_items.push(column);
		});
		
		var stacked = false;
		_(this.columns).forEach(function(col){
			stacked = col.is_stacked();
		});
		var tag_order = this.tag_order;
		if(stacked) tag_order = this.columns[0].get_order();
		_(this.columns).forEach(function(column){
			column.set_order(tag_order);
		});
		
		var col_selected = _(this.columns).any(function(column_view){
			return column_view.model.get("selected");
		});
		_(this.points).forEach(function(point_view){
			if(stacked){
				if(col_selected){
					if(_(point_view.model.get("columns")).any(function(tag){
						return tag.get("selected");
					})){
						point_view.recolor();
					}else{
						point_view.recolor(true);
					}
				}else{
					point_view.recolor();
				}
			}else{
				if(col_selected){
					if(_(point_view.model.get("columns")).any(function(tag){
						return tag.get("selected");
					})){
						if(_(point_view.model.get("rows")).any(function(tag){
							return tag.get("selected");
						})){
							point_view.recolor();
						}else{
							point_view.recolor(true);
						}
					}else{
						if(_(point_view.model.get("rows")).any(function(tag){
							return tag.get("selected");
						})){
							point_view.recolor(true);
						}else{
							point_view.recolor(true,true);
						}
					}
				}else{
					if(_(point_view.model.get("rows")).any(function(tag){
						return tag.get("selected");
					})){
						point_view.recolor();
					}else{
						point_view.recolor(true);
					}
				}
			}
		});
		
		var xpos = 0;
		xpos += this.y_label.getBBox().width;
		
		var lowest_label = this.paper.height;
		_(this.columns).forEach(function(column){
			var label_height = column.label_title.attr("y");
			if(label_height < lowest_label){ 
				lowest_label = label_height;
			}
		});
		
		var chart_view = this;
		var bbox = {
			x: xpos,
			y: this.padding * 2,
			width: undefined,
			height: lowest_label - this.padding * 2 - this.padding
		};
		_(draw_items).forEach(function(drawable){
			bbox.x += chart_view.padding;
			drawable.calculate(drawable.max,bbox);
			bbox.x = drawable.BBox.width + drawable.BBox.x + chart_view.padding;
		});
		
		
		_(this.scales).filter(function(scale){
			if(scale.columns.length < 1){
				scale.remove();
			}
			return true;
		});
		this.scales = new_scales;
		
		_(draw_items).forEach(function(drawable){
			drawable.animate(750);
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
		
		this.model.get("rows").bind("tag-changed",function(tag){
			if(tag.get("children").length < 1 && !tag.get("parent")){
				checkbox.$el.hide();
				checkbox.trigger("percent-toggle");
				return ;
			}
			checkbox.$el.show();
		});
		
		var chart_model = this.model; 
		this.bind("percent-toggle",function(){
			if(chart_model.get("percent")){
				chart_model.set("percent",false);
				return ;
			}
			chart_model.set("percent",true);
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
		
		this.BBox = {
			x:0,
			y:0,
			width:0,
			height:0
		};
		
		this.cieling = options.cieling;
		this.floor = options.floor;
		
		this.stacked = true;
		
		this.current_total=0;
		this.visible_total=0;
		
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
		this.label_total.attr("text",format_number(this.current_total));
		var total_box = this.label_total.getBBox();
		this.label_total.attr("x",this.BBox.x + this.BBox.width/2 - total_box.width/2);
		
		var xbox = this.label_title.getBBox();
		this.label_title.attr("x",this.BBox.x + this.BBox.width/2- xbox.width/2);
	},
	get_total: function(){
		var column = this;
		var selected = false;
		var total = 0;
		var current_total = 0;
		var visible_total = 0;
		
		_(_(this.points).filter(function(point_view){
			return point_view.model.get('visible');
		})).forEach(function(point_view){
			var value = point_view.model.get("value");
			if(point_view.model.get('selected')){
				selected = true;
				total += value;
			}
			visible_total += value;
			current_total += point_view.model.get("number");
		});
		this.current_total = current_total;
		this.visible_total = visible_total;
		if(selected){
			return total;
		}
		return visible_total;
	},
	is_stacked: function(){
		var selected = _(this.points).any(function(point_view){
			return point_view.model.get('selected');
		});
		this.stacked = !selected; 
		return this.stacked;
	},
	calculate: function(total, BBox){
		if(!total) total = this.get_total();
		var column = this;
		_(this.points).forEach(function(point_view){
			point_view.calculate(total,BBox.height);
		});
		if(!this.stacked){ // serial chart
			var xpos = 0 + BBox.x;
			var extra = 0;
			_(this.points).forEach(function(point_view){
				point_view.x = xpos;
				point_view.y = ( BBox.y + BBox.height ) - point_view.height;
				if(point_view.height > 0){
					var offset = point_view.width/5;
					if(column.model.get("selected")){
						offset += offset;
					}
					xpos += offset;
					extra = point_view.width - offset;
				}
			});
			this.BBox = _.clone(BBox);
			this.BBox.width = xpos+extra - BBox.x;
		}else{ // stacked chart
			var ypos = 0;
			_(this.points).forEach(function(point_view){
				point_view.x = BBox.x;
				point_view.y = ( BBox.y + BBox.height ) - ypos - point_view.height;
				if(point_view.height > 0){
					ypos += point_view.height;
					column.width = point_view.width;
				}
			});
			this.BBox = _.clone(BBox);
			this.BBox.width = this.width;
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
	calculate: function(total,height){
		if(!total) return ;
		if(this.model.get("visible")){
			var value = this.model.get("value");
			this.height = value/total * height;
			this.y = height - this.height;
			return this;
		}
		this.height = 0;
		return this;
	},
	recolor: function(desaturate,extra){
		this.color = this.original_color;
		if(desaturate){
			var amount = 0.3;
			if(extra){
				amount = 0.1;
			}
			var color = Raphael.hsb(this.color.h,this.color.s * amount,1);
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
		if(this.height == 0 && this.el.attr("height") == 0){
			return false;
		}
		if(this.height != 0 && this.el.attr("height") == 0 ){
			this.el.attr("x",this.x);
		}
		if(this.x != this.el.attr("x") && this.height != 0){
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
		}else{
			point.el.animate({
				height:point.height,
				y:point.y,
				fill:point.color
			},duration);
		}
	},
	in_position: function(){
		if(this.x != this.el.attr("x")) return false;
		if(this.y != this.el.attr("y")) return false;
		if(this.height != this.el.attr("height")) return false;
		if(this.color != this.el.attr("color")) return false;
		return true;
	}
});