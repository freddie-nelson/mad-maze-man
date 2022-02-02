<template>
  <div>
    <label
      v-if="label"
      class="block text-sm text-t-sub font-medium mb-1"
      :for="name"
      >{{ label }}</label
    >

    <div v-bind="$attrs">
      <input
        class="
          w-full
          block
          p-3
          border-solid border-2 border-t-sub
          focus:border-s-cyan
          outline-none
          rounded-lg
          transition-colors
          ease-in-out
          duration-300
        "
        :type="censor ? 'password' : 'text'"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="!dark ? 'bg-bg' : 'bg-bg-light '"
      />

      <div
        v-if="error"
        class="
          p-3
          rounded-lg
          w-full
          block
          border-solid border-2 border-danger-500
          bg-danger-500 bg-opacity-30
          text-danger-500
          font-medium
          mt-3
        "
      >
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SInputText",
  inheritAttrs: false,
  components: {},
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    censor: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: "",
    },
  },
});
</script>

<style lang="scss" scoped>
</style>