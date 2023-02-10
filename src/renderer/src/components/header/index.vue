<template lang="pug">
#header()
  .logo
    img(:src="LOGOIcon")
  .title limit music
  .rightButtons
    .rightButton(@click="windowHandler.minWindow")
      img(:src="narrowIcon")
    .rightButton(@click="windowHandler.maxWindow")
      img(:src="fullIcon")
    .rightButton(@click="windowHandler.powerOff")
      img(:src="closeIcon")
</template>

<script setup>
import LOGOIcon from '@/assets/logo.png'
import closeIcon from '@/assets/icon/close.svg'
import fullIcon from '@/assets/icon/full.svg'
import narrowIcon from '@/assets/icon/narrow.svg'
import { windowHandler } from '@/methods/index.js'
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
    cursor var(--cursor-pointing)
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
      cursor var(--cursor-pointing)
      img
        width 100%
        height 100%
      &:hover
        background-color rgba(144,144,144,.2)
</style>
