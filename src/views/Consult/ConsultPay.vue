<script setup lang="ts">
import { getPatientDetail } from '@/services/user'
import type { ConsultOrderPreData } from '@/types/consult'
import type { Patient } from '@/types/user'
import { showConfirmDialog, showFailToast, showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useConsultStore } from '@/stores'
import router from '@/router'
import { createConsultOrder, getConsultOrderPre } from '@/services/consult'


const payInfo = ref<ConsultOrderPreData>()
// 刷新页面，数据丢失，关在后提示
const loadData = async () => {
    try {
        const res = await getConsultOrderPre({
            type: store.consult.type,
            illnessType: store.consult.illnessType
        })
        payInfo.value = res.data
        // 设置默认优惠券
        store.setCoupon(payInfo.value.couponId)
    } catch (error) {
        showFailToast('问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付！')
        router.push('/home')
    }
}
const store = useConsultStore()
const orderId = ref('')//订单编号

const patient = ref<Patient>()
const loadPatient = async () => {
    if (!store.consult.patientId) return
    const res = await getPatientDetail(store.consult.patientId)
    patient.value = res.data
}
onMounted(() => {
    loadData()
    loadPatient()
})
// 生成订单后不可关闭支付抽屉
const onClose = async () => {
    try {
        await showConfirmDialog({
            title: '关闭支付',
            message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
            cancelButtonText: '仍要关闭',
            confirmButtonText: '继续支付',
        })
        return false
    } catch (error) {
        // 清除订单编号
        orderId.value = ''
        router.push('/user/consult')
        return true
    }
}
// 生成订单后不可回退
onBeforeRouteLeave(() => {
    if (orderId.value) return false
})
// 打开的时候生成订单ID，成功后清空本地存储的问诊订单信息
const agree = ref(false)
const show = ref(false)
const loading = ref(false)
const showOpen = async () => {
    // 判断是否勾选协议
    if (!agree.value) return showToast('请勾选我已同意支付协议')
    show.value = true
    //获取订单编号
    loading.value = true
    const { data } = await createConsultOrder(store.consult)
    orderId.value = data.id
    loading.value = false
    // 清楚患者数据 
    store.clear()
}

</script>

<template>
    <div class="consult-pay-page" v-if="payInfo && patient">
        <cp-nav-bar title="支付" />
        <div class="pay-info">
            <p class="tit">图文问诊 {{ payInfo.payment }} 元</p>
            <img class="img" src="@/assets/avatar-doctor.svg" />
            <p class="desc">
                <span>极速问诊</span>
                <span>自动分配医生</span>
            </p>
        </div>
        <van-cell-group>
            <van-cell title="优惠券" :value="`-¥${payInfo.couponDeduction}`" />
            <van-cell title="积分抵扣" :value="`-¥${payInfo.pointDeduction}`" />
            <van-cell title="实付款" :value="`¥${payInfo.actualPayment}`" class="pay-price" />
        </van-cell-group>
        <div class="pay-space"></div>
        <van-cell-group>
            <van-cell title="患者信息" :value="`${patient.name} | ${patient.genderValue} | ${patient.age}岁`"></van-cell>
            <van-cell title="病情描述" :label="store.consult.illnessDesc"></van-cell>
        </van-cell-group>
        <div class="pay-schema">
            <van-checkbox v-model="agree">我已同意 <span class="text">支付协议</span></van-checkbox>
        </div>
        <van-submit-bar button-type="primary" :price="payInfo.actualPayment * 100" button-text="立即支付" text-align="left"
            @click="showOpen" :loading="loading" />
        <CpPaySheet v-model:show="show" :orderId="orderId" :call-back="onClose"
            :actualPayment="payInfo.actualPayment * 100 + ''"></CpPaySheet>

    </div>
    <!-- <van-action-sheet v-model:show="show" title="选择支付方式" :closeable="false" :before-close="onClose">
        <div class="pay-type">
            <p class="amount">￥20.00</p>
            <van-cell-group>
                <van-cell title="微信支付" @click="paymentMethod = 0">
                    <template #icon><cp-icon name="consult-wechat" /></template>
                    <template #extra><van-checkbox :checked="paymentMethod === 0"/></template>
                </van-cell>
                <van-cell title="支付宝支付" @click="paymentMethod = 1">
                    <template #icon><cp-icon name="consult-alipay" /></template>
                    <template #extra><van-checkbox :checked="paymentMethod === 1"/></template>
                </van-cell>
            </van-cell-group>
            <div class="btn">
                <van-button type="primary" round block @click="pay">立即支付</van-button>
            </div>
        </div>
    </van-action-sheet> -->
</template>
<style lang="scss" scoped>
.consult-pay-page {
    padding: 46px 0 50px 0;
}

.pay-info {
    display: flex;
    padding: 15px;
    flex-wrap: wrap;
    align-items: center;

    .tit {
        width: 100%;
        font-size: 16px;
        margin-bottom: 10px;
    }

    .img {
        margin-right: 10px;
        width: 38px;
        height: 38px;
        border-radius: 4px;
        overflow: hidden;
    }

    .desc {
        flex: 1;

        >span {
            display: block;
            color: var(--cp-tag);

            &:first-child {
                font-size: 16px;
                color: var(--cp-text2);
            }
        }
    }
}

.pay-price {
    ::v-deep() {
        .vam-cell__title {
            font-size: 16px;
        }

        .van-cell__value {
            font-size: 16px;
            color: var(--cp-price);
        }
    }
}

.pay-space {
    height: 12px;
    background-color: var(--cp-bg);
}

.pay-schema {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;

    .text {
        color: var(--cp-primary);
    }
}

::v-deep() {
    .van-submit-bar__button {
        font-weight: normal;
        width: 160px;
    }
}
</style>