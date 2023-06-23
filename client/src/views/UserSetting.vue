<template>
  <div class="user-setting">
    <div class="user-setting_card">
      <div class="user-setting_icon">
        <input id="file-input" type="file" @change="onFileChange" :disabled="!editMode" style="display: none" />
        <div class="preview-image" v-if="editMode && selectedFile">
          <img :src="previewImageUrl || userInfo.profile_picture_url || UserIcon2" alt="Preview" class="preview-icon" />
        </div>
        <!-- <label for="file-input"> -->
        <label for="file-input" v-if="!selectedFile || !editMode">
          <img :src="userInfo.profile_picture_url || UserIcon2" alt="UserIcon" class="user_icon" />
        </label>
      </div>
      <h2 class="user-setting_title">My account</h2>
      <hr />
      <div class="user-setting_text">
        <p class="user-setting_text_title">User name</p>
        <p class="user-setting_text_sub">This will be displayed throughout this website</p>
        <input
          class="user-setting_input"
          type="text"
          :disabled="!editMode"
          v-if="userInfo"
          v-model="userInfo.username"
        />
      </div>
      <div class="user-setting_text">
        <p class="user-setting_text_title">Email</p>
        <p class="user-setting_text_sub attention">Note: Display only. Registered email cannot be changed</p>
        <input class="user-setting_input" type="text" disabled v-model="userInfo.email" />
      </div>
      <div class="buttons">
        <button @click="edit" class="user-setting_edit-button" v-if="!editMode">Edit</button>
        <button @click="update" class="user-setting_edit-button" v-if="editMode">Update</button>
        <button @click="cancelEdit" class="user-setting_cancel-button" v-if="editMode">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios';
import axiosInstance from '@/axios';
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import UserIcon2 from '@/assets/images/icon_user2.svg';

export default {
  setup() {
    const api = import.meta.env.VITE_APP_API_ENDPOINT;
    const userStore = useUserStore();
    const userId = computed(() => (userStore.getUser ? userStore.getUser.id : null));

    let userInfo = ref({ username: '', email: '', profile_picture_url: '' });
    let initialUserInfo = ref({ username: '', email: '', profile_picture_url: '' });
    let editMode = ref(false); // 編集モードを管理するためのref
    let selectedFile = ref(null); // 選択された画像ファイルを保持するための変数
    let previewImageUrl = ref(null);

    onMounted(async () => {
      console.log('userStore.getUser: ', userStore.getUser);
      if (userStore.getUser) {
        console.log('userStore.getUser.id: ', userStore.getUser.id);
      }
      try {
        console.log('userId: ', userId.value);
        const response = await axiosInstance.get(`${api}user/${userId.value}`);
        userInfo.value = response.data[0];
        initialUserInfo.value = { ...response.data[0] }; // ユーザー情報を初期状態として保存。要深いコピー

        if (userInfo.value.profile_picture_url) {
          const s3_bucket_name = import.meta.env.VITE_APP_BUCKET_NAME;
          const s3_region = import.meta.env.VITE_APP_S3_REGION;
          const obj_key = `${import.meta.env.VITE_APP_S3_OBJ_ICONS}/${userInfo.value.profile_picture_url}`;
          userInfo.value.profile_picture_url = `https://${s3_bucket_name}.s3.${s3_region}.amazonaws.com/${obj_key}`;
        }
        console.log('Received full user data: ', response.data);
      } catch (error) {
        userInfo.value = { username: '', email: '', profile_picture_url: '' }; // ユーザー情報が取得できなかった場合にはnullを設定
        initialUserInfo.value = { username: '', email: '', profile_picture_url: '' }; // 初期状態も同様に設定
        console.error(error);
        console.error(error);
      }
    });

    // 選択された画像のプレビューを表示
    const onFileChange = e => {
      selectedFile.value = e.target.files[0];
      previewImageUrl.value = URL.createObjectURL(selectedFile.value); //オブジェクトURLを作成
    };

    const cancelEdit = () => {
      editMode.value = false;
      userInfo.value = { ...initialUserInfo.value }; // 初期状態に戻す
      selectedFile.value = null;
      previewImageUrl.value = null;
    };

    const edit = () => {
      editMode.value = true;
    };

    const update = async () => {
      editMode.value = false;
      if (userInfo.value.username !== initialUserInfo.value.username) {
        // axiosのPUTは第二引数に渡すデータはオブジェクト形式
        await axiosInstance.put(`${api}user/${userId.value}`, {
          username: userInfo.value.username
        });
      }
      // 選択された画像ファイルがあればサーバーに送信する
      if (selectedFile.value) {
        let updateFileUrl = `${userId.value}-${Date.now()}-${selectedFile.value.name}`;
        console.log(updateFileUrl);
        const formData = new FormData();
        formData.append('icon', selectedFile.value);
        formData.append('profile_picture_url', updateFileUrl);
        const response = await axiosInstance.put(`${api}user/${userId.value}/icon`, formData, {
          headers: {
            // 画像をポストする場合の通信形式は multipart/form-data
            'Content-Type': 'multipart/form-data'
            // 'X-HTTP-Method-Override': 'PUT', // PUTに置き換える記述を書く
          }
        });
        // レスポンスから新しい画像のURLを取得して、userInfoのデータを更新する
        userInfo.value.profile_picture_url = response.data.updated_profile_picture_url;
      }
      // ユーザー情報の更新後、初期状態を再設定する
      initialUserInfo.value = { ...userInfo.value };
    };

    // editModeの値が変わったときにファイル選択を有効/無効にする
    watch(editMode, newValue => {
      const fileInput = document.getElementById('file-input');
      if (newValue) {
        fileInput.removeAttribute('disabled');
      } else {
        fileInput.setAttribute('disabled', 'disabled');
      }
    });

    return {
      api,
      userStore,
      UserIcon2,
      userId,
      userInfo,
      editMode,
      selectedFile,
      previewImageUrl,
      cancelEdit,
      edit,
      update,
      onFileChange
    };
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
.user_icon,
.preview-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
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
.attention {
  color: #37604b;
  font-weight: 400;
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
.buttons {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.user-setting_edit-button,
.user-setting_cancel-button {
  background-color: #232121;
  width: 86px;
  color: #efece0;
  font-weight: 300;
  padding: 10px 12px 10px 12px;
  border-radius: 60px;
  border-style: none;
  margin: 2rem 1.3rem 1.3rem 0;
  font-size: 0.9rem;
  align-self: flex-end;
}
</style>
