import { shallowMount } from '@vue/test-utils';

import ChartForm, { selector } from '@/components/ChartForm';
import { exampleChartDef, exampleLongitudinalChartDef } from '../example-chart-def';
import { exampleMetadata, exampleLongitudinalMetadata } from '../example-metadata';
import { newChartDefinition } from '@/util';

const emptyChart = newChartDefinition();
const exampleChart = exampleChartDef();
const exampleLongitudinalChart = exampleLongitudinalChartDef();

describe('ChartForm.vue', () => {
  describe('with non-longitudinal project', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ChartForm, {
        propsData: {
          chartDef: emptyChart,
          metadata: exampleMetadata
        }
      });
    });

    it('renders elements', () => {
      expect(wrapper).toBeDefined();
      expect(wrapper.findAll('fieldset').length).toBeGreaterThan(0);
    });

    it('does not display the event dropdowns for nonlongitudinal projects', () => {
      expect(wrapper.findAll(selector.dateFieldEventSelect).length).toEqual(0);
      expect(wrapper.findAll(selector.groupFieldEventSelect).length).toEqual(0);
    });

    it('creates the expected date field options', () => {
      const dateFieldOptions = wrapper.findAll(`${selector.dateFieldSelect} > option`);
      expect(dateFieldOptions.length).toEqual(5); // 4 options plus prompt
      expect(dateFieldOptions.at(1).text().trim()).toEqual('enroll_date (Enrollment date)'); // sorted by label
    });

    it('creates the expected date interval options', () => {
      const dateIntervalOptions = wrapper.findAll(`${selector.dateIntervalSelect} > option`);
      expect(dateIntervalOptions.length).toEqual(5); // 4 options plus prompt
      expect(dateIntervalOptions.at(1).text().trim()).toEqual('Days');
      expect(dateIntervalOptions.at(2).text().trim()).toEqual('Weeks');
      expect(dateIntervalOptions.at(3).text().trim()).toEqual('Months');
      expect(dateIntervalOptions.at(4).text().trim()).toEqual('Years');
    });

    it('creates the expected grouping field options', () => {
      const groupFieldOptions = wrapper.findAll(`${selector.groupingFieldSelect} > option`);
      expect(groupFieldOptions.length).toEqual(6); // 5 options plus prompt
      expect(groupFieldOptions.at(1).text().trim()).toEqual('dropdown (Dropdown field)'); // sorted by label
    });

    it('initializes form inputs from the chart definition', (done) => {
      // create an initialized form
      const withData = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      // wait a tick for children to update
      withData.vm.$nextTick(() => {
        expect(withData.find(selector.titleField).element.value).toEqual(exampleChart.title);
        expect(withData.find(selector.descriptionField).element.value).toEqual(exampleChart.description);
        expect(withData.find(selector.dateFieldSelect).element.value).toEqual(exampleChart.field);
        expect(withData.find('textarea[name=filter]').element.value).toEqual(exampleChart.filter);
        expect(withData.find(selector.groupingFieldSelect).element.value).toEqual(exampleChart.group);

        // dates are converted to MM/DD/YYYY format for display
        expect(withData.find(selector.startDateField).element.value).toEqual('10/04/2016');
        expect(withData.find(selector.endDateField).element.value).toEqual('06/04/2017');
        expect(withData.find(selector.targetDateField).element.value).toEqual('02/25/2017');

        // group targets are initialized
        // expect(withData.find('input[name=group_target__Bend]').val()).toEqual('20');
        // expect(withData.find('input[name=group_target__Eugene]').val()).toEqual('20');
        // expect(withData.find('input[name=group_target__Portland]').val()).toEqual('20');

        done();
      });
    });

    it('emits an event with chart config when the save button is clicked', () => {
      const withValidData = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });
      withValidData.find('button[type=submit]').trigger('click');
      expect(withValidData.emitted()['save-chart']).toBeDefined();
      expect(withValidData.emitted()['save-chart'][0]).toEqual([ exampleChart ]);
    });

    // it('updates a group target', () => {
    //   let newChartDef = {};
    //   const form = chartForm(exampleMetadata, chartDef, (arg) => {
    //     newChartDef = arg;
    //   });
    //
    //   expect(form.find(selector.targetTotalSpan).html()).toEqual("<em>Total: 60</em>");
    //
    //   // change the target
    //   form.find('input[name=group_target__Bend]').val('30').change();
    //   form.find(selector.saveButton).click();
    //
    //   expect(newChartDef.targets).toEqual({'Portland': 20, 'Bend': 30, 'Eugene': 20});
    //   expect(form.find(selector.targetTotalSpan).html()).toEqual("<em>Total: 70</em>");
    // });
    //
    // it('nullifies the targets when group is changed', () => {
    //   let newChartDef = {};
    //   const form = chartForm(exampleMetadata, chartDef, (arg) => {
    //     newChartDef = arg;
    //   });
    //
    //   // change the group
    //   form.find(selector.groupingFieldSelect).val('').change();
    //   form.find(selector.saveButton).click();
    //
    //   expect(newChartDef.group).toEqual('');
    //   expect(newChartDef.targets).toEqual({});
    // });

    // it('handles a target without groups', () => {
    //   let newChartDef = {};
    //   const form = chartForm(exampleMetadata, chartDef, (arg) => {
    //     newChartDef = arg;
    //   });
    //
    //   // change the group and target
    //   form.find(selector.groupingFieldSelect).val('').change();
    //   form.find('input[name=target_count]').val('60').change();
    //   form.find(selector.saveButton).click();
    //
    //   expect(newChartDef.targets).toEqual({[noGroupsLabel]: 60});
    // });

    it('converts dates to ISO format when updating the model', () => {
      // save updated dates
      wrapper.find(selector.startDateField).setValue('03/04/2016');
      wrapper.find(selector.targetDateField).setValue('04/05/2017');
      wrapper.find(selector.endDateField).setValue('05/12/2017');

      expect(wrapper.vm.model.start).toEqual('2016-03-04');
      expect(wrapper.vm.model.end).toEqual('2017-04-05');
      expect(wrapper.vm.model.chartEnd).toEqual('2017-05-12');
    });

    // it('strips HTML tags on save', () => {
    //   let newChartDef = {};
    //   const form = chartForm(exampleMetadata, chartDef, (arg) => {
    //     newChartDef = arg;
    //   });
    //
    //   // add HTML to title and description
    //   form.find(selector.titleField).val('Chart Title <a href="#">Boop</a>').change();
    //   form.find(selector.descriptionField).val('<script>alert("hello");</script>').change();
    //   form.find(selector.saveButton).click();
    //
    //   expect(newChartDef.title).toEqual('Chart Title Boop');
    //   expect(newChartDef.description).toEqual('alert("hello");');
    // });

    it('resets the form on cancel', (done) => {
      const withData = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      // change the title
      let titleInput = withData.find(selector.titleField);
      titleInput.setValue('New title');
      expect(withData.vm.model.title).toEqual('New title');

      let descriptionInput = withData.find(selector.descriptionField);
      descriptionInput.setValue('New description');
      expect(withData.vm.model.description).toEqual('New description');
      expect(withData.vm.model).not.toEqual(withData.vm.chartDef);

      // roll back changes
      withData.find(selector.cancelButton).trigger('click');
      expect(withData.vm.model).toEqual(withData.vm.chartDef);

      // wait for children to update
      withData.vm.$nextTick(() => {
        titleInput = withData.find(selector.titleField);
        descriptionInput = withData.find(selector.descriptionField);
        expect(titleInput.element.value).toEqual(exampleChart.title);
        expect(descriptionInput.element.value).toEqual(exampleChart.description);
        done();
      })
    });

    xdescribe('validation', () => {
      let form;

      beforeEach(() => {
        form = shallowMount(ChartForm, {
          propsData: {
            chartDef: exampleChart,
            metadata: exampleMetadata
          }
        });
      });

      it('disables saving when required fields are missing', () => {
        // delete the title
        form.find(selector.titleField).val('').change();

        expect(form.find('.has-error').length).toEqual(1);
        expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
      });

      it('validates date formats', () => {
        // enter an invalid date
        form.find(selector.startDateField).val('02/30/2017').change();

        expect(form.find('.has-error').length).toEqual(1);
        expect(form.text()).toMatch('Dates must be MM/DD/YYYY format.');
        expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
      });

      it('validates chart end date formats', () => {
        // enter an invalid date
        form.find('input[name=chart_end_date]').val('02/30/2017').change();

        expect(form.find('.has-error').length).toEqual(1);
        expect(form.text()).toMatch('Dates must be MM/DD/YYYY format.');
        expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
      });

      it('disables saving when target date validation fails', () => {
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

      // eslint-disable-next-line no-undef
      $.fn.datepicker = spyObj.datepicker;

      shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      expect(spyObj.datepicker).toHaveBeenCalled();
    });
  });

  describe('with longitudinal project', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleLongitudinalChart,
          metadata: exampleLongitudinalMetadata
        }
      });
    });

    it('displays the event dropdown for longitudinal projects', () => {
      expect(wrapper.findAll(selector.dateFieldEventSelect).length).toEqual(1);
      expect(wrapper.findAll(selector.groupFieldEventSelect).length).toEqual(1);
    });

    it('creates the expected date field options for the selected event', () => {
      const dateFieldOptions = wrapper.findAll(`${selector.dateFieldSelect} > option`);
      expect(dateFieldOptions.length).toEqual(2); // 1 options plus prompt
      expect(dateFieldOptions.at(1).text().trim()).toEqual('survey_date (Survey date)'); // sorted by label
    });

    it('changes date field options when event is changed and removes selection', (done) => {
      const dateFieldEventOptions = wrapper.findAll(`${selector.dateFieldEventSelect} > option`);
      dateFieldEventOptions.at(1).setSelected();

      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.model.field).toEqual('');
        const dateFieldOptions = wrapper.findAll(`${selector.dateFieldSelect} > option`);
        expect(dateFieldOptions.length).toEqual(4); // 3 options plus prompt
        expect(dateFieldOptions.at(1).text().trim()).toEqual('enroll_date (Enrollment date)'); // sorted by label
        done();
      });
    });

    it('creates the expected grouping field options for the selected event', () => {
      const groupFieldOptions = wrapper.findAll(`${selector.groupingFieldSelect} > option`);
      expect(groupFieldOptions.length).toEqual(4); // 3 options plus prompt
      expect(groupFieldOptions.at(2).text().trim()).toEqual('screened (Screened)'); // sorted by label
    });

    it('changes grouping options when event is changed and removes selection', (done) => {
      const groupFieldEventOptions = wrapper.findAll(`${selector.groupFieldEventSelect} > option`);
      groupFieldEventOptions.at(3).setSelected();

      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.model.group).toEqual('');
        const groupFieldOptions = wrapper.findAll(`${selector.groupingFieldSelect} > option`);
        expect(groupFieldOptions.length).toEqual(3); // 2 options plus prompt
        expect(groupFieldOptions.at(1).text().trim()).toEqual('dropdown (Dropdown field)'); // sorted by label
        done();
      });
    });

    xdescribe('longitudinalValidation', () => {
      let form;

      beforeEach(() => {
        form = shallowMount(ChartForm, {
          propsData: {
            chartDef: exampleLongitudinalChart,
            metadata: exampleLongitudinalMetadata
          }
        });
      });

      it('disables saving when date field event is missing', () => {
        // unselect the event
        form.find(selector.dateFieldEventSelect).val('').change();

        expect(form.find('.has-error').length).toEqual(2); // date event and date field are invalid
        expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
      });

      it('validates date field event selected if date field selected', () => {
        // Unselect date field event - select date field
        form.find(selector.dateFieldEventSelect).val('').change();
        form.find(selector.dateFieldSelect).val('screen_date').change();

        expect(form.find('.has-error').length).toEqual(2); // date event and date field are invalid
        expect(form.text()).toMatch('An event must be selected before selecting a date field');
        expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
      });

      it('validates group event selected if group selected', () => {
        // Unselect group event - select group field
        form.find(selector.groupFieldEventSelect).val('').change();
        form.find(selector.groupingFieldSelect).val('study_clinic').change();

        expect(form.find('.has-error').length).toEqual(1);
        expect(form.text()).toMatch('An event must be selected before selecting a grouping field');
        expect(form.find(selector.saveButton).prop('disabled')).toBe(true);
      });
    });
  });
});
