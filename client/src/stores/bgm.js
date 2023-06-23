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
    api: `${import.meta.env.VITE_APP_API_ENDPOINT}bgm/`
  }),
  actions: {
    async fetchCafeMusic() {
      try {
        const res = await axios.get(`${this.api}cafe-music`);
        console.log('cafe_music data:', res.data.urls);
        this.cafe_music = res.data.urls.map(url => url.replace(/ /g, '+'));
      } catch (error) {
        console.error(error);
      }
    },
    async fetchBaristaSounds() {
      try {
        const res = await axios.get(`${this.api}barista-sounds`);
        console.log('barista_sounds data:', res.data.urls);
        this.barista_sounds = res.data.urls.map(url => url.replace(/ /g, '+'));
      } catch (error) {
        console.error(error);
      }
    },
    async fetchPeopleTalking() {
      try {
        const res = await axios.get(`${this.api}people-talking`);
        console.log('people_talking data:', res.data.urls);
        this.people_talking = res.data.urls.map(url => url.replace(/ /g, '+'));
      } catch (error) {
        console.error(error);
      }
    }
  }
});

// export const useBgmStore = defineStore('bgm', () => {
//   const cafe_music = ref([]);
//   const barista_sounds = ref([]);
//   const people_talking = ref([]);
//   const api = 'http://localhost:3000/api/bgm/';

//   const actions = {
//     async fetchCafeMusic() {
//       try {
//         const res = await axios.get(`${this.api}cafe-music`);
//         console.log('cafe_music data:', res.data.urls);
//         this.cafe_music = res.data.urls.map(url => url.replace(/ /g, '+'));
//       } catch (error) {
//         console.error(error);
//       }
//     },
//     async fetchBaristaSounds() {
//       try {
//         const res = await axios.get(`${this.api}barista-sounds`);
//         console.log('barista_sounds data:', res.data.urls);
//         this.barista_sounds = res.data.urls.map(url => url.replace(/ /g, '+'));
//       } catch (error) {
//         console.error(error);
//       }
//     },
//     async fetchPeopleTalking() {
//       try {
//         const res = await axios.get(`${this.api}people-talking`);
//         console.log('people_talking data:', res.data.urls);
//         this.people_talking = res.data.urls.map(url => url.replace(/ /g, '+'));
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   };
//   return { cafe_music, barista_sounds, people_talking, api, actions }
// });

