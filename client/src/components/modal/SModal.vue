<template>
  <teleport to="body">
    <div
      class="
        fixed
        top-0
        left-0
        w-screen
        h-screen
        bg-black bg-opacity-40
        flex
        justify-center
        items-center
        z-30
        font-main
      "
    >
      <div
        class="
          pixel-border
          px-16
          py-12
          bg-bg-light
          text-bg-light
          [--size:2px]
          [--color:currentColor]
          relative
        "
        v-bind="$attrs"
      >
        <s-image-button
          v-if="closeable"
          class="absolute right-4 top-1 outline-none w-8px h-8px"
          image="/assets/buttons/close-btn.png"
          hoverImage="/assets/buttons/close-btn-hover.png"
          @click="$emit('close')"
        />

        <div class="text-white w-full h-full">
          <slot></slot>
        </div>
      </div>

      <slot name="outside"></slot>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SImageButton from "@/components/button/SImageButton.vue";

export default defineComponent({
  name: "SModal",
  inheritAttrs: false,
  components: { SImageButton },
  props: {
    closeable: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<style lang="scss" scoped>
</style>