// pinia から defineStore をインポート
import { defineStore } from 'pinia';
import axios from 'axios';

// defineStore() を使ってストアを定義し、名前useBgmStoreを付けてエクスポート
// defineStore() は定義されたストアのインスタンスを生成するオプションまたはSetup関数を返します
export const useBgmStore = defineStore({
  id: 'bgm',
  state: () => ({
    cafe_music: [],
    barista_sounds: [],
    people_talking: [],
    api: `${import.meta.env.VITE_APP_API_ENDPOINT}bgm/`,
    players: {
      'cafe-music': { audio: null, isPlaying: false, volume: 50, currentIndex: 0 },
      'barista-sounds': { audio: null, isPlaying: false, volume: 50, currentIndex: 0 },
      'people-talking': { audio: null, isPlaying: false, volume: 50, currentIndex: 0 }
    }
  }),
  actions: {
    _getUrls(type) {
      const map = {
        'cafe-music': this.cafe_music,
        'barista-sounds': this.barista_sounds,
        'people-talking': this.people_talking
      };
      return map[type] || [];
    },
    initPlayer(type) {
      const player = this.players[type];
      if (player.audio) return;
      const urls = this._getUrls(type);
      if (!urls.length) return;

      player.audio = new Audio();
      player.audio.crossOrigin = 'anonymous';
      player.audio.src = urls[player.currentIndex];
      player.audio.volume = player.volume / 100;
      player.audio.onended = () => this.nextTrack(type);
    },
    togglePlay(type) {
      const player = this.players[type];
      if (!player.audio) return;
      player.isPlaying = !player.isPlaying;
      player.isPlaying ? player.audio.play() : player.audio.pause();
    },
    setVolume(type, vol) {
      const player = this.players[type];
      player.volume = vol;
      if (player.audio) player.audio.volume = vol / 100;
    },
    nextTrack(type) {
      const player = this.players[type];
      const urls = this._getUrls(type);
      player.currentIndex = (player.currentIndex + 1) % urls.length;
      player.audio.src = urls[player.currentIndex];
      player.audio.play();
    },
    async fetchCafeMusic() {
      try {
        const res = await axios.get(`${this.api}cafe-music`);
        this.cafe_music = res.data.urls.map(url => url.replace(/ /g, '+'));
        this.initPlayer('cafe-music');
      } catch (error) {
        console.error(error);
      }
    },
    async fetchBaristaSounds() {
      try {
        const res = await axios.get(`${this.api}barista-sounds`);
        this.barista_sounds = res.data.urls.map(url => url.replace(/ /g, '+'));
        this.initPlayer('barista-sounds');
      } catch (error) {
        console.error(error);
      }
    },
    async fetchPeopleTalking() {
      try {
        const res = await axios.get(`${this.api}people-talking`);
        this.people_talking = res.data.urls.map(url => url.replace(/ /g, '+'));
        this.initPlayer('people-talking');
      } catch (error) {
        console.error(error);
      }
    }
  }
});
