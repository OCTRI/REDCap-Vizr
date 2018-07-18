import uuid from 'uuid/v4';
import assert from 'assert';
import { DateTime } from 'luxon';

export const userDateFormat = 'MM/dd/yyyy';

// Global for assertions
export { assert };

// The string to indicate a chart with no groups
export const noGroupsLabel = "No Groups";
// The string to indicate the grouped field was optional and unanswered.
export const notAnsweredLabel = "Not Answered";

// Ex. title("study_clinic") => "Study Clinic"
export function title(str) {
  return str.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Creates a new, blank chart definition.
 *
 * @return {Object} blank chart definition object
 */
export function newChartDefinition() {
  return {
    field: '',
    dateFieldEvent: '',
    dateInterval: '',
    filter: '',
    group: '',
    groupFieldEvent: '',
    id: uuid(),
    title: '',
    start: '',
    end: '', // target end
    chartEnd: '',
    targets: defaultTargetsObject()
  };
}

/**
 * Copy the contents of the the given element to the clipboard
 * @param {Element} el - DOM element
 * Adapted from:
 * http://stackoverflow.com/questions/2044616/select-a-complete-table-with-javascript-to-be-copied-to-clipboard
 * http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
 */
export function copyContents(el) {
  var body = document.body, range, sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
        range.selectNodeContents(el);
        sel.addRange(range);
    } catch (e) {
        range.selectNode(el);
        sel.addRange(range);
    }
  } else if (body.createTextRange) {
    range = body.createTextRange();
    range.moveToElementText(el);
    range.select();
  }
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
}


/**
 * Converts from ISO date format to format displayed to users.
 *
 * @param {String} dateString - a date string in YYYY-MM-DD format
 *
 * @return {String} a date string in MM/DD/YYYY format, or empty string if the input was
 *   not a valid ISO date
 */
export function isoToUserDate(dateString) {
  const converted = DateTime.fromISO(dateString)
  return converted.isValid ? converted.toFormat(userDateFormat) : '';
}

/**
 * Converts from user date format to ISO date format.
 *
 * @param {String} dateString - a date string in US MM/DD/YYYY format
 *
 * @return {String} a date string in ISO YYYY-MM-DD format, or empty string if the input
 *   was not a valid US date
 */
export function userToIsoDate(dateString) {
  const converted = DateTime.fromFormat(dateString, userDateFormat);
  return converted.isValid ? converted.toISODate() : '';
}

/**
 * Label displayed to end users for a dataDictionary field.
 * @param {Field} field - dataDictionary entry.
 * @return String to display to user
 */
export function fieldLabel(f) {
  return `${f.field_name} (${f.field_label})`;
}

/**
 * Returns target configuration for charts without grouping.
 * @return {Object}
 */
export function defaultTargetsObject() {
  return { [noGroupsLabel]: null };
}

/**
 * Returns target configuration for charts with a grouping field.
 * @param {String[]} groups - array of group labels, such as obtained from `getChoices`.
 * @return {Object} target configuration with a key for each group in `groups`. For example,
 *    if `groups = ['g1', 'g2']`, then `{ g1: null, g2: null}` is returned.
 * @see data-dictionary.js particularly `getChoices`
 */
export function targetsObjectWithGroups(groups) {
  return groups.reduce((acc, group) => {
    acc[group] = null;
    return acc;
  }, {});
}
