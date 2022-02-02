<template>
  <canvas class="gameCanvas"></canvas>

  <router-view class="bg-bg font-main" />
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import Game from "./game/game";

export default defineComponent({
  name: "App",
  components: {},
  setup() {
    onMounted(() => {
      Game.init();
    });
  },
});
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  image-rendering: pixelated;
}

:root {
  --img-scale: 3.2;
}

body,
#app,
main {
  width: 100vw;
  min-height: 100vh;
}

img {
  z-index: 1;
  user-select: none;
}

.pixel-border {
  --color-outer: var(--color);

  background: var(--color);
  box-shadow:
		
	/* Inner Background Color */ 0 calc(var(--size) * -3) 0
      calc(var(--size) * -1) var(--color),
    0 calc(var(--size) * 3) 0 calc(var(--size) * -1) var(--color),
    0 calc(var(--size) * -6) 0 calc(var(--size) * -2) var(--color),
    0 calc(var(--size) * 6) 0 calc(var(--size) * -2) var(--color),
    0 calc(var(--size) * -9) 0 calc(var(--size) * -4) var(--color),
    0 calc(var(--size) * 9) 0 calc(var(--size) * -4) var(--color),
    0 calc(var(--size) * -12) 0 calc(var(--size) * -6) var(--color),
    0 calc(var(--size) * 12) 0 calc(var(--size) * -6) var(--color),
    /* Pixel Border Layer 1 */ calc(var(--size) * -1) 0 0 0 var(--color),
    var(--size) 0 0 0 var(--color), 0 calc(var(--size) * -2) 0 0 var(--color),
    0 calc(var(--size) * 2) 0 0 var(--color),
    0 calc(var(--size) * -5) 0 calc(var(--size) * -1) var(--color),
    0 calc(var(--size) * 5) 0 calc(var(--size) * -1) var(--color),
    0 calc(var(--size) * -7) 0 calc(var(--size) * -2) var(--color),
    0 calc(var(--size) * 7) 0 calc(var(--size) * -2) var(--color),
    0 calc(var(--size) * -10) 0 calc(var(--size) * -4) var(--color),
    0 calc(var(--size) * 10) 0 calc(var(--size) * -4) var(--color),
    0 calc(var(--size) * -13) 0 calc(var(--size) * -6) var(--color),
    0 calc(var(--size) * 13) 0 calc(var(--size) * -6) var(--color),
    /* Pixel Border Layer 2 */ calc(var(--size) * -2) 0 0 0 var(--color),
    calc(var(--size) * 2) 0 0 0 var(--color),
    0 calc(var(--size) * -1) 0 var(--size) var(--color),
    0 var(--size) 0 var(--size) var(--color),
    0 calc(var(--size) * -4) 0 0 var(--color),
    0 calc(var(--size) * 4) 0 0 var(--color),
    0 calc(var(--size) * -6) 0 calc(var(--size) * -1) var(--color),
    0 calc(var(--size) * 6) 0 calc(var(--size) * -1) var(--color),
    0 calc(var(--size) * -8) 0 calc(var(--size) * -2) var(--color),
    0 calc(var(--size) * 8) 0 calc(var(--size) * -2) var(--color),
    0 calc(var(--size) * -11) 0 calc(var(--size) * -4) var(--color),
    0 calc(var(--size) * 11) 0 calc(var(--size) * -4) var(--color),
    0 calc(var(--size) * -14) 0 calc(var(--size) * -6) var(--color),
    0 calc(var(--size) * 14) 0 calc(var(--size) * -6) var(--color),
    /* Border Layer 3: --pixel-border-3 */ calc(var(--size) * -3) 0 0 0
      var(--color-outer),
    calc(var(--size) * 3) 0 0 0 var(--color-outer),
    0 0 0 calc(var(--size) * 2) var(--color-outer),
    0 calc(var(--size) * -3) 0 var(--size) var(--color-outer),
    0 calc(var(--size) * 3) 0 var(--size) var(--color-outer),
    0 calc(var(--size) * -5) 0 0 var(--color-outer),
    0 calc(var(--size) * 5) 0 0 var(--color-outer),
    0 calc(var(--size) * -7) 0 calc(var(--size) * -1) var(--color-outer),
    0 calc(var(--size) * 7) 0 calc(var(--size) * -1) var(--color-outer),
    0 calc(var(--size) * -9) 0 calc(var(--size) * -2) var(--color-outer),
    0 calc(var(--size) * 9) 0 calc(var(--size) * -2) var(--color-outer),
    0 calc(var(--size) * -12) 0 calc(var(--size) * -4) var(--color-outer),
    0 calc(var(--size) * 12) 0 calc(var(--size) * -4) var(--color-outer),
    0 calc(var(--size) * -15) 0 calc(var(--size) * -6) var(--color-outer),
    0 calc(var(--size) * 15) 0 calc(var(--size) * -6) var(--color-outer);
}
</style>
