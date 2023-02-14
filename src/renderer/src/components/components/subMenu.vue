<template lang="pug">
Transition(name="fade-quick")
  .subMenuMask(v-show="visible" @click="visible=false")
    .subMenu.pointing(:style="getStyle")
      img.item(:src="infoImage" @click="()=>events?.displayInfo()")
      img.item(:src="shareImage" v-if="getSettingStore.webServeEnable" @click="()=>events?.share()")
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import shareImage from '@/assets/img/share.png'
import infoImage from '@/assets/img/info.png'
import { settingStore } from '@/store'
const getSettingStore = settingStore()
const visible = ref(false)
const offSet = reactive({
  x: 0,
  y: 0
})
const getStyle = computed(() => {
  return `right:${offSet.x}px;top:${offSet.y}px;`
})
const events = ref({})
defineExpose({
  display: (fns, pos) => {
    offSet.x = pos.x
    offSet.y = pos.y
    events.value = fns
    visible.value = true
  }
})
</script>

<style scoped lang="stylus">
.subMenuMask
  position absolute
  left 0
  top 0
  height 100%
  width 100%
  background-color rgba(255,255,255,.2)
  .subMenu
    transform:translate(-50%,-50%)
    position absolute
    display flex
    //flex-direction column
    //height 30px
    //overflow hidden
    .item
      width 30px
      height 30px
      padding 5px
      margin 0 3px
      background-color rgba(125,185,222,.5)
      border-radius 10px
      &:hover
        background-color rgba(125,185,222,.8)
</style>
