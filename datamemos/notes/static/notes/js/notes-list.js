Notes = Backbone.Model.extend({
	defaults: {
		chart: false,
		update: true,
		cached_tags: []
	},
	initialize: function(options){
		
		if(options && options.tags) this.tags = options.tags;
		else this.tags = new TagCollection();
		
		if(options && options.charts) this.charts = options.charts;
		
		this.notes = new NoteList();
		this.types = new NoteTypeList();
		
		
		var notes_manager = this;
		
		this.bind("change:chart",function(){
			notes_manager.notes.chart = notes_manager.get("chart");
			notes_manager.notes.fetch();
		});
		this.bind("change:update",function(){
			notes_manager.notes.update = notes_manager.get("update");
		});
		this.types.bind("note-type-changed",function(type){
			notes_manager.notes.type = type;
			notes_manager.notes.fetch();
		});
		
		var tags = this.tags;
		this.notes.bind("add",function(note){
			note.get("bookmarks").forEach(function(bookmark){
				// go through tags and connect tags to global tags
				var new_tags = new TagCollection();
				bookmark.get("tags").forEach(function(tag){
					var new_tag = tags.get_or_add({
						short: tag.get("short")
					});
					new_tags.push(new_tag);
				});
				bookmark.set("tags",new_tags);
			});
			note.get("bookmarks").bind("change:highlight",function(bookmark){
				if(bookmark.get("highlight")){
					notes_manager.set("update",false);
					var cached = tags.filter(function(tag){
						return tag.get("selected");
					});
					notes_manager.set("cached_tags",cached);
					_(cached).forEach(function(tag){
						tag.set("selected",false);
					});
					bookmark.get("tags").forEach(function(tag){
						tag.set("selected",true);
					});
				}else{
					var cached = notes_manager.get("cached_tags");
					if(cached.length < 1) return ;
					notes_manager.set("update",true);
					
					bookmark.get("tags").forEach(function(tag){
						tag.set("selected",false);
					});
					_(cached).forEach(function(tag){
						tag.set("selected",true);
					});
					notes_manager.set("cached_tags",[]);
				}
			}).bind("bookmark:selected",function(bookmark){
				notes_manager.set("cached_tags",[]);
				tags.forEach(function(tag){
					tag.set("selected",false);
				});
				bookmark.get("tags").forEach(function(tag){
					tag.set("selected",true);
				});
			});
		});
		
		new NoteListView({
			collection: this.notes,
			el: $(".notes-list")[0]
		});
		
		this.notes.bind("share",function(note){
			notes_manager.share_note(note);
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
		var notes_manager = this;
		edit_view.bind("saved",function(note){
			note.fetch({success:function(){
				notes_manager.notes.add(note);
				note.trigger("share",note);
			}});
		});
		return edit_view;
	},
	share_note: function(note){
		var share_view = new NoteShare({
			model:note
		});
		share_view.render();
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
		bookmark.save({
			success:function(){
				var view = new BookmarkShare({
					model:bookmark
				});
				view.render();
			}
		});
	},
	sort_notes: function(){
		this.notes.sort();
	}
});

NoteContainer = Backbone.View.extend({
	events:{
		'click .note-add': 'note_new'
	},
	note_new: function(event){
		event.preventDefault();
		var button = $(event.currentTarget);
		var view = this.model.edit_note(false);
		view.container = button.parents('.note-add-container:first');
		button.hide();
		view.bind('remove',function(){
			button.show();
		});
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
	initialize: function(options){
		this.type = false;
		this.chart = false;
		this.update = true;
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
					notes_list.add(note_node,{parse:true});
				});
			}
		});
	},
	comparator:function(a,b){
		var cmp = a.get_activeness() - b.get_activeness();
		if( cmp > 0 ){
			return -1;
		}else if( cmp < 0 ){
			return 1;
		}
		// compare weight
		var cmp = a.get("date") - b.get("date");
		if( cmp > 0 ){
			return -1;
		}else if( cmp < 0 ){
			return 1;
		}
		return 0;
	}
});

NoteListView = Backbone.View.extend({
	initialize: function(options){
		if(options && options['collection']){
			this.collections = options['collection'];
		}
		
		var note_list_view = this;
		this.collection.bind("add",function(note){
			note_list_view.$('.nonotes').remove();
			var note_view = new NoteItem({
				model:note,
				container:note_list_view.el
			});
		});
		this.collection.bind("reset",function(){
			note_list_view.render();
		});
	},
	render: function(){
		if(!this.collection.update) return;
		var note_list_view = this;
		this.$('.nonotes').remove();
		this.$('.note').addClass("toRemove");
		this.collection.forEach(function(note){
			var view = note_list_view.$('#note-'+note.get("id"));
			if(view.length < 1){
				var note_view = new NoteItem({
					model:note,
					container:this.el
				});
				view = note_view.$el;
			}
			view.removeClass("toRemove");
			note_list_view.$el.append(view);
		});
		this.$(".note.toRemove").remove();
		if(this.collection.length < 1){
			this.$el.append("<div class='nonotes alert alert-warning'>No Notes</div>")
		}
	},
	clear: function(){
		this.$el.html("");
	}
});

NoteTypeButton = Backbone.View.extend({
	events: {
		"click a": "select"
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