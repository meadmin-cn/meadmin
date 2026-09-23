<template>
  <page>
    <me-vxe-table border :loading="loading" :data="data ?? []" :tree-config="{ rowField: 'id', childrenField: 'children', expandAll: true }" :on-add="permission('aon_cms_category_add') ? () => openEditor() : undefined" @refresh="search()">
      <vxe-column field="title" tree-node :title="t('栏目')" min-width="220" />
      <vxe-column field="slug" :title="t('SEO 标识')" />
      <vxe-column field="orderNum" :title="t('排序')" />
      <vxe-column field="status" :title="t('状态')"
        ><template #default="{ row }">{{ t(row.status ? '启用' : '禁用') }}</template></vxe-column
      >
      <vxe-column :title="t('操作')" min-width="200"
        ><template #default="{ row }">
          <el-button v-if="permission('aon_cms_category_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_category_edit')" link @click="openEditor(row.id)">{{ t('编辑') }}</el-button>
          <el-popconfirm v-if="permission('aon_cms_category_del')" :title="t('确认删除？')" @confirm="remove(row.id)"
            ><template #reference
              ><el-button link type="danger">{{ t('删除') }}</el-button></template
            ></el-popconfirm
          >
        </template></vxe-column
      >
    </me-vxe-table>
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { permission } from '@/utils/permission';
import { deleteApi, treeApi } from '../../api/category';
import Editor from './components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const { data, loading, runAsync: search } = treeApi();
const { runAsync: del } = deleteApi();
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
const remove = async (id: string) => {
  await del(id);
  await search();
};
await Promise.all([loadRes, search()]);
</script>
