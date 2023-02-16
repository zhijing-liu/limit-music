<template lang="pug">
#sidebar(@mouseleave="mouseleaveEvent" :class="{active:visible}" ref="sidebarIns" )
  .dragBar
    img.arrow(:src="arrowHeadImage" :class="{active:visible}" @mouseenter="addEvent")
  .icons
    img.search.pointing(:src="searchImage" @click="action=action==='search'?'':'search'")
  Transition(name="expansion")
    .action(v-if="action==='search'")
      .search.pointing
        input.searchArea(
          ref="activeIns"
          :value="getControllerStore.searchValue"
          @change="search"
          @focus="displayInfo.hasBlur=true"
          @blur="displayInfo.hasBlur=false"
          )
        img.clearButton(:src="clearImage" @click="getControllerStore.searchValue=''")
        .searchButton 搜索
</template>

<script setup>
import arrowHeadImage from '@/assets/img/arrowHead.png'
import searchImage from '@/assets/img/search.png'
import clearImage from '@/assets/img/clear.png'
import { nextTick, reactive, ref, watch } from 'vue'
import { controllerStore } from '@/store'

const getControllerStore = controllerStore()
const sidebarIns = ref()
const visible = ref(false)
const action = ref('')
let leaveTimer = null
const displayInfo = reactive({
  mouseenter: false,
  hasBlur: false
})
const mouseenterEvent = () => {
  displayInfo.mouseenter = true
}
const mouseleaveEvent = () => {
  displayInfo.mouseenter = false
}
const addEvent = () => {
  displayInfo.mouseenter = true
  sidebarIns.value.addEventListener('mouseenter', mouseenterEvent)
}
const activeIns = ref()
const search = (e) => {
  getControllerStore.searchValue = e.target.value
}
watch(displayInfo, () => {
  if (displayInfo.mouseenter || displayInfo.hasBlur) {
    clearTimeout(leaveTimer)
    visible.value = true
  } else if (!displayInfo.mouseenter) {
    leaveTimer = setTimeout(() => {
      visible.value = false
      action.value = ''
      sidebarIns.value.removeEventListener('mouseenter', mouseenterEvent)
    }, 500)
  }
})
watch(action, () => {
  nextTick(() => {
    activeIns.value?.focus()
  })
})
</script>

<style scoped lang="stylus">
#sidebar
  position absolute
  right 26px
  top 50%
  transform translateY(-50%) translateX(100%)
  display flex
  border-radius 30px 0 0 30px
  transition all 0.3s
  padding 30px 0
  border 2px dashed transparent
  border-right 0
  z-index 10
  .dragBar
    display flex
    align-items center
    padding 0 3px
    .arrow
      width 20px
      height 20px
      transform rotate(-90deg)
      transition all 0.3s
    .arrow.active
      transform rotate(-90deg) rotateX(180deg)
  .icons
    padding 10px
    height 100%
    display flex
    flex-direction column
    img
      width 30px
      height 30px
      padding 10px
      border-radius 10px
      &:hover
        background-color rgba(235,122,119,.4)
  .action
    width 240px
    display flex
    //flex-direction column
    align-items center
    .search
      border 2px dotted rgba(235,122,119,.4)
      border-radius 10px
      overflow hidden
      height 30px
      display flex
      .searchArea
        width 120px
        line-height 30px
        border 0
        outline none
        padding 0 15px
        height 100%
      .searchButton
        height 100%
        display flex
        justify-content center
        align-items center
        background-color rgba(235,122,119,.4)
        font-size 12px
        padding 0 5px
      .clearButton
        width 30px
        height 30px
#sidebar.active
  transform translateY(-50%) translateX(0)
  right 0
  border-color #EB7A77
  background-color #FFFFFF
  .dragBar
    padding 0 5px
// 动画
.expansion-enter-active
  transition all 0.3s
.expansion-leave-active
  transition all 0.3s
.expansion-enter-from,
.expansion-leave-to
  width 0 !important
.expansion-enter-to,
.expansion-leave-from
  width 240px !important
</style>
<style lang="stylus"></style>
