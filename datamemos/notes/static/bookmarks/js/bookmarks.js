Bookmark = Backbone.Model.extend({
	urlRoot:'/notes/bookmark/',
	url:function(){
		if(this.get("id")) return this.urlRoot + this.get("id");
		return this.urlRoot;
	},
	defaults:{
		note:false,
		chart:false,
		tags:new TagCollection(),
		url:"",
		selected_count:0
	},
	initialize: function(){
		var bookmark = this;
		bookmark.count_selected();
		this.get("tags").bind("tag-changed",function(tag){
			bookmark.count_selected();
		});
	},
	parse: function(data){
		var bookmark = this;
		
		if(data['tags']){
			var tags = new TagCollection();
			_(data['tags']).forEach(function(str){
				tags.add({
					short: str
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
		var active = this.get("tags").filter(function(tag){
			return tag.get("selected");
		});
		this.set("selected_count",active.length);
		return active.length;
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