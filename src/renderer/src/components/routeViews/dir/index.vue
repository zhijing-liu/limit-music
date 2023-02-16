<template lang="pug">
#dir
  .group(v-for="(data,dirPath) in getDirMap")
    .groupName.pointing(@click="foldDir[dirPath]=!foldDir[dirPath]")
      img.icon(:src="dirIcon")
      .label
        .path {{dirPath}}
      .space
      img.removeButton(:src="removeImage" @click="()=>removeDir(dirPath)")
    .items(v-show="!data.fold")
      .item(v-for="item in data.list" :key="item.path")
        .name {{item.fileName}}
</template>

<script setup>
import { controllerStore, musicInfoDb } from '@/store'
import { computed, reactive, toRaw, watch } from 'vue'
import dirIcon from '@/assets/icon/dir.svg'
import removeImage from '@/assets/img/remove.png'

const getControllerStore = controllerStore()
const foldDir = reactive({})
const getDirMap = computed(() => {
  const map = {}
  for (const path in getControllerStore.musicMap) {
    const data = getControllerStore.musicMap[path]
    if (!map[data.dirPath]) {
      map[data.dirPath] = {
        list: [],
        fold: foldDir[data.dirPath]
      }
    }
    map[data.dirPath].list.push(data)
  }
  return map
})
const removeDir = async (dirPath) => {
  await musicInfoDb.musicItem.where('dirPath').equals(dirPath).delete()
  await getControllerStore.refreshMusicMap()
}
</script>

<style scoped lang="stylus">
#dir
  font-size 14px
  .group
    display flex
    flex-direction column
    .groupName
      display flex
      font-size 13px
      font-weight 1000
      background-color rgba(181,202,160,.2)
      padding 10px
      align-items center
      .icon
        height 25px
        padding-right 20px
      .space
        flex 1 0 0
      .removeButton
        width 30px
        height 30px
        padding 5px
        border-radius 5px
        &:hover
          background-color rgba(181,202,160,.2)
    .items
      max-height 60vh
      overflow auto
      .item
        height 40px
        display flex
        align-items center
        background-color rgba(165,222,228,0.2)
        padding 0 10px
        margin 5px 0
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
        &:hover
          background-color rgba(165,222,228,0.4)
</style>
