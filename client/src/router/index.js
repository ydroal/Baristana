import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/chat',
      name: 'chat',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Chat.vue'),
      meta: { requiresAuth: true } // ログインが必要なページにはこのフィールドを追加
    },
    {
      path: '/user-setting',
      name: 'user-setting',
      component: () => import('../views/UserSetting.vue'),
      meta: { requiresAuth: true } //ログインが必要なページにはこのフィールドを追加
    }
  ]
});

export default router;
