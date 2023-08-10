<template lang="pug">
#lyricBoard
  .closeButton(@click="emits('update:visible',false)")
    img(:src="downImage")
    span 隐藏歌词
  .fullScreenButton(@click="fullScreen")
    img(:src="fullScreenImage")
    span 全屏
  .arrowHeadRightButton(@click="hide()")
    img(:src="arrowHeadRightImage")
    span 最小化
  .musicInfo
    .title {{musicInfo.title}}
    .artists {{musicInfo.artists?.join(' ')}}
    .album.pointing
      img.blurBak(:src="musicInfo.albumPic")
      img.albumPic(:src="musicInfo.albumPic")
  #lyrics.noScrollBar(:key="getControllerStore.playingUrl"
    @wheel.prevent="wheel")
    .blank
    .lyric.pointing.dongJingXiaoLangMan(
      v-for="({time,lyric},index) in musicInfo.lyricList"
      :class="{light:index===step}"
      :key="index"
      :style="`filter:blur(${(Math.abs(index-step))/3}px);`"
      :ref="(el)=>index===step&&(lyricIns=el)"
      @click.stop="()=>changeProgress((time + 1) / 1000)"
    ) {{ lyric||'- -' }}`
    .blank
  .back.backImage(:style="`background-image:url('${musicInfo.albumPic}')`")
  Streamer.back(v-if="getSettingStore.streamerType!=='none'")
</template>

<script setup>
import { computed, onActivated, onDeactivated, ref, watch, watchEffect } from 'vue'
import { controllerStore, settingStore } from '@/store'
import downImage from '@/assets/img/down.png'
import fullScreenImage from '@/assets/img/fullScreen.png'
import arrowHeadRightImage from '@/assets/img/arrowHeadRight.png'
import { windowHandler } from '@/methods'
import Streamer from './components/streamer/index.vue'
const props = defineProps(['musicInfo', 'visible'])

const emits = defineEmits([
  'setProgress',
  'update:visible',
  'playPause',
  'last',
  'next',
  'setVolume'
])
const getControllerStore = controllerStore()
const getSettingStore = settingStore()

const lyricIns = ref()
const timeStep = computed(() => (getControllerStore.current ?? 0) * 1000)

const allowLocating = ref(false)
const start = ref(0)
const nextStep = computed(() => {
  return props.musicInfo.lyricList[start.value]?.time ?? 0
})
const resetStep = () => {
  start.value = props.musicInfo.lyricList.findIndex(({ time }) => time > timeStep.value)
}
let lastStep = 0
const step = computed(() => {
  if (timeStep.value < lastStep || nextStep.value < timeStep.value) {
    resetStep()
  }
  lastStep = timeStep.value
  const s = start.value - 1 + (allowLocating.value ? scrollStep.value : 0)
  return Math.min(props.musicInfo.lyricList.length - 1, Math.max(0, s))
})
watchEffect(() => {
  lyricIns.value?.scrollIntoView({
    block: 'center'
  })
})
const changeProgress = (time) => {
  emits('setProgress', time)
  allowLocating.value = false
  clearTimeout(wheelTimer)
}
let wheelTimer
const scrollStep = ref(0)
const wheel = (e) => {
  allowLocating.value = true
  clearTimeout(wheelTimer)
  scrollStep.value += Math.sign(e.deltaY)
  wheelTimer = setTimeout(() => {
    allowLocating.value = false
    scrollStep.value = 0
  }, 3000)
}
const fullScreen = () => {
  window.underlying.fullScreen()
}
const hide = () => {
  windowHandler.hide()
}
const keyBoardMap = {
  Esc: () => {
    emits('update:visible', false)
  },
  Space: () => {
    emits('playPause')
  },
  ArrowLeft: () => {
    changeProgress(Math.max(0, getControllerStore.current - 5))
  },
  ArrowRight: () => {
    changeProgress(getControllerStore.current + 5)
  },
  ArrowUp: () => {
    emits('setVolume', getControllerStore.volume + 5)
  },
  ArrowDown: () => {
    emits('setVolume', getControllerStore.volume - 5)
  },
  PageDown: () => {
    emits('next')
  },
  PageUp: () => {
    emits('last')
  },
  Delete: () => {
    hide()
  }
}
const keyBoardEvent = (e) => {
  keyBoardMap[e.code]?.(e)
  e.preventDefault()
}
onActivated(() => {
  document.addEventListener('keydown', keyBoardEvent)
  lyricIns.value?.scrollIntoView({
    block: 'center'
  })
})
onDeactivated(() => {
  document.removeEventListener('keydown', keyBoardEvent)
})

watch(
  () => getControllerStore.playingUrl,
  () => {
    lastStep = 0
    start.value = 0
  }
)
</script>

<style scoped lang="stylus">
#lyricBoard
  position fixed
  top 0
  right 0
  left 0
  bottom 0
  display flex
  overflow hidden
  align-items center
  justify-content center
  z-index 100
  padding 10vh 10vw
  background-color #FFFFFF
  .arrowHeadRightButton
  .fullScreenButton
  .closeButton
    position absolute
    width auto
    height 30px
    padding 10px
    border-radius 10px
    transition all 0.3s
    display flex
    align-items center
    opacity 0.7
    &:hover
      background-color rgba(255,255,255,.4)
      opacity 1
      span
        opacity 1
        width 80px
        flex 1 0 80px
    img
      height 100%
      flex 0 0 auto
    span
      flex 1 0 0
      //display flex
      //justify-content space-between
      text-align-last justify
      text-align justify
      font-weight bold
      width 0
      padding 10px
      box-sizing border-box
      opacity 0
      transition all 0.3s
      color #666666
      overflow hidden
      white-space nowrap
  .fullScreenButton
    top 30px
    right 30px
  .arrowHeadRightButton
    right 30px
    bottom 30px
  .closeButton
    top 30px
    left 60px
  .musicInfo
    display flex
    flex 1
    flex-direction column
    align-items center
    transition all 0.3s
    &:hover
      flex 2
    .title
      font-size 3vh
      padding 1vh 0
      font-weight bolder
    .artists
      font-size 2vh
      padding 1vh 0
      font-weight bolder
    .album
      height 100%
      width 100%
      display flex
      justify-content center
      align-items center
      position relative
      margin 30px
      .blurBak
        filter blur(8px)
        //height 100%
        width 100%
        border-radius 10%
        //position absolute
        overflow hidden
        z-index -1
        object-fit contain
        //background-size object-fit

      .albumPic
        width 75%
        //height 75%
        position absolute
        border-radius 10%
        overflow hidden
        object-fit contain
  #lyrics
    flex 3
    display flex
    flex-direction column
    max-height 70vh
    width 60vw
    overflow auto
    box-sizing border-box
    border 30px solid transparent
    scroll-behavior smooth
    align-items center
    position relative
    border-radius 5vh
    .lyric
      color #FFFFFF
      word-wrap anywhere
      transition all 0.8s
      text-align center
      line-height 5.4vh
      font-size 3vh
      filter blur(1px)
      flex 1 0 5.4vh
    .lyric.light
      filter none
      font-size 4.5vh
      line-height 7.9vh
      font-weight bold
      flex 1 0 vh
    .blank
      height 30vh
      flex 1 0 30vh
  .back
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    z-index -2
  .backImage
    background-blend-mode darken
    filter grayscale(0.7)
    background-color rgba(0, 0, 0, 0.4)
    opacity 0.7
    background-size cover
    background-position center center
</style>
