<template>
  <header class="header">
    <router-link to="/"><img :src="Logo" alt="Logo" class="logo" /></router-link>
    <div class="right">
      <button v-if="!userLoggedIn" @click="login" class="login-button">Log in</button>
      <div v-else class="user_info">
        <img :src="UserIcon" alt="UserIcon" class="user_icon" />
        <button @click="logout" class="logout-button">Log out</button>
      </div>
    </div>
  </header>
</template>

<script>
import Logo from '@/assets/images/logo.svg';
import UserIcon from '@/assets/images/icon_user.svg';
import { useLoginModalStore } from '@/stores/loginModal';

export default {
  components: {},
  data() {
    return {
      Logo,
      UserIcon,
      userLoggedIn: false // これは仮のコードで、実際にはVuexやpropsなどを通じて提供される。
    };
  },
  setup() {
    const loginModalStore = useLoginModalStore();

    function login() {
      loginModalStore.openModal();
    }
    return {
      login
    };
  },
  methods: {
    logout() {
      // ログアウト処理を記述する
    },
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
