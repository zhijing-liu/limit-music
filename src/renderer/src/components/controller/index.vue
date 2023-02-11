<template lang="pug">
#controller {{getControllerStore.getIndex}}
  //.button(@click="pause") 暂停
  //.button(@click="play") 继续
  //.button(@click="setCurrent") 跳跃
  //span {{getControllerStore.getMusicInfo.musicInfo.albumPic}}
  img.albumPic(:src="getControllerStore.getMusicInfo?.musicInfo?.albumPic")
  .button
    img.icon(:src="playIcon")
  .button(@click="last")
    img.icon(:src="lastImage")
  .button(@click="next")
    img.icon(:src="nextImage")
AudioComponent(ref="audioIns" @playEnd="playEnd")
</template>

<script setup>
import AudioComponent from './audio/index.vue'
import { onMounted, ref, watch } from 'vue'
import { controllerStore } from '@/store'
import playIcon from '@/assets/icon/play.svg'
import lastImage from '@/assets/img/last.png'
import nextImage from '@/assets/img/next.png'

const getControllerStore = controllerStore()
const audioIns = ref()
const pause = () => {
  audioIns.value.pause()
}
const play = () => {
  audioIns.value.play()
}
const setCurrent = () => {
  audioIns.value.setCurrent(60)
}
const next = () => {
  console.log(getControllerStore.getMusicMapLength)
  console.log(getControllerStore.getPlayIndex)
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
const playEnd = () => {
  next()
}
onMounted(() => {
  getControllerStore.audioPlayerInstance = audioIns.value
})
</script>

<style scoped lang="stylus">
#controller
  height 80px
  display flex
  align-items center
  .albumPic
    height 45px
    width 45px
  .button
    width 30px
    height 30px
    display flex
    justify-content center
    align-items center
    .icon
      width 22px
      height 22px
      transition all 0.3s
    &:hover
      .icon
        width 26px
        height 26px
</style>
