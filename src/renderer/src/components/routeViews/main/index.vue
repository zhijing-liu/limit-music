<template lang="pug">
template(v-if="getControllerStore.getMusicDisplayList.length===0")
  #music.empty.pointing(@click="toScan")
    img.icon.boredImage(:src="boredImage")
    img.icon.tsundereImage(:src="tsundereImage")
    .emptyInfo 没有音乐怎么播嘛！
    .clickInfo 快点我去搜索啦！
template(v-else)
  #music(ref="musicIns")
    #musicList.noScrollBar(ref="musicListIns")
      TransitionGroup(name="fade")
        .musicItem.pointing(
          v-for="item in getControllerStore.getMusicDisplayList"
          @click="()=>playMusic(item)"
          :key="item.path"
          :class="{playing:getControllerStore.playingUrl===item.path,disabled:!item.access}"
          :ref="(itemIns)=>{getControllerStore.playingUrl===item.path&&(selectIns=itemIns)}"
          )
          img.musicTypePic(:src="musicTypeSrcMap[item.suffix]")
          .musicInfo
            .musicName {{item.title}}
            .musicArtists {{item.artists?.join(' ')}}
          img.morePic(:src="moreImage" @click.stop="(e)=>clickItem(e.target,item)")
    QRCode(ref="qrCodeIns")
    SubMenu(ref="subMenuIns")
    MusicInfo(ref="musicInfoIns")
</template>

<script setup>
import { controllerStore } from '@/store'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import flacImage from '@/assets/img/flac.png'
import mp3Image from '@/assets/img/mp3.png'
import wavImage from '@/assets/img/wav.png'
import boredImage from '@/assets/img/bored.png'
import tsundereImage from '@/assets/img/tsundere.png'
import moreImage from '@/assets/img/more.png'
import QRCode from './qrCode/index.vue'
import SubMenu from '@/components/components/subMenu.vue'
import MusicInfo from './musicInfo/index.vue'

const musicIns = ref()
const selectIns = ref()
const musicTypeSrcMap = {
  '.flac': flacImage,
  '.mp3': mp3Image,
  '.wav': wavImage
}
const getControllerStore = controllerStore()
const router = useRouter()
const playMusic = (item) => {
  if (item.access) {
    getControllerStore.playingUrl = item.path
  }
}
const toScan = () => {
  router.push({ name: 'scan' })
}
watch(selectIns, () => {
  selectIns.value?.scrollIntoView({
    block: 'center'
  })
})
const subMenuIns = ref()
const qrCodeIns = ref()
const share = async (item) => {
  qrCodeIns.value.display(item)
}
const musicInfoIns = ref()
const displayInfo = async (item) => {
  musicInfoIns.value.display(item)
}
const clickItem = (icon, item) => {
  const rect = icon.getBoundingClientRect()
  const musicRect = musicIns.value.getBoundingClientRect()
  subMenuIns.value.display(
    {
      share: () => share(item),
      displayInfo: () => displayInfo(item)
    },
    {
      x: musicRect.x + musicRect.width - rect.x - rect.width + 10,
      y: rect.y - musicRect.y + rect.height / 2
    }
  )
}
</script>

<style scoped lang="stylus">
#music
  display flex
  border-radius 10px
  position relative
  #musicList
    flex 1 0 0
    padding 10px 22px
    box-sizing border-box
    display flex
    flex-direction column
    justify-content space-between
    overflow auto
    scroll-behavior smooth
    .musicItem
      height 40px
      flex 1 0 40px
      display flex
      align-items center
      background-color rgba(165,222,228,.2)
      margin-bottom 10px
      padding 10px 18px
      border-radius 15px
      &:hover
        background-color rgba(165,222,228,.4)
        box-shadow 0 0 10px 5px rgba(165,222,228,.4)
      .musicTypePic
        width 40px
        height 40px
        padding-right 20px
      .morePic
        width 30px
        height 30px
        padding 5px
        border-radius 10px
        &:hover
          background-color rgba(165,222,228,.4)
      .musicInfo
        flex 1 0 0
        .musicName
          font-weight bold
          font-size 15px
          padding-top 2px
          padding-bottom 3px
        .musicArtists
          font-size 12px
          line-height 12px
    .musicItem.playing
      background-color rgba(225,107,140,.2)
      &:hover
        background-color rgba(225,107,140,.4)
        box-shadow 0 0 10px 5px rgba(225,107,140,.4)
      .morePic
        &:hover
          background-color rgba(225,107,140,.4)
    .musicItem.disabled
      background-color rgba(144,144,144,.2)
      &:hover
        background-color rgba(144,144,144,.2)
        box-shadow none
      .morePic
        &:hover
          background-color rgba(144,144,144,.4)
#music.empty
  display flex
  flex-direction column
  justify-content center
  align-items center
  border-radius 20px
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
