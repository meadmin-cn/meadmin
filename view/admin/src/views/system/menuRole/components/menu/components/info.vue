<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions class="info" :border="true" v-loading="loading">
      <el-descriptions-item :label="t('ID')">{{ formatterStrExec(data?.id) }}</el-descriptions-item>
      <el-descriptions-item :label="t('父级')">{{ formatterStrExec(data?.parent?.title) }}</el-descriptions-item>
      <el-descriptions-item :label="t('菜单名称')">{{ formatterStrExec(data?.title) }}</el-descriptions-item>
      <el-descriptions-item :label="t('类型')">{{ formatterDictExec(dict, 'menuType',data?.menuType) }}</el-descriptions-item>
      <el-descriptions-item :label="t('状态')">{{ formatterDictExec(dict, 'status',data?.status) }}</el-descriptions-item>
      <el-descriptions-item :label="t('权限')">{{ formatterStrExec(data?.rule) }}</el-descriptions-item>
      <el-descriptions-item :label="t('排序(降序)')">{{ formatterStrExec(data?.orderNum) }}</el-descriptions-item>
      <el-descriptions-item :label="t('路径')">{{ formatterStrExec(data?.path) }}</el-descriptions-item>
      <el-descriptions-item :label="t('外链')">{{ formatterDictExec(dict, 'isLink',data?.isLink) }}</el-descriptions-item>
      <el-descriptions-item :label="t('组件路径(相对于views文件夹)')">{{ formatterStrExec(data?.component) }}</el-descriptions-item>
      <el-descriptions-item :label="t('隐藏')">{{ formatterDictExec(dict, 'hideMenu',data?.hideMenu) }}</el-descriptions-item>
      <el-descriptions-item :label="t('缓存')">{{ formatterDictExec(dict, 'cache',data?.cache) }}</el-descriptions-item>
      <el-descriptions-item :label="t('图标')">{{ formatterStrExec(data?.icon) }}</el-descriptions-item>
      <el-descriptions-item :label="t('固定tag')">{{ formatterDictExec(dict, 'affix',data?.affix) }}</el-descriptions-item>
      <el-descriptions-item :label="t('恒定展示(只有一个子元素时不隐藏)')">{{ formatterDictExec(dict, 'alwaysShow',data?.alwaysShow) }}</el-descriptions-item>
      <el-descriptions-item :label="t('面包屑')">{{ formatterDictExec(dict, 'breadcrumb',data?.breadcrumb) }}</el-descriptions-item>
      <el-descriptions-item :label="t('创建时间')">
        {{ formatterAtExec(data?.createdAt) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新时间')">
        {{ formatterAtExec(data?.updatedAt) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('创建人')"> {{ formatterStrExec(data?.createdAdmin?.nickname) }}({{ formatterStrExec(data?.createdAdmin?.username) }}) </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新人')"> {{ formatterStrExec(data?.updatedAdmin?.nickname) }}({{ formatterStrExec(data?.updatedAdmin?.username) }}) </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterAtExec, formatterStrExec, formatterDictExec } from '@/utils/helper.js';
import { getDict } from '../dict.js';
import { systemMenuInfoApi } from '@/api/system/menu.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemAdmin']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = systemMenuInfoApi();
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      runAsync(id);
    }
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
.info {
  .view-img {
    width: 80px;
    height: 80px;
  }
}
</style>
