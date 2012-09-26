Homepage = Backbone.Model.extend({
	defaults:{
		page: 'home'
	},
	initialize: function(){
		this.manager = new HomepageView({
			model:this,
			el:$("body")[0]
		});
		var homepage = this;
		this.manager.bind('update',function(name){
			homepage.change_page(name);
		});
		
		this.set("tags", new TagCollection());
		
		this.set("charts",new Charts({
			tags:this.get("tags")
		}));
		this.setup_charts();
		this.bootstrap_charts();
		
		this.set("notes",new Notes({
			tags:this.get("tags")
		}));
		this.bootstrap_notes();
		
		this.manager.render();
	},
	change_page: function(page_name){
		if(!page_name || page_name == "") return ;
		if(page_name == 'home'){
			this.get("charts").deactivate();
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
		});
	},
	bootstrap_charts: function(){
		var charts = this.get("charts");
		$(".charts-list .chart").each(function(){
			var chart_id = parseInt($(this).attr("chart-id"));
			var chart = new Chart({
				id:chart_id,
				tags:charts.tags
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
		
		$(".notes-list .note").each(function(){
			var note_node = $(this);
			notes_manager.notes.add({
				id: note_node.attr("note-id"),
				type: note_node.attr("note-type")
			});
		});
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
		'click .navbar .pages a': 'page_navigate'
	},
	page_navigate: function(event){
		event.preventDefault();
		this.trigger("update",$(event.currentTarget).attr("name")); // needs to be dynamic string
	},
	render: function(){
		this.$(".page-content").hide();
		this.$(".navbar .pages .active").removeClass("active");
		if(!this.model.get("page")) return ;
		this.$("#"+this.model.get("page")).show();
		this.$(".navbar .pages li."+this.model.get("page")+":first").addClass("active");
		if(this.$(".page-content:visible").length < 1){
			this.$(".page-content:first").show();
		}
	}
	
});