ScaleColumn = Backbone.View.extend({
	initialize: function(options){
		this.paper = options.paper;
		this.ticks = [];
		
		this.columns = [];
		
		this.percent = false;
		this.max = 0;
		
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
		this.BBox = {
			x:0,
			y:0,
			width:0,
			height:0
		};
	},
	calculate: function(max,BBox){
		this.max = max;
		
		this.BBox = _.clone(BBox);
		
		var visible_ticks  = [];
		var scale = this;
		
		_(make_ticks(0,max,5)).forEach(function(tick_value){
			tick_value = round_to_significant_number(tick_value);
			var existing_tick = _(scale.ticks).find(function(tick){
				if(tick_value == tick.value) return true;
				return false;
			});
			if(existing_tick){
				visible_ticks.push(existing_tick);
			}else{
				var tick = new Tick({
					paper: scale.paper,
					value: tick_value,
					percent: scale.percent
				});
				scale.ticks.push(tick);
				visible_ticks.push(tick);
			}
		});
		var width = 0;
		_(visible_ticks).forEach(function(tick){
			if(tick.value == 0){
				tick.percent = scale.percent;
			}
			tick.visible = true;
			tick.calculate(max,BBox.height);
			if(tick.width > width) width = tick.width;
		});
		this.width = width;
		this.BBox.width = width;
		_(this.ticks).forEach(function(tick){
			if(_(visible_ticks).indexOf(tick) == -1){ 
				tick.visible = false;
			}
			tick.calculate(max,scale.BBox.height,scale.BBox.width);
			tick.x += scale.BBox.x;
		});
	},
	animate: function(duration){
		_(this.ticks).forEach(function(tick){
			tick.animate(duration);
		});
	},
	remove: function(){
		_(this.ticks).forEach(function(tick){
			tick.remove();
		});
	},
	draw_grid: function(){
		// draw grid around columns
		// draw container lines (left & right)
		// draw line for each tick (have tick draw own line?)
	}
});

Tick = Backbone.View.extend({
	initialize: function(options){
		this.paper = options.paper;
		this.value = options.value;
		this.percent = options.percent;
		this.visible = false;
		this.updated = false;
		
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
		
		this.el = this.paper.text(this.x,this.y,this.value);
		this.el.attr("text-anchor","start");
		this.el.attr({ "font-size": 10, "font-family": "Arial, Helvetica, sans-serif" });
	},
	calculate: function(max,height,width){
		this.el.attr("text",format_number(this.value,this.percent));
		
		this.width = this.el.getBBox().width;
		this.y = height - ( ( this.value/max ) * height ) + this.el.getBBox().height;
		if(width){
			this.x = width/2 - this.width/2;
		}
	},
	update: function(){
		this.updated = true;
		this.el.attr({
			x:this.x,
			y:this.y + this.el.getBBox().height,
			opacity:0
		});
	},
	animate: function(duration){
		this.update();
		var opacity = 1;
		if(!this.visible){
			opacity = 0;
		}
		this.el.attr("opacity",opacity);
		return;
		if(!this.updated) this.update();
		var opacity = 1;
		if(!this.visible){
			opacity = 0;
		}
		this.el.animate({
			x:this.x,
			y:this.y + this.el.getBBox().height,
			opacity: opacity
		},duration);
	},
	remove: function(){
		this.el.remove();
	}
});