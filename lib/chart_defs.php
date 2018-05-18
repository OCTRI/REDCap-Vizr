<?php
/**
 * PLUGIN: REDCap Vizr
 * DESCRIPTION: Queries the VIZR configuration project for chart definition data for the current
 *  project. The $config_project_id parameter is specified in config.php. If config.php does not
 *  exist or the id is the default, return {error : "..."}. Otherwise, return
 *  {records : "[configArray...]"}.
 */
header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once "../../../redcap_connect.php";

$defs_object = new stdClass();
$error_message = "The Vizr plugin is not configured in your REDCap instance. Contact your REDCap administrator.";
if (!@include "../config.php") {
  $defs_object->error = $error_message;
} else if ($config_project_id == -1) {
  $defs_object->error = $error_message;
} else {
  // NOTE: pid must be appended to the query url for this to be treated as a project-level request
  $defs = REDCap::getData ($config_project_id, 'json' /* return_format */, $project_id,
    NULL /*$fields*/, NULL /* events */, NULL /* groups */, FALSE /* combineCheckboxValues */,
    FALSE /* exportDataAccessGroups */, FALSE /* exportSurveyFields */, NULL /* filterLogic */,
    TRUE /* exportAsLabels */, FALSE /* exportCsvHeadersAsLabels */);
  $defs_object->records = json_decode($defs);
}

print json_encode($defs_object);
?>
