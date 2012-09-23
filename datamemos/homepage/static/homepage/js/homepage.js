Homepage = Backbone.Model.extend({
	defaults:{
		page: 'home',
	},
	initialize: function(){
		this.manager = new HomepageView({
			model:this,
			el:$("body")[0]
		});
		var homepage = this;
		this.manager.bind('update',function(name){
			homepage.change_page(name);
		});
		
		this.set("charts",new Charts());
		this.bootstrap_charts();
		
		this.manager.render();
	},
	change_page: function(page_name){
		if(!page_name || page_name == "") return ;
		if(page_name == 'home'){
			this.get("charts").forEach(function(chart){
				chart.set("active",false);
			});
		}
		this.set("page",page_name);
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
	initialize: function(){
		var view = this;
		this.model.bind('change:page',function(){
			view.render();
		});
	},
	events: {
		'click .navbar .pages a': 'page_navigate'
	},
	page_navigate: function(event){
		event.preventDefault();
		this.trigger("update",$(event.currentTarget).attr("name")); // needs to be dynamic string
	},
	render: function(){
		this.$(".page-content").hide();
		this.$(".navbar .pages .active").removeClass("active");
		this.$("#"+this.model.get("page")).show();
		this.$(".navbar .pages li."+this.model.get("page")+":first").addClass("active");
		if(this.$(".page-content:visible").length < 1){
			this.$(".page-content:first").show();
		}
	}
	
});