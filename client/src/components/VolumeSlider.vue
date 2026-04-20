<script setup>
import { computed } from 'vue';
import { useBgmStore } from '@/stores/bgm';
import VolumeIcon from '@/assets/images/icon_onsei.svg';
import PauseIcon from '@/assets/images/icon_pause.svg';

const props = defineProps(['soundType']);
const bgmStore = useBgmStore();

// マッピング
const typeMap = {
  'Cafe music': 'cafe-music',
  'Barista sounds': 'barista-sounds',
  'People talking': 'people-talking'
};

const typeKey = computed(() => typeMap[props.soundType]);
const isPlaying = computed(() => bgmStore.players[typeKey.value].isPlaying);
const volume = computed(() => bgmStore.players[typeKey.value].volume);

const toggleAudio = () => bgmStore.togglePlay(typeKey.value);
const onVolumeChange = e => bgmStore.setVolume(typeKey.value, Number(e.target.value));
</script>

<template>
  <div class="volume-slider">
    <span class="volume-label">{{ soundType }}</span>
    <div class="volume-control">
      <img :src="isPlaying ? PauseIcon : VolumeIcon" alt="Volume Icon" class="volume-icon" @click="toggleAudio" />
      <input type="range" min="0" max="100" :value="volume" @input="onVolumeChange" class="slider" />
    </div>
  </div>
</template>

<style scoped>
/* スライダー本体の基本設定 */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  outline: none;
  flex: 1;
  width: 100%; /* これが重要 */
}

/* Track: Chrome, Safari */
input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 2px;
  background-color: #232121;
}

/* Thumb: Chrome, Safari */
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
  width: 100%;
  height: 2px;
  background-color: #232121;
}

/* Thumb: Firefox */
input[type='range']::-moz-range-thumb {
  width: 8px;
  height: 18px;
  border-radius: 5px;
  background-color: #514e48;
  border: none;
}

.volume-slider {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* 結論：PC・タブレットでは適切な「固定幅」を維持 */
  width: 320px;
  margin: 0 auto; /* 親要素がflexならこれで中央に寄る */
}

.volume-label {
  font-size: 0.8rem;
  font-weight: 600;
}

.volume-control {
  display: flex;
  align-items: center;
  width: 100%; /* .volume-slider の 320px を使い切る */
  margin-top: 0.5rem;
  margin-bottom: 1.4rem;
}

.volume-icon {
  height: 2rem;
  flex-shrink: 0; /* アイコンが潰れないように固定 */
}

.slider {
  flex: 1; /* アイコンの横を埋める */
  margin-left: 12px;
}

/* モバイル（スマホ）環境のみ可変にする */
@media (max-width: 580px) {
  .volume-slider {
    width: 85%; /* モバイルでは画面幅に対してバランスを取る */
    max-width: none;
  }
}
</style>
