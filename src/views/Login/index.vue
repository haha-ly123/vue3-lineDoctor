<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { mobileRules, passwordRules, codeRules } from "@/utils/rules";
import { showToast, showSuccessToast, showFailToast, type FormInstance } from 'vant';
import { loginByPassword, sendMobileCode, loginByMobile } from "@/services/user";
import { useUserStore } from '@/stores';
import { useRoute, useRouter } from 'vue-router';

const isShowPass = ref(false);
const password = ref('')
const mobile = ref('')
const agree = ref(false)
const store = useUserStore();
const router = useRouter();
const route = useRoute();
const isPass = ref(true)
const code = ref('')


const login = async () => {
    if (!agree.value) {
        return showToast('请勾选协议！')
    }
    try {
        const res = isPass.value
            ? await loginByPassword(mobile.value, password.value)
            : await loginByMobile(mobile.value, code.value)
        // const res = await loginByPassword(mobile.value, password.value);
        store.setUser(res.data);
        router.push((route.query.returnUrl as string) || '/')
        showSuccessToast('登录成功')
    } catch (error) {
    }

}
let timeId: number
const form = ref<FormInstance>()
const time = ref(0)
const send = async () => {
    // 已经倒计时time的值大于0，此时不能发送验证码
    if (time.value > 0) return
    // 验证不通过报错，阻止程序继续执行
    await form.value?.validate('mobile')
    let res = await sendMobileCode(mobile.value, 'login')
    showSuccessToast('发送成功')
    code.value = res.data.code
    // showToast('验证码为：' + res.data.code)
    time.value = 60
    console.log('time', time)
    clearInterval(timeId)
    timeId = setInterval(() => {
        time.value--
        if (time.value <= 0) window.clearInterval(timeId)
    }, 1000)
}
onUnmounted(() => {
    window.clearInterval(timeId)

})
</script>

<template>
    <div class="login-page">
        <!-- <cp-icon name="home-docs"/> -->
        <cp-nav-bar right-text="注册" @click-right="router.push('/register')"></cp-nav-bar>
        <!-- 头部 -->
        <div class="login-head">
            <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
            <a href="javascript:;" @click="isPass = !isPass">
                <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
                <van-icon name="arrow"></van-icon>
            </a>
        </div>
        <!-- 表单 -->
        <van-form autocomplete="off" @submit="login">
            <van-field v-model="mobile" name="mobile" :rules="mobileRules" placeholder="请输入手机号" type="tel"></van-field>
            <van-field v-model="password" v-if="isPass" :rules="passwordRules" placeholder="请输入密码"
                :type="isShowPass ? 'text' : 'password'">
                <template #button>
                    <cp-icon @click="isShowPass = !isShowPass" :name="`login-eye-${isShowPass ? 'on' : 'off'}`" />
                </template>
            </van-field>
            <van-field v-model="code" v-else placeholder="短信验证码" :rules="codeRules">
                <template #button>
                    <span class="btn-send" :class="{ active: time > 0 }" @click="send">
                        {{ time > 0 ? `${time}s后再次发送` : '发送验证码' }}
                    </span>
                </template>
            </van-field>

            <div class="cp-cell">
                <van-checkbox v-model="agree">
                    <span>我已同意</span>
                    <a href="javascript:;">用户协议</a>
                    <span>及</span>
                    <a href="javascript:;">隐私条款</a>
                </van-checkbox>
            </div>
            <div class="cp-cell">
                <van-button block round type="primary" native-type="submit">登 录</van-button>
            </div>
            <div class="cp-cell">
                <a href="javascript:;">忘记密码？</a>
            </div>
        </van-form>
        <!-- 底部 -->
        <div class="login-other">
            <van-divider>第三方登录</van-divider>
            <div class="icon">
                <img src="@/assets/qq.svg" alt="" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login {
    &-page {
        padding-top: 46px;
    }

    &-head {
        display: flex;
        padding: 30px 30px 50px;
        justify-content: space-between;
        align-items: flex-end;
        line-height: 1;

        h3 {
            font-weight: normal;
            font-size: 24px;
        }

        a {
            font-size: 15px;
        }
    }

    &-other {
        margin-top: 60px;
        padding: 0 30px;

        .icon {
            display: flex;
            justify-content: center;

            img {
                width: 36px;
                height: 36px;
                padding: 4px;
            }
        }
    }
}

.van-form {
    padding: 0 14px;

    .cp-cell {
        height: 52px;
        line-height: 24px;
        padding: 14px 16px;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        .van-checkbox {
            a {
                color: var(--cp-primary);
                padding: 0 5px;
            }
        }
    }

    .btn-send {
        color: var(--cp-primary);

        &.active {
            color: rgba(22, 194, 163, 0.5);
        }
    }
}
</style>
