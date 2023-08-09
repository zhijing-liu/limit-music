<template lang="pug">
canvas.streamer(ref="streamer")
</template>

<script setup>
import { computed, onActivated, onDeactivated, reactive, ref, watch } from 'vue'
import { settingStore } from '@/store'
import starImage from '@/assets/img/star.png'
import snowImage from '@/assets/img/snow.png'
import CanvasRendererFn from './canvasRenderer.js?worker'
import { Worker } from '@/worker/index.js'

const getSettingStore = settingStore()
const streamer = ref()
const refreshSize = () => {
  const { width, height } = streamer.value.getBoundingClientRect()
  canvasRect.width = width
  canvasRect.height = height
  streamer.value.width = width
  streamer.value.height = height
}
const canvasRect = reactive({
  width: 0,
  height: 0
})

const worker = new Worker(CanvasRendererFn, {
  updateBitMap: (bitmap) => {
    streamer.value.width = canvasRect.width
    streamer.value.getContext('2d').drawImage(bitmap, 0, 0)
  }
})
const getRenderData = computed(() => ({
  canvasRect,
  blur: getSettingStore.streamerBlur,
  speed: getSettingStore.streamerSpeed,
  count: getSettingStore.streamerCount,
  type: getSettingStore.streamerType,
  starImage,
  snowImage
}))
watch(
  getRenderData,
  () => {
    worker.postMessage('changeData', getRenderData.value)
  },
  {
    immediate: true,
    deep: true,
    flush: 'sync'
  }
)
onActivated(() => {
  window.addEventListener('resize', refreshSize)
  refreshSize()
  worker.postMessage('start', getRenderData.value)
})
onDeactivated(() => {
  worker.postMessage('stop')
  window.removeEventListener('resize', refreshSize)
})
</script>

<style scoped lang="stylus">
.streamer
  filter blur(0px)!important
</style>
