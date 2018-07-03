import {
  isoToUserDate,
  title,
  newChartDefinition,
  userToIsoDate,
  fieldLabel
} from '@/util';

import exampleDictionary from './example-data-dictionary';

describe('title', () => {
  it('should convert an underscore string to title case', () => {
    expect(title('study_clinic')).toBe("Study Clinic");
    expect(title('studyClinic')).toBe("StudyClinic");
    expect(title('study clinic')).toBe("Study Clinic");
  });
});

describe('newChartDefinition', () => {
  const model = newChartDefinition();

  it('creates an object with the expected properties', () => {
    const fields = ['field', 'filter', 'group', 'id', 'title', 'start', 'end', 'targets'];
    fields.forEach(field => {
      expect(model[field]).toBeDefined();
    });
  });

  it('populates the ID', () => {
    expect(typeof model.id).toEqual('string');
    expect(model.id.length).toBeGreaterThan(0);
  });
});

describe('isToUserDate', () => {
  it('converts a datestring to userDateFormat', () => {
    expect(isoToUserDate('2018-01-23')).toEqual('01/23/2018');
  });

  it('converts unknown values to blanks', () => {
    expect(isoToUserDate('201818-01-23')).toEqual('');
  });
});

describe('userToIsoDate', () => {
  it('converts a datestring to isoDateFormat', () => {
    expect(userToIsoDate('01/23/2018')).toEqual('2018-01-23');
  });

  it('converts unknown values to blanks', () => {
    expect(userToIsoDate('201818/01/23')).toEqual('');
  });
});

describe('fieldLabel', () => {
  it('displays the field name followed by the field label', () => {
    exampleDictionary.forEach(field => {
      expect(fieldLabel(field)).toEqual(`${field.field_name} (${field.field_label})`);
    });
  });
});
