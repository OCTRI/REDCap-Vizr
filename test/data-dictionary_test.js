import {
  findField,
  isDateField,
  getDateFields,
  isCategoricalField,
  getCategoricalFields,
  getChoices
} from '../js/data-dictionary';

import exampleDictionary from './example-data-dictionary';

describe('findField', () => {
  it('returns the field if present', () => {
    expect(findField(exampleDictionary, 'screened')).toEqual(exampleDictionary[1]);
  });

  it('returns undefined if the field is not present', () => {
    expect(findField(exampleDictionary, 'nope')).toBeUndefined();
  });
});

describe('isDateField', () => {
  it('returns true for fields with date validation', () => {
    const validationProperty = 'text_validation_type_or_show_slider_number';
    expect(isDateField({[validationProperty]: ""})).toBe(false);
    expect(isDateField({[validationProperty]: "date_mdy"})).toBe(true);
    expect(isDateField({[validationProperty]: "date_mdy"})).toBe(true);
    expect(isDateField({[validationProperty]: "date_something"})).toBe(true);
    expect(isDateField({[validationProperty]: "datetime_dmy"})).toBe(true);
  });
});

describe('getDateFields', () => {
  it('returns fields with date validation', () => {
    const dateFields = [exampleDictionary[2], exampleDictionary[4], 
      exampleDictionary[8], exampleDictionary[9]];
    expect(getDateFields(exampleDictionary)).toEqual(dateFields);
  });
});

describe('getDateFieldsInForm', () => {
  it('returns date fields for the form given', () => {
    const dateFields = [exampleDictionary[8]];
    expect(getDateFields(exampleDictionary, ["survey"])).toEqual(dateFields);
  });
});

describe('isCategoricalField', () => {
  it('returns true for the expected types', () => {
    const testFields = ['radio', 'dropdown', 'truefalse', 'yesno']
      .map(type => ({field_type: type}));

    testFields.forEach(field => {
      expect(isCategoricalField(field)).toBe(true);
    });

    const expectedMapResult = [false, true, false, true, false, true, true, true, false, false ];
    expect(exampleDictionary.map(isCategoricalField)).toEqual(expectedMapResult);
  });
});

describe('getCategoricalFields', () => {
  it('returns only fields with expected types', () => {
    const edd = exampleDictionary;
    const categoricals = [edd[1], edd[3], edd[5], edd[6], edd[7]];
    expect(getCategoricalFields(edd)).toEqual(categoricals);
  });
});

describe('getCategoricalFieldsInForm', () => {
  it('returns only fields with expected types in the forms given', () => {
    const edd = exampleDictionary;
    const categoricals = [edd[6], edd[7]];
    expect(getCategoricalFields(edd, ["survey"])).toEqual(categoricals);
  });
});

describe('getChoices', () => {
  it('returns undefined if type is not categorical', () => {
    expect(getChoices(exampleDictionary[0])).toBeUndefined();
  });

  it('handles radio/dropdown fields', () => {
    const clinicField = exampleDictionary.find(f => f.field_name === 'study_clinic');
    const selectField = exampleDictionary.find(f => f.field_name === 'dropdown');

    const clinicChoices = [
      { label: 'Bend', value: '1' },
      { label: 'Eugene', value: '2' },
      { label: 'Portland', value: '3' }
    ];

    const selectChoices = [
      { label: 'Choice One', value: '1' },
      { label: 'Choice Two', value: '2' },
      { label: 'Choice Three', value: '3' },
      { label: 'Etc.', value: '4'}
    ];

    // radio or select type
    expect(getChoices(clinicField)).toEqual(clinicChoices);
    expect(getChoices(selectField)).toEqual(selectChoices);
  });

  it('handles yesno fields', () => {
    const enrolledField = exampleDictionary.find(f => f.field_name === 'enrolled');
    const yesnoResult = [{label: 'Yes', value: '1'}, {label: 'No', value: '0'}];
    expect(getChoices(enrolledField)).toEqual(yesnoResult);
  });

  it('handles truefalse fields', () => {
    const truefalseField = exampleDictionary.find(f => f.field_name === 'tf');
    const truefalseResult = [{label: 'True', value: '1'}, {label: 'False', value: '0'}];
    expect(getChoices(truefalseField)).toEqual(truefalseResult);
  });
});
