/**
 * Finds a field definition by name.
 *
 * @param {Object[]} dataDictionary - array of field definition objects
 * @param {String} fieldName - name of the field to find
 *
 * @return {Object} the definition of the field with the given name if present,
 *   undefined otherwise
 */
export function findField(dataDictionary, fieldName) {
  return dataDictionary.find(field => field.field_name === fieldName);
}

/**
 * Reports whether a field definition represents a date field.
 *
 * @param {Object} field - a field definition object
 *
 * @return {Boolean} true if the field has date validation, false otherwise
 */
export function isDateField(field) {
  const validationProperty = 'text_validation_type_or_show_slider_number';
  const datePrefix = 'date_';
  const datetimePrefix = 'datetime_';
  const fieldValidation = field[validationProperty];
  return Boolean(
    fieldValidation &&
      (fieldValidation.startsWith(datePrefix) ||
        fieldValidation.startsWith(datetimePrefix))
  );
}

/**
 * Reports whether a field definition represents a date field collected
 * in one of the forms given. If forms is null, all date
 * fields are returned.
 *
 * @param {Object} field - a field definition object
 * @param {String[]} forms - array of forms to filter on or null if it doesn't matter
 *
 * @return {Boolean} true if the field has date validation, false otherwise
 */
function isDateFieldInForms(field, forms) {
  return isDateField(field) && (!forms || forms.indexOf(field.form_name) !== -1);
}

/**
 * Gets date fields in the given data dictionary and forms.
 *
 * @param {Object[]} dataDictionary - an array of field definitions
 * @param {String[]} forms - array of forms to filter on or null if it doesn't matter
 *
 * @return {Object[]} an array containing date fields in the forms given
 */
export function getDateFields(dataDictionary = [], forms = null) {
  return dataDictionary.filter(f => isDateFieldInForms(f, forms));
}

/**
 * Reports whether a field definition represents a categorical field.
 *
 * @param {Object} field - a field definition object
 *
 * @return {Boolean} true if the field is of type `radio`, `dropdown`, `truefalse`, or
 *   `yesno`, otherwise false
 */
export function isCategoricalField(field) {
  const categoricalTypes = ['radio', 'dropdown', 'truefalse', 'yesno'];
  return categoricalTypes.includes(field.field_type);
}

/**
 * Reports whether a field definition represents a categorical field collected
 * in one of the forms given. If forms is null, all categorical
 * fields are returned.
 *
 * @param {Object} field - a field definition object
 * @param {String[]} forms - array of forms to filter on or null if it doesn't matter
 *
 * @return {Boolean} true if the field is of type `radio`, `dropdown`, `truefalse`, or
 *   `yesno` and is collected in the given forms, otherwise false
 */
function isCategoricalFieldInForms(field, forms) {
  return isCategoricalField(field) && (!forms || forms.indexOf(field.form_name) !== -1);
}

/**
 * Gets categorical fields in the given data dictionary and forms.
 *
 * @param {Object[]} dataDictionary - an array of field definitions
 * @param {String[]} forms - array of forms to filter on or null if it doesn't matter
 *
 * @return {Object[]} an array containing only the categorical fields -- type 'radio',
 *   'dropdown', 'truefalse', and 'yesno' in the given forms.
 */
export function getCategoricalFields(dataDictionary = [], forms = null) {
  return dataDictionary.filter(f => isCategoricalFieldInForms(f, forms));
}

/**
 * Parses choices for radio button and dropdown fields.
 *
 * @param {String} str - option string as stored in a field object's
 *   `select_choices_or_calculations` property, e.g. "1, Bend | 2, Eugene | 3, Portland"
 *
 * @return {Object[]} an array of label/value pairs
 */
function parseChoices(str = '') {
  return str
    .split('|')
    .map(str => str.trim().split(', '))
    .map(pair => ({ label: pair[1], value: pair[0] }));
}

/**
 * Gets value choices defined for the field.
 *
 * @param {Object} field - a field definition object
 *
 * @return {Object[]} an array of label/value pairs if the field type is categorical,
 *   undefined otherwise
 */
export function getChoices(field) {
  if (isCategoricalField(field)) {
    switch (field.field_type) {
      case 'radio':
      case 'dropdown':
        return parseChoices(field.select_choices_or_calculations);
      case 'truefalse':
        return [
          { label: 'True', value: '1' },
          { label: 'False', value: '0' }
        ];
      case 'yesno':
        return [
          { label: 'Yes', value: '1' },
          { label: 'No', value: '0' }
        ];
      default:
        // should never get here
        throw new Error(`Unhandled categorical field type "${field.field_type}"`);
    }
  }

  return undefined;
}

/**
 * Compares data dictionary field definition objects by their field label.
 *
 * @param {Object} a - field definition object
 * @param {Object} b - field definition object
 *
 * @return -1 if a's label should sort before b's label; 1 if a's label should sort after
 *   b's label; 0 if the labels are equal
 */
export function fieldComparator(a, b) {
  if (a.field_label < b.field_label) {
    return -1;
  } else if (a.field_label > b.field_label) {
    return 1;
  } else {
    return 0;
  }
}
