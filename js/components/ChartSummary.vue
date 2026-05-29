<template>
  <div class="row">
    <div class="col-md-6">
      <table ref="totalsTable" class="table table-striped table-bordered">
        <caption>
          {{
            messages.totalsCaption
          }}
          <a
            href="#"
            class="copy-link pull-right float-right"
            role="button"
            @click.prevent="copyTable(totalsTable)"
          >
            {{ messages.copyTable }}
            <i class="far fa-copy" :title="messages.copyTable"></i>
          </a>
        </caption>
        <thead>
          <tr>
            <th>{{ messages.resultsCount }}</th>
            <th>{{ messages.target }}</th>
            <th>{{ messages.percent }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ totalCount }}</td>
            <td>{{ totalTarget }}</td>
            <td>{{ totalPct }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="col-md-6">
      <table ref="groupedTable" class="table table-striped table-bordered" v-if="group">
        <caption>
          {{
            messages.groupedCaption
          }}
          <a
            href="#"
            class="copy-link pull-right float-right"
            role="button"
            @click.prevent="copyTable(groupedTable)"
          >
            {{ messages.copyTable }}
            <i class="far fa-copy" :title="messages.copyTable"></i>
          </a>
        </caption>
        <thead>
          <tr>
            <th>{{ groupTitle }}</th>
            <th>{{ messages.resultsCount }}</th>
            <th>{{ messages.target }}</th>
            <th>{{ messages.percent }}</th>
            <th>{{ messages.percentOfTotal }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="groupItem in groupStats" :key="groupItem.label">
            <td>{{ groupItem.label }}</td>
            <td>{{ groupItem.count }}</td>
            <td>{{ groupItem.target }}</td>
            <td>{{ groupItem.percentOfTarget }}</td>
            <td>{{ groupItem.percentOfTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { copyContents, notAnsweredLabel, title } from '@/util';

const props = defineProps({
  group: String,
  groupData: Object,
  totalCount: Number,
  totalTarget: Number
});

const totalsTable = ref(null);
const groupedTable = ref(null);

const messages = {
  copyTable: 'Copy',
  groupedCaption: 'Grouped Results',
  percent: 'Percent',
  percentOfTotal: 'Percent of Total',
  resultsCount: 'Results Count',
  target: 'Target',
  totalsCaption: 'Total Number of Results'
};

/**
 * Calculate the percent and return a string for display.
 * @param {Number} num - numerator
 * @param {Number} total - denominator
 * @return {String} percent as a string with a single decimal; ex. '32.3%'
 */
function pct(num, total) {
  if (isNaN(parseFloat(num)) || isNaN(parseFloat(total)) || total === 0) {
    return '';
  }

  const value = (num / total) * 100;
  return `${value.toFixed(2)}%`;
}

/**
 * Returns a string representation of a target for display.
 * @param {Number} target - the target to convert
 * @return {String} target as a string; calculated targets with fractional values are
 *   rounded to two decimals
 */
function targetString(target) {
  if (!target) {
    return '';
  }

  return Number.isInteger(target) ? target.toString() : target.toFixed(2);
}

/**
 * Generates a breakdown of statistics by group that can be rendered in a table.
 * @param {Object} groupData - { groupName: {count: _ , target: _ }, ...}
 * @return {Object[]} - ex.
 * [
 *  {label: group1Name, count: _, target: _, percentOfTarget: _, percentOfTotal: _},
 *  ...
 * ]
 */
function statistics(groupData) {
  const groups = Object.keys(groupData);
  groups.sort();

  const total = groups.reduce((c, k) => {
    return c + groupData[k].count;
  }, 0);

  return groups.map(group => {
    const groupLabel = group ? group : notAnsweredLabel;
    const data = groupData[group];
    const { count, target } = data;
    // Group target must exist and be non-zero to display
    const targetDisplay = targetString(target); // optional form field
    const countStr = count !== undefined && count !== null ? count.toString() : '';

    return {
      label: groupLabel,
      count: countStr,
      target: targetDisplay,
      percentOfTarget: pct(count, target),
      percentOfTotal: pct(count, total)
    };
  });
}

/**
 * Copies the contents of the target table to the clipboard.
 * @param {Element} target - a DOM element
 */
function copyTable(target) {
  copyContents(target);
}

const totalPct = computed(() => pct(props.totalCount, props.totalTarget));

const groupTitle = computed(() => (props.group ? title(props.group) : ''));

const groupStats = computed(() => (props.groupData ? statistics(props.groupData) : []));

defineExpose({ statistics, copyTable });
</script>
