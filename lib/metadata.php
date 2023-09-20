<?php
/**
 * EXTERNAL MODULE: REDCap Vizr
 * DESCRIPTION: Queries the current project for the record id field and data dictionary.
 *  Also gets events and related forms if the project is longitudinal. Returns a mapping
 *  in json format like:
 * {
 *  'recordIdField': 'record_id',
 *  'dataDictionary':[{'field_name':'field_1',...},{...}],
 *  'events': {
 *    'unique_event_name_1' : ['form_1', 'form_2'],
 *    'unique_event_name_2' : ['form_2', 'form_3']
 *  }
 * }
 * If the project is not longitudinal, null is returned for the events.
 */

header('Content-Type: application/json');

$metadata_object = new stdClass();
$record_id_field = REDCap::getRecordIdField();
$data_dictionary = json_decode(REDCap::getDataDictionary('json'));
$event_map = null;

if (REDCap::isLongitudinal()) {
  // Get the unique event names
  $events = REDCap::getEventNames(true);

  $event_map = new stdClass();
  foreach ($events as $event_name) {
      // Get the event id for the name and use this to get the forms for the event
      $event_id = REDCap::getEventIdFromUniqueEvent($event_name);
      $res = $conn->query("select form_name from redcap_events_forms where event_id = $event_id");
      $forms = array();
      while ($row = $res->fetch_assoc()) {
        $forms[] = $row['form_name'];
      }
      $event_map->$event_name = $forms;
  }
}

$metadata_object->recordIdField = $record_id_field;
$metadata_object->dataDictionary = $data_dictionary;
$metadata_object->events = $event_map;

print json_encode($metadata_object);

?>
