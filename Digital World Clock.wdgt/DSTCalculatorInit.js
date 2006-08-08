/**
 * Defines DSTCalculator and a series of functions for easing DST calculations.
 */

DSTCalculator = new Object;
DSTCacher = new Object;

/**
 * Retrieves and caches the current day of the month.
 */
function getDayOfMonth(cacheKey, dayOffset, calibrate) {
    var year = (new Date().getUTCFullYear()); 
    
    if (!DSTCacher[cacheKey]) {
        DSTCacher[cacheKey] = new Object;
        DSTCacher[cacheKey]['year'] = year;
        DSTCacher[cacheKey]['result'] = calculateDayOfMonth(year, dayOffset, calibrate);
    } else {
        if (year != DSTCacher[cacheKey]['year']) {
            DSTCacher[cacheKey]['result'] = calculateDayOfMonth(year, dayOffset, calibrate);
        }
    }

    return DSTCacher[cacheKey]['result'];
}

/**
 * 
 */
function calculateDayOfMonth(year, dayOffset, calibrate) {
    return dayOffset - ((Math.floor((5 * year) / 4) + calibrate) % 7);
}

/**
 *
 */
function givenAreaIsInOffset(name, startMonth, endMonth, startDayOffset, startDayCalibrate, endDayOffset, endDayCalibrate, changeTime, offsetFromGMT) {
    now = new Date();
    startDay = getDayOfMonth(name+'-start', startDayOffset, startDayCalibrate);
    endDay = getDayOfMonth(name+'-end', endDayOffset, endDayCalibrate);
    return offsetTest(now, startMonth, endMonth, startDay, endDay, offsetFromGMT, changeTime);
}

/**
 * Checks to see if a given time is in DST offset based on start/end time
 */
function offsetTest(now, startMonth, endMonth, startDay, endDay, offsetFromGMT, changeTime) {
	var month = now.getUTCMonth() + 1;

    if (startMonth < endMonth) {
        monthCompare = (month > startMonth - 1) && (month < endMonth + 1);
    } else {
        monthCompare = (month > startMonth - 1) || (month < endMonth + 1);
    }

	if (monthCompare) {
		if (month == startMonth) {
			var day = now.getUTCDate();
			
			if (day > startDay) {
				return true;
			}
			
			if (day == startDay) {
				var hour = now.getUTCHours();
				
				hour += offsetFromGMT;

				if (hour >= changeTime) {
					return true;
				}
			}
		}
		else if (month == endMonth) {
			var day = now.getUTCDate();

			if (day < endDay) {
				return true;
			}
			
			if (day == endDay) {
				var hour = now.getUTCHours();
				
				hour += offsetFromGMT;
				
				if (hour < changeTime) {
					return true;
				}
			}
		}
		else {
			return true;
		}
	}
	
	return false;    
}