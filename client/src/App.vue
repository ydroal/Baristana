<script setup>
import { computed, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Header from './components/Header.vue';

import bg1x from '@/assets/images/bg@1x.jpg';
import bg2x from '@/assets/images/bg@2x.jpg';
import bg3x from '@/assets/images/bg@3x.jpg';
import bgMobile from '@/assets/images/bg-mobile@2x.jpg';

const store = useUserStore();
const route = useRoute();

onMounted(async () => {
  if (store.isJwtTokenExists()) {
    await store.fetchUser();
  }
});

const bgStyle = computed(() => ({
  backgroundImage: window.innerWidth <= 820
    ? `url(${bgMobile})`
    : `url(${bg1x}), url(${bg2x}), url(${bg3x})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}));

const bgOverrideStyle = computed(() => {
  if (route.name === 'user-setting') {
    return {
      background: '#EFECE0'
    };
  }
  return {};
});
</script>

<template>
  <div :style="[bgStyle, bgOverrideStyle]">
    <Header />
    <RouterView />
  </div>
</template>

<style scoped>
div {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
</style>
