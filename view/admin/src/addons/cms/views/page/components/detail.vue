<template>
  <me-dialog v-model="show" title="单页详情" width="min(1000px, calc(100% - 32px))" :close-on-click-modal="false" class="page-detail-dialog" @closed="emit('closed')">
    <el-skeleton v-if="loading" :rows="10" animated />
    <div v-else-if="detail">
      <h2 class="detail-title">{{ detail.title }}</h2>
      <PageInfo :page="detail" />
    </div>
    <el-empty v-else description="未获取到单页信息" />
  </me-dialog>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { infoApi } from '../../../api/page';
import PageInfo from './pageInfo.vue';
const props = defineProps<{ id?: string }>();
const emit = defineEmits<{ closed: [] }>();
const show = defineModel<boolean>();
const { runAsync: getInfo, loading } = infoApi();
const detail = ref<any>();
watch(show, (v) => {
  if (v && props.id) load();
});
const load = async () => {
  if (!props.id) return;
  detail.value = await getInfo(props.id);
};
</script>
<style scoped>
.detail-title {
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
