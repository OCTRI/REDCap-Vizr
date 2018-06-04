<?php
/**
 * PLUGIN: REDCap Vizr
 * DESCRIPTION: Persists chart configuration data for the current project in the VIZR configuration
 *  project. The $config_project_id parameter is specified in config.php. This functionality is
 *  only available for users with the 'Project Design and Setup' rights for the current project.
 */

// Call the REDCap Connect file in the main "redcap" directory
require_once "../../../redcap_connect.php";
require_once "../config.php";
require_once "permissions.php";

/**
 * Validates that input is shaped like a chart definition.
 *
 * @param mixed $chart
 * @return bool TRUE if the input is an object with required properties of a chart
 *   definition. FALSE otherwise.
 */
function chartIsValid($chart) {
  return is_object($chart) && isset($chart->id) && isset($chart->title) &&
    isset($chart->field) && isset($chart->dateInterval);
}

/**
 * Validates that JSON data is shaped like a chart persistence payload.
 *
 * @param mixed $input
 * @return bool TRUE if $input is an array of chart definitions. FALSE otherwise.
 */
function inputIsValid($input) {
  if (is_array($input)) {
    foreach($input as $chart) {
      if (!chartIsValid($chart)) {
        return FALSE;
      }
    }

    return TRUE;
  }

  return FALSE;
}

/**
 * Recursively processes the given object and runs all its string-valued properties
 * through `REDCap::escapeHtml`. The original object is mutated.
 *
 * @param object $obj - the object to sanitize
 */
function sanitizeStringProperties($obj) {
  $props = get_object_vars($obj);
  foreach ($props as $prop => $val) {
    if (is_object($val)) {
      sanitizeStringProperties($val);
    } else if (is_string($val)) {
      $obj->{$prop} = REDCap::filterHtml($val);
    }
  }
}

/**
 * Sanitize the properties of each chart in the charts array. Charts are sanitized in place.
 *
 * @param array $charts - an array of chart objects
 */
function sanitizeChartConfig($charts) {
  foreach ($charts as $chart) {
    sanitizeStringProperties($chart);
  }
}

// pid in query ensures that the user has access to this project; this is also required for the
// REDCap::getUserRights() call.
$config = $_POST['charts'];

// If $rights returns NULL, then user does not have access to this project
// Check if user has "Project Design and Setup" rights
if (!$can_edit) {
  exit(RestUtility::sendResponse(401, "You do not have the necessary permissions to modify charts.", 'json'));
}

$decoded_config = json_decode($config);
$data = array(array("record_id" => $project_id, "config_array" => $config));
$response = new stdClass();

if (inputIsValid($decoded_config)) {
  sanitizeChartConfig($decoded_config);
  $data[0]["config_array"] = json_encode($decoded_config);

  // Writes to the config project.
  $response = REDCap::saveData($config_project_id, 'json', json_encode($data), 'overwrite');
} else {
  error_log("Vizr received an invalid persistence payload for PID $project_id");
  $response->errors = array("Invalid chart configuration.");
}

# Log events in the VIZR project - events are already logged in the config project.
$logData = json_encode(array_merge(
  array("data" => $data),
  array("response" => $response)
));
REDCap::logEvent("VIZR chart saveData event", $logData, NULL/*sql*/,
    $config_project_id, NULL/*event*/, $project_id);
echo json_encode($response);
