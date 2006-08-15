/**
 * Abstracts flipping logic.
 * @param String transition A transition name
 * @param function cleanup A function to be called during the transition.  This should change div display styles.
 */
function flipWidget(transition, cleanup) {
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
        back.style.display = "block";   //show the back
    });	
}

/**
 * Flips the widget to the front side.
 */
function hidePreferences()
{	
    flipWidget("ToFront", function() {
	   back.style.display = "none";			// hide the back
	   front.style.display = "block";	// show the front
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

/**
 * Holds which items are shown for rollover animations.
 */
var itemsShown = new Object;

/**
 * Fades an item's opacity.
 * @param element item The item (usually div) to fade.
 * @param string direction Either "in" or "out" indicating the fade direction.
 */
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

/**
 * Fades the given item in.
 */
function fadeIn(item) {
    if (!itemsShown[item.id]) {
        fade(item, "in");
    }
}

/**
 * Fades the given item out.
 */
function fadeOut(item) {
    if (itemsShown[item.id]) {
        fade(item, "out");
    }
}

/**
 * Generates an opacity animation handler for the given item.
 */
function animationHandler(item)
{
    return function(animation, current, start, finish) {
        item.style.opacity = current;
    }
}

/**
 * Provides onmouseover hover functionality for the front-side "i" since :hover doesn't want to work.
 */
function enterflip()
{
	document.getElementById('fliprollie').style.display = 'block';
}

/**
 * Provides onmouseout hover functionality for the front-side "i" since :hover doesn't want to work.
 */
function exitflip()
{
	document.getElementById('fliprollie').style.display = 'none';
} 