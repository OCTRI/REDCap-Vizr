<template>
  <div>
    {{ config.title }}
  </div>
</template>

<script>
export default {
  name: 'Chart',

  props: {
    canEdit: Boolean,
    config: Object,
    metadata: Object
  }
};
</script>
