import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Singleplayer from "../views/Singleplayer.vue";

import Game from "@/game/game";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/singleplayer",
    name: "Singleplayer",
    component: Singleplayer,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(() => {
  Game.hide();
});

export default router;
