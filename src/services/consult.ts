import type {
  DoctorPage,
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  FollowType,
  TopDep,
  Image,
  ConsultOrderPreParams,
  ConsultOrderPreData,
  PartialConsult,
  ConsultOrderItem,
  ConsultOrderListParams,
  ConsultOrderPage,
} from "@/types/consult";

import { request } from "@/utils/request";

export const getKnowledgePage = (params: KnowledgeParams) => {
  return request<KnowledgePage>("/api/patient/home/knowledge", "GET", params);
};

export const getDoctorPage = (params: PageParams) =>
  request<DoctorPage>("/api/home/page/doc", "GET", params);

export const followOrUnfollow = (id: string, type: FollowType = "doc") =>
  request("/api/like", "POST", { id, type });
export const getAllDep = () => request<TopDep[]>("/api/dep/all");

export const uploadImage = (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return request<Image>("/api/upload", "POST", fd);
};

// 拉取预支付订单信息
export const getConsultOrderPre = (params: ConsultOrderPreParams) =>
  request<ConsultOrderPreData>("/api/patient/consult/order/pre", "GET", params);
// 生成订单
export const createConsultOrder = (data: PartialConsult) =>
  request<{ id: string }>("/api/patient/consult/order", "POST", data);

// 获取支付地址  0 是微信  1 支付宝
export const getConsultOrderPayUrl = (params: {
  paymentMethod: 0 | 1;
  orderId: string;
  payCallback: string;
}) => request<{ payUrl: string }>("/api/patient/consult/pay", "POST", params);
// 获取接收订单医生信息
export const getConsultOrderDetail = (orderId: string) =>
  request<ConsultOrderItem>("/api/patient/consult/order/detail", "GET", {
    orderId,
  });

// 查看处方
export const getPrescriptionPic = (id: string) =>
  request<{ url: string }>(`/api/patient/consult/prescription/${id}`);
// 评价问诊
export const evaluateConsultOrder = (data: {
  docId: string;
  orderId: string;
  score: number;
  content: string;
  anonymousFlag: 0 | 1;
}) => request<{ id: string }>("/api/patient/order/evaluate", "POST", data);

// 获取订单列表
export const getConsultOrderList = (params: ConsultOrderListParams) =>
  request<ConsultOrderPage>("/api/patient/consult/order/list", "GET", params);
// 取消订单
export const cancelOrder = (id: string) => request(`/api/patient/order/cancel/${id}`, 'PUT')
// 删除订单
export const deleteOrder = (id: string) => request(`/api/patient/order/${id}`, 'DELETE')
