import Chart from 'chart.js';
import { notAnsweredLabel } from './util.js';

// Color scheme for qualitative data, where color is used primarily to distinguish
// between categories, rather than indicate relative values. (see colorbrewer2)
const colors = [
  'rgba(166,206,227, 0.75)',
  'rgba(31,120,180, 0.75)',
  'rgba(178,223,138, 0.75)',
  'rgba(51,160,44, 0.75)',
  'rgba(251,154,153, 0.75)',
  'rgba(227,26,28, 0.75)',
  'rgba(253,191,111, 0.75)',
  'rgba(255,127,0, 0.75)',
  'rgba(202,178,214, 0.75)',
  'rgba(106,61,154, 0.75)',
  'rgba(255,255,153, 0.75)',
  'rgba(177,89,40, 0.75)'
];

/**
 * Get a color for the given index
 * @param {Integer} i - index
 * @return {String} rgba representation of a color
 */
function color(i) {
  return colors[i % colors.length];
}

/**
 * Get the chart legend label options for the given count.
 * @param {Integer} labelCount - number of legend items to display.
 * @return {Object} configuration.
 */
export function labelOpts(labelCount) {
  const settings = [
    { from: 0, to: 10, use: { boxWidth: 40, fontSize: 12, padding: 10 } },
    { from: 11, to: 20, use: { boxWidth: 15, fontSize: 10, padding: 10 } },
    { defaultValue: true, use: { boxWidth: 10, fontSize: 10, padding: 5 } }
  ];

  return settings.find(r => {
    return r.defaultValue || (labelCount >= r.from && labelCount <= r.to);
  }).use;
}

function newChart(canvas, chartdata, chartDef) {
  let { title, hide_legend } = chartDef;
  let lblOpts = chartdata.datasets ? labelOpts(chartdata.datasets.length) : {};

  let chart = new Chart(canvas, {
    type: 'bar',
    data: chartdata,
    options: {
      legend: {
        display: !hide_legend,
        position: 'top',
        labels: lblOpts
      },
      tooltips: {
        callbacks: {
          // http://www.chartjs.org/docs/latest/configuration/tooltip.html#tooltip-callbacks
          label: function (tooltipItem, data) {
            const group = data.datasets[tooltipItem.datasetIndex].label;
            const value = tooltipItem.yLabel;
            const n = Number.isInteger(value) ? value : value.toFixed(2);

            if (tooltipItem.xLabel) {
              return `${group}: ${n}`;
            } else {
              // At the far right of the chart the xLabel (date) may not appear.
              // Suppress the label here so users don't mistake this value for
              // the actual Target.
              return '';
            }
          }
        }
      },
      scales: {
        xAxes: [
          {
            stacked: true
          }
        ],
        yAxes: [
          {
            stacked: true
          }
        ]
      },
      title: {
        display: true,
        text: title
      }
    }
  });
  return chart;
}

/**
 * Creates a stacked bar chart (with optional trend line) and adds it to the canvas.
 *
 * @param {Element} canvas - HTML canvas element, captured using jQuery or DOM API.
 * @param {} data - grouped data; ex. {group1: {"2016-10-02": 2, "2016-10-09": 3, ...}, group2: ...}
 * @param {Object} chartDef - chart definition; contains canvas element id and
 *   chart title.
 * @param {Object[]} trendPoints - optional; list of {x: {String}, y: {Integer}} points used to
 *   draw a trendline.
 * @return {Chart}
 */
export function makeStackedChart(canvas, groupedData, chartDef, trendPoints) {
  let groups = Object.keys(groupedData);

  let labels = null;
  let datasets = [];

  groups.forEach((g, i) => {
    let data = groupedData[g];
    let x = Object.keys(data);
    let y = x.map(k => {
      return data[k];
    });
    let c = color(i);

    if (labels === null) {
      labels = x;
    }

    datasets.push({
      type: 'bar',
      label: g || notAnsweredLabel,
      backgroundColor: c,
      data: y
    });
  });

  if (trendPoints && trendPoints.length > 0) {
    datasets.push({
      type: 'line',
      label: 'Target',
      backgroundColor: 'rgba(200, 200, 200, 0.75)',
      fill: false,
      pointRadius: 0,
      pointHitRadius: 15,
      data: trendPoints.map(pt => {
        return pt.y;
      })
    });
  }

  const chartdata = {
    labels: labels,
    datasets: datasets
  };

  return newChart(canvas, chartdata, chartDef);
}

/**
 * Constructs a chart.js chart
 *
 * @param {Element} canvas - HTML canvas element, captured using jQuery or DOM API.
 * @param {} data - chart data; {"2016-10-02": 2, "2016-10-09": 3, ...}
 * @param {Object} chartDef - chart definition; contains canvas element id and
 *   chart title.
 */
export function makeChart(canvas, data, chartDef) {
  let x = Object.keys(data);
  let y = x.map(k => {
    return data[k];
  });
  let c = color(0);

  // TODO: make this data configurable
  var chartdata = {
    labels: x,
    datasets: [
      {
        label: chartDef.title,
        backgroundColor: c,
        data: y
      }
    ]
  };

  return newChart(canvas, chartdata, chartDef);
}
