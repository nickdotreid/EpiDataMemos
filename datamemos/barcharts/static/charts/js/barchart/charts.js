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
		this.bind('add',this.add_chart);
		this.bind('change:active',this.activate_chart);
	},
	add_chart: function(chart){
		
	},
	activate_chart:function(chart){
		if(chart.get("active")){
			this.manager.show_chart(chart.id);
			this.without(chart).forEach(function(chart){
				chart.set("active",false);
			})
		}else{
			this.manager.list_chart(chart.id);
		}
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
		var active_chart = new ChartView({
			model:chart,
			container:this.container
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