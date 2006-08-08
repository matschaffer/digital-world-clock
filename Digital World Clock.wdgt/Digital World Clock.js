var DAY_ARRAY = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

var prefs = new Object;
prefs.use24HR = true;
prefs.tiny = false;
prefs.dstRule = 'None';
prefs.cityName = 'Gifu';
prefs.offsetFromGMT = 9;
prefs.showSeconds = false;

var referenceTime = undefined;
var cycleInterval = 100;
var cycleHandle = null;

//Widget setup
if (window.widget) {
	widget.onhide = function() {
	    if (cycleHandle != null) {
            clearInterval(cycleHandle);
            cycleHandle = null;
        }
	};
	
	widget.onshow = function() {
	   	updateDisplay();
        if (cycleHandle == null) {
            cycleHandle = setInterval("updateDisplay_cycle();", cycleInterval);
        }
	};

    loadPrefences();
}

/**
 * Boots the widget.
 */
function setup()
{
	//TODO Get default values for DST and GMT offset from OS
	loadDSTSelector();
	
	//populate backside fields	
	document.getElementById('nameField').value = prefs.cityName;
	document.getElementById('offsetField').value = prefs.offsetFromGMT;
	
  	//.selectedIndex needs to be a number, not a string like dstRule is, so first we find it
  	var selector = document.getElementById('dstSelect');
  	var selectedIndex = -1;
  	for (var i = 0; ((i < selector.options.length) && (selectedIndex == -1)); i++) {
  		if (selector.options[i].value == prefs.dstRule) {
  			selectedIndex = i;
  		}
  	}
  	//Now that we found it, set it
	selector.selectedIndex = selectedIndex;
	
	document.getElementById('tiny').checked = prefs.tiny;

	updateDisplay();

	return 0;
}

/**
 * Dynamically populates the DST dropdown selector from the DSTCalculator object.
 */
function loadDSTSelector() {
	var selector = document.getElementById('dstSelect');
	var j = 0;
	for (var i in DSTCalculator) {
	    option = document.createElement('option');
	    option.value = i;
	    option.innerHTML = j++ + ": " + i;
	    selector.appendChild(option);
	}
}

/**
 * Wraps updateDisplay so we don't do it unless the time has changed.
 * This makes the refresh cycles lighter if they're called too often.
 */
function updateDisplay_cycle() {
	if (timeChanged()) {
		updateDisplay();
	}
}

/**
 * Checks if the displayed time has changed.  
 */
function timeChanged(countSeconds) {
	var same = false;
	var cur = new Date();

	if (referenceTime != undefined) {
		var ref = referenceTime;

		same = (
			ref.getMinutes() == cur.getMinutes() &&
			ref.getHours() == cur.getHours() &&
			ref.getDay() == cur.getDay() &&
			ref.getMonth() == cur.getMonth() &&
			ref.getFullYear() == cur.getFullYear()
		);
		
		if(prefs.showSeconds) {
		  same = same && (ref.getSeconds() == cur.getSeconds());
		}
	} 

	referenceTime = cur;
	
	return !same;
}

/**
 * Updates front-side display elements.
 */
function updateDisplay() {
    if (prefs.tiny) {
        front.className = "small";
    } else {
        front.className = "big";
    }
    
	time = getOffsetTime();

    secondSymbol = (prefs.showSeconds)?":%S":"";
    if (prefs.use24HR) {
        stringTime = time.strftime("%a %H:%M"+secondSymbol);
    } else {
        stringTime = time.strftime("%a %l:%M"+secondSymbol);
        if(time.getHours() < 12) {
           stringTime += "a";
        } else {
           stringTime += "p";
        }
    }
    
	document.getElementById('time').firstChild.data=stringTime;
	document.getElementById('location').firstChild.data=prefs.cityName;
}

/**
 * Get the time offset by GMT and DST preferences.
 */
function getOffsetTime() {
  	var now = new Date();
	var gmt = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000));

	dstOffset = DSTCalculator[prefs.dstRule](parseFloat(prefs.offsetFromGMT));
 
	now.setTime(gmt.getTime() + (((prefs.offsetFromGMT + dstOffset) * 60) * 60 * 1000));

	return now;
}

/**
 * Grabs preferences from backside form elements.
 */
function updatePreferences() {
	prefs.cityName = document.getElementById('nameField').value;
	prefs.offsetFromGMT = parseFloat(document.getElementById('offsetField').value);
	prefs.tiny = document.getElementById('tiny').checked;
	var dstBox = document.getElementById('dstSelect');
	prefs.dstRule = dstBox.options[dstBox.selectedIndex].value;
}

/**
 * Cleans up after the "done" button is clicked.
 */
function doneClicked() {
	updatePreferences();
	savePreferences();
	hidePreferences();
	updateDisplay();
}

/**
 * Makes a unique preference key for this widget.
 */
function createkey(key)
{
	return widget.identifier + "-" + key;
}

/**
 * Loads preferences from Dashboard's preference engine.
 */
function loadPrefences() {
    var preference;
	for(i in prefs) {
	   preference = widget.preferenceForKey(createkey(i));
	   if (preference != undefined) {
	       prefs[i] = preference;
	   }
	}
}

/**
 * Saves preferences into Dashboard's preference engine.
 */
function savePreferences() {
    if (window.widget) {
        for(i in prefs) {
            widget.setPreferenceForKey(prefs[i], createkey(i));
        }
    }
}

/**
 * Switches the time format from 24HR to 12HR.
 */
function switchFormat() {
    prefs.use24HR = !prefs.use24HR;
    savePreferences();
    updateDisplay();
} 