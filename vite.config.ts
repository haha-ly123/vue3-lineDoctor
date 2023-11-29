import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "unplugin-vue-components/resolvers";
// 打包精灵图
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    proxy: {
      "/api": {
        target: "https://consult-api.itheima.net",
        changeOrigin: true,
        rewrite:(path)=>path.replace(/\/api/,"")
      },
    },
  },
  plugins: [
    vue({
      // 开启响应式语法糖
      reactivityTransform: true,
    }),
    Components({
      dts: false, //关闭自动生成类型文件
      resolvers: [VantResolver()],
    }),
    // 打包精灵图配置
    createSvgIconsPlugin({
      // 指定图标文件夹，绝对路径（NODE代码）
      iconDirs: [path.resolve(process.cwd(), "src/icons")],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
 
});
