<template lang="pug">
.warning(@mouseenter="hover" @mouseleave="leave")
  img.icon(:src="warningImage" )
  Transition(name="fade")
    .info(v-show="visible") {{info}}
</template>

<script setup>
import warningImage from '@/assets/img/warning.png'
import { ref } from 'vue'
const props = defineProps(['info'])
const visible = ref(false)
let enterTimer = null
let leaveTimer = null
const hover = () => {
  clearTimeout(enterTimer)
  clearTimeout(leaveTimer)
  enterTimer = setTimeout(() => {
    visible.value = true
  }, 300)
}
const leave = () => {
  clearTimeout(enterTimer)
  clearTimeout(leaveTimer)
  leaveTimer = setTimeout(() => {
    visible.value = false
  }, 200)
}
</script>

<style scoped lang="stylus">
.warning
  width 20px
  height 20px
  display flex
  position relative
  justify-content center
  align-items center
  border-radius 50%
  font-size 12px
  .icon
    width 12px
    height 12px
  &:hover
    background-color rgba(226,226,226,1)
  .info
    position absolute
    right -5px
    transform translateX(100%)
    width 200px
    padding 15px 20px
    background-color #FFFFFF
    box-shadow 0 0 10px 5px rgba(144,144,144,.05)
    border-radius 15px
</style>
