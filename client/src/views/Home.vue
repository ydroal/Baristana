<script setup>
import { ref, onMounted, computed } from 'vue';
import VolumeSlider from '../components/VolumeSlider.vue';
import ToggleButton from '../components/ToggleButton.vue';
import LoginModal from '../components/LoginModal.vue';
import { useLoginModalStore } from '@/stores/loginModal';
import { useBgmStore } from '@/stores/bgm';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const loginModalStore = useLoginModalStore();
const bgmStore = useBgmStore();
const userStore = useUserStore();
const router = useRouter();

const isLoginModalOpen = computed(() => loginModalStore.isOpen);

const closeModal = () => {
  loginModalStore.closeModal();
};

// 音源データのフェッチが完了したかどうかを示すステート
const isAudioSourcesLoaded = ref(false);

onMounted(async () => {
  await Promise.all([bgmStore.fetchCafeMusic(), bgmStore.fetchBaristaSounds(), bgmStore.fetchPeopleTalking()]);
  // 音源データのフェッチが完了したらフラグをセット
  isAudioSourcesLoaded.value = true;
});

const handleChatToggle = async isChatActive => {
  //chatがオン
  if (isChatActive) {
    const isUserLoggedIn = userStore.isLoggedIn; // ログインステータスの確認
    if (isUserLoggedIn) {
      router.push('/chat'); // チャットページにリダイレクト
      // ユーザーがログインしていれば、chat_enabled ステータスをトグル
      await userStore.toggleChatEnabled();
    } else {
      userStore.redirectAfterLogin = '/chat'; // リダイレクト先を設定
      loginModalStore.openModal(); // ログインモーダルを表示
    }
  } else {
    //chatボタンがオフになった場合
    // ユーザーがログインしていれば、chat_enabled ステータスをトグル
    if (userStore.isLoggedIn) {
      await userStore.toggleChatEnabled();
    }
    router.push('/'); // チャットが非アクティブの場合、ホームにリダイレクト
  }
};
</script>

<template>
  <header>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap" rel="stylesheet" />
  </header>

  <div class="container">
    <h1>
      Create Your
      <br class="br-for-mobile" />
      Own Cafe Experience
    </h1>
    <p>
      Baristana is an application that brings the fun times we spend in cafes,
      <span class="br-for-desktop"></span>
      casual conversations with friends, meeting new people,
      <span class="br-for-desktop"></span>
      and the cozy atmosphere with cafe sound. right to your own home.
    </p>
    <div class="volume_slider" v-if="isAudioSourcesLoaded">
      <VolumeSlider soundType="Cafe music" />
      <VolumeSlider soundType="Barista sounds" />
      <VolumeSlider soundType="People talking" />
      <div class="toggle_button">
        <ToggleButton @toggle-chat="handleChatToggle" />
      </div>
    </div>
  </div>
  <LoginModal :isOpen="isLoginModalOpen" @close="closeModal" />
</template>

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
  /* width: 60%; */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.toggle_button {
  position: absolute;
  top: 93%;
  left: 0;
}
.br-for-desktop {
  display: none;
}
.br-for-mobile {
  display: none;
}

@media (min-width: 821px) {
  .br-for-desktop {
    display: block;
  }
}

@media (max-width: 820px) {
  .container {
    width: 90%;
    padding: 3rem 1rem 2rem;
    align-items: center;
  }
  h1 {
    font-size: clamp(2rem, 8vw, 2.8rem);
    margin-top: 4%;
    text-align: center;
    letter-spacing: 0.04em;
    width: 100%;
  }
  p {
    text-align: left;
    font-size: clamp(0.8rem, 3.5vw, 1rem);
    margin-bottom: 6%;
    width: 70%;
  }
  .volume_slider {
    width: 70%;
    margin-top: 5rem;
    align-items: flex-start;
  }
  .toggle_button {
    position: static;
    margin-top: 0;
  }
}

@media (max-width: 580px) {
  h1 {
    font-size: clamp(1.4rem, 6.5vw, 1.8rem);
    text-align: center;
    letter-spacing: 0.04em;
    width: 100%;
  }
  .br-for-mobile {
    display: block;
  }
  p {
    width: 100%;
  }
  .volume_slider {
    width: 100%;
    margin-top: 2rem;
  }
}

@media (max-width: 820px) and (orientation: landscape) {
  h1 {
    font-size: clamp(1.5rem, 5vw, 2rem);
    margin-top: 2%;
  }
  p {
    font-size: clamp(0.7rem, 2.5vw, 0.9rem);
    margin-bottom: 2%;
  }
  .volume_slider {
    margin-top: 2%;
  }
}
</style>
