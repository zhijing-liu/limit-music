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
            .item(v-if="item.type==='switch'" :key="item.index")
              .label {{item.label}}
                Warning(v-if="item.warning" :info="item.warning")
              Switch(v-model:active="item.value")
            .item(v-if="item.type==='input'" :key="item.index")
              .label {{item.label}}{{item.min&&item.max?`     [ ${item.min} - ${item.max}${item.unit??''} ]`:''}}
                Warning(v-if="item.warning" :info="item.warning")
              .right
                Input(v-model:value="item.value" :mode="item.mode" :min="item.min" :max="item.max")
                .unit(v-if="item.unit") {{item.unit}}
            .item(v-if="item.type==='selection'" :key="item.index")
              .label {{item.label}}
                Warning(v-if="item.warning" :info="item.warning")
              .right
                Selection(v-model:value="item.value" :options="item.options")
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import scanIcon from '@/assets/icon/scan.svg'
import listIcon from '@/assets/icon/list.svg'
import windowIcon from '@/assets/img/window.png'
import colorIcon from '@/assets/img/colorful.png'
import Switch from '@/components/components/switch.vue'
import Warning from '@/components/components/warning.vue'
import Input from '@/components/components/input.vue'
import Selection from '@/components/components/selection.vue'
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
        index: 'window-1',
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
        index: 'play-1',
        value: computed({
          get: () => getSettingStore.playImmediate,
          set: (v) => (getSettingStore.playImmediate = v)
        }),
        type: 'switch'
      },
      {
        label: '进度条可滑动调节',
        index: 'play-2',
        value: computed({
          get: () => getSettingStore.progressBarAllowSlide,
          set: (v) => (getSettingStore.progressBarAllowSlide = v)
        }),
        warning: '滑动调节会变相打断播放进度,可能破坏播放体验',
        type: 'switch'
      },
      {
        label: '播放帧刷新间隔',
        index: 'play-3',
        value: computed({
          get: () => getSettingStore.currentRefreshInterval,
          set: (v) => (getSettingStore.currentRefreshInterval = isNaN(+v) ? 80 : +v)
        }),
        warning: '更新速度过快会占用更多cpu资源并消耗较多的电量',
        type: 'input',
        mode: 'number',
        unit: 'ms',
        min: 20,
        max: 300
      },
      {
        label: '播放速度',
        index: 'play-4',
        value: computed({
          get: () => getSettingStore.playSpeed,
          set: (v) => (getSettingStore.playSpeed = v)
        }),
        type: 'input',
        mode: 'number',
        min: 0.5,
        max: 2
      }
    ]
  },
  scan: {
    title: '扫描',
    icon: scanIcon,
    items: [
      {
        label: '深度检索',
        index: 'scan-1',
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
        index: 'webServe-1',
        value: computed({
          get: () => getSettingStore.webServeEnable,
          set: (v) => (getSettingStore.webServeEnable = v)
        }),
        type: 'switch'
      },
      {
        label: '网络服务端口',
        index: 'webServe-2',
        value: computed({
          get: () => getSettingStore.webServePort,
          set: (v) => (getSettingStore.webServePort = isNaN(+v) ? 4000 : +v)
        }),
        type: 'input',
        mode: 'number',
        min: 1,
        max: 65534
      },
      {
        label: '开启网络控制服务',
        index: 'webServe-3',
        value: computed({
          get: () => getSettingStore.webControllerEnable,
          set: (v) => (getSettingStore.webControllerEnable = v)
        }),
        type: 'switch',
        warning: '开启后点击左上角logo即可扫码控制'
      },
      {
        label: '网络控制服务端口',
        index: 'webServe-4',
        value: computed({
          get: () => getSettingStore.webControllerPort,
          set: (v) => (getSettingStore.webControllerPort = isNaN(+v) ? 10000 : +v)
        }),
        type: 'input',
        mode: 'number',
        min: 1,
        max: 65534
      },
      {
        label: '网络控制socket服务端口',
        index: 'webServe-5',
        value: computed({
          get: () => getSettingStore.webControllerSocketPort,
          set: (v) => (getSettingStore.webControllerSocketPort = isNaN(+v) ? 20000 : +v)
        }),
        type: 'input',
        mode: 'number',
        min: 1,
        max: 65534
      },
      {
        label: '使用公网ipv6进行配置',
        index: 'webServe-6',
        value: computed({
          get: () => getSettingStore.webControllerUsePublicIPv6,
          set: (v) => (getSettingStore.webControllerUsePublicIPv6 = v)
        }),
        type: 'switch'
      }
    ]
  },
  colorful: {
    title: '样式',
    icon: colorIcon,
    items: [
      {
        label: '流光',
        index: 'colorful-1',
        value: computed({
          get: () => getSettingStore.streamerType,
          set: (v) => (getSettingStore.streamerType = v)
        }),
        options: [
          {
            label: '关闭',
            value: 'none'
          },
          {
            label: '雨润',
            value: 'rain'
          },
          {
            label: '飞星',
            value: 'star'
          },
          {
            label: '雪花',
            value: 'snow'
          }
        ],
        type: 'selection'
      },
      {
        label: '流光数量',
        index: 'colorful-2',
        value: computed({
          get: () => {
            return getSettingStore.streamerCount
          },
          set: (v) => (getSettingStore.streamerCount = v)
        }),
        type: 'input',
        mode: 'number',
        min: 1,
        max: 100
      },
      {
        label: '流光动态模糊',
        index: 'colorful-3',
        value: computed({
          get: () => {
            return getSettingStore.streamerBlur
          },
          set: (v) => (getSettingStore.streamerBlur = v)
        }),
        type: 'switch',
        warning: '对性能可能会造成影响'
      },
      {
        label: '流光速度',
        index: 'colorful-4',
        value: computed({
          get: () => {
            return getSettingStore.streamerSpeed
          },
          set: (v) => (getSettingStore.streamerSpeed = v)
        }),
        type: 'input',
        mode: 'number',
        min: 0.5,
        max: 2
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
      .tab:hover,
      .tab.active
        padding 0 30px
        height 45px
        background-color rgba(225,107,140,.2)
        //box-shadow 0 0 10px 5px rgba(225,107,140,.05)
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
          .right
            display flex
            align-items center
            .unit
              font-size 12px
              padding-left 5px
              font-weight bolder
</style>
