<template lang="pug">
Transition(name="fade" @after-enter="afterEnter")
  #musicListMask(v-show="visible" @click="visible=false")
    #musicList(@click.stop)
      .title 音乐列表
      .list
        .item(
          v-for="(item,path) in musicMap"
          :class="{active:path===playingUrl}"
          :key="path"
          :ref="(ins)=>path===playingUrl&&(activeIns=ins)"
          @click="()=>setPlayingUrl(path)"
          ) {{item.title}}
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import axios from 'axios'

const activeIns = ref()
const visible = ref(false)
const props = defineProps(['playingUrl', 'connecting'])
const musicMap = ref({})
const getList = async () => {
  const {
    data: { result }
  } = await axios.post('/action', {
    action: 'getMusicMap'
  })
  musicMap.value = result
}
const setPlayingUrl = (path) => {
  axios.post('/action', {
    action: 'setPlayingUrl',
    args: [path]
  })
}
const afterEnter = () => {
  activeIns.value?.scrollIntoView({
    block: 'center'
  })
}
watch(
  computed(() => props.connecting),
  () => {
    if (props.connecting) {
      getList()
    }
  }
)
watch(
  activeIns,
  () => {
    activeIns.value?.scrollIntoView({
      block: 'center'
    })
  },
  {
    immediate: true
  }
)
defineExpose({
  setVisible: () => {
    visible.value = true
  }
})
</script>

<style scoped lang="stylus">
#musicListMask
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  display flex
  align-items center
  justify-content center
  z-index 10
  background-color rgba(144,144,144,.1)
  #musicList
    box-sizing border-box
    height 60vh
    width 80vw
    background-color #d8eaf5
    border-radius 20px
    padding 2vh 2vw
    display flex
    flex-direction column
    border 1vh solid #b8ddf3
    box-shadow 0 0 3px 10px #b8ddf3
    .title
      padding 10px 5px
      color #333
      font-weight 1000
    .list
      flex 1 0 0
      overflow auto
      display flex
      flex-direction column
      scroll-behavior smooth
      .item
        padding 1vh 2vw
        margin 0.5vh 0
        color #333
        font-weight 600
        background-color #b8d8ed
        border-radius 1vh
      .item.active
        background-color #9ac9e8

.fade-enter-active
  transition all 0.3s
.fade-leave-active
  transition all 0.5s
.fade-enter-from,
.fade-leave-to
  opacity 0
.fade-enter-to,
.fade-leave-from
  opacity 1
</style>
