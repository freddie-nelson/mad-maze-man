<template>
  <main class="flex flex-col justify-center items-center p-12">
    <img
      src="/assets/misc/logo.png"
      alt="Swing Race Logo"
      class="
        logo
        w-256px
        -mt-[calc(24px*var(--img-scale))]
        mb-16
        select-none
        pointer-events-none
      "
    />

    <div class="flex mb-10">
      <s-image-button
        image="/assets/buttons/singleplayer-btn.png"
        hoverImage="/assets/buttons/singleplayer-btn-hover.png"
        class="w-128px h-32px transform hover:scale-110"
        @click="$router.push({ name: 'Singleplayer' })"
      />
    </div>

    <div class="flex mb-10">
      <s-image-button
        image="/assets/buttons/leaderboard-btn.png"
        hoverImage="/assets/buttons/leaderboard-btn-hover.png"
        class="w-128px h-32px transform hover:scale-110"
        @click="$router.push({ name: 'Leaderboard' })"
      />
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import Game from "@/game/game";

import SImageButton from "@/components/button/SImageButton.vue";

export default defineComponent({
  name: "Home",
  components: {
    SImageButton,
  },
  setup() {
    onMounted(() => {
      Game.show();

      Game.canvas.element.style.position = "absolute";
    });

    onUnmounted(() => {
      Game.canvas.element.style.position = "";
    });
  },
});
</script>

<style scoped lang="scss">
.gameCanvas {
  position: absolute;
}

.logo {
  animation: logo-animation alternate infinite 1.3s ease-in-out;
}

@keyframes logo-animation {
  from {
    transform: scale(0.99);
  }

  to {
    transform: scale(1.02);
  }
}
</style>
