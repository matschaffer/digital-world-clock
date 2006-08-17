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
    hideIcons();
}

/**
 * Shows the front-side icons.
 */
function showIcons() {
    for(i in icons) {
        fadeIn(icons[i]);
    }
}

/**
 * Hides the front-side icons.
 */
function hideIcons() {
    exitflip();
    for(i in icons) {
        fadeOut(icons[i]);
    }
}

/**
 * Handles display actions when mouse is over the widget. 
 */
function mousemove (event)
{
    showIcons();
}

/**
 * Handles display actions when mouse leaves the widget. 
 */
function mouseexit (event)
{
    if (event.toElement && ((event.toElement.nodeName == 'BODY') || (event.toElement.nodeName == 'HTML'))) {
        hideIcons();
    }
}

/**
 * Holds which items are shown for rollover animations.
 */
var itemsShown = {};

/**
 * Holds animators for items that have been previous faded
 */
var fadeAnimators = {};

/**
 * Fades an item's opacity.
 * @param element item The item (usually div) to fade.
 * @param string direction Either "in" or "out" indicating the fade direction.
 */
function fade(item, direction) {    
    if (fadeAnimators[item.id]) {
        fadeAnimators[item.id].stop();
    }
    
    if (direction == "in") {
      itemsShown[item.id] = true;
      startOpacity = 0.0;
      endOpacity = 1.0;
    } else {
      itemsShown[item.id] = false;
      startOpacity = 1.0;
      endOpacity = 0.0;
    }
    
    animator = new AppleAnimator(500, 13);
    animation = new AppleAnimation(startOpacity, endOpacity, opacityHandler(item));
    animator.addAnimation(animation);
    animator.start();
    fadeAnimators[item.id] = animator;
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
function opacityHandler(item)
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