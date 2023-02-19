<template lang="pug">
audio(
  :src="musicData"
  ref="audioIns"
  @loadeddata="onLoaded"
  autoplay="false"
  @play="onPlay"
  @pause="onPause"
  @ended="onEnded"
  @volumechange="onVolumeChange"
  )
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { controllerStore, settingStore } from '@/store'
const emits = defineEmits(['currentChanged', 'playEnd', 'volumeChanged'])
const getControllerStore = controllerStore()
const getSettingStore = settingStore()
const audioIns = ref()
const musicData = ref()
// 监听事件

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
const onVolumeChange = () => {
  getControllerStore.volume = audioIns.value.volume * 100
  emits('volumeChanged', getControllerStore.volume)
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
  setCurrent,
  setVolume
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

<style scoped lang="stylus">
audio
  display none
</style>
