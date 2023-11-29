import { createApp } from "vue";
import pinia from "@/stores";
import App from "./App.vue";
import router from "./router";
// 引入全局样式
import '@/styles/index.ts'
import 'virtual:svg-icons-register'
// 单独引入toast样式
import "vant/es/toast/style"
import "vant/es/dialog/style"




const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount("#app");
