<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import axiosInstance from '@/axios';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import UserIcon2 from '@/assets/images/icon_user2.svg';

const api = import.meta.env.VITE_APP_API_ENDPOINT;
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const router = useRouter();

// --- リアクティブデータ ---
const userInfo = ref({ username: '', email: '', profile_picture_url: '' });
const initialUserInfo = ref({ username: '', email: '', profile_picture_url: '' });
const editMode = ref(false);
const selectedFile = ref(null);
const previewImageUrl = ref(null);

const userId = computed(() => userStore.getUser?.id ?? null);

const logout = async () => {
  await userStore.logout();
  router.push('/');
};

// --- 関数: データ取得 ---
const fetchUserData = async () => {
  if (!userId.value) return;

  try {
    const response = await axiosInstance.get(`${api}user/${userId.value}`);
    const data = response.data[0];

    if (data.profile_picture_url) {
      const s3_bucket = import.meta.env.VITE_APP_BUCKET_NAME;
      const s3_region = import.meta.env.VITE_APP_S3_REGION;
      const obj_key = `${import.meta.env.VITE_APP_S3_OBJ_ICONS}/${data.profile_picture_url}`;
      data.profile_picture_url = `https://${s3_bucket}.s3.${s3_region}.amazonaws.com/${obj_key}`;
    }

    userInfo.value = data;
    initialUserInfo.value = { ...data };
  } catch (error) {
    console.error('Fetch Error:', error);
    userInfo.value = { username: '', email: '', profile_picture_url: '' };
  }
};

const onFileChange = e => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile.value = file;
  previewImageUrl.value = URL.createObjectURL(file);
};

const edit = () => {
  editMode.value = true;
};

const cancelEdit = () => {
  editMode.value = false;
  userInfo.value = { ...initialUserInfo.value };
  selectedFile.value = null;
  previewImageUrl.value = null;
};

const update = async () => {
  try {
    editMode.value = false;

    // 名前変更の検知と送信
    if (userInfo.value.username !== initialUserInfo.value.username) {
      await axiosInstance.put(`${api}user/${userId.value}`, {
        username: userInfo.value.username
      });
    }

    // アイコン変更の送信
    if (selectedFile.value) {
      const updateFileUrl = `${userId.value}-${Date.now()}-${selectedFile.value.name}`;
      const formData = new FormData();
      formData.append('icon', selectedFile.value);
      formData.append('profile_picture_url', updateFileUrl);

      const response = await axiosInstance.put(`${api}user/${userId.value}/icon`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      userInfo.value.profile_picture_url = response.data.updated_profile_picture_url;
    }

    initialUserInfo.value = { ...userInfo.value };
  } catch (error) {
    console.error('Update Error:', error);
  }
};

onMounted(fetchUserData);
</script>

<template>
  <div class="user-setting">
    <div class="user-setting_card">
      <div class="user-setting_icon">
        <input id="file-input" type="file" @change="onFileChange" :disabled="!editMode" style="display: none" />
        <label for="file-input" class="icon-label">
          <img
            :src="
              editMode && selectedFile
                ? previewImageUrl || userInfo.profile_picture_url
                : userInfo.profile_picture_url || UserIcon2
            "
            alt="UserIcon"
            class="user_icon_img"
          />
        </label>
      </div>

      <h2 class="user-setting_title">My account</h2>
      <hr class="divider" />

      <div class="user-setting_form">
        <div class="user-setting_text">
          <p class="user-setting_text_title">User name</p>
          <p class="user-setting_text_sub">This will be displayed throughout this website</p>
          <input class="user-setting_input" type="text" :disabled="!editMode" v-model="userInfo.username" />
        </div>

        <div class="user-setting_text">
          <p class="user-setting_text_title">Email</p>
          <p class="user-setting_text_sub attention">Note: Display only. Registered email cannot be changed</p>
          <input class="user-setting_input" type="text" disabled v-model="userInfo.email" />
        </div>

        <div class="mobile-logout-wrapper" v-if="isLoggedIn">
          <hr class="mobile-divider" />
          <button @click="logout" class="user-setting_logout-text">Log out</button>
        </div>
      </div>

      <div class="buttons">
        <button @click="edit" class="btn btn-edit" v-if="!editMode">Edit</button>
        <button @click="update" class="btn btn-edit" v-if="editMode">Update</button>
        <button @click="cancelEdit" class="btn btn-cancel" v-if="editMode">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 1. Base Structure (1440px+) */
.user-setting {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  min-height: 100vh;
}

.user-setting_card {
  background-color: #e4af63;
  border-radius: 20px;
  width: 100%;
  max-width: 600px; /* PCでの最大幅を固定し安定させる */
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 60px 40px 20px; /* 上部にアイコンが被る余白を確保 */
  align-self: flex-start;
  margin-top: 60px;
}

/* アイコン：欠け防止のため z-index と overflow を調整 */
.user-setting_icon {
  background-color: white;
  border-radius: 50%;
  width: 124px;
  height: 124px;
  position: absolute;
  top: -62px;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.user_icon_img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-setting_title {
  font-size: 1rem;
  font-weight: 500;
  color: #efece0;
  margin-bottom: 0.5rem;
}

.divider {
  width: 100%;
  border: 0.5px solid #efece0;
  margin-bottom: 2rem;
}

.user-setting_form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-setting_text {
  width: 100%;
  max-width: 400px;
  margin-bottom: 1.5rem;
}

.user-setting_text_title,
.user-setting_text_sub {
  font-size: 0.75rem;
  color: #efece0;
}

.attention {
  color: #37604b;
  font-weight: 600;
}

.user-setting_input {
  width: 100%;
  height: 2.5rem;
  border-radius: 12px;
  background-color: #efecdf;
  border: none;
  padding: 0 15px;
  margin-top: 0.5rem;
}

/* ボタン系 */
.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1rem;
}

.btn {
  padding: 10px 24px;
  border-radius: 60px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: #232121;
  color: #efece0;
}

/* モバイルログアウト（デフォルト非表示） */
.mobile-logout-wrapper {
  display: none;
}

/* 2. Responsive: 820px (Tablet) */
@media (max-width: 820px) {
  .user-setting_card {
    max-width: 500px;
    margin-top: 80px;
  }
}

/* 3. Responsive: 393px / 360px (Mobile) */
@media (max-width: 580px) {
  /* 前のHeaderと合わせる */
  .mobile-logout-wrapper {
    display: block;
    width: 100%;
    max-width: 400px;
    margin-top: 1rem;
    text-align: center;
  }
  .mobile-divider {
    border: 0.5px solid rgba(239, 236, 224, 0.5);
    margin-bottom: 1rem;
  }
  .user-setting_logout-text {
    background: none;
    border: none;
    color: #37604b; /* ログアウトは少し色を変えて注意を引く */
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
  }

  .user-setting_card {
    padding: 60px 20px 20px;
    width: 90%;
  }

  .user-setting_icon {
    width: 100px;
    height: 100px;
    top: -50px;
  }
}

/* 極小デバイス対応 */
@media (max-width: 360px) {
  .user-setting_title {
    font-size: 0.9rem;
  }
  .btn {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
}
</style>
