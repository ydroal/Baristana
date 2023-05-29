import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

// Dummy function to emulate user authentication check
function isUserLoggedIn() {
  // TODO: Implement real authentication check
  return true;
}

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
      component: () => import('../views/UserSetting.vue')
      //meta: { requiresAuth: true }  ログインが必要なページにはこのフィールドを追加
    }
  ]
});

// グローバルな前処理ガードを設定
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // ログインが必要なルートへのアクセスで、ユーザーがログインしていない場合、ログインページへリダイレクト
    if (!isUserLoggedIn()) {
      // ユーザーがログインしているかどうかをチェックする実装
      next('/login');
    } else {
      next();
    }
  } else {
    next(); // ログインが必要ないページへは直接アクセス可能
  }
});

export default router;
