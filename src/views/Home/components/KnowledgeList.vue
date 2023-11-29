<script setup lang="ts">
import KnowledgeCard from './KnowledgeCard.vue'
import type { KnowledgeType, KnowledgeParams, KnowledgeList } from '@/types/consult';
import { getKnowledgePage } from "@/services/consult";

import { ref } from 'vue'
import { watch } from 'vue';
const props = defineProps<{
    type: KnowledgeType
}>()
const list = ref<KnowledgeList>([])
const loading = ref(false)
const finished = ref(false)
const params = ref<KnowledgeParams>({
    type: props.type,
    current: 1,
    pageSize: 10
})
console.log('params', params)
const onLoad = async () => {
    // 加载数据
    console.log('loading')
    const { data } = await getKnowledgePage(params.value)
    list.value.push(...data.rows)
    // 模拟加载完毕
    if (list.value.length == data.total) {
        finished.value = true
    } else {
        params.value.current++
    }
    loading.value = false
}
</script>

<template>
    <div class="knowledge-list">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <knowledge-card v-for="item in list" :key="item.id" :item="item" />
        </van-list>
    </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
    padding: 0 15px;
}
</style>
