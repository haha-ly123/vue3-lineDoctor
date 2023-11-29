import { useUserStore } from "@/stores";
import { createRouter, createWebHistory } from "vue-router";
import routes from './routes';
// 加载进度
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});
router.beforeEach((to) => {
  NProgress.start()
  document.title = `优医问诊-${to.meta.title ||'优医问诊'}`;
  const store = useUserStore();
  // 白名单
  const wihteList = ["/login"];
  if (!store.user?.token && !wihteList.includes(to.path)) return "/login";
});
router.afterEach((to) => {
  // 修改标题
  NProgress.done()
})

export default router;
