Bookmark = Backbone.Model.extend({
	defaults:{
		chart:false,
		tags:[]
	},
	get_activeness: function(){
		var active = _(this.tags).filter(function(tag){
			return tag.get("selected");
		});
		return active.length;
	}
});

BookmarkList = Backbone.Collection.extend({
	model:Bookmark
});