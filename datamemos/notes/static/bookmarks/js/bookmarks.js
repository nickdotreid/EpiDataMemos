Bookmark = Backbone.Model.extend({
	urlRoot:'/bookmark/',
	url:function(){
		if(this.get("id")) return this.urlRoot + this.get("id");
		return this.urlRoot;
	},
	defaults:{
		note:false,
		chart:false,
		tags:new TagCollection(),
		url:"",
		title:"",
		selected_count:0,
		highlight:false
	},
	initialize: function(options){
		var bookmark = this;
		this.get("tags").bind('change:name',function(tag){
			if(bookmark.get("title") == "") bookmark.trigger("update");
		});
		this.bind('change:title',function(){
			bookmark.trigger("update");
		});
	},
	parse: function(data){
		var bookmark = this;
		
		if(data['tags']){
			var tags = new TagCollection();
			_(data['tags']).forEach(function(str){
				tags.add({
					short:str
				});
			});
			data['tags'] = tags;
		}else{
			data['tags'] = new TagCollection();
		}
		
		if(data['chart']){
			// add chart through reference
		}
		
		return data;
	},
	count_selected: function(){
		var count = 0;
		var active = this.get("tags").forEach(function(tag){
			_(tag.get("siblings")).forEach(function(t){
				if(t.get("selected")){
					count += 1;
				}
			})
			if(tag.get("parent") && tag.get("parent").get("selected")){
				count += 1;
			}
			if(tag.get("selected")){
				count += 1;
			}
		});
		
		this.set("selected_count",count);
		return count;
	},
	save: function(options){
		var success_func = false;
		if(options && options['success']){
			success_func = options['success'];
		}
		var postdata = {};
		if(this.get("note")) postdata['note_id'] = this.get("note").get("id");
		if(this.get("chart")) postdata['chart_id'] = this.get("chart").get("id");
		postdata['tags'] = this.get("tags").map(function(tag){
			return tag.get("short");
		}).join(",");
		var bookmark = this;
		$.ajax({
			type:"POST",
			url: this.url(),
			data:postdata,
			success:function(data){
				if(data['bookmarks'] && data['bookmarks'].length > 0){
					bookmark.set(data['bookmarks'][0]);
				}
				if(success_func){
					success_func();
				}
			}
		});
	},
	select: function(){
		this.trigger("bookmark:selected",this);
	},
	highlight: function(on){
		if(on){
			this.set("highlight",true);
		}else{
			this.set("highlight",false);
		}
	}
});

BookmarkView = Backbone.View.extend({
	events:{
		'mouseover': 'highlight',
		'mouseout' : 'unhighlight',
		'click a.edit': 'edit',
		'click' : 'select',
		'click a': 'select'
	},
	initialize: function(options){
		var view = this;
		this.model.bind('update',function(){
			view.render();
		});
		
		this.template = _.template($("#bookmark-list-template").html());
		if(options && options.container) this.container = options.container;
		this.render();
	},
	render: function(){
		this.$el.remove();
		
		var title = this.model.get("title");
		if(!title || title==""){
			var title_arr = [];
			this.model.get("tags").forEach(function(tag){
				title_arr.push(tag.get("name"));
			});
			title = title_arr.join(",");
		}
		
		this.setElement(this.template({
			title: title
		}));
		
		if(this.container) this.$el.appendTo(this.container);
	},
	edit: function(event){
		event.preventDefault();
	},
	select: function(event){
		event.preventDefault();
		this.model.select();
	},
	highlight: function(event){
		var view = this;
		var bookmark = this.model;
		this.hoverTimeout = setTimeout(function(){
			view.hoverTimeout = false;
			bookmark.highlight(true);
		},200);
	},
	unhighlight: function(event){
		if(this.hoverTimeout)	clearTimeout(this.hoverTimeout);
		else	this.model.highlight(false);
	}
});

BookmarkList = Backbone.Collection.extend({
	model:Bookmark
});

BookmarkShare = Backbone.View.extend({
	events:{
		'hidden': 'remove_modal'
	},
	initialize: function(options){
		this.template = _.template($("#bookmark-share-template").html());
	},
	render: function(){
		this.setElement(this.template(this.model.toJSON()));
		this.$el.modal();
	},
	remove_modal: function(){
		this.$el.remove();
	}
});