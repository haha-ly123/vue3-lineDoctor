<template>
    <div>
        <svg aria-hidden="true" class="cp-icon">
             <use :href="`#icon-${name}`" />
        </svg>
    </div>
</template>

<script setup lang="ts">
defineProps < {
    name:string
} >()
</script>

<style lang="scss" scoped>
.cp-icon {
  // 和字体一样大
  width: 1em;
  height: 1em;
}
</style>