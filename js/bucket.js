import moment from 'moment';
import { DateTime } from 'luxon';
import { assert, noGroupsLabel } from './util.js';

/**
 * NOTE: The variable 'interval' in bucketing methods must be a valid time delineation
 * in moment.js as described here: https://momentjs.com/docs/#/get-set/get/
 */

/**
 * Computes the start of date interval equivalent to Moment.js in the default locale.
 *
 * @param {DateTime} dateTime - a Luxon date time object
 * @param {String} interval -
 */
function startOfInterval(dateTime, interval) {
  if (interval === 'week' || interval === 'weeks') {
    // return the preceding Sunday
    return dateTime.minus({ days: dateTime.weekday % 7 });
  } else {
    return dateTime.startOf(interval);
  }
}

/**
 * Given a start and end date, this will create buckets of the given time interval
 * and count up the records in that bucket. Counts are cumulative, so an item will
 * fall into the bucket for its time range and all subsequent buckets.
 *
 * @param {Object[]} jsonData - Data to be grouped. Data format should be:
 *    [{fieldName: 2016-01-01}, {fieldName: 2016-01-02}, {fieldName: 2016-02-01}].
 * @param {String} fieldName -
 * @param {String} start - start date (format YYYY-MM-DD)
 * @param {String} end - end date (format YYYY-MM-DD)
 * @param {String} interval - the time interval
 *
 * @return an array with the bucket start date as the key and the count for that bucket as
 *  the value.
 */
export function dateBuckets(jsonData, fieldName, start, end, interval) {
  let startDt = DateTime.fromISO(start);
  let endDt = DateTime.fromISO(end);

  assert(startDt.isValid, 'Start date is invalid');
  assert(endDt.isValid, 'End date is invalid');

  // Groups the data by interval start and summarizes the counts.
  let countsByInterval = jsonData.reduce((counts, item) => {
    let dt = DateTime.fromISO(item[fieldName]);

    if (dt >= startDt && dt <= endDt) {
      let intervalStart = startOfInterval(dt, interval);
      let key = intervalStart.toISODate();
      let total = counts[key] || 0;
      counts[key] = total + 1;
    }

    return counts;
  }, {});

  // For each interval, get the count of items that occur before the end of the interval. There should be
  // a record for every interval between start and end.
  let results = startDates(start, end, interval).reduce(({ prevKey, counts }, key) => {
    let previousTotal = counts[prevKey] || 0;
    let intervalCount = countsByInterval[key] || 0;
    counts[key] = previousTotal + intervalCount; // Counts are cumulative.

    return { prevKey: key, counts: counts};
  }, { prevKey: null, counts: {}});

  return results.counts;
}

/**
 * Generates a list of start dates between start and end for the interval given.
 *
 * @param {String} start - start date (format YYYY-MM-DD)
 * @param {String} end - end date (format YYYY-MM-DD)
 * @param {String} interval - the time interval
 * @return {String[]} - list of start dates for each interval; ex. ['2016-10-02', '2016-10-09', ...]
 */
function startDates(start, end, interval) {
  // Get the start of the first interval and the end of the last
  const startDate = moment(start).startOf(interval);
  const endDate = moment(end).endOf(interval);
  let currentStart = moment(startDate);
  let results = [];

  while (currentStart.isBefore(endDate)) {
    results.push(currentStart.format("YYYY-MM-DD"));
    currentStart.add(1, interval);
  }
  return results;
}

/**
 * Generates a list of trendPoints for each date interval from start to end.
 *
 * @param {String} start - start date (format YYYY-MM-DD)
 * @param {String} end - end date (format YYYY-MM-DD)
 * @param {String} interval - the date interval
 * @param {Integer} target - total number to reach by end date
 * @return {Object[]} trend points ({x: String, y: Integer})
 */
export function trendPoints(start, end, interval, target) {
  const trend = trendFn(start, end, interval, target);
  return startDates(start, end, interval).map(dt => { return trend(dt);});
}

/**
 * Creates a function that can be used to find the target for a given date.
 *
 * @param {String} start - start date (format YYYY-MM-DD)
 * @param {String} end - end date (format YYYY-MM-DD)
 * @param {String} interval - the date interval
 * @param {Integer} overallTarget - total number to reach by end date
 * @return {Function(String) -> {x: String, y: Integer}}
 */
function trendFn(start, end, interval, overallTarget) {
  const startDate = moment(start).startOf(interval);
  const endDate = moment(end).endOf(interval);
  const totalIntervals = endDate.diff(startDate, interval);
  const slope = overallTarget / totalIntervals;

  // @return {x: String, y: Integer} target point
  return function(date) {
    const dt = moment(date).startOf(interval);
    const currentPeriod = dt.diff(startDate, interval);
    return { 'x': dt.format("YYYY-MM-DD"), 'y': currentPeriod * slope};
  };
}

/**
 * @param {Object} bucketedData - data that has been cumulatively bucketed; each bucket contains
 *  the sum of the previous bucket, plus any new counts.
 *  Ex. {"2016-10-02": 4, "2016-10-09": 7, ...}
 * @return {Integer} the count of the last bucket or 0 if there are no buckets.
 */
export function totalCount(bucketedData) {
  let buckets = Object.keys(bucketedData);
  if (buckets.length === 0) {
    return 0;
  }
  buckets.sort();
  let lastKey = buckets[buckets.length - 1];
  return bucketedData[lastKey];
}

/**
 * @param {Object[]} list - data; list of objects
 * @param {String} key - property used to form groups
 * @return {Object} groups; {group1: [{}, {},...], group2: [...]}
 */
function groupBy(list, key) {
  return list.reduce((obj, x) => {
    let k = `${x[key]}`;
    (obj[k] = obj[k] || []).push(x);
    return obj;
  }, {});
}

/**
 * Given a list of jsonData objects, generates buckets of data for each group and interval.
 *
 * @param {Object[]} jsonData
 * @param {String} fieldName - data field for which counts will be generated
 * @param {Date} start
 * @param {Date} end
 * @param {String} interval - the time interval to group by
 * @param {String} groupField - the field to group on; if not provided, all data
 *   will be grouped together
 * @return {Object} obj with key for each group.
 */
export function groupedByInterval(jsonData, fieldName, start, end, interval, groupField) {
  const grouped = groupField ? groupBy(jsonData, groupField) : { [noGroupsLabel] : jsonData};

  // If start is not provided, set it to the earliest date.
  if (!start && jsonData.length > 0) {
    // in-place sort
    jsonData.sort(function(a, b) {
      var dateStrA = a[fieldName];
      var dateStrB = b[fieldName];
      if (dateStrA < dateStrB) {
        return -1;
      }
      if (dateStrA > dateStrB) {
        return 1;
      }

      // must be equal
      return 0;
    });
    start = jsonData[0][fieldName];
  }

  let obj = {};
  Object.keys(grouped).forEach(name => {
    obj[name] = dateBuckets(grouped[name], fieldName, start, end, interval);
  });
  return obj;
}

/**
 * Summarize data for groups.
 *
 * @param {Object} data - data used to populate a chartjs Chart object. Keys are groups and the
 *  values are the data associated with each group.
 *  Ex. { "Group1" : {"2016-10-02": 4, "2016-10-09": 7, ...}, "Group2": {...}}
 * @param {Object} targets - specifies the target for each group: ex. {"Group1": 20, "Group2": 30}
 * @return {Object} summarized data in the format => { groupName: {count: _ , target: _ }, ...}.
 *  If a target doesn't exist for a group, it is set to 0.
 */
export function summarizeGroups(data, targets) {
  let targetNames = Object.keys(targets);
  let groups = Object.keys(data);

  let summaries = groups.reduce((groupCounts, g) => {
    groupCounts[g] = { 'count': totalCount(data[g]), 'target': targets[g] || 0};
    return groupCounts;
  }, {});

  // Add targets without data
  targetNames.forEach(function(name) {
    if (!summaries.hasOwnProperty(name)) {
      summaries[name] = { 'count' : 0, 'target': targets[name]};
    }
  })

  return summaries;
}
