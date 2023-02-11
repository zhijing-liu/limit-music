<template lang="pug">
template(v-if="getControllerStore.getMusicDisplayList.length===0")
  #music.empty(@click="toScan")
    img.icon.boredImage(:src="boredImage")
    img.icon.tsundereImage(:src="tsundereImage")
    .emptyInfo 没有音乐怎么播嘛！
    .clickInfo 快点我去搜索啦！
template(v-else)
  #music
    .header
    #musicList(ref="musicListIns" )
      .musicItem(v-for="item in getControllerStore.getMusicDisplayList" @click="()=>playMusic(item)")
        img.musicTypePic(:src="musicTypeSrcMap[item.suffix]")
        .musicName {{item.album}},{{item.suffix}}
</template>

<script setup>
import { controllerStore } from '@/store'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import flacImage from '@/assets/img/flac.png'
import mp3Image from '@/assets/img/mp3.png'
import wavImage from '@/assets/img/wav.png'
import boredImage from '@/assets/img/bored.png'
import tsundereImage from '@/assets/img/tsundere.png'

const musicTypeSrcMap = {
  '.flac': flacImage,
  '.mp3': mp3Image,
  '.wav': wavImage
}
const getControllerStore = controllerStore()
const router = useRouter()
const playMusic = (item) => {
  console.log(item)
  // getControllerStore.audioPlayerInstance.setPlayUrl(item.path)
}
const toScan = () => {
  router.push({ name: 'scan' })
}
</script>

<style scoped lang="stylus">
#music
  display flex
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
#music.empty
  display flex
  flex-direction column
  justify-content center
  align-items center
  border-radius 20px
  cursor var(--cursor-pointing)
  .clickInfo
  .emptyInfo
    font-size 22px
    font-weight bolder
    letter-spacing 3px
  .clickInfo
  .tsundereImage
    display none
  transition all 0.8s
  &:hover
    background-color rgba(235,122,119,.1)
    .emptyInfo
    .boredImage
      display none
    .clickInfo
    .tsundereImage
      display block
</style>
