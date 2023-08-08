<template lang="pug">
canvas.streamer(ref="streamer")
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { settingStore } from '@/store'
import starImage from '@/assets/img/star.png'
import snowImage from '@/assets/img/snow.png'

const getSettingStore = settingStore()
const streamer = ref()
const refreshSize = () => {
  const { width, height } = streamer.value.getBoundingClientRect()
  canvasRect.width = width
  canvasRect.height = height
  streamer.value.width = width
  streamer.value.height = height
}
const streamerUnits = reactive({})
const canvasRect = reactive({
  x: 0,
  y: 0
})
let RAF
const frameElapse = (fn) => {
  RAF = requestAnimationFrame(() => {
    fn()
    frameElapse(fn)
  })
}
const drawRainUnit = (ctx, data) => {
  data.y += 0.005 * data.size * getSettingStore.streamerSpeed
  const { size, x, y } = data
  ctx.fillStyle = 'rgba(165,222,228,.5)'
  if (getSettingStore.streamerBlur) {
    ctx.filter = `blur(${3 - size}px)`
  }
  ctx.fillRect(x * canvasRect.width, y * canvasRect.height, size, 5 * size)
}
const starImageBitMap = new Image()
const snowImageBitMap = new Image()
const drawStarUnit = (ctx, data) => {
  data.y += 0.001 * data.size * getSettingStore.streamerSpeed
  data.x -= 0.0003 * data.size * getSettingStore.streamerSpeed
  const { size, x, y } = data
  if (getSettingStore.streamerBlur) {
    ctx.filter = `blur(${3 - size}px)`
  }
  ctx.drawImage(
    starImageBitMap,
    x * canvasRect.width * 1.5,
    y * canvasRect.height,
    5 * size,
    5 * size
  )
}
const drawSnowUnit = (ctx, data) => {
  data.y += 0.001 * data.size * getSettingStore.streamerSpeed
  data.x -= 0.0003 * data.size * getSettingStore.streamerSpeed * data.skew
  const { size, x, y } = data
  if (getSettingStore.streamerBlur) {
    ctx.filter = `blur(${3 - size}px)`
  }
  ctx.drawImage(
    snowImageBitMap,
    x * canvasRect.width * 1.5,
    y * canvasRect.height,
    5 * size,
    5 * size
  )
}
const drawMap = {
  rain: drawRainUnit,
  star: drawStarUnit,
  snow: drawSnowUnit
}
const start = (ctx = streamer.value.getContext('2d')) => {
  frameElapse(() => {
    for (let i = 0; i < getSettingStore.streamerCount; i++) {
      streamerUnits[new Date().getTime() + i] = {
        x: Math.random(),
        y: -0.1,
        size: Math.random() * 2 + 0.5,
        skew: Math.random()
      }
    }
    const fn = drawMap[getSettingStore.streamerType]
    ctx.clearRect(0, 0, streamer.value.width, streamer.value.height)
    for (const timeStep in streamerUnits) {
      const data = streamerUnits[timeStep]
      if (data.y > 1.1) {
        Reflect.deleteProperty(streamerUnits, timeStep)
      } else {
        fn(ctx, data)
      }
    }
  })
}
onMounted(async () => {
  window.addEventListener('resize', refreshSize)
  refreshSize()
  await Promise.all([
    new Promise((resolve) => {
      starImageBitMap.addEventListener('load', () => {
        resolve()
      })
      starImageBitMap.src = starImage
    }),
    new Promise((resolve) => {
      snowImageBitMap.addEventListener('load', () => {
        resolve()
      })
      snowImageBitMap.src = snowImage
    })
  ])
  start()
})
onUnmounted(() => {
  window.removeEventListener('resize', refreshSize)
  cancelAnimationFrame(RAF)
})
</script>

<style scoped lang="stylus">
.streamer
  filter blur(0px)!important
</style>
