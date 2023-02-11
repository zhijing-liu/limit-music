<template lang="pug">
#music
  .header
  #musicList(ref="musicListIns")
    .musicItem(v-for="item in getControllerStore.getMusicDisplayList" @click="()=>playMusic(item)")
      img.musicTypePic(:src="musicTypeSrcMap[item.suffix]")
      .musicName {{item.name}}
</template>

<script setup>
import { controllerStore } from '@/store'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import flacImage from '@/assets/img/flac.png'
import mp3Image from '@/assets/img/mp3.png'
import wavImage from '@/assets/img/wav.png'

const musicTypeSrcMap = {
  '.flac': flacImage,
  '.mp3': mp3Image,
  '.wav': wavImage
}
const getControllerStore = controllerStore()
const playMusic = (item) => {
  getControllerStore.audioPlayerInstance.setPlayUrl(item.path)
}
</script>

<style scoped lang="stylus">
#music
  .header
    height 80px
  #musicList
    flex 1 0 0
    padding 10px 22px
    box-sizing border-box
    display flex
    flex-direction column
    justify-content space-between
    overflow auto
    .musicItem
      height 40px
      flex 1 0 40px
      display flex
      align-items center
      background-color rgba(165,222,228,.2)
      margin-bottom 10px
      padding 10px 18px
      border-radius 15px
      cursor var(--cursor-pointing)
      &:hover
        background-color rgba(165,222,228,.4)
        box-shadow 0 0 10px 5px rgba(165,222,228,.4)
      .musicTypePic
        width 40px
        height 40px
        padding-right 20px
</style>
