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
    <!-- <pre>{{ cafeMusic }}</pre>
    <pre>{{ baristaSounds }}</pre>
    <pre>{{ peopleTalking }}</pre> -->
    <div class="volume_slider" v-if="isAudioSourcesLoaded">
      <VolumeSlider soundType="Cafe music" :audioSources="cafeMusic" />
      <VolumeSlider soundType="Barista sounds" :audioSources="baristaSounds" />
      <VolumeSlider soundType="People talking" :audioSources="peopleTalking" />
      <ToggleButton />
    </div>
  </div>
  <LoginModal :isOpen="isLoginModalOpen" @close="closeModal" />
</template>

<script>
import { ref, watchEffect, onMounted, computed } from 'vue';
import VolumeSlider from '../components/VolumeSlider.vue';
import ToggleButton from '../components/ToggleButton.vue';
import LoginModal from '../components/LoginModal.vue';
import { useLoginModalStore } from '@/stores/loginModal';
import { useBgmStore } from '@/stores/bgm';

export default {
  components: {
    VolumeSlider,
    ToggleButton,
    LoginModal
  },
  setup() {
    const loginModalStore = useLoginModalStore();
    const bgmStore = useBgmStore();

    // Vueのrefを作成
    const isLoginModalOpen = ref(loginModalStore.$state.isOpen);

    // モーダルの状態変化を監視
    watchEffect(() => {
      isLoginModalOpen.value = loginModalStore.$state.isOpen;
    });

    // closeModal functionを更新
    const closeModal = () => {
      loginModalStore.closeModal(); // Pinia storeの状態も更新
    };

    // 音源データのフェッチが完了したかどうかを示すステート
    const isAudioSourcesLoaded = ref(false);

    // onMounted を非同期関数に変更
    onMounted(async () => {
      // Promise.all の結果を await で待つように修正
      await Promise.all([bgmStore.fetchCafeMusic(), bgmStore.fetchBaristaSounds(), bgmStore.fetchPeopleTalking()]);
      // 音源データのフェッチが完了したらフラグをセット
      isAudioSourcesLoaded.value = true;
    });

    return {
      isLoginModalOpen,
      openLoginModal: loginModalStore.openModal,
      closeModal,
      loginModalStore,
      cafeMusic: computed(() => bgmStore.cafe_music),
      baristaSounds: computed(() => bgmStore.barista_sounds),
      peopleTalking: computed(() => bgmStore.people_talking),
      isAudioSourcesLoaded
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
