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
		_(tags).forEach(function(row){
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
		'click':'selected'
	},
	initialize:function(options){
		this.template = _.template($("#tag-button-template").html());
		this.el = this.template(this.model.toJSON());
		this.$el = $(this.el);
		
		this.container = options.container;
		this.fieldset = options.fieldset;
		this.row_template = options.row_template;
		
		var btn = this;
		this.model.bind("change:selected",function(){
			btn.toggle();
		});
	},
	render:function(){
		this.$el.appendTo(this.container);
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
			this.$el.addClass("active");
			this.container.show();
			if(this.child_row){
				$('.child-row',this.fieldset).hide();
				this.child_row.show();
			}
		}else{
			this.$el.removeClass("active");
			if(this.child_row && !_(this.model.get("children")).find(function(tag){
				return tag.get("selected");
			})){
				this.child_row.hide();
			}
		}
	}
});