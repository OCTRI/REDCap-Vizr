# Vizr Implementation Details

Vizr is an external module for REDCap that allows users to visualize and group aggregated data over time. PHP is used to communicate with the REDCap external module API and database, but most of the logic exists client-side in Javascript files. The point of entry to the external module is the `index.php` file in the vizr_vX.Y.Z directory where X.Y.Z is the version. This creates the outer containers to hold the charts and instructions, then calls the `Vizr.run()` method on document.ready() to populate the rest of the DOM elements.

## Storage

Chart configuration is stored as JSON in the external module's settings. See `getProjectSetting` in [the external module documentation](https://github.com/vanderbilt/redcap-external-modules/blob/master/docs/official-documentation.md) and the `redcap_external_module_settings` database table for details.

## PHP Service Layer

PHP is used to communicate with the REDCap Plugin API and the database directly. Here is a summary of the functions performed by these files.

PHP File | Function
---------| ---------
metadata.php | Retrieve metadata about the project including the data dictionary and information about events if the project is longitudinal
chart_defs.php | Retrieve chart definitions from external module settings
data.php | Retrieve data from the project based on the chart definition
persist.php | Save chart definitions to the external module settings

### Getting data

The most complex logic at the service layer is in `data.php`. This file takes a number of inputs and must be able to retrieve and interpret data from both nonlongitudinal and longitudinal studies.

Among the inputs passed in is a filter. This is a string provided by the user that should conform to REDCap syntax. It is treated as a black box. Vizr simply pushes it to the REDCap external module API, and unexpected data may not be properly handled. If the input is bad, the filter may be ignored or the external module API may simply crash. In the event of a crash, Vizr displays a message that the chart could not be rendered.

A successful response should contain an object with two components - the `data` and optionally a list of `filterEvents`. For a nonlongitudinal project, only `data` will exist, and the structure would look something like this:

```
{
  "filterEvents": null,
  "data": [
    {"record_id": 1, "visit_date": "10-31-2016", "study_clinic": "Portland"},
    {"record_id": 2, "visit_date": "11-17-2016", "study_clinic": "Bend"},
    {"record_id": 3, "visit_date": "12-11-2016", "study_clinic": "Eugene"}
  ]
}
```

#### Longitudinal

For longitudinal projects where data may be collected multiple times and at different time points, `data.php` must do some transformations on the data to conform more closely to the structure above.

When a user configures a chart, they may be seeking information about up to 3 events. Both the data and group fields must have an associated event, and the UI provides selection components for these. In addition, the filter may or may not contain event information. (e.g., `[visit_1_arm_1][visit_status]='1'`).

Because the filter is treated as a black box, the first step in processing a longitudinal data request is to simply apply the filter and get the record ids and events associated with that filter. Depending on whether the filter includes an event, the external module API would return something like this:

```
Filter: [visit_1_arm_1][visit_status]='1' (Return all record ids where visit 1 is complete)
[
  {"record_id": 1, "redcap_event_name": "visit_1_arm_1"},
  {"record_id": 3, "redcap_event_name": "visit_1_arm_1"},
  {"record_id": 5, "redcap_event_name": "visit_1_arm_1"}
]

Filter: [visit_status]='1' (Return all record ids where ANY visit is complete)
[
  {"record_id": 1, "redcap_event_name": "visit_1_arm_1"},
  {"record_id": 1, "redcap_event_name": "visit_2_arm_1"},
  {"record_id": 2, "redcap_event_name": "visit_2_arm_1"},
  {"record_id": 3, "redcap_event_name": "visit_1_arm_1"},
  {"record_id": 5, "redcap_event_name": "visit_1_arm_1"}
]
```
The second example illustrates some of the complexity. The same record may be returned more than once for each matching event. Rather than make assumptions about the user's intent, `data.php` will return all of the rows retrieved from the filter back to the Javascript for processing. The UI will aggregate the data returned and present a select box for live filtering of the data based on event.

Before this can happen, though, `data.php` must perform some transformations. At this point, only the filter has been applied and only the set of record ids and events have been retrieved. It also needs to process the other inputs - retrieving the data and group fields from their respective events. An additional call is made to the external module API to get this data only for the record ids returned from the filter.

Depending on whether the data and group fields were in the same event, the API would return something like this:

```
Events: [visit_1_arm_1],  Fields: [visit_date, visit_status] (Date and Group field on the same event)
[
  {"record_id": "1", "redcap_event_name": "visit_1_arm_1", "visit_date": "2017-01-01", "visit_status": "1"},
  {"record_id": "2", "redcap_event_name": "visit_1_arm_1", "visit_date": "2017-03-02", "visit_status": "0"}
]

Events: [visit_1_arm_1, enrollment],  Fields: [visit_date, study_clinic] (Date and Group field on different events)
[
  {"record_id": "1", "redcap_event_name": "visit_1_arm_1", "visit_date": "2017-01-01", "study_clinic": ""},
  {"record_id": "1", "redcap_event_name": "enrollment", "visit_date": "", "study_clinic": "Portland"},
  {"record_id": "2", "redcap_event_name": "visit_1_arm_1", "visit_date": "2017-03-02", "study_clinic": ""},
  {"record_id": "2", "redcap_event_name": "enrollment", "visit_date": "", "study_clinic": "Bend"}
]
```
The second example again illustrates the complexity. In that case, visit_date is collected at one event and study_clinic at another. Vizr needs to flatten this information into a single view of the record. Luckily, only the date field and group field are requested and because they are of different types, there is no danger of information clashing by squashing this data. Once the data is flattened, the second example looks much like the first with one row per record id. The event name is removed since it is no longer relevant or needed.

```
[
  {"record_id": "1", "visit_date": "2017-01-01", "study_clinic": "Portland"},
  {"record_id": "2", "visit_date": "2017-03-02", "study_clinic": "Bend"}
]
```

One final transformation must occur before returning the data to the UI. We have the flattened data for each record returned from the filter. We also have the record ids and events that were associated with that filter. Now the data must be expanded to account for the possibility that multiple events are being returned. As mentioned before, no assumptions are made about the user's intent in constructing the filter, so we have to return all of those rows, even if record ids were repeated. Those rows must contain the group and date field data requested.

```
Returned from filter [visit_status]='1':
[
  {"record_id": 1, "redcap_event_name": "visit_1_arm_1"},
  {"record_id": 1, "redcap_event_name": "visit_2_arm_1"},
  {"record_id": 2, "redcap_event_name": "visit_2_arm_1"},
  {"record_id": 3, "redcap_event_name": "visit_1_arm_1"},
  {"record_id": 5, "redcap_event_name": "visit_1_arm_1"}
]

Returned from request for group and date fields:
[
  {"record_id": "1", "visit_date": "2017-01-01", "study_clinic": "Portland"},
  {"record_id": "2", "visit_date": "2017-03-02", "study_clinic": "Bend"},
  {"record_id": "3", "visit_date": "2017-07-04", "study_clinic": "Portland"},
  {"record_id": "5", "visit_date": "2017-02-06", "study_clinic": "Eugene"}
]

Response data:
{
 "filterEvents": ["visit_1_arm_1", "visit_2_arm_1"],
 "data": [
    {"record_id": 1, "visit_date": "2017-01-01", "study_clinic": "Portland", "redcap_event_name": "visit_1_arm_1"},
    {"record_id": 1, "visit_date": "2017-01-01", "study_clinic": "Portland", "redcap_event_name": "visit_2_arm_1"},
    {"record_id": 2, "visit_date": "2017-03-02", "study_clinic": "Bend", "redcap_event_name": "visit_2_arm_1"},
    {"record_id": 3, "visit_date": "2017-07-04", "study_clinic": "Portland", "redcap_event_name": "visit_1_arm_1"},
    {"record_id": 5, "visit_date": "2017-02-06", "study_clinic": "Eugene", "redcap_event_name": "visit_1_arm_1"}
 ]
}
```
