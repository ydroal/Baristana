<template>
  <div class="chatting_btn">
    <span class="btn_label">Chatting</span>
    <label class="toggle_btn">
      <input type="checkbox" />
    </label>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    // 必要に応じて、音量を変更するためのメソッドをここに定義する
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
</style>
