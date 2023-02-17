<template lang="pug">
#dir
  .group(v-for="(data,dirPath) in getDirMap")
    .groupName.pointing(@click="foldDir=(foldDir===dirPath?'':dirPath)")
      img.icon(:src="dirIcon")
      .label
        .path {{dirPath}}
        .length {{data.length}} 首
      .space
      img.removeButton(:src="removeImage" @click.stop="()=>removeDir(dirPath)")
    .items.noScrollBar(v-show="foldDir===dirPath")
      .item(v-for="item in data" :key="item.path")
        .name {{item.fileName}}
        img.removeButton(:src="removeImage" @click.stop="()=>removeMusic(item.path)")
</template>

<script setup>
import { controllerStore, musicInfoDb } from '@/store'
import { computed, reactive, ref, toRaw, watch } from 'vue'
import dirIcon from '@/assets/icon/dir.svg'
import removeImage from '@/assets/img/remove.png'

const getControllerStore = controllerStore()
const foldDir = ref('')
const getDirMap = computed(() => {
  const map = {}
  for (const path in getControllerStore.musicMap) {
    const data = getControllerStore.musicMap[path]
    if (!map[data.dirPath]) {
      map[data.dirPath] = []
    }
    map[data.dirPath].push(data)
  }
  return map
})
const removeDir = async (dirPath) => {
  await musicInfoDb.musicItem.where('dirPath').equals(dirPath).delete()
  await getControllerStore.refreshMusicMap()
}
const removeMusic = async (path) => {
  await musicInfoDb.musicItem.where('path').equals(path).delete()
  await getControllerStore.refreshMusicMap()
}
</script>

<style scoped lang="stylus">
#dir
  justify-content center
  .group
    display flex
    flex 0
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
      overflow auto
      flex 1 0 0
      min-height 40vh
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
        .removeButton
          width 30px
          height 30px
          padding 5px
          &:hover
            background-color rgba(165,222,228,0.2)
</style>
