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
      <span class="br-for-desktop"></span>
      casual conversations with friends, meeting new people,
      <span class="br-for-desktop"></span>
      and the cozy atmosphere with cafe sound. right to your own home.
    </p>
    <!-- <pre>{{ cafeMusic }}</pre>
    <pre>{{ baristaSounds }}</pre>
    <pre>{{ peopleTalking }}</pre> -->
    <div class="volume_slider" v-if="isAudioSourcesLoaded">
      <VolumeSlider soundType="Cafe music" :audioSources="cafeMusic" />
      <VolumeSlider soundType="Barista sounds" :audioSources="baristaSounds" />
      <VolumeSlider soundType="People talking" :audioSources="peopleTalking" />
      <div class="toggle_button">
        <ToggleButton @toggle-chat="handleChatToggle" />
      </div>
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
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

export default {
  components: {
    VolumeSlider,
    ToggleButton,
    LoginModal
  },
  setup() {
    const loginModalStore = useLoginModalStore();
    const bgmStore = useBgmStore();
    const userStore = useUserStore();
    const router = useRouter(); // ルーティングのためのrouterインスタンスを取得

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

    const handleChatToggle = async isChatActive => {
      console.log('index Page:handleChatToggle called with:', isChatActive);
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
      } else { //chatボタンがオフになった場合
        // ユーザーがログインしていれば、chat_enabled ステータスをトグル
        if (userStore.isLoggedIn) {
          await userStore.toggleChatEnabled();
        }
        router.push('/'); // チャットが非アクティブの場合、ホームにリダイレクト
      }
    };

    return {
      isLoginModalOpen,
      openLoginModal: loginModalStore.openModal,
      closeModal,
      loginModalStore,
      cafeMusic: computed(() => bgmStore.cafe_music),
      baristaSounds: computed(() => bgmStore.barista_sounds),
      peopleTalking: computed(() => bgmStore.people_talking),
      isAudioSourcesLoaded,
      handleChatToggle
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

@media (min-width: 768px) {
  .br-for-desktop {
    display: block;
  }
}
@media (min-width: 768px) and (max-width: 980px) and (min-height: 850px) {
  h1 {
    margin-top: 20%;
  }
  p {
    margin-bottom: 10%;
  }
}

/* Medium devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
  p {
    margin-bottom: 6%;
  }
}
@media (min-width: 576px) and (max-width: 767.98px) and (orientation: landscape), (max-height: 418px) {
  h1 {
    font-size: 1.7rem;
    margin-top: 0;
  }
  p {
    margin-bottom: 1%;
    font-size: 0.7rem;
  }
  .volume_slider {
    margin-top: 1%;
  }
}
/* Small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  h1 {
    font-size: 2.1rem;
    margin-top: 12%;
  }
  .slider {
    width: 200px;
  }
  p {
    font-size: 0.8rem;
    margin-bottom: 5%;
    text-align: center;
  }
  .volume_slider {
    margin-top: 8%;
  }
}
</style>
