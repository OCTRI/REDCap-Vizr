<template>
  <div class="vizr-version">REDCap Vizr {{ versionString }}</div>
</template>

<script>
import VERSION_STRING from '../version';

export default {
  name: 'VizrVersion',

  data() {
    return {
      versionString: VERSION_STRING
    };
  }
};
</script>
