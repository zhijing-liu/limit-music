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
    .button.scanButton(@click="startScan") 开始扫描
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount, nextTick, ref } from 'vue'
import amazedImage from '@/assets/img/amazed.png'
import dirIcon from '@/assets/icon/dir.svg'
import deleteIcon from '@/assets/icon/delete.svg'
import waitingIcon from '@/assets/icon/waiting.svg'
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
const startScan = async () => {
  const list = dirList.value.filter((item) => item.access)
  const promise = new Promise((resolve) => {
    if (list.length > 0) {
      let result = []
      let i = 0
      const getData = () => {
        activePath.value = list[i].path
        i++
        window.underlying.scanMusicByPath(activePath.value).then((r) => {
          result = [...result, ...r]
          if (list.length !== i) {
            nextTick(() => {
              getData()
            })
          } else {
            activePath.value = ''
            resolve(result)
          }
        })
      }
      getData()
    }
  })
  promise.then((data) => {
    console.log(data)
  })
}
</script>

<style scoped lang="stylus">
#scanPage
  flex 1
  overflow auto
  display flex
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
</style>
