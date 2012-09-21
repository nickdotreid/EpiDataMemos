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

Tag = Backbone.Model.extend({
	defaults:{
		children:[],
		siblings:[],
		parent:false,
		short:"",
		name:"",
		color:false,
		selected:false
	},
	connect_to: function(items){
		this.set_property('children',items);
		this.set_property('siblings',items);
		this.set_parent(items);
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
	set_parent: function(items){
		var tag = this;
		var parent = false;
		_(items).forEach(function(row){
			if(tag != row && tag.get('parent') == row.get("short")){
				parent = tag;
			}
		});
		tag.set("parent",parent);
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

TagCollection = Backbone.Collection.extend({
	model:Tag,
	initialize: function(){
		var collection = this;
		this.on('change:selected',function(tag_selected){
			if(tag_selected.get("selected")){
				collection.without([tag_selected]).forEach(function(tag){
					if(tag != tag_selected){
						tag.set("selected",false);
					}
				});				
			}
		});
	},
	connect_tags: function(){
		var items = this.models;
		this.forEach(function(tag){
			tag.connect_to(items);
		});
	}
});

TagButtonField = Backbone.View.extend({
	initialize:function(options){
		this['collection'] = options.collection;
		this.template = _.template('<fieldset class="control-rows"></fieldset>');
		this.row_template = _.template('<div class="btn-group row tags-row tags"></div>');
	},
	render:function(){
		this.el = this.template({});
		this.$el = $(this.el);
		this.$el.prepend(this.render_row(this["collection"].filter(function(tag){
			return !tag.get("parent");
		})));
		
	},
	render_row: function(tags){
		var buttonField = this;
		var tags_row = $(this.row_template({}));
		tags.forEach(function(row){
			btn = new TagButton({
				model:row,
				container:tags_row,
				row_template:buttonField.row_template,
				fieldset:buttonField.$el
			});
			btn.render();
		});
		return tags_row;
	}
})

TagButton = Backbone.View.extend({
	events:{
		'click .btn':'selected'
	},
	initialize:function(options){
		this.template = _.template($("#tag-button-template").html());
		this.container = options.container;
		this.fieldset = options.fieldset;
		this.row_template = options.row_template;
		var btn = this;
		this.model.bind("change:selected",function(){
			btn.toggle();
		});
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()))
		this.$el.appendTo(this.container);
		this.btn = $('.btn',this.$el);
		if(this.model.get('children').length > 0){
			var row = $(this.row_template({})).appendTo(this.fieldset);
			row.addClass("child-row");
			this.child_row = row;
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
		this.toggle();
		return this;
	},
	selected:function(){
		if(this.model.get('selected')){
			this.model.set("selected",false);
		}else{
			this.model.set("selected",true);
		}
	},
	toggle: function(){
		if(this.model.get("selected")){
			this.btn.addClass("active");
			this.container.show();
			if(this.child_row){
				this.child_row.show();
			}
		}else{
			this.btn.removeClass("active");
			if(this.child_row && !_(this.model.get("children")).find(function(tag){
				return tag.get("selected");
			})){
				this.child_row.hide();
			}
		}
	}
});