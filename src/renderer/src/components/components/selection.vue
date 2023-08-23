<template lang="pug">
.selection(tabindex="1" ref="optionIns")
  .label {{getSelectedValue}}
  .options
    .option(
      v-for="(option,index) in options.filter(({value:v})=>v!==value)"
      :key="index"
      @click="()=>clickOption(option)"
      ) {{option.label}}
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
    .options
      opacity 1
      pointer-events all
  .options
    position absolute
    z-index 100
    opacity 0
    display flex
    flex-direction column
    left 50%
    top 100%
    margin-top 10px
    //padding 3px
    //padding 5px 10px
    transform translateX(-50%)
    background-color #b6e8d6
    min-width 40px
    border-radius 6px
    transition all 0.3s
    pointer-events none
    overflow hidden
    .option
      height 20px
      min-width 40px
      padding 5px 10px
      justify-content center
      white-space nowrap
      &:hover
        background-color #b4dace
</style>
