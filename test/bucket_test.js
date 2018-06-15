import {
  dateBuckets, groupedByInterval, summarizeGroups, trendPoints
} from '../js/bucket';

import { noGroupsLabel } from '../js/util';

const data = [
{"date":  "2016-10-04"}, {"date":  "2016-10-04"},  {"date":  "2016-10-06"}, {"date":  "2016-10-06"},
{"date":  "2016-10-11"}, {"date":  "2016-10-11"},  {"date":  "2016-10-13"}, {"date":  "2016-10-18"},
{"date":  "2016-10-18"}, {"date":  "2016-10-20"},  {"date":  "2016-10-20"}, {"date":  "2016-10-25"},
{"date":  "2016-10-25"}, {"date":  "2016-10-27"},  {"date":  "2016-11-01"}, {"date":  "2016-11-01"},
{"date":  "2016-11-03"}, {"date":  "2016-11-03"},  {"date":  "2016-11-03"}, {"date":  "2016-11-08"},
{"date":  "2016-11-10"}, {"date":  "2016-11-10"},  {"date":  "2016-11-10"}, {"date":  "2016-11-15"},
{"date":  "2016-11-15"}, {"date":  "2016-11-17"},  {"date":  "2016-11-17"}, {"date":  "2016-11-17"},
{"date":  "2016-12-01"}, {"date":  "2016-12-06"},  {"date":  "2016-12-06"}, {"date":  "2016-12-08"},
{"date":  "2016-12-08"}, {"date":  "2016-12-13"},  {"date":  "2016-12-13"}, {"date":  "2016-12-13"},
{"date":  "2016-12-15"}, {"date":  "2016-12-15"},  {"date":  "2016-12-22"}, {"date":  "2016-12-29"},
{"date": "2016-12-29"}
];

describe('start / end date validation', () => {
  it('should throw an assertion if start date is invalid', () => {
    const fn = () => dateBuckets(data, 'date', '', '2017-02-25', 'week');
    expect(fn).toThrowError('Start date is invalid');
  });

  it('should throw an assertion if end date is invalid', () => {
    const fn = () => dateBuckets(data, 'date', '2016-10-04', '', 'week');
    expect(fn).toThrowError('End date is invalid');
  });
});

describe('weekly output', () => {
  const chartData = dateBuckets(data, 'date', '2016-10-04', '2017-02-25', 'week');
  const keys = Object.keys(chartData);
  keys.sort();

  it('should have a bucket for every week between start and end', () => {
    expect(keys.length).toBe(21);
  });

  it('should start at the beginning of the week of the given start date', () => {
    expect(chartData["2016-10-02"]).toBeDefined();
    expect(keys[0]).toBe("2016-10-02");
  });

  it('should end at the beginning of the week of the given end date', () => {
    expect(keys[keys.length - 1]).toBe("2017-02-19");
  });

  it('should give the expected number of counts', () => {
    expect(chartData["2016-10-02"]).toBe(4);
    expect(chartData[keys[keys.length - 1]]).toBe(data.length);
  });

  it('should have increasing counts', () => {
    for (var i = 1; i < keys.length; i++) {
      expect(chartData[i]).not.toBeLessThan(chartData[i-1]);
    }
  });
});

describe('daily output', () => {
  const chartData = dateBuckets(data, 'date', '2016-10-04', '2016-10-13', 'day');
  const keys = Object.keys(chartData);
  keys.sort();

  it('should have a bucket for every day between start and end', () => {
    expect(keys.length).toBe(10);
  });

  it('should start at the given start date', () => {
    expect(chartData["2016-10-04"]).toBeDefined();
    expect(keys[0]).toBe("2016-10-04");
  });

  it('should end at the given end date', () => {
    expect(keys[keys.length - 1]).toBe("2016-10-13");
  });

  it('should give the expected number of counts', () => {
    expect(chartData["2016-10-04"]).toBe(2);
    expect(chartData[keys[keys.length - 1]]).toBe(7);
  });
});

describe('monthly output', () => {
  const chartData = dateBuckets(data, 'date', '2016-10-04', '2017-02-25', 'month');
  const keys = Object.keys(chartData);
  keys.sort();

  it('should have a bucket for every month between start and end', () => {
    expect(keys.length).toBe(5);
  });

  it('should start at the beginning of the month of the given start date', () => {
    expect(chartData["2016-10-01"]).toBeDefined();
    expect(keys[0]).toBe("2016-10-01");
  });

  it('should end at the beginning of the month of the given end date', () => {
    expect(keys[keys.length - 1]).toBe("2017-02-01");
  });

  it('should give the expected number of counts', () => {
    expect(chartData["2016-10-01"]).toBe(14);
    expect(chartData[keys[keys.length - 1]]).toBe(data.length);
  });

});

describe('yearly output', () => {
  const chartData = dateBuckets(data, 'date', '2016-10-04', '2017-02-25', 'year');
  const keys = Object.keys(chartData);
  keys.sort();

  it('should have a bucket for every year between start and end', () => {
    expect(keys.length).toBe(2);
  });

  it('should start at the beginning of the year of the given start date', () => {
    expect(chartData["2016-01-01"]).toBeDefined();
    expect(keys[0]).toBe("2016-01-01");
  });

  it('should end at the beginning of the year of the given end date', () => {
    expect(keys[keys.length - 1]).toBe("2017-01-01");
  });

  it('should give the expected number of counts', () => {
    expect(chartData["2016-01-01"]).toBe(41);
    expect(chartData[keys[keys.length - 1]]).toBe(data.length);
  });

});

describe('grouped by interval', () => {
  const data = [
    {"group": "A", "date": "2015-09-06"},
    {"group": "A", "date": "2015-09-07"},
    {"group": "A", "date": "2015-09-08"},
    {"group": "A", "date": "2015-09-09"},
    // defined start date
    {"group": "A", "date": "2016-10-04"},
    {"group": "A", "date": "2016-10-04"},
    {"group": "A", "date": "2016-10-06"},
    {"group": "A", "date": "2016-10-06"},
    {"group": "A", "date": "2016-10-11"},
    {"group": "A", "date": "2016-10-11"},
    {"group": "A", "date": "2016-10-13"},
    {"group": "A", "date": "2016-10-18"},
    {"group": "A", "date": "2016-10-18"},
    {"group": "A", "date": "2016-10-20"},
    {"group": "A", "date": "2016-10-20"},
    {"group": "A", "date": "2016-10-25"},
    {"group": "A", "date": "2016-10-25"},
    {"group": "A", "date": "2016-10-27"},
    {"group": "A", "date": "2016-11-01"},
    {"group": "A", "date": "2016-11-01"},
    {"group": "A", "date": "2016-11-03"},
    {"group": "A", "date": "2016-11-03"},
    {"group": "A", "date": "2016-11-03"},
    {"group": "A", "date": "2016-11-08"},
    {"group": "A", "date": "2016-11-10"},
    {"group": "A", "date": "2016-11-15"},
    {"group": "A", "date": "2016-11-15"},
    {"group": "A", "date": "2016-11-17"},
    {"group": "A", "date": "2016-11-17"},
    {"group": "A", "date": "2016-12-01"},
    {"group": "A", "date": "2016-12-06"},
    {"group": "A", "date": "2016-12-08"},
    {"group": "A", "date": "2016-12-08"},
    {"group": "A", "date": "2016-12-13"},
    {"group": "A", "date": "2016-12-15"},
    {"group": "A", "date": "2016-12-15"},
    {"group": "A", "date": "2016-12-29"},
    {"group": "A", "date": "2016-12-29"},
    {"group": "B", "date": "2016-10-04"},
    {"group": "B", "date": "2016-10-06"},
    {"group": "B", "date": "2016-10-06"},
    {"group": "B", "date": "2016-10-11"},
    {"group": "B", "date": "2016-10-13"},
    {"group": "B", "date": "2016-10-18"},
    {"group": "B", "date": "2016-10-20"},
    {"group": "B", "date": "2016-10-20"},
    {"group": "B", "date": "2016-10-27"},
    {"group": "B", "date": "2016-11-01"},
    {"group": "B", "date": "2016-11-03"},
    {"group": "B", "date": "2016-11-03"},
    {"group": "B", "date": "2016-11-08"},
    {"group": "B", "date": "2016-11-10"},
    {"group": "B", "date": "2016-11-10"},
    {"group": "B", "date": "2016-11-10"},
    {"group": "B", "date": "2016-11-15"},
    {"group": "B", "date": "2016-11-15"},
    {"group": "B", "date": "2016-11-17"},
    {"group": "B", "date": "2016-11-17"},
    {"group": "B", "date": "2016-11-17"},
    {"group": "B", "date": "2016-12-01"},
    {"group": "B", "date": "2016-12-06"},
    {"group": "B", "date": "2016-12-06"},
    {"group": "B", "date": "2016-12-08"},
    {"group": "B", "date": "2016-12-08"},
    {"group": "B", "date": "2016-12-13"},
    {"group": "B", "date": "2016-12-13"},
    {"group": "B", "date": "2016-12-13"},
    {"group": "B", "date": "2016-12-15"},
    {"group": "B", "date": "2016-12-15"},
    {"group": "B", "date": "2016-12-22"},
    {"group": "B", "date": "2016-12-29"},
    {"group": "B", "date": "2016-12-29"}
  ];

  describe('grouped weekly', () => {
    const chartData = groupedByInterval(data, 'date', '2016-10-04', '2017-02-25', 'week', 'group');
    const keys = Object.keys(chartData);
    keys.sort();

    it('should have a key for every group', () => {
      expect(keys.length).toBe(2);
    });

    const groupAKeys = Object.keys(chartData["A"]);
    const groupBKeys = Object.keys(chartData["B"]);

    it('should have the same number of buckets for each group', () => {
      expect(groupAKeys.length).toBe(groupBKeys.length);
    });

    it('should have a bucket for every week between start and end', () => {
      expect(groupAKeys.length).toBe(21);
    });

    it('should start at the beginning of the week of the given start date', () => {
      expect(chartData["A"]["2016-10-02"]).toBeDefined();
    });

    it('should end at the beginning of the week of the given end date', () => {
      expect(groupAKeys[groupAKeys.length - 1]).toBe("2017-02-19");
    });

    it('should give the expected number of counts', () => {
      expect(chartData["A"]["2016-10-02"]).toBe(4);
      expect(chartData["B"]["2016-10-02"]).toBe(3);

      expect(chartData["A"]["2017-02-19"]).toBe(34);
      expect(chartData["B"]["2017-02-19"]).toBe(34);
    });

    it('should have increasing counts', () => {
      for (var i = 1; i < groupAKeys.length; i++) {
        expect(chartData["A"][i]).not.toBeLessThan(chartData["A"][i-1]);
      }
      for (var j = 1; j < groupBKeys.length; j++) {
        expect(chartData["B"][j]).not.toBeLessThan(chartData["B"][j-1]);
      }
    });
  });

  describe('grouped weekly starting mid-week', () => {
    const chartData = groupedByInterval(data, 'date', '2016-10-06', '2017-02-25', 'week', 'group');
    const keys = Object.keys(chartData);
    keys.sort();

    it('should have a key for every group', () => {
      expect(keys.length).toBe(2);
    });

    const groupAKeys = Object.keys(chartData["A"]);
    const groupBKeys = Object.keys(chartData["B"]);

    it('should have the same number of buckets for each group', () => {
      expect(groupAKeys.length).toBe(groupBKeys.length);
    });

    it('should have a bucket for every week between start and end', () => {
      expect(groupAKeys.length).toBe(21);
    });

    it('should start at the beginning of the week of the given start date', () => {
      expect(chartData["A"]["2016-10-02"]).toBeDefined();
    });

    it('should give the expected number of counts', () => {
      expect(chartData["A"]["2016-10-02"]).toBe(2);
      expect(chartData["B"]["2016-10-02"]).toBe(2);
    });
  });

  describe('grouped weekly ending midweek', () => {
    const chartData = groupedByInterval(data, 'date', '2016-10-04', '2016-12-28', 'week', 'group');
    const keys = Object.keys(chartData);
    keys.sort();

    const groupAKeys = Object.keys(chartData["A"]);

    it('should end at the beginning of the week of the given end date', () => {
      expect(groupAKeys[groupAKeys.length - 1]).toBe("2016-12-25");
    });

    it('should give the expected number of counts', () => {
      expect(chartData["A"]["2016-12-25"]).toBe(32);
      expect(chartData["B"]["2016-12-25"]).toBe(32);
    });
  });

  describe('grouped weekly without start date', () => {
    const chartData = groupedByInterval(data, 'date', null, '2017-02-25', 'week', 'group');
    const keys = Object.keys(chartData);
    keys.sort();

    it('should have a key for every group', () => {
      expect(keys.length).toBe(2);
    });

    const groupAKeys = Object.keys(chartData["A"]);
    const groupBKeys = Object.keys(chartData["B"]);

    it('should have the same number of buckets for each group', () => {
      expect(groupAKeys.length).toBe(groupBKeys.length);
    });

    it('should have a bucket for every week between start and end', () => {
      expect(groupAKeys.length).toBeGreaterThan(21);
    });

    it('should start at the beginning of the week of the earliest start date', () => {
      expect(chartData["A"]["2015-09-06"]).toBeDefined();
    });

    it('should end at the beginning of the week of the given end date', () => {
      expect(groupAKeys[groupAKeys.length - 1]).toBe("2017-02-19");
    });

    it('should give the expected number of counts', () => {
      expect(chartData["A"]["2015-09-06"]).toBe(4);
      expect(chartData["B"]["2015-09-06"]).toBe(0);
    });
  });


  describe('grouped daily', () => {
    const chartData = groupedByInterval(data, 'date', '2016-10-04', '2016-10-13', 'day', 'group');
    const keys = Object.keys(chartData);
    keys.sort();

    const groupAKeys = Object.keys(chartData["A"]);

    it('should have a bucket for every day between start and end', () => {
      expect(groupAKeys.length).toBe(10);
    });

    it('should start on the given start date', () => {
      expect(chartData["A"]["2016-10-04"]).toBeDefined();
    });

    it('should end on the given end date', () => {
      expect(groupAKeys[groupAKeys.length - 1]).toBe("2016-10-13");
    });

    it('should give the expected number of counts', () => {
      expect(chartData["A"]["2016-10-04"]).toBe(2);
      expect(chartData["B"]["2016-10-04"]).toBe(1);
    });
  });

  describe('grouped monthly', () => {
    const chartData = groupedByInterval(data, 'date', '2016-10-04', '2017-02-25', 'month', 'group');
    const keys = Object.keys(chartData);
    keys.sort();

    const groupAKeys = Object.keys(chartData["A"]);

    it('should have a bucket for every month between start and end', () => {
      expect(groupAKeys.length).toBe(5);
    });

    it('should start at the beginning of the month of the given start date', () => {
      expect(chartData["A"]["2016-10-01"]).toBeDefined();
    });

    it('should end at the beginning of the month of the given end date', () => {
      expect(groupAKeys[groupAKeys.length - 1]).toBe("2017-02-01");
    });

    it('should give the expected number of counts', () => {
      expect(chartData["A"]["2016-10-01"]).toBe(14);
      expect(chartData["B"]["2016-10-01"]).toBe(9);
    });

  });

  describe('grouped yearly', () => {
    const chartData = groupedByInterval(data, 'date', '2016-10-04', '2017-02-25', 'year', 'group');
    const keys = Object.keys(chartData);
    keys.sort();

    const groupAKeys = Object.keys(chartData["A"]);

    it('should have a bucket for every year between start and end', () => {
      expect(groupAKeys.length).toBe(2);
    });

    it('should start at the beginning of the year of the given start date', () => {
      expect(chartData["A"]["2016-01-01"]).toBeDefined();
    });

    it('should end at the beginning of the year of the given end date', () => {
      expect(groupAKeys[groupAKeys.length - 1]).toBe("2017-01-01");
    });

    it('should give the expected number of counts', () => {
      expect(chartData["A"]["2016-01-01"]).toBe(34);
      expect(chartData["B"]["2016-01-01"]).toBe(34);
    });

  });

  const chartDataNoGroup = groupedByInterval(data, 'date', '2016-10-04', '2017-02-25', 'week', '');
  const keysNoGroup = Object.keys(chartDataNoGroup);

  it('should have a single key indicating no groups', () => {
    expect(keysNoGroup.length).toBe(1);
    expect(keysNoGroup[0]).toBe(noGroupsLabel);
  });

});

describe('summarizeGroups', () => {
  const targets =  { 'Group1': 20, 'Group2': 20 };
  const data = {
    "Group1" : {"2016-10-02": 4, "2016-10-09": 6},
    "Group2": {"2016-10-02": 8, "2016-10-09": 15},
    "Not Answered": {"2016-10-02": 7, "2016-10-09": 17} // Group field may be optional and unanswered
  };

  it('should provide the total count and target for each group', () => {
    let summary = summarizeGroups(data, targets);
    expect(Object.keys(summary)).toEqual(['Group1', 'Group2', 'Not Answered']);
    expect(summary['Group1'].count).toBe(6);
    expect(summary['Group1'].target).toBe(20);

    expect(summary['Group2'].count).toBe(15);
    expect(summary['Group2'].target).toBe(20);

    expect(summary['Not Answered'].count).toBe(17);
    expect(summary['Not Answered'].target).toBe(0); // Target is 0 when not specified
  });

});

describe('summarizeGroups without data', () => {
  const targets =  { 'Group1': 20, 'Group2': 20, 'Group3': 20 };
  const data = {
    "Group1" : {"2016-10-02": 4, "2016-10-09": 6},
    "Group2": {"2016-10-02": 8, "2016-10-09": 15}
  };

  it('should provide the total count and target for each group', () => {
    let summary = summarizeGroups(data, targets);
    expect(Object.keys(summary)).toEqual(['Group1', 'Group2', 'Group3']);
    expect(summary['Group1'].count).toBe(6);
    expect(summary['Group1'].target).toBe(20);

    expect(summary['Group2'].count).toBe(15);
    expect(summary['Group2'].target).toBe(20);

    expect(summary['Group3'].count).toBe(0);
    expect(summary['Group3'].target).toBe(20);
  });
});

describe('trendPoints', () => {
  let start = "2017-04-03";
  let end = "2017-05-08";
  let target = 10;

  describe('weekly', () => {
    let pts = trendPoints(start, end, 'week', target);

    it('should provide a point for every week in the period', () => {
      expect(pts.length).toBe(6);
    });

    it('should start with a value of 0', () => {
      expect(pts[0].y).toBe(0);
    });

    it('should end with the target as the value', () => {
      expect(pts[pts.length - 1].y).toBe(10);
    });

    it('should use the beginning of the week as the labels', () => {
      let weekStarts = ["2017-04-02", "2017-04-09", "2017-04-16", "2017-04-23", "2017-04-30", "2017-05-07"];
      expect(pts.map(pt => { return pt.x; })).toEqual(weekStarts);
    });

    it('should increment the y-values at the correct rate', () => {
      let weekTargets = [0, 2, 4, 6, 8, 10];
      expect(pts.map(pt => { return pt.y; })).toEqual(weekTargets);
    });
  });

  describe('daily', () => {
    let pts = trendPoints(start, end, 'day', target);

    it('should provide a point for every day in the period', () => {
      expect(pts.length).toBe(36);
    });

    it('should start with a value of 0', () => {
      expect(pts[0].y).toBe(0);
    });

    it('should end with the target as the value', () => {
      expect(pts[pts.length - 1].y).toBe(10);
    });

    it('should increment the y-values at the correct rate', () => {
      let increment = 10/36;
      expect(Math.abs(pts[1].y - increment) < 0.00001);
    });
  });

  describe('monthly', () => {
    let pts = trendPoints(start, end, 'month', target);

    it('should provide a point for every month in the period', () => {
      expect(pts.length).toBe(2);
    });

    it('should start with a value of 0', () => {
      expect(pts[0].y).toBe(0);
    });

    it('should end with the target as the value', () => {
      expect(pts[pts.length - 1].y).toBe(10);
    });

    it('should use the beginning of the month as the labels', () => {
      let monthStarts = ["2017-04-01", "2017-05-01"];
      expect(pts.map(pt => { return pt.x; })).toEqual(monthStarts);
    });

    it('should increment the y-values at the correct rate', () => {
      let monthTargets = [0, 10];
      expect(pts.map(pt => { return pt.y; })).toEqual(monthTargets);
    });
  });

  describe('yearly', () => {
    start = "2012-04-03";
    end = "2017-05-08";
    let pts = trendPoints(start, end, 'year', target);

    it('should provide a point for every year in the period', () => {
      expect(pts.length).toBe(6);
    });

    it('should start with a value of 0', () => {
      expect(pts[0].y).toBe(0);
    });

    it('should end with the target as the value', () => {
      expect(pts[pts.length - 1].y).toBe(10);
    });

    it('should increment the y-values at the correct rate', () => {
      let yearTargets = [0, 2, 4, 6, 8, 10];
      expect(pts.map(pt => { return pt.y; })).toEqual(yearTargets);
    });
  });

});
