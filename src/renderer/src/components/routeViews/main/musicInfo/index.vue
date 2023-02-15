<template lang="pug">
Transition(name="fullDown-quick" @after-leave="afterLeave")
  .musicInfo.pointing(v-show="visible" @click="close")
    .items
      .item
        .label 歌曲名
        .value {{item?.title}}
      .item
        .label 类型
        .value {{item?.suffix?.slice(1)}}
      .item
        .label 时长
        .value {{common.getTime(item?.duration??0,true)}}
      .item
        .label 歌手
        .value {{item?.artists?.toString()}}
      .item
        .label 专辑
        .value {{item?.album}}
      .item
        .label 年份
        .value {{item?.year}}
      .item
        .label 描述
        .value {{item?.description}}
      .item
        .label 路径
        .value {{item?.path}}
      .item
        .label 无损
        .value {{item?.lossless}}
      .item
        .label 编码
        .value {{item?.sampleRate}}
      .item
        .label 位深
        .value {{item?.bitsPerSample}}bit
    .closeButton
      img.icon(:src="putAwayImage")
      .label 收起
</template>
<!--{-->
<!--"fileName": "莫扎特：土耳其进行曲.mp3",-->
<!--"suffix": ".mp3",-->
<!--"path": "E:\\MyMusic\\莫扎特：土耳其进行曲.mp3",-->
<!--"dirPath": "E:\\MyMusic",-->
<!--"title": "莫扎特：土耳其进行曲",-->
<!--"year": 2013,-->
<!--"description": [-->
<!--"Mozart: Turkischer Marsch K.331\n选自《一个消失的录音室》"-->
<!--],-->
<!--"artists": [-->
<!--"群星"-->
<!--],-->
<!--"album": "2012十大发烧唱片精选",-->
<!--"duration": 197.01551020408164,-->
<!--"access": true-->
<!--}-->
<script setup>
import { ref } from 'vue'
import putAwayImage from '@/assets/img/putAway.png'
import { common } from '@/methods/index.js'

const visible = ref(false)
const item = ref()
defineExpose({
  display: (data) => {
    item.value = data
    visible.value = true
  }
})
const close = () => {
  visible.value = false
}
const afterLeave = () => {
  item.value = {}
}
</script>

<style scoped lang="stylus">
.musicInfo
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  display flex
  flex-direction column
  justify-content center
  align-items center
  background-color rgba(255,255,255,.8)
  z-index 100
  .items
    width 80%
    display flex
    flex-direction column
    background-color rgba(165,222,228,.7)
    border-radius 30px
    padding 40px
    .item
      display flex
      justify-content space-between
      align-items center
      font-size 14px
      font-weight bolder
      padding 10px 15px
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
