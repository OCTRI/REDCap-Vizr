# Vizr External Module

Vizr was created by the Oregon Clinical & Translational Research Institute's (OCTRI)
Clinical Research Informatics (CRI) Application team at Oregon Health & Science University
(OHSU) with the aim to visualize data contained within a REDCap project.

This external module provides a way for project designers to create charts summarizing their data
in a time series fashion to provide additional insights about their project.

# Vizr Installation and Upgrades

See [INSTALL.md](INSTALL.md).

# Vizr Permissions

After installing Vizr you will need to configure the module to allow users to view, create and edit charts.

First, navigate to *Control Center*, then *External Modules*, and click *Configure* for the Vizr module.

Under *Module configuration permissions in projects* you have two options: *Require Project Setup/Design privilege* and *Require module-specific user privilege*. The first allows all users with *Project Design and Setup* rights full access to Vizr. They will be able to view, create, and edit charts. The second option should be used if you want some users to have view-only rights.

For *Require Project Setup/Design privilege*, navigate to *User Rights*, select a user, and click *Edit user privileges*. Under *Highest level privileges* you will see *Project Design and Setup*. If this is checked the user will be able to view, create and edit charts. Notice, in this case checking *Project Design and Setup* also checks the Vizr module under the section *External Modules: Configuration Permissions* automatically - it's otherwise disabled.

For *Require module-specific user privilege*, if you want a view-only user navigate to *User Rights*, select a user, and click *Edit user privileges*. Now select the Vizr module under *External Modules: Configuration Permissions* and save. If you also want that user to be able to create and edit charts you will also need to check *Project Design and Setup*. Both must be checked.

If Vizr is enabled for a project, super users may view, create and edit charts in a all cases.
