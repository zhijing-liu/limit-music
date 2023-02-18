import { defineStore } from 'pinia'
import Dexie from 'dexie'
import { toRaw } from 'vue'

const playModeReduceMap = {
  default: (map) => Object.values(map),
  random: (map) => Object.values(map).sort(() => Math.random() - 0.5)
}
export const musicInfoDb = new Dexie('musicInfo')
const musicInfoDbKeys = {
  musicItem: {
    key: 'path',
    line: {
      fileName: true,
      suffix: true,
      album: true,
      artists: true,
      description: true,
      year: true,
      dirPath: true,
      title: true,
      duration: true,
      lossless: true, // 无损
      sampleRate: true, // 采样率
      codec: true, // 编码
      bitsPerSample: true // bit
    }
  }
}
musicInfoDb.version(2).stores({
  musicItem: `${musicInfoDbKeys.musicItem.key},${Object.keys(
    musicInfoDbKeys.musicItem.line
  ).toString()}`
})

const getDbMusicMap = async () => {
  const map =
    (await musicInfoDb.musicItem.count()) > 0
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
  for (const { path, access } of await window.underlying.confirmFileAccess(Object.keys(map))) {
    map[path].access = access
  }
  return map
}
export const controllerStore = defineStore('controller', {
  state: () => ({
    musicMap: {},
    playingUrl: localStorage.getItem('playingUrl') ?? '',
    current: 0,
    isPlaying: false,
    playMode: localStorage.getItem('playMode') ?? 'default', // 'default' 'random',
    audioPlayerInstance: null,
    controllerServer: null,
    searchValue: '',
    musicInfoDb
  }),
  getters: {
    getMusicInfo(state) {
      return state.musicMap?.[state.playingUrl] ?? {}
    },
    getMusicDisplayList(state) {
      if (state.searchValue === '') {
        return Object.values(state.musicMap)
      } else {
        const regExp = new RegExp(state.searchValue, 'gi')
        return Object.values(state.musicMap).filter((music) => {
          return regExp.test(Object.values(music).toString())
        })
      }
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
    curtainVisible: true,
    webControllerVisible: false
  })
})
const settings = {
  deepScan: false,
  playImmediate: false,
  toTrayWhenClickClose: true,
  webServeEnable: true,
  webServePort: 4000,
  progressBarAllowSlide: false,
  currentRefreshInterval: 80,
  webControllerEnable: true,
  webControllerPort: 10000,
  webControllerSocketPort: 20000,
  ...JSON.parse(localStorage.getItem('setting') ?? '{}')
}
export const settingStore = defineStore('setting', {
  state: () => settings,
  actions: {
    storageSetting() {
      localStorage.setItem('setting', JSON.stringify(toRaw(this.$state)))
    }
  }
})
