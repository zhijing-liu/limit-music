<template lang="pug">
#Main
  LeftBar
  RouterView.body(v-slot="{Component}")
    Transition(name="fade" mode="out-in" :duration="{ enter: 500, leave: 250 }")
      KeepAlive
        component(:is="Component")
</template>

<script setup>
import LeftBar from './leftBar/index.vue'
</script>

<style scoped lang="stylus">
#Main
  flex 1 0 0
  overflow hidden
  display flex
  border-radius 20px 20px 0 0
  background-color: #fff
  .body
    flex 1 0 0
    overflow hidden
    display flex
    flex-direction column
    margin 10px 0
</style>
