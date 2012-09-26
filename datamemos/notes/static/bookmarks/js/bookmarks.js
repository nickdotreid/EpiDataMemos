Bookmark = Backbone.Model.extend({
	urlRoot:'/notes/bookmark/',
	url:function(){
		if(this.get("id")) return this.urlRoot + this.get("id");
		return this.urlRoot;
	},
	defaults:{
		note:false,
		chart:false,
		tags:[]
	},
	initialize: function(){
		if(this.get("tags").length<1){
			this.set("tags",new BookmarkList());
		}
	},
	get_activeness: function(){
		var active = _(this.tags).filter(function(tag){
			return tag.get("selected");
		});
		return active.length;
	},
	save: function(options){
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
			}
		});
	}
});

BookmarkList = Backbone.Collection.extend({
	model:Bookmark
});