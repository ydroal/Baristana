<template>
  <div class="user-setting">
    <div class="user-setting_card">
      <div class="user-setting_icon">
        <img :src="UserIcon2" alt="UserIcon" class="user_icon" />
      </div>
      <h2 class="user-setting_title">My account</h2>
      <hr />
      <div class="user-setting_text">
        <p class="user-setting_text_title">User name</p>
        <p class="user-setting_text_sub">This will be displayed throughout this website</p>
        <input class="user-setting_input" type="text" :disabled="!editMode" />
      </div>
      <div class="user-setting_text">
        <p class="user-setting_text_title">Email</p>
        <input class="user-setting_input" type="text" :disabled="!editMode" />
      </div>
      <button @click="edit" class="user-setting_edit-button" v-if="!editMode">Edit</button>
      <button @click="save" class="user-setting_edit-button" v-if="editMode">Update</button>
    </div>
  </div>
</template>

<script>
import UserIcon2 from '@/assets/images/icon_user2.svg';

export default {
  components: {},
  data() {
    return {
      UserIcon2,
      editMode: false
    };
  },
  setup() {},
  methods: {
    edit() {
      this.editMode = true;
    },
    save() {
      this.editMode = false;
    }
  }
};
</script>

<style scoped>
.user-setting {
  display: flex;
  justify-content: center;
}

.user-setting_card {
  background-color: #e4af63;
  border-radius: 20px;
  width: 48%;
  height: 68%;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-top: 4%;
}

.user-setting_icon {
  background-color: white;
  border-radius: 50%;
  width: 124px;
  height: 124px;
  position: absolute;
  top: -62px; /* 円の半分を外に出す */
  left: calc(50% - 62px); /* 左辺を親要素の左辺から中央（50%）に配置、さらに62px左にオフセット */
  overflow: hidden;
}
.user_icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  transform: translate(-50%, -50%);
}
.user-setting_title {
  align-self: flex-start;
  margin-top: 4rem;
  margin-left: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #efece0;
}
hr {
  width: 100%;
  border: 0.5px solid #efece0;
  margin-top: 0.5rem;
  margin-bottom: 10%;
}
.user-setting_text {
  color: #efece0;
  margin-bottom: 4%;
  width: 50%;
}
.user-setting_text_title {
  font-size: 0.7rem;
  font-weight: 500;
  color: #efece0;
  margin-left: 0.3rem;
}
.user-setting_text_sub {
  font-size: 0.7rem;
  font-weight: 200;
  color: #efece0;
  margin-top: 0.3rem;
  margin-left: 0.3rem;
}

.user-setting_input {
  width: 100%;
  height: 2.2rem;
  border-radius: 13px;
  background-color: #efecdf;
  margin-top: 0.4rem;
  border: none;
  padding: 0 10px;
  color: #232121;
  font-weight: 300;
  font-size: 0.8rem;
}
.user-setting_input:focus {
  outline: none;
  border: 4px solid #fff;
}
.user-setting_edit-button {
  background-color: #232121;
  width: 86px;
  color: #efece0;
  font-weight: 300;
  padding: 10px 12px 10px 12px;
  border-radius: 60px;
  border-style: none;
  margin: auto 1.3rem 1.3rem auto;
  font-size: 0.9rem;
  align-self: flex-end;
}
</style>
