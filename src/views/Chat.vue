<template>
  <div class="chat-page">
    <div class="volume-slider">
      <VolumeSlider soundType="Cafe music" audioSource="url-to-cafe-music" />
      <VolumeSlider soundType="Barista sounds" audioSource="url-to-barista-sounds" />
      <VolumeSlider soundType="People talking" audioSource="url-to-people-talking" />
      <ToggleButton class="chat-toggle" />
    </div>
    <div class="chat-table">
      <!-- active user information -->
      <div class="active-users">
        <!-- Add active users -->
        <span v-for="(user, index) in displayedUsers" :key="user.id">
          {{ user.name }}
          <span v-if="index < displayedUsers.length - 1">,&nbsp;</span>
        </span>
        <span v-if="activeUsers.length > 3">...</span>
        [{{ activeUsers.length }}]
      </div>
      <hr />
      <div class="message-area">
        <!-- Add messages -->
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="message.user === currentUserId ? 'message-right' : 'message-left'"
        >
          <img v-if="message.user !== currentUserId" :src="getUserById(message.user).icon" class="user-icon" />
          <div class="user-contents">
            <div v-if="message.user !== currentUserId" class="user-name">{{ getUserById(message.user).name }}</div>
            <div class="message-text">{{ message.text }}</div>
          </div>
        </div>
      </div>
      <hr class="hr-foot" />
      <!-- typing area -->
      <div class="typing-area">
        <textarea
          v-model="message"
          @keydown.enter.exact="sendMessage"
          placeholder="Type a message"
          rows="4"
          class="chat-input"
        ></textarea>
        <div class="icon">
          <img :src="EmojiIcon" alt="EmojiIcon" class="emoji-icon" @click="showEmojiPicker = !showEmojiPicker" />
          <div v-if="showEmojiPicker" class="emoji-picker">
            <EmojiPicker @emoji-click="addEmoji" />
          </div>
          <input type="file" ref="fileInput" multiple class="file-input" @change="handleFileUpload" />
          <img :src="AttachIcon" alt="AttachIcon" class="attach-icon" @click="triggerFileInput" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios';
import VolumeSlider from '../components/VolumeSlider.vue';
import ToggleButton from '../components/ToggleButton.vue';
import EmojiIcon from '@/assets/images/icon_emoji.svg';
import AttachIcon from '@/assets/images/icon_attach_file.svg';
import EmojiPicker from '@/components/EmojiPicker.vue';
import UserIcon2 from '@/assets/images/icon_user2.png';

export default {
  data() {
    return {
      activeUsers: [
        { id: 1, name: 'Julien' },
        { id: 2, icon: UserIcon2, name: 'Issey' },
        { id: 3, name: 'Emma' },
        { id: 4, name: 'Yon' }
      ],
      currentUserId: 1,
      messages: [
        { user: 1, text: 'Hello!' },
        {
          user: 2,
          text: 'Hi there! blablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablabla'
        },
        { user: 2, text: 'How are you?' },
        {
          user: 1,
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
        },
        {
          user: 2,
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque nec nam aliquam sem. Tempus egestas sed sed risus pretium quam. Odio tempor orci dapibus ultrices in iaculis nunc sed augue. Auctor eu augue ut lectus arcu bibendum at varius. Senectus et netus et malesuada fames ac turpis egestas sed.'
        },
        { user: 2, text: 'Hello!' }
      ],
      EmojiIcon,
      AttachIcon,
      message: '',
      showEmojiPicker: false,
      UserIcon2
    };
  },
  computed: {
    displayedUsers() {
      // Return only the first 3 active users
      return this.activeUsers.slice(0, 3);
    }
  },
  methods: {
    // emojiは選択された絵文字
    addEmoji(emoji) {
      // 選択された絵文字を現在のメッセージに追加
      this.message += emoji;
      // 絵文字ピッカーを閉じる
      this.showEmojiPicker = false;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      console.log(file); // デバッグ用
      // アップロードファイルの処理を書く
    },
    getUserById(id) {
      return this.activeUsers.find(user => user.id === id);
    }
  },
  components: {
    VolumeSlider,
    ToggleButton,
    EmojiPicker
  }
};
</script>

<style scoped>
input,
textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  border: none;
  border-radius: 0;
  font: inherit;
  outline: none;
}

textarea {
  resize: vertical;
}

input[type='checkbox'],
input[type='radio'] {
  display: none;
}

input[type='submit'],
input[type='button'],
label,
button,
select {
  cursor: pointer;
}

select::-ms-expand {
  display: none;
}
.chat-page {
  display: flex;
  justify-content: space-between;
}

.volume-slider {
  width: 33.33%;
  margin-top: 5.6%;
  margin-left: 2.8%;
}
.chat-toggle {
  margin-left: 2.8%;
}
.chat-table {
  position: relative;
  width: 55%;
  height: 70vh;
  margin-top: 2%;
  margin-right: 3.6%;
  background-color: #232321;
  opacity: 76%;
  color: #efece0;
  border-radius: 20px;
}
.active-users {
  color: #efece0;
  font-size: 0.8rem;
  font-weight: 300;
  margin: 1rem auto 1rem 1.3rem;
}
hr {
  width: 100%;
  border: 0.5px solid #efece0;
}

.message-area {
  height: 70%;
  overflow-y: auto; /*コンテンツが指定された高さを超えた場合、垂直方向にスクロールバーが表示*/
}
.message-text {
  font-size: 0.8rem;
  font-weight: 300;
  line-height: 1.2rem;
  padding: 7px;
  display: inline-block;
  max-width: 30rem;
  word-wrap: break-word;
  margin-top: 0.5rem;
}
.user-contents {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: flex-start;
}

.message-left {
  display: flex;
  justify-content: flex-start;
}
.user-icon {
  height: 36px;
  width: 36px;
  border-radius: 18px;
  margin-left: 0.8rem;
  align-self: flex-start;
  margin-top: 19px;
  object-fit: cover;
}

.user-name {
  position: relative;
  top: 1rem;
  left: 0.3rem;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 300;
}
.message-left .message-text {
  background-color: #a5a4a1;
  color: #ffffff;
  border-radius: 0px 12px 12px 12px;
  margin-left: 0.3rem;
  margin-top: 21px; /* user-iconの高さの半分＋マージン */
}

.message-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.message-right .message-text {
  background-color: #efece0;
  color: #232121;
  border-radius: 12px 0 12px 12px;
  margin-right: 0.8rem;
}

.hr-foot {
  position: absolute;
  top: 80%;
  left: 0;
}
.typing-area {
  display: flex;
  justify-content: space-between;
}

.typing-area textarea {
  margin: 0.5rem 0 auto 1.3rem;
  width: 80%;
  height: 10%;
}

.chat-input {
  color: #efece0;
  font-size: 0.8rem;
  font-weight: 300;
  line-height: 1.2rem;
  resize: vertical;
}

.typing-area textarea::placeholder {
  color: #efece0;
  opacity: 1;
}
.icon {
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 1.3rem;
}
.emoji-icon,
.attach-icon {
  width: 1.5rem;
  margin-left: 0.2rem;
}
.attach-icon {
  transform: rotate(45deg);
}

.emoji-picker {
  position: absolute;
  bottom: 20%; /* 絵文字ピッカーの位置指定 */
  right: 0; /* 絵文字ピッカーの位置指定 */
}
.file-input {
  display: none;
}
</style>
