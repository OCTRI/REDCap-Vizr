<template>
  <div class="vizr-version">REDCap Vizr {{ versionString }}</div>
</template>

<script setup>
import { computed } from 'vue';
import VERSION_STRING from '../version';

const versionString = computed(() => VERSION_STRING);
</script>
