<template lang="pug">
audio(
  v-show="false"
  :src="`atom://${getControllerStore.playingUrl}`"
  ref="audioIns"
  @loadeddata="onLoaded"
  @play="onPlay"
  @pause="onPause"
  @ended="onEnded"
  @volumechange="onVolumeChange"
  )
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { controllerStore, settingStore } from '@/store'
const emits = defineEmits(['currentChanged', 'playEnd', 'volumeChanged'])
const getControllerStore = controllerStore()
const getSettingStore = settingStore()
const audioIns = ref()
const musicData = ref()
// 监听事件

const onLoaded = () => {
  if (getSettingStore.playImmediate || getControllerStore.isPlaying) {
    play()
  }
  setPlaybackRate()
}
const onPlay = () => {
  getControllerStore.isPlaying = true
}
const onPause = (e) => {
  getControllerStore.isPlaying = e.target.ended
}
const onEnded = () => {
  emits('playEnd')
}
const onVolumeChange = () => {
  getControllerStore.volume = audioIns.value.volume * 100
  emits('volumeChanged', getControllerStore.volume)
}
// 触发事件
const play = async () => {
  if (getControllerStore.playingUrl) {
    audioIns.value.play()
  }
}
const pause = () => {
  audioIns.value.pause()
}
const setCurrent = (current) => {
  if (musicData.value !== '') {
    audioIns.value.currentTime = current ?? 0
    onCurrentUpdate()
  }
}
const setVolume = (volume) => {
  if (musicData.value !== '') {
    audioIns.value.volume = Math.min(Math.max(0, volume), 100) / 100
    onVolumeChange()
  }
}
const setPlaybackRate = (value = getSettingStore.playSpeed) => {
  audioIns.value.playbackRate = value
}
watch(
  computed(() => getSettingStore.playSpeed),
  () => {
    setPlaybackRate()
  }
)
defineExpose({
  play,
  pause,
  setCurrent,
  setVolume
})
// 高频率刷新current
const onCurrentUpdate = () => {
  getControllerStore.current = audioIns.value.currentTime
  emits('currentChanged', audioIns.value.currentTime)
}
let interval
watch(
  computed(() => ({
    isPlaying: getControllerStore.isPlaying,
    currentRefreshInterval: getSettingStore.currentRefreshInterval
  })),
  (data) => {
    clearInterval(interval)
    if (data.isPlaying) {
      interval = setInterval(onCurrentUpdate, data.currentRefreshInterval)
    }
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="stylus"></style>
