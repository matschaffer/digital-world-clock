/**
 * Defines DSTCalculator and a series of functions for easing DST calculations.
 */

DSTCalculator = {};
DSTCacher = {};

/**
 * Retrieves and caches the date for the given calibration value of this year.  Once the calibration value is correct
 * for one year, it will yield the n-th weekday of a given month in any given year.
 * @param String cacheKey The key to be used when looking up values in the cache (usually a DST rule name).
 * @param int dayOffset The number of days to offset the calculation function to yield the correct date.
 * @param int calibrate The calibration number to yield the n-th weekday of a given month.
 */
function getDayOfMonth(cacheKey, dayOffset, calibrate) {
    var year = (new Date().getUTCFullYear()); 
    cache = DSTCacher[cacheKey];
    
    if (!cache) {
        cache = {};
        cache['year'] = year;
        cache['result'] = calculateDayOfMonth(year, dayOffset, calibrate);
    } else {
        if (year != cache['year']) {
            cache['result'] = calculateDayOfMonth(year, dayOffset, calibrate);
        }
    }

    return cache['result'];
}

/**
 * Yields the appropriate date for the n-th weekday of a given month.  This is still voodoo to me.  But once you find the
 * corrent dayOffset and calibrate values for a given month and year, it will work for that month in any given year.
 * @param int year The year to calculate the date for.
 * @param int dayOffset The number of days to offse the calculation (usually 1..7 or 24..31 to indicate the first or last week of the month).
 * @param int calibrate An integer that when correct yields the approprate month.  No correlation yet observed.
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
 * @param Date now The current date/time
 * @param int startMonth The month (1..12) DST starts.
 * @param int endMonth The month (1..12) DST ends.
 * @param int startDay The day (1..12) DST starts.
 * @param int endDay The day (1..12) DST ends.
 * @param int offsetFromGMT The offset from GMT for the zone in question (in hours).
 * @param int changeTime The hour (00..23) when the DST change occurs.
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