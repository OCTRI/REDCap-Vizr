<?php
/**
 * EXTERNAL MODULE: REDCap Vizr
 * DESCRIPTION: Persists chart configuration data for the current project in the external module
 * settings. This functionality is only available for users with the 'Project Design and Setup'
 * rights for the current project.
 */

// Call the REDCap Connect file in the main "redcap" directory
require_once dirname(realpath(__FILE__)) . '/../../../redcap_connect.php';
require_once dirname(realpath(__FILE__)) . '/permissions.php';

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
 * @return bool TRUE if $input is an object with a charts property, and charts is an array
 *   of chart definitions. FALSE otherwise.
 */
function inputIsValid($input) {
  if (is_object($input) && is_array($input->charts)) {
    foreach($input->charts as $chart) {
      if (!chartIsValid($chart)) {
        return FALSE;
      }
    }

    return TRUE;
  }

  return FALSE;
}

// pid in query ensures that the user has access to this project; this is also required for the
// REDCap::getUserRights() call.

// If $rights returns NULL, then user does not have access to this project
// Check if user has "Project Design and Setup" rights
if (!$can_edit) {
  exit(RestUtility::sendResponse(401, "You do not have the necessary permissions to modify charts.", 'json'));
}

$response = new stdClass();
$data = json_decode(file_get_contents('php://input'));

if (inputIsValid($data)) {
  try {
    $module->setProjectSetting('chart-definitions', $data->charts);
    $response->item_count = 1;
  } catch (Exception $e) {
    error_log("Vizr caught an exception persisting configuration for PID $project_id: " . $e->getMessage());
    $response->errors = array("The settings could not be saved due to an error.");
  }
} else {
  error_log("Vizr received an invalid persistence payload for PID $project_id");
  $response->errors = array("Invalid chart configuration.");
}

// Log the change to the project
$logData = json_encode(array_merge(
  array("data" => $data),
  array("response" => $response)
));
REDCap::logEvent("Vizr chart configuration changed", $logData, NULL/*sql*/,
    NULL/*record*/, NULL/*event*/, $project_id);
echo json_encode($response);
