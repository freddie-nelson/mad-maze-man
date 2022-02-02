<template>
  <button
    class="
      pixel-border
      [--size:2px]
      [--color:theme(colors.s-blue)]
      hover:[--color:theme(colors.s-cyan)]
      [--color-outer:theme(colors.t-main)]
      inline-flex
      justify-center
      items-center
      py-2
      px-7
      font-bold
      text-xl text-t-main
      bg-s-blue
      hover:bg-s-cyan
      transition-all
      ease-in-out
      duration-300
      outline-none
    "
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SButton",
  components: {},
});
</script>

<style lang="scss" scoped>
</style>