<template>
  <div class="absolute top-3 left-3 flex flex-col w-full max-w-sm">
    <div class="w-full h-16 border-8 border-gray-900 bg-gray-700">
      <div id="healthBar" class="h-full w-full bg-red-700"></div>
    </div>

    <div class="w-2/3 h-10 border-8 border-gray-900 bg-gray-700 -mt-1 hidden">
      <div id="speedBar" class="h-full w-full bg-cyan-600"></div>
    </div>
  </div>

  <p
    class="absolute top-8 right-3 font-bold text-2xl text-white font-main z-20"
  >
    Score: <span id="score">0</span>
  </p>

  <div
    id="gameOver"
    class="
      absolute
      top-0
      left-0
      z-10
      w-full
      h-full
      bg-red-700
      flex flex-col
      justify-center
      items-center
      text-white
      font-main
      hidden
    "
  >
    <h1 class="text-5xl font-bold">Game Over</h1>

    <router-link
      class="
        px-28
        py-4
        mt-4
        text-2xl
        font-bold
        pointer
        text-white
        rounded-xl
        bg-red-500
      "
      to="/"
    >
      Exit
    </router-link>
  </div>

  <div
    id="win"
    class="
      absolute
      top-0
      left-0
      z-10
      w-full
      h-full
      bg-lime-700
      flex flex-col
      justify-center
      items-center
      text-white
      font-main
      hidden
    "
  >
    <h1 class="text-5xl font-bold">You Won!</h1>

    <p class="text-5xl font-bold"></p>

    <router-link
      class="
        px-28
        py-4
        mt-4
        text-2xl
        font-bold
        pointer
        text-white
        rounded-xl
        bg-lime-500
      "
      to="/"
    >
      Exit
    </router-link>
  </div>
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