import { shallowMount } from '@vue/test-utils';

import ChartSummary from '@/components/ChartSummary';
import { notAnsweredLabel } from '@/util';

const totalCount = 60;
const totalTarget= 90;

const groupData = {
  Bend: { count: 10 , target: 20 },
  Eugene: { count: 20 , target: 30 },
  Portland: { count: 30 , target: 40 }
};

const expected = {
  pct: {
    bend: '50.00%',
    eugene: '66.67%',
    portland: '75.00%'
  },
  pctTotal: {
    bend: '16.67%',
    eugene: '33.33%',
    portland: '50.00%'
  }
};

const groupField = 'study_clinic';

describe('ChartSummary.vue', () => {
  describe('rendering', () => {
    let wrapper, tables;

    beforeEach(() => {
      wrapper = shallowMount(ChartSummary, {
        propsData: {
          totalCount,
          totalTarget,
          groupData,
          group: groupField
        }
      });

      tables = wrapper.findAll('table');
    });

    it('displays two tables', () => {
      expect(wrapper.findAll('table').length).toEqual(2);
    });

    it('displays a totals table with a single row', () => {
      const totals = tables.at(0);
      expect(totals.findAll('tbody tr').length).toEqual(1);
    });

    it('displays the total results', () => {
      const totals = tables.at(0);
      expect(totals.findAll('td').at(0).text()).toEqual(totalCount.toString());
    });

    it('displays the total target', () => {
      const totals = tables.at(0);
      expect(totals.findAll('td').at(1).text()).toEqual(totalTarget.toString());
    });

    it('displays the total percent of the target reached', () => {
      const totals = tables.at(0);
      expect(totals.findAll('td').at(2).text()).toEqual('66.67%');
    });

    it('displays a second table with a summary row for each group', () => {
      const groups = tables.at(1);
      expect(groups.findAll('tbody tr').length).toEqual(Object.keys(groupData).length);
    });

    it('has a header for the grouping field', () => {
      const groups = tables.at(1);
      expect(groups.findAll('th').at(0).text()).toEqual('Study Clinic');
    });

    it('has a copy link for each table', () => {
      const buttons = wrapper.findAll('button.copy-link');
      expect(buttons.length).toEqual(2);
    });

    it('copies the table data when the link is clicked', () => {
      spyOn(wrapper.vm, 'copyTable');

      const table = wrapper.findAll('table').at(1);
      const button = table.find('button');
      button.trigger('click');

      expect(wrapper.vm.copyTable).toHaveBeenCalledWith(wrapper.vm.$refs.groupedTable);
    });
  });

  describe('statistics', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ChartSummary, {
        propsData: {
          totalCount,
          totalTarget
        }
      });
    });

    it('should output the correct values', () => {
      const rows = wrapper.vm.statistics(groupData);
      expect(rows[0]).toEqual({
        label: 'Bend',
        count: '10',
        target: '20',
        percentOfTarget: expected.pct.bend,
        percentOfTotal: expected.pctTotal.bend
      });
      expect(rows[1]).toEqual({
        label: 'Eugene',
        count: '20',
        target: '30',
        percentOfTarget: expected.pct.eugene,
        percentOfTotal: expected.pctTotal.eugene
      });
      expect(rows[2]).toEqual({
        label: 'Portland',
        count: '30',
        target: '40',
        percentOfTarget: expected.pct.portland,
        percentOfTotal: expected.pctTotal.portland
      });
    });

    it('should work with no data', () => {
      const rows = wrapper.vm.statistics({});
      expect(rows.length).toBe(0);
    });

    it('should display empty target data if values were not provided', () => {
      const noTargetData = {
        Bend: {count: 10 , target: null },
        Eugene: {count: 20 , target: null },
        Portland: {count: 30 , target: null }
      };

      const rows = wrapper.vm.statistics(noTargetData);
      expect(rows[0]).toEqual({
        label: 'Bend',
        count: '10',
        target: '',
        percentOfTarget: '',
        percentOfTotal: expected.pctTotal.bend
      });
      expect(rows[1]).toEqual({
        label: 'Eugene',
        count: '20',
        target: '',
        percentOfTarget: '',
        percentOfTotal: expected.pctTotal.eugene
      });
      expect(rows[2]).toEqual({
        label: 'Portland',
        count: '30',
        target: '',
        percentOfTarget: '',
        percentOfTotal: expected.pctTotal.portland
      });
    });

    it('should provide a Not Answered row if group field was optional', () => {
      const optionalGroupData = {
        '': {count: 60, target: 0},
        Bend: {count: 10 , target: 20 },
        Eugene: {count: 20 , target: 30 },
        Portland: {count: 30 , target: 40 }
      };

      const rows = wrapper.vm.statistics(optionalGroupData);
      expect(rows[0]).toEqual({
        label: notAnsweredLabel,
        count: '60',
        target: '',
        percentOfTarget: '',
        percentOfTotal: '50.00%'
      });
      expect(rows[1]).toEqual({
        label: 'Bend',
        count: '10',
        target: '20',
        percentOfTarget: '50.00%',
        percentOfTotal: '8.33%'
      });
      expect(rows[2]).toEqual({
        label: 'Eugene',
        count: '20',
        target: '30',
        percentOfTarget: '66.67%',
        percentOfTotal: '16.67%'
      });
      expect(rows[3]).toEqual({
        label: 'Portland',
        count: '30',
        target: '40',
        percentOfTarget: '75.00%',
        percentOfTotal: '25.00%'
      });
    });

    it('should round calculated targets to 2 decimals', () => {
      const calculatedTargetData = {
        Bend: {count: 10, target: 100 / 3}
      };

      const [ row ] = wrapper.vm.statistics(calculatedTargetData);
      expect(row.target).toEqual('33.33');
    });
  })
});
