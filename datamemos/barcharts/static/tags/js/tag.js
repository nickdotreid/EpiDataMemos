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
	select: function(){
		this.set("selected",true);
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
		if( typeof(tag.get('parent')) != 'string'){
			return ;
		}
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
			pallet = make_color_pallet();
		}
		_(children).forEach(function(tag){
			tag.set_color(pallet);
		});
		this.set("color",pallet(this.get("short")));
	}
});

TagCollection = Backbone.Collection.extend({
	model:Tag,
	conntected: false,
	surpressed: false,
	always_selected: false,
	initialize: function(){
		var collection = this;
		this.on('change:selected',function(tag_selected){
			if(collection.surpress) return ;
			if(!collection.connected){
				collection.trigger("tag-changed",tag_selected);
				return;
			}
			if(tag_selected.get("selected")){
				this.surpress = true;
				_(collection.without([tag_selected])).forEach(function(tag){
					if(tag != tag_selected){
						tag.set("selected",false);
					}
				});
				this.surpress = false;
				collection.trigger("tag-changed",tag_selected);
			}else{
				if( tag_selected.get("parent") ){
					tag_selected.get("parent").set("selected",true);
				}else if(this.always_selected){
					this.first().set("selected",true);
				}else{
					collection.trigger("tag-changed",tag_selected);
				}
			}
		});
	},
	get_or_add: function(obj){
		var tag = false;
		var _tags = this.where({short:obj['short']});
		if(_tags.length > 0){
			tag = _tags[0];
			tag.set(obj);
		}else{
			tag = new Tag(obj);
			this.add(tag);
		}
		return tag;
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
		this.connected = true;
	}
});