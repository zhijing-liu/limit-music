import { defineStore } from 'pinia'
const playModeReduceMap = {
  order: (map) => Object.values(map),
  random: (map) => Object.values(map).sort(() => Math.random() - 0.5)
}
export const controllerStore = defineStore('controller', {
  state: () => ({
    musicMap: {},
    playingUrl: '',
    current: 0,
    isPlaying: false,
    playMode: 'order', // 'order' 'random',
    audioPlayerInstance: null
  }),
  getters: {
    getMusicInfo(state) {
      return state.musicMap?.[state.playingUrl] ?? {}
    },
    getMusicDisplayList(state) {
      return Object.values(state.musicMap).map((item) => ({
        name: item.musicInfo.album,
        fileName: item.name,
        path: item.path,
        suffix: item.suffix
      }))
    },
    getMusicPlayList(state) {
      // 播放序列
      return playModeReduceMap[state.playMode](state.musicMap)
    },
    getPlayIndex(state) {
      return state.getMusicPlayList.findIndex((item) => item.path === state.playingUrl)
    },
    getMusicMapLength(state) {
      return Object.keys(state.musicMap).length
    }
  },
  actions: {
    setPlayIndex(index) {
      this.playingUrl = this.getMusicPlayList[index].path
    }
  }
})
export const componentVisibleStore = defineStore('componentVisible', {
  state: () => ({
    curtainVisible: true
  })
})
