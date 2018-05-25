/* eslint-env jasmine */
import 'jasmine-ajax';
import 'jasmine-jquery';

import $ from 'jquery';
import { exampleResponses } from './example-ajax-responses';
import { chartId, exampleChartDef, exampleLongitudinalChartDef } from './example-chart-def';
import { run } from '../js/main';

// The DOM expected by the run method of main.js
const chart = '<div class="vizr-container"><div id="vizr-instructions"/><div class="vizr-charts"/></div>';
const endpointUrls = {
  'lib/chart_defs.php': 'http://localhost/redcap/api/?type=module&prefix=vizr&page=lib%2Fchart_defs&pid=0',
  'lib/data': 'http://localhost/redcap/api/?type=module&prefix=vizr&page=lib%2Fdata&pid=0',
  'lib/metadata': 'http://localhost/redcap/api/?type=module&prefix=vizr&page=lib%2Fmetadata&pid=0',
  'lib/permissions': 'http://localhost/redcap/api/?type=module&prefix=vizr&page=lib%2Fpermissions&pid=0',
  'lib/persist': 'http://localhost/redcap/api/?type=module&prefix=vizr&page=lib%2Fpersist&pid=0'
};

// Tests for elements visible to all users
describe('when plugin is started', function() {

  let originalDatepicker;

  beforeEach(function() {
    jasmine.Ajax.install();
    originalDatepicker = $.fn.datepicker;
    $.fn.datepicker = () => {};
    $(chart).appendTo('body');
    run(0, false, endpointUrls);
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    $.fn.datepicker = originalDatepicker;
    $('.vizr-container').remove();
  });

  describe('unconfigured plugin', function() {
    let metadataRequest, configRequest;

    beforeEach(function() {
      metadataRequest = jasmine.Ajax.requests.mostRecent();
      metadataRequest.respondWith(exampleResponses.metadata.nonlongitudinal);
      configRequest = jasmine.Ajax.requests.mostRecent();
      configRequest.respondWith(exampleResponses.config.unconfigured);
    });

    it('emits error', function() {
      expect($('.error')).toContainText('The plugin is not configured');
    });

  });

  describe('and charts are defined', function(){
    let metadataRequest, configRequest, dataRequest;

    beforeEach(function() {
      metadataRequest = jasmine.Ajax.requests.mostRecent();
      metadataRequest.respondWith(exampleResponses.metadata.nonlongitudinal);
      configRequest = jasmine.Ajax.requests.mostRecent();
      configRequest.respondWith(exampleResponses.config.nonlongitudinal);
    });

    describe('and data is received', function() {

      beforeEach(function() {
        dataRequest = jasmine.Ajax.requests.mostRecent();
        dataRequest.respondWith(exampleResponses.data.nonlongitudinal);
      });

      it('shows a title', function() {
        expect($('[data-description="title"]')).toContainText(exampleChartDef().title);
      });

      it('shows no errors', function() {
        expect($('.error')).toBeEmpty();
      });

      it('does not show live event filter', function() {
        expect($('.vizr-event-select')).toBeEmpty();
      });

      it('shows a chart summary', function() {
        expect($('.vizr-container')).toContainElement('.vizr-chart-summary');
      });

      it('summary contains 2 tables with copy links', function() {
        expect($('.vizr-chart-summary table')).toHaveLength(2);
        expect($('.vizr-chart-summary .copy-link')).toHaveLength(2);
      });

      it('shows a chart', function() {
        expect($('.vizr-container')).toContainElement(`#chart-${chartId}`);
        expect($('.vizr-chart-legend-toggle')).toHaveLength(1);
      });

    });

    describe('and repeating instrument data is received', function() {
      it('displays error', function() {
        dataRequest = jasmine.Ajax.requests.mostRecent();
        dataRequest.respondWith(exampleResponses.data.nonlongitudinalRepeating);
        expect($('.error')).not.toBeEmpty();
      });
    })

    describe('and no data is received', function() {

      it('displays error', function() {
        dataRequest = jasmine.Ajax.requests.mostRecent();
        dataRequest.respondWith(exampleResponses.data.noData);
        expect($('.error')).not.toBeEmpty();
      });

    });

  });

  describe('and longitudinal charts are defined', function(){
    let metadataRequest, configRequest, dataRequest;

    beforeEach(function() {
      metadataRequest = jasmine.Ajax.requests.mostRecent();
      metadataRequest.respondWith(exampleResponses.metadata.longitudinal);
      configRequest = jasmine.Ajax.requests.mostRecent();
      configRequest.respondWith(exampleResponses.config.longitudinal);
    });

    describe('and expected data is received', function() {

      beforeEach(function() {
        dataRequest = jasmine.Ajax.requests.mostRecent();
        dataRequest.respondWith(exampleResponses.data.longitudinal);
      });

      it('shows a title', function() {
        expect($('[data-description="title"]')).toContainText(exampleLongitudinalChartDef().title);
      });

      it('shows no errors', function() {
        expect($('.error')).toBeEmpty();
      });

      it('does not show live event filter', function() {
        expect($('.vizr-event-select')).toBeEmpty();
      });

      it('shows a chart summary', function() {
        expect($('.vizr-container')).toContainElement('.vizr-chart-summary');
      });

      it('summary contains 2 tables with copy links', function() {
        expect($('.vizr-chart-summary table')).toHaveLength(2);
        expect($('.vizr-chart-summary .copy-link')).toHaveLength(2);
      });

      it('shows a chart', function() {
        expect($('.vizr-container')).toContainElement(`#chart-${chartId}`);
      });

    });

    describe('and data for multiple events is received', function() {

      beforeEach(function() {
        dataRequest = jasmine.Ajax.requests.mostRecent();
        dataRequest.respondWith(exampleResponses.data.longitudinalMultipleEvents);
      });

      it('shows errors', function() {
        expect($('.error')).not.toBeEmpty();
      });

      it('shows live event filter', function() {
        expect($('.vizr-event-select')).not.toBeEmpty();
      });

      it('changes the data when event is selected', function() {
        const oldChartDataContainer = $('.vizr-chart-data-container');
        // Select an event - data should change
        $('select[name=filter_event]').val('visit_1').change();
        expect($('.vizr-chart-data-container').html()).not.toEqual(oldChartDataContainer.html());
        // Select all events again - data should revert
        $('select[name=filter_event]').val('').change();
        expect($('.vizr-chart-data-container').html()).toEqual(oldChartDataContainer.html());
      });

    });

    describe('and data for repeating instruments is received', function() {

      it('shows errors', function() {
        dataRequest = jasmine.Ajax.requests.mostRecent();
        dataRequest.respondWith(exampleResponses.data.longitudinalRepeating);
        expect($('.error')).not.toBeEmpty();
      });
    })

  });

  describe('and chart definition has no groups', function(){
    let metadataRequest, configRequest, dataRequest;

    beforeEach(function() {
      metadataRequest = jasmine.Ajax.requests.mostRecent();
      metadataRequest.respondWith(exampleResponses.metadata.nonlongitudinal);
      configRequest = jasmine.Ajax.requests.mostRecent();
      configRequest.respondWith(exampleResponses.config.nonlongitudinalNoGroups);
      dataRequest = jasmine.Ajax.requests.mostRecent();
      dataRequest.respondWith(exampleResponses.data.nonlongitudinal);
    });

    it('shows a chart summary', function() {
      expect($('.vizr-container')).toContainElement('.vizr-chart-summary');
    });

    it('summary contains a single table with copy link', function() {
      // No group table is displayed
      expect($('.vizr-chart-summary table')).toHaveLength(1);
      expect($('.vizr-chart-summary .copy-link')).toHaveLength(1);
    });

  });

});

describe('when user can edit', function() {

  let originalDatepicker;

  beforeEach(function() {
    jasmine.Ajax.install();
    originalDatepicker = $.fn.datepicker;
    $.fn.datepicker = () => {};
    $(chart).appendTo('body');
    run(0, true, endpointUrls);
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    $.fn.datepicker = originalDatepicker;
    $('.vizr-container').remove();
  });

  describe('and no charts are defined', function() {
    let metadataRequest, configRequest;

    beforeEach(function() {
      metadataRequest = jasmine.Ajax.requests.mostRecent();
      metadataRequest.respondWith(exampleResponses.metadata.nonlongitudinal);
      configRequest = jasmine.Ajax.requests.mostRecent();
      configRequest.respondWith(exampleResponses.config.noChartDefs);
    });

    it('shows example', function() {
      expect($('.vizr-example')).toBeVisible();
    });

    it('no charts are displayed', function() {
      expect($('.vizr-container')).not.toContainElement('.vizr-chart-container');
    });

    it('shows the chart build button', function() {
      expect($('[data-target=".add-chart-form"]')).toBeInDOM();
    });

  });

  describe('and charts are defined', function(){
    let metadataRequest, configRequest, dataRequest;

    beforeEach(function() {
      metadataRequest = jasmine.Ajax.requests.mostRecent();
      metadataRequest.respondWith(exampleResponses.metadata.nonlongitudinal);
      configRequest = jasmine.Ajax.requests.mostRecent();
      configRequest.respondWith(exampleResponses.config.nonlongitudinal);
    });

    describe('and data is received', function() {

      beforeEach(function() {
        dataRequest = jasmine.Ajax.requests.mostRecent();
        dataRequest.respondWith(exampleResponses.data.nonlongitudinal);
      });

      it('shows the edit chart link', function() {
        expect($('[data-description="title"]')).toContainElement('[data-description="edit"]');
      });

      it('the edit form is collapsed', function() {
        expect($(`#form-${chartId}`)).toHaveClass('collapse');
      });

      it('shows the delete link', function() {
        expect($(`#chart-${chartId}`)).toContainElement('[data-description="delete"]');
      });

      it('saves config when legend is toggled', () => {
        $('[data-description="toggle-legend"]').click();
        const persistenceRequest = jasmine.Ajax.requests.mostRecent();
        expect(persistenceRequest.url).toEqual('http://localhost/redcap/api/?type=module&prefix=vizr&page=lib%2Fpersist&pid=0');
        persistenceRequest.respondWith(exampleResponses.persistence.successful);
      });

    });

  });

});

describe('when user cannot edit', function() {

  let originalDatepicker;

  beforeEach(function() {
    jasmine.Ajax.install();
    originalDatepicker = $.fn.datepicker;
    $.fn.datepicker = () => {};
    $(chart).appendTo('body');
    run(0, false, endpointUrls);
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    $.fn.datepicker = originalDatepicker;
    $('.vizr-container').remove();
  });

  describe('and charts are defined', function() {
    let metadataRequest, configRequest, dataRequest;

    beforeEach(function() {
      metadataRequest = jasmine.Ajax.requests.mostRecent();
      metadataRequest.respondWith(exampleResponses.metadata.nonlongitudinal);
      configRequest = jasmine.Ajax.requests.mostRecent();
      configRequest.respondWith(exampleResponses.config.nonlongitudinal);
      dataRequest = jasmine.Ajax.requests.mostRecent();
      dataRequest.respondWith(exampleResponses.data.nonlongitudinal);
    });

    it('does not show the edit chart link', function() {
      expect($('[data-description="title"]')).not.toContainElement('[data-description="edit"]');
    });

    it('does not show the delete link', function() {
      expect($(`#chart-${chartId}`)).not.toContainElement('[data-description="delete"]');
    });

    it('does not show the chart build button', function() {
      expect($('[data-target=".add-chart-form"]')).not.toBeInDOM();
    });

    it('does not save config when legend is toggled', () => {
      $('[data-description="toggle-legend"]').click();
      const persistenceRequests = jasmine.Ajax.requests.filter(/^persist.php/);
      expect(persistenceRequests.length).toEqual(0);
    });

  });

});
