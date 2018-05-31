<?php
/**
 * EXTERNAL MODULE: REDCap Vizr
 * DESCRIPTION: Queries the Vizr external module settings for chart definition data for the current
 *  project. Returns JSON with the shape {"configArray": [...]}.
 */
header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once dirname(realpath(__FILE__)) . '/../../../redcap_connect.php';

$defs_object = new stdClass();

// NOTE: pid must be appended to the query url for this to be treated as a project-level request
$chart_defs = $module->getProjectSetting('chart-definitions', $project_id);
$defs_object->configArray = $chart_defs ? $chart_defs : array();

print json_encode($defs_object);
?>
