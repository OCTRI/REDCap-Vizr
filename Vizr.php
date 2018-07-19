<?php
namespace Octri\Vizr;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class Vizr extends AbstractExternalModule {

  /**
   * Override to allow anyone with project access to be able to view Vizr charts. The
   * user will need `Project Design and Setup` rights in order to create, edit, and
   * delete charts.
   */
  public function redcap_module_link_check_display($project_id, $link) {
    return $link;
  }

  /**
   * Checks to see if a user has module rights for Vizr on the current project.
   * @param array $rights Array of user rights from <code>REDCap::getUserRights</code>.
   */
  public function hasVizrUserRights($rights) {
    $user_module_config = $rights[USERID]['external_module_config'];
    return !empty($rights) && is_array($user_module_config)
        && in_array($this->PREFIX, $user_module_config);
  }

  /**
   * Checks to see if a user has design rights for the current project.
   * @param array $rights Array of user rights from <code>REDCap::getUserRights</code>.
   */
  public function hasDesignRights($rights) {
    return !empty($rights) && $rights[USERID]['design'];
  }

  /**
   * Checks to see if the user can edit charts in Vizr. A user can edit charts if they
   * are a super user or have design rights.
   */
  public function canEditVizrCharts() {
    $rights = \REDCap::getUserRights(USERID);
    return SUPER_USER || $this->hasDesignRights($rights);
  }

}
