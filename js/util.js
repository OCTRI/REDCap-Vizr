import uuid from 'uuid/v4';
import assert from 'assert';
import { button, span } from './html';
import $ from 'jquery';
import moment from 'moment';

const userDateFormat = 'MM/DD/YYYY';
const isoDateFormat = 'YYYY-MM-DD';

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
    field: null,
    dateFieldEvent: null,
    dateInterval: null,
    filter: null,
    group: null,
    groupFieldEvent: null,
    id: uuid(),
    title: null,
    start: null,
    end: null, // target end
    chartEnd: null,
    targets: null
  };
}

/**
 * @param {Node} - DOM node to copy
 * @return {Element} anchor tag that copies the contents of the given node when clicked.
 */
export function copyLink(targetNode) {
  const link = $(button({'class': "copy-link pull-right btn btn-link btn-sm"},
    span({'class': 'glyphicon glyphicon-copy', 'aria-hidden': 'true',
          'title': 'Copy table to clipboard'})));
  link.on('click', () => {
    copyContents(targetNode);
    return false;
  });
  return link;
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
  const converted = moment(dateString, isoDateFormat, true);
  return converted.isValid() ? converted.format(userDateFormat) : '';
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
  const converted = moment(dateString, userDateFormat, true);
  return converted.isValid() ? converted.format(isoDateFormat) : '';
}
