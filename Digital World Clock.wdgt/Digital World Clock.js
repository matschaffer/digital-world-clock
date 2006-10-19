/**
 * We reference front and back and icons a lot, so here are some shortcuts. Assigned in setup().
 */
var front;
var back;
var icons;

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
 * Location database, for storing info about different location preferences and doing auto-complete for previously
 * defined locations.
 */
var locationDatabase = {};

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
    icons = [document.getElementById('flip'), document.getElementById('resize')]
    
    //The following only works from within dashboard
    if (window.widget) {
    	widget.onshow = startCycle;
    	widget.onhide = stopCycle;
        loadPrefences();
        loadLocationDatabase();
    }
    
    //Populate widget's back face
	loadDSTSelector();
	loadBackFields();

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
 * Loads backface form fields.
 */
function loadBackFields() {
	document.getElementById('nameField').value = prefs.cityName;
	document.getElementById('offsetField').value = prefs.offsetFromGMT;
	setSelectedValue(document.getElementById('dstSelect'), prefs.dstRule);
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
	saveLocationDatabase();
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
 * A helper to access preferences but return an original value if there is no preference available.
 */
function getPreference(name, original) {
    preference = widget.preferenceForKey(name);
    if (preference != undefined) {
        return preference;
    } else {
        return original;
    }
}

/**
 * Loads preferences from Dashboard's preference engine.
 */
function loadPrefences() {
    var preference;
	for(i in prefs) {
	   prefs[i] = getPreference(createkey(i), prefs[i]);
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
 * Saves the location database to widget preferences.
 */
function saveLocationDatabase() {
    if (window.widget) {
        locationDatabase[prefs.cityName] = {offsetFromGMT: prefs.offsetFromGMT, dstRule: prefs.dstRule};
        widget.setPreferenceForKey(toJSON(locationDatabase), "locationDatabase");
    }
}

/**
 * Loads the location database from widget preferences.
 */
function loadLocationDatabase() {
    locationDatabase = getPreference("locationDatabase", locationDatabase);
    if (locationDatabase.constructor == String) {
      locationDatabase = parseJSON(locationDatabase);
    }
}

/**
 * A keypress listener on the location field.   Tries to autocomplete the location name
 * and load GMT offset and daylight savings rules from the location database.
 */
function loadLocation(locationField) {
    if (event.keyCode >= 33 && event.keyCode <= 126) {
        lowerValue = locationField.value.toLowerCase();
        
        for (i in locationDatabase) {
            if (lowerValue == i.toLowerCase().slice(0, lowerValue.length)) {
              locationField.value = locationField.value + i.slice(lowerValue.length);
              locationField.setSelectionRange(lowerValue.length, i.length);
              
              prefs.cityName = locationField.value
              prefs.offsetFromGMT = locationDatabase[i]['offsetFromGMT'];
              prefs.dstRule = locationDatabase[i]['dstRule'];
              loadBackFields();
              break;
            }
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
    hideIcons(true);
}