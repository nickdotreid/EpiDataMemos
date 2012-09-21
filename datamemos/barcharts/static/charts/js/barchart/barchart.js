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
			success:function(data){
				chart.load(data);
				chart.lock = false;
			}
		});
	},
	load: function(data){
		this.set(data);
		// parse rows
		// parse columns
		// parse points
		this.trigger("loaded");
	}
});


ChartView = Backbone.View.extend({
	initialize: function(){
		this.template = _.template($("#barchart-template").html());
		var view = this;
		this.model.bind("loaded",function(){
			view.render();
		});
	},
	render: function(){
		if(this.paper){
			return this.update();
		}
		this.el = $(this.template(this.model.toJSON())).appendTo("#barchart-container")[0];
		var canvas = $(".canvas",$(this.el));
		this.paper = Raphael(canvas[0],canvas.width(),canvas.height());
		return this;
	},
	update: function(){
		
		return this;
	}
});