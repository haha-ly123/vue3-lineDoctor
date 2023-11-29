<script setup lang="ts">
import EvaluateCard from './evaluateCard.vue'
import { IllnessTime, MsgType, PrescriptionStatus } from '@/enums'
import type { Message } from '@/types/room'
import { flagOptions, timeOptions } from '@/services/constants'
import { showImagePreview, showToast } from 'vant';
import type { Image } from '@/types/consult'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores';
import { nextTick } from 'vue';
import { getPrescriptionPic } from '@/services/consult'
import { useRouter } from 'vue-router';
import type { Prescription } from '@/types/room'
import {usePreImg} from '@/hooks/index';




defineProps<{ list: Message[] }>()
const getIllnessTimeText = (time: IllnessTime) =>
  timeOptions.find((item) => item.value === time)?.label

const getConsultFlagText = (flag: 0 | 1) =>
  flagOptions.find((item) => item.value === flag)?.label
const previewImg = (imgs?: Image[]) => {
  if (imgs && imgs.length) {
    showImagePreview(imgs.map(v => v.url))
  } else {
    showToast('未上传病情描述图片，暂不能预览')
  }
}
const formatTime = (time: string) => dayjs(time).format('HH:mm')
const store = useUserStore()
const loadFn = () => {
  console.log(11);
  // 滚到最底部
  window.scrollTo(0, document.body.scrollHeight)
}

const router = useRouter()
// 购买药品
const buy = (pre?: Prescription) => {
  if (pre) {
    console.log('',pre.id)
    if (pre.status === PrescriptionStatus.Invalid) return showToast('处方失效')
    if (pre.status === PrescriptionStatus.NotPayment) return showToast('未付款')
    router.push(`/medicine/pay?id=${pre.id}`)
  }

}
const { showPrescription }= usePreImg()
</script>

<template>
  <template v-for="{ msgType, msg, createTime, from, fromAvatar } in list" :key="msg.id">
    <!-- 病情描述 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <div class="patient van-hairline--bottom" v-if="msg.consultRecord">
        <p>
          {{ msg.consultRecord.patientInfo.name }}
          {{ msg.consultRecord.patientInfo.genderValue }}
          {{ msg.consultRecord.patientInfo.age }}岁
        </p>
        <p>
          {{ getIllnessTimeText(msg.consultRecord.illnessTime) }} |
          {{ getConsultFlagText(msg.consultRecord.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <van-col span="18" @click="previewImg(msg.consultRecord?.pictures)"> 点击查看 </van-col>
      </van-row>
    </div>
    <!-- 温馨提示 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 通用通知 -->
    <div class="msg msg-tip" v-if="msgType === 31">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 我发的消息 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgText && store.user?.id === from">
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
      <van-image :src="store.user?.avatar" />
    </div>
    <!-- 医生发的消息 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgText && store.user?.id !== from">
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
    </div>
    <!-- 我发得图片 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgImage && store.user?.id === from">
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image @load="loadFn" fit="contain" :src="msg.picture?.url" />
      </div>
      <van-image :src="store.user?.avatar" />
    </div>
    <!-- 医生发的图片 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgImage && store.user?.id !== from">
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image @load="loadFn" fit="contain" :src="msg.picture?.url" />
      </div>
    </div>
    <!-- 处方 -->
    <div class="msg msg-recipe" v-if="msgType === MsgType.CardPre">
      <div class="content" v-if="msg.prescription">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="showPrescription(msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <p>
            {{ msg.prescription.name }}
            {{ msg.prescription.genderValue }}
            {{ msg.prescription.age }}岁
            {{ msg.prescription.diagnosis }}
          </p>
          <p>开方时间：{{ msg.prescription.createTime }}</p>
        </div>
        <div class="body">
          <div class="body-item" v-for="med in msg.prescription.medicines" :key="med.id">
            <div class="durg">
              <p>{{ med.name }} {{ med.specs }}</p>
              <p>{{ med.usageDosag }}</p>
            </div>
            <div class="num">x{{ med.quantity }}</div>
          </div>
        </div>
        <div class="foot">
          <span @click="buy(msg.prescription)">购买药品</span>
        </div>
      </div>
    </div>
    <div class="msg msg-comment" v-if="msgType === MsgType.CardEva || msgType === MsgType.CardEvaForm">
      <evaluate-card :evaluateDoc="msg.evaluateDoc" />
    </div>
  </template>
</template>

<style lang="scss" scoped>
@import '@/styles/room.scss';
</style>
