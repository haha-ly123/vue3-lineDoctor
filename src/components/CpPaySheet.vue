<script setup lang="ts">
import { getConsultOrderPayUrl } from '@/services/consult'
import { showToast } from 'vant'
import { ref } from 'vue';

const porps = defineProps<{
    show: boolean
    orderId: string
    actualPayment?: string
    callBack?: () => void
    payCallback?: string
}>()
const emit = defineEmits<{
    (e: 'update:show', data: boolean): void
}>()
// 支付方式
const paymentMethod = ref<0 | 1>()
// 获取支付地址  0 是微信  1 支付宝
const pay = async () => {
    if (paymentMethod.value === undefined) return showToast('请选择支付方式')
    const { data } = await getConsultOrderPayUrl({
        paymentMethod: paymentMethod.value,
        orderId: porps.orderId,
        payCallback: porps.payCallback || 'http://localhost:5173/room'
    })
    window.location.href = data.payUrl
}

</script>
<template>
    <van-action-sheet :show="show" @update:show="emit('update:show', $event)" title="选择支付方式" :closeable="false"
        :before-close="callBack">
        <div class="pay-type">
            <p class="amount">￥{{ actualPayment || 20 }}</p>
            <van-cell-group>
                <van-cell title="微信支付" @click="paymentMethod = 0">
                    <template #icon><cp-icon name="consult-wechat" /></template>
                    <template #extra><van-checkbox :checked="paymentMethod === 0" /></template>
                </van-cell>
                <van-cell title="支付宝支付" @click="paymentMethod = 1">
                    <template #icon><cp-icon name="consult-alipay" /></template>
                    <template #extra><van-checkbox :checked="paymentMethod === 1" /></template>
                </van-cell>
            </van-cell-group>
            <div class="btn">
                <van-button type="primary" round block @click="pay">立即支付</van-button>
            </div>
        </div>
    </van-action-sheet>
</template>

<style lang="scss" scoped>
.pay-type {
    .amount {
        padding: 20px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
    }

    .btn {
        padding: 15px;
    }

    .van-cell {
        align-items: center;

        .cp-icon {
            margin-right: 10px;
            font-size: 18px;
        }

        .van-checkbox :deep(.van-checkbox__icon) {
            font-size: 16px;
        }
    }
}
</style>