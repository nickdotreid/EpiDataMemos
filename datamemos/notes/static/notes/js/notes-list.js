Notes = Backbone.Model.extend({
	defaults: {
		chart: false,
		note: false,
		update: true,
		cached_tags: []
	},
	initialize: function(options){
		
		if(options && options.tags) this.tags = options.tags;
		else this.tags = new TagCollection();
		
		if(options && options.charts) this.charts = options.charts;
		
		this.types = new NoteTypeList();
		
		var notes_manager = this;
		
		this.bind("change:chart",function(){
			this.types.forEach(function(type){
				type.get("notes").type = type;
				type.get("notes").chart = notes_manager.get("chart");
				type.get("notes").fetch();
			});
		});
		this.bind("change:update",function(){
			notes_manager.sort_notes();
		});
		
		var tags = this.tags;
		this.types.bind("add",function(type){
			type.get("notes").bind("add",function(note){
				note.get("bookmarks").forEach(function(bookmark){
					// go through tags and connect tags to global tags
					var new_tags = [];
					bookmark.get("tags").forEach(function(tag){
						var new_tag = tags.get_or_add({
							short: tag.get("short")
						});
						new_tags.push(new_tag);
					});
					bookmark.get("tags").reset(new_tags);
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
		});
		
		this.bind('change:note',function(){
			if(notes_manager.get("note")){
				$("#note-types-list").hide();
			}else{
				$("#note-types-list").show();
			}
		});
		
		this.bind('change:note',function(){
			if(notes_manager.get("note")) notes_manager.set("update",false);
			else notes_manager.set("update",true);
		});
		
		this.tags.bind("change:selected",function(){
			if(notes_manager.get("update")) notes_manager.sort_notes({silent:true});
		});
	},
	set_chart: function(chart){
		this.set("chart",chart);
	},
	view_note: function(note){
		if(!note || !note.get("id")) return ;
		var notes_manager = this;
		this.set("note",note);
		var note_view = new NoteItem({
			model: note,
			container: $("#note-view-container")[0],
			show_close: true
		});
		note_view.bind('remove',function(){
			$("#note-view-container").html("").hide();
			notes_manager.set("note",false);
		});
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
			note = new Note({
				type:this.types.find(function(type){ return type.get("active"); }).get("short")
			});
			note.get("bookmarks").add(bookmark);
		}else if(!note.get("editable")){
			this.view_note(note);
			alert("You don't have permission to edit this message.");
			return ;
		}
		this.set("note",note);
		var edit_view = new NoteEdit({
			model: note,
			container: $("#note-view-container")[0]
		});
		var notes_manager = this;
		edit_view.bind("saved",function(note){
			note.fetch({success:function(){
				notes_manager.notes.add(note);
				notes_manager.view_note(note);
			}});
		});
		edit_view.bind("remove",function(){
			notes_manager.set("note",false);
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
	sort_notes: function(options){
		if(!this.get("update")) return;
		this.types.forEach(function(type){
			type.get("notes").sort(options);
		});
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
		this.$el.parents(".scrollable").each(function(){
			this.scrollTop = 0;
		});
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

NoteTypeView = Backbone.View.extend({
	events: {
		"click a": "select",
		"shown": "resize"
	},
	initialize:function(){
		var button = this;
		this.model.bind("change:active",function(){
			button.render();
		});
		var notesList = new NoteListView({
			collection:this.model.get("notes"),
			el: this.$('.notes-list')[0]
		});
		this.model.get("notes").bind("reset",function(){
			button.update_count();
		});
		$(window).scroll(function(event){
			if(button.model.get("active")) button.resize(event);
		});
		this.resize();
	},
	update_count: function(){
		this.$('.notes-count .count-total').html(this.model.get("notes").length);
		var active_notes = this.model.get("notes").filter(function(note){
			if(note.get("activeness") > 0) return true;
			return false;
		});
		this.$('.notes-count .count-active').html(active_notes.length);
	},
	resize:function(event){
		var accordion = this.$el.parents(".accordion:first");
		var collapse = this.$('.collapse');
		var _window = $(window);
		var offset = collapse.offset().top - _window.scrollTop();
		if(offset < 0) offset = 0;
		var new_height = _window.height() - offset;
		this.$el.nextAll('.note-type').each(function(){
			new_height -= $(this).height();
		});
		collapse.height(new_height);
		
		if(new_height < this.$('.collapse .notes-list').height()){
			collapse.height(new_height).addClass("scrollable");
		}else{
			collapse.height(this.$(".collapse .notes-list").height()).removeClass("scrollable");
		}
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