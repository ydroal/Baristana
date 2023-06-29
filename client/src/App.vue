<template>
  <div :style="[bgStyle, bgOverrideStyle]">
    <Header />
    <RouterView />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router'; // useRouteを追加
import { useUserStore } from '@/stores/user';
import Header from './components/Header.vue';

import bg1x from '@/assets/images/bg@1x.jpg';
import bg2x from '@/assets/images/bg@2x.jpg';
import bg3x from '@/assets/images/bg@3x.jpg';

export default {
  components: {
    Header
  },
  setup() {
    const store = useUserStore();
    const route = useRoute();  // 現在のルートを取得

    onMounted(async () => {
      if (store.isJwtTokenExists()) {
        await store.fetchUser();
      }
    });

    const bgStyle = computed(() => ({
      backgroundImage: `url(${bg1x}), url(${bg2x}), url(${bg3x})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }));

    const bgOverrideStyle = computed(() => {
      if (route.name === 'user-setting') {  // `route.name` を使用
        return {
          background: '#EFECE0'
        };
      }
      return {};
    });

    return { bgStyle, bgOverrideStyle };
  }
};
</script>

<style scoped>
div {
  /* position: relative; */
  position: fixed;
  width: 100%;
  height: 100%;
  /* min-height: 100vh; */
}
/* header {
  line-height: 1.5;
  max-height: 100vh;
} */

/* @media (min-width: 1024px) {
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
} */

</style>