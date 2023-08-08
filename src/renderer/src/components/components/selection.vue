<template lang="pug">
.selection(tabindex="1" ref="optionIns")
  .label {{getSelectedValue}}
  .option(v-for="(option,index) of options.filter(({value:v})=>v!==value)" :style="`top:${(index+1)*110}%`" @click="()=>clickOption(option)") {{option.label}}
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps(['value', 'options'])
const emits = defineEmits(['update:value'])
const getSelectedValue = computed(
  () => props.options.find(({ value }) => value === props.value)?.label
)
const optionIns = ref()
const clickOption = (option) => {
  emits('update:value', option.value)
  optionIns.value.blur()
}
</script>

<style scoped lang="stylus">
.selection
  position relative
  height 20px
  padding 5px 10px
  font-size 14px
  font-weight bold
  min-width 40px
  max-width 20vw
  background-color #d3e9e2
  text-align center
  color #444444
  border-radius 6px
  white-space nowrap
  &:focus
    .option
      display flex
      opacity 1
      pointer-events all
  .option
    position absolute
    display flex
    opacity 0
    pointer-events none
    min-width 40px
    transition all 0.3s
    //max-width inherit
    padding 5px 10px
    height 20px
    left 50%
    top 100%
    transform translateX(-50%)
    justify-content center
    white-space nowrap
    border-radius 6px
    background-color #d3e9e2
    &:hover
      background-color #b9dad0
</style>
