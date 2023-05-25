<template>
  <header>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap" rel="stylesheet" />
  </header>

  <div class="container">
    <h1>Create Your Own Cafe Experience</h1>
    <p>
      Baristana is an application that brings the fun times we spend in cafes,
      <br />
      casual conversations with friends, meeting new people,
      <br />
      and the cozy atmosphere with cafe sound. right to your own home.
    </p>
    <div class="volume_slider">
      <VolumeSlider soundType="Cafe music" audioSource="url-to-cafe-music" />
      <VolumeSlider soundType="Barista sounds" audioSource="url-to-barista-sounds" />
      <VolumeSlider soundType="People talking" audioSource="url-to-people-talking" />
      <ToggleButton />
    </div>
  </div>
  <LoginModal :isOpen="isLoginModalOpen" @close="closeModal" />
</template>

<script>
// import { defineComponent } from 'vue';
import { ref, watchEffect } from 'vue';
import VolumeSlider from '../components/VolumeSlider.vue';
import ToggleButton from '../components/ToggleButton.vue';
import LoginModal from '../components/LoginModal.vue';
import { useLoginModalStore } from '@/stores/loginModal';

export default {
  components: {
    VolumeSlider,
    ToggleButton,
    LoginModal
  },
  setup() {
    const loginModalStore = useLoginModalStore();
    console.log(loginModalStore);

    // Vueのrefを作成
    const isLoginModalOpen = ref(loginModalStore.$state.isOpen);

    // モーダルの状態変化を監視
    watchEffect(() => {
      isLoginModalOpen.value = loginModalStore.$state.isOpen;
    });

    // closeModal function を更新
    const closeModal = () => {
      console.log('Received close event');
      loginModalStore.closeModal(); // Pinia storeの状態も更新
    };

    return {
      isLoginModalOpen,
      openLoginModal: loginModalStore.openModal,
      closeModal,
      loginModalStore // 必要な場合
    };
  }
};
</script>

<style scoped>
.container {
  width: 80%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

h1 {
  font-family: 'Abril Fatface', cursive;
  font-weight: normal;
  font-size: 2.4rem;
}

p {
  font-weight: 300;
  line-height: 1.5;
  display: inline-block;
  text-align: left;
}

.volume_slider {
  margin-top: 5%;
  width: 40%;
}
</style>
