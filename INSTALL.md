# Vizr Installation

The Vizr external module consists of JavaScript and a few PHP service files that can be installed
using the following instructions.

## Install the Vizr external module

1. Extract the `vizr_vX.Y.Z.zip` file where X.Y.Z is the current release version.
2. Place the `vizr_vX.Y.Z` directory in the `redcap/modules` directory.
3. Ensure that the web server has permission to read the files. For example with some
Linux systems:

```
sudo chown apache:apache -R redcap/modules/vizr_vX.Y.Z
sudo chmod 440 -R redcap/modules/vizr_vX.Y.Z
```

## Create a Vizr config project

Vizr needs to save information about the charts that have been configured in each REDCap
project so they can be retrieved and displayed to other users. This data will be stored in
its own project in REDCap. Create a new REDCap project either using the provided REDCap
project XML file, `VizrConfigurationProject.xml`, or by uploading the data dictionary,
`VizrConfigurationProject_DataDictionary.csv`.

***Take note of the project id number as it will be needed to configure Vizr in the next
step.***

## Configure Vizr

Rename the `example_config.php` file in the vizr_vX.Y.Z directory to `config.php` and edit
it, adding the project number of the previously created configuration project.

```
$config_project_id = <Vizr config project id>;
```

## Add Vizr to a project

Enable the module in REDCap. You can enable it for all projects, or on a per-project basis. The instructions below assume a per-project setup.

1. Go to "Control Center" and then "External Modules".
2. Click "Enable a module". Select the version you just installed.

Enable Vizr for your project.

1. Go to your project and then "External Modules" on the left navigation bar.
2. Click "Enable a module" and enable the Vizr external module.

You should now have a section on the left of your project named "External Modules" with a link to Vizr.

# Upgrading Vizr

To upgrade Vizr, follow the same steps for installing Vizr. Each version of Vizr will have it's own directory in `redcap/modules` distinguished by a version number. Once the new version is added to REDCap follow the same steps for adding Vizr to a project and enable the new version.

You may want to copy your previous `config.php` into the new version. Check the latest `example_config.php` to make sure there are no new properties that would need to be added.

## Verifying the upgrade

To verify the installation, view the Vizr charts for a project. A message should display
below the charts that says "REDCap Vizr" and a version number. The version should match
the one listed in the name of the Vizr zip file. For example, for a zip file named
`vizr_v1.0.3.zip`, the message should be "REDCap Vizr 1.0.3."

