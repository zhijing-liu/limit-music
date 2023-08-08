<template lang="pug">
#controller
  .album(@click="playingUrl&&(lyricVisible=true)")
    img.blurBak(:src="musicInfo.albumPic??musicImage")
    img.albumPic(:src="musicInfo.albumPic??musicImage")
  .button(@click="()=>playPause()")
    img.icon(:src="getControllerStore.isPlaying?pauseImage:playImage")
  .button(@click="last")
    img.icon(:src="lastImage")
  .center(@mouseenter="centerMouseEnter")
    Transition(name="fade-quick")
      Progress(v-if="centerActive" :current="getControllerStore.current" :length="musicInfo.duration" @setProgress="setProgress")
      .musicName(v-else)
        .musicNameText {{musicInfo.title??'嗨！欢迎回来'}}
        .musicNameSubtitle
          .time(v-if="musicInfo.duration" ) {{Math.round(getControllerStore.current)}} / {{Math.round(musicInfo.duration)}}s
          .artists -- {{musicInfo.artists?.join(' ')??'纸境工作室'}}
  .button(@click="next")
    img.icon(:src="nextImage")
  .button(@click="setPlayMode")
    img.icon(:src="playModeMap[getControllerStore.playMode]")
  .volumeButton(@wheel="onChangeVolume" ref="volumeButtonIns" @mousedown="valueMouseDown")
    img.icon(:src="soundImage")
    .stateBar(:style="`width:${getControllerStore.volume}%`")
    .value {{Math.floor(getControllerStore.volume)}}
AudioComponent(ref="audioIns" @playEnd="next" @volumeChanged="volumeChanged")
Transition(name="floatUp")
  KeepAlive
    Lyric(
      v-if="lyricVisible"
      v-model:visible="lyricVisible"
      :musicInfo="musicInfo"
      @setProgress="setProgress"
      @playPause="playPause"
      @last="last"
      @next="next"
      @setVolume="setVolume"
      )
</template>

<script setup>
import AudioComponent from './audio/index.vue'
import Progress from './progress/index.vue'
import Lyric from './lyric/index.vue'
import { computed, onMounted, reactive, ref, toRaw, watch, shallowRef, unref } from 'vue'
import { controllerStore, settingStore } from '@/store'
import playImage from '@/assets/img/play.png'
import pauseImage from '@/assets/img/pause.png'
import lastImage from '@/assets/img/last.png'
import nextImage from '@/assets/img/next.png'
import musicImage from '@/assets/img/music.png'
import defaultImage from '@/assets/img/default.png'
import randomImage from '@/assets/img/random.png'
import soundImage from '@/assets/img/sound.png'
// store
const getControllerStore = controllerStore()
const getSettingStore = settingStore()
// 播放组件实例
const audioIns = ref()
// 播放模式
const playModeMap = reactive({
  default: defaultImage,
  random: randomImage
})
// 设置播放模式
const setPlayMode = () => {
  getControllerStore.playMode = getControllerStore.playMode === 'default' ? 'random' : 'default'
  localStorage.setItem('playMode', getControllerStore.playMode)
}
// 设置进度条
const setProgress = (current) => {
  audioIns.value.setCurrent(current)
}
// 播放暂停
const playPause = (actionName = getControllerStore.isPlaying ? 'pause' : 'play') => {
  audioIns.value[actionName]()
}
// 下一首
const next = () => {
  if (getControllerStore.getMusicMapLength === getControllerStore.getPlayIndex) {
    getControllerStore.setPlayIndex(0)
  } else {
    getControllerStore.setPlayIndex(getControllerStore.getPlayIndex + 1)
  }
}
// 上一首
const last = () => {
  if (getControllerStore.getPlayIndex === 0) {
    getControllerStore.setPlayIndex(getControllerStore.getMusicMapLength - 1)
  } else {
    getControllerStore.setPlayIndex(getControllerStore.getPlayIndex - 1)
  }
}
// 音量调节
const volumeButtonIns = ref()

const onChangeVolume = (e) => {
  setVolume(getControllerStore.volume - Math.sign(e.deltaY) * 5)
}
const setVolume = (v) => {
  audioIns.value?.setVolume(v)
}
let volumeTimer
const volumeChanged = (v) => {
  clearTimeout(volumeTimer)
  volumeTimer = setTimeout(() => {
    getControllerStore.controllerServer?.updateSocket?.('volume', v)
  }, 300)
}
const valueMouseDown = (e) => {
  const rect = volumeButtonIns.value.getBoundingClientRect()
  const setVolumeByPosition = ({ x, y }) => {
    setVolume(Math.round(((x - rect.x) / rect.width) * 100))
  }
  setVolumeByPosition(e)
  const stop = () => {
    document.removeEventListener('mousemove', setVolumeByPosition)
    document.removeEventListener('mouseup', stop)
    document.removeEventListener('mouseleave', stop)
  }
  document.addEventListener('mousemove', setVolumeByPosition)
  document.addEventListener('mouseup', stop)
  document.addEventListener('mouseleave', stop)
}
// 歌词控制器
const lyricVisible = ref(false)
// 音乐文件与监听变化
const musicInfo = ref({})
const playingUrl = computed(() => getControllerStore.playingUrl)
watch(
  playingUrl,
  async () => {
    if (playingUrl.value) {
      localStorage.setItem('playingUrl', playingUrl.value)
      const data = await window.underlying
        .getMusicInfo(playingUrl.value, {
          lyric: true,
          albumPic: true
        })
        .catch((r) => {
          getControllerStore.playingUrl = ''
        })
      if (data?.path === playingUrl.value) {
        musicInfo.value = data
      }
      getControllerStore.controllerServer?.updateSocket?.('musicInfo', toRaw(musicInfo.value))
    }
  },
  {
    immediate: true
  }
)
// 监听播放器
watch(
  computed(() => getControllerStore.isPlaying),
  () => {
    getControllerStore.controllerServer?.updateSocket?.('isPlaying', getControllerStore.isPlaying)
  }
)
watch(
  computed(() => getControllerStore.playMode),
  () => {
    getControllerStore.controllerServer?.updateSocket?.('playMode', getControllerStore.playMode)
  }
)

// 控制器中间鼠标事件控制模块
const centerActive = ref(false)
const centerMouseEnter = (e) => {
  centerActive.value = true
  const leave = () => {
    centerActive.value = false
    e.target.removeEventListener('mouseleave', leave)
  }
  e.target.addEventListener('mouseleave', leave)
}
// 对外发布的控制器
const getController = () => ({
  pause: audioIns.value.pause,
  play: audioIns.value.play,
  next,
  last,
  playPause,
  setVolume: audioIns.value.setVolume,
  getMusicData: () => ({
    musicInfo: toRaw(musicInfo.value),
    isPlaying: getControllerStore.isPlaying,
    playMode: getControllerStore.playMode,
    volume: getControllerStore.volume
  }),
  setPlayMode,
  setPlayingUrl: (value) => {
    getControllerStore.playingUrl = value
  },
  getMusicMap: () => toRaw(getControllerStore.musicMap)
})
// 外部控制器监听模块
watch(
  computed(() => ({
    audio: audioIns.value,
    enable: getSettingStore.webControllerEnable,
    port: getSettingStore.webControllerPort,
    socketPort: getSettingStore.webControllerSocketPort
  })),
  (data) => {
    if (data.enable && audioIns.value !== undefined) {
      window.serve
        .createControllerServer({
          port: data.port,
          socketPort: data.socketPort
        })
        .then((r) => {
          getControllerStore.controllerServer = r
          getControllerStore.controllerServer.setController(getController())
        })
        .catch(() => {
          getSettingStore.webControllerEnable = false
          getControllerStore.controllerServer = null
        })
    } else {
      getControllerStore.controllerServer?.stop()
      getControllerStore.controllerServer = null
    }
  },
  {
    immediate: true
  }
)
onMounted(() => {
  // 全局化歌词实例
  getControllerStore.audioPlayerInstance = audioIns.value
  // 传递主进程的控制器
  window.underlying.setController(getController())
})
</script>

<style scoped lang="stylus">
#controller
  height 80px
  display flex
  align-items center
  box-sizing border-box
  justify-content center
  padding 10px 5vw
  border-radius 15px
  background-color rgba(46,169,223,.2)
  margin-top 10px
  .album
    height 60px
    width 60px
    display flex
    justify-content center
    align-items center
    position relative
    margin-right 20px
    transition all 0.3s
    .blurBak
      filter blur(8px)
      height 100%
      width 100%
      position absolute
      border-radius 6px
      overflow hidden
      z-index -1
    .albumPic
      width 75%
      height 75%
      border-radius 4px
      overflow hidden
    &:hover
      height 70px
      width 70px
  .center
    width 50vw
    height 100%
    position relative
    display flex
    align-items center
    .musicName
      position absolute
      width 100%
      height 100%
      left 0
      display flex
      align-items center
      flex-direction column
      justify-content space-around
      .musicNameText
        font-size 22px
        font-weight bolder
        max-width 90%
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
      .musicNameSubtitle
        font-size 12px
        width 80%
        font-weight bolder
        display flex
        justify-content space-between
  .button
    width 45px
    height 45px
    display flex
    justify-content center
    align-items center
    border-radius 13px
    transition all 0.3s
    .icon
      width 26px
      height 26px
      transition all 0.3s
    &:hover
      background-color rgba(254,223,225,.8)
      box-shadow 0 0 15px 3px rgba(254,223,225,.8)
      .icon
        width 32px
        height 32px
  .volumeButton
    width 45px
    height 45px
    display flex
    align-items center
    border-radius 13px
    transition all 0.3s 0.5s
    position relative
    overflow hidden
    .icon
      width 26px
      height 26px
      //transition all 0.3s
      position absolute
      left 50%
      transform translateX(-50%)
      transition opacity 0.3s
    .stateBar
      opacity 0
      background-color rgba(46,169,223,.5)
      transition opacity 0.3s , width 0.1s
      height 100%
    .value
      position absolute
      width 100%
      height 100%
      display flex
      justify-content center
      align-items center
      opacity 0
      color rgba(255,255,255,.4)
      font-weight bolder
    &:hover
      background-color rgba(46,169,223,.2)
      width 160px
      transition-delay 0s
      .icon
        opacity 0
      .value
      .stateBar
        opacity 1
</style>
