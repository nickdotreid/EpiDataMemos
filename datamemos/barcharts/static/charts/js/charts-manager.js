Charts = Backbone.Collection.extend({
	model:Chart,
	url:'/charts/',
	initialize: function(options){
		var charts_collection = this;
		
		if(options && options.tags) this.tags = options.tags;
		else this.tags = new TagCollection();
		
		if(options && options.percent_tag) this.percent_tag = options.percent_tag;
		else this.percent_tag = this.tags.get_or_add({short:'percent'});
		
		this.manager = new ChartManager({
			collection:charts_collection
		});
		this.manager.bind('get-chart',function(chart_id){
			charts_collection.get_chart(chart_id);
		});
		this.bind('add',function(chart){
			charts_collection.add_chart(chart);
		});
		this.bind('change:active',function(chart){
			if(chart.get("active")){
				_(this.without(chart)).forEach(function(chart){
					chart.deactivate();
				});
				this.trigger("chart-changed",chart);
				this.manager.show_chart(chart);
			}
		});
	},
	add_chart: function(chart){
		chart.set("tags",this.tags);
		chart.set("percent_tag",this.percent_tag);
		this.percent_tag.bind("change:selected",function(tag){
			chart.set("percent",tag.get("selected"));
		});
		// tell chart to check its rows & columns
	},
	active: function(){
		var active_charts = this.filter(function(chart){
			return chart.get("active");
		});
		if(active_charts.length > 0){
			return active_charts[0];
		}
		return false;
	},
	deactivate: function(){
		var active_chart = this.active();
		if(active_chart){
			active_chart.deactivate();
			this.manager.list_chart(active_chart);
		}
		return this;
	}
});

ChartManager = Backbone.View.extend({
	initialize:function(){
		this.container = $(".charts-list:first")[0];
	},
	show_chart: function(chart){
		if(!chart) return;
		var active_chart = new ChartView({
			model:chart,
			container:$("#chart-container")[0]
			});
		var chart_manager = this;
		active_chart.render();
	},
	list_chart: function(chart){
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
		this.model.activate();
	}
});