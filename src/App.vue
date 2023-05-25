<template>
  <div :style="bgStyle">
    <Header />
    <RouterView />
  </div>
</template>

<script>
import { computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import Header from './components/Header.vue';

import bg1x from '@/assets/images/bg@1x.jpg';
import bg2x from '@/assets/images/bg@2x.jpg';
import bg3x from '@/assets/images/bg@3x.jpg';

export default {
  components: {
    Header
  },
  computed: {
    bgStyle() {
      return {
        backgroundImage: `url(${bg1x}), url(${bg2x}), url(${bg3x})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
  }
};
</script>

<style scoped>
div {
  position: fixed;
  width: 100%;
  height: 100%;
}
header {
  line-height: 1.5;
  max-height: 100vh;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
