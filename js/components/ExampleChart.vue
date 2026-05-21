<template>
  <figure class="pull-right float-right vizr-example">
    <img
      :src="imgSrc"
      :alt="messages.imgTitle"
      class="img-thumbnail"
      :title="messages.imgTitle"
    />
    <figcaption>
      <strong>{{ messages.captionIntro }}</strong> {{ messages.captionTitle }}
    </figcaption>
  </figure>
</template>

<script setup>
import { computed, inject } from 'vue';
import exampleImage from '../../lib/vizr_example.png';

const assetUrls = inject('assetUrls');

const messages = {
  captionIntro: 'Example',
  captionTitle:
    ': This charted data has a screen date, is true for screened in = yes, and has a Trend Line comparing collected data to a target count',
  imgTitle: 'Example Vizr Chart - Screened In Results'
};

const imgSrc = computed(() => {
  const urls = assetUrls || {};
  return urls[exampleImage] || exampleImage;
});
</script>
