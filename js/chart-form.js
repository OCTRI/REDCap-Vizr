import $ from 'jquery';
import moment from 'moment';
import Mustache from 'mustache';
import striptags from 'striptags';

import {
  formTemplate,
  optionPartial,
  dateFieldOptionsPartial,
  groupOptionsPartial,
  targetsPartial,
  targetTotalPartial
} from './chart-form-template';

import { ChartForm } from './chart-form-view';
const userDateFormat = 'MM/DD/YYYY';

const messages = {
  pickerConfig: {
    buttonText: 'Click to select a date'
  },
  validation: {
    dateEventError: 'An event must be selected before selecting a date field',
    dateFormatError: `Dates must be ${userDateFormat} format.`,
    groupError: 'An event must be selected before selecting a grouping field',
    requiredError: 'Field is required.',
    targetDateError: 'Field is required when there is a target.'
  }
};

export const selector = {
  titleField: 'input[name=chart_title]',
  descriptionField: 'input[name=chart_description]',
  startDateField: 'input[name=start_date]',
  dateFieldEventSelect: 'select[name=date_field_event]',
  dateFieldSelect: 'select[name=record_date]',
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

/**
 * Captures references to the inputs in the form elements.
 *
 * @param {jQuery} element - jQuery element object containing the form inputs
 *
 * @return {Object} an object containing references to the form inputs
 */
function captureFormInputs(element) {
  let form = { self: element };
  Object.keys(selector).forEach(k => {
    form[k] = element.find(selector[k]);
  });
  return form;
}

/**
 * Resets the view and re-renders
 * @param {jQuery} element - form element
 * @param {ChartForm} chartForm
 */
function reset(element, chartForm) {
  chartForm.reset();

  let newElement = chartFormElement(chartForm);
  // NOTE: That references will not be updated
  // element.replaceWith(newElement);
  element.html(newElement.html());

  attachDatePickers(element);
  attachEventHandlers(element, chartForm);
}

/**
 * Gets the names of functions to run against an input.
 *
 * @param {jQuery} input - the element to possibly validate.
 *
 * @return {String[]} a possibly empty array of error function names
 */
function getErrorFunctions(input) {
  const functions = [];

  if (input.prop('required')) {
    functions.push('requiredErrors');
  }

  const validationMetadata = input.data('validate');
  if (validationMetadata) {
    functions.push(
      ...validationMetadata.split(',').map(name => `${name}Errors`)
    );
  }

  return functions;
}

/**
 * Displays validation errors / classes for an input.
 *
 * @param {jQuery} input - input with validation errors
 * @param {String} errorText - error messages to display
 */
function displayValidationErrors(input, errorText) {
  const formGroup = input.closest('.form-group');
  formGroup.addClass('has-error');
  formGroup.find('.help-block.error-help').text(errorText);
}

/**
 * Clears validation error messages / classes for an input.
 *
 * @param {jQuery} input - the input that previously had error messages
 */
function clearValidationErrors(input) {
  const formGroup = input.closest('.form-group');
  formGroup.find('.help-block.error-help').text('');
  formGroup.removeClass('has-error');
}

/**
 * Updates error message state related to an input. If any errors are present, they will
 * be displayed; if no errors are present, existing messages are cleared.
 *
 * @param {jQuery} input - the input to update errors for
 * @param {String[]} errors - array of error messages for the input, empty for no errors
 */
function updateValidationErrors(input, errors) {
  if (errors.length) {
    displayValidationErrors(input, errors.join(' '));
  } else {
    clearValidationErrors(input);
  }
}

/**
 * Enables or disables the save button, depending on whether any inputs have errors.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`
 */
function updateSaveButtonState(form) {
  const errorGroups = form.titleField
    .closest('.vizr-form-panel')
    .find('.has-error');
  if (errorGroups.length > 0) {
    form.saveButton.prop('disabled', true);
  } else {
    form.saveButton.removeProp('disabled');
  }
}

/**
 * Produces errors for fields with the `required` attribute that do not have a value.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`. Ignored.
 * @param {jQuery} input - the input being validated
 *
 * @return {String} an error string if the input does not have a value, otherwise null
 */
function requiredErrors(form, input) {
  if (input.prop('required')) {
    return !input.val() ? messages.validation.requiredError : null;
  }

  return null;
}

/**
 * Produces errors for date fields when their values are not in the expected format.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`. Ignored.
 * @param {jQuery} input - the input being validated
 *
 * @return {String} an error string if the string in the input is not a valid date,
 *   otherwise null
 */
function dateErrors(form, input) {
  const value = input.val();
  if (value && !moment(value, userDateFormat, true).isValid()) {
    return messages.validation.dateFormatError;
  }

  return null;
}

/**
 * Produces errors for date fields used to calculate the trend line. These must be present
 * if the target count is set.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`.
 * @param {jQuery} input - the input being validated
 *
 * @return {String} an error string if the input is invalid, otherwise null
 */
function targetDateErrors(form, input) {
  if (
    input.attr('name') === 'target_count' ||
    input.attr('name').startsWith('group_target')
  ) {
    // count changed, re-validate target dates
    form.startDateField.trigger('input');
    form.targetDateField.trigger('input');
  } else {
    // Validating date input; check that if target(s) present, dates exist.
    // NOTE that we can't use the capturedInputs in the form object since
    // target fields may have changed.
    let groupTargetsNotEmpty =
      form.self.find(selector.groupTargetFields).filter(function() {
        return $(this).val() && $(this).val() > 0;
      }).length > 0;
    let targetCountField = form.self.find(selector.targetCountField);
    let totalCountNotEmpty =
      targetCountField.val() && targetCountField.val() > 0;

    if ((totalCountNotEmpty || groupTargetsNotEmpty) && !input.val()) {
      return messages.validation.targetDateError;
    }
  }

  return null;
}

/**
 * Validates when setting the group that the group event has also been selected
 * if it needs to be
 *
 * @param {Object} form - form object as returned from `captureFormInputs`.
 * @param {jQuery} input - the input for the group field
 *
 * @return {String} an error string if the input is invalid, otherwise null
 */
function groupErrors(form, input) {
  if (
    formFieldExists(form, 'groupFieldEventSelect') &&
    !form.groupFieldEventSelect.val() &&
    input.val()
  ) {
    return messages.validation.groupError;
  }

  return null;
}

/**
 * Validates when setting the date field that the date event has also been selected if the
 * project is longitudinal.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`.
 * @param {jQuery} input - the input for the date field
 *
 * @return {String} an error string if the input is invalid, otherwise null
 */
function dateEventErrors(form, input) {
  if (
    formFieldExists(form, 'dateFieldEventSelect') &&
    !form.dateFieldEventSelect.val() &&
    input.val()
  ) {
    return messages.validation.dateEventError;
  }

  return null;
}

/**
 * Helper function to determine if the form field exists
 */
function formFieldExists(form, field) {
  // Check length too - this is a requirement of some tests
  return form[field] && form[field].length > 0;
}

/**
 * Gets an input's error messages.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`
 * @param {jQuery} input - the input being validated
 *
 * @return {String[]} a possibly empty array of validation error messages
 */
function inputErrors(form, input) {
  const allErrorFunctions = {
    requiredErrors,
    targetDateErrors,
    dateErrors,
    dateEventErrors,
    groupErrors
  };

  const functions = getErrorFunctions(input);
  return functions
    .map(name => {
      return allErrorFunctions[name]
        ? allErrorFunctions[name].call(null, form, input)
        : null;
    })
    .filter(result => typeof result === 'string');
}

/**
 * Runs validation functions against an input.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`
 * @param {jQuery} input - the input being validated
 */
function runValidation(form, input) {
  const validationErrors = inputErrors(form, input);
  // update DOM state
  updateValidationErrors(input, validationErrors);
  updateSaveButtonState(form);
}

/**
 * Runs validation on every input in the form.
 *
 * @param {Object} form - form object as returned from `captureFormInputs`
 */
function validateForm(form) {
  $(form.self)
    .find(selector.validatedInputs)
    .each(function() {
      runValidation(form, $(this));
    });
}

/**
 * Attach date pickers to the start date and target date inputs.
 *
 * @param {jQuery} form - jQuery element object containing the form
 */
function attachDatePickers(form) {
  // match the config used by REDCap
  const pickerConfig = {
    buttonText: messages.pickerConfig.buttonText,
    yearRange: '-100:+10',
    changeMonth: true,
    changeYear: true,
    dateFormat: 'mm/dd/yy'
  };

  form.find('input.vizr-date').datepicker(pickerConfig);
}

/**
 * @param {jQuery} element - element to be updated
 * @param {Object} item - item with content and selector attributes.
 */
function update(element, item) {
  $(element)
    .find(item.selector)
    .html(item.content);
}

/**
 * Updates the model and provides content to re-render the targets.
 * @param {ChartForm} chartForm
 * @return {Object} update content.
 */
function refreshTargets(chartForm) {
  chartForm.setField('targets', {});
  let newTargets = Mustache.render(targetsPartial,
    { groupTargets: chartForm.groupTargetInputs(),
      target: chartForm.targetTotal(),
      noGroup: chartForm.noGroup(),
      hasGroup: chartForm.hasGroup() },
    { targetTotal: targetTotalPartial }
  );
  return { content: newTargets, selector: selector.targetsDiv };
}

/**
 * Updates the model and provides content to re-render the targets.
 * @param {ChartForm} chartForm
 * @return {Object} update content.
 */
function refreshTargetTotal(chartForm) {

  let newTargetTotal = Mustache.render(targetTotalPartial,
    { target: chartForm.targetTotal() }
  );
  return { content: newTargetTotal, selector: selector.targetTotalSpan };
}

/**
 * Updates the model and provides content to re-render the group pulldown.
 * @param {ChartForm} chartForm
 * @return {Object} update content.
 */
function refreshGroupField(chartForm) {
  chartForm.setField('group', '');
  let newGroupOptions = Mustache.render(
    groupOptionsPartial,
    { groups: chartForm.groupFieldChoices() },
    { option: optionPartial }
  );
  return { content: newGroupOptions, selector: selector.groupingFieldSelect };
}

/**
 * Updates the model provides content to re-render the date field pulldown.
 * @param {ChartForm} chartForm
 * @return {Object} update content.
 */
function refreshDateField(chartForm) {
  chartForm.setField('field', '');
  let newDateOptions = Mustache.render(
    dateFieldOptionsPartial,
    { dateFields: chartForm.dateFieldChoices() },
    { option: optionPartial }
  );
  return { content: newDateOptions, selector: selector.dateFieldSelect };
}

/**
 * Attaches event handlers to the inputs in the form element.
 *
 * @param {jQuery} element - jQuery element object
 * @param {ChartForm} chartForm
 *
 * @return {Object} the form element
 */
function attachEventHandlers(element, chartForm) {
  // capture form fields
  const form = captureFormInputs(element);

  // Update model/view when inputs change
  element.on('input change', evt => {
    const input = $(evt.target);
    const fieldName = input.attr('data-field');

    if (fieldName) {
      // Update the model.
      chartForm.setField(fieldName, striptags(input.val()), input.attr('data-type'));
    }

    // Handle dependent fields
    switch (input.prop('name')) {
      case 'date_field_event': {
        // Date event changed. Reset the options for date field.
        update(element, refreshDateField(chartForm));
        runValidation(form, form.self.find(selector.dateFieldSelect));
        break;
      }
      case 'group_field_event': {
        // Group event changed. Reset the options for group field.
        update(element, refreshGroupField(chartForm));
        update(element, refreshTargets(chartForm));
        break;
      }
      case 'group_field': {
        // Update Targets
        update(element, refreshTargets(chartForm));
        break;
      }
    }

    if (input.prop('name').startsWith('group_target')) {
      update(element, refreshTargetTotal(chartForm));
    }

    runValidation(form, input);
  });

  // Clicking Save or Cancel will also collapse the form when clicked. This is not done explicitly
  // here to avoid test dependencies on Bootstrap. See chartFormElement() for that logic.

  form.saveButton.on('click', evt => {
    evt.preventDefault();
    validateForm(form);

    if (!form.saveButton.prop('disabled')) {
      chartForm.save();
    }
  });

  form.cancelButton.on('click', evt => {
    evt.preventDefault();
    reset(element, chartForm);
  });

  form.headerCancel.on('click', evt => {
    evt.preventDefault();
    reset(element, chartForm);
  });

  return element;
}

/**
 * @param {ChartForm} chartForm ; view layer
 * @return {jQuery} rendered element
 */
function chartFormElement(chartForm) {
  return $(
    Mustache.render(formTemplate, chartForm.view(), {
      option: optionPartial,
      dateFieldOptions: dateFieldOptionsPartial,
      groupOptions: groupOptionsPartial,
      targets: targetsPartial,
      targetTotal: targetTotalPartial
    })
  );
}
/**
 * Creates a chart configuration form for insertion in the DOM.
 *
 * @param {Object} metadata
 * @param {Object[]} metadata.dataDictionary - array of field definition objects
 * @param {Object} metadata.events - the event/form mapping or null if not longitudinal
 * @param {Object} model - chart definition
 * @param {Function} onSave - function to call to save updated configuration; updated model
 *   is passed to the function
 *
 * @return {jQuery} jQuery element object for the chart configuration form
 */
export function chartForm(metadata, model, onSave) {
  let chartForm = new ChartForm(metadata, model, onSave);
  let element = chartFormElement(chartForm);

  attachDatePickers(element);
  return attachEventHandlers(element, chartForm);
}
