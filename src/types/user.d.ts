/**
 * 用户相关ts类型
 */
export type User = {
  /** token令牌 */
  token: string;
  /** 用户ID */
  id: string;
  /** 用户名称 */
  account: string;
  /** 手机号 */
  mobile: string;
  /** 头像 */
  avatar: string;
};

// 短信验证码类型，登录|注册|修改手机号|忘记密码|绑定手机号
export type CodeType =
  | "login"
  | "register"
  | "changeMobile"
  | "forgetPassword"
  | "bindMobile";

// 个人信息
type OmitUser = Omit<User, "token">;
export type UserInfo = OmitUser & {
  /** 关注 */
  likeNumber: number;
  /** 收藏 */
  collectionNumber: number;
  /** 积分 */
  score: number;
  /** 优惠券 */
  couponNumber: number;
  orderInfo: {
    /** 待付款 */
    paidNumber: number;
    /** 待发货 */
    receivedNumber: number;
    /** 待收货 */
    shippedNumber: number;
    /** 已完成 */
    finishedNumber: number;
  };
};
// 患者信息

export type Patient = {
  /**
   * 年龄
   */
  age?: number;
  /**
   * 是否设置为默认患者 0不是默认 1是默认患者
   */
  defaultFlag: 0 | 1;
  /**
   * 性别 1男 0女
   */
  gender: number;
  /**
   * 性别值
   */
  genderValue?: "男" | "女";
  id?: string;
  /**
   * 患者身份证号
   */
  idCard: string;
  /**
   * 患者姓名
   */
  name: string;
};
// 患者列表信息
export type PatientList = Patient[];
