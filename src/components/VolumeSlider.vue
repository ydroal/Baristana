<template>
  <div class="volume_slider">
    <span class="volume_label">{{ soundType }}</span>
    <div class="volume_control">
      <img :src="isPlaying ? PauseIcon : VolumeIcon" alt="Volume Icon" class="volume_icon" @click="toggleAudio" />
      <div class="volume_bar" ref="volumeBar" @mousemove="adjustVolume" @mouseup="stopVolumeAdjust">
        <div class="volume_handle" @mousedown="startVolumeAdjust" :style="{ left: volume + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import VolumeIcon from '@/assets/images/icon_onsei.svg';
import PauseIcon from '@/assets/images/icon_pause.svg';

export default {
  props: ['soundType', 'audioSource'],
  data() {
    return {
      VolumeIcon,
      PauseIcon,
      isPlaying: false,
      volume: 50, // 初期音量を50に設定
      adjustingVolume: false
    };
  },
  methods: {
    toggleAudio() {
      // ここで音声再生・停止を実装します
      this.isPlaying = !this.isPlaying;
    },
    startVolumeAdjust(event) {
      this.adjustingVolume = true;
      // Handle the initial mousedown event
      this.adjustVolume(event);
    },
    adjustVolume(event) {
      if (!this.adjustingVolume) return;
      // イベントオブジェクトからマウスポインタの位置(.volume_bar element)を取得し、音量を計算し調整します
      let rect = this.$refs.volumeBar.getBoundingClientRect();
      let x = event.clientX - rect.left; // x position within the element
      let width = rect.width;
      let newVolume = Math.floor((x / width) * 100);
      // Set the volume, making sure it stays between 0 and 100
      this.volume = Math.min(Math.max(newVolume, 0), 100);
    },
    stopVolumeAdjust() {
      this.adjustingVolume = false;
    }
  }
};
</script>

<style scoped>
.volume_slider {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.volume_label {
  margin-right: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.volume_control {
  display: flex;
  align-items: center;
  margin-top: 2.5%;
}
.volume_icon {
  height: 2rem;
  text-align: left;
}

.volume_bar {
  position: relative;
  width: 300px;
  height: 2px;
  background-color: #232121;
  margin-left: 12px;
}

.volume_handle {
  position: absolute;
  width: 8px;
  height: 18px;
  border-radius: 5px;
  background-color: #514e48;
  top: 50%;
  transform: translateY(-50%);
  /* left property will be managed by JavaScript */
}
</style>
