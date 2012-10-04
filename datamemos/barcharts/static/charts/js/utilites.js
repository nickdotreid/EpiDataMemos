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

function round_to_significant_number(num,increase){
	if(num <= 0){
		return 0;
	}
	if(num <= 1){
		num = round_to_significant_number(num * 100, increase)/100;
		if(num > 1){
			num = 1;
		}
		return num;
	}
	if(increase && increase > -1 && increase < 1){
		num += num * 0.05;
	}
	if(num < 5){
		return Math.round(num);
	}
	return Math.ceil(num/10)*10;
}

function in_range_of(a,b){
	if(a < b && a > b/6){
		return true;
	}else if(a > b && b > a/6){
		return true;
	}else if( a == b){
		return true;
	}
	return false;
}

function format_number(num,percent){
	if(percent){
		num = Math.round(num*10000)/100;
		if(String(num).replace("0","").length >3 ){
			num = Math.round(num);
		}
		return num +'%';
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

function make_color_pallet(){
	var color_dict = {};
	var color_pos = 0;
	var colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
	return function(string){
		if(!string || color_pos > colors.length){
			color_pos = 0;
		}
		if(!string){
			return false;
		}
		if(color_dict[string]){
			return color_dict[string];
		}
		color_dict[string] = colors[color_pos];
		color_pos++;
		return color_dict[string];
	}
}
