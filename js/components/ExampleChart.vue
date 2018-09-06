<template>
  <figure class="pull-right float-right vizr-example">
    <img :src="imgSrc" :alt="messages.imgTitle" class="img-thumbnail" :title="messages.imgTitle">
    <figcaption>
      <strong>{{ messages.captionIntro }}</strong> {{ messages.captionTitle }}
    </figcaption>
  </figure>
</template>

<script>
import exampleImage from '../../lib/vizr_example.png';

export default {
  name: 'ExampleChart',
  inject: ['assetUrls'],

  data() {
    return {
      messages: {
        captionIntro: 'Example',
        captionTitle:  ': This charted data has a screen date, is true for screened in = yes, and has a Trend Line comparing collected data to a target count',
        imgTitle: 'Example Vizr Chart - Screened In Results'
      }
    };
  },

  computed: {
    imgSrc() {
      const { assetUrls = {} } = this;
      return assetUrls[exampleImage] || exampleImage;
    }
  }
}
</script>
