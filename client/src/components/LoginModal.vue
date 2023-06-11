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
          data-ux_mode="http://localhost:5173"
          data-login_uri="http://localhost:3000/api/auth/google"
          data-nonce=""
          data-auto_prompt="false"
        ></div>
        <div
          v-if="isOpen"
          class="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>
        <!-- <button
          id="customBtn"
          class="login_button"
          @mouseover="buttonHover"
          @mouseleave="buttonNormal"
          @mousedown="buttonPress"
          @mouseup="buttonNormal"
          @click="initializeGoogleSignIn"
        ></button> -->
      </div>
      <button class="close_button" @click="closeModal">&#10005;</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useUserStore } from '@/stores/user';

// GoogleのJavaScriptライブラリ（外部ライブラリ）を非同期で読み込む
// 内部的に使用されるヘルパー関数
// function loadScript(url) {
//   return new Promise((resolve, reject) => {
//     let script = document.createElement('script');
//     script.src = url;
//     script.async = true;
//     script.defer = true;
//     script.onload = resolve;
//     script.onerror = reject;
//     document.body.appendChild(script);
//   });
// }
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  updated() {
    // モーダルが開き、Googleのライブラリが読み込まれていて、Googleの認証関連のオブジェクトとメソッドが利用可能
    if (this.isOpen && typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: this.handleCredentialResponse
      });
      // Google Sign-Inのボタンを表示
      google.accounts.id.renderButton(document.getElementById('g_id_onload'), { theme: 'outline', size: 'large' });
    }
  },
  computed: {
    googleClientId() {
      return import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
    }
  },
  methods: {
    closeModal() {
      console.log('Emitting close event');
      this.$emit('close');
    },
    // buttonHover() {
    //   this.buttonState = 'focus';
    // },
    // buttonNormal() {
    //   this.buttonState = 'normal';
    // },
    // buttonPress() {
    //   this.buttonState = 'pressed';
    // },
    // ユーザーに再認証を要求するためのメソッド
    initializeGoogleSignIn() {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.prompt();
      }
    },
    // Google Sign-Inからのレスポンスをハンドリング
    async handleCredentialResponse(response) {
      const idToken = response.credential;
      console.log('ID Token: ' + idToken);
      console.log('Attempting to authenticate...');
      // ID tokenをバックエンドに送信
      const userStore = useUserStore();
      axios
        .post('http://localhost:3000/api/auth/google/onetap', { idToken: idToken })
        .then(async (res) => { // <- 追加
          console.log('Received response from server', res);
          if (res.status === 200) {
            console.log('Authentication succeeded!');
            // resにトークンが含まれていたらlocalStorageに保存
            if (res.data.token) {
              console.log(res.data.token);
              localStorage.setItem('jwt', res.data.token);
              console.log(localStorage.getItem('jwt'));
              // ユーザー情報を取得
              await userStore.fetchUser();

              // ログイン成功後、リダイレクト先が /chat であれば、チャットを有効化
              if (userStore.redirectAfterLogin === '/chat') {
                await userStore.toggleChatEnabled(true);
              }
              this.$emit('close');
              // モーダルが閉じた後に、redirectAfterLogin ステートの値に基づいてリダイレクト
              if (userStore.redirectAfterLogin) {
                this.$router.push(userStore.redirectAfterLogin);
                userStore.redirectAfterLogin = null; // リダイレクトが完了したら値をリセット
              } else {
                this.$router.push('/'); // デフォルトのリダイレクト先
              }
            }
          }
        })
        .catch(error => {
          console.error('Authentication failed: ', error);
        });
    },
    // Google Sign-Inを初期化し、ユーザーに再認証を要求
    initializeGoogleSignInButton() {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        // Google Sign-Inを初期化
        google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: this.handleCredentialResponse
        });
        // ユーザーに再認証を要求するためのメソッド
        google.accounts.id.prompt();
      }
    }
  },
  data() {
    return {
      username: '',
      buttonState: 'normal',
      googleLoaded: false
    };
  }
};
</script>

<style scoped>
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
}

.modal {
  width: 42%;
  height: 62%;
  overflow: hidden;
  border-radius: 20px;
  margin-top: 6%;
  display: flex;
  flex-direction: column;
}

.modal_header {
  position: relative;
  background-color: #efece0;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

h1 {
  margin-top: 7%;
  margin-bottom: 3%;
  font-family: 'Abril Fatface', cursive;
  color: #1a1f39;
  font-weight: normal;
  font-size: 1.9rem;
}

p {
  font-weight: 300;
  font-size: 0.8rem;
  line-height: 1.5;
  display: inline-block;

  color: #e29d3c;
}

.modal_body {
  background-color: #fff;
  padding: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 25%;
  height: auto;
  position: absolute;
  bottom: 0.5%;
  right: 0.5%;
}

/* 自作ボタン
.login_button {
  width: 190px;
  height: 46px;
  border: none;
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.login_button {
  background-image: url('@/assets/images/btn_google_signin_light_normal_web@2x.png');
}

.login_button:hover {
  background-image: url('@/assets/images/btn_google_signin_light_focus_web@2x.png');
}

.login_button:active {
  background-image: url('@/assets/images/btn_google_signin_light_pressed_web@2x.png');
} */
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
</style>
