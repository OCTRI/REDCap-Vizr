# Vizr Installation

The Vizr plugin consists of a JavaScript file and a few PHP service files that can be installed in
REDCap using the following instructions.

## Install the plugin
1. Extract the `vizr-plugin.zip` file.
2. Place the `vizr-plugin` directory in the `redcap/plugins` directory.
3. Ensure that the web server has permission to read the files. For example with some Linux systems:
```
sudo chown apache:apache -R redcap/plugins/vizr-plugin
sudo chmod 440 -R redcap/plugins/vizr-plugin
```

## Create a Vizr config project
Create a new REDCap project using the provided data dictionary.

## Configure Vizr
Rename the `example_config.php` file in the vizr-plugin directory to `config.php` and edit it,
adding the project number of the previously created create project.

## Add Vizr to a project
In an existing project add a Bookmark for the vizr-plugin with the following configuration:

* **Link URL/Destination:** `/redcap/plugins/vizr-plugin/index.php`
* **Link Type:** Simple Link
* **User Access:** Only users that have "Project Setup and Design rights"
  can create or modify Vizr charts. Granting access to all users should be fine.
* **Append project id to URL:** Checked
