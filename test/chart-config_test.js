import { makeChart, makeStackedChart, labelOpts } from '../js/chart-config';
import $ from 'jquery';

const data = {
  '2016-10-02': 4,
  '2016-10-09': 7,
  '2016-10-16': 11,
  '2016-10-23': 14,
  '2016-10-30': 19,
  '2016-11-06': 23,
  '2016-11-13': 28,
  '2016-11-20': 28,
  '2016-11-27': 29,
  '2016-12-04': 33,
  '2016-12-11': 38,
  '2016-12-18': 39,
  '2016-12-25': 41,
  '2017-01-01': 41,
  '2017-01-08': 41,
  '2017-01-15': 41,
  '2017-01-22': 41,
  '2017-01-29': 41,
  '2017-02-05': 41,
  '2017-02-12': 41,
  '2017-02-19': 41
};

describe('chart creation', () => {
  const chartId = 'screenedChart';
  $('body').append(
    $(`<div class="vizr-chart-container"><canvas id="${chartId}"></canvas></div`)
  );
  const canvas = $('canvas');

  const chart = makeChart(canvas, data, chartId, 'Screened Participants');

  it('should create a chart object', () => {
    expect(chart).toBeDefined();
  });
});

const groupedData = {
  group1: {
    '2016-10-02': 4,
    '2016-10-09': 7,
    '2016-10-16': 11
  },
  group2: {
    '2016-10-02': 3,
    '2016-10-09': 3,
    '2016-10-16': 5
  }
};

const trendpts = [
  { x: '2016-10-02', y: 3 },
  { x: '2016-10-09', y: 6 },
  { x: '2016-10-016', y: 9 }
];

describe('stacked chart creation', () => {
  const chartId = 'screenedChart';
  $('body').append(
    $(`<div class="vizr-chart-container"><canvas id="${chartId}"></canvas></div`)
  );
  const canvas = $('canvas');

  const chart = makeStackedChart(
    canvas,
    groupedData,
    { id: chartId, title: 'Screened Participants by Group' },
    trendpts
  );

  it('should create a stacked chart object with trend points', () => {
    expect(chart).toBeDefined();
  });

  const chartNoTrendpts = makeStackedChart(canvas, groupedData, {
    id: chartId,
    title: 'Screened Participants by Group'
  });

  it('should create a stacked chart object without trend points', () => {
    expect(chartNoTrendpts).toBeDefined();
  });
});

describe('chart legend options', () => {
  it('should use the defaults for up to 10 items', () => {
    expect(labelOpts(0).fontSize).toEqual(12);
    expect(labelOpts(0).boxWidth).toEqual(40);
    expect(labelOpts(10).fontSize).toEqual(12);
    expect(labelOpts(10).boxWidth).toEqual(40);
  });

  it('should use smaller fonts and box width for items from 11 to 20.', () => {
    expect(labelOpts(11).fontSize).toEqual(10);
    expect(labelOpts(11).boxWidth).toEqual(15);
    expect(labelOpts(20).fontSize).toEqual(10);
    expect(labelOpts(20).boxWidth).toEqual(15);
    expect(labelOpts(20).padding).toEqual(10);
  });

  it('should use a smaller padding and boxes for more than 20 items', () => {
    expect(labelOpts(21).fontSize).toEqual(10);
    expect(labelOpts(21).boxWidth).toEqual(10);
    expect(labelOpts(21).padding).toEqual(5);
  });
});
