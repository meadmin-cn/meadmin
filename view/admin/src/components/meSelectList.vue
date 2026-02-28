<template>
  <el-select v-bind="omit(attrs, 'filterable', 'loading', 'filterMethod')" :ref="changeRef" v-model="modelValue" :loading="loading" :filterable="true" :filter-method="filterMethod" class="me-sleect-list">
    <template v-for="(_, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data || {}"></slot>
    </template>
    <template v-if="!$slots.default && !attrs.options">
      <el-option v-for="item in options" :key="item.id" :label="item[attrs.props?.label || 'label']" :value="attrs.valueKey ? item : item[attrs.props?.value || 'value']"></el-option>
    </template>
    <template v-if="!$slots.footer" #footer>
      <el-pagination :total="page.total" size="small" :current-page="page.currentPage" :page-size="page.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange"></el-pagination>
    </template>
  </el-select>
</template>

<script setup lang="ts" name="MeSleectList">
import { PageResult } from '@/api/api.model.js';
import { snakeToCamelCaseObj } from '@/utils/formatting.js';
import { SelectInstance, SelectProps } from 'element-plus';
import { omit } from 'lodash-es';
const attrs = snakeToCamelCaseObj(useAttrs()) as Record<string, any> & SelectProps;
const modelValue = defineModel<SelectProps['modelValue']>();
defineOptions({ inheritAttrs: false });
const loading = ref(false);
const page = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const { onSearch } = defineProps<{
  onSearch: (query: string, page: number, pageSize: number) => Promise<PageResult<any>> | PageResult<any>;
}>();
const searchText = ref('');
const options = ref([] as any[]);
//实现筛选查询
const filterMethod = async (query?: string, currentPage?: number, pageSize?: number) => {
  loading.value = true;
  searchText.value = query ?? searchText.value;
  page.currentPage = currentPage ?? page.currentPage;
  page.pageSize = pageSize ?? page.pageSize;
  try {
    const res = await onSearch(searchText.value, page.currentPage, page.pageSize);
    page.total = res.pageSize;
    options.value = res.list;
  } finally {
    loading.value = false;
  }
};
//页数改变
const handleCurrentChange = (val: number) => {
  filterMethod(undefined, val, undefined);
};
//每页记录数改变
const handleSizeChange = (val: number) => {
  filterMethod(undefined, undefined, val);
};
//声明类型
const selectRef = ref<SelectInstance | null>();
const vm = getCurrentInstance();
function changeRef(ref: Element | ComponentPublicInstance | null) {
  if (vm) {
    //暴露elSelect属性
    vm.exposed = ref;
    selectRef.value = ref as SelectInstance;
  }
}
defineExpose({} as SelectInstance);
await filterMethod();
</script>
<style lang="scss" scoped>
.me-sleect-list {
}
</style>
