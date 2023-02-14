<template lang="pug">
.progress.pointing(@click.stop="clickProgress" @mousedown="()=>getSettingStore.progressBarAllowSlide&&mousedown()")
  .enabled(:style="`width:${getPercent}%`")
  .current(:style="`left:${getPercent}%`")
    .timeDisplay
      .time
        .default {{ getTime.minute }}
        Transition(name="roll")
          .text(:key="getTime.minute") {{ getTime.minute }}
      .time :
      .time
        .default {{ getTime.second }}
        Transition(name="roll")
          .text(:key="getTime.second") {{ getTime.second }}
    .pointer
  .current(style="left:100%")
    .timeDisplay {{common.getTime(props.length).minute}}:{{common.getTime(props.length).second}}
    .pointer
</template>

<script setup>
import { computed, ref } from 'vue'
import { common } from '@/methods'
import { settingStore } from '@/store/index.js'

const getSettingStore = settingStore()
const props = defineProps(['current', 'length'])
const emits = defineEmits(['setProgress'])
const progress = ref()
const getPercent = computed(() =>
  props.length ? +((props.current / props.length) * 100).toFixed(2) : 0
)
const getTime = computed(() => common.getTime(props.current))
const clickProgress = (e) => {
  emits(
    'setProgress',
    (props.length * (e.x - e.target.getBoundingClientRect().x)) /
      e.target.getBoundingClientRect().width
  )
}
const mousedown = () => {
  document.body.addEventListener('mousemove', clickProgress)
  document.body.addEventListener('mouseleave', mouseup)
  document.body.addEventListener('mouseup', mouseup)
}
const mouseup = () => {
  document.body.removeEventListener('mousemove', clickProgress)
  document.body.removeEventListener('mouseleave', mouseup)
  document.body.removeEventListener('mouseup', mouseup)
}
</script>

<style scoped lang="stylus">
.progress
  width inherit
  height 10px
  border-radius 3px
  background-color #F8C3CD
  border 1px solid #B5495B
  display flex
  margin 25px 10px 0
  position relative
  box-shadow 0 0 15px 3px rgba(254,223,225,1)
  .current
    position absolute
    font-size 12px
    font-weight bold
    height 28px
    transform translateX(-50%)
    background-color #ffffff
    top -42px
    border-radius 10px
    padding 0 6px
    line-height 30px
    display flex
    justify-content center
    pointer-events none
    transition all 0.8s
    .timeDisplay
      position relative
      display flex
      .time
        position relative
        display flex
        .default
          color transparent
        .text
          position absolute
    .pointer
      position absolute
      bottom -14px
      width 0
      height 0
      border 7px solid transparent
      border-top-color #FFFFFF
  .enabled
    background-color rgb(240,150,170)
    transition all 0.8s
  *
    pointer-events none
</style>
