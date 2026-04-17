<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close']);

const userStore = useUserStore();
const router = useRouter();
const authError = ref(false);

const googleClientId = computed(() => import.meta.env.VITE_APP_GOOGLE_CLIENT_ID);

// 1. ロジックの集約：ボタン幅の決定
const getButtonWidth = () => {
  const width = window.innerWidth;
  if (width <= 393) return 280;
  if (width <= 820) return 320;
  return 400;
};

// 2. ロジックの集約：Googleログインの初期化
const initializeGoogleSignIn = () => {
  const googleApi = typeof window !== 'undefined' ? window.google : undefined;

  if (googleApi?.accounts?.id) {
    const btnElement = document.getElementById('google-signin-btn');
    if (!btnElement) return;

    googleApi.accounts.id.initialize({
      client_id: googleClientId.value,
      callback: handleCredentialResponse,
      context: 'signin'
    });

    googleApi.accounts.id.renderButton(btnElement, {
      theme: 'outline',
      size: 'large',
      width: getButtonWidth()
    });
  } else {
    setTimeout(initializeGoogleSignIn, 100);
  }
};

const handleCredentialResponse = async response => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_APP_API_ENDPOINT}auth/google/onetap`, {
      idToken: response.credential
    });

    if (res.status === 200 && res.data.token) {
      localStorage.setItem('jwt', res.data.token);
      await userStore.fetchUser();

      if (userStore.redirectAfterLogin === '/chat') {
        await userStore.toggleChatEnabled(true);
      }

      emit('close');
      router.push(userStore.redirectAfterLogin || '/');
      userStore.redirectAfterLogin = null;
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    authError.value = true;
  }
};

// ライフサイクルと監視
onMounted(() => {
  if (props.isOpen) initializeGoogleSignIn();
});

watch(
  () => props.isOpen,
  async newVal => {
    if (newVal) {
      authError.value = false;
      await nextTick();
      initializeGoogleSignIn();
    }
  }
);

const closeModal = () => emit('close');
</script>

<template>
  <header>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap" rel="stylesheet" />
  </header>
  <div v-if="isOpen" class="overlay">
    <div class="modal">
      <div class="modal_header">
        <h1>Welcome in Baristana!</h1>
        <p>To access the chat feature, please log in.</p>
        <img src="@/assets/images/logo.svg" alt="Baristana Logo" class="logo" />
      </div>
      <div class="modal_body">
        <div
          v-if="isOpen"
          id="g_id_onload"
          :data-client_id="googleClientId"
          data-context="signin"
          data-auto_prompt="false"
        ></div>
        <div v-if="authError" class="auth-error">ログインに失敗しました。もう一度お試しください。</div>
        <div v-else id="google-signin-btn"></div>
      </div>
      <button class="close_button" @click="closeModal">&#10005;</button>
    </div>
  </div>
</template>

<style scoped>
/* --- Base Styles (Desktop 1440px+) --- */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(52, 52, 52, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 42%;
  min-width: 600px; /* デスクトップでの最小幅を担保 */
  height: 62%;
  max-height: 500px;
  overflow: hidden;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  /* margin-top: 6%; */

  position: relative;
}

/* .modal_header {
  background-color: #efece0;
  padding: 20px;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  position: relative;
} */

/* .modal_body {
  background-color: #fff;
  padding: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
} */

/* h1 {
  margin-top: 7%;
  margin-bottom: 3%;
  font-family: 'Abril Fatface', cursive;
  color: #1a1f39;
  font-weight: normal;
  font-size: 1.9rem;
} */

/* p {
  font-weight: 300;
  font-size: 0.8rem;
  line-height: 1.5;
  display: inline-block;

  color: #e29d3c;
} */

/* .logo {
  width: 25%;
  height: auto;
  position: absolute;
  bottom: 0.5%;
  right: 0.5%;
} */
.modal_header {
  background-color: #efece0;
  padding: 40px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modal_body {
  background-color: #fff;
  padding: 40px 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-family: 'Abril Fatface', cursive;
  color: #1a1f39;
  font-weight: normal;
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

p {
  font-weight: 400;
  font-size: 0.9rem;
  color: #e29d3c;
  text-align: center;
}

.logo {
  width: 100px;
  position: absolute;
  bottom: 15px;
  right: 15px;
}

.close_button {
  position: absolute;
  top: 0.3%;
  right: 0.3%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #979797;
  color: #f4f2f0;
  font-size: 1.2em;
  font-weight: 100;
  line-height: 30px;
  text-align: center;
  border: none;
  cursor: pointer;
}
.auth-error {
  color: #c0392b;
  font-size: 0.85rem;
  text-align: center;
  padding: 0 1rem;
}

/* @media (max-width: 820px) {
  .overlay {
    align-items: flex-start;
  }
  .modal {
    width: 70%;
    height: 55vh;
    margin-top: 160px;
    display: flex;
    flex-direction: column;
  }
  .modal_header {
    justify-content: center;
    height: 50%;
  }
  .modal_body {
    height: 50%;
  }
  h1 {
    margin-top: 0;
    margin-bottom: 1%;
  }

  p {
    font-weight: 300;
    font-size: 0.8rem;
    line-height: 1.5;
    display: inline-block;

    color: #e29d3c;
  }
}
@media (max-height: 418px) {
  h1 {
    font-size: 1.6rem;
  }
  .modal {
    height: 85vh;
  }
}
@media (max-width: 580px) {
  .overlay {
    align-items: center;
    padding-top: 0;
  }
  .modal {
    width: 90%;
    height: 50vh;
  }
  .close_button {
    font-size: 1rem;
  }
  h1 {
    font-size: 1.5rem;
  }
  .logo {
    width: 25%;
  }
} */

/* --- Tablet (820px) --- */
@media (max-width: 820px) {
  .modal {
    width: 70%;
    min-width: auto;
    height: 50vh;
  }
  h1 {
    font-size: 1.8rem;
  }
}

/* --- Mobile (393px / 360px) --- */
@media (max-width: 430px) {
  /* 393pxを含む一般的なスマホ幅 */
  .modal {
    width: 90%;
    height: auto;
    min-height: 45vh;
  }

  .modal_header,
  .modal_body {
    padding: 30px 15px;
  }

  h1 {
    font-size: 1.5rem;
  }

  p {
    font-size: 0.8rem;
  }

  .logo {
    width: 80px;
    bottom: 10px;
    right: 10px;
  }

  .close_button {
    top: 10px;
    right: 10px;
  }
}

/* --- 特殊ケース: 横向きや低画面高デバイス --- */
@media (max-height: 500px) {
  .modal {
    height: 90vh;
  }
  h1 {
    font-size: 1.4rem;
    margin-top: 10px;
  }
  .logo {
    display: none; /* スペース確保のため非表示 */
  }
}
</style>
