<template lang="pug">
#controller
  .title {{musicData?.musicInfo?.title}}
  img.album(:src="musicData?.musicInfo?.albumPic??musicImage")
  .buttons
    img.button(:src="lastImage" @click="last")
    img.button(v-if="musicData?.isPlaying" :src="pauseImage" @click="pause")
    img.button(:src="playImage" @click="play" v-else)
    img.button(:src="nextImage" @click="next")
</template>
<script setup>
import axios from 'axios'
import { io } from 'socket.io-client'
import { ref, watch } from 'vue'
import playImage from '@/assets/img/play.png'
import pauseImage from '@/assets/img/pause.png'
import lastImage from '@/assets/img/last.png'
import nextImage from '@/assets/img/next.png'
import musicImage from '@/assets/img/music.png'

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
const getAllData = async () => {
  const {
    data: { result }
  } = await axios.post('/action', {
    action: 'getMusicData'
  })
  musicData.value = result
}
const playSocketIns = ref()
const createSocket = () => {
  const playIns = io('/socket-player', {
    autoConnect: false
  })
    .on('connect', () => {
      playSocketIns.value = playIns
    })
    .on('disconnect', () => {
      playSocketIns.value = undefined
    })
    .on('musicInfo', (data) => {
      musicData.value.musicInfo = data
    })
    .on('isPlaying', (data) => {
      musicData.value.isPlaying = data
    })
    .connect()
}
createSocket()
watch(playSocketIns, () => {
  if (playSocketIns.value) {
    console.log('connect')
  } else {
    console.log('disconnect')
  }
})
getAllData()
</script>
<style lang="stylus">
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
</style>
