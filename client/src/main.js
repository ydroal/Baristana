import 'normalize.css';
// import './assets/main.css';
import './assets/css/style.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
// import axios from 'axios';
// import GAuth from 'vue-google-oauth2';
// import GAuth from 'vue3-google-oauth2';

const app = createApp(App);

// const gAuthOptions = {
//   // 直接書かずに.envファイルを作成して呼び出す
//   clientId: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID,
//   scope: 'profile email',
//   prompt: 'select_account'
// };

app.use(createPinia()); //Piniaを生成してアプリで読み込む
app.use(router);
// app.use(GAuth, gAuthOptions);
app.mount('#app');
