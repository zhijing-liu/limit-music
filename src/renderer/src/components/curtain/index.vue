<template lang="pug">
Transition(name="fullDown")
  #curtain(v-if="getComponentVisibleStore.curtainVisible" @click="clickCurtain")
    img.logo(:src="logoImage")
    .mainTitle “ Limit Music ”
    .subTitle Power By -zhijing
</template>

<script setup>
import { computed, onBeforeMount, onMounted, watch } from 'vue'
import { controllerStore, componentVisibleStore, settingStore } from '@/store'
import logoImage from '@/assets/logo.png'
import { useRouter } from 'vue-router'

const getControllerStore = controllerStore()
const getSettingStore = settingStore()
const getComponentVisibleStore = componentVisibleStore()
const router = useRouter()
let mounted = false
onMounted(async () => {})
onBeforeMount(async () => {
  await getControllerStore.refreshMusicMap()
  await router.push({ name: 'main' })
  mounted = true
  getComponentVisibleStore.curtainVisible = false
})
const clickCurtain = () => {
  if (mounted) {
    getComponentVisibleStore.curtainVisible = false
  }
}
watch(
  computed(() => ({
    enable: getSettingStore.webServeEnable,
    port: getSettingStore.webServePort
  })),
  (data) => {
    if (data.enable) {
      window.serve.setServerStart({ port: data.port }).catch(() => {
        getSettingStore.webServeEnable = false
      })
    } else {
      window.serve.setServerClose({ port: data.port })
    }
  },
  {
    immediate: true
  }
)
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
@-webkit-keyframes reverse-bounce{/*创建动画*/
  0%,100%,20%,50%,80%{
    -webkit-transform:translateY(-30px);
  }
  40%{
    -webkit-transform:translateY(-15px);
  }
  60%{
    -webkit-transform:translateY(0);
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
    animation reverse-bounce 1.5s infinite
  .mainTitle
    font-size 10vh
    animation reverse-bounce 1.5s infinite
    animation-delay 0.5s
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
    animation bounce 1.5s infinite
    animation-delay 1s
</style>
