import { useUserStore } from "@/stores";
import axios, { AxiosError, type Method } from "axios";
import { Toast, showToast } from "vant";
import router from "@/router";
// export const baseURL = "https://consult-api.itheima.net/";
export const baseURL = "";
// export const baseURL = import.meta.env.VITE_APP_BASEURL;
console.log('读取环境变量',import.meta.env);

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 10000,
  headers: { "X-Custom-Header": "foobar" },
});
// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    const store = useUserStore();
    if (store.user?.token && config.headers) {
      config.headers["Authorization"] = `Bearer ${store.user?.token}`;
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (res) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    // 后台约定，响应成功，但是code不是10000，是业务逻辑失败
    if (res.data?.code !== 10000) {
      showToast(res.data?.message || "业务失败");
      return Promise.reject(res.data);
    }
    return res.data;
  },
  function (err) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    if (err.response.status === 401) {
      // 删除用户信息
      const store = useUserStore();
      store.delUser();
      showToast("登录信息失效，请重新登录");
      // 跳转登录，带上接口失效所在页面的地址，登录完成后回跳使用
      router.push({
        path: "/login",
        query: { returnUrl: router.currentRoute.value.fullPath },
      });
    }
    return Promise.reject(err);
  }
);
export default instance;
type Data<T> = {
  code: number;
  message: string;
  data: T;
};
export const request = <T>(
  url: string,
  method: Method = "GET",
  submitData?: object
) => {
  return instance.request<T, Data<T>>({
    url,
    method,
    [method.toUpperCase() === "GET" ? "params" : "data"]: submitData,
  });
};
