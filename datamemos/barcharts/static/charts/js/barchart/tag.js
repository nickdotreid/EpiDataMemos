Tag = Backbone.Model.extend({
	defaults:{
		children:[],
		siblings:[],
		parent:false,
		short:"",
		name:"",
		color:false,
		selected:false
	},
	set_children: function(items){
		var tag = this;
		children = _(items).filter(function(row){
			if(tag != row && row.get("parent") && tag == row.get("parent")){
				return true;
			}
			return false;
		});
		this.set('children',children);
		return this;
	},
	set_siblings:function(items){
		var tag = this;
		if(!tag.get("parent")) return ;
		siblings = _(items).filter(function(row){
			if(tag != row && row.get("parent") && tag.get("parent") == row.get("parent")){
				return true;
			}
			return false;
		});
		this.set('siblings',siblings);
		return this;
	},
	set_parent: function(items){
		var tag = this;
		var parent = false;
		_(items).forEach(function(row){
			if(tag != row && tag.get('parent') == row.get("short")){
				parent = row;
			}
		});
		tag.set("parent",parent);
	},
	set_color: function(pallet){
		var pallet = pallet;
		var children = this.get("children");
		if(children.length > 0 || !this.get('parent')){
			pallet(false);
		}
		_(children).forEach(function(tag){
			tag.set_color(pallet);
		});
		this.set("color",pallet(this.get("short")));
	}
});

TagCollection = Backbone.Collection.extend({
	model:Tag,
	initialize: function(){
		var collection = this;
		this.on('change:selected',function(tag_selected){
			if(tag_selected.get("selected")){
				_(collection.without([tag_selected])).forEach(function(tag){
					if(tag != tag_selected){
						tag.set("selected",false);
					}
				});
				collection.trigger("tag-changed");
			}
		});
	},
	connect_tags: function(){
		var items = this.models;
		this.forEach(function(tag){
			tag.set_parent(items);
		});
		this.forEach(function(tag){
			tag.set_children(items);
		});
		this.forEach(function(tag){
			tag.set_siblings(items);
		});
	}
});