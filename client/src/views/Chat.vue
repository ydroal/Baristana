<template>
  <div class="chat-page">
    <div class="volume-slider-wrap">
      <div class="volume-slider" v-if="isAudioSourcesLoaded">
        <VolumeSlider soundType="Cafe music" :audioSources="cafeMusic" />
        <VolumeSlider soundType="Barista sounds" :audioSources="baristaSounds" />
        <VolumeSlider soundType="People talking" :audioSources="peopleTalking" />
        <ToggleButton class="chat-toggle" @click="toggleChatDisplay" @toggle-chat="handleChatToggle" />
      </div>
    </div>
    <div class="chat-table">
      <!-- active user information -->
      <div class="active-users">
        <!-- Add active users -->
        <span v-for="(user, index) in displayedUsers" :key="user.id">
          {{ user.userName }}
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
          :class="message.userId === currentUserId ? 'message-right' : 'message-left'"
        >
          <img v-if="message.userId !== currentUserId" :src="message.usericon || UserIcon2" class="user-icon" />
          <div class="user-contents">
            <div v-if="message.userId !== currentUserId" class="user-name">{{ message.username }}</div>
            <div v-if="message.imageUrl" class="message-image"><img :src="message.imageUrl" /></div>
            <div v-else class="message-text">{{ message.msg }}</div>
            <!-- <div class="message-text">{{ message.msg }}</div> -->
          </div>
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>
      <hr class="hr-foot" />
      <!-- typing area -->
      <div class="typing-area">
        <div class="message-file-sending" v-if="selectedFile">File Selected</div>
        <div class="warning" v-if="selectedFile && fileMib > 3">
          File size must be 3MB or less! Please select a different file or cancel the current selection.
        </div>
        <textarea
          v-if="!selectedFile"
          v-model="currentMessage"
          @keydown.enter.exact="sendMessage"
          placeholder="Type a message"
          rows="4"
          class="chat-input"
        ></textarea>
        <!-- <div class="attached-file-icon" v-if="selectedFile">{{ selectedFile.name }}</div> -->
        <div class="icon" v-if="!selectedFile">
          <img :src="EmojiIcon" alt="EmojiIcon" class="emoji-icon" @click="showEmojiPicker = !showEmojiPicker" />
          <div v-if="showEmojiPicker" class="emoji-picker">
            <EmojiPicker @emoji_click="addEmoji" />
          </div>
          <input
            type="file"
            ref="fileInput"
            multiple
            accept="image/*,.pdf"
            class="file-input"
            @change="handleFileUpload"
          />
          <img :src="AttachIcon" alt="AttachIcon" class="attach-icon" @click="triggerFileInput" />
        </div>
        <div class="send-button" v-if="selectedFile && fileMib <= 3">
          <img :src="SendIcon" alt="SendIcon" class="send-icon" @click="sendUploadedFile" />
        </div>
        <div class="preview-image" v-if="selectedFile">
          <img :src="previewImageUrl" alt="Preview" class="preview-img" />
          <div><button class="close_button" @click="closePreview">&#10005;</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import { useBgmStore } from '@/stores/bgm';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import io from 'socket.io-client'; //Socket.IOクライアントをインポート
import VolumeSlider from '../components/VolumeSlider.vue';
import ToggleButton from '../components/ToggleButton.vue';
import EmojiIcon from '@/assets/images/icon_emoji.svg';
import AttachIcon from '@/assets/images/icon_attach_file.svg';
import SendIcon from '@/assets/images/icon_send.svg';
import EmojiPicker from '@/components/EmojiPicker.vue';
import UserIcon2 from '@/assets/images/icon_user2.png';

export default {
  components: {
    VolumeSlider,
    ToggleButton,
    EmojiPicker
  },
  setup() {
    const bgmStore = useBgmStore();
    const userStore = useUserStore();

    // 音源データのフェッチが完了したかどうかを示すステート
    const isAudioSourcesLoaded = ref(false);

    const cafeMusic = computed(() => bgmStore.cafe_music);
    const baristaSounds = computed(() => bgmStore.barista_sounds);
    const peopleTalking = computed(() => bgmStore.people_talking);
    const currentUserId = computed(() => (userStore.getUser ? userStore.getUser.id : null));

    const socket = io('http://localhost:3000');
    // const currentUserId = ref(1);

    // アクティブユーザーリストを保持するリアクティブ変数
    let activeUsers = ref([
      // { userId: 1, userName: 'Julien' },
      // { userId: 2, icon: UserIcon2, userName: 'Issey' }
    ]);
    const messages = ref([
      // { userId: 1, msg: 'Hello!', username: Yoko, usericon: null },
      // {
      //   userId: 2,
      //   msg: 'Hi there! blablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablabla', username: Issey, usericon: null
      // },
      // { userId: 2, msg: 'How are you?' }
    ]);
    const currentMessage = ref('');
    const showEmojiPicker = ref(false);
    const fileInput = ref(null);
    const errorMessage = ref(null);

    // chatのオンオフ
    const isChatVisible = ref(true);
    const router = useRouter();

    let selectedFile = ref(null); // 選択された画像ファイルを保持するための変数
    let previewImageUrl = ref(null);
    let fileMib = ref(null);

    onMounted(async () => {
      // Promise.all の結果を await で待つように修正
      await Promise.all([bgmStore.fetchCafeMusic(), bgmStore.fetchBaristaSounds(), bgmStore.fetchPeopleTalking()]);
      // 音源データのフェッチが完了したらフラグをセット
      isAudioSourcesLoaded.value = true;
      // ユーザーIDをsocket.IOサーバーに送信
      socket.emit('login', currentUserId.value);
      // 'user joined'イベントをサーバに送信
      socket.emit('user joined', currentUserId.value);
    });

    socket.on('active users update', updatedActiveUsers => {
      // サーバから送られてきた最新のアクティブユーザーリストを取得
      activeUsers.value = updatedActiveUsers;
    });

    const disconnectChat = () => {
      socket.disconnect(); // ここで'socket'はChat.vueで初期化されたsocket.ioのインスタンスを参照
      messages.value = []; // メッセージをクリア
    };

    // チャットがオンオフを制御する関数
    const handleChatToggle = async isChatActive => {
      console.log('chat Page:handleChatToggle called with:', isChatActive);
      if (userStore.isLoggedIn) {
        await userStore.toggleChatEnabled(isChatActive);
      }

      if (!isChatActive) {
        disconnectChat(); // チャットが非アクティブになったとき、disconnectChatメソッドを呼び出します。
        router.push('/'); // チャットが非アクティブの場合、ホームにリダイレクト
      }
    };

    const toggleChatDisplay = () => {
      isChatVisible.value = !isChatVisible.value;
      handleChatToggle(isChatVisible.value);
      // if (!isChatVisible.value) {
      //   router.push('/');
      // }
    };
    // const toggleChatDisplay = () => {
    //   isChatVisible.value = !isChatVisible.value;
    //   // チャットのアクティブユーザーではなくなったことをDBに伝える処理を追加する
    //   router.push('/');
    // };

    const displayedUsers = computed(() => {
      // composition apiではthisは使用しない。valueでアクセス
      return activeUsers.value.slice(0, 3);
    });

    const addEmoji = emoji => {
      console.log('addEmoji called');
      console.log(emoji);
      currentMessage.value += emoji;
      showEmojiPicker.value = false;
    };

    // ファイル選択ダイアログを開くメソッド
    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleFileUpload = event => {
      selectedFile.value = event.target.files[0];
      let fileSize = event.target.files[0].size;
      fileMib.value = fileSize / 1024 ** 2;
      previewImageUrl.value = URL.createObjectURL(selectedFile.value); //オブジェクトURLを作成
    };

    const closePreview = () => {
      selectedFile.value = null;
      previewImageUrl.value = null;
    };

    // サーバーからのメッセージを待ち受けるリスナーを追加
    socket.on('chat message', messageObj => {
      // 受け取ったメッセージをmessagesに追加
      // messageObjは、メッセージテキスト、ユーザー名、ユーザーアイコンを含むオブジェクト
      if (messageObj.usericon) {
        const s3_bucket_name = import.meta.env.VITE_APP_BUCKET_NAME;
        const s3_region = import.meta.env.VITE_APP_S3_REGION;
        const obj_key = `${import.meta.env.VITE_APP_S3_OBJ_ICONS}/${messageObj.usericon}`;
        messageObj.usericon = `https://${s3_bucket_name}.s3.${s3_region}.amazonaws.com/${obj_key}`;
      }
      messages.value.push(messageObj);
      console.log(messageObj);
    });
    // サーバーからの画像ファイルを受信するリスナー
    socket.on('chat file', fileObj => {
      // 受け取ったメッセージをmessagesに追加
      // fileObjは、画像ファイル、ユーザー名、ユーザーアイコンを含むオブジェクト
      if (fileObj.usericon) {
        const s3_bucket_name = import.meta.env.VITE_APP_BUCKET_NAME;
        const s3_region = import.meta.env.VITE_APP_S3_REGION;
        const obj_key = `${import.meta.env.VITE_APP_S3_OBJ_ICONS}/${fileObj.usericon}`;
        fileObj.usericon = `https://${s3_bucket_name}.s3.${s3_region}.amazonaws.com/${obj_key}`;
      }
      const blob = new Blob([fileObj.file]); //ブラウザからアクセスできるようblobに変換
      const url = URL.createObjectURL(blob); //blobにアクセスするURLを発行
      messages.value.push({ ...fileObj, imageUrl: url });
    });

    // メッセージを送信するメソッドを定義
    const sendMessage = () => {
      // メッセージが空でなければ送信します
      if (currentMessage.value.trim() !== '') {
        socket.emit('chat message', currentMessage.value);
        currentMessage.value = ''; // メッセージをクリアします
      }
    };
    // ファイルを送信するメソッドを定義
    const sendUploadedFile = () => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        socket.emit('uploaded file', arrayBuffer, error => {
          console.log('送るよ！');
          if (error) {
            console.error('Error sending the file: ', error);
          } else {
            console.log('File sent successfully');
          }
        });
        selectedFile.value = null;
      };
      reader.readAsArrayBuffer(selectedFile.value);
    };

    // ファイルの容量オーバーで送信できなかった場合のエラーを受信
    socket.on('upload error', data => {
      errorMessage.value = data.message;
      setTimeout(() => {
        errorMessage.value = null;
      }, 5000); // 5秒後にerrorMessageをnullに設定
    });

    return {
      cafeMusic,
      baristaSounds,
      peopleTalking,
      isAudioSourcesLoaded,
      activeUsers,
      currentUserId,
      messages,
      displayedUsers,
      EmojiIcon,
      AttachIcon,
      SendIcon,
      currentMessage,
      showEmojiPicker,
      UserIcon2,
      fileInput,
      selectedFile,
      previewImageUrl,
      fileMib,
      errorMessage,
      addEmoji,
      triggerFileInput,
      handleFileUpload,
      toggleChatDisplay,
      sendMessage,
      closePreview,
      sendUploadedFile
    };
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

.volume-slider-wrap {
  width: 35%;
  margin-top: 4%;
  margin-left: 2.8%;
}
.volume-slider {
  width: 100%;
}

/* .chat-toggle {
  margin-left: 1.2%;
} */
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
  overflow: auto;
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
.message-left .message-image {
  width: 100%;
  max-width: 300px;
  /* background-color: #a5a4a1; */
  height: auto; /* 画像のアスペクト比を保持 */
  /* border-radius: 0px 12px 12px 12px; */
  margin-left: 0.3rem;
  margin-top: 21px; /* user-iconの高さの半分＋マージン */
  text-align: center;
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
.message-right .message-image {
  /* width: 50%; */
  max-width: 300px;
  align-self: flex-end;
  height: auto; /* 画像のアスペクト比を保持 */
  margin-right: 0.8rem;
  text-align: center;
}
.message-image img {
  width: 100%;
  border-radius: 12px;
  height: auto; /* 画像のアスペクト比を保持 */
  object-fit: cover; /* アスペクト比を保持しながら、コンテナに画像をフィットさせる */
}
.error-message {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: #f30100;
  margin-right: 0.8rem;

  font-weight: 300;
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

.message-file-sending {
  width: 80%;
  margin-top: 0.5rem;
  color: #ed923c;
  padding: 0.5rem;
  text-align: center;
  position: relative;
}
.warning {
  width: 80%;
  margin-top: 0.5rem;
  color: #ffffff;
  padding: 0.5rem;
  text-align: center;
  background-color: #ed923c;
  position: absolute;
  bottom: 0.5rem;
  left: 0;
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
.icon,
.send-button {
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
.send-icon {
  width: 1.6rem;
  margin-left: 0.2rem;
  margin-top: 0.4rem;
}

.emoji-picker {
  position: absolute;
  bottom: 20%;
  right: 0;
}
.file-input {
  display: none;
}
.preview-image {
  width: 30%;
  max-width: 180px;
  background-color: #ffffff;
  border-radius: 8%;
  height: auto; /* 画像のアスペクト比を保持 */
  /* object-fit: cover; アスペクト比を保持しながら、コンテナに画像をフィットさせる */
  position: absolute;
  bottom: 20%;
  right: 0;
}
.preview-img {
  width: 100%;
  height: auto; /* 画像のアスペクト比を保持 */
  object-fit: cover; /* アスペクト比を保持しながら、コンテナに画像をフィットさせる */
}
.close_button {
  position: absolute;
  top: 0.3%;
  left: 0.3%;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #ed923c;
  color: #f4f2f0;
  font-size: 1em;
  font-weight: 100;
  line-height: 1.5rem;
  text-align: center;
  border: none;
  cursor: pointer;
}
/* .attached-file-icon {
  padding: 0.8rem;
  background-color: #ed923c;
  color: #f4f2f0;
  border-radius: 6px;
  font-size: 0.8rem;
  height: 1.5rem;
  text-align: center;
} */

@media (min-width: 768px) and (max-width: 980px) and (min-height: 850px) {
  .chat-page {
    flex-direction: column;
    justify-content: unset;
    overflow: auto;
  }
  .volume-slider-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 344px;
    margin: 0 auto;
    margin-top: 3%;
    margin-bottom: 2%;
  }
  .volume-slider {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0 auto;
    margin-left: 0;
  }
  .chat-toggle {
    margin-top: 2%;
  }
  .chat-table {
    width: 80%;
    height: 45vh;
    /* max-height: 300px; */
    margin: 0 auto;
    margin-top: 5%;
    overflow: auto;
  }
  .icon {
    width: 6%;
    align-items: flex-start;
    margin-right: 1.8rem;
    margin-top: 1rem;
  }
  .emoji-icon,
  .attach-icon {
    width: 1.3rem;
    margin-left: 0.5rem;
  }
  .emoji-picker {
    position: absolute;
    bottom: 20%;
    right: -3.5%;
  }
}
@media (min-width: 768px) and (max-width: 980px) and (max-height: 849.98px) {
  .volume-slider-wrap {
    width: 244px;
    margin-top: 4%;
    margin-left: 2.8%;
  }
  .volume-slider {
    width: 100%;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) and (orientation: landscape) {
  .chat-page {
    position: relative;  /* Not fixed */
    min-height: 100vh;
    flex-direction: column;
    justify-content: unset;
    overflow: auto;
  }
  .volume-slider-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 344px;
    margin: 0 auto;
    height: auto;
  }
  .volume-slider {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0 auto;
    margin-left: 0;
  }
  .chat-toggle {
    margin-top: 2%;
  }
  .chat-table {
    width: 85%;
    height: auto;
    margin: 0 auto;
    margin-top: 1%;
  }
}
@media (min-width: 576px) and (max-width: 767.98px) {
  .chat-page {
    flex-direction: column;
    justify-content: unset;
    overflow: auto;
  }
  .volume-slider-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 344px;
    margin: 0 auto;
  }
  .volume-slider {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0 auto;
    margin-left: 0;
  }
  .chat-toggle {
    margin-top: 2%;
  }
  .chat-table {
    width: 85%;
    height: 40vh;
    margin: 0 auto;
    margin-top: 3%;
  }
  .icon {
    width: 12%;
    align-items: flex-start;
    position: absolute;
    bottom: 7%;
    left: 85%;
    /* margin-right: 2rem;
    margin-top: 0.4rem; */
  }
  .typing-area textarea {
    margin: 0rem 0 auto 1.3rem;
    width: 78%;
    height: 15%;
    position: absolute;
    left: 0;
  }
  .message-area {
    height: 65%;
    overflow-y: auto; /*コンテンツが指定された高さを超えた場合、垂直方向にスクロールバーが表示*/
  }
  .emoji-picker {
    position: absolute;
    bottom: 96%;
    right: 0%;
  }
}

@media (max-width: 575.98px) {
  .chat-page {
    flex-direction: column;
    justify-content: unset;
    overflow: auto;
  }

  .volume-slider-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 244px;
    margin: 0 auto;
    margin-top: 1rem;
  }
  .volume-slider {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    height: 50%;
    margin: 0 auto;
    margin-left: 0;
  }
  .chat-toggle {
    margin-top: 2%;
  }
  .chat-table {
    width: 85%;
    height: 44vh;
    margin: 0 auto;
    margin-top: 0;
    margin-bottom: 2%;
  }
  .message-area {
    height: 28vh;
  }
  .typing-area textarea {
    /* margin: 0.4rem 0 auto 1.3rem; */
    width: 76%;
    height: 12%;
    position: absolute;
    bottom: 5%;
    left: 0;
  }
  .icon {
    width: 8%;
    align-items: flex-start;
    position: absolute;
    bottom: 11.3%;
    left: 80%;
    /* margin-right: 2rem;
    margin-top: 0.4rem; */
  }
  .emoji-icon,
  .attach-icon {
    width: 1.2rem;
    margin-left: 0.4rem;
  }
  .emoji-picker {
    position: absolute;
    bottom: 100%;
    right: 0%;
  }
  .message-file-sending {
    margin-top: 0;
    padding: 0.3rem;
  }
  .warning {
    width: 80%;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    bottom: -1.8rem;
    left: 0;
  }
}
@media (max-height: 418px) {
  .chat-page {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .volume-slider-wrap {
    width: 30%;
    margin-top: 5%;
    margin-left: 2.8%;
  }
  .volume-slider {
    width: 100%;
  }

  .chat-table {
    position: relative;
    width: 55%;
    height: 70vh;
    margin-top: 2%;
    margin-right: 3%;
    background-color: #232321;
    opacity: 76%;
    color: #efece0;
    border-radius: 20px;
    overflow: auto;
  }
  .message-area {
    height: 44vh;
  }
  .icon {
    width: 8%;
    align-items: flex-start;
    position: absolute;
    bottom: 8%;
    left: 82%;
  }
  .typing-area textarea {
    margin: 0rem 0 auto 1.3rem;
    width: 75%;
    height: 15%;
    position: absolute;
    left: 0;
  }
  .emoji-picker {
    position: absolute;
    bottom: 100%;
    right: 0%;
  }
  .emoji-icon,
  .attach-icon {
    width: 1.3rem;
    margin-left: 0.5rem;
  }
}
</style>
