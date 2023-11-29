const express = require("express");
const app = express();
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
var history = require('connect-history-api-fallback');
// 处理history模式路由
app.use(history());
// 托管了 dist 目录，当访问 / 的时候，默认会返回托管目录中的 index.html 文件
app.use(express.static(path.join(__dirname, "../dist")));
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://consult-api.itheima.net",
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/\/api/, ""),
  })
);
app.listen(3000, () => {
  console.log("running...");
});
