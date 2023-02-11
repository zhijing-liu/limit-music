import { defineStore } from 'pinia'
import Dexie from 'dexie'

const playModeReduceMap = {
  order: (map) => Object.values(map),
  random: (map) => Object.values(map).sort(() => Math.random() - 0.5)
}
const musicInfoDb = new Dexie('musicInfo')
musicInfoDb.version(1).stores({
  musicItem: 'path,fileName, path,suffix,album,artists,description,year' // Primary key and indexed props
})

const getDbMusicMap = async () => {
  return (await musicInfoDb.musicItem.count()) > 0
    ? (await musicInfoDb.musicItem.toArray()).reduce((map, data, index) =>
        index === 1
          ? {
              [map.path]: map,
              [data.path]: data
            }
          : {
              ...map,
              [data.path]: data
            }
      )
    : {}
}
export const controllerStore = defineStore('controller', {
  state: () => ({
    musicMap: {},
    playingUrl: '',
    current: 0,
    isPlaying: false,
    playMode: 'order', // 'order' 'random',
    audioPlayerInstance: null,
    musicInfoDb
  }),
  getters: {
    getMusicInfo(state) {
      return state.musicMap?.[state.playingUrl] ?? {}
    },
    getMusicDisplayList(state) {
      console.log(state.musicMap)
      console.log(Object.values(state.musicMap))
      return Object.values(state.musicMap)
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
    },
    async setMusicMap(map) {
      await this.musicInfoDb.musicItem.bulkPut(Object.values(map))
      await this.refreshMusicMap()
    },
    async refreshMusicMap() {
      this.musicMap = await getDbMusicMap()
    }
  }
})
export const componentVisibleStore = defineStore('componentVisible', {
  state: () => ({
    curtainVisible: true
  })
})
