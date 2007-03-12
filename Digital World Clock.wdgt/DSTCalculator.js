//	The DSTCalculator object is basically an array of functions.
//
//	You can now provide you own DST rules by simply adding a new function to the
//	DSTCalculator object.
//
//  Use the following template to define new rules:
//
//  DSTCalculator['<place name>'] = function(offsetFromGMT) {
//    if (givenAreaIsInOffset('<place name>', <start month>, <end month>, <start day offset>, <start day calibrate>, <end day offset>, <end day calibrate>, <hour to switch>, offsetFromGMT)) {
//      return <number of hours for DST offset>;
//    } else {
//      return 0;
//    }
//  };
//
// Explanation of <start/end day offset/calibrate>:
//  This is a little tricky, but these two numbers will help to define the "first sunday of X" type expressions.  The offset should be 7 for the "first" and 31 for the "last".
//  Then find a number for calibrate that yields the correct number for the given year.  Use this formula in a calculator: offset - ((Math.floor((5 * year) / 4) + calibrate) % 7)

DSTCalculator['None'] = function(offsetFromGMT) {
	return 0;
};

if (new Date().getUTCFullYear() >= 2007) {
    DSTCalculator['North America'] = function(offsetFromGMT) {
    	if (givenAreaIsInOffset('North America', 3, 11, 14, 1, 7, 6, 2, offsetFromGMT)) {
    	   return 1;
    	} else {
    	   return 0;
    	}
    };
} else {
    DSTCalculator['North America'] = function(offsetFromGMT) {
    	if (givenAreaIsInOffset('North America', 4, 10, 7, 4, 31, 1, 2, offsetFromGMT)) {
    	   return 1;
    	} else {
    	   return 0;
    	}
    };
}

DSTCalculator['European'] = function(offsetFromGMT) {
	if (givenAreaIsInOffset('European', 3, 10, 31, 4, 31, 1, 1, offsetFromGMT)) {
	   return 1;
	} else {
	   return 0;
	}
};

DSTCalculator['New Zealand'] = function(offsetFromGMT) {
	if (givenAreaIsInOffset('New Zealand', 10, 3, 7, 5, 24, 4, 2, offsetFromGMT)) {
	   return 1;
	} else {
	   return 0;
	}
};

DSTCalculator['Australia'] = function(offsetFromGMT) {
	if (givenAreaIsInOffset('Australia', 10, 4, 31, 1, 7, 4, 3, offsetFromGMT)) {
	   return 1;
	} else {
	   return 0;
	}
};

DSTCalculator['Namibia'] = function(offsetFromGMT) {
	if (givenAreaIsInOffset('Namibia', 9, 4, 7, 3, 7, 4, 2, offsetFromGMT)) {
	   return 1;
	} else {
	   return 0;
	}
};
