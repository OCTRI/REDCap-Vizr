<template>
  <figure class="pull-right vizr-example">
    <img src="lib/vizr_example.png" :alt="messages.imgTitle" class="img-thumbnail" :title="messages.imgTitle">
    <figcaption>
      <strong>{{ messages.captionIntro }}</strong> {{ messages.captionTitle }}
    </figcaption>
  </figure>
</template>

<script>
export default {
  name: 'ExampleChart',

  data() {
    return {
      messages: {
        captionIntro: 'Example',
        captionTitle:  ': This charted data has a screen date, is true for screened in = yes, and has a Trend Line comparing collected data to a target count',
        imgTitle: 'Example Vizr Chart - Screened In Results'
      }
    };
  }
}
</script>
