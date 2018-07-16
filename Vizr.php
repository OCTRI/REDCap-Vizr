<?php
namespace Octri\Vizr;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class Vizr extends AbstractExternalModule {

  /**
   * Override to check for Vizr User Rights. Else returns the parent value
   * which checks for design rights.
   */
  public function redcap_module_link_check_display($project_id, $link) {
    $rights = \REDCap::getUserRights(USERID);
    if ($this->hasVizrUserRights($rights)) {
      return $link;
    } else {
      return parent::redcap_module_link_check_display($project_id, $link);
    }
  }

  /**
   * Checks to see if a user has user rights for the Vizr external module on
   * the current project.
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
   * Checks to see if the user can edit charts. A user can edit charts if they
   * are a super user or have design or user rights for the vizr module.
   */
  public function canEditVizrCharts() {
    $rights = \REDCap::getUserRights(USERID);
    return SUPER_USER || $this->hasDesignRights($rights) || $this->hasVizrUserRights($rights);
  }

}
