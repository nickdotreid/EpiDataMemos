ScaleColumn = Backbone.View.extend({
	initialize: function(options){
		this.paper = options.paper;
		this.ticks = [];
		
		this.columns = [];
		
		this.max = 0;
		
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
	},
	calculate: function(max,height){
		this.max = max;
		
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
			}
		});
		var width = 0;
		_(visible_ticks).forEach(function(tick){
			tick.visible = true;
			tick.calculate(max,height);
			if(tick.width > width) width = tick.width;
		});
		this.width = width;
		_(this.ticks).forEach(function(tick){
			tick.calculate(max,height,width);
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
		this.visible = false;
		this.updated = false;
		
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
		
		this.el = paper.text(this.x,this.y,this.value);
		
		var string_value = "";
		if(this.value <= 1){
			string_value = format_number(this.value,true);
		}else{
			string_value = format_number(this.value);
		}
		this.el.attr("text",string_value);
	},
	calculate: function(max,height,width){
		this.y = ( this.value/max ) * height;
		if(width){
			this.x = width/2 - this.el.getBBox().width/2;
		}
	},
	update: function(){
		this.el.attr({
			x:this.x,
			y:this.y,
			opacity:0
		});
	},
	animate: function(duration){
		var opacity = 1;
		if(!this.visible){
			opacity = 0;
		}
		this.el.animate({
			x:this.x,
			y:this.y,
			opacity: opactiy
		},duration);
	},
	remove: function(){
		
	}
});