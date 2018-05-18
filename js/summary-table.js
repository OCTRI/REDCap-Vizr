import { caption, div, table, thead, tbody, tr, th, td } from './html';
import { notAnsweredLabel } from './util.js';

/**
 * Generates a breakdown of statistics by group that can be rendered in a table.
 *
 * @param {Object} groupData - { groupName: {count: _ , target: _ }, ...}
 * @param {String} groupDescription - header for the group; ex. "Institution"
 * @return {String[][]} - ex.
 * [
 *  [groupDescription, "Count", "Target", "Percent", "Percent of Total"],
 *  [group1Name, _, _, _, _],
 *  ...
 * ]
 */
export function statistics(groupData, groupDescription) {
  let groups = Object.keys(groupData);
  groups.sort();

  const total = groups.reduce((c, k) => {
    return c + groupData[k].count;
  }, 0);

  let header = [groupDescription, "Results Count", "Target", "Percent", "Percent of Total"];
  let rows = groups.map(group => {
    let groupLabel = group ? group : notAnsweredLabel;
    let data = groupData[group];
    let count = data.count;
    let target = data.target;
    // Group target must exist and be non-zero to display
    let targetDisplay = targetString(target); // optional form field
    let countStr = (count !== undefined && count !== null) ? count.toString() : "";
    return [groupLabel, countStr, targetDisplay, pct(count, target), pct(count, total)];
  });

  return [header].concat(rows);
}

/**
 * Renders the given rows as an html table. Assumes the first row is the header.
 *
 * @param {Value[][]} rows - rows to render
 * @return {String} html table string
 */
export function render(rows, captionText) {
  captionText = captionText || "";
  const header = rows[0];
  const values = rows.slice(1);

  return table({"class": "table table-striped table-bordered"},
    caption(captionText),
    thead(
      tr(...header.map(h => {
        return th(h);
      }))),
    tbody(
      ...values.map(row => {
        return tr(
          ...row.map(v => { return td(v); })
        );
      })
    ));
}

/**
 * Single-row table with the overall count, target, and percent.
 *
 * @param {String} name - title
 * @param {Number} count
 * @param {Number} target
 * @return {String} html markup
 */
export function renderTotal(count, target) {
  const data = [
    ["Results Count", "Target", "Percent"],
    [isNaN(count) ? 0 : count, target, pct(count, target)]
  ];
  return div(render(data, "Total Number of Results"));
}

/**
 * Calculate the percent and return a string for display.
 * @param {Number} num - numerator
 * @param {Number} total - denominator
 * @return {String} percent as a string with a single decimal; ex. '32.3%'
 */
function pct(num, total) {
  if (isNaN(parseFloat(num)) || isNaN(parseFloat(total)) || total === 0) {
    return "";
  }

  const value = (num / total) * 100;
  return `${value.toFixed(2)}%`;
}

/**
 * Returns a string representation of a target for display.
 * @param {Number} target - the target to convert
 * @return {String} target as a string; calculated targets with fractional values are
 *   rounded to two decimals
 */
function targetString(target) {
  if (!target) {
    return "";
  }

  return Number.isInteger(target) ? target.toString() : target.toFixed(2);
}
