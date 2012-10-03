Point = Backbone.Model.extend({
	defaults: {
		rows:[],
		columns:[],
		
		value:0,
		percent:0,
		number:0,
		total: 0,
		
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
		this.set("selected",selected);
		this.set("visible",visible);
	},
	select: function(){
		this.set("selected",true);
		this.trigger("point:selected",this);
	},
	highlight: function(){
		var point = this;
		this.trigger("point:highlight",this);
		if(this.highlight_delay){
			clearTimeout(this.highlight_delay);
		}
		this.highlight_delay = setTimeout(function(){
			point.set("highlighted",true);
		},500);
	},
	unhighlight: function(){
		this.set("highlighted",false);
		this.trigger("point:unhighlight",this);
	},
	check_highlight: function(){
		var highlightable = false;
		_(this.get("columns")).forEach(function(tag){
			if(tag.get("selected")) highlightable = true;
		});
		if(!highlightable) return false;
		highlightable = false;
		_(this.get("rows")).forEach(function(tag){
			if(tag.get("selected")) highlightable = true;
		});
		return highlightable;
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
					point.set("total",total);
					point.set("percent",point.get("number")/total);
					return ;
				}
			}
			point.set("percent",1);
			point.set("total",point.get("number"));
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
		cached_tags: [],
		rows:new TagCollection(),
		columns:new TagCollection(),
		points:new PointCollection(),
		percent:false,
		active:false,
		update: true
	},
	initialize:function(){
		var chart = this;
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
		this.get("points").bind("point:selected",function(point){
			chart.reveal(point);
		}).bind("point:highlight",function(point){
			chart.peak(point);
		}).bind("point:unhighlight",function(point){
			chart.unpeak(point);
		});
	},
	parse: function(data){
		var tags = this.get("tags");
		if(data['rows']){
			var rows = this.get("rows");
			rows.reset();
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
			columns.reset();
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
			points.reset();
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
			data['points'] = points;
		}
		
		return data;
	},
	activate: function(){
		if(this.get("active") || this.get("loading")) return this;
		if(this.get("rows").length < 1 || this.get("columns").length < 1){
			this.set("loading",true);
			this.trigger("loading");
			this.fetch({
				success:function(chart){
					chart.trigger("loaded");
					chart.set("loading",false);
					chart.activate();
				}
			});
			return this;
		}
		this.set("active",true);
		return this;
	},
	deactivate: function(){
		if(!this.get("active")) return this;
		this.get("rows").reset();
		this.get("columns").reset();
		this.set("active",false);
		return this;		
	},
	reveal: function(point){
		if(!this.get("active")) return ;
		_(_.union(point.get("rows"),point.get("columns"))).forEach(function(tag){
			tag.select();
		});
		this.set("cached_tags",[]);
		this.set("update",true);
	},
	peak: function(point){
		if(!this.get("active")) return ;
		if(this.update_delay){
			clearTimeout(this.update_delay);
		}
		var cached = this.get("cached_tags");
		var set_cache = true;
		if(cached.length > 0){
			set_cache = false;
		}
		this.set("update",false);
		if(set_cache){
			cached = [];
			var shorts = [];
			_(this.get("tags").filter(function(tag){
				return tag.get("selected");
			})).forEach(function(tag){
				cached.push(tag);
				shorts.push(tag.get("short"));
			});
			this.set("cached_tags",cached);
		}
		shorts = [];
		_(_.union(point.get("rows"),point.get("columns"))).forEach(function(tag){
			tag.select();
			shorts.push(tag.get("short"));
		});
		console.log("PEAKING TO " + shorts.join(","));
	},
	unpeak: function(point){
		if(!this.get("active")) return ;
		var cached = this.get("cached_tags");
		_(this.get("tags").filter(function(tag){
			return tag.get("selected");
		})).forEach(function(tag){
			tag.set("selected",false);
		});
		var shorts = [];
		_(cached).forEach(function(tag){
			tag.set("selected",true);
			shorts.push(tag.get("short"));
		});
		this.set("cached_tags",[]);
		var chart = this;
		this.update_delay = setTimeout(function(){
			chart.set("cached_tags",[]);
			chart.set("update",true);
		},500);
	}
});