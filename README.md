# Vizr Plugin

Vizr was created by the Oregon Clinical & Translational Research Institute's (OCTRI)
Clinical Research Informatics (CRI) Application team at Oregon Health & Science University
(OHSU) with the aim to visualize data contained within a REDCap project.

This plugin provides a way for project designers to create charts summarizing their data
in a time series fashion to provide additional insights about their project.

# Vizr Installation

The Vizr plugin consists of JavaScript and a few PHP service files that can be installed
using the following instructions.

## Install the plugin

1. Extract the `vizr-plugin.zip` file.
2. Place the `vizr-plugin` directory in the `redcap/plugins` directory.
3. Ensure that the web server has permission to read the files. For example with some
Linux systems:

```
sudo chown apache:apache -R redcap/plugins/vizr-plugin
sudo chmod 440 -R redcap/plugins/vizr-plugin
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

Rename the `example_config.php` file in the vizr-plugin directory to `config.php` and edit
it, adding the project number of the previously created configuration project.

```
$config_project_id = <Vizr config project id>;
```

## Add Vizr to a project

In an existing project add a Bookmark for the vizr-plugin with the following configuration:

**Link URL/Destination:** `/redcap/plugins/vizr-plugin/index.php`
**Link Type:** Simple Link
**Append project id to URL:** Checked

# Upgrading Vizr

To upgrade Vizr, you should replace the `lib` directory.

1. Extract the `vizr-plugin.zip` file.
2. Copy the `lib` directory from the zip file into the `redcap/plugins/vizr-plugin`
directory. This replaces the old `lib` directory with a new version of the `lib` directory.
3. Ensure that the web server has permission to see the files, as described above.

## Verifying the upgrade

To verify the installation, view the Vizr charts for a project. A message should display
below the charts that says "REDCap Vizr" and a version number. The version should match
the one listed in the name of the Vizr zip file. For example, for a zip file named
`vizr-plugin-1.0.3.zip`, the message should be "REDCap Vizr 1.0.3."
