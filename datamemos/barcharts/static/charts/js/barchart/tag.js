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
	connect_to: function(items){
		this.set_property('children',items);
		this.set_property('siblings',items);
		this.set_parent(items);
	},
	set_property: function(property,items){
		var items = items;
		var _children = [];
		_(this.get(property)).forEach(function(str){
			_(items).forEach(function(tag){
				if(str == tag.get("short")){
					_children.push(tag);
				}
			});
		});
		this.set(property,_children);
		return this;
	},
	set_parent: function(items){
		var tag = this;
		var parent = false;
		_(items).forEach(function(row){
			if(tag != row && tag.get('parent') == row.get("short")){
				parent = tag;
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
			}
		});
	},
	connect_tags: function(){
		var items = this.models;
		this.forEach(function(tag){
			tag.connect_to(items);
		});
	}
});