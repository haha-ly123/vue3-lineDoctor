<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import io from 'socket.io-client'
// import {  } from "@/enums/index";
import { baseURL } from "@/utils/request";
import type { Socket } from 'socket.io-client'
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores';
import { onMounted, provide } from 'vue';
import { MsgType } from '@/enums'
import type { Message, TimeMessages } from '@/types/room'
import { ref, nextTick } from 'vue';

import type { ConsultOrderItem } from '@/types/consult'
import { getConsultOrderDetail } from '@/services/consult'
import type { Image } from '@/types/consult'
const list = ref<Message[]>([])


let socket: Socket
const route = useRoute()
const store = useUserStore()
//  初始化websoket连接
const initSoket = () => {
    socket = io(baseURL, {
        auth: {
            token: `Bearer ${store.user?.token}`
        },
        query: {
            orderId: route.query.orderId
        }
    })
    socket.on('connect', () => {
        // 建立连接成功
        console.log('connect')
    })

    socket.on('error', (event) => {
        // 错误异常消息
        console.log('error', event)
    })

    socket.on('disconnect', () => {
        // 已经断开连接
        console.log('disconnect')
    })
    // 聊天记录
    socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
        // 准备转换常规消息列表
        const arr: Message[] = []
        data.forEach((item, i) => {
            arr.push({
                msgType: MsgType.Notify,
                msg: { content: item.createTime },
                createTime: item.createTime,
                id: item.createTime
            })
            arr.push(...item.items)
        })
        // 追加到聊天消息列表
        list.value.unshift(...arr)
    })
    // 接收消息 在onMounted注册
    socket.on('receiveChatMsg', async (event) => {
        list.value.push(event)
        await nextTick()
        // 滚到最底部
        window.scrollTo(0, document.body.scrollHeight)
    })
    // 订单状态变更
    socket.on('statusChange', async () => {
        const res = await getConsultOrderDetail(route.query.orderId as string)
        consult.value = res.data
    })

}
onMounted(() => {
    initSoket()
    // socket.close()
})
// 订单状态 在onMounted注册
const consult = ref<ConsultOrderItem>()
onMounted(async () => {
    const res = await getConsultOrderDetail(route.query.orderId as string)
    consult.value = res.data
    console.log('res.data', res.data)
})
const sendText = (text: string) => {
    // 发送信息需要  发送人  收消息人  消息类型  消息内容
    socket.emit('sendChatMsg', {
        from: store.user?.id,
        to: consult.value?.docInfo?.id,
        msgType: MsgType.MsgText,
        msg: { content: text }
    })

}
const sendImage = (img: Image) => {
    socket.emit('sendChatMsg', {
        from: store.user?.id,
        to: consult.value?.docInfo?.id,
        msgType: MsgType.MsgImage,
        msg: { picture: img }
    })
}

// 注入数据
provide('consult', consult)
// 注入修改数据方法
const completeEva = (score: number) => {
    const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
    if (item) {
        item.msg.evaluateDoc = { score }
        item.msgType = MsgType.CardEva
    }
}
provide('completeEva', completeEva)
</script>


<template>
    <div class="room-page">
        <cp-nav-bar title="医生问诊室" />
        <room-status :status="consult?.status" :countdown="consult?.countdown" />
        <room-message :list="list"></room-message>
        <room-action :disabled="false" @send-text="sendText" @send-image="sendImage"></room-action>
        <!-- <room-action :disabled="consult?.status !== OrderType.ConsultChat" @send-text="sendText"></room-action> -->
    </div>
</template>




<style scoped>
.room-page {
    padding-bottom: 60px;
}
</style>