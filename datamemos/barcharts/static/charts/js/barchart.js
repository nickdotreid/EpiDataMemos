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
		this.model.bind("chart:changed",function(){
			chart_view.update();
			chart_view.color();
			chart_view.highlight();
		});
		
		this.model.bind("change:update",function(chart){
			chart_view.update();
		});
		this.model.bind("change:percent",function(){
			chart_view.update();
		});
		this.model.bind("change:active",function(){
			if(!chart_view.model.get("active")) chart_view.$el.remove();
		});
		
		this.model.bind("loaded",function(){
			chart_view.render();
		});
		
		this.setup();
	},
	canvas_clicked:function(){
		var tag = this.model.get("columns").find(function(tag){
			if(tag.get("selected")) return true;
			return false;
		});
		if(!tag){
			var tag = this.model.get("rows").find(function(tag){
				if(tag.get("selected")) return true;
				return false;
			});
		}
		if(tag){
			tag.select(false);
		}
	},
	setup: function(){
		this.setElement(this.template(this.model.toJSON()));
		var container = $(this.container);
		var existing_element = $("#chart-" + this.model.get("id") + ", .chart[chart-id="+this.model.get("id")+"]",container);
		if(existing_element.length > 0){
			this.$el.insertBefore(existing_element[0]);
			existing_element.remove();
		}else{
			this.$el.appendTo(container);
		}
	},
	render: function(){
		if(this.model.get("loading")){
			this.$el.addClass("loading");
			return ;
		}
		this.setup();
		
		var chart_view = this;
		
		/** APPEND FOOTNOTES **/
		var footnote_template = _.template($("#footnote-template").html());
		_(this.model.get("footnotes")).forEach(function(footnote){
			chart_view.$('.footnotes').append(footnote_template({
				id:footnote.id,
				title:footnote.title,
				description:footnote.description
			}));
		});
		
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
		this.$('.controls').append(rows_control.el);
		
		columns_control = new TagButtonField({
			collection:this.model.get("columns"),
			title: "Select a Column"
		});
		columns_control.render();
		this.$('.controls').append(columns_control.el);
		
		if(!this.model.get("lock_percent")){
			var percent_control = new PercentCheckbox({
				model: this.model
			});
			percent_control.render();
			this.$('.controls').append(percent_control.el);			
		}
		
		/** SET UP SVG **/
		var canvas = this.$(".canvas");
		var paper = Raphael(canvas[0],canvas.width(),canvas.height());
		this.paper = paper;
		
		canvas.append('<div class="top-fade"></div>');
		
		var bg_box = paper.rect(0,0,paper.width,paper.height);
		bg_box.attr("fill","#FFF");
		bg_box.attr("stroke-width",0);
		bg_box.click(function(){
			chart_view.canvas_clicked();
		});
		
		/** RENDER LABELS **/
		this.x_label = paper.text(0,0,this.model.get("x_label"));
		var xbox = this.x_label.getBBox();
		this.x_label.attr("x",paper.width/2 - xbox.width/2);
		this.x_label.attr("y",paper.height - xbox.height);
		this.x_label.attr({ "font-size": 14, "font-family": "Arial, Helvetica, sans-serif", "text-anchor":"start" });
		
		this.y_label = paper.text(0,0,this.model.get("y_label"));
		this.y_label.transform('r-90');
		var ybox = this.y_label.getBBox();
		this.y_label.attr("x",0-(paper.height/2+ybox.height/2));
		this.y_label.attr("y",ybox.width);
		this.y_label.attr({ "font-size": 14, "font-family": "Arial, Helvetica, sans-serif", "text-anchor":"start" });
		
		/** MAKE COLUMNS **/
		var chart_view = this;
		this.columns = [];
		this.points = [];
		var _points = this.points;
		this.model.get("columns").forEach(function(tag){
			var column = new ColumnView({
				model:tag,
				paper:paper,
				floor:paper.height - xbox.height - chart_view.padding,
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
		
		this.update();
		chart_view.color();
		chart_view.highlight();
		return this;
	},
	update: function(){
		if(!this.model.get("active")) return;
		if(!this.model.get("update")) return;
		if(this.updateTimeout){
			clearTimeout(this.updateTimeout);
			this.updateTimeout = false;
		}
		var barchart = this;
		this.updateTimeout = setTimeout(function(){
			barchart.update_real();
		},100);
	},
	update_real: function(){
		this.updateTimeout = false;
		if(!this.model.get("update")){
			return ;
		}else{
			var shorts = [];
			this.model.get("tags").forEach(function(tag){
				if(tag.get("selected")) shorts.push(tag.get("short"));
			});
		}
		var chart_view = this;
		var chart_max = 0;
		
		if(this.columns.length < 1) return;
		
		/**		FIND ACTIVE TAG		**/
		var active_tag = this.model.get("rows").find(function(tag){
			return tag.get("selected");
		});
		if(!active_tag){
			this.model.get("rows").first().select();
			return ;
		}
		if(active_tag.get("children").length < 1 && !active_tag.get("parent")){
			if(this.model.get("percent")){
				this.model.set("percent",false);				
			}
		}else{
			if(this.model.get("lock_percent") && !this.model.get("percent")){
				this.model.set("percent",true);
			}
		}
		
		this.model.get("points").forEach(function(point){
			point.toggle();
			point.select_value(chart_view.model.get("percent"));
		});
		
		_(this.scales).forEach(function(scale){
			scale.columns = [];
		});		
		var scales = this.scales;
		var new_scales = [];
		var scale = new ScaleColumn({
			paper: this.paper
		});
		this.scales.push(scale);
		
		var draw_items = [];
		
		new_scales.push(scale);
		draw_items.push(scale);
		scale.percent = chart_view.model.get("percent");
		
		_(this.columns).forEach(function(column){
			var total = round_to_significant_number(column.get_total(), 0.05);
			if(!chart_view.model.get("percent") && total < chart_view.model.get('threshold')*3) total = chart_view.model.get("threshold")*3;
			if(total != 0){
				if(scale.max < total || (scale.columns.length < 1 && !in_range_of(scale.max,total))){
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
		_(this.columns).forEach(function(column){
			column.set_order(tag_order);
		});
		
		var xpos = 0;
		xpos += this.y_label.getBBox().width + this.padding;
		
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
		
		chart_view.color();
		chart_view.highlight();
	},
	highlight: function(){
		var chart_view = this;
		this.$('.highlight-container .highlight').remove();
		var highlight = false;
		this.model.get("points").forEach(function(point){
			point.select_value(chart_view.model.get("percent"));
			point.toggle();
			if(point.check_highlight()){
				var point_view = _(chart_view.points).find(function(point_view){
					if( point_view.model == point) return true;
					return false;
				});
				if( point_view ){
					highlight = new Highlight({
						model:point,
						view: point_view,
						container: chart_view.$('.canvas'),
						units: chart_view.model.get("units"),
						threshold: chart_view.model.get("threshold")
					});
					
					chart_view.model.get("rows").bind("change:selected",function(){
						highlight.remove();
					});
					chart_view.model.get("columns").bind("change:selected",function(){
						highlight.remove();
					});
				}
			}
		});
		if(!highlight){
			this.$('.canvas .hightlight').remove();
		}
	},
	color: function(){
		var stacked = false;
		_(this.columns).forEach(function(col){
			stacked = col.is_stacked();
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
			point_view.animate_color(250);
		});
	}
});

Highlight = Backbone.View.extend({
	events:{
		
	},
	initialize: function(options){
		this.template = _.template($("#highlight-template").html());
		
		if( options && options.container ){
			this.container = options.container;
		}
		
		if( options && options.view ){
			this.view = options.view;
		}
		
		this.units = "People";
		if(options && options.units){
			this.units = options.units;
		}
		
		this.threshold = 0;
		if(options && options.threshold){
			this.threshold = options.threshold;
		}
		
		var highlight = this;
		this.model.bind('point:unhighlight',function(){
			highlight.remove();
		});
		
		this.render();
	},
	remove: function(){
		this.$el.remove();
	},
	render: function(){
		var under_threshold = false;
		if(this.threshold >= this.model.get("number")){
			under_threshold = true;
		}
		this.setElement(this.template({
			row: this.model.get("rows")[0].get("name"),
			column: this.model.get("columns")[0].get("name"),
			number: format_number(this.model.get("number")),
			total: format_number(this.model.get("total")),
			percent: format_number(this.model.get("percent"),true),
			units: this.units,
			threshold: this.threshold,
			under_threshold: under_threshold
		}));
		$('.highlight',this.container).remove();
		this.$el.appendTo(this.container);
		var xpos = 0;
		var ypos = 0;
		
		if(this.view.x > this.$el.width() + 14){
			xpos = this.view.x - this.$el.width() - 7;
		}else{
			xpos = this.view.x + this.view.width + 7; 
		}
		
		if(this.view.y > this.$el.height() + 14){
			ypos = this.view.y - this.$el.height() - 7;
		}else{
			ypos = 7;
		}
		
		this.$el.css({
			top: ypos + 'px',
			left: xpos + 'px'
		})
	}
})

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
		
		this.model.get("rows").bind("change:selected",function(tag){
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
		this.label_total.attr({ "font-size": 14, "font-family": "Arial, Helvetica, sans-serif", "text-anchor":"start" });
		
		this.label_title.attr("y",this.floor - this.label_total.getBBox().height - this.label_title.getBBox().height);
		this.label_title.attr({ "font-size": 16, "font-family": "Arial, Helvetica, sans-serif", "text-anchor":"start" });
		
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
				if(point_view.height < 1){
					point_view.y = BBox.y + BBox.height;
				}else{
					point_view.y = ( BBox.y + BBox.height ) - ypos - point_view.height;
				}
				if(point_view.height > 0){
					ypos += point_view.height;
					column.width = point_view.width;
				}
			});
			this.BBox = _.clone(BBox);
			this.BBox.width = this.width;
		}
		if(this.BBox.width < this.label_title.getBBox().width){
			var diff = (this.label_title.getBBox().width - this.BBox.width)/2;
			_(this.points).forEach(function(point_view){
				point_view.x += diff;
			});
			this.BBox.width = this.label_title.getBBox().width;
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
		
		var point = this.model;
		el.click(function(){
			point.select();
		});
		el.mouseover(function(){
			point.highlight();
		});
		el.mouseout(function(){
			point.unhighlight();
		});
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
	round_attrs: function(){
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.height = Math.ceil(this.height);
	},
	update: function(){
		this.round_attrs();
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
		this.round_attrs();
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
				y:point.y
			},duration);
		}
	},
	animate_color: function(duration){
		this.el.animate({
			fill:this.color
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