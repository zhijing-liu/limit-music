<template lang="pug">
#header
  .logo
    img(:src="LOGOIcon")
  .title.pointing(@click="getComponentVisibleStore.curtainVisible = true") limit music
  .rightButtons
    .rightButton.pointing(@click="windowHandler.minWindow")
      img(:src="narrowImage")
    .rightButton.pointing(@click="windowHandler.maxWindow")
      img(:src="fullImage")
    .rightButton.pointing(@click="out")
      img(:src="outImage")
</template>

<script setup>
import LOGOIcon from '@/assets/logo.png'
import outImage from '@/assets/img/out.png'
import fullImage from '@/assets/img/full.png'
import narrowImage from '@/assets/img/narrow.png'
import { windowHandler } from '@/methods/index.js'
import { componentVisibleStore, settingStore } from '@/store'
const getSettingStore = settingStore()
const getComponentVisibleStore = componentVisibleStore()
const out = () => {
  if (getSettingStore.toTrayWhenClickClose) {
    windowHandler.hide()
  } else {
    windowHandler.powerOff()
  }
}
</script>

<style scoped lang="stylus">
#header
  height 60px
  padding 10px
  box-sizing border-box
  display flex
  justify-content space-between
  align-items center
  -webkit-app-region drag
  *
    -webkit-app-region no-drag
  .logo
    height 30px
    padding 10px
    img
      height 30px
  .title
    font-size 18px
    height 18px
    font-weight 800
    text-transform uppercase
    padding 8px
    border-radius 8px
    transition background-color 0.8s
    &:hover
      background-color rgba(144,144,144,.12)
  .rightButtons
    display flex
    .rightButton
      height 27px
      width 27px
      padding 5px
      border-radius 5px
      img
        width 100%
        height 100%
      &:hover
        background-color rgba(144,144,144,.2)
</style>
