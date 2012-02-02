function make_ticks(min,max,amount){
	ticks = [];
	range = max - min;
	step = range/(amount-1);
	num = min;
	while(step && num<=max && amount>=0){
		ticks.push(num);
		num += step;
		amount--;
	}
	return ticks;
}

function array_max(arr,value_function){
	max = 0;
	for(index in arr){
		value = value_function(arr[index]);
		if(value > max){
			max = value;
		}
	}
	return Number(max);
}
function array_sum(arr,value_function){
	total = 0;
	for(index in arr){
		value = value_function(arr[index]);
		if(value){
			total += value;
		}
	}
	return total;
}

function format_number(num,percent){
	if(percent){
		return Math.round(num*100)+'%';
	}
	return addCommas(Math.round(num));
}

function addCommas(nStr){
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function in_array(arr,value){
	if(in_array_position(arr,value)>=0){
		return true
	}
	return false;
}

function in_array_position(arr,value){
	for(var i=0;i<arr.length;i++){
		if(arr[i]==value){
			return i;
		}
	}
	return -1;
}

function find_values(obj,action,parent){
	for(index in obj){
		value = obj[index];
		if(value && typeof value == "object" && 
			!(value instanceof Date || value instanceof RegExp)){
				find_values(obj[index],action,index);
		}
		else if(action){
			action(value,index,parent);
		}
	}
}

function fill_in_values(obj){
	if(!obj){
		obj = {};
	}
	if(!obj.filter){
		obj.filter = unescape($.address.parameter("filter"));
	}
	if(!obj.highlight){
		obj.highlight = unescape($.address.parameter("highlight"));
	}
	if(!obj.percent){
		obj.percent = $.address.parameter("percent");
	}
	return obj;
}

function name_to_class(name){
	if(!name){
		return "";
	}
	return name.replace(" ","_").replace("/","_").replace("-","_").toLowerCase();
}