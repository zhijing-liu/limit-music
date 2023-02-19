<template lang="pug">
#controller(
  @touchstart.prevent="touchstart"
  @touchmove.prevent="touchmove"
  @touchend.prevent="touchend"
  :style="`background:linear-gradient(to top ,#b8d8ed 0,#b8d8ed ${musicData?.volume??50}%,#FFFFFF ${musicData?.volume??50}%,#FFFFFF 100%);`"
  )
  .title {{musicData?.musicInfo?.title}}
  .subTitle {{musicData?.musicInfo?.artists?.join(' ')}}
  img.album(:src="musicData?.musicInfo?.albumPic??musicImage")
  .buttons(@touchstart.stop @touchmove.stop @touchend.stop)
    img.button(:src="listImage" @click="musicListIns.setVisible")
    img.button(:src="lastImage" @click="last")
    img.button(v-if="musicData?.isPlaying" :src="pauseImage" @click="pause")
    img.button(:src="playImage" @click="play" v-else)
    img.button(:src="nextImage" @click="next")
    img.button(:src="playModeMap[musicData?.playMode??'default']" @click="setPlayMode")
Transition(name="fullDown-quick")
  #curtain(v-show="!connecting")
    img.icon(:src="iconImage")
    .title {{connectError?'连接错误，试着重新连接吧':'在连了，等一下嘛...'}}
    .button(v-if="connectError" @click="connect") 重新连接
MusicList(:connecting="connecting" :playingUrl="musicData?.musicInfo?.path" ref="musicListIns")
</template>
<script setup>
import axios from 'axios'
import { Manager } from 'socket.io-client'
import { reactive, ref, watch } from 'vue'
import playImage from '@/assets/img/play.png'
import listImage from '@/assets/img/list.png'
import pauseImage from '@/assets/img/pause.png'
import lastImage from '@/assets/img/last.png'
import nextImage from '@/assets/img/next.png'
import musicImage from '@/assets/img/music.png'
import defaultImage from '@/assets/img/default.png'
import randomImage from '@/assets/img/random.png'
import iconImage from '@/assets/img/icon.png'
import MusicList from '@/component/musicList.vue'

const playModeMap = reactive({
  default: defaultImage,
  random: randomImage
})
const musicData = ref({})
const musicListIns = ref({})
const touchstartData = {}
const touchstart = (e) => {
  touchstartData.y = e.targetTouches[0].pageY
  touchstartData.volume = musicData.value.volume
  touchstartData.height = document.body.getBoundingClientRect().height
}
const touchmove = (e) => {
  const v = ((e.targetTouches[0].pageY - touchstartData.y) / touchstartData.height) * 250
  musicData.value.volume = Math.min(Math.max(0, touchstartData.volume - v), 100)
}
const touchend = () => {
  musicData.value.volume = Math.round(musicData.value.volume)
  axios.post('/action', {
    action: 'setVolume',
    args: [musicData.value.volume]
  })
}
const play = () => {
  axios.post('/action', {
    action: 'play'
  })
}
const next = () => {
  axios.post('/action', {
    action: 'next'
  })
}
const last = () => {
  axios.post('/action', {
    action: 'last'
  })
}
const pause = () => {
  axios.post('/action', {
    action: 'pause'
  })
}
const setPlayMode = () => {
  axios.post('/action', {
    action: 'setPlayMode'
  })
}
const getAllData = async () => {
  const {
    data: { result }
  } = await axios.post('/action', {
    action: 'getMusicData'
  })
  musicData.value = result
}
const playSocketIns = ref()
const connectError = ref(false)
const createSocket = () => {
  playSocketIns.value = new Manager({
    timeout: 2500,
    reconnectionAttempts: 5
  })
    .on('reconnect_failed', () => {
      connectError.value = true
    })
    .socket('/socket-player')
    .timeout(2000)
    .on('connect', () => {
      connecting.value = true
    })
    .on('disconnect', () => {
      connecting.value = false
    })
    .on('musicInfo', (data) => {
      musicData.value.musicInfo = data
    })
    .on('isPlaying', (data) => {
      musicData.value.isPlaying = data
    })
    .on('playMode', (data) => {
      musicData.value.playMode = data
    })
    .on('volume', (data) => {
      musicData.value.volume = data
    })
    .connect()
}
const connect = () => {
  playSocketIns.value.connect()
  connectError.value = false
}
const connecting = ref(false)
createSocket()
watch(connecting, () => {
  if (connecting.value) {
    getAllData()
  }
})
</script>
<style lang="stylus">
@-webkit-keyframes bounce{/*创建动画*/
  0%,100%,20%,50%,80%{
    -webkit-transform:translateY(0);
  }
  40%{
    -webkit-transform:translateY(-30px);
  }
  60%{
    -webkit-transform:translateY(-15px);
  }
}
#controller
  height 100vh
  width 100vw
  display flex
  justify-content center
  align-items center
  overflow hidden
  flex-direction column
  position relative
  .title
    font-size 3.2vh
    margin-bottom 5vh
    font-weight 1000
  .subTitle
    font-size 2vh
    font-weight 700
    margin-bottom 3vh
  .album
    width 40vw
    margin-bottom 20vh
    border-radius 10px
    box-shadow 0 0 10px 10px #AAAAAA
  .buttons
    display flex
    .button
      margin 0 3vw
      width 12vw
#curtain
  height 100vh
  width 100vw
  position fixed
  left 0
  top 0
  z-index 100
  background-color #d6eded
  display flex
  justify-content center
  align-items center
  color #222
  font-size 3vh
  font-weight bolder
  flex-direction column
  .icon
    width 30vw
    margin-bottom 30vh
    animation bounce 1.5s infinite
  .button
    margin-top 3vh
    padding 1.5vh 3vw
    background-color rgba(255,104,140,.4)
    font-size 2vh
    border-radius 2vh
.fullDown-quick-enter-active
  transition all 0.6s ease-in-out
.fullDown-quick-leave-active
  transition all 0.5s ease-in-out
.fullDown-quick-enter-from,
.fullDown-quick-leave-to
  transform translateY(-100%)
  opacity 0.8
.fullDown-quick-enter-to,
.fullDown-quick-leave-from
  transform translateY(0)
  opacity 1
</style>
