<template>
  <div :id="id" aria-expanded="true" @input="validateChanges" @change="validateChanges">
    <div class="vizr-form-panel panel panel-primary card">
      <div class="panel-heading card-header">
        <strong>{{ messages.heading }}</strong>
        <a
          href="#"
          class="remove-form pull-right float-right"
          role="button"
          data-toggle="collapse"
          :data-target="idSelector"
          aria-hidden="true"
          aria-expanded="true"
          @click="reset"
        >
          &times;
        </a>
      </div>
      <div class="panel-body card-body">
        <div class="form-group" :class="{ 'has-error': errors.titleError }">
          <label for="chart_title" class="control-label">{{ messages.titleLabel }}</label>
          <input
            type="text"
            class="form-control form-control-sm"
            name="chart_title"
            required="required"
            data-field="title"
            v-model.trim="model.title"
          />
          <div class="help-block error-help">{{ errors.titleError }}</div>
        </div>
        <div class="form-group">
          <label for="chart_description" class="control-label">{{
            messages.descriptionLabel
          }}</label>
          <input
            type="text"
            class="form-control form-control-sm"
            name="chart_description"
            data-field="description"
            v-model.trim="model.description"
          />
        </div>
        <fieldset>
          <legend>
            <span class="label label-default">{{ messages.timeConfigHeading }}</span>
          </legend>
          <div class="form-group" :class="{ 'has-error': errors.startError }">
            <label for="start_date" class="control-label">{{
              messages.startDateLabel
            }}</label>
            <div class="input-group">
              <input
                ref="startDateInput"
                type="text"
                class="form-control form-control-sm vizr-date"
                name="start_date"
                data-field="start"
                data-v-model="startDate"
                data-validate="validateDate,validateTargetDate"
                v-model="startDate"
                @input="dateFieldChanged"
              />
              <span
                class="input-group-addon input-group-append"
                @click="showDatePicker($refs.startDateInput)"
              >
                <span class="input-group-text"><i class="far fa-calendar-alt"></i></span>
              </span>
            </div>
            <div class="help-block error-help">{{ errors.startError }}</div>
          </div>
          <div class="form-group" :class="{ 'has-error': errors.chartEndError }">
            <label for="chart_end_date" class="control-label">
              {{ messages.endDateLabel }}
            </label>
            <div class="input-group">
              <input
                ref="endDateInput"
                type="text"
                class="form-control form-control-sm vizr-date"
                name="chart_end_date"
                data-field="chartEnd"
                data-v-model="endDate"
                data-validate="validateDate"
                v-model="endDate"
                @input="dateFieldChanged"
              />
              <span
                class="input-group-addon input-group-append"
                @click="showDatePicker($refs.endDateInput)"
              >
                <span class="input-group-text"><i class="far fa-calendar-alt"></i></span>
              </span>
            </div>
            <div class="help-block error-help">{{ errors.chartEndError }}</div>
          </div>

          <div
            class="form-group"
            :class="{ 'has-error': errors.dateFieldEventError }"
            v-if="hasEvents"
          >
            <label for="date_field_event" class="control-label">
              {{ messages.dateFieldEventLabel }}
            </label>
            <select
              ref="dateFieldEventSelect"
              v-model="model.dateFieldEvent"
              class="form-control form-control-sm"
              name="date_field_event"
              required="required"
              data-field="dateFieldEvent"
              @change="dateFieldEventChanged"
            >
              <option value="">{{ messages.selectEvent }}</option>
              <option
                v-for="choice in eventChoices"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help">{{ errors.dateFieldEventError }}</div>
          </div>

          <div class="form-group" :class="{ 'has-error': errors.fieldError }">
            <label for="record_date" class="control-label">
              {{ messages.dateFieldLabel }}
            </label>
            <select
              v-model="model.field"
              class="form-control form-control-sm"
              name="record_date"
              required="required"
              data-validate="validateDateEvent"
              data-field="field"
            >
              <option value="">{{ messages.selectDateField }}</option>
              <option
                v-for="choice in dateFieldChoices"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help">{{ errors.fieldError }}</div>
          </div>
          <div class="form-group" :class="{ 'has-error': errors.dateIntervalError }">
            <label for="date_interval" class="control-label">
              {{ messages.dateIntervalLabel }}
            </label>
            <select
              v-model="model.dateInterval"
              class="form-control form-control-sm"
              name="date_interval"
              required="required"
              data-field="dateInterval"
            >
              <option value="">{{ messages.selectInterval }}</option>
              <option
                v-for="choice in dateIntervals"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help">{{ errors.dateIntervalError }}</div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span class="label label-default">
              {{ messages.dataConfigurationHeading }}
            </span>
          </legend>
          <div class="form-group">
            <label for="filter" class="control-label">
              {{ messages.filterLogicLabel }}
              <span class="sub-label">{{ messages.filterLogicSubLabel }}</span>
            </label>
            <textarea
              class="form-control form-control-sm"
              rows="3"
              name="filter"
              data-field="filter"
              v-model.trim="model.filter"
            ></textarea>
            <small>{{ messages.filterLogicExample }}</small>
          </div>

          <div class="form-group" v-if="hasEvents">
            <label for="group_field_event" class="control-label">
              {{ messages.groupingFieldEventLabel }}
            </label>
            <select
              class="form-control form-control-sm"
              name="group_field_event"
              data-field="groupFieldEvent"
              ref="groupFieldEventSelect"
              v-model="model.groupFieldEvent"
              @change="groupFieldEventChanged"
            >
              <option value="">{{ messages.selectEvent }}</option>
              <option
                v-for="choice in eventChoices"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.label }}
              </option>
            </select>
          </div>

          <div class="form-group" :class="{ 'has-error': errors.groupError }">
            <label class="control-label" for="group_field">
              {{ messages.groupingFieldLabel }}
            </label>
            <select
              v-model="model.group"
              class="form-control form-control-sm"
              name="group_field"
              data-validate="validateGroup"
              data-field="group"
              @change="groupFieldChanged"
            >
              <option value="">{{ messages.noGrouping }}</option>
              <option
                v-for="choice in groupFieldChoices"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.label }}
              </option>
            </select>
            <div class="help-block error-help">{{ errors.groupError }}</div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span class="label label-default">{{ messages.targetLabel }}</span>
          </legend>
          <div class="form-group targets" v-if="noGroup">
            <label class="control-label" for="target_count">
              {{ messages.targetCountLabel }}
            </label>
            <input
              type="text"
              class="form-control form-control-sm"
              name="target_count"
              data-validate="validateTargetDate"
              data-field="targets.No Groups"
              v-model.number="model.targets['No Groups']"
            />
          </div>
          <div class="form-group targets" v-else>
            <label>{{ messages.targetCountsLabel }}</label>
            <a
              data-toggle="collapse"
              role="button"
              :href="groupTargetsIdSelector"
              aria-expanded="true"
            >
              {{ messages.actions.hideShow }}
            </a>
            <div class="collapse in" :id="groupTargetsId">
              <div class="well group-targets">
                <div
                  class="form-group form-group-sm"
                  v-for="target in groupTargets"
                  :key="target.name"
                >
                  <label class="control-label" :for="target.name">
                    {{ target.label }}
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-sm col-sm-10"
                    :name="target.name"
                    data-validate="validateTargetDate"
                    v-model.number="model.targets[target.label]"
                  />
                </div>
                <span class="target-total">
                  <em>{{ messages.targetTotal }} {{ targetTotal }}</em>
                </span>
              </div>
            </div>
          </div>
          <div class="form-group" :class="{ 'has-error': errors.endError }">
            <label class="control-label" for="target_date">
              {{ messages.targetEndDateLabel }}
            </label>
            <div class="input-group">
              <input
                ref="targetEndDateInput"
                type="text"
                class="form-control form-control-sm vizr-date"
                name="target_date"
                data-field="end"
                data-v-model="targetEndDate"
                data-validate="validateDate,validateTargetDate"
                v-model="targetEndDate"
                @input="dateFieldChanged"
              />
              <span
                class="input-group-addon input-group-append"
                @click="showDatePicker($refs.targetEndDateInput)"
              >
                <span class="input-group-text"><i class="far fa-calendar-alt"></i></span>
              </span>
            </div>
            <div class="help-block error-help">{{ errors.endError }}</div>
          </div>
        </fieldset>

        <div class="alert alert-danger" role="alert" v-if="hasErrors">
          {{ messages.validation.cannotSave }}
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          name="submit_vizr_form"
          data-toggle="collapse"
          :data-target="idSelector"
          :disabled="submitDisabled"
          aria-expanded="true"
          @click="save"
        >
          {{ messages.actions.save }}
        </button>
        <button
          type="cancel"
          class="btn btn-link"
          data-toggle="collapse"
          :data-target="idSelector"
          aria-expanded="true"
          @click="reset"
        >
          {{ messages.actions.cancel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// provided externally by REDCap; doesn't add anything to the bundle
import $ from 'jquery';

import moment from 'moment';
import striptags from 'striptags';
import debounce from 'lodash/debounce';

import {
  fieldComparator,
  getDateFields,
  getCategoricalFields,
  getChoices
} from '@/data-dictionary';

import {
  defaultTargetsObject,
  targetsObjectWithGroups,
  isoToUserDate,
  userToIsoDate,
  userDateFormat,
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
  validatedInputs: 'input[data-validate],[required]',
  validationError: '.has-error:not(.save-warning)'
};

const messages = {
  actions: {
    cancel: 'Cancel',
    hideShow: 'Hide/Show',
    save: 'Save'
  },
  dataConfigurationHeading: 'Data Configuration',
  dateFieldLabel: 'Date Field',
  dateFieldEventLabel: 'Date Field Event',
  dateIntervalLabel: 'Date Interval',
  descriptionLabel: 'Chart Notes (optional)',
  endDateLabel: 'End Date',
  filterLogicExample: "Example: [screened]='1'",
  filterLogicLabel: 'Filter Logic',
  filterLogicSubLabel:
    '(filter the results returned for the chart based on conditional logic)',
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
  targetCountLabel: 'Target Count',
  targetCountsLabel: 'Target Counts',
  targetEndDateLabel: 'Target End Date',
  targetLabel: 'Target (optional)',
  targetTotal: 'Total: ',
  timeConfigHeading: 'Time Configuration',
  titleLabel: 'Chart Title',
  validation: {
    cannotSave: 'Your chart configuration cannot be saved due to errors.',
    dateEventError: 'An event must be selected before selecting a date field',
    dateFormatError: `Dates must be ${userDateFormat} format.`,
    groupError: 'An event must be selected before selecting a grouping field',
    requiredError: 'Field is required.',
    targetDateError: 'Field is required when there is a target.'
  }
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
        { label: 'Days', value: 'day' },
        { label: 'Weeks', value: 'week' },
        { label: 'Months', value: 'month' },
        { label: 'Years', value: 'year' }
      ],
      isDirty: false,
      model: this.copyModel(chartDef),
      startDate: isoToUserDate(chartDef.start),
      endDate: isoToUserDate(chartDef.chartEnd),
      targetEndDate: isoToUserDate(chartDef.end),
      errors: this.createErrorObject()
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

      // handle old charts where Vue replaces the empty targets object with an array
      if (Array.isArray(chartDef.targets)) {
        const { group } = chartDef;
        model.targets = Object.assign(
          {},
          group ? this.createGroupTargets(group) : defaultTargetsObject()
        );
      } else {
        model.targets = Object.assign({}, chartDef.targets);
      }

      return model;
    },

    /**
     * Recursively strips HTML from string-valued properties of the provided model object.
     * NOTE: This will mutate the input object.
     * @param {Object} model - the object to sanitize
     */
    sanitizeModel(model) {
      Object.keys(model).forEach(key => {
        const value = model[key];
        if (typeof value === 'string') {
          model[key] = striptags(value);
        }

        if (value && typeof value === 'object') {
          this.sanitizeModel(value);
        }
      });
    },

    /**
     * Creates a targets object for the selected group field.
     * @param {String} group - the name of the field to group records by
     */
    createGroupTargets(group) {
      // called before properties are computed, so extract data dictionary manually
      const { metadata } = this;
      const { dataDictionary } = metadata;

      const groupField = dataDictionary.find(field => field.field_name === group);
      const groups = getChoices(groupField).map(choice => choice.label);
      return targetsObjectWithGroups(groups);
    },

    /**
     * Creates an object for storing the component's error state.
     */
    createErrorObject() {
      return {
        chartEndError: '',
        dateFieldEventError: '',
        dateIntervalError: '',
        endError: '',
        fieldError: '',
        groupError: '',
        startError: '',
        titleError: ''
      };
    },

    /**
     * Attaches date pickers to the date inputs.
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
          dateFormat: 'mm/dd/yy',
          onSelect() {
            const inputEvent = new Event('input', {
              bubbles: true,
              cancelable: false
            });
            this.dispatchEvent(inputEvent);
          }
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
     * Resets the model. Used on cancel and when the `chartDef` prop is replaced.
     */
    reset() {
      const { chartDef } = this;
      this.model = this.copyModel(chartDef);
      this.errors = this.createErrorObject();
      this.startDate = isoToUserDate(chartDef.start);
      this.endDate = isoToUserDate(chartDef.chartEnd);
      this.targetEndDate = isoToUserDate(chartDef.end);
      this.isDirty = false;
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
     * Resets the targets when the field used to group records changes.
     */
    groupFieldChanged() {
      const { model } = this;
      const { group } = model;

      if (group === '') {
        model.targets = defaultTargetsObject();
      } else {
        model.targets = this.createGroupTargets(group);
      }
    },

    /**
     * Keeps model in sync with date input values.
     */
    dateFieldChanged(evt) {
      const { target } = evt;
      const { model } = this;

      const field = target.getAttribute('data-field');
      const vModelField = target.getAttribute('data-v-model');

      // set ISO date in the model
      model[field] = userToIsoDate(target.value);

      // manually update the v-model for changes from date picker
      this[vModelField] = target.value;
    },

    /**
     * Validates the form on input and change events. Closely-spaced events are coalesced.
     */
    validateChanges: debounce(function (evt) {
      const { target } = evt;
      this.validateInput(target);
    }, 300),

    /**
     * Validates all the form inputs prior to saving.
     */
    validateForm() {
      const { $el } = this;
      const inputs = $el.querySelectorAll(selector.validatedInputs);
      for (let i = 0; i < inputs.length; i++) {
        this.validateInput(inputs[i]);
      }
    },

    /**
     * Validates the value of an input.
     * @param {Element} el - the element to check
     */
    validateInput(el) {
      // return early if the event didn't have a target
      if (!el) {
        return;
      }

      this.isDirty = true;
      const { errors } = this;
      const errorField = `${el.getAttribute('data-field')}Error`;
      const validations = this.getValidations(el);
      const inputErrors = validations.map(name =>
        typeof this[name] === 'function' ? this[name].call(this, el) : null
      );

      errors[errorField] = inputErrors.filter(Boolean).join(' ');
    },

    /**
     * Gets the list of validation methods that should be run for the given field.
     * @param {Element} el - the input element to validate
     * @return {String[]} an array of validation method names
     */
    getValidations(el) {
      const isRequired = el.hasAttribute('required');
      const hasDataValidations = el.hasAttribute('data-validate');
      const validations = [];

      if (isRequired) {
        validations.push('validateRequiredInput');
      }

      if (hasDataValidations) {
        const validationNames = el.getAttribute('data-validate').split(',');
        validations.push(...validationNames);
      }

      return validations;
    },

    /**
     * Validates that the given element has a value.
     * @param {Element} el - the element to check
     * @return {String} an error message if the input is invalid
     */
    validateRequiredInput(el) {
      return !el.value.trim() ? messages.validation.requiredError : null;
    },

    /**
     * Validates that the value of the given element is a date string.
     * @param {Element} el - the element to check
     * @return {String} an error message if the input is invalid
     */
    validateDate(el) {
      const value = el.value.trim();
      if (value && !moment(value, userDateFormat, true).isValid()) {
        return messages.validation.dateFormatError;
      }
    },

    /**
     * Validates that a date field event is selected if the project is longitudinal and
     * a date field is selected.
     * @param {Element} el - the date field select list
     * @return {String} an error message if the input is invalid
     */
    validateDateEvent(el) {
      const { model } = this;
      const { dateFieldEventSelect } = this.$refs;
      if (el.value && dateFieldEventSelect && !model.dateFieldEvent) {
        return messages.validation.dateEventError;
      }
    },

    /**
     * Validates that start and end dates have been chosen if targets are present.
     * @param {Element} el - a target input or date input
     * @return {String} an error message if the input is invalid
     */
    validateTargetDate(el) {
      const { targets } = this;
      const { startDateInput, targetEndDateInput } = this.$refs;
      const inputName = el.getAttribute('name');

      if (inputName === 'target_count' || inputName.startsWith('group_target')) {
        // count changed, re-validate target dates
        this.validateInput(startDateInput);
        this.validateInput(targetEndDateInput);
      } else {
        // validating date input; check that if target(s) present, dates exist
        const targetValues = Object.values(targets).filter(Number.isFinite);
        if (targetValues.length > 0 && !el.value.trim()) {
          return messages.validation.targetDateError;
        }
      }
    },

    /**
     * Validates that a group field event is selected if the project is longitudinal and
     * a grouping field is selected.
     * @param {Element} el - the grouping field select list
     * @return {String} an error message if the input is invalid
     */
    validateGroup(el) {
      const { model } = this;
      const { groupFieldEventSelect } = this.$refs;
      if (el.value && groupFieldEventSelect && !model.groupFieldEvent) {
        return messages.validation.groupError;
      }
    },

    /**
     * Emits an event with the updated chart configuration.
     * @param {Event} evt - event triggered by the save button
     */
    save(evt) {
      const { model } = this;

      this.validateForm();
      if (this.hasErrors) {
        evt.stopPropagation();
      } else {
        const newModel = this.copyModel(model);
        this.sanitizeModel(newModel);
        this.$emit('save-chart', newModel);
      }
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

    groupTargetsId() {
      const { id } = this;
      return `collapseGroupTargets_${id}`;
    },

    groupTargetsIdSelector() {
      const { groupTargetsId } = this;
      return `#${groupTargetsId}`;
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

    hasGroup() {
      const { model } = this;
      return Boolean(model.group);
    },

    noGroup() {
      const { hasGroup } = this;
      return !hasGroup;
    },

    targets() {
      const { model } = this;
      return model.targets;
    },

    groupTargets() {
      const { targets } = this;
      return Object.keys(targets).map(key => ({
        label: key,
        name: `group_target__${key}`
      }));
    },

    targetTotal() {
      const { targets } = this;
      return Object.keys(targets)
        .filter(key => Number.isFinite(targets[key]))
        .reduce((acc, key) => acc + targets[key], 0);
    },

    errorCount() {
      const { errors } = this;
      return Object.values(errors).filter(Boolean).length;
    },

    hasErrors() {
      const { errorCount } = this;
      return errorCount > 0;
    },

    submitDisabled() {
      const { isDirty, hasErrors } = this;
      return !isDirty || hasErrors;
    }
  },

  watch: {
    /**
     * Watches the `chartDef` prop for changes, indicating that it was replaced by a save.
     */
    chartDef() {
      this.reset();
    }
  }
};
</script>
