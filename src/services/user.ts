import { request } from "@/utils/request";
import type {
  CodeType,
  User,
  UserInfo,
  PatientList,
  Patient,
} from "@/types/user";
// 密码登录
export const loginByPassword = (mobile: string, password: string) => {
  return request<User>("/api/login/password", "post", { mobile, password });
};
// 发送验证码
export const sendMobileCode = (mobile: string, type: CodeType) => {
  return request<{ code: string }>("/api/code", "GET", { mobile, type });
};
// 短信登录
export const loginByMobile = (mobile: string, code: string) =>
  request<User>("/api/login", "POST", { mobile, code });

// 获取个人信息
export const getUserInfo = () =>
  request<UserInfo>("/api/patient/myUser", "GET", {});
// 患者列表信息
// export const getPatientList=()=>request<PatientList>('/api/patient/mylist','GET',{})
export const getPatientList = () => request<PatientList>("/api/patient/mylist");
// 添加患者信息
export const addPatient = (patient: Patient) =>
  request("/api/patient/add", "POST", patient);
// 编辑患者信息
export const editPatient = (patient: Patient) =>
  request("/api/patient/update", "PUT", patient);
// 删除患者信息
export const delPatient = (id: string) =>
  request(`/api/patient/del/${id}`, "DELETE");

  // 查询患者详情
export const getPatientDetail = (id: string) => request<Patient>(`/api/patient/info/${id}`)

