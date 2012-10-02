var Workspace = Backbone.Router.extend({
	routes: {
		"":"showHome",
		"charts/:id": "openChart",
		"charts/:id/*tags": "openChart"
	},
	openChart: function(id,tags){
		if(tags){
			var shorts = tags.split("/");
			this.trigger("openChart",id,shorts);
			return this;
		}
		this.trigger("openChart",id);
	},
	showHome: function(){
		this.trigger("showHome");
	}
});

Homepage = Backbone.Model.extend({
	defaults:{
		page: 'home'
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
		this.manager.bind('note-add',function(){
			homepage.get("notes").edit_note(false);
		});
		this.manager.bind('bookmark-add',function(){
			homepage.get("notes").save_bookmark();
		});
		
		this.set("tags", new TagCollection());
		this.get("tags").bind('tag-changed',function(tag){
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
		this.router.bind("showHome",function(){
			homepage.change_page("home");
		});
	},
	change_page: function(page_name){
		if(page_name){
			this.get("charts").deactivate();
			this.get("tags").forEach(function(tag){
				tag.set("selected",false);
			});
			this.router.navigate("");
		}
		this.set("page",page_name);
	},
	setup_charts: function(){
		var charts = this.get("charts");
		var manager = this;
		charts.bind("chart-changed",function(chart){
			manager.get("notes").set_chart(chart);
			if(chart){
				manager.set("page",false);
			}
			manager.router.navigate('charts/'+chart.get("id"));
		});
		this.get("tags").bind('tag-changed',function(tag){
			if(!manager.get("notes").get("chart")) return;
			var tag_shorts = [];
			manager.get("tags").forEach(function(tag){
				if(tag.get("selected")) tag_shorts.push(tag.get("short"));
			});
			var active_chart = manager.get("notes").get("chart");
			manager.router.navigate('charts/'+active_chart.get("id")+'/'+tag_shorts.join("/"),{replace:true});
		});
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
		$(".notes-nav .note-type").each(function(){
			var note_type_node = $(this);
			var note_type = new NoteType({
				short:note_type_node.attr("note-type"),
				name:note_type_node.html(),
				active:note_type_node.hasClass("active")
			});
			new NoteTypeButton({
				model:note_type,
				el:this
			});
			notes_manager.types.add(note_type);
		});
		if(!notes_manager.types.any(function(note_type){ return note_type.get("active"); })){
			notes_manager.types.first().toggle();
		}
	}
});

HomepageView = Backbone.View.extend({
	initialize: function(){
		var view = this;
		this.model.bind('change:page',function(){
			view.render();
		});
	},
	events: {
		'click .navbar .pages a': 'page_navigate',
		'click .note-add': 'add_note',
		'click .navbar .bookmark-add': 'add_bookmark'
	},
	add_bookmark: function(event){
		event.preventDefault();
		this.trigger("bookmark-add");		
	},
	add_note: function(event){
		event.preventDefault();
		this.trigger("note-add");
	},
	page_navigate: function(event){
		event.preventDefault();
		this.trigger("update",$(event.currentTarget).attr("name"));
	},
	render: function(){
		this.$(".page-content").hide();
		this.$(".navbar .pages .active").removeClass("active");
		if(this.model.get("page")){
			this.$('#app-area').hide();
			this.$('#list-area').show();
			
			this.$("#"+this.model.get("page")).show();
			this.$(".navbar .pages li."+this.model.get("page")+":first").addClass("active");
		}else{
			this.$('#app-area').show();
			this.$('#list-area').hide();
		}
	}
	
});