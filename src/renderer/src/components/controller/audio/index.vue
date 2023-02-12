<template lang="pug">
audio(
  :src="musicData"
  ref="audioIns"
  @loadeddata="onLoaded"
  autoplay="true"
  @timeupdate="onCurrentUpdate"
  @play="onPlay"
  @pause="onPause"
  @ended="onEnded"
  )
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { controllerStore } from '@/store'
const emits = defineEmits(['currentChanged', 'playEnd'])
const getControllerStore = controllerStore()
const audioIns = ref()
const musicData = ref()
// 监听事件
const onCurrentUpdate = (e) => {
  getControllerStore.current = audioIns.value.currentTime
  emits('currentChanged', audioIns.value.currentTime)
}
const onLoaded = () => {}
const onPlay = () => {
  getControllerStore.isPlaying = true
}
const onPause = () => {
  getControllerStore.isPlaying = false
}
const onEnded = () => {
  emits('playEnd')
}
// 触发事件
const play = () => {
  audioIns.value.play()
}
const pause = () => {
  audioIns.value.pause()
}
const setDefault = () => {}
defineExpose({
  play,
  pause
})
// watch
watch(
  computed(() => getControllerStore.playingUrl),
  async () => {
    if (getControllerStore.playingUrl) {
      musicData.value = URL.createObjectURL(
        new File(
          [(await window.underlying.getPlayUrl(getControllerStore.playingUrl)).buffer],
          getControllerStore.playingUrl
        )
      )
    }
  }
)
</script>

<style scoped lang="stylus"></style>
