var frontDisplay = "table-cell";
var backDisplay = "block";

/**
 * Abstracts flipping logic.
 * @param String transition A transition name
 * @param function cleanup A function to be called during the transition.  This should change div display styles.
 */
function flipWidget(transition, cleanup) {
    var front = document.getElementById("front");
	var back = document.getElementById("back");

    if (window.widget)
		widget.prepareForTransition(transition);

    cleanup();
    
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);		// and flip the widget over
}

/**
 * Flips the widget to the back side.
 */
function showPreferences()
{	
    flipWidget("ToBack", function() {
        front.style.display = "none";       //hide the front
        back.style.display = backDisplay;   //show the back
    });	
}

/**
 * Flips the widget to the front side.
 */
function hidePreferences()
{	
    flipWidget("ToFront", function() {
	   back.style.display="none";			// hide the back
	   front.style.display=frontDisplay;	// show the front
    });	
    exitflip();     //Hide the "i" incase the mouse moved during animation
}

/**
 * Handles display actions when mouse is over the widget.  Namely, displaying the front-side controls.
 */
function mousemove (event)
{
    fadeIn(document.getElementById ('flip'));
    fadeIn(document.getElementById ('resize'));
}

/**
 * Handles display actions when mouse leaves the widget.  Namely, hiding the front-side controls.
 */
function mouseexit (event)
{
    if (event.toElement && (event.toElement.nodeName == 'BODY')) {
        fadeOut(document.getElementById ('flip'));
        fadeOut(document.getElementById ('resize'));
    }
}

var itemsShown = new Object;

function fade(item, direction) {
    itemsShown[item.id] = !itemsShown[item.id]; 
    animator = new AppleAnimator(500, 13);
  
    if (direction == "in") {
      animation = new AppleAnimation(0.0, 1.0, animationHandler(item));
    } else {
      animation = new AppleAnimation(1.0, 0.0, animationHandler(item));
    }
    animation.item = item;
    
    animator.addAnimation(animation);
    
    animator.start();
}

function fadeIn(item) {
    if (!itemsShown[item.id]) {
        fade(item, "in");
    }
}

function fadeOut(item) {
    if (itemsShown[item.id]) {
        fade(item, "out");
    }
}

function animationHandler(item)
{
    return function(animation, current, start, finish) {
        item.style.opacity = current;
    }
}

// Provides hover functionality on the "i" circular border
function enterflip()
{
	document.getElementById('fliprollie').style.display = 'block';
}

function exitflip()
{
	document.getElementById('fliprollie').style.display = 'none';
} 