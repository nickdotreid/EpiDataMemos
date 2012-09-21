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
			var tags = _.filter(_.union(columns.models,rows.models), function(tag){
				if(_.indexOf(point['tags'],tag.get("short")) > -1){
					return true;
				}
				return false;
			});
			points.add({
				value:point['value'],
				tags:tags
			});
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


ChartView = Backbone.View.extend({
	initialize: function(){
		this.template = _.template($("#barchart-template").html());
		this.pallet = make_color_pallet();
		var view = this;
		this.model.bind("loaded",function(){
			view.render();
		});
	},
	render: function(){
		this.el = $(this.template(this.model.toJSON())).appendTo("#barchart-container")[0];
		this.$el = $(this.el);
		
		var pallet = this.pallet;
		this.model.get("rows").filter(function(tag){
			return !tag.get("parent");
		}).forEach(function(tag){
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
		_(this.model.get('points').models).forEach(function(point){
			var point_view = new PointView({
				model:point,
				paper:paper
			});
			point_view.render();
		});
		this.paper = paper;
		return this;
	}
});

Point = Backbone.Model.extend({
	defaults: {
		tags:[],
		value:0,
		status: false
	},
	toggle: function(){
		var status = false;
		_(this.get("tags")).forEach(function(tag){
			if(tag.get("selected")){
				status = true;
			}
		});
		if(this.get("status") != status){
			this.set("status",status);
		}
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

PointView = Backbone.View.extend({
	initialize:function(options){
		var point_view = this;
		this.paper = options.paper;
		this.model.bind("change:status",function(){
			point_view.calculate();
		});
	},
	calculate: function(){
		alert("calculate");
		// figures out new height
	},
	render: function(){
		var paper = this.paper;
		var el = paper.rect(0,0,50,50);
		el.attr("stroke-width",0);
		_(this.model.get("tags")).forEach(function(tag){
			el.attr("fill",tag.get("color"));
		});
		this.el = el;
	},
	highlight: function(){
		
	}
});