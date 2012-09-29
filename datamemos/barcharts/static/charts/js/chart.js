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
					var total = point.get("number");
					_(neighbors).forEach(function(p){
						total += p.get("number");
					});
					point.set("percent",point.get("number")/total);
					return ;
				}
			}
			point.set("percent",1);
		});
	}
});

Chart = Backbone.Model.extend({
	urlRoot:'/charts/',
	url:function(){
		return this.urlRoot + this.get("id");
	},
	defaults:{
		id:false,
		tags:new TagCollection(),
		rows:new TagCollection(),
		columns:new TagCollection(),
		points:new PointCollection(),
		percent:false,
		active:false
	},
	initialize:function(){
		var points = this.get("points");
		this.bind("change:percent",function(chart){
			points.forEach(function(point){
				point.select_value(chart.get("percent"));
			});
		});
		this.get("rows").bind("tag-changed",function(){
			points.forEach(function(point){
				point.toggle();
			})
		});
		this.get("columns").bind("tag-changed",function(){
			points.forEach(function(point){
				point.toggle();
			})
		});
	},
	parse: function(data){
		
		if(data['rows']){
			var rows = this.get("rows");
			var tags = this.get("tags");
			_(data['rows']).forEach(function(data){
				var tag = tags.get_or_add(data);
				rows.add(tag);
			});
			rows.connect_tags();
			rows.always_selected = true;
			
			data['rows'] = rows;
		}
		
		if(data['columns']){
			var columns = this.get("columns");
			_(data['columns']).forEach(function(data){
				var tag = tags.get_or_add(data);
				columns.add(tag);
				tag.set("parent",false);
			});
			columns.connect_tags();
			this.set("columns",columns);
			
			data['columns'] = columns;
		}
		
		if(data['points']){
			var points = this.get("points");
			_(data['points']).forEach(function(point){
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
			points.forEach(function(point){
				point.select_value(point.get("percent"));
			});
			data['points'] = points;
		}
		
		return data;
	},
	unload: function(){
		if(this.get("active")){
			this.get("rows").reset();
			this.get("columns").reset();
		}		
	}
});