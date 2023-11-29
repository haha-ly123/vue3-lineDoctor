import { createPinia } from "pinia";
//状态持久化
import persist from 'pinia-plugin-persistedstate'
const pinia = createPinia();
pinia.use(persist)
export default pinia;
export * from './modules/user'
export * from './modules/consult'
