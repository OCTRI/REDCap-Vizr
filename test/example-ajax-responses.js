import { exampleMetadata, exampleLongitudinalMetadata } from './example-metadata';
import { exampleChartDef, exampleNoGroupChartDef, exampleLongitudinalChartDef } from './example-chart-def';

/*
 * Stringify a config array and escape quotes to mock how the response comes back from PHP
 */
function stringifyAndEscape(config) {
  return (JSON.stringify(config)).replace(/"/g, '\\"');
}

export const exampleResponses = {
  metadata: {
    nonlongitudinal: {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(exampleMetadata)
    },
    longitudinal: {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(exampleLongitudinalMetadata)
    }
  },
  config: {
    unconfigured: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"error": "The external module is not configured"}'
    },
    noChartDefs: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"records": []}'
    },
    nonlongitudinal: {
      status: 200,
      contentType: 'application/json',
      responseText: `{"records": [{"record_id":"0", "config_array":"${stringifyAndEscape([exampleChartDef()])}"}]}`
    },
    nonlongitudinalNoGroups: {
      status: 200,
      contentType: 'application/json',
      responseText: `{"records": [{"record_id":"0", "config_array":"${stringifyAndEscape([exampleNoGroupChartDef()])}"}]}`
    },
    longitudinal: {
      status: 200,
      contentType: 'application/json',
      responseText: `{"records": [{"record_id":"0", "config_array":"${stringifyAndEscape([exampleLongitudinalChartDef()])}"}]}`
    }
  },
  data: {
    nonlongitudinal: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"filterEvents": null, "data": [{"record_id":0, "screen_date": "2016-11-01", "study_clinic": "Portland"}]}'
    },
    longitudinal: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"filterEvents": ["visit_1"], "data": [{"record_id":0, "screen_date": "2016-11-01", "study_clinic": "Portland", "redcap_event_name": "visit_1"}]}'
    },
    longitudinalMultipleEvents: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"filterEvents": ["visit_1", "visit_2"], "data": [{"record_id":0, "screen_date": "2016-11-01", "study_clinic": "Portland", "redcap_event_name": "visit_1"}, {"record_id":0, "screen_date": "2016-11-01", "study_clinic": "Portland", "redcap_event_name": "visit_2"}]}'
    },
    noData: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"filterEvents": null, "data": []}'
    },
    nonlongitudinalRepeating: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"filterEvents": null, "data": [{"record_id":0, "screen_date": "2016-11-01", "study_clinic": "Portland", "redcap_repeat_instrument": "Enrollment and Status", "redcap_repeat_instance": 1}]}'
    },
    longitudinalRepeating: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"filterEvents": ["visit_1"], "data": [{"record_id":0, "screen_date": "2016-11-01", "study_clinic": "Portland", "redcap_event_name": "visit_1", "redcap_repeat_instrument": "Enrollment and Status", "redcap_repeat_instance": 1}]}'
    }
  },
  persistence: {
    successful: {
      status: 200,
      contentType: 'application/json',
      responseText: '{"errors":[],"warnings":[],"ids":["0"],"item_count":1}'
    }
  }
};
