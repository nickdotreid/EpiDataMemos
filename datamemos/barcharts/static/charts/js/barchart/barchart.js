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
		var set_tag = function(tag){
			return new Tag({
				short: tag['short'],
				name: tag['name'],
				parent: tag['parent'],
				children: tag['children'],
				sibilings: tag['sibilings']
			});
		}
		this.rows = _(data['rows']).map(set_tag);
		var rows = this.rows;
		_(rows).forEach(function(tag){
			tag.set_property('children',rows);
			tag.set_property('sibilings',rows);
			var parent = false;
			_(rows).forEach(function(row){
				if(tag.parent == row.get("short")){
					parent = tag;
				}
			});
			tag.set("parent",parent);
		});
		this.columns = _(data['columns']).map(set_tag);
		
		this.points = _(data['points']).map(function(point){
			return new Point({
				value:point['value'],
				tags:point['tags']
			});
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
		_(_(this.model.rows).filter(function(tag){
			return !tag.parent;
		})).forEach(function(tag){
			tag.set_color(pallet);
		});
		
		// render control field sets for columns & rows
		$('<fieldset class="control-rows"><div class="btn-group row tags-row tags"></div></fieldset>').appendTo(".controls",this.$el);		
		var control_rows = $(".control-rows:first",this.$el);
		var tags_row = $(".tags-row:first",control_rows);
		_(_(this.model.rows).filter(function(tag){
			return tag.get('children').length > 0;
		})).forEach(function(row){
			btn = new TagButton({
				model:row,
				fieldset:control_rows,
				container:tags_row
			});
			btn.render();
			// if children add views (maybe when initializing??)
		});
		
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
	},
	view: function(){
		
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

Tag = Backbone.Model.extend({
	defaults:{
		children:[],
		siblings:[],
		parent:false,
		short:"",
		name:""
	},
	set_property: function(property,items){
		var items = items;
		var _children = [];
		_(this.get(property)).forEach(function(str){
			_(items).forEach(function(tag){
				if(str == tag.get("short")){
					_children.push(tag);
				}
			});
		});
		this.set(property,_children);
		return this;
	},
	set_color: function(pallet){
		var pallet = pallet;
		var children = this.get("children");
		if(children.length > 0 || !this.parent){
			pallet(false);
		}
		_(children).forEach(function(tag){
			tag.set_color(pallet);
		});
		this.set("color",pallet(this.get("short")));
	}
});

TagButton = Backbone.View.extend({
	events:{
		'click .btn':'selected'
	},
	initialize:function(options){
		this.template = _.template($("#tag-button-template").html());
		this.container = options.container;
		this.fieldset = options.fieldset;
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()))
		this.$el.appendTo(this.container);
		if(this.model.get('children').length > 0){
			this.child_row = $('<div class="btn-group tags tags-row row child-row"></div>').appendTo(this.fieldset);
			var row = this.child_row;
			var fieldset = this.fieldset;
			_(this.model.get('children')).forEach(function(tag){
				var btn = new TagButton({
					model:tag,
					container:row,
					fieldset:fieldset
				});
				btn.render();
			});
		}
		return this;
	},
	selected:function(){
		$(".btn.active",this.fieldset).removeClass("active");
		$(".child-row",this.fieldset).hide();
		
		$('.btn',this.$el).addClass("active");
		this.container.show();
		if(this.child_row){
			this.child_row.show();
		}
		
		this.model.trigger("selected");
	}
});