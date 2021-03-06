var Workspace = Backbone.Router.extend({
	routes: {
		"":"showHome",
		"charts/:id": "openChart",
		"charts/:id/*tags": "openChart",
		"notes/:id": "openNote",
		"notes/:id/edit/": "editNote"
	},
	initialize:function(){
		return this.bind('all', this._trackPageview);
	},
	_trackPageview: function() {
		var url;
		url = Backbone.history.getFragment();
		if(!this.last_url || url != this.last_url){
			this.last_url = url;
		}else{
			return false;
		}
		return _gaq.push(['_trackPageview', "/" + url]);
	},
	openChart: function(id,tags){
		if(tags){
			var shorts = tags.split("/");
			this.trigger("openChart",id,shorts);
			return this;
		}
		this.trigger("openChart",id);
	},
	openNote: function(id){
		this.trigger("openNote",id);
	},
	editNote: function(id){
		this.trigger("openNote",id,true);
	},
	showHome: function(){
		this.trigger("showHome");
	}
});

Homepage = Backbone.Model.extend({
	defaults:{
		home: true
	},
	initialize: function(){
		var homepage = this;
		
		this.manager = new HomepageView({
			model:this,
			el:$("body")[0]
		});
		this.manager.bind('update',function(name){
			homepage.change_page(name);
		});
		
		this.manager.bind('bookmark-add',function(){
			homepage.get("notes").save_bookmark();
		});
		
		this.manager.bind('note-add',function(){
			homepage.get("notes").edit_note();
		});
				
		this.set("tags", new TagCollection());
		this.get("tags").bind('change:selected',function(tag){
			homepage.get("notes").sort_notes();
		});
		
		this.set("charts",new Charts({
			tags:this.get("tags")
		}));
		this.setup_charts();
		this.bootstrap_charts();
		
		this.set("notes",new Notes({
			tags:this.get("tags"),
			charts:this.get("charts")
		}));

		this.bootstrap_notes();
		
		this.manager.render();
		
		this.router = new Workspace();
		this.router.bind('openChart',function(id,tag_shorts){
			homepage.get("charts").forEach(function(chart){
				if(id == chart.get("id")){
					if(tag_shorts){
						_(tag_shorts).forEach(function(short){
							var tag = homepage.get("tags").get_or_add({
								short:short
							});
							tag.select();
						});
					}
					chart.activate();
				}
			});
		});
		this.router.bind('openNote',function(id,edit){
			homepage.trigger("loading");
			var note = homepage.get("notes").notes.get(id);
			if(note){
				homepage.show_note(note,edit);
			}else{
				note = new Note({
					id:id
				});
				note.fetch({
					success:function(){
						homepage.get("notes").notes.add(note);
						homepage.show_note(note,edit);
					}
				})
			}
		});
		this.router.bind("showHome",function(){
			homepage.show_home();
		});
	},
	show_note: function(note,edit){
		if(!note) return;
		
		if(edit) this.get("notes").edit_note(note);
		else this.get("notes").view_note(note);
		
		if(note.get("bookmarks").length > 0){
			var bookmark = note.get("bookmarks").first();
			var chart_id = bookmark.get("chart")['id'];
			var chart = this.get("charts").get(chart_id);
			bookmark.get("tags").forEach(function(tag){
				tag.select();
			});
			chart.activate();
			this.set_chart_url(chart,true);
			
		}
	},
	show_home: function(){
		this.get("charts").deactivate();
		this.get("tags").forEach(function(tag){
			tag.set("selected",false);
		});
		this.set("home",true);
		this.router.navigate("");
		this.trigger("page:refresh");
	},
	setup_charts: function(){
		var charts = this.get("charts");
		var manager = this;
		charts.bind("loading",function(chart){
			manager.trigger("loading");
		});
		charts.bind("loaded",function(chart){
			manager.trigger("loaded");
		});
		charts.bind("chart-changed",function(chart){
			manager.set("home",false);
			manager.get("notes").set_chart(chart);
			manager.trigger("loaded");
			manager.set_chart_url(chart);
		});
		this.get("tags").bind('change:selected',function(tag){
			manager.set_chart_url(false,true);
		});
	},
	set_chart_url:function(chart,replace){
		if(!chart && !this.get("notes").get("chart")) return;
		if(!chart){
			chart = this.get("notes").get("chart");
		}
		if(!chart.get("active")) return;
		var tag_shorts = [];
		this.get("tags").forEach(function(tag){
			if(tag.get("selected")) tag_shorts.push(tag.get("short"));
		});
		var url = 'charts/'+chart.get("id");
		if(tag_shorts.length > 0){
			url += '/'+tag_shorts.join("/");
		}
		this.router.navigate(url,{replace:replace});
	},
	bootstrap_charts: function(){
		var charts = this.get("charts");
		$(".charts-list .chart").each(function(){
			var chart_id = parseInt($(this).attr("chart-id"));
			var chart = new Chart({
				id:chart_id
			});
			charts.add(chart);
			new ChartShortView({
				model:chart,
				el:this
			});
		});
	},
	bootstrap_notes: function(){
		var notes_manager = this.get("notes");
		var homepage = this;
		
		$('#note-types-list .collapse').collapse({
			toggle: false,
			parent: "#note-types-list"
		});
		
		notes_manager.bind('change:note',function(){
			homepage.trigger("page:refresh");
		});
		
		$("#note-types-list .note-type").each(function(){
			var note_type_node = $(this);
			var note_type = new NoteType({
				short:note_type_node.attr("note-type"),
				name:note_type_node.html(),
				active:note_type_node.hasClass("active")
			});
			if(note_type_node.attr("note-type-public")){
				note_type.set("public",true);
			}
			new NoteTypeView({
				model:note_type,
				el:this
			});
			notes_manager.types.add(note_type);
			
			if(note_type_node.hasClass('active')) $(".collapse",note_type_node).collapse('show');
			else $(".collapse",note_type_node).collapse('hide');
		});
		
		if(!notes_manager.types.any(function(note_type){ return note_type.get("active"); })){
			if(notes_manager.types.length > 0)	notes_manager.types.first().toggle();
		}
	}
});

HomepageView = Backbone.View.extend({
	initialize: function(){
		var view = this;
		this.model.bind('change:home',function(){
			view.render();
		});
		this.model.bind('page:refresh',function(){
			view.render();
		});
		this.model.bind("loading",function(){
			view.show_loading();
		});
		this.model.bind("loaded",function(){
			view.hide_loading();
		});
	},
	events: {
		'click .navbar .pages .home a': 'show_home',
		'click .navbar .pages.home-nav a':'show_section',
		'click .navbar .bookmark-add': 'add_bookmark',
		'click .navbar .note-add': 'add_note'
	},
	show_loading: function(){
		this.$('.page-loading').show();
	},
	hide_loading: function(){
		this.$('.page-loading').hide();
	},
	add_bookmark: function(event){
		event.preventDefault();
		this.trigger("bookmark-add");		
	},
	add_note: function(event){
		event.preventDefault();
		this.trigger("note-add");
	},
	show_home: function(event){
		event.preventDefault();
		$(window).scrollTop(0);
		this.model.show_home();
	},
	show_section: function(event){
		event.preventDefault();
		var selector = $(event.currentTarget).attr("href");
		var y_pos = 0;
		$(selector).each(function(){
			y_pos = $(this).offset().top;
		});
		$('html,body').animate({
			scrollTop:y_pos
		},{
			duration:500
		});
	},
	render: function(){
		this.$(".navbar .pages .active").removeClass("active");
		if(this.model.get("home")){
			this.$('#note-types-list').hide();
			this.$('#charts-container').show().removeClass("main");
			this.$('#home').show().addClass("main");
			
			this.$("#"+this.model.get("page")).show();
			this.$(".navbar .pages li."+this.model.get("page")+":first").addClass("active");
			
			$("#main-nav .home-nav").show();
			$("#main-nav .chart-nav").hide();
			$("#main-nav .chart-actions").hide();
		}else{
			if(this.model.get("notes") && this.model.get("notes").get("note")){
				this.$('#note-types-list').hide();
				this.$("#note-view-container").show();
			}else{
				this.$('#note-types-list').show();
				this.$("#note-view-container").hide();
			}
			this.$('#charts-container').show().addClass("main");
			this.$('#home').hide();
			
			$("#main-nav .home-nav").hide();
			$("#main-nav .chart-nav").show();
			$("#main-nav .chart-actions").show();
		}
		$(".sticky").trigger("sticky:reset");
	}
	
});