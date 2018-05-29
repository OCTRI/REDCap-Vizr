<?php
/**
 * EXTERNAL MODULE: REDCap Vizr
 * DESCRIPTION: Sets variables indicating whether or not the current user has
 * edit permissions to the Vizr external module in the current project.
 */
// NOTE: The following line should be included in the calling page.
// require_once "../../../redcap_connect.php";

$rights = REDCap::getUserRights(USERID);
$can_edit = (SUPER_USER || (!empty($rights) && $rights[USERID]['design']));
