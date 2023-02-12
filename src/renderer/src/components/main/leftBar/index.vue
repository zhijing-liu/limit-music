<template lang="pug">
#leftBar
  #leftBarBody
    .item.pointing(
      v-for="item in items"
      :key="item.routeName"
      :class="{active:route.name===item.routeName}"
      @click="()=>routerPush(item)"
      )
      img.icon(:src="item.icon")
      .label {{item.label}}
  #leftBarBody.ended
    .item.pointing(
      v-for="item in endItems"
      :key="item.routeName"
      :class="{active:route.name===item.routeName}"
      @click="()=>routerPush(item)"
      )
      img.icon(:src="item.icon")
      .label {{item.label}}
</template>

<script setup>
import scanIcon from '@/assets/icon/scan.svg'
import listIcon from '@/assets/icon/list.svg'
import settingImage from '@/assets/img/setting.png'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive } from 'vue'
const items = reactive([
  {
    label: '歌曲',
    routeName: 'main',
    icon: listIcon
  },
  {
    label: '扫描',
    routeName: 'scan',
    icon: scanIcon
  }
])
const endItems = reactive([
  {
    label: '设置',
    routeName: 'setting',
    icon: settingImage,
    end: true
  }
])
const route = useRoute()
const router = useRouter()
const routerPush = (item) => {
  router.push({ name: item.routeName })
}
</script>

<style scoped lang="stylus">
#leftBar
  height 100%
  width 260px
  flex 0 0 260px
  display flex
  flex-direction column
  #leftBarBody
    flex 1 0 0
    margin 0 5px
    background-color rgba(144,144,144,.05)
    border-radius 15px
    display flex
    flex-direction column
    padding 20px 15px
    .item
      height 40px
      display flex
      align-items center
      border-radius 8px
      margin-bottom 10px
      background-color rgba(120,194,196,.1)
      justify-self flex-end
      &:hover
        background-color rgba(120,194,196,.3)
      .icon
        width 25px
        height 25px
        padding 0 10px
      .label
        font-size 14px
        font-weight bold
    .item.active
      color #FFFFFF
      background-color rgba(120,194,196,.8)
  #leftBarBody.ended
    flex-direction column-reverse
</style>
