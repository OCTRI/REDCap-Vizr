/* eslint-env jasmine */
import {
  statistics,
  render,
  renderTotal,
} from '../js/summary-table';

import { notAnsweredLabel } from '../js/util';

const data = {
  "Bend": {count: 10 , target: 20 },
  "Eugene": {count: 20 , target: 30 },
  "Portland": {count: 30 , target: 40 }
};

const expected = {
  pct: {
    bend: '50.00%',
    eugene: '66.67%',
    portland: '75.00%'
  },
  pctTotal: {
    bend: '16.67%',
    eugene: '33.33%',
    portland: '50.00%'
  }
}

const groupName = "Study Clinic";


describe('statistics', () => {
  let rows = statistics(data, groupName);
  let expectedHeader = [groupName, "Results Count", "Target", "Percent", "Percent of Total"];

  it('should generate a header row', () => {
    expect(rows[0]).toEqual(expectedHeader);
  });

  it('should output the correct values', () => {
    expect(rows[1]).toEqual(["Bend", "10", "20", expected.pct.bend, expected.pctTotal.bend]);
    expect(rows[2]).toEqual(["Eugene", "20", "30", expected.pct.eugene, expected.pctTotal.eugene]);
    expect(rows[3]).toEqual(["Portland", "30", "40", expected.pct.portland, expected.pctTotal.portland]);
  });

  it('should work with no data', () => {
    rows = statistics({}, groupName);
    expect(rows.length).toBe(1);
    expect(rows[0]).toEqual(expectedHeader);
  });

  it('should display empty target data if values were not provided', () => {
    let noTargetData = {
      "Bend": {count: 10 , target: null },
      "Eugene": {count: 20 , target: null },
      "Portland": {count: 30 , target: null }
    };

    rows = statistics(noTargetData, groupName);
    expect(rows[1]).toEqual(["Bend", "10", "", "", expected.pctTotal.bend]);
    expect(rows[2]).toEqual(["Eugene", "20", "", "", expected.pctTotal.eugene]);
    expect(rows[3]).toEqual(["Portland", "30", "", "", expected.pctTotal.portland]);
  });

  it('should provide a Not Answered row if group field was optional', () => {
    let optionalGroupData = {
      "": {count: 60, target: 0},
      "Bend": {count: 10 , target: 20 },
      "Eugene": {count: 20 , target: 30 },
      "Portland": {count: 30 , target: 40 }
    };

    rows = statistics(optionalGroupData, groupName);
    expect(rows[1]).toEqual([notAnsweredLabel, "60", "", "", "50.00%"]);
    expect(rows[2]).toEqual(["Bend", "10", "20", "50.00%", "8.33%"]);
    expect(rows[3]).toEqual(["Eugene", "20", "30", "66.67%", "16.67%"]);
    expect(rows[4]).toEqual(["Portland", "30", "40", "75.00%", "25.00%"]);
  });

  it('should round calculated targets to 2 decimals', () => {
    const calculatedTargetData = {
      "Bend": {count: 10, target: 100 / 3}
    };

    rows = statistics(calculatedTargetData, groupName);
    expect(rows[1][2]).toEqual("33.33");
  });

});


describe('render', () => {
  const html = render(statistics(data, "Study Clinic"), "Test Caption");
  it('should create an html table', () => {
    const expectedStr = "<table class='table table-striped table-bordered'>" +
    "<caption>Test Caption</caption>" +
    "<thead><tr><th>Study Clinic</th>" +
    "<th>Results Count</th><th>Target</th><th>Percent</th><th>Percent of Total</th></tr></thead><tbody>" +
    `<tr><td>Bend</td><td>10</td><td>20</td><td>${expected.pct.bend}</td><td>${expected.pctTotal.bend}</td></tr>` +
    `<tr><td>Eugene</td><td>20</td><td>30</td><td>${expected.pct.eugene}</td><td>${expected.pctTotal.eugene}</td></tr>` +
    `<tr><td>Portland</td><td>30</td><td>40</td><td>${expected.pct.portland}</td><td>${expected.pctTotal.portland}</td></tr>` +
    "</tbody></table>";
    expect(html).toBe(expectedStr);
  });
});

describe('renderTotal', () => {
  it('should create a labeled table of total counts', () => {
    const tbl = renderTotal(41, 60);
    const expected = "<div>" +
    "<table class='table table-striped table-bordered'>" +
    "<caption>Total Number of Results</caption>" +
    "<thead>" +
    "<tr><th>Results Count</th><th>Target</th><th>Percent</th></tr></thead>" +
    "<tbody><tr><td>41</td><td>60</td><td>68.33%</td></tr></tbody></table></div>";
    expect(tbl).toBe(expected);
  });
});
