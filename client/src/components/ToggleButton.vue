<template>
  <div class="chatting_btn">
    <span class="btn_label">Chatting</span>
    <label class="toggle_btn">
      <input type="checkbox" v-model="isChatActive" @change="handleToggleChange" />
    </label>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user';

export default {
  data() {
    const userStore = useUserStore();
    return {
      isChatActive: userStore.chat_enabled // 初期値をuserStoreから取得
    };
  },
  // computed: {
  //   isChatActive() {
  //     return useUserStore().chat_enabled;
  //   }
  // },
  // props: ['isChatActive'], // propsを追加
  // methods: {
  //   handleToggleChange() {
  //     // イベントtoggle-chatを発火し、isChatActiveの値をイベントの引数として親コンポーネントに送る
  //     this.$emit('toggle-chat', this.isChatActive); // トグルステータスが変更されたときにイベントを発火
  //   }
  // }
  // methods: {
  //   async handleToggleChange() {
  //     const userStore = useUserStore();
  //     await userStore.toggleChatEnabled(); // chat_enabled の値をトグル
  //     this.$emit('toggle-chat', userStore.chat_enabled); // 新しい状態を親コンポーネントに送る
  //   }
  // }
  methods: {
    handleToggleChange() {
      // イベントtoggle-chatを発火し、isChatActiveの値をイベントの引数として親コンポーネントに送る
      this.$emit('toggle-chat', this.isChatActive); // トグルステータスが変更されたときにイベントを発火
    }
  }
};
</script>

<style scoped>
.chatting_btn {
  display: flex;
  align-items: center;
  justify-content: left;
  margin-top: 20px;
}
.btn_label {
  margin-right: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.toggle_btn {
  display: inline-block;
  position: relative;
  width: 55px;
  height: 30px;
  border-radius: 30px;
  background-color: #514e48;
  cursor: pointer;
  transition: background-color 0.4s;
}

.toggle_btn:has(:checked) {
  background-color: #dfaf6f;
}

.toggle_btn::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  box-shadow: 0 0 5px rgb(0 0 0 / 20%);
  background-color: #fff;
  content: '';
  transition: left 0.4s;
}

.toggle_btn:has(:checked)::after {
  left: 30px;
}

.toggle_btn input {
  display: none;
}
@media (min-width: 576px) and (max-width: 767.98px) {
  .toggle_btn {
    width: 49.5px;
    height: 27px;
    border-radius: 27px;
  }

  .toggle_btn:has(:checked) {
    background-color: #dfaf6f;
  }

  .toggle_btn::after {
    position: absolute;
    width: 27px;
    height: 27px;
  }

  .toggle_btn:has(:checked)::after {
    left: 27px;
  }
}
@media (min-width: 576px) and (max-width: 767.98px) and (orientation: landscape), (max-height: 418px) {
  .btn_label {
    margin-right: 20px;
    font-size: 0.7rem;
    font-weight: 600;
  }
  .chatting_btn {
    margin-top: 0.4rem;
  }
  .toggle_btn {
    width: 49.5px;
    height: 27px;
    border-radius: 27px;
  }

  .toggle_btn:has(:checked) {
    background-color: #dfaf6f;
  }

  .toggle_btn::after {
    position: absolute;
    width: 27px;
    height: 27px;
  }

  .toggle_btn:has(:checked)::after {
    left: 27px;
  }
}
/* Small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  .toggle_btn {
    width: 49.5px;
    height: 27px;
    border-radius: 27px;
  }

  .toggle_btn:has(:checked) {
    background-color: #dfaf6f;
  }

  .toggle_btn::after {
    position: absolute;
    width: 27px;
    height: 27px;
  }

  .toggle_btn:has(:checked)::after {
    left: 27px;
  }
}
</style>
