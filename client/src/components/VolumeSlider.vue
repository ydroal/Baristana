<template>
  <div class="volume-slider">
    <!-- Debug information -->
    <!-- <pre>{{ audioSources }}</pre> -->
    <span class="volume-label">{{ soundType }}</span>
    <div class="volume-control">
      <img :src="isPlaying ? PauseIcon : VolumeIcon" alt="Volume Icon" class="volume-icon" @click="toggleAudio" />
      <input type="range" min="0" max="100" v-model="volume" class="slider" />
    </div>
  </div>
</template>

<script>
import VolumeIcon from '@/assets/images/icon_onsei.svg';
import PauseIcon from '@/assets/images/icon_pause.svg';

export default {
  props: ['soundType', 'audioSources'],
  data() {
    return {
      VolumeIcon,
      PauseIcon,
      isPlaying: false,
      volume: 50, // 初期音量を50に設定
      audio: null,
      currentSourceIndex: 0
    };
  },
  // コンポーネントが作成されたとき(createdライフサイクルフック)
  created() {
    if (this.audioSources && this.audioSources.length > 0) {
      console.log('Received audioSources:', this.audioSources);
      // 音声ファイルを読み込み
      this.audio = new Audio(this.audioSources[this.currentSourceIndex]);
      // 音量を設定
      this.audio.volume = this.volume / 100;
      // 音声ファイルの再生が終了したら次のファイルを再生
      this.audio.onended = this.nextAudio;
    }
  },
  methods: {
    toggleAudio() {
      // ここで音声再生・停止を実装
      if (!this.audio) {
        console.warn('Audio object is not available.');
        return;
      }
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    },
    nextAudio() {
      // 音源リストをループ再生
      this.currentSourceIndex = (this.currentSourceIndex + 1) % this.audioSources.length;
      this.audio.src = this.audioSources[this.currentSourceIndex];
      this.audio.play();
    }
  },
  // volumeデータの変更を監視、その変更があった時点で音源の音量を更新
  watch: {
    volume(newVolume) {
      this.audio.volume = newVolume / 100;
    }
  }
};
</script>

<style scoped>
/* ベーススタイル */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  background: transparent;
  cursor: pointer;
}
/* Track: Chrome, Safari, Opera, Edge Chromium */
input[type='range']::-webkit-slider-runnable-track {
  width: 300px;
  height: 1.8px;
  background-color: #232121;
}

/* Thumb: Chrome, Safari, Opera, Edge Chromium */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 8px;
  height: 18px;
  border-radius: 5px;
  background-color: #514e48;
  margin-top: -9px;
}
/* Track: Firefox */
input[type='range']::-moz-range-track {
  width: 300px;
  height: 1.8px;
  background-color: #232121;
}
/* Thumb: Firefox */
input[type='range']::-moz-range-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 8px;
  height: 18px;
  border-radius: 5px;
  background-color: #514e48;
  margin-top: -9px;
  border: none;
}
.volume-slider {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.volume-label {
  font-size: 0.8rem;
  font-weight: 600;
}
.volume-control {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  margin-bottom: 1.4rem;
}
.volume-icon {
  height: 2rem;
  text-align: left;
}
.slider {
  width: 300px;
  margin-left: 12px;
}
@media (min-width: 576px) and (max-width: 767.98px) and (orientation: landscape), (max-height: 418px) {
  .slider {
    width: 200px;
    margin-bottom: 1rem;
  }
  .volume-control {
    margin-top: 0.4rem;
    margin-bottom: 0;
  }
  .volume-icon {
    height: 1.6rem;
    margin-bottom: 0.9rem;
    text-align: left;
  }
  .volume-label {
    font-size: 0.7rem;
  }
}
/* Small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  .slider {
    width: 200px;
  }
}
@media (min-width: 768px) and (max-width: 980px) and (max-height: 849.98px) {
  .slider {
    width: 200px;
  }
}
</style>
