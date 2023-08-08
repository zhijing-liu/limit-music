<template lang="pug">
.input(@click.stop="setFocus")
  input.inputArea(v-if="inputShow" ref="inputAreaIns" :value="value" @blur="blur")
  span(v-else) {{value}}
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'

const props = defineProps(['value', 'mode', 'min', 'max'])
const emits = defineEmits(['update:value'])
const inputAreaIns = ref()
const inputShow = ref(false)
const setFocus = () => {
  inputShow.value = true
  nextTick(() => {
    inputAreaIns.value.focus()
  })
}
const blur = (e) => {
  inputShow.value = false
  if (e.target.value !== props.value) {
    let v = e.target.value
    if (props.mode === 'number') {
      if (isNaN(+v)) {
        v = props.value
      } else {
        if (props.max !== undefined) {
          v = Math.min(props.max, +v)
        }
        if (props.min !== undefined) {
          v = Math.max(props.min, +v)
        }
      }
    }
    emits('update:value', v)
  }
}
</script>

<style scoped lang="stylus">
.input
  padding 5px 10px
  width 40px
  background-color #d3e9e2
  border-radius 6px
  height 20px
  font-size 14px
  text-align center
  line-height 20px
  .inputArea
    //display none
    width 40px
    padding 0
    border 0
    outline none
    background-color transparent
    user-select none
    text-align center
    font-size 14px
    font-family inherit
</style>
