Notes = Backbone.Model.extend({
	defaults: {
		chart: false
	},
	initialize: function(){
		this.tags = new TagCollection();
		this.notes = new NoteList();
		this.types = new NoteTypeList();
		
		var notes_manager = this;
		
		this.bind("change:chart",function(){
			notes_manager.notes.chart = chart;
			notes_manager.notes.fetch();
		});
		this.types.bind("note-type-changed",function(type){
			notes_manager.notes.type = type;
			notes_manager.notes.fetch();
		});
		
		this.notes.bind("add",function(note){
			if(note.get("type") && typeof(note.get("type")) == "string"){
				notes_manager.types.forEach(function(type){
					if(type.get("short") == note.get("type")){
						note.set("type",type);
					}
				});
			}
		});
	}
});

Note = Backbone.Model.extend({
	defaults:{
		editable: false,
	},
	initialize: function(){
	}
});

NoteItem = Backbone.View.extend({
	events:{
		
	},
	initialize: function(){
		
	},
	render: function(){
		
	}
});

NoteList = Backbone.Collection.extend({
	model:Note,
	urlRoot:'/notes/',
	url: function(){
		var vars = "";
		if( this.chart ) vars += "chart_id="+this.chart.id;
		if( this.type ) vars += "type="+this.type.get("short");
		return this.urlRoot + '?' + vars;
	},
	initialize: function(){
		this.type = false;
		this.chart = false;
	},
	fetch:function(options){
		var notes_list = this;
		this.reset();
		$.ajax({
			url:this.url(),
			data_type:"JSON",
			data:{
				json:true
			},
			success:function(data){
				_(data['notes']).forEach(function(note_node){
					notes_list.add(note_node);
				});
			}
		});
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