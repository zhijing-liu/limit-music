<template lang="pug">
Transition(name="fullDown-quick" @after-leave="afterLeave")
  #webControllerQrCode.pointing(v-if="getComponentVisibleStore.webControllerVisible&&getSettingStore.webControllerEnable" @click="close")
    .title.pointing(@click.stop="clickTitle") limit 音乐控制台
    .subTitle 远程控制你的音乐
    .qr
      img.codeImage(:src="imageSrc")
    .closeButton
      img.icon(:src="putAwayImage")
      .label 收起
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import putAwayImage from '@/assets/img/putAway.png'
import { componentVisibleStore, settingStore } from '@/store'
import QRCode from 'qrcode'

const getComponentVisibleStore = componentVisibleStore()
const imageSrc = ref('')
const visible = ref(false)
const getSettingStore = settingStore()
const imageUrl = computed(
  () =>
    `http://${window.serve.getIp('getLocalIPv4')?.address}:${
      getSettingStore.webControllerPort
    }/controller`
)
const clickTitle = () => {
  open(imageUrl.value)
}
const close = () => {
  getComponentVisibleStore.webControllerVisible = false
}
const afterLeave = () => {
  getComponentVisibleStore.webControllerVisible = false
}
onMounted(async () => {
  imageSrc.value = imageUrl.value
    ? await QRCode.toDataURL(imageUrl.value, {
        color: {
          light: '#81c7d400',
          dark: '#8F5A3CDD'
        }
      })
    : ''
})
</script>

<style scoped lang="stylus">
#webControllerQrCode
  position absolute
  top 0
  left 0
  display flex
  width 100%
  height 100%
  flex-direction column
  justify-content center
  align-items center
  background-color rgba(255,255,255,.8)
  z-index 100
  .title
    padding 15px 30px
    font-size 32px
    background-color rgba(134,193,102,.3)
    border-radius 30px
    overflow hidden
    white-space nowrap
    text-overflow ellipsis
    max-width 80%
    &:hover
      background-color rgba(134,193,102,.4)
  .subTitle
    margin 15px
    font-size 22px
    background-color rgba(129,199,212,.3)
    padding 5px 10px
    border-radius 10px
  .qr
    padding 30px
    border-radius 50px
    width 200px
    height 200px
    background-color rgba(178,143,206,.15)
    .codeImage
      width 100%
      height 100%
  .closeButton
    display flex
    font-size 13px
    padding 10px 20px
    align-items center
    margin-top 45px
    border-radius 15px
    transition all 0.3s
    .icon
      width 40px
      height 40px
    .label
      font-weight bold
      padding 0 10px
    &:hover
      background-color rgba(46,169,223,.1)
</style>
