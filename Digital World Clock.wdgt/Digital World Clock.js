var DAY_ARRAY = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

var use24HR = true;
var dstRule = 'North America'; 
var cityName = "Philadelphia";
var offsetFromGMT = -5;
var refTime = undefined;

var cycleInterval = 1000;
var cycleHandle = null;

//Widget setup
if (window.widget) {
	//set hide/show
	widget.onhide = onhide;
	widget.onshow = onshow;

	//get preferences
	var cityPref = widget.preferenceForKey(createkey("cityName"));
	if (cityPref != undefined) {
		cityName = cityPref;
	}

	var offsetPref = widget.preferenceForKey(createkey("offsetFromGMT"));
	if (offsetPref != undefined) {
		offsetFromGMT = parseFloat(offsetPref);
	}

	var use24HRPref = widget.preferenceForKey(createkey("use24HR"));
	if (use24HRPref != undefined) {
		use24HR = use24HRPref;
	}
		
	var dstRulePref = widget.preferenceForKey(createkey("dstRule"));
	if (dstRulePref != undefined) {
		dstRule = dstRulePref;
	}
}
//end widget setup

function setup()
{
	//TODO Get default values for DST and GMT offset from OS
	//--- javascript makes this kinda difficult to do right, so
	//--- we're just gonna pay hommage to Philadelphia for the time being
/*	var now = new Date();
	if (offsetFromGMT == undefined) {
		offsetFromGMT = 0 - (now.getTimezoneOffset() / 60.0);
	}
	if (dstRule == undefined) {
		dstRule = 0;
	} */
	
	loadDSTSelector();
	
	//populate backside fields	
	document.getElementById('nameField').value = cityName;
	document.getElementById('offsetField').value = offsetFromGMT;
	document.getElementById('use24HR').checked = use24HR;
	
  	//.selectedIndex needs to be a number, not a string like dstRule is, so first we find it
  	var selector = document.getElementById('dstSelect');
  	var selectedIndex = -1;
  	for (var i = 0; ((i < selector.options.length) && (selectedIndex == -1)); i++) {
  		if (selector.options[i].value == dstRule) {
  			selectedIndex = i;
  		}
  	}
  	//Now that we found it, set it
	selector.selectedIndex = selectedIndex;

	//Update display
	displayLocation();
	updateTime();

	return 0;
}

function loadDSTSelector() {
	var selector = document.getElementById('dstSelect');
	var j = 0;
	for (var i in DSTCalculator) {
		selector.innerHTML = selector.innerHTML + 
				'<option value="'+i+'">'+j+': '+i+'</option>\n';
		j++;
	}
}

function onshow() {
	updateTime();
    if (cycleHandle == null) {
        cycleHandle = setInterval("updateTime_cycle();", cycleInterval);
    }
}

function updateTime_cycle() {
	if (timeChanged()) {
		updateTime();
	}
}

function onhide() {
    if (cycleHandle != null) {
        clearInterval(cycleHandle);
        cycleHandle = null;
    }
}

function timeChanged() {
	var same = false;
	var cur = new Date();

	if (refTime != undefined) {
		var ref = refTime;

		same = (
			//ref.getSeconds() == cur.getSeconds() &&
			ref.getMinutes() == cur.getMinutes() &&
			ref.getHours() == cur.getHours() &&
			ref.getDay() == cur.getDay() &&
			ref.getMonth() == cur.getMonth() &&
			ref.getFullYear() == cur.getFullYear()
		);
	} 

	refTime = cur;
	
	return !same;
}

function updateTime() {
	time = getOffsetTime();
	displayTime(formatTime(time));
}

function getOffsetTime() {
  	var now = new Date();
	var gmt = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000));

	dstOffset = DSTCalculator[dstRule](parseFloat(offsetFromGMT));
 
	now.setTime(gmt.getTime() + (((offsetFromGMT + dstOffset) * 60) * 60 * 1000));

	return now;
}

function formatTime(time) {
	var padMinutes = "";
	var padSeconds= "";
	var hours = time.getHours();
	var amPm = "";

	if (time.getMinutes() < 10) {
		padMinutes = "0";
	}

	if (time.getSeconds() < 10) {
		padSeconds = "0";
	}

	if (use24HR == false) {
		if (hours >= 12) {
			amPm = "p";
		} else {
			amPm = "a";
		}

		hours %= 12;

		if (hours == 0) {
			hours = 12;
		}
	}	
		
	return DAY_ARRAY[time.getDay()] + " " + String(hours) + ":" + padMinutes + String(time.getMinutes()) + amPm;
	//The line below will display seconds
	/* return DAY_ARRAY[time.getDay()] + " " + String(time.getHours()) + ":" + padMinutes + String(time.getMinutes()) + ":" + padSeconds + String(time.getSeconds()); */
}

function displayTime(time)
{
	document.getElementById('time').firstChild.data=time;
}

function displayLocation()
{
	document.getElementById('location').firstChild.data=cityName;
}

function updatePrefs() {
	cityName = document.getElementById('nameField').value;
	offsetFromGMT = parseFloat(document.getElementById('offsetField').value);
	use24HR = document.getElementById('use24HR').checked;
	var dstBox = document.getElementById('dstSelect');
	dstRule = dstBox.options[dstBox.selectedIndex].value;

	//set preferences for persistence
	if (window.widget) {
		widget.setPreferenceForKey(cityName,  createkey("cityName"));
		widget.setPreferenceForKey(offsetFromGMT, createkey("offsetFromGMT"));
		widget.setPreferenceForKey(use24HR, createkey("use24HR"));
		widget.setPreferenceForKey(dstRule, createkey("dstRule"));
	}
}

function doneClicked() {
	updatePrefs();
	hidePrefs();
	updateTime();
	displayLocation();
}

function createkey(key)
{
	return widget.identifier + "-" + key;
}
