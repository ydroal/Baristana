<template>
  <header class="header">
    <router-link to="/"><img :src="Logo" alt="Logo" class="logo" /></router-link>
    <div class="right">
      <button v-if="!isLoggedIn" @click="login" class="login-button">Log in</button>
      <div v-else class="user_info">
        <img :src="UserIcon" alt="UserIcon" class="user_icon" @click="goToUserSetting" />
        <button @click="logout" class="logout-button">Log out</button>
      </div>
    </div>
  </header>
</template>

<script>
import { watch, computed } from 'vue';
import { useLoginModalStore } from '@/stores/loginModal';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import Logo from '@/assets/images/logo.svg';
import UserIcon from '@/assets/images/icon_user.svg';

export default {
  components: {},
  data() {
    return {
      Logo,
      UserIcon
    };
  },
  setup() {
    const loginModalStore = useLoginModalStore();
    const userStore = useUserStore();
    const router = useRouter();

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
    }
    function goToUserSetting() {
      router.push('/user-setting');
    }
    return {
      login,
      logout,
      goToUserSetting,
      isLoggedIn: computed(() => userStore.isLoggedIn)
    };
  },
  methods: {
    navigateToUserSettings() {
      // ユーザー設定ページへのリダイレクト処理を記述する
    }
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 10px 30px 10px;
}
.right,
.user_info {
  display: flex;
  align-items: center;
}
.logo {
  width: 220px;
  height: auto;
  margin-left: 1.5%;
}
.user_icon {
  height: 45px;
}
.login-button,
.logout-button {
  background-color: #232121;
  width: 86px;
  color: #efece0;
  font-weight: 300;
  padding: 10px 12px 10px 12px;
  border-radius: 60px;
  border-style: none;
  margin: 1rem 2rem 1rem 1rem;
  font-size: 0.9rem;
}
</style>