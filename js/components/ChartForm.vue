<template>
  <div :id="id" aria-expanded="true">
    <div class="vizr-form-panel panel panel-primary">
      <div class="panel-heading">
        <strong>{{ messages.heading }}</strong>
        <span class="glyphicon glyphicon-remove pull-right" aria-hidden="true" data-toggle="collapse" :data-target="idSelector" aria-expanded="true" role="button" @click="reset"></span>
      </div>
      <div class="panel-body">
        <div class="form-group">
          <label for="chart_title" class="control-label">{{ messages.titleLabel }}</label>
          <input type="text" class="form-control" name="chart_title" required="required" data-field="title" v-model="model.title">
          <div class="help-block error-help">{{ titleError }}</div>
        </div>
        <div class="form-group">
          <label for="chart_description" class="control-label">{{ messages.descriptionLabel }}</label>
          <input type="text" class="form-control" name="chart_description" data-field="description" v-model="model.description">
        </div>
        <fieldset>
          <legend><span class="label label-default">{{ messages.timeConfigHeading }}</span></legend>
          <div class="form-group">
            <label for="start_date" class="control-label">{{ messages.startDateLabel }}</label>
            <div class="input-group">
              <input ref="startDateInput" type="text" class="form-control vizr-date" name="start_date" data-field="start" data-type="date" data-validate="date,targetDate" v-model="startDate">
              <span class="input-group-addon" @click="showDatePicker($refs.startDateInput)">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <div class="help-block error-help">{{ startDateErrors }}</div>
          </div>
          <div class="form-group">
            <label for="chart_end_date" class="control-label">{{ messages.endDateLabel }}</label>
            <div class="input-group">
              <input ref="endDateInput" type="text" class="form-control vizr-date" name="chart_end_date" data-validate="date" data-field="chartEnd" data-type="date" v-model="endDate">
              <span class="input-group-addon" @click="showDatePicker($refs.endDateInput)">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <div class="help-block error-help">{{ endDateErrors }}</div>
          </div>

          <div class="form-group" v-if="hasEvents">
            <label for="date_field_event" class="control-label">{{ messages.dateFieldEventLabel }}</label>
            <select v-model="model.dateFieldEvent" class="form-control" name="date_field_event" required="required" data-field="dateFieldEvent" @change="dateFieldEventChanged">
              <option value="">
                {{ messages.selectEvent }}
              </option>
              <option v-for="choice in eventChoices" :key="choice.value" :value="choice.value">
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help"></div>
          </div>

          <div class="form-group">
            <label for="record_date" class="control-label">{{ messages.dateFieldLabel }}</label>
            <select v-model="model.field" class="form-control" name="record_date" required="required" data-validate="dateEvent" data-field="field">
              <option value="">
                {{ messages.selectDateField }}
              </option>
              <option v-for="choice in dateFieldChoices" :key="choice.value" :value="choice.value">
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help"></div>
          </div>
          <div class="form-group">
            <label for="date_interval" class="control-label">{{ messages.dateIntervalLabel }}</label>
            <select v-model="model.dateInterval" class="form-control" name="date_interval" required="required" data-field="dateInterval">
              <option value="">
                {{ messages.selectInterval }}
              </option>
              <option v-for="choice in dateIntervals" :key="choice.value" :value="choice.value">
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help">{{ dateIntervalErrors }}</div>
          </div>
        </fieldset>
        <fieldset>
          <legend><span class="label label-default">{{ messages.dataConfigurationHeading }}</span></legend>
          <div class="form-group">
            <label for="filter" class="control-label">{{ messages.filterLogicLabel }} <span class="sub-label">{{ messages.filterLogicSubLabel }}</span></label>
              <textarea class="form-control" rows="3" name="filter" data-field="filter" v-model="model.filter"></textarea>
            <small>{{ messages.filterLogicExample }}</small>
          </div>

          <div class="form-group" v-if="hasEvents">
            <label for="group_field_event" class="control-label">{{ messages.groupingFieldEventLabel }}</label>
            <select v-model="model.groupFieldEvent" class="form-control" name="group_field_event" data-field="groupFieldEvent" @change="groupFieldEventChanged">
              <option value="">
                {{ messages.selectEvent }}
              </option>
              <option v-for="choice in eventChoices" :key="choice.value" :value="choice.value">
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help"></div>
          </div>

          <div class="form-group">
            <label class="control-label" for="group_field">{{ messages.groupingFieldLabel }}</label>
            <select v-model="model.group" class="form-control" name="group_field" data-validate="group" data-field="group">
              <option value="">
                {{ messages.noGrouping }}
              </option>
              <option v-for="choice in groupFieldChoices" :key="choice.value" :value="choice.value">
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help">{{ groupFieldErrors }}</div>
          </div>
        </fieldset>
        <fieldset>
          <legend><span class="label label-default">{{ messages.targetLabel }}</span></legend>
          <div class="form-group targets">
            <!-- TODO targets -->
          </div>
          <div class="form-group">
            <label class="control-label" for="target_date">{{ messages.targetEndDateLabel }}</label>
            <div class="input-group">
              <input ref="targetEndDateInput" type="text" class="form-control vizr-date" name="target_date" data-validate="date,targetDate" data-field="end" data-type="date" v-model="targetEndDate">
              <span class="input-group-addon" @click="showDatePicker($refs.targetEndDateInput)">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <div class="help-block error-help">{{ targetEndDateErrors }}</div>
          </div>
        </fieldset>

        <button
          type="submit"
          class="btn btn-primary"
          name="submit_vizr_form"
          data-toggle="collapse"
          :data-target="idSelector"
          :disabled="submitDisabled"
          aria-expanded="true"
          @click="save"
        >{{ messages.actions.save }}</button>
        <button
          type="cancel"
          class="btn btn-link"
          data-toggle="collapse"
          :data-target="idSelector"
          aria-expanded="true"
          @click="reset"
        >{{ messages.actions.cancel }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fieldComparator,
  getDateFields,
  getCategoricalFields,
  getChoices
} from '@/data-dictionary';

import {
  isoToUserDate,
  userToIsoDate,
  fieldLabel
} from '@/util';

export const selector = {
  titleField: 'input[name=chart_title]',
  descriptionField: 'input[name=chart_description]',
  startDateField: 'input[name=start_date]',
  endDateField: 'input[name=chart_end_date]',
  dateFieldEventSelect: 'select[name=date_field_event]',
  dateFieldSelect: 'select[name=record_date]',
  dateIntervalSelect: 'select[name=date_interval]',
  groupFieldEventSelect: 'select[name=group_field_event]',
  groupingFieldSelect: 'select[name=group_field]',
  targetCountField: 'input[name=target_count]',
  targetDateField: 'input[name=target_date]',
  targetTotalSpan: 'span.target-total',
  saveButton: 'button[type=submit]',
  cancelButton: 'button[type=cancel]',
  headerCancel: 'span.glyphicon-remove',
  targetsDiv: 'div.targets',
  groupTargetsDiv: 'div.group-targets',
  groupTargetFields: 'input[name^=group_target]',
  validatedInputs: 'input[data-validate],[required]'
};

const messages = {
  actions: {
    cancel: 'Cancel',
    save: 'Save'
  },
  dataConfigurationHeading: 'Data Configuration',
  dateFieldLabel: 'Date Field',
  dateFieldEventLabel: 'Date Field Event',
  dateIntervalLabel: 'Date Interval',
  descriptionLabel: 'Chart Notes (optional)',
  endDateLabel: 'End Date',
  errors: {
    fieldRequired: 'Field is required.'
  },
  filterLogicExample: 'Example: [screened]=\'1\'',
  filterLogicLabel: 'Filter Logic',
  filterLogicSubLabel: '(filter the results returned for the chart based on conditional logic)',
  groupingFieldEventLabel: 'Grouping Field Event (optional)',
  groupingFieldLabel: 'Field to Group Results (optional)',
  heading: 'Vizr Chart Configuration',
  noGrouping: 'No Grouping',
  pickerConfig: {
    buttonText: 'Click to select a date'
  },
  selectDateField: 'Select a date field',
  selectEvent: 'Select an event',
  selectInterval: 'Select Interval',
  startDateLabel: 'Start Date',
  targetEndDateLabel: 'Target End Date',
  targetLabel: 'Target (optional)',
  timeConfigHeading: 'Time Configuration',
  titleLabel: 'Chart Title'
};

export default {
  name: 'ChartForm',

  props: {
    chartDef: Object,
    metadata: Object
  },

  data() {
    const { chartDef } = this;
    return {
      messages,
      dateIntervals: [
        { label:'Days', value:'day' },
        { label:'Weeks', value:'week' },
        { label: 'Months', value: 'month' },
        { label:'Years', value:'year' }
      ],
      model: this.copyModel(chartDef),
      startDate: isoToUserDate(chartDef.start),
      endDate: isoToUserDate(chartDef.chartEnd),
      targetEndDate: isoToUserDate(chartDef.end)
    };
  },

  mounted() {
    this.attachDatePickers();
  },

  beforeDestroy() {
    this.destroyDatePickers();
  },

  methods: {
    /**
     * Constructs a copy of the chartDef object.
     * @param {ChartDefinition} chartDef - object to be copied
     * @return {ChartDefinition} new Object.
     */
    copyModel(chartDef) {
      const model = Object.assign({}, chartDef);
      model.targets = Object.assign({}, chartDef.targets);
      return model;
    },

    /**
     * Attach date pickers to the date inputs.
     */
    attachDatePickers() {
      const { $el, hasDatePickers, messages } = this;
      if (hasDatePickers) {
        // match the config used by REDCap
        const pickerConfig = {
          buttonText: messages.pickerConfig.buttonText,
          yearRange: '-100:+10',
          changeMonth: true,
          changeYear: true,
          dateFormat: 'mm/dd/yy'
        };

        $($el).find('input.vizr-date').datepicker(pickerConfig);
      }
    },

    /**
     * Destroys date pickers attached to the date inputs.
     */
    destroyDatePickers() {
      const { $el, hasDatePickers } = this;
      if (hasDatePickers) {
        $($el).find('input.vizr-date').datepicker('destroy');
      }
    },

    /**
     * Opens the date picker for the given element.
     */
    showDatePicker(element) {
      const { hasDatePickers } = this;
      if (hasDatePickers) {
        $(element).datepicker('show');
      }
    },

    /**
     * Resets the model on cancel.
     */
    reset() {
      const { chartDef } = this;
      this.model = this.copyModel(chartDef);
      this.startDate = isoToUserDate(chartDef.start);
      this.endDate = isoToUserDate(chartDef.chartEnd);
      this.targetEndDate = isoToUserDate(chartDef.end);
    },

    /**
     * Clears the date field selection when the date field event changes.
     */
    dateFieldEventChanged() {
      const { model } = this;
      model.field = '';
    },

    /**
     * Clears the grouping field selection when the grouping field event changes.
     */
    groupFieldEventChanged() {
      const { model } = this;
      model.group = '';
    },

    /**
     * Emits an event with the updated chart configuration.
     */
    save() {
      const { model } = this;
      this.$emit('save-chart', this.copyModel(model));
    }
  },

  computed: {
    id() {
      const { chartDef } = this;
      return `form-${chartDef.id}`;
    },

    idSelector() {
      const { id } = this;
      return `#${id}`;
    },

    dataDictionary() {
      const { metadata } = this;
      return metadata.dataDictionary;
    },

    events() {
      const { events } = this.metadata;
      return events;
    },

    eventNames() {
      const { events } = this;
      return events ? Object.keys(events) : [];
    },

    hasEvents() {
      const { eventNames } = this;
      return eventNames.length > 0;
    },

    hasDatePickers() {
      return Boolean(window.$ && window.$.fn && window.$.fn.datepicker);
    },

    titleError() {
      return '';
    },

    startDateErrors() {
      return '';
    },

    endDateErrors() {
      return '';
    },

    eventChoices() {
      const { eventNames } = this;
      return eventNames.map(name => ({ label: name, value: name }));
    },

    dateForms() {
      const { events, hasEvents, model } = this;
      const { dateFieldEvent } = model;
      return hasEvents ? events[dateFieldEvent] : null;
    },

    dateFieldChoices() {
      const { dataDictionary, dateForms } = this;
      return getDateFields(dataDictionary, dateForms)
          .sort(fieldComparator)
          .map(f => ({ label: fieldLabel(f), value: f.field_name }));
    },

    dateIntervalErrors() {
      return '';
    },

    groupForms() {
      const { hasEvents, events, model } = this;
      const { groupFieldEvent } = model;
      return hasEvents ? events[groupFieldEvent] : null;
    },

    groupFieldChoices() {
      const { dataDictionary, groupForms } = this;
      return getCategoricalFields(dataDictionary, groupForms)
        .sort(fieldComparator)
        .map(f => ({ label: fieldLabel(f), value: f.field_name }));
    },

    groupFieldErrors() {
      return '';
    },

    targetEndDateErrors() {
      return '';
    },

    submitDisabled() {
      return false;
    }
  }
}
</script>
