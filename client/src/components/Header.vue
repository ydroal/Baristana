<script setup>
import { ref, watch, computed } from 'vue';
import { useLoginModalStore } from '@/stores/loginModal';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import Logo from '@/assets/images/logo.svg';
import UserIcon from '@/assets/images/icon_user.svg';

const logo = ref(Logo);
const userIcon = ref(UserIcon);
const loginModalStore = useLoginModalStore();
const userStore = useUserStore();
const router = useRouter();

// chat_enabledの状態に基づいて適切なページへ遷移
const redirectTo = computed(() => (userStore.chat_enabled ? '/chat' : '/'));

const isLoggedIn = computed(() => userStore.isLoggedIn);

// userStore.isLoggedInの変化を監視
watch(
  () => userStore.isLoggedIn,
  async (newVal, oldVal) => {
    // ログイン状態が変わった時にユーザー情報を取得
    if (newVal !== oldVal && newVal === true) {
      await userStore.fetchUser();
    }
  }
);

function login() {
  loginModalStore.openModal();
}
function logout() {
  userStore.logout();
  router.push('/');
}
function goToUserSetting() {
  router.push('/user-setting');
}
</script>

<template>
  <header class="header">
    <router-link :to="redirectTo"><img :src="logo" alt="Logo" class="logo" /></router-link>
    <div class="right">
      <button v-if="!isLoggedIn" @click="login" class="btn-primary">Log in</button>
      <div v-else class="user_info">
        <img :src="userIcon" alt="UserIcon" class="user_icon" @click="goToUserSetting" />
        <button @click="logout" class="btn-primary logout-btn">Log out</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 20px 30px;
}
.right,
.user_info {
  display: flex;
  align-items: center;
  gap: 0.8rem; /* marginではなくgapで余白を一括管理（効率化） */
}

.logo {
  width: clamp(140px, 30vw, 218px);
  height: auto;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.user-icon {
  height: 45px;
  width: 45px;
  cursor: pointer;
  border-radius: 50%;
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.user_icon:hover {
  opacity: 0.8;
}

.user_icon:active {
  transform: scale(0.95);
}

.btn-primary {
  background-color: #232121;
  color: #efece0;
  font-weight: 300;
  padding: 10px 20px;
  border-radius: 60px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap; /* テキストの改行防止 */
}
/* .login-button,
.logout-button {
  background-color: #232121;
  width: 5rem;
  color: #efece0;
  font-weight: 300;
  padding: 10px 12px 10px 12px;
  border-radius: 60px;
  border-style: none;
  margin: 0 2rem 0.3rem 1rem;
  font-size: 0.9rem;
} */

@media (max-width: 820px) {
  .header {
    margin: 8px 16px 16px;
  }

  .right,
  .user-info {
    gap: 0.5rem;
  }

  /* .login-button,
  .logout-button {
    width: clamp(3.5rem, 15vw, 5rem);
    font-size: clamp(0.75rem, 3vw, 0.9rem);
    padding: 8px 10px;
    margin: 0 0.5rem 0 0.5rem;
  }
  .user_icon {
    height: clamp(32px, 8vw, 40px);
    margin-bottom: 0;
  } */
}
@media (max-width: 580px) {
  .header {
    margin: 8px 12px 12px;
  }

  .logout-btn {
    display: none;
  }

  .user_info {
    /* アイコンを押しやすくするため、余白を調整 */
    gap: 0;
  }

  .user-icon {
    height: 40px;
    width: 40px;
    cursor: pointer;
  }
}
</style>
