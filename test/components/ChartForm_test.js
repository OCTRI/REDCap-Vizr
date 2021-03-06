import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';

import ChartForm, { selector } from '@/components/ChartForm';

import {
  exampleChartDef,
  exampleNoGroupChartDef,
  exampleLongitudinalChartDef
} from '../example-chart-def';

import { exampleMetadata, exampleLongitudinalMetadata } from '../example-metadata';

import { newChartDefinition, defaultTargetsObject, noGroupsLabel } from '@/util';

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
      // 4 options plus prompt
      expect(dateFieldOptions.length).toEqual(5);
      // sorted by label
      expect(dateFieldOptions.at(1).text().trim()).toEqual(
        'enroll_date (Enrollment date)'
      );
    });

    it('creates the expected date interval options', () => {
      const dateIntervalOptions = wrapper.findAll(
        `${selector.dateIntervalSelect} > option`
      );
      // 4 options plus prompt
      expect(dateIntervalOptions.length).toEqual(5);
      expect(dateIntervalOptions.at(1).text().trim()).toEqual('Days');
      expect(dateIntervalOptions.at(2).text().trim()).toEqual('Weeks');
      expect(dateIntervalOptions.at(3).text().trim()).toEqual('Months');
      expect(dateIntervalOptions.at(4).text().trim()).toEqual('Years');
    });

    it('creates the expected grouping field options', () => {
      const groupFieldOptions = wrapper.findAll(
        `${selector.groupingFieldSelect} > option`
      );
      // 5 options plus prompt
      expect(groupFieldOptions.length).toEqual(6);
      // sorted by label
      expect(groupFieldOptions.at(1).text().trim()).toEqual('dropdown (Dropdown field)');
    });

    it('initializes form inputs from the chart definition', async () => {
      // create an initialized form
      const withData = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      // wait a tick for children to update
      await Vue.nextTick();
      expect(withData.find(selector.titleField).element.value).toEqual(
        exampleChart.title
      );
      expect(withData.find(selector.descriptionField).element.value).toEqual(
        exampleChart.description
      );
      expect(withData.find(selector.dateFieldSelect).element.value).toEqual(
        exampleChart.field
      );
      expect(withData.find('textarea[name=filter]').element.value).toEqual(
        exampleChart.filter
      );
      expect(withData.find(selector.groupingFieldSelect).element.value).toEqual(
        exampleChart.group
      );

      // dates are converted to MM/DD/YYYY format for display
      expect(withData.find(selector.startDateField).element.value).toEqual(
        '10/04/2016'
      );
      expect(withData.find(selector.endDateField).element.value).toEqual('06/04/2017');
      expect(withData.find(selector.targetDateField).element.value).toEqual(
        '02/25/2017'
      );

      // group targets are initialized
      expect(withData.find('input[name=group_target__Bend]').element.value).toEqual(
        '20'
      );
      expect(withData.find('input[name=group_target__Eugene]').element.value).toEqual(
        '20'
      );
      expect(withData.find('input[name=group_target__Portland]').element.value).toEqual(
        '20'
      );
    });

    it('emits an event with chart config when the save button is clicked', async () => {
      const withValidData = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      withValidData.vm.isDirty = true;
      await Vue.nextTick();
      await withValidData.find(selector.saveButton).trigger('click');

      expect(withValidData.emitted('save-chart')).toBeDefined();
      expect(withValidData.emitted('save-chart')[0]).toEqual([exampleChart]);
    });

    it('strips HTML tags on save', async () => {
      const form = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        },

        // stub out the use of debounce so test runs synchronously
        methods: {
          validateChanges(evt) {
            const { target } = evt;
            this.validateInput(target);
          }
        }
      });

      // add HTML to title and description
      await form.find(selector.titleField).setValue('Chart Title <a href="#">Boop</a>');
      await form.find(selector.descriptionField).setValue('<script>alert("hello");</script>');
      await form.find(selector.saveButton).trigger('click');

      expect(form.emitted('save-chart')).toBeDefined();

      const newChartDef = form.emitted()['save-chart'][0][0];
      expect(newChartDef.title).toEqual('Chart Title Boop');
      expect(newChartDef.description).toEqual('alert("hello");');
    });

    it('updates a group target', async () => {
      const form = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      expect(form.find(selector.targetTotalSpan).text()).toMatch(/Total:\s+60/);

      // change the target
      await form.find('input[name=group_target__Bend]').setValue('30');

      expect(form.vm.model.targets).toEqual({ Portland: 20, Bend: 30, Eugene: 20 });
      expect(form.find(selector.targetTotalSpan).text()).toMatch(/Total:\s+70/);
    });

    it('nullifies the targets when group is changed', async () => {
      const form = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      // change the group
      const firstGroupingField = form
        .findAll(`${selector.groupingFieldSelect} > option`)
        .at(0);
      await form.find(selector.groupingFieldSelect).setValue(firstGroupingField.element.value);

      expect(form.vm.model.group).toEqual('');
      expect(form.vm.model.targets).toEqual(defaultTargetsObject());
    });

    it('handles a target without groups', async () => {
      const form = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      // change the group and target
      const firstGroupingField = form
        .findAll(`${selector.groupingFieldSelect} > option`)
        .at(0);
      await form.find(selector.groupingFieldSelect).setValue(firstGroupingField.element.value);
      await form.find('input[name=target_count]').setValue('60');

      expect(form.vm.model.targets).toEqual({ [noGroupsLabel]: 60 });
    });

    it('converts dates to ISO format when updating the model', async () => {
      // save updated dates
      await wrapper.find(selector.startDateField).setValue('03/04/2016');
      await wrapper.find(selector.targetDateField).setValue('04/05/2017');
      await wrapper.find(selector.endDateField).setValue('05/12/2017');

      expect(wrapper.vm.model.start).toEqual('2016-03-04');
      expect(wrapper.vm.model.end).toEqual('2017-04-05');
      expect(wrapper.vm.model.chartEnd).toEqual('2017-05-12');
    });

    it('resets the form on cancel', async () => {
      const withData = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      // change the title
      let titleInput = withData.find(selector.titleField);
      await titleInput.setValue('New title');
      expect(withData.vm.model.title).toEqual('New title');

      let descriptionInput = withData.find(selector.descriptionField);
      await descriptionInput.setValue('New description');
      expect(withData.vm.model.description).toEqual('New description');
      expect(withData.vm.model).not.toEqual(withData.vm.chartDef);

      // roll back changes
      await withData.find(selector.cancelButton).trigger('click');
      expect(withData.vm.model).toEqual(withData.vm.chartDef);

      titleInput = withData.find(selector.titleField);
      descriptionInput = withData.find(selector.descriptionField);
      expect(titleInput.element.value).toEqual(exampleChart.title);
      expect(descriptionInput.element.value).toEqual(exampleChart.description);
    });

    it('resets the form when chartDef is replaced', async () => {
      const form = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });

      expect(form.find(selector.titleField).element.value).toEqual(exampleChart.title);

      // replace the chart definition
      await form.setProps({ chartDef: emptyChart });

      expect(form.find(selector.titleField).element.value).toEqual(emptyChart.title);
    });

    describe('validation', () => {
      let form;

      beforeEach(() => {
        form = shallowMount(ChartForm, {
          propsData: {
            chartDef: exampleChart,
            metadata: exampleMetadata
          },

          // stub out the use of debounce so tests run synchronously
          methods: {
            validateChanges(evt) {
              const { target } = evt;
              this.validateInput(target);
            }
          }
        });
      });

      it('disables saving when required fields are missing', async () => {
        // delete the title
        await form.find(selector.titleField).setValue('');
        expect(form.findAll(selector.validationError).length).toEqual(1);
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();
      });

      it('validates date formats', async () => {
        // enter an invalid date
        await form.find(selector.startDateField).setValue('02/30/2017');
        expect(form.findAll(selector.validationError).length).toEqual(1);
        expect(form.text()).toMatch('Dates must be MM/DD/YYYY format.');
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();
      });

      it('validates chart end date formats', async () => {
        // enter an invalid date
        await form.find('input[name=chart_end_date]').setValue('02/30/2017');
        expect(form.findAll(selector.validationError).length).toEqual(1);
        expect(form.text()).toMatch('Dates must be MM/DD/YYYY format.');
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();
      });

      it('disables saving when target date validation fails', async () => {
        // make a change to enable save button
        await form.find(selector.titleField).setValue('Test Title');
        expect(form.find(selector.saveButton).attributes().disabled).toBeFalsy();

        // delete the start date, which is required when target is present
        await form.find(selector.startDateField).setValue('');

        // errors should disable save button
        expect(form.findAll(selector.validationError).length).toEqual(1);
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();
      });

      it('clears errors on cancel', async () => {
        // delete the title
        await form.find(selector.titleField).setValue('');

        expect(form.findAll(selector.validationError).length).toEqual(1);
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();

        // click the cancel button
        await form.find(selector.cancelButton).trigger('click');

        expect(form.findAll(selector.validationError).length).toEqual(0);
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
      // 1 option plus prompt
      expect(dateFieldOptions.length).toEqual(2);
      // sorted by label
      expect(dateFieldOptions.at(1).text().trim()).toEqual('survey_date (Survey date)');
    });

    it('changes date field options when event is changed and removes selection', async () => {
      const dateFieldEventOptions = wrapper.findAll(
        `${selector.dateFieldEventSelect} > option`
      );

      await wrapper
        .find(selector.dateFieldEventSelect)
        .setValue(dateFieldEventOptions.at(1).element.value);

      expect(wrapper.vm.model.field).toEqual('');
      const dateFieldOptions = wrapper.findAll(`${selector.dateFieldSelect} > option`);
      // 3 options plus prompt
      expect(dateFieldOptions.length).toEqual(4);
      // sorted by label
      expect(dateFieldOptions.at(1).text().trim()).toEqual(
        'enroll_date (Enrollment date)'
      );
    });

    it('creates the expected grouping field options for the selected event', () => {
      const groupFieldOptions = wrapper.findAll(
        `${selector.groupingFieldSelect} > option`
      );
      // 3 options plus prompt
      expect(groupFieldOptions.length).toEqual(4);
      // sorted by label
      expect(groupFieldOptions.at(2).text().trim()).toEqual('screened (Screened)');
    });

    it('changes grouping options when event is changed and removes selection', async () => {
      const groupFieldEventOptions = wrapper.findAll(
        `${selector.groupFieldEventSelect} > option`
      );

      await wrapper
        .find(selector.groupFieldEventSelect)
        .setValue(groupFieldEventOptions.at(3).element.value);

      expect(wrapper.vm.model.group).toEqual('');
      const groupFieldOptions = wrapper.findAll(
        `${selector.groupingFieldSelect} > option`
      );
      // 2 options plus prompt
      expect(groupFieldOptions.length).toEqual(3);
      // sorted by label
      expect(groupFieldOptions.at(1).text().trim()).toEqual('dropdown (Dropdown field)');
    });

    describe('longitudinalValidation', () => {
      let form;

      beforeEach(() => {
        form = shallowMount(ChartForm, {
          propsData: {
            chartDef: exampleLongitudinalChart,
            metadata: exampleLongitudinalMetadata
          },

          // stub out the use of debounce so tests run synchronously
          methods: {
            validateChanges(evt) {
              const { target } = evt;
              this.validateInput(target);
            }
          }
        });
      });

      it('disables saving when date field event is missing', async () => {
        // unselect the event
        await form.find(selector.dateFieldEventSelect).setValue('');

        // date event is invalid
        expect(form.findAll(selector.validationError).length).toEqual(1);
        // date field is cleared
        expect(form.vm.model.field).toEqual('');
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();
      });

      it('validates date field event selected if date field selected', async () => {
        // Unselect date field event - select date field
        await form.find(selector.dateFieldEventSelect).setValue('');
        const dateFieldOption = form.findAll(`${selector.dateFieldSelect} > option`).at(1);
        await form.find(selector.dateFieldSelect).setValue(dateFieldOption.element.value);

        // date event and date field are invalid
        expect(form.findAll(selector.validationError).length).toEqual(2);
        expect(form.text()).toMatch(
          'An event must be selected before selecting a date field'
        );
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();
      });

      it('validates group event selected if group selected', async () => {
        // Unselect group event - select group field
        await form.find(selector.groupFieldEventSelect).setValue('');
        const groupFieldOption = form.findAll(`${selector.groupingFieldSelect} > option`).at(1);
        await form.find(selector.groupingFieldSelect).setValue(groupFieldOption.element.value);

        expect(form.findAll(selector.validationError).length).toEqual(1);
        expect(form.text()).toMatch(
          'An event must be selected before selecting a grouping field'
        );
        expect(form.find(selector.saveButton).attributes().disabled).toBeTruthy();
      });
    });
  });

  describe('sanitizeModel', () => {
    let form;

    beforeEach(() => {
      form = shallowMount(ChartForm, {
        propsData: {
          chartDef: exampleChart,
          metadata: exampleMetadata
        }
      });
    });

    it('strips HTML from string-valued fields', () => {
      const withHtml = exampleChartDef();
      withHtml.description = '<script>alert("hello");</script>';
      form.vm.sanitizeModel(withHtml);
      expect(withHtml.description).toEqual('alert("hello");');
    });

    it('can handle the example chart', () => {
      const newExample = exampleChartDef();
      form.vm.sanitizeModel(newExample);
      expect(newExample).toEqual(exampleChart);
    });

    it('can handle the example longitudinal chart', () => {
      const newLongitudinalExample = exampleLongitudinalChartDef();
      form.vm.sanitizeModel(newLongitudinalExample);
      expect(newLongitudinalExample).toEqual(exampleLongitudinalChart);
    });

    it('can handle a chart without groups', () => {
      const noGroups = exampleNoGroupChartDef();
      const expectedChart = exampleNoGroupChartDef();
      form.vm.sanitizeModel(noGroups);
      expect(noGroups).toEqual(expectedChart);
    });

    it('can handle a chart without targets', () => {
      const noTargets = exampleNoGroupChartDef();
      const expectedChart = exampleNoGroupChartDef();
      noTargets.targets = defaultTargetsObject();
      expectedChart.targets = defaultTargetsObject();
      form.vm.sanitizeModel(noTargets);
      expect(noTargets).toEqual(expectedChart);
    });

    it('can handle an empty chart', () => {
      const newEmpty = newChartDefinition();
      newEmpty.id = emptyChart.id;
      form.vm.sanitizeModel(newEmpty);
      expect(newEmpty).toEqual(emptyChart);
    });
  });
});
