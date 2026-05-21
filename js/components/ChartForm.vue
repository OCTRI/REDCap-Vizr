<template>
  <div ref="formRoot" :id="id" aria-expanded="true" @input="validateChanges" @change="validateChanges">
    <div class="vizr-form-panel panel panel-primary card">
      <div class="panel-heading card-header">
        <strong>{{ messages.heading }}</strong>
        <a
          href="#"
          class="remove-form pull-right float-right"
          role="button"
          data-bs-toggle="collapse"
          :data-bs-target="idSelector"
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
                class="input-group-text"
                @click="showDatePicker(startDateInput)"
              >
                <i class="far fa-calendar-alt"></i>
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
                class="input-group-text"
                @click="showDatePicker(endDateInput)"
              >
                <i class="far fa-calendar-alt"></i>
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
              class="form-control form-control-sm form-select"
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
              class="form-control form-control-sm form-select"
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
              class="form-control form-control-sm form-select"
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
              class="form-control form-control-sm form-select"
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
              class="form-control form-control-sm form-select"
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
              data-bs-toggle="collapse"
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
                class="input-group-text"
                @click="showDatePicker(targetEndDateInput)"
              >
                <i class="far fa-calendar-alt"></i>
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
          data-bs-toggle="collapse"
          :data-bs-target="idSelector"
          :disabled="submitDisabled"
          aria-expanded="true"
          @click="save"
        >
          {{ messages.actions.save }}
        </button>
        <button
          type="cancel"
          class="btn btn-link"
          data-bs-toggle="collapse"
          :data-bs-target="idSelector"
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
</script>

<script setup>
// provided externally by REDCap; doesn't add anything to the bundle
import $ from 'jquery';

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
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

const props = defineProps({
  chartDef: Object,
  metadata: Object
});

const emit = defineEmits(['save-chart']);

// Template refs
const formRoot = ref(null);
const startDateInput = ref(null);
const endDateInput = ref(null);
const targetEndDateInput = ref(null);
const dateFieldEventSelect = ref(null);
const groupFieldEventSelect = ref(null);

// Reactive state
const dateIntervals = [
  { label: 'Days', value: 'day' },
  { label: 'Weeks', value: 'week' },
  { label: 'Months', value: 'month' },
  { label: 'Years', value: 'year' }
];

const isDirty = ref(false);
const model = ref(copyModel(props.chartDef));
const startDate = ref(isoToUserDate(props.chartDef.start));
const endDate = ref(isoToUserDate(props.chartDef.chartEnd));
const targetEndDate = ref(isoToUserDate(props.chartDef.end));
const errors = ref(createErrorObject());

// Debounced validate
const validateChanges = debounce(function (evt) {
  const { target } = evt;
  validateInput(target);
}, 300);

onMounted(() => {
  attachDatePickers();
});

onBeforeUnmount(() => {
  destroyDatePickers();
});

watch(
  () => props.chartDef,
  () => reset()
);

/**
 * Constructs a copy of the chartDef object.
 */
function copyModel(chartDef) {
  const modelCopy = Object.assign({}, chartDef);

  // handle old charts where Vue replaces the empty targets object with an array
  if (Array.isArray(chartDef.targets)) {
    const { group } = chartDef;
    modelCopy.targets = Object.assign(
      {},
      group ? createGroupTargets(group) : defaultTargetsObject()
    );
  } else {
    modelCopy.targets = Object.assign({}, chartDef.targets);
  }

  return modelCopy;
}

/**
 * Recursively strips HTML from string-valued properties of the provided model object.
 * NOTE: This will mutate the input object.
 */
function sanitizeModel(modelObj) {
  Object.keys(modelObj).forEach(key => {
    const value = modelObj[key];
    if (typeof value === 'string') {
      modelObj[key] = striptags(value);
    }

    if (value && typeof value === 'object') {
      sanitizeModel(value);
    }
  });
}

/**
 * Creates a targets object for the selected group field.
 */
function createGroupTargets(group) {
  const { metadata } = props;
  const { dataDictionary } = metadata;

  const groupField = dataDictionary.find(field => field.field_name === group);
  const groups = getChoices(groupField).map(choice => choice.label);
  return targetsObjectWithGroups(groups);
}

/**
 * Creates an object for storing the component's error state.
 */
function createErrorObject() {
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
}

/**
 * Attaches date pickers to the date inputs.
 */
function attachDatePickers() {
  const el = formRoot.value;
  if (hasDatePickers.value && el) {
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

    $(el).find('input.vizr-date').datepicker(pickerConfig);
  }
}

/**
 * Destroys date pickers attached to the date inputs.
 */
function destroyDatePickers() {
  const el = formRoot.value;
  if (hasDatePickers.value && el) {
    $(el).find('input.vizr-date').datepicker('destroy');
  }
}

/**
 * Opens the date picker for the given element.
 */
function showDatePicker(element) {
  if (hasDatePickers.value) {
    $(element).datepicker('show');
  }
}

/**
 * Resets the model. Used on cancel and when the `chartDef` prop is replaced.
 */
function reset() {
  const { chartDef } = props;
  model.value = copyModel(chartDef);
  errors.value = createErrorObject();
  startDate.value = isoToUserDate(chartDef.start);
  endDate.value = isoToUserDate(chartDef.chartEnd);
  targetEndDate.value = isoToUserDate(chartDef.end);
  isDirty.value = false;
}

/**
 * Clears the date field selection when the date field event changes.
 */
function dateFieldEventChanged() {
  model.value.field = '';
}

/**
 * Clears the grouping field selection when the grouping field event changes.
 */
function groupFieldEventChanged() {
  model.value.group = '';
}

/**
 * Resets the targets when the field used to group records changes.
 */
function groupFieldChanged() {
  const { group } = model.value;

  if (group === '') {
    model.value.targets = defaultTargetsObject();
  } else {
    model.value.targets = createGroupTargets(group);
  }
}

/**
 * Keeps model in sync with date input values.
 */
function dateFieldChanged(evt) {
  const { target } = evt;

  const field = target.getAttribute('data-field');
  const vModelField = target.getAttribute('data-v-model');

  // set ISO date in the model
  model.value[field] = userToIsoDate(target.value);

  // manually update the v-model for changes from date picker
  const dateFieldMap = { startDate, endDate, targetEndDate };
  if (dateFieldMap[vModelField]) {
    dateFieldMap[vModelField].value = target.value;
  }
}

/**
 * Validates all the form inputs prior to saving.
 */
function validateForm() {
  const el = formRoot.value;
  if (!el) return;
  const inputs = el.querySelectorAll(selector.validatedInputs);
  for (let i = 0; i < inputs.length; i++) {
    validateInput(inputs[i]);
  }
}

/**
 * Validates the value of an input.
 */
function validateInput(el) {
  // return early if the event didn't have a target
  if (!el) {
    return;
  }

  isDirty.value = true;
  const errorsObj = errors.value;
  const errorField = `${el.getAttribute('data-field')}Error`;
  const validations = getValidations(el);
  const validationFns = { validateRequiredInput, validateDate, validateDateEvent, validateTargetDate, validateGroup };
  const inputErrors = validations.map(name =>
    typeof validationFns[name] === 'function' ? validationFns[name](el) : null
  );

  errorsObj[errorField] = inputErrors.filter(Boolean).join(' ');
}

/**
 * Gets the list of validation methods that should be run for the given field.
 */
function getValidations(el) {
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
}

/**
 * Validates that the given element has a value.
 */
function validateRequiredInput(el) {
  return !el.value.trim() ? messages.validation.requiredError : null;
}

/**
 * Validates that the value of the given element is a date string.
 */
function validateDate(el) {
  const value = el.value.trim();
  if (value && !moment(value, userDateFormat, true).isValid()) {
    return messages.validation.dateFormatError;
  }
}

/**
 * Validates that a date field event is selected if the project is longitudinal and
 * a date field is selected.
 */
function validateDateEvent(el) {
  if (el.value && dateFieldEventSelect.value && !model.value.dateFieldEvent) {
    return messages.validation.dateEventError;
  }
}

/**
 * Validates that start and end dates have been chosen if targets are present.
 */
function validateTargetDate(el) {
  const targetsObj = targets.value;
  const inputName = el.getAttribute('name');

  if (inputName === 'target_count' || inputName.startsWith('group_target')) {
    // count changed, re-validate target dates
    validateInput(startDateInput.value);
    validateInput(targetEndDateInput.value);
  } else {
    // validating date input; check that if target(s) present, dates exist
    const targetValues = Object.values(targetsObj).filter(Number.isFinite);
    if (targetValues.length > 0 && !el.value.trim()) {
      return messages.validation.targetDateError;
    }
  }
}

/**
 * Validates that a group field event is selected if the project is longitudinal and
 * a grouping field is selected.
 */
function validateGroup(el) {
  if (el.value && groupFieldEventSelect.value && !model.value.groupFieldEvent) {
    return messages.validation.groupError;
  }
}

/**
 * Emits an event with the updated chart configuration.
 */
function save(evt) {
  validateForm();
  if (hasErrors.value) {
    evt.stopPropagation();
  } else {
    const newModel = copyModel(model.value);
    sanitizeModel(newModel);
    emit('save-chart', newModel);
  }
}

// Computed
const id = computed(() => `form-${props.chartDef.id}`);

const idSelector = computed(() => `#${id.value}`);

const groupTargetsId = computed(() => `collapseGroupTargets_${id.value}`);

const groupTargetsIdSelector = computed(() => `#${groupTargetsId.value}`);

const dataDictionary = computed(() => props.metadata.dataDictionary);

const events = computed(() => props.metadata.events);

const eventNames = computed(() => (events.value ? Object.keys(events.value) : []));

const hasEvents = computed(() => eventNames.value.length > 0);

const hasDatePickers = computed(
  () => Boolean(window.$ && window.$.fn && window.$.fn.datepicker)
);

const eventChoices = computed(() =>
  eventNames.value.map(name => ({ label: name, value: name }))
);

const dateForms = computed(() => {
  const { dateFieldEvent } = model.value;
  return hasEvents.value ? events.value[dateFieldEvent] : null;
});

const dateFieldChoices = computed(() =>
  getDateFields(dataDictionary.value, dateForms.value)
    .sort(fieldComparator)
    .map(f => ({ label: fieldLabel(f), value: f.field_name }))
);

const groupForms = computed(() => {
  const { groupFieldEvent } = model.value;
  return hasEvents.value ? events.value[groupFieldEvent] : null;
});

const groupFieldChoices = computed(() =>
  getCategoricalFields(dataDictionary.value, groupForms.value)
    .sort(fieldComparator)
    .map(f => ({ label: fieldLabel(f), value: f.field_name }))
);

const hasGroup = computed(() => Boolean(model.value.group));

const noGroup = computed(() => !hasGroup.value);

const targets = computed(() => model.value.targets);

const groupTargets = computed(() =>
  Object.keys(targets.value).map(key => ({
    label: key,
    name: `group_target__${key}`
  }))
);

const targetTotal = computed(() =>
  Object.keys(targets.value)
    .filter(key => Number.isFinite(targets.value[key]))
    .reduce((acc, key) => acc + targets.value[key], 0)
);

const errorCount = computed(() => Object.values(errors.value).filter(Boolean).length);

const hasErrors = computed(() => errorCount.value > 0);

const submitDisabled = computed(() => !isDirty.value || hasErrors.value);

defineExpose({ isDirty, model, errors, sanitizeModel, copyModel, validateInput });
</script>
