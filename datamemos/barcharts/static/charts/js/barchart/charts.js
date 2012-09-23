Charts = Backbone.Collection.extend({
	url:'/charts/',
	initialize: function(options){
		var charts_collection = this;
		
		if(options && options.tags){
			this.tags = options.tags;
		}else{
			this.tags = new TagCollection();
		}
		
		this.manager = new ChartManager({
			collection:charts_collection
		});
		this.manager.bind('get-chart',function(chart_id){
			charts_collection.get_chart(chart_id);
		});
	},
	get_chart: function(chart_id){
		
	}
});

ChartManager = Backbone.View.extend({
	initialize: function(options){
		this.charts = [];
		this.active_chart = false;
	},
	show_chart: function(chart_id){
		if(!chart_id) return ;
		if(this.active_chart){
			// remove this chart? collapse this chart?
		}
		var chart = this.collection.get(chart_id);
		if(!chart){
			this.trigger("get-chart",chart_id);
			return false;
		}
		if(chart.get("rows").length < 1 || chart.get("columns").length < 1){
			var chart_manager = this;
			chart.fetch({
				success:function(chart){
					chart.parse_self();
					chart_manager.show_chart(chart.get("id"));
				}
			});
			return false;
		}
		var container = $(".charts-list:first")[0];
		this.active_chart = new ChartView({
			model:chart,
			container:container
			});
		var chart_manager = this;
		this.active_chart.bind("rendered",function(chart){
			var active = false;
			this.model.get("rows").forEach(function(tag){
				if(tag.get("selected")){
					active = true;
				}
			});
			if(!active){
				chart.get("rows").models[0].set("selected",true);
			}
		});
		this.active_chart.render();
		this.charts.push(this.active_chart);
		return this.active_chart;
	}
});