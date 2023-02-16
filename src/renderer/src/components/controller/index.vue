<template lang="pug">
#controller
  .album(@click="lyricVisible=true")
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
          .time(v-if="musicInfo.duration" ) {{Math.ceil(getControllerStore.current)}} / {{Math.round(musicInfo.duration)}}s
          .artists -- {{musicInfo.artists?.join(' ')??'纸境工作室'}}
  .button(@click="next")
    img.icon(:src="nextImage")
  .button(@click="setPlayMode")
    img.icon(:src="playModeMap[getControllerStore.playMode]")
AudioComponent(ref="audioIns" @playEnd="next")
Transition(name="floatUp")
  KeepAlive
    Lyric(
      v-if="lyricVisible"
      v-model:visible="lyricVisible"
      :musicInfo="musicInfo"
      @setProgress="setProgress"
      @play="()=>playPause('play')"
      @pause="()=>playPause('pause')"
      @last="last"
      @next="next"
      )
</template>

<script setup>
import AudioComponent from './audio/index.vue'
import Progress from './progress/index.vue'
import Lyric from './lyric/index.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { controllerStore } from '@/store'
import playImage from '@/assets/img/play.png'
import pauseImage from '@/assets/img/pause.png'
import lastImage from '@/assets/img/last.png'
import nextImage from '@/assets/img/next.png'
import musicImage from '@/assets/img/music.png'
import defaultImage from '@/assets/img/default.png'
import randomImage from '@/assets/img/random.png'

const playModeMap = reactive({
  default: defaultImage,
  random: randomImage
})
const setProgress = (current) => {
  audioIns.value.setCurrent(current)
}
const setPlayMode = () => {
  getControllerStore.playMode = getControllerStore.playMode === 'default' ? 'random' : 'default'
  localStorage.setItem('playMode', getControllerStore.playMode)
}
const getControllerStore = controllerStore()
const audioIns = ref()

const playPause = (actionName = getControllerStore.isPlaying ? 'pause' : 'play') => {
  audioIns.value[actionName]()
}
const next = () => {
  if (getControllerStore.getMusicMapLength === getControllerStore.getPlayIndex) {
    getControllerStore.setPlayIndex(0)
  } else {
    getControllerStore.setPlayIndex(getControllerStore.getPlayIndex + 1)
  }
}
const last = () => {
  if (getControllerStore.getPlayIndex === 0) {
    getControllerStore.setPlayIndex(getControllerStore.getMusicMapLength - 1)
  } else {
    getControllerStore.setPlayIndex(getControllerStore.getPlayIndex - 1)
  }
}
const lyricVisible = ref(false)
onMounted(() => {
  getControllerStore.audioPlayerInstance = audioIns.value
})
const musicInfo = ref({})
const playingUrl = computed(() => getControllerStore.playingUrl)
watch(
  playingUrl,
  async () => {
    if (playingUrl.value) {
      localStorage.setItem('playingUrl', playingUrl.value)
      const data = await window.underlying.getMusicInfo(playingUrl.value, {
        lyric: true,
        albumPic: true
      })
      if (data.path === playingUrl.value) {
        musicInfo.value = data
      }
    }
  },
  {
    immediate: true
  }
)
const centerActive = ref(false)
const centerMouseEnter = (e) => {
  centerActive.value = true
  const leave = () => {
    centerActive.value = false
    e.target.removeEventListener('mouseleave', leave)
  }
  e.target.addEventListener('mouseleave', leave)
}
</script>

<style scoped lang="stylus">
#controller
  height 80px
  display flex
  align-items center
  box-sizing border-box
  justify-content center
  padding 10px 10vw
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
</style>
