<?php
namespace Octri\Vizr;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class Vizr extends AbstractExternalModule {

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
    return SUPER_USER || $this->hasDesignRights($rights);
  }

}
