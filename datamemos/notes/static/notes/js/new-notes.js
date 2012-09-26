Notes = Backbone.Model.extend({
	defaults: {
		chart: false
	},
	initialize: function(options){
		
		if(options && options.tags) this.tags = options.tags;
		else this.tags = new TagCollection();
		
		if(options && options.charts) this.charts = options.charts;
		
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
			var bookmark_list = new BookmarkList();
			bookmark_list.bind("add",function(bookmark){
				var new_tags = [];
				_(bookmark.get("tags")).forEach(function(tag){
					new_tags.push(notes_manager.tags.get_or_add(tag));
				});
				bookmark.set("tags",new_tags);
				bookmark.set("chart",notes_manager.charts.find(function(chart){
					if(chart.get("id") == bookmark.get("chart")['id']){
						return true;
					}
					return false;
				}));
			});
			
			_(note.get("bookmarks")).forEach(function(bookmark){
				bookmark_list.add(bookmark);
			});
			note.set("bookmarks",bookmark_list);
		});
		
		this.tags.bind("change:selected",function(){
			notes_manager.notes.sort({silent:true});
		});
	},
	set_chart: function(chart){
		this.set("chart",chart);
	},
	edit_note: function(note){
		if(!this.get("chart") && !note) return ;
		if(!note){
			var bookmark = new Bookmark({
				chart:this.get("chart")
			});
			this.get("tags").forEach(function(tag){
				if(tag.get("selected")){
					bookmark.get("tags").add(tag);
				}
			})
			bookmark.save();
			note = new Note();
			note.get("bookmarks").add(bookmark);
		}
		var edit_view = new NoteEdit({
			model: note
		});
	},
	save_bookmark: function(){
		if(!this.get("chart")) return ;
		var bookmark = new Bookmark({
			chart:this.get("chart")
		});
		this.get("tags").forEach(function(tag){
			if(tag.get("selected")){
				bookmark.get("tags").add(tag);
			}
		});
		bookmark.save();
		
	}
});

NoteEdit = Backbone.View.extend({
	events:{
		'click .modal-footer .btn-primary':'submit',
		'submit form':'submit',
		'hidden': 'remove_modal'
	},
	initialize: function(options){
		var edit_view = this;
		this.template = _.template($("#note-edit-template").html());
		
		this.bind('remove',function(){
			this.$el.remove();
		});
		
		var url = '/notes/create/';
		if(this.model.get("id")){
			url = '/notes/'+this.model.get("id")+'/edit/';
		}
		$.ajax({
			url:url,
			type:"GET",
			data_type:"JSON",
			data:{
				json:true
			},
			success: function(data){
				if(data['form']){
					edit_view.show_form(data['form']);
				}
			}
		});
	},
	remove_modal: function(){
		this.$el.remove();
	},
	submit: function(event){
		event.preventDefault();
		var edit_view = this;
		var form = this.$('form');
		
		if(this.$('form input[name="bookmarks"]').length < 1){
			this.$('form').append('<input name="bookmarks" type="hidden" value="" />');
		}
		this.$('form input[name="bookmarks"]').val(this.model.get("bookmarks").map(function(bookmark){
			return bookmark.get("id");
		}).join(","));
		
		this.$el.modal("hide");
		this.trigger("loading");
		$.ajax({
			url:form.attr("action"),
			type:form.attr("method"),
			data:form.serialize(),
			success: function(data){
				if(data['form']){
					edit_view.show_form(data['form']);
				}
				if(data['note'] && !edit_view.model){
					var note = edit_view.model;
					note.fetch();
					note.trigger('note-share',note);
				}
			}
		});
	},
	show_form: function(markup){
		this.setElement(this.template({
			form: markup
		}));
		this.$('.form-actions').hide();
		this.$('.modal-footer .btn-primary').html(this.$('.form-actions .btn').val());
		this.$el.modal();
	}
});

Note = Backbone.Model.extend({
	defaults:{
		editable: false,
		id:false,
		text:"",
		author:"",
		pub_date:"",
		bookmarks:[]
	},
	initialize: function(){
		this.set("bookmarks",new BookmarkList());
	},
	get_activeness: function(){
		return this.get("bookmarks").max(function(bookmark){
			return bookmark.get_activeness();
		});
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
	},
	comparator:function(a,b){
		if(a.get_activeness() > b.get_activeness()){
			return -1;
		}
		return 1;
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