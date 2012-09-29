Charts = Backbone.Collection.extend({
	model:Chart,
	url:'/charts/',
	initialize: function(options){
		var charts_collection = this;
		
		if(options && options.tags) this.tags = options.tags;
		else this.tags = new TagCollection();
		
		this.manager = new ChartManager({
			collection:charts_collection
		});
		this.manager.bind('get-chart',function(chart_id){
			charts_collection.get_chart(chart_id);
		});
		this.bind('add',function(chart){
			charts_collection.add_chart(chart);
		});
		this.bind('change:active',this.activate_chart);
	},
	add_chart: function(chart){
		chart.set("tags",this.tags);
		// tell chart to check its rows & columns
	},
	activate_chart:function(chart){
		if(chart.get("active")){
			_(this.without(chart)).forEach(function(chart){
				chart.unload();
			});
			this.manager.show_chart(chart.id);
			this.trigger("chart-changed",chart);
		}else{
			this.manager.list_chart(chart.id);
		}
	},
	deactivate: function(){
		this.forEach(function(chart){
			chart.unload();
		});
		this.trigger("chart-changed",false);
	},
	active: function(){
		var active_charts = this.filter(function(chart){
			return chart.get("active");
		});
		if(active_charts.length > 0){
			return active_charts[0];
		}
		return false;
	}
});

ChartManager = Backbone.View.extend({
	initialize:function(){
		this.container = $(".charts-list:first")[0];
	},
	show_chart: function(chart_id){
		if(!chart_id) return ;
		var chart = this.collection.get(chart_id);
		if(!chart) return;
		if(chart.get("rows").length < 1 || chart.get("columns").length < 1){
			var chart_manager = this;
			chart.fetch({
				success:function(chart){
					chart_manager.show_chart(chart.get("id"));
				}
			});
			return false;
		}
		$("#chart-container").html("");
		var active_chart = new ChartView({
			model:chart,
			container:$("#chart-container")[0]
			});
		var chart_manager = this;
		active_chart.bind("rendered",function(chart){
			var active = false;
			this.model.get("rows").forEach(function(tag){
				if(tag.get("selected")){
					active = true;
				}
			});
			if(!active){
				chart.get("rows").models[0].set("selected",true);
			}else{
				active_chart.update();
			}
		});
		active_chart.render();
	},
	list_chart: function(chart_id){
		if(!chart_id) return ;
		var chart = this.collection.get(chart_id);
		if(!chart) return;
		var list_chart = new ChartShortView({
			model:chart,
			container:this.container
		});
		list_chart.render();
	}
});

ChartShortView = Backbone.View.extend({
	events:{
		'click': 'show'
	},
	initialize:function(options){
		this.template = _.template($("#chart-short-template").html());
		this.container = options.container;
	},
	render: function(){
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
	show: function(event){
		event.preventDefault();
		this.model.set("active",true);
	}
});