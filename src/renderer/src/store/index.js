import { defineStore } from 'pinia'
import Dexie from 'dexie'
import { toRaw } from 'vue'

const playModeReduceMap = {
  default: (map) => Object.values(map),
  random: (map) => Object.values(map).sort(() => Math.random() - 0.5)
}
const musicInfoDb = new Dexie('musicInfo')
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
      duration: true
    }
  }
}
musicInfoDb.version(1).stores({
  musicItem: `${musicInfoDbKeys.musicItem.key},${Object.keys(musicInfoDbKeys.musicItem.line).join(
    ','
  )}` // Primary key and indexed props
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
    musicInfoDb
  }),
  getters: {
    getMusicInfo(state) {
      return state.musicMap?.[state.playingUrl] ?? {}
    },
    getMusicDisplayList(state) {
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
const settings = {
  deepScan: false,
  playImmediate: false,
  toTrayWhenClickClose: true,
  webServeEnable: true,
  webServePort: 4000,
  progressBarAllowSlide: false,
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
