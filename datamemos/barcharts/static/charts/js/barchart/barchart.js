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
		
		var points = _(data['points']).map(function(point){
			return new Point({
				value:point['value'],
				tags:point['tags']
			});
		});
		this.set("points",points);
		
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
		this.paper = Raphael(canvas[0],canvas.width(),canvas.height());
		var paper = this.paper;
		_(this.model.points).forEach(function(point){
			point_view = new PointView({
				model:point,
				paper:paper
			});
			point_view.render();
		});
		return this;
	}
});

Point = Backbone.Model.extend({
	defaults: {
		tags:[],
		value:0
	}
});

PointView = Backbone.View.extend({
	initialize:function(options){
		this.paper = options.paper;
		this.el = this.paper.rect(0,0,50,50);
		this.el.attr("stroke-width",0);
		_(this.model.tags).forEach(function(tag){
			if(tag.color){
				this.el.attr("fill",tag.color);
			}
		});
	},
	render: function(){

	},
	highlight: function(){
		
	}
});