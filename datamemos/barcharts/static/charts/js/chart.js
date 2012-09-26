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
		
		var rows = new TagCollection();
		var tags = chart.get("tags");
		_(this.get("rows")).forEach(function(data){
			var tag = tags.get_or_add(data);
			rows.add(tag);
		});
		rows.connect_tags();
		this.set("rows",rows);
		
		var columns = new TagCollection();
		_(this.get("columns")).forEach(function(data){
			var tag = tags.get_or_add(data);
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
				number:point['value'],
				rows:_.filter(rows.models, add_tag),
				columns:_.filter(columns.models, add_tag)
			});
		});
		points.set_percents();
		var chart = this;
		points.forEach(function(point){
			point.select_value(chart.get("percent"));
		});
		this.bind("change:percent",function(chart){
			points.forEach(function(point){
				point.select_value(chart.get("percent"));
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
		percent:0,
		number:0,
		
		visible: false,
		selected: false,
		highlighted: false
	},
	initialize: function(){
		
	},
	select_value: function(percent){
		if(percent){
			this.set("value",this.get("percent"));
			return this.get("percent");
		}
		this.set("value",this.get("number"));
		return this.get("number");
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
	set_percents: function(){
		var points = this;
		this.forEach(function(point){
			if(point.get("rows")[0].get("parent")){
				var neighbors = _(_(points.without(point)).filter(function(p){
					return p.get("columns")[0] == point.get("columns")[0];
				})).filter(function(p){
					return p.get("rows")[0].get("parent") == point.get("rows")[0].get("parent");
				});
				if(neighbors.length > 0){
					var total = point.get("value");
					_(neighbors).forEach(function(p){
						total += p.get("value");
					});
					point.set("percent",point.get("value")/total);
					return ;
				}
			}
			point.set("percent",1);
		});
	}
});