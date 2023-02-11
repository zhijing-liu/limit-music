<template lang="pug">
Transition(name="fade")
  #curtain(v-if="getComponentVisibleStore.curtainVisible")
    img.logo(:src="logoImage")
    .mainTitle “ Limit Music ”
    .subTitle Power By -zhijing
</template>

<script setup>
import { onBeforeMount, onMounted } from 'vue'
import { controllerStore, componentVisibleStore } from '@/store'
import logoImage from '@/assets/logo.png'
const getControllerStore = controllerStore()
const getComponentVisibleStore = componentVisibleStore()
onMounted(async () => {
  getControllerStore.musicMap = await window.underlying.getStorageMusicInfo()
})
onBeforeMount(() => {
  setTimeout(() => {
    getComponentVisibleStore.curtainVisible = false
  }, 2000)
})
</script>

<style scoped lang="stylus">
@-webkit-keyframes bounce{/*创建动画*/
  0%,100%,20%,50%,80%{
    -webkit-transform:translateY(0);
  }
  40%{
    -webkit-transform:translateY(-30px);
  }
  60%{
    -webkit-transform:translateY(-15px);
  }
}
#curtain
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  background-color #FFFFFF
  z-index 1000
  display flex
  flex-direction column
  justify-content center
  align-items center
  .logo
    height 30vh
  .mainTitle
    font-size 10vh
  .subTitle
    width 80vw
    font-size 4vh
    text-align right
    margin-top 25px
    text-shadow 0 1px 0 #c0c0c0,
      0 2px 0 rgba(248, 195, 205, .4),
      0 3px 0 rgba(248, 195, 205, .4),
      0 4px 0 rgba(248, 195, 205, .4),
      0 5px 10px rgba(248, 195, 205, .4)
    color rgb(232, 122, 144)
    animation:bounce 1s infinite
</style>
