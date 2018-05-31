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

## Add Vizr to a project

Enable the module in REDCap. You can enable it for all projects, or on a per-project basis. The instructions below assume a per-project setup.

1. Go to "Control Center" and then "External Modules".
2. Click "Enable a module". Select the version you just installed.

Enable Vizr for your project.

1. Go to your project and then "External Modules" on the left navigation bar.
2. Click "Enable a module" and enable the Vizr external module.

You should now have a section on the left of your project named "External Modules" with a link to Vizr.

# Upgrading Vizr

To upgrade Vizr, follow the same steps for installing Vizr. Each version of Vizr will have its own directory in `redcap/modules` distinguished by a version number. Once the new version is added to REDCap follow the same steps for adding Vizr to a project and enable the new version.

## Verifying the upgrade

To verify the installation, view the Vizr charts for a project. A message should display
below the charts that says "REDCap Vizr" and a version number. The version should match
the one listed in the name of the Vizr zip file. For example, for a zip file named
`vizr_v1.0.3.zip`, the message should be "REDCap Vizr 1.0.3."
