<template lang="pug">
audio(
  :src="musicData"
  ref="audioIns"
  @loadeddata="onLoaded"
  autoplay="false"
  @timeupdate="onCurrentUpdate"
  @play="onPlay"
  @pause="onPause"
  @ended="onEnded"
  @complete="onComplete"
  )
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { controllerStore, settingStore } from '@/store'
const emits = defineEmits(['currentChanged', 'playEnd'])
const getControllerStore = controllerStore()
const getSettingStore = settingStore()
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
const onComplete = () => {
  // audioIns.value.autoplay = true
}
// 触发事件
const play = async () => {
  if (getControllerStore.playingUrl) {
    if (!(musicData.value ?? false)) {
      await loadData()
    }
    audioIns.value.play()
  }
}
const pause = () => {
  audioIns.value.pause()
}
const setDefault = () => {}
const setCurrent = (current) => {
  if (getControllerStore.isPlaying) {
    audioIns.value.currentTime = current ?? 0
  }
}
const loadData = async () => {
  musicData.value = URL.createObjectURL(
    new File(
      [(await window.underlying.getPlayUrl(getControllerStore.playingUrl)).buffer],
      getControllerStore.playingUrl
    )
  )
}
defineExpose({
  play,
  pause,
  setCurrent
})
watch(
  computed(() => getControllerStore.playingUrl),
  async () => {
    if (getControllerStore.playingUrl) {
      await loadData()
    }
  },
  {
    immediate: getSettingStore.playImmediate
  }
)
</script>

<style scoped lang="stylus"></style>
