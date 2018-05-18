/**
 * Provides an object for populating the chart-form-template.
 */

import {
  fieldComparator,
  getDateFields,
  getCategoricalFields,
  getChoices
} from './data-dictionary';

import {
  isoToUserDate,
  userToIsoDate
} from './util';

/**
 * Creates an Object that can be used to render a select option.
 * @return {Object} choice used in a select pulldown.
 */
function choice(label, value, selectedValue) {
  return {
    label: label,
    value: value,
    selected: value === selectedValue
  };
}

/**
 * Label displayed to end users for a dataDictionary field.
 * @param {Field} field - dataDictionary entry.
 * @return String to display to user
 */
function fieldLabel(f) {
  return `${f.field_name} (${f.field_label})`;
}

/**
 * Constructs a copy of the chartDef object.
 * @param {ChartDefinition} model - object to be copied
 * @return {ChartDefinition} new Object.
 */
function modelCopy(model) {
  let newModel = Object.assign({}, model);
  newModel.targets = Object.assign({}, model.targets);
  return newModel;
}

/**
 * ChartForm acts as a View Model, calculating all the properties needed for
 * display in the chart-form-template.
 */
export function ChartForm(metadata, model, onSave) {
  this.dataDictionary = metadata.dataDictionary;
  this.events = metadata.events;

  this._savedModel = modelCopy(model); // used to reset form
  this.model = modelCopy(model);
  this.onSave = onSave;

  this._eventNames = this.events ? Object.keys(this.events) : [];
  this._hasEvents = this._eventNames.length > 0;

  this.dateIntervals = [
    {label:'Days', value:'day'},
    {label:'Weeks', value:'week'},
    {label: 'Months', value: 'month'},
    {label:'Years', value:'year'}
  ];
}

// Save the model and pass it to the provided onSave function.
ChartForm.prototype.save = function () {
  this._savedModel = modelCopy(this.model);
  let copy = modelCopy(this.model);
  if (this.onSave) {
    this.onSave(copy);
  }
};

// Revert model to its previously saved state.
ChartForm.prototype.reset = function () {
  this.model = modelCopy(this._savedModel);
};

/**
 * Special handling for coercing the given value to the provided type.
 */
function coerce(value, type) {
  switch(type) {
    case "date":
      return userToIsoDate(value);
    case "int": {
      let n = Number.parseInt(value, 10);
      return isNaN(n) ? null : n;
    }
    default:
      return value;
  }
}

/**
 * Sets a model field to the given value.
 */
ChartForm.prototype.setField = function(fieldName, value, type) {
  let newVal = coerce(value, type);
  let path = fieldName.split("."); // allow for nested objects; ex. target.Yes

  let currentObj = this.model;

  // navigate to the correct object
  for (var i = 0; i < path.length - 1; i++) {
    let item = path[i];
    if (!currentObj[item]) {
      currentObj[item] = {};
    }
    currentObj = currentObj[item];
  }

  currentObj[path[path.length - 1]] = newVal;
};

// @calculated from _eventNames
ChartForm.prototype.dateFieldEventChoices = function () {
  return this._eventNames.map(e => choice(e, e, this.model.dateFieldEvent));
};

// @calculated from model.dateEventField
ChartForm.prototype.dateForms = function () {
  return this._hasEvents ? this.events[this.model.dateFieldEvent] : null;
};

// @calculated from dateForms
ChartForm.prototype.dateFieldChoices = function () {
  return getDateFields(this.dataDictionary, this.dateForms())
      .sort(fieldComparator)
      .map(f => choice(fieldLabel(f), f.field_name, this.model.field));
};

// @calculated from _eventNames
ChartForm.prototype.groupFieldEventChoices = function() {
  return this._eventNames.map(e => choice(e, e, this.model.groupFieldEvent));
};

// @calculated from model.groupEventField
ChartForm.prototype.groupForms = function () {
  return this._hasEvents ? this.events[this.model.groupFieldEvent] : null;
};

// @calculated from groupForms
ChartForm.prototype.groupFieldChoices = function() {
  return getCategoricalFields(this.dataDictionary, this.groupForms())
    .sort(fieldComparator)
    .map(f => choice(fieldLabel(f), f.field_name, this.model.group));
};

// @calculated from model.group
ChartForm.prototype.hasGroup = function() {
  return !this.noGroup();
};

// @calculated from model.group
ChartForm.prototype.noGroup = function() {
  return this.model.group === '' || this.model.group === null || this.model.group === undefined;
};

// @calculated from model.targets
ChartForm.prototype.targetTotal = function() {
  const targets = this.model.targets;
  if (targets && Object.keys(targets).length > 0) {
    return Object.keys(targets).reduce((acc, key) => acc + targets[key], 0);
  } else {
    return null;
  }
};

// @calculated from model.targets,model.group
ChartForm.prototype.groupTargetInputs = function() {
  const targets = this.model.targets || {};
  const currentGroup = this.model.group;
  let groupNames = [];

  if (currentGroup) {
    const groupField = this.dataDictionary.find(field => field.field_name === currentGroup);
    if (groupField) {
      groupNames = getChoices(groupField).map(c => c.label);
    }
  }

  return groupNames.map(group => {
    return {
      label: group,
      name: group.replace(/\s/g, "_"),
      value: targets[group] !== undefined ? targets[group] : ''
    };
  });
};

// @calculated
ChartForm.prototype.view = function() {
  return {
    formId: this.model.id,
    title: this.model.title,
    description: this.model.description,
    startDate: isoToUserDate(this.model.start),
    endDate: isoToUserDate(this.model.chartEnd),
    hasEvents: this._hasEvents,
    dateFieldEvents: this.dateFieldEventChoices(),
    dateFields: this.dateFieldChoices(),
    dateIntervals: this.dateIntervals.map(interval => choice(interval.label, interval.value, this.model.dateInterval)),
    filter: this.model.filter,
    groupFieldEvents: this.groupFieldEventChoices(),
    groups: this.groupFieldChoices(),
    noGroup: this.noGroup(),
    hasGroup: this.hasGroup(),
    target: this.targetTotal(),
    targetDate: isoToUserDate(this.model.end),
    groupTargets: this.groupTargetInputs(),
    submitDisabled: true
  };
};
