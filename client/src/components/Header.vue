<template>
  <header class="header">
    <router-link :to="redirectTo"><img :src="logo" alt="Logo" class="logo" /></router-link>
    <!-- <router-link to="/"><img :src="Logo" alt="Logo" class="logo" /></router-link> -->
    <div class="right">
      <button v-if="!isLoggedIn" @click="login" class="login-button">Log in</button>
      <div v-else class="user_info">
        <img :src="userIcon" alt="UserIcon" class="user_icon" @click="goToUserSetting" />
        <button @click="logout" class="logout-button">Log out</button>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useLoginModalStore } from '@/stores/loginModal';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import Logo from '@/assets/images/logo.svg';
import UserIcon from '@/assets/images/icon_user.svg';

export default {
  components: {},
  // data() {
  //   return {
  //     Logo,
  //     UserIcon
  //   };
  // },
  setup() {
    const logo = ref(Logo);
    const userIcon = ref(UserIcon);
    const loginModalStore = useLoginModalStore();
    const userStore = useUserStore();
    const router = useRouter();

    // chat_enabledの状態に基づいて適切なページへ遷移
    const redirectTo = computed(() => (userStore.chat_enabled ? '/chat' : '/'));

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
    return {
      logo,
      userIcon,
      login,
      logout,
      goToUserSetting,
      redirectTo,
      isLoggedIn: computed(() => userStore.isLoggedIn)
    };
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
  /* width: 26.5%; */
  width: 218px;
  height: auto;
  margin-left: 1.5%;
}
.user_icon {
  height: 45px;
  margin-bottom: 0.3rem;
}
.login-button,
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
}

/* Medium devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
  .logo {
    width: 180px;
    margin-left: 1.2%;
  }
  .login-button,
  .logout-button {
    width: 4.4rem;
    font-size: 0.8rem;
    padding: 8px 10px 8px 10px;
    margin: 0 1rem 0.3rem 0.7rem;
  }
  .user_icon {
    height: 38px;
    margin-bottom: 0.3rem;
  }
}
@media (min-width: 576px) and (max-width: 767.98px) and (orientation: landscape), (max-height: 418px) {
  .header {
    margin-bottom: 0.6%;
  }
  .logo {
    width: 150px;
    margin-left: 0;
  }
  .login-button,
  .logout-button {
    width: 3.7rem;
    padding: 8px 10px 8px 10px;
    font-size: 0.7rem;
    margin: 0 0.5rem 0.5rem 0.5rem;
  }
  .user_icon {
    height: 34px;
    margin-bottom: 0.5rem;
  }
}

/* Small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  .header {
    margin: 1% 1% 2% 1%;
  }
  .logo {
    width: 150px;
    margin-left: 0;
  }
  .login-button,
  .logout-button {
    width: 3.7rem;
    padding: 8px 10px 8px 10px;
    font-size: 0.7rem;
    margin: 0 0.5rem 0.5rem 0.5rem;
  }
  .user_icon {
    height: 34px;
    margin-bottom: 0.5rem;
  }
}
</style>
