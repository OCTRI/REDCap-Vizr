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

// pid in query ensures that the user has access to this project; this is also required for the
// REDCap::getUserRights() call.
$config = $_POST['charts'];
$data = array(array("record_id" => $project_id, "config_array" => $config));

// If $rights returns NULL, then user does not have access to this project
// Check if user has "Project Design and Setup" rights
if (!$can_edit) {
  exit(RestUtility::sendResponse(401, "You do not have the necessary permissions to modify charts.", 'json'));
}

// Writes to the config project.
$response = REDCap::saveData($config_project_id, 'json', json_encode($data), 'overwrite');

# Log events in the VIZR project - events are already logged in the config project.
$logData = json_encode(array_merge(
  array("data" => $data),
  array("response" => $response)
));
REDCap::logEvent("VIZR chart saveData event", $logData, NULL/*sql*/,
    $config_project_id, NULL/*event*/, $project_id);
echo json_encode($response);
