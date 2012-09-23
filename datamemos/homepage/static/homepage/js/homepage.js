Homepage = Backbone.Model.extend({
	defaults:{
		
	},
	initialize: function(){
		this.set("charts",new Charts());
		this.bootstrap_charts();
	},
	bootstrap_charts: function(){
		var charts = this.get("charts");
		$(".charts-list .chart").each(function(){
			var chart_id = parseInt($(this).attr("chart-id"));
			var chart = new Chart({
				id:chart_id,
				tags:charts.tags
			});
			charts.add(chart);
			new ChartShortView({
				model:chart,
				el:this
			});
		});
	}
});

HomepageView = Backbone.View.extend({
	
});