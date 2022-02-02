<template>
  <main class="bg-bg absolute top-0 left-0"></main>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import Game from "@/game/game";
import Maze from "@/game/maze";

export default defineComponent({
  name: "Singleplayer",
  components: {},
  setup() {
    onMounted(() => {
      document.getElementById("app")?.classList.add("singleplayer");

      const maze = new Maze();
      Game.loadMap(maze);

      Game.show();
    });

    onUnmounted(() => {
      document.getElementById("app")?.classList.remove("singleplayer");

      Game.unload();
    });
  },
});
</script>

<style lang="scss">
.singleplayer {
  .gameCanvas {
    width: 100vw !important;
    height: 100vh !important;
  }
}
</style>