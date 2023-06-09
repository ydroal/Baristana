import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    // ログインユーザー情報を保持
    user: null,
    api: 'http://localhost:3000/api/'
  }),
  getters: {
    isLoggedIn: state => !!state.user, // ログイン状態を表す。!!でBooleanに変換
    getUser: state => state.user
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
          const response = await axios.get(`${this.api}auth/user`);
          this.user = response.data;
        } catch (error) {
          this.user = null;  // ユーザー情報が取得できなかった場合にはnullを設定
          console.error(error);
        }
      } else {
        console.log('JWTトークンが存在しないため、fetchUserは実行されません');
      }
    },

    logout() {
      axios
        .post(`${this.api}auth/logout`)
        .then(() => {
          this.user = null;
          // JWTを削除
          localStorage.removeItem('jwt');
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
});

// Set axios defaults after the store definition
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwt')}`;
