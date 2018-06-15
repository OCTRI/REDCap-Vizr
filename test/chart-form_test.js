import $ from 'jquery';

import { newChartDefinition } from '../js/util';
import { exampleMetadata, exampleLongitudinalMetadata } from './example-metadata';
import { exampleChartDef, exampleLongitudinalChartDef } from './example-chart-def';

import { chartForm, selector } from '../js/chart-form';

import { noGroupsLabel } from '../js/util';

describe('chartForm', () => {
  let chart, chartDef, originalDatepicker;

  beforeEach(() => {
    originalDatepicker = $.fn.datepicker;
    $.fn.datepicker = () => {};

    chart = chartForm(exampleMetadata, newChartDefinition());
    chartDef = exampleChartDef();
  });

  afterEach(() => {
    $.fn.datepicker = originalDatepicker;
  });

  it('returns elements', () => {
    expect(chart).toBeDefined();
    expect(chart.find('fieldset').length).toBeGreaterThan(0);
  });

  it('does not display the event dropdowns for nonlongitudinal projects', () => {
    expect(chart.find(selector.dateFieldEventSelect).length).toEqual(0);
    expect(chart.find(selector.groupFieldEventSelect).length).toEqual(0);
  });

  it('creates the expected date field options', () => {
    const dateFieldOptions = chart.find('select[name=record_date] > option');
    expect(dateFieldOptions.length).toEqual(4); // 3 options plus prompt
    expect(dateFieldOptions.eq(1).text().trim()).toEqual('enroll_date (Enrollment date)'); // sorted by label
  });

  it('creates the expected date interval options', () => {
    const dateIntervalOptions = chart.find('select[name=date_interval] > option');
    expect(dateIntervalOptions.length).toEqual(5); // 4 options plus prompt
    expect(dateIntervalOptions.eq(1).text().trim()).toEqual('Days');
    expect(dateIntervalOptions.eq(2).text().trim()).toEqual('Weeks');
    expect(dateIntervalOptions.eq(3).text().trim()).toEqual('Months');
    expect(dateIntervalOptions.eq(4).text().trim()).toEqual('Years');
  });

  it('creates the expected grouping field options', () => {
    const groupFieldOptions = chart.find('select[name=group_field] > option');
    expect(groupFieldOptions.length).toEqual(6); // 5 options plus prompt
    expect(groupFieldOptions.eq(1).text().trim()).toEqual('dropdown (Dropdown field)'); // sorted by label
  });

  it('initializes form inputs from the chart definition', () => {
    // create an initialized form
    const withData = chartForm(exampleMetadata, chartDef);

    expect(withData.find(selector.titleField).val()).toEqual(chartDef.title);
    expect(withData.find(selector.descriptionField).val()).toEqual(chartDef.description);
    expect(withData.find(selector.dateFieldSelect).val()).toEqual(chartDef.field);
    expect(withData.find('textarea[name=filter]').val()).toEqual(chartDef.filter);
    expect(withData.find(selector.groupingFieldSelect).val()).toEqual(chartDef.group);

    // dates are converted to MM/DD/YYYY format for display
    expect(withData.find(selector.startDateField).val()).toEqual('10/04/2016');
    expect(withData.find('input[name=chart_end_date]').val()).toEqual('06/04/2017');
    expect(withData.find(selector.targetDateField).val()).toEqual('02/25/2017');

    // group targets are initialized
    expect(withData.find('input[name=group_target__Bend]').val()).toEqual('20');
    expect(withData.find('input[name=group_target__Eugene]').val()).toEqual('20');
    expect(withData.find('input[name=group_target__Portland]').val()).toEqual('20');
  });

  it('attaches the save callback to the save button', () => {
    let spyObj = {
      save() {}
    };

    spyOn(spyObj, 'save');

    const withCallback = chartForm(exampleMetadata, chartDef, (arg) => spyObj.save(arg));
    withCallback.find(selector.saveButton).click();
    expect(spyObj.save).toHaveBeenCalledWith(chartDef);
  });

  it('updates a group target', () => {
    let newChartDef = {};
    const form = chartForm(exampleMetadata, chartDef, (arg) => {
      newChartDef = arg;
    });

    expect(form.find(selector.targetTotalSpan).html()).toEqual("<em>Total: 60</em>");

    // change the target
    form.find('input[name=group_target__Bend]').val('30').change();
    form.find(selector.saveButton).click();

    expect(newChartDef.targets).toEqual({'Portland': 20, 'Bend': 30, 'Eugene': 20});
    expect(form.find(selector.targetTotalSpan).html()).toEqual("<em>Total: 70</em>");
  });

  it('nullifies the targets when group is changed', () => {
    let newChartDef = {};
    const form = chartForm(exampleMetadata, chartDef, (arg) => {
      newChartDef = arg;
    });

    // change the group
    form.find(selector.groupingFieldSelect).val('').change();
    form.find(selector.saveButton).click();

    expect(newChartDef.group).toEqual('');
    expect(newChartDef.targets).toEqual({});
  });

  it('handles a target without groups', () => {
    let newChartDef = {};
    const form = chartForm(exampleMetadata, chartDef, (arg) => {
      newChartDef = arg;
    });

    // change the group and target
    form.find(selector.groupingFieldSelect).val('').change();
    form.find('input[name=target_count]').val('60').change();
    form.find(selector.saveButton).click();

    expect(newChartDef.targets).toEqual({[noGroupsLabel]: 60});
  });

  it('converts dates to ISO format on save', () => {
    let newChartDef = {};
    const form = chartForm(exampleMetadata, chartDef, (arg) => {
      newChartDef = arg;
    });

    // save updated dates
    form.find(selector.startDateField).val('03/04/2016').change();
    form.find(selector.targetDateField).val('04/05/2017').change();
    form.find('input[name=chart_end_date]').val('05/12/2017').change();
    form.find(selector.saveButton).click();

    expect(newChartDef.start).toEqual('2016-03-04');
    expect(newChartDef.end).toEqual('2017-04-05');
    expect(newChartDef.chartEnd).toEqual('2017-05-12');
  });

  it('strips HTML tags on save', () => {
    let newChartDef = {};
    const form = chartForm(exampleMetadata, chartDef, (arg) => {
      newChartDef = arg;
    });

    // add HTML to title and description
    form.find(selector.titleField).val('Chart Title <a href="#">Boop</a>').change();
    form.find(selector.descriptionField).val('<script>alert("hello");</script>').change();
    form.find(selector.saveButton).click();

    expect(newChartDef.title).toEqual('Chart Title Boop');
    expect(newChartDef.description).toEqual('alert("hello");');
  });

  it('resets the form on cancel', () => {
    // create an initialized form
    const withData = chartForm(exampleMetadata, chartDef);

    // change the title
    const titleInput = withData.find(selector.titleField);
    titleInput.val('New title').change();
    expect(titleInput.val()).toEqual('New title');

    const descriptionInput = withData.find(selector.descriptionField);
    descriptionInput.val('New description').change();
    expect(descriptionInput.val()).toEqual('New description');

    // roll back changes
    withData.find(selector.cancelButton).click();
    expect(withData.find(selector.titleField).val()).toEqual(chartDef.title);
    expect(withData.find(selector.descriptionField).val()).toEqual(chartDef.description);
  });

  describe('validation', () => {
    it('disables saving when required fields are missing', () => {
      const form = chartForm(exampleMetadata, chartDef);

      // delete the title
      form.find(selector.titleField).val('').change();

      expect(form.find('.has-error').length).toEqual(1);
      expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
    });

    it('validates date formats', () => {
      const form = chartForm(exampleMetadata, chartDef);

      // enter an invalid date
      form.find(selector.startDateField).val('02/30/2017').change();

      expect(form.find('.has-error').length).toEqual(1);
      expect(form.text()).toMatch('Dates must be MM/DD/YYYY format.');
      expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
    });

    it('validates chart end date formats', () => {
      const form = chartForm(exampleMetadata, chartDef);

      // enter an invalid date
      form.find('input[name=chart_end_date]').val('02/30/2017').change();

      expect(form.find('.has-error').length).toEqual(1);
      expect(form.text()).toMatch('Dates must be MM/DD/YYYY format.');
      expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
    });

    it('disables saving when target date validation fails', () => {
      const form = chartForm(exampleMetadata, chartDef);

      // make a change to enable save button
      form.find(selector.titleField).val('Test Title').change();
      expect(form.find(selector.saveButton).prop('disabled')).toBe(false);

      // delete the start date, which is required when target is present
      form.find(selector.startDateField).val('').change();

      // errors should disable save button
      expect(form.find('.has-error').length).toEqual(1);
      expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
    });

    it('clears errors on cancel', () => {
      const form = chartForm(exampleMetadata, chartDef);

      // delete the title
      form.find(selector.titleField).val('').change();

      expect(form.find('.has-error').length).toEqual(1);
      expect(form.find(selector.saveButton).prop('disabled')).toBe(true);

      // click the cancel button
      form.find(selector.cancelButton).click();

      expect(form.find('.has-error').length).toEqual(0);
    });
  });

  it('uses jQuery plugin for date inputs', () => {
    let spyObj = {
      datepicker() {}
    };

    spyOn(spyObj, 'datepicker');

    $.fn.datepicker = spyObj.datepicker;

    chartForm(exampleMetadata, chartDef);

    expect(spyObj.datepicker).toHaveBeenCalled();
  });
});

describe('longitudinalChartForm', () => {
  let chart, chartDef, originalDatepicker;

  beforeEach(() => {
    originalDatepicker = $.fn.datepicker;
    $.fn.datepicker = () => {};

    chartDef = exampleLongitudinalChartDef();
    chart = chartForm(exampleLongitudinalMetadata, chartDef);
  });

  afterEach(() => {
    $.fn.datepicker = originalDatepicker;
  });

  it('displays the event dropdown for longitudinal projects', () => {
    expect(chart.find(selector.dateFieldEventSelect).length).toEqual(1);
    expect(chart.find(selector.groupFieldEventSelect).length).toEqual(1);
  });

  it('creates the expected date field options for the selected event', () => {
    const dateFieldOptions = chart.find('select[name=record_date] > option');
    expect(dateFieldOptions.length).toEqual(2); // 1 options plus prompt
    expect(dateFieldOptions.eq(1).text().trim()).toEqual('survey_date (Survey date)'); // sorted by label
  });

  it('changes date field options when event is changed and removes selection', () => {
    chart.find(selector.dateFieldEventSelect).val('enrollment').change();
    const dateFieldOptions = chart.find('select[name=record_date] > option');
    expect(dateFieldOptions.length).toEqual(3); // 2 options plus prompt
    const selected = chart.find('select[name=record_date] :selected').val();
    expect(selected).toEqual(''); // default is selected
    expect(dateFieldOptions.eq(1).text().trim()).toEqual('enroll_date (Enrollment date)'); // sorted by label
  });

  it('creates the expected grouping field options for the selected event', () => {
    const groupFieldOptions = chart.find('select[name=group_field] > option');
    expect(groupFieldOptions.length).toEqual(4); // 3 options plus prompt
    expect(groupFieldOptions.eq(2).text().trim()).toEqual('screened (Screened)'); // sorted by label
  });

  it('changes grouping options when event is changed and removes selection', () => {
    chart.find(selector.groupFieldEventSelect).val('visit_2').change();
    const groupFieldOptions = chart.find('select[name=group_field] > option');
    expect(groupFieldOptions.length).toEqual(3); // 2 options plus prompt
    const selected = chart.find('select[name=group_field] :selected').val();
    expect(selected).toEqual(''); // default is selected
    expect(groupFieldOptions.eq(1).text().trim()).toEqual('dropdown (Dropdown field)'); // sorted by label
  });

  describe('longitudinalValidation', () => {
    it('disables saving when date field event is missing', () => {

      // unselect the event
      chart.find(selector.dateFieldEventSelect).val('').change();

      expect(chart.find('.has-error').length).toEqual(2); // date event and date field are invalid
      expect(chart.find(selector.saveButton).prop('disabled')).toBe(true);
    });

    it('validates date field event selected if date field selected', () => {
      const form = chartForm(exampleLongitudinalMetadata, chartDef);

      // Unselect date field event - select date field
      form.find(selector.dateFieldEventSelect).val('').change();
      form.find(selector.dateFieldSelect).val('screen_date').change();

      expect(form.find('.has-error').length).toEqual(2); // date event and date field are invalid
      expect(form.text()).toMatch('An event must be selected before selecting a date field');
      expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
    });

    it('validates group event selected if group selected', () => {
      const form = chartForm(exampleLongitudinalMetadata, chartDef);

      // Unselect group event - select group field
      form.find(selector.groupFieldEventSelect).val('').change();
      form.find(selector.groupingFieldSelect).val('study_clinic').change();

      expect(form.find('.has-error').length).toEqual(1);
      expect(form.text()).toMatch('An event must be selected before selecting a grouping field');
      expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
    });
  });
});
