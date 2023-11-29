import type { User } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore(
  "cp-user",
  () => {
    // 用户信息
    const user = ref<User>({} as User);
    // 设置用户，登录后使用
    const setUser = (u: User) => {
      user.value = u;
    };
    // 清空用户，退出后使用
    const delUser = () => {
      user.value = {} as User;
    };
    const count = ref(1)
    return { user, setUser, delUser };
  },
  {
    // 开启数据持久化--全部存储
    // persist: true,
    persist:{
      key:'key-name',
      paths:['user']
    }
  }
);
