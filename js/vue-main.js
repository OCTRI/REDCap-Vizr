import Vue from 'vue';
import Vizr from './components/Vizr';

new Vue({
  el: '.vizr-container',
  data: {
    // TODO: get these from php
    pid: 13,
    canEdit: true
  },
  components: { Vizr },
  template: '<Vizr :pid="pid" :can-edit="canEdit"/>'
});
