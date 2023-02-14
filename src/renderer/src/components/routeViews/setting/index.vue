<template lang="pug">
#setting
  #settingHeader
    #settingTabs
      .tab(v-for="(tab,key) in settingGroups" :key="key" :class="{active:tabKey===key}" @click="tabKey=key")
        img.icon(:src="tab.icon")
        .label {{tab.title}}
  #settingBody
    Transition(name="fade")
      #settingContainer.noScrollBar(:key="tabKey")
        .title {{settingGroups[tabKey].title}}设置
        .body
          template(v-for="item in settingGroups[tabKey].items.filter((i)=>!i.hide)")
            .item(v-if="item.type==='switch'")
              .label {{item.label}}
                Warning(v-if="item.warning" :info="item.warning")
              Switch(v-model:active="item.value")
            .item(v-if="item.type==='input'")
              .label {{item.label}}
                Warning(v-if="item.warning" :info="item.warning")
              Input(v-model:value="item.value")
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import scanIcon from '@/assets/icon/scan.svg'
import listIcon from '@/assets/icon/list.svg'
import windowIcon from '@/assets/img/window.png'
import Switch from '@/components/components/switch.vue'
import Warning from '@/components/components/warning.vue'
import Input from '@/components/components/input.vue'
import { settingStore } from '@/store'

const tabKey = ref('window')
const getSettingStore = settingStore()
const settingGroups = reactive({
  window: {
    title: '窗口',
    icon: windowIcon,
    items: [
      {
        label: '点击关闭后最小化到托盘',
        value: computed({
          get: () => getSettingStore.toTrayWhenClickClose,
          set: (v) => (getSettingStore.toTrayWhenClickClose = v)
        }),
        type: 'switch',
        warning: '托盘支持后台播放'
      }
    ]
  },
  play: {
    title: '播放',
    icon: listIcon,
    items: [
      {
        label: '打开app立即播放',
        value: computed({
          get: () => getSettingStore.playImmediate,
          set: (v) => (getSettingStore.playImmediate = v)
        }),
        type: 'switch'
      }
    ]
  },
  scan: {
    title: '扫描',
    icon: scanIcon,
    items: [
      {
        label: '深度检索',
        value: computed({
          get: () => getSettingStore.deepScan,
          set: (v) => (getSettingStore.deepScan = v)
        }),
        type: 'switch',
        warning: '深度检索可能会增加检索时间'
      }
    ]
  },
  webServe: {
    title: '网络',
    icon: scanIcon,
    items: [
      {
        label: '开启网络服务',
        value: computed({
          get: () => getSettingStore.webServeEnable,
          set: (v) => (getSettingStore.webServeEnable = v)
        }),
        type: 'switch',
        warning: '修改将立即生效'
      },
      {
        label: '网络服务端口',
        value: computed({
          get: () => getSettingStore.webServePort,
          set: (v) => (getSettingStore.webServePort = isNaN(+v) ? 4000 : +v)
        }),
        type: 'input',
        warning: '修改将立即生效'
      }
    ]
  }
})
watch(getSettingStore, () => {
  getSettingStore.storageSetting()
})
</script>

<style scoped lang="stylus">
#setting
  flex 1 0 0
  overflow hidden
  flex-direction column
  #settingHeader
    height 60px
    display flex
    #settingTabs
      display flex
      align-items flex-end
      padding 0 30px
      .tab
        height 40px
        border-radius 14px 14px 0 0
        background-color rgba(120,194,196,.1)
        display flex
        align-items center
        padding 0 8px
        margin-right 4px
        transition all 0.5s
        .icon
          width 18px
          height 18px
        .label
          font-size 13px
          padding 0 6px
          font-weight bolder
      .tab.active
        padding 0 30px
        background-color rgba(225,107,140,.08)
        box-shadow 0 0 10px 5px rgba(225,107,140,.05)
  #settingBody
    flex 1 0 0
    overflow auto
    background-color #fdf7f9
    margin 0 10px
    box-shadow 0 3px 3px 3px #fdf7f9
    border-radius 10px
    position relative
    #settingContainer
      position absolute
      width 100%
      height 100%
      overflow auto
      display flex
      flex-direction column
      top 0
      bottom 0
      padding 10px 20px
      box-sizing border-box
      .title
        padding 15px
        font-size 22px
        font-weight bolder
      .body
        flex 1 0 0
        display flex
        flex-direction column
        .item
          display flex
          justify-content space-between
          padding 0 20px
          align-items center
          height 55px
          border-radius 5px
          transition all 0.3s
          &:hover
            background-color rgba(225,107,140,.05)
          .label
            font-size 13px
            font-weight bolder
            height 25px
            display flex
            align-items center
            .warning
              margin 0 15px
</style>
