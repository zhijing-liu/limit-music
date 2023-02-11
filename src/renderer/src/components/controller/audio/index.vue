<template lang="pug"></template>
<script setup>
import { controllerStore } from '@/store'
import { computed, ref, watch } from 'vue'
const getControllerStore = controllerStore()
const audioCtx = new AudioContext()
// const analyser = audioCtx.createAnalyser()
const emits = defineEmits(['currentChanged', 'isPlayingChanged', 'playEnd'])
const playerStateMap = {
  running: true,
  suspended: false
}
let audioSource = null
audioCtx.addEventListener('statechange', () => {
  console.log(audioCtx.state, 'audioCtx.state')
  getControllerStore.isPlaying = playerStateMap[audioCtx.state]
  emits('isPlayingChanged', getControllerStore.isPlaying)
})
const audioBuffer = ref(null)
const playingUrl = computed(() => getControllerStore.playingUrl)
const getAudioBuffer = async (url) => {
  return await audioCtx.decodeAudioData((await window.underlying.getPlayUrl(url)).buffer)
}
const createSource = async (
  { current = 0, buffer = audioBuffer.value, immediate = true } = {
    current: 0,
    buffer: audioBuffer.value,
    immediate: true
  }
) => {
  audioSource = audioCtx.createBufferSource()
  audioSource.buffer = buffer
  audioSource.addEventListener('ended', () => {
    playEnd()
  })
  audioSource.connect(audioCtx.destination)
  immediate && audioSource.start(0, current)
  return audioSource
}
const play = async () => {
  await audioCtx.resume()
}
const pause = async () => {
  await audioCtx.suspend()
}
const playEnd = () => {
  emits('playEnd')
}
const setCurrent = async (current) => {
  if (audioSource) {
    audioSource.stop()
    audioSource = null
  }
  await createSource({ current })
}
const setPlayUrl = async (url = playingUrl.value, immediate) => {
  getControllerStore.playingUrl = url
  // await initData((url = playingUrl.value), immediate)
}
const initData = async (url = playingUrl.value, immediate = true) => {
  if (audioSource) {
    console.log(890890)
    audioSource.stop()
    audioSource = null
  }
  audioBuffer.value = await getAudioBuffer(url)
  await createSource({ immediate })
}
watch(
  playingUrl,
  async () => {
    if (playingUrl.value !== '') {
      await initData()
    }
  },
  {
    immediate: true
  }
)
const updateCurrent = () => {
  getControllerStore.current = audioCtx.currentTime
  emits('currentChanged', getControllerStore.current)
}
let currentTimer = null
const isPlaying = computed(() => getControllerStore.playingUrl)
watch(isPlaying, () => {
  if (isPlaying.value) {
    currentTimer = setInterval(() => {
      updateCurrent()
    }, 100)
  } else {
    clearInterval(currentTimer)
    currentTimer = null
  }
})
defineExpose({
  play,
  pause,
  setCurrent,
  setPlayUrl
})
</script>

<style scoped lang="stylus"></style>
