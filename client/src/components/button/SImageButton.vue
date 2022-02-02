<template>
  <button
    :style="{
      '--image': `url('${image}')`,
      '--hover-image': `url('${hoverImage}')`,
    }"
    class="
      transition-all
      duration-300
      ease-in-out
      bg-[url:var(--image)]
      hover:bg-[url:var(--hover-image)]
      bg-no-repeat bg-cover
    "
  ></button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SImageButton",
  components: {},
  props: {
    image: {
      type: String,
      default: "",
    },
    hoverImage: {
      type: String,
      default: "",
    },
  },
});
</script>

<style lang="scss" scoped></style>
