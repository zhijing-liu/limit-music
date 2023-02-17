<template lang="pug">
#lyricBoard
  img.closeButton(:src="downImage" @click="emits('update:visible',false)")
  img.fullScreenButton(:src="fullScreenImage" @click="fullScreen")
  img.arrowHeadRightButton(:src="arrowHeadRightImage" @click="hide()")
  .album
    img.blurBak(:src="musicInfo.albumPic")
    .albumPic(:style="`background-image: url('${musicInfo.albumPic}')`")
  #lyrics.noScrollBar
    .lyric.pointing.pinYin(
      v-for="({time,lyric},index) in musicInfo.lyricList"
      :class="{light:index===step-1}"
      :key="index"
      :ref="(el)=>index===step-1&&(lyricIns=el)"
      @wheel.passive="wheel"
      @click.stop="()=>changeProgress((time + 1) / 1000)"
    ) {{ lyric }}
  .back(:style="`background-image:url('${musicInfo.albumPic}')`")
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { controllerStore } from '@/store'
import downImage from '@/assets/img/down.png'
import fullScreenImage from '@/assets/img/fullScreen.png'
import arrowHeadRightImage from '@/assets/img/arrowHeadRight.png'
import { windowHandler } from '@/methods'
const props = defineProps(['musicInfo', 'visible'])
const emits = defineEmits(['setProgress', 'update:visible', 'play', 'pause', 'last', 'next'])
const lyricIns = ref()
const getControllerStore = controllerStore()
const timeStep = computed(() => getControllerStore.current ?? 0)
const step = ref(0)
let lastStep = 0
const allowLocating = ref(true)
const find = () => {
  if (
    props.musicInfo.lyricList[step.value].time < timeStep.value * 1000 &&
    props.musicInfo.lyricList.length - 1 > step.value
  ) {
    step.value++
    find()
  }
  lastStep = timeStep.value
}
onMounted(() => {
  find()
})
watch(timeStep, () => {
  if (props.musicInfo.lyricList[step.value]) {
    if (lastStep > timeStep.value) {
      step.value = 0
    }
    find()
  }
})
watchEffect(() => {
  allowLocating.value &&
    lyricIns.value?.scrollIntoView({
      block: 'center'
    })
})
const changeProgress = (time) => {
  emits('setProgress', time)
  allowLocating.value = true
  clearTimeout(wheelTimer)
}
let wheelTimer

const wheel = () => {
  allowLocating.value = false
  clearTimeout(wheelTimer)
  wheelTimer = setTimeout(() => {
    allowLocating.value = true
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
    emits(getControllerStore.isPlaying ? 'pause' : 'play')
  },
  ArrowLeft: () => {
    changeProgress(Math.max(0, getControllerStore.current - 5))
  },
  ArrowRight: () => {
    changeProgress(getControllerStore.current + 5)
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
  console.log(e)
  keyBoardMap[e.code]?.(e)
  e.preventDefault()
}
watch(
  computed(() => props.visible),
  () => {
    document[props.visible ? 'addEventListener' : 'removeEventListener']('keydown', keyBoardEvent)
  },
  {
    immediate: true
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
  overflow auto
  align-items center
  justify-content center
  z-index 100
  background-color #FFFFFF
  .arrowHeadRightButton
  .fullScreenButton
  .closeButton
    position absolute
    width 30px
    height 30px
    padding 10px
    border-radius 33%
    transition all 0.3s
    &:hover
      background-color rgba(255,255,255,.09)
  .fullScreenButton
    top 30px
    right 30px
  .arrowHeadRightButton
    right 30px
    bottom 30px
  .closeButton
    top 30px
    left 30px
  .album
    height 200px
    width 200px
    display flex
    justify-content center
    align-items center
    position relative
    margin-left 30px
    margin-right 30px
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
      border-radius 10%
      overflow hidden
      background-size contain
  #lyrics
    display flex
    flex-direction column
    max-height 70vh
    width 60vw
    overflow auto
    box-sizing border-box
    border 30px solid transparent
    scroll-behavior smooth
    align-items center
    .lyric
      color #222222
      font-weight bold
      word-wrap anywhere
      transition all 0.8s
      min-height 5.4vh
      line-height 5.4vh
      font-size 3vh
    .lyric.light
      color #FFFFFF
  .back
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    filter blur(6px)
    background-size cover
    background-position center center
    z-index -2
    opacity 0.7
</style>
