<template lang="pug">
#controller
  .title {{musicData?.musicInfo?.title}}
  img.album(:src="musicData?.musicInfo?.albumPic??musicImage")
  .buttons
    img.button(:src="lastImage" @click="last")
    img.button(v-if="musicData?.isPlaying" :src="pauseImage" @click="pause")
    img.button(:src="playImage" @click="play" v-else)
    img.button(:src="nextImage" @click="next")
    img.button(:src="playModeMap[musicData?.playMode??'default']" @click="setPlayMode")
Transition(name="fullDown-quick")
  #curtain(v-if="!connecting")
    img.icon(:src="iconImage")
    .title {{connectError?'连接错误，试着重新连接吧':'在连了，等一下嘛...'}}
    .button(v-if="connectError" @click="connect") 重新连接
</template>
<script setup>
import axios from 'axios'
import { Manager } from 'socket.io-client'
import { reactive, ref, watch } from 'vue'
import playImage from '@/assets/img/play.png'
import pauseImage from '@/assets/img/pause.png'
import lastImage from '@/assets/img/last.png'
import nextImage from '@/assets/img/next.png'
import musicImage from '@/assets/img/music.png'
import defaultImage from '@/assets/img/default.png'
import randomImage from '@/assets/img/random.png'
import iconImage from '@/assets/img/icon.png'

const playModeMap = reactive({
  default: defaultImage,
  random: randomImage
})
const musicData = ref({})
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
  console.log(result)
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
    // .on('connect_error', () => {
    //   console.log(456456456456)
    // })
    .on('musicInfo', (data) => {
      musicData.value.musicInfo = data
    })
    .on('isPlaying', (data) => {
      musicData.value.isPlaying = data
    })
    .on('playMode', (data) => {
      musicData.value.playMode = data
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
    console.log('connect')
    getAllData()
  } else {
    console.log('disconnect')
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
  .title
    font-size 3.2vh
    margin-bottom 5vh
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
    background-color rgba(255,104,140,.2)
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
