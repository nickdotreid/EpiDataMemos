Notes = Backbone.Model.extend({
	defaults: {
		chart: false
	},
	initialize: function(options){
		
		if(options && options.tags) this.tags = options.tags;
		else this.tags = new TagCollection();
		
		this.notes = new NoteList();
		this.types = new NoteTypeList();
		
		new NoteListView({
			collection: this.notes,
			el: $(".notes-list")[0]
		});
		
		var notes_manager = this;
		
		this.bind("change:chart",function(){
			notes_manager.notes.chart = notes_manager.get("chart");
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
	},
	set_chart: function(chart){
		this.set("chart",chart);
	}
});

Note = Backbone.Model.extend({
	defaults:{
		editable: false,
		id:1,
		text:"",
		author:"",
		pub_date:""
	},
	initialize: function(){
	}
});

NoteItem = Backbone.View.extend({
	events:{
		
	},
	initialize: function(options){
		this.template = _.template($("#note-template").html());
		this.container = options.container;
		this.$container = $(this.container);
		this.render();
	},
	render: function(){
		var note_id = this.model.get("id");
		if($("#note-"+note_id,this.$container).length > 0){
			this.setElement($("note-"+note_id,this.$container)[0]);
		}else{
			var new_el = this.template(this.model.toJSON());
			this.setElement(new_el);
			this.$el.appendTo(this.$container);
		}
	}
});

NoteList = Backbone.Collection.extend({
	model:Note,
	urlRoot:'/notes/',
	url: function(){
		var vars = [];
		if( this.chart ) vars.push("chart_id="+this.chart.id);
		else vars.push("limit=10");
		if( this.type ) vars.push("type="+this.type.get("short"));
		return this.urlRoot + '?' + vars.join("&");
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

NoteListView = Backbone.View.extend({
	initialize: function(){
		var note_list_view = this;
		this.collection.bind("add",function(note){
			var note_view = new NoteItem({
				model:note,
				container:note_list_view.el
			});
		});
		this.collection.bind("reset",function(){
			note_list_view.$el.html("");
		});
	},
	render: function(){
		
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
	initialize: function(options){
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