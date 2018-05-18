<?php
/**
 * PLUGIN: REDCap Vizr
 * DESCRIPTION: Queries the current project for data, which is then summarized by Vizr to create
 * a chart. pid must be appended to the query url for this to be treated as a project-level request
 * POST data should contain the following:
 *   recordIdField: The field the project uses as a primary key
 *   filter: The filter to apply when getting data
 *   events: The events to filter on. Pass an empty array or null if this is not a longitudinal project.
 *   fields: The fields to return
 *
 * Returns the requested data and the set of events returned from the filter if the project is longitudinal.
 * ex. (NonLongitudinal)
 * {
 *   "filterEvents": null,
 *   "data": [
 *      {"record_id": 1, "visit_date": "10-31-2016", "study_clinic": "Portland"},
 *      {"record_id": 2, "visit_date": "11-17-2016", "study_clinic": "Bend"},
 *      {"record_id": 3, "visit_date": "12-11-2016", "study_clinic": "Eugene"}
 *   ]
 * }
 *
 * ex. (Longitudinal)
 * {
 *   "filterEvents": ["visit_1_arm_1"],
 *   "data": [
 *      {"record_id": 1, "visit_date": "10-31-2016", "study_clinic": "Portland", "redcap_event_name": "visit_1_arm_1"},
 *      {"record_id": 2, "visit_date": "11-17-2016", "study_clinic": "Bend", "redcap_event_name": "visit_1_arm_1"},
 *      {"record_id": 3, "visit_date": "12-11-2016", "study_clinic": "Eugene", "redcap_event_name": "visit_1_arm_1"}
 *   ]
 * }
 * If the filter returns multiple rows per record, there may be more than one filter event, and records may be repeated
 * in the data.
 */

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once "../../../redcap_connect.php";

/**
 * Filter the input
 */
function filterInput($str) {
  return filter_var($str, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
}

// Sanitize all post parameters
$recordIdField = filterInput($_POST['recordIdField']);
// The filter may contain special characters that should not be stripped. (e.g., <>"")
$filterLogic = $_POST['filter'];
$eventFilter = null;
if (!empty($_POST['events'])) {
  foreach($_POST['events'] as $event) {
    $eventFilter[] = filterInput($event);
  }
}
$fields = array();
$fields[] = $recordIdField;
foreach ($_POST['fields'] as $field) {
  $fields[] = filterInput($field);
}

$returnObj = new stdClass();

if (is_null($eventFilter)) {
  // The project is not longitudinal. A single direct query with a JSON response is easiest.
  $data = json_decode(REDCap::getData ('json' /* return_format */, NULL /* records */, $fields /* fields */,
    NULL /* events */, NULL /* groups */, FALSE /* combineCheckboxValues */,
    FALSE /* exportDataAccessGroups */, FALSE /* exportSurveyFields */, $filterLogic,
    TRUE /* exportAsLabels */, FALSE /* exportCsvHeadersAsLabels */), true);
  $returnObj->data = $data;
} else {
  // First, apply the filter without any event restrictions, getting back only the record ids and events.
  // This comes back as a map from record id to event id to record. An array is returned because a JSON
  // response will not return an event id.
  $filteredRecords = REDCap::getData ('array' /* return_format */, NULL /* records */,
    array($recordIdField, 'redcap_event_name') /* fields */, NULL /* events */,
    NULL /* groups */, FALSE /* combineCheckboxValues */, FALSE /* exportDataAccessGroups */,
    FALSE /* exportSurveyFields */, $filterLogic, TRUE /* exportAsLabels */,
    FALSE /* exportCsvHeadersAsLabels */);

  if (count($filteredRecords) > 0) {
    // Now get the results for the records
    $resultsForRecords = json_decode(REDCap::getData ('json' /* return_format */,
      array_keys($filteredRecords) /* records */, $fields /* fields */, $eventFilter /* events */,
      NULL /* groups */, FALSE /* combineCheckboxValues */, FALSE /* exportDataAccessGroups */,
      FALSE /* exportSurveyFields */, NULL /* filter */, TRUE /* exportAsLabels */,
      FALSE /* exportCsvHeadersAsLabels */), true);

    // If the eventFilter had multiple events, squash the rows
    $squashed = squashRecords($resultsForRecords, $recordIdField, $fields);
    // Now expand based on the records and events from the filter
    $returnObj = expandRecords($squashed, $filteredRecords, $recordIdField);
  } else {
    $returnObj->data = array();
  }
}

print json_encode($returnObj);

/**
 * Squashes results that may have multiple rows per record.
 * ex. [{'record_id': '1', 'date': '2017-01-01', 'group': ''},
 *  {'record_id': '1', 'date': '', 'group': 'Portland'}] =>
 * [{'record_id': '1', 'date': '2017-01-01', 'group': 'Portland'}]
 */
function squashRecords($results, $recordIdField, $fields) {

  $squashed = array();
  foreach ($results as $item) {
    if (is_null($squashed[$item[$recordIdField]])) {
      $squashed[$item[$recordIdField]] = $item;
    } else {
      $record = $squashed[$item[$recordIdField]];
      foreach ($fields as $field) {
        if ($record[$field] == "") {
          $record[$field] = $item[$field];
        }
      }
      $squashed[$item[$recordIdField]] = $record;
    }
  }

  return array_values($squashed);
}

/**
 * Expands unique records if multiple events were associated with the filter.
 * ex. [{'record_id': '1', 'date': '2017-01-01', 'group': 'Portland'}] =>
 * [{'record_id': '1', 'date': '2017-01-01', 'group': 'Portland', 'redcap_event_name': 'visit_1_arm_1'},
 * {'record_id': '1', 'date': '2017-01-01', 'group': 'Portland', 'redcap_event_name': 'visit_2_arm_1'}]
 * Returns the expanded records as data and the event names as filterEvents.
 */
function expandRecords($squashed, $filteredRecords, $recordIdField) {
  $events = array(); // A map from event id to unique name
  $expanded = array();
  foreach ($squashed as $row) {
    $id = $row[$recordIdField]; // Get the record id
    $recordEventIds = array_keys($filteredRecords[$id]); // Get the filter events associated with the record
    foreach ($recordEventIds as $recordEventId) {
      if (is_null($events[$recordEventId])) {
        // Get the unique event name for the event id and store it in a map
        $events[$recordEventId] = REDCap::getEventNames(true, false, $recordEventId);
      }
      $row['redcap_event_name'] = $events[$recordEventId]; // Add the event name to the row
      $expanded[] = $row; // Add the row to the expanded set
    }
  }

  // Return the expanded set and the set of events from the filter
  $returnObj = new stdClass();
  $returnObj->filterEvents = array_values($events);
  $returnObj->data = $expanded;
  return $returnObj;
}
?>
