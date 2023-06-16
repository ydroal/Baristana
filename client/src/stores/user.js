import { defineStore } from 'pinia';
// import axios from 'axios';
import axiosInstance from '@/axios';

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    // ログインユーザー情報を保持
    user: null,
    chat_enabled: false, // 初期値をfalseに設定
    redirectAfterLogin: null, // ログイン後にユーザーをリダイレクトするURL
    api: 'http://localhost:3000/api/'
  }),
  getters: {
    isLoggedIn: state => !!state.user, // ログイン状態を表す。!!でBooleanに変換
    getUser: state => state.user
    // isChatEnabled: state => state.chat_enabled // 追加
  },
  actions: {
    isJwtTokenExists() {
      return !!localStorage.getItem('jwt');
    },
    // async fetchUser() {
    //   if (this.isJwtTokenExists()) {
    //     // このインスタンスの isJwtTokenExists メソッドを呼び出す
    //     const response = await axios.get(`${this.api}auth/user`);
    //     this.user = response.data;
    //     console.log('userゲット');
    //     console.log(this.user);
    //   } else {
    //     console.log('JWTトークンが存在しないため、fetchUserは実行されません');
    //     // ログインしていない場合、userをnullに設定
    //     this.user = null;
    //   }
    // },
    async fetchUser() {
      if (this.isJwtTokenExists()) {
        try {
          const response = await axiosInstance.get(`${this.api}auth/user`);
          this.user = response.data;
          console.log('Received user data: ', response.data);
        } catch (error) {
          this.user = null; // ユーザー情報が取得できなかった場合にはnullを設定
          console.error(error);
        }
      } else {
        console.log('JWTトークンが存在しないため、fetchUserは実行されません');
      }
    },
    logout() {
      axiosInstance
        .post(`${this.api}auth/logout`)
        .then(() => {
          this.user = null;
          // JWTを削除
          localStorage.removeItem('jwt');
        })
        .catch(error => {
          console.error(error);
        });
    },

    async toggleChatEnabled() {
      console.log('toggleChatEnabled called');
      console.log(`User ID: ${this.user.id}`);
      // 想定している新しいchat_enabledの値
      const newChatEnabled = !this.chat_enabled;
      try {
        // APIに新しいchat_enabledの値を送信
        await axiosInstance.put(`${this.api}active_user/${this.user.id}/chat_enabled`, { chat_enabled: newChatEnabled });
        // API通信が成功した場合にのみchat_enabledを更新
        this.chat_enabled = newChatEnabled;
        console.log('Request successful');
      } catch (error) {
        console.error('Request failed', error);
        throw error;
      }
    }
  }
});

// Set axios defaults after the store definition
// axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwt')}`;
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('jwt');
//   config.headers.Authorization = token ? `Bearer ${token}` : '';
//   return config;
// });
