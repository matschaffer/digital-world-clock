/**
 * We reference front and back a lot, so here are some shortcuts. Assigned in setup().
 */
var front;
var back;

/**
 * In-memory storage for preferences.  Starts with default options.
 */
var prefs = new Object;
prefs.use24HR = false;
prefs.tiny = false;
prefs.dstRule = 'None';
prefs.cityName = 'Gifu';
prefs.offsetFromGMT = 9;
prefs.showSeconds = false;

/**
 * Storage for the last displayed time.
 */
var lastUpdate = undefined;

/**
 * Refresh cycle in miliseconds.
 */
var cycleInterval = 100;

/**
 * Handle for refresh cycle.
 */
var cycleHandle = null;

/**
 * Boots the widget.
 * Called from body.onload
 */
function setup()
{
    front = document.getElementById("front");
    back = document.getElementById("back");
    
    //The following only works from within dashboard
    if (window.widget) {
    	widget.onshow = startCycle;
    	widget.onhide = stopCycle;
        loadPrefences();
    }
    
    //Populate widget's back face
	loadDSTSelector();
	document.getElementById('nameField').value = prefs.cityName;
	document.getElementById('offsetField').value = prefs.offsetFromGMT;
	setSelectedValue(document.getElementById('dstSelect'), prefs.dstRule);

    //Start the clock
	startCycle();
	
	//Tell Dashboard everything's cool
	return 0;
}

/**
 * Dynamically populates the DST dropdown selector from the DSTCalculator object.
 */
function loadDSTSelector() {
	var selector = document.getElementById('dstSelect');
	for (var i in DSTCalculator) {
	    option = document.createElement('option');
	    option.value = i;
	    option.innerHTML = i;
	    selector.appendChild(option);
	}
}

/**
 * Sets the selectedIndex of the given selector to the item that matches the given value.
 */
function setSelectedValue(selector, value) {
    var selector = document.getElementById('dstSelect');
  	var selectedIndex = -1;
  	for (var i = 0; ((i < selector.options.length) && (selectedIndex == -1)); i++) {
  		if (selector.options[i].value == value) {
  			selectedIndex = i;
  		}
  	}
	selector.selectedIndex = selectedIndex;
}

/**
 * Turns on the update cycle.
 */ 
function startCycle() {
   	updateDisplay();
    if (cycleHandle == null) {
        cycleHandle = setInterval("updateDisplay_cycle();", cycleInterval);
    }
}

/**
 * Turns off the update cycle.
 */
function stopCycle() {
    if (cycleHandle != null) {
        clearInterval(cycleHandle);
        cycleHandle = null;
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
function timeChanged() {
    now = new Date();
    return (prefs.showSeconds && (lastUpdate.getSeconds() != now.getSeconds())) ||
           (lastUpdate.getMinutes() != now.getMinutes());
}

/**
 * Updates front-side display elements.
 */
function updateDisplay() {
    if (prefs.tiny) {
        document.getElementById('front').className = "small";
    } else {
        document.getElementById('front').className = "big";
    }
    
	document.getElementById('time').firstChild.data=formatTime(getOffsetTime());
	document.getElementById('location').firstChild.data=prefs.cityName;
	
	lastUpdate = new Date();
}

/**
 * Formats the time as a string according to this program's display parameters.
 */
function formatTime(time) {
    var stringTime;
    
    secondSymbol = (prefs.showSeconds)?":%S":"";
    if (prefs.use24HR) {
        stringTime = time.strftime("%a %H:%M"+secondSymbol);
    } else {
        stringTime = time.strftime("%a %l:%M"+secondSymbol+"%p");
    }
    
    return stringTime;
}

// Customize AM/PM display.
Date.meridian = { 'AM': 'a', 'PM': 'p' }

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

/**
 * Switches the size between big and small
 */
function resize() {
    prefs.tiny = !prefs.tiny;
    savePreferences();
    updateDisplay();
}