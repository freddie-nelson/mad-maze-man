import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "./tailwind.css";
import "@fontsource/press-start-2p";

createApp(App).use(store).use(router).mount("#app");
