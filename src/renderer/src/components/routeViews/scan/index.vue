<template lang="pug">
#scanPage
  .setScanDirList(:class="{empty:dirList.length===0}")
    .emptyInfo(v-if="dirList.length===0")
      img.icon(:src="amazedImage")
      .info 你还没有扫描文件夹哦 !
    .dir(v-for="dir in dirList" :key="dir.path" :class="{noAuth:!dir.access}")
      img.icon(:src="dirIcon")
      .dirPath {{dir.path}}
      img.icon.button(:src="waitingIcon" v-if="activePath===dir.path")
      img.icon.button(:src="deleteIcon" @click="()=>removeDir(dir)")
  .buttons
    .button.setScanDirButton(@click="addDir") 添加文件夹
    .button.scanButton(@click="startScan" :class="{disabled:scanning}") {{scanning?'扫描中。。。':'开始扫描'}}
  Transition(name="fade")
    .scanResult(v-if="scanResultPopVisible")
      .title 扫描结果
      img.closeButton(:src="closeImage" @click="scanResultPopVisible=!scanResultPopVisible")
      .list
        .group(v-for="(result,path) in scanResultMap")
          .groupName(@click="result.display=!result.display")
            img.icon(:src="dirIcon")
            .label
              .path {{path}}
              .info {{result.length===0?'这个真的不是一个空文件夹么?':`发现 ${result.length} 首哦!`}}
          .emptyInfo(v-if="result.length===0" v-show="result.display")
            img.icon(:src="helpImage")
            .label 啊！怎么是空哒。。。
          .items(v-show="result.display" v-else )
            .item(v-for="item in result.items" :key="item.path")
              img.icon(:src="musicTypeSrcMap[item.suffix]")
              .name {{item.fileName}}
      .submitButton(@click="addToPlayList") 好吧，就是这些啦!
</template>

<script setup>
import { nextTick, onBeforeMount, ref, toRaw } from 'vue'
import amazedImage from '@/assets/img/amazed.png'
import dirIcon from '@/assets/icon/dir.svg'
import deleteIcon from '@/assets/icon/delete.svg'
import waitingIcon from '@/assets/icon/waiting.svg'
import flacImage from '@/assets/img/flac.png'
import mp3Image from '@/assets/img/mp3.png'
import wavImage from '@/assets/img/wav.png'
import closeImage from '@/assets/img/close.png'
import helpImage from '@/assets/img/help.png'
import { audio } from '@/methods'
import { controllerStore } from '@/store'

const musicTypeSrcMap = {
  '.flac': flacImage,
  '.mp3': mp3Image,
  '.wav': wavImage
}
const getControllerStore = controllerStore()
const dirList = ref([])
onBeforeMount(async () => {
  dirList.value = await getDirAccessibility(JSON.parse(localStorage.getItem('dirList') ?? '[]'))
})
const getDirAccessibility = async (list) => {
  return window.underlying.getDirAccessibility(list)
}
const addDir = async () => {
  const dirPathList = await window.underlying.openDirSelector()
  const list = [...new Set([...dirPathList, ...dirList.value.map((r) => r.path)])]
  dirList.value = await getDirAccessibility(list)
  localStorage.setItem('dirList', JSON.stringify(list))
}
const removeDir = (dir) => {
  dirList.value = dirList.value.filter(({ path }) => path !== dir.path)
}
const activePath = ref('')
const scanning = ref(false) // 扫描中状态
const scanResultPopVisible = ref(false)
const scanResultMap = ref({})
const startScan = async () => {
  scanning.value = true
  scanResultMap.value = await audio.scanByPathList(
    dirList.value.filter((item) => item.access),
    (path) => {
      activePath.value = path
    },
    () => {
      activePath.value = ''
    }
  )
  for (const path in scanResultMap.value) {
    scanResultMap.value[path].display = true
  }
  scanning.value = false
  scanResultPopVisible.value = true
}
const addToPlayList = () => {
  let listMap = {}
  for (const { items } of Object.values(toRaw(scanResultMap.value))) {
    listMap = { ...listMap, ...items }
  }
  getControllerStore.setMusicMap(listMap)
}
</script>

<style scoped lang="stylus">
#scanPage
  position relative
  flex 1
  overflow auto
  display flex
  flex-direction column
  align-items center
  justify-content center
  .buttons
    display flex
    .button
      height 60px
      width 240px
      border-radius 18px
      display flex
      justify-content center
      align-items center
      font-size 20px
      font-weight bold
      letter-spacing 5px
      cursor var(--cursor-pointing)
      margin 0 10px
    .button.disabled
      opacity 0.8
      cursor var(--cursor-noPointer)
      pointer-events none
    .setScanDirButton
      background-color rgba(134,193,102,.3)
      &:hover
        background-color rgba(134,193,102,.5)
    .scanButton
      background-color rgba(0,137,167,.3)
      &:hover
        background-color rgba(0,137,167,.5)

  .setScanDirList
    width 80%
    min-height 120px
    border-radius 18px
    border 5px dotted rgba(249,191,69,.3)
    display flex
    flex-direction column
    align-items center
    margin 15px 0
    padding 10px
    max-height 60%
    overflow auto
    .emptyInfo
      display flex
      align-items center
      .icon
        width 80px
        height 80px
        padding-right 10px
       .info
         font-size 22px
         font-weight bold
    .dir
      width 100%
      height 40px
      display flex
      align-items center
      margin 2px 0
      border-radius 5px
      background-color rgba(120,194,196,.1)
      .icon
        height 25px
        padding 0 10px 0 20px
      .dirPath
        font-size 13px
        font-weight bold
        flex 1 0 0
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
      .button
        cursor var(--cursor-pointing)
        padding 6px
        border-radius 25%
        height 20px
        margin 0 10px
        &:hover
          background-color rgba(120,194,196,.3)
    .dir.noAuth
      background-color rgba(120,120,120,.2)
      opacity 0.5

  .setScanDirList.empty
    justify-content center
  .scanResult
    position absolute
    width 60%
    height 80%
    background-color #FFFFFF
    box-shadow 0 0 80px 10px rgba(245,150,170,.3)
    border-radius 30px
    display flex
    flex-direction column
    padding 20px
    .title
      height 25px
      font-size 18px
      font-weight bold
      display flex
      justify-content center
      align-items center
      padding 5px 0 15px
    .list
      flex 1 0 0
      overflow auto
      display flex
      flex-direction column
      &::-webkit-scrollbar
        width 0
      .group
        display flex
        flex-direction column
        .groupName
          display flex
          font-size 13px
          font-weight 1000
          background-color rgba(181,202,160,.2)
          padding 10px
          cursor var(--cursor-pointing)
          align-items center
          .icon
            height 25px
            padding-right 20px
        .items
          padding 10px 5px 10px 15px
          .item
            height 40px
            display flex
            align-items center
            .icon
              height 25px
              padding-right 20px
            .name
              flex 1 0 0
              padding-right 10px
              font-size 14px
              overflow hidden
              white-space nowrap
              text-overflow ellipsis
        .emptyInfo
          display flex
          justify-content center
          align-items center
          padding 10px
          .icon
            height 60px
            width 60px
            padding 0 10px
          .label
            font-size 15px
            font-weight bolder
            padding 5px
    .closeButton
      position absolute
      right 15px
      top 15px
      height 25px
      width 25px
      //padding 5px
      border-radius 3px
      cursor var(--cursor-pointing)
      &:hover
        background-color rgba(245,150,170,0.5)
        box-shadow 0 0 15px 5px rgba(245,150,170,0.5)
    .submitButton
      margin-top 15px
      width 140px
      height 40px
      background-color rgba(120,194,196,.2)
      align-self center
      font-size 13px
      font-weight bolder
      display flex
      justify-content center
      align-items center
      border-radius 8px
      &:hover
        cursor var(--cursor-pointing)
        background-color rgba(120,194,196,.4)
</style>
