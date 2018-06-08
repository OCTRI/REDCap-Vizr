/**
 * Template (and partials) for rendering the chart form.
 */

import Mustache from 'mustache';

export const optionPartial = `
<option value="{{value}}" {{#selected}}selected{{/selected}}>
  {{label}}
</option>
`;

// If no group is selected, renders a total count input; otherwise renders an
// input for each group.
export const targetsPartial = `
{{#noGroup}}
  <label class="control-label" for="target_count">Target Count</label>
  <input type="text" class="form-control" name="target_count" value="{{target}}" data-validate="targetDate" data-field='targets.No Groups' data-type='int'>
{{/noGroup}}
{{#hasGroup}}
  <label>Target Counts</label><a data-toggle="collapse" role="button" href="#collapseGroupTargets_{{formId}}" aria-expanded="true">Hide/Show</a>
  <div class="collapse in" id="collapseGroupTargets_{{formId}}">
    <div class="well group-targets">
      {{#groupTargets}}
      <div class="form-group form-group-sm">
        <label class="control-label" for="group_target__{{name}}">{{label}}</label>
        <input type="text" class="form-control col-sm-10" name="group_target__{{name}}" value="{{value}}" data-validate="targetDate" data-field='targets.{{label}}' data-type='int'>
      </div>
      {{/groupTargets}}
      <span class='target-total'>{{> targetTotal}}</span>
    </div>

  </div>
{{/hasGroup}}
`;

export const targetTotalPartial = `<em>Total: {{target}}</em>`;

// TODO: extract this pattern; nullOption parameter
export const groupOptionsPartial = `
<option value="">
  No grouping
</option>
{{#groups}}
{{> option}}
{{/groups}}
`;
export const dateFieldOptionsPartial = `
<option value="">
  Select a date field
</option>
{{#dateFields}}
{{> option}}
{{/dateFields}}
`;

export const formTemplate = `
<div class="col-md-12 collapse in" id="form-{{formId}}" aria-expanded="true">
  <div class="vizr-form-panel panel panel-primary">
    <div class="panel-heading">
      <strong>Vizr Chart Configuration</strong>
      <span class="glyphicon glyphicon-remove pull-right" aria-hidden="true" data-toggle="collapse" data-target="#form-{{formId}}" aria-expanded="true"></span>
    </div>
    <div class="panel-body">
      <div class="form-group">
        <label for="chart_title" class="control-label">Chart Title</label>
        <input type="text" class="form-control" name="chart_title" value="{{title}}" required="required" data-field='title'>
        <div class="help-block error-help">{{#titleError}}Field is required.{{/titleError}}</div>
      </div>
      <div class="form-group">
        <label for="chart_description" class="control-label">Chart Notes (optional)</label>
        <input type="text" class="form-control" name="chart_description" value="{{description}}" data-field='description'>
      </div>
      <fieldset>
        <legend><span class="label label-default">Time Configuration</span></legend>
        <div class="form-group">
          <label for="start_date" class="control-label">Start Date</label>
          <div class="input-group">
            <input type="text" class="form-control vizr-date" name="start_date" value="{{startDate}}" data-field='start' data-type='date' data-validate="date,targetDate">
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <div class="help-block error-help">{{#startDateErrors}}{{/startDateErrors}}</div>
        </div>
        <div class="form-group">
          <label for="chart_end_date" class="control-label">End Date</label>
          <div class="input-group">
            <input type="text" class="form-control vizr-date" name="chart_end_date" value="{{endDate}}" data-validate="date" data-field='chartEnd' data-type='date'>
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <div class="help-block error-help">{{endDateErrors}}</div>
        </div>

        {{#hasEvents}}
        <div class="form-group">
          <label for="date_field_event" class="control-label">Date Field Event</label>
          <select class="form-control" name="date_field_event" required="required" data-field='dateFieldEvent'>
            <option value="">
              Select an event
            </option>
            {{#dateFieldEvents}}
            {{> option}}
            {{/dateFieldEvents}}
          </select>
          <div class="help-block error-help"></div>
        </div>
        {{/hasEvents}}

        <div class="form-group">
          <label for="record_date" class="control-label">Date Field</label>
          <select class="form-control" name="record_date" required="required" data-validate="dateEvent" data-field='field'>
            {{> dateFieldOptions }}
          </select>
          <div class="help-block error-help"></div>
        </div>
        <div class="form-group">
          <label for="date_interval" class="control-label">Date Interval</label>
          <select class="form-control" name="date_interval" required="required" data-field='dateInterval'>
            <option value="">
              Select an interval
            </option>
            {{#dateIntervals}}
            {{> option}}
            {{/dateIntervals}}
          </select>
          <div class="help-block error-help">{{dateIntervalErrors}}</div>
        </div>
      </fieldset>
      <fieldset>
        <legend><span class="label label-default">Data Configuration</span></legend>
        <div class="form-group">
          <label for="filter" class="control-label">Filter Logic <span class="sub-label">(filter the results returned for the chart based on conditional logic)</span></label>
            <textarea class="form-control" rows="3" name="filter" data-field='filter'>{{filter}}</textarea>
          <small>Example: [screened]='1'</small>
        </div>

        {{#hasEvents}}
        <div class="form-group">
          <label for="group_field_event" class="control-label">Grouping Field Event (optional)</label>
          <select class="form-control" name="group_field_event" data-field='groupFieldEvent'>
            <option value="">
              Select an event
            </option>
            {{#groupFieldEvents}}
            {{> option}}
            {{/groupFieldEvents}}
          </select>
          <div class="help-block error-help"></div>
        </div>
        {{/hasEvents}}

        <div class="form-group">
          <label class="control-label" for="group_field">Field to Group Results (optional)</label>
          <select class="form-control" name="group_field" data-validate="group" data-field='group'>
            {{> groupOptions }}
          </select>
          <div class="help-block error-help">{{groupFieldErrors}}</div>
        </div>
      </fieldset>
      <fieldset>
        <legend><span class="label label-default">Target (optional)</span></legend>
        <div class="form-group targets">
        {{> targets }}
        </div>
        <div class="form-group">
          <label class="control-label" for="target_date">Target End Date</label>
          <div class="input-group">
            <input type="text" class="form-control vizr-date" name="target_date" value="{{targetDate}}" data-validate="date,targetDate" data-field='end' data-type='date'>
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <div class="help-block error-help">{{targetEndDateErrors}}</div>
        </div>

      </fieldset><button type="submit" class="btn btn-primary" name="submit_vizr_form" data-toggle="collapse" data-target="#form-{{formId}}" {{#submitDisabled}}disabled="disabled"{{/submitDisabled}} aria-expanded="true">Save</button><button type="cancel" class="btn btn-link" data-toggle="collapse" data-target="#form-{{formId}}" aria-expanded="true">Cancel</button>
    </div>
  </div>
</div>
  `;

// Speeds up rendering?
Mustache.parse(formTemplate);
