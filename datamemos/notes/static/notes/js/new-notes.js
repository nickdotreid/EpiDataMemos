Notes = Backbone.Model.extend({
	defaults: {
		chart: false,
	},
	initialize: function(){
		this.tags = new TagCollection();
		this.types = new NoteTypeList();
	}
});

NoteType = Backbone.Model.extend({
	defaults:{
		active:false,
		name:"",
		short:""
	},
	toggle: function(){
		if(this.get("active")){
			this.set("active",false);
			return false;
		}
		this.set("active",true);
		return true;
	}
});

NoteTypeButton = Backbone.View.extend({
	events: {
		"click": "select"
	},
	initialize:function(){
		var button = this;
		this.model.bind("change:active",function(){
			button.render();
		});
	},
	select: function(event){
		event.preventDefault();
		this.model.toggle();
	},
	render: function(){
		if(this.model.get("active")){
			this.$el.addClass("active");
			return ;
		}
		this.$el.removeClass("active");
	}
});

NoteTypeList = Backbone.Collection.extend({
	model:NoteType,
	initialize: function(){
		this.bind("change:active",function(note_type){
			if(note_type.get("active")){
				_(this.without(note_type)).forEach(function(note_type){
					note_type.set("active",false);
				});
				this.trigger("note-type-changed",note_type);
			}
		});
	}
});