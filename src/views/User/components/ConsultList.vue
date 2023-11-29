<script setup lang="ts">
import ConsultItem from './ConsultItem.vue'
import { ConsultType } from '@/enums'
import { getConsultOrderList } from '@/services/consult'
import type { ConsultOrderItem, ConsultOrderListParams } from '@/types/consult'
import { ref } from 'vue'
const props = defineProps<{ type: ConsultType }>()

const list = ref<ConsultOrderItem[]>([]);
const loading = ref(false);
const finished = ref(false);
const params = ref<ConsultOrderListParams>({
  current: 1,
  pageSize: 10,
  type: props.type
})

const onLoad = async () => {
  const res = await getConsultOrderList(params.value)
  list.value.push(...res.data.rows);
  if (params.value.current < res.data.pageTotal) {
    params.value.current++
  } else {
    finished.value = true
  }
  loading.value = false
};
// 删除订单--更新列表
const deleteFn = (id: string) => {
  list.value = list.value.filter(v => v.id !== id)
  if (!list.value.length) onLoad()
}
</script>

<template>
  <div class="consult-list">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <consult-item v-for="item in list" :key="item.id" :item="item" @delete="deleteFn"></consult-item>
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
