<template>
  <page>
    <me-vxe-table
      align="center"
      border
      :tree-config="{
        expandAll: true,
        rowField: 'id',
        childrenField: 'children',
      }"
      :loading="loading"
      :data="data ?? []"
      :on-add="permission('aon_doc_add') ? showAddOrUp : undefined"
      @refresh="search()"
    >
      <template #buttons>
        <el-select v-model="selectedVersion" style="width: 150px; margin-left: 12px">
          <el-option v-for="val in dict.version" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </template>
      <vxe-column type="seq" align="left" :title="t('序号')" tree-node></vxe-column>
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="title" :title="t('名称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="icon" :title="t('图标(200*200)')">
        <template #default="{ row }: { row: AonDocInfo }">
          <me-files-view :files="row.icon ? [row.icon] : []"></me-files-view>
        </template>
      </vxe-column>
      <vxe-column field="parent" :title="t('父级')" :formatter="formatterObjectFn('title')"></vxe-column>
      <vxe-column field="version" :title="t('版本')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="type" :title="t('类型')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="orderNum" :title="t('排序(降序)')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="contentType" :title="t('内容类型')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="link" :title="t('外链地址')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者(管理员)')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column field="updatedAdmin" :title="t('最后更新者(管理员)')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column v-if="permission(['aon_doc_add', 'aon_doc_edit', 'aon_doc_del'])" :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: AonDocInfo }">
          <me-button v-if="permission('aon_doc_info')" link :title="t('详情')" @click="showInfo(row.id)">
            <mel-icon-memo />
          </me-button>
          <me-button v-if="permission('aon_doc_info') && row.contentType == 0" link :title="t('预览')" @click="openViewMd({ id: row.id })">
            <mel-icon-view />
          </me-button>
          <me-button v-if="permission('aon_doc_edit')" link :title="t('编辑')" @click="showAddOrUp(row.id)">
            <mel-icon-edit />
          </me-button>
          <el-popconfirm v-if="permission('aon_doc_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
            <template #reference>
              <me-button :key="row.id" :loading="delLoading && delId === row.id" type="danger" link :title="t('删除')">
                <mel-icon-delete />
              </me-button>
            </template>
          </el-popconfirm>
        </template>
      </vxe-column>
    </me-vxe-table>
  </page>
</template>

<script setup lang="ts" name="AonDoc">
import { AonDocInfo, aonDocTreeAllApi, delAonDocApi } from '@/addons/doc/api/doc';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { createformatterDictFn, formatterAt, formatterObjectFn, formatterStr } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
import ViewMd from './components/viewMd.vue';
import { getDict } from './dict.js';
const { open: openInfo } = useActionModel(Info);
const { open: openAddOrUp } = useActionModel(AddOrUp);
const { open: openViewMd } = useActionModel(ViewMd);
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'aonDoc']);
const dict = await getDict(t);
const selectedVersion = defineModel<string>();
selectedVersion.value = dict?.version[0].label;
const formatterDict = createformatterDictFn<AonDocInfo>(dict);
const { loading, data, runAsync } = aonDocTreeAllApi();
const search = () => runAsync(selectedVersion.value);
const { runAsync: delRun, loading: delLoading } = delAonDocApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search();
};
const showInfo = (id: string) => {
  openInfo({ id });
};
const showAddOrUp = (id?: string) => {
  openAddOrUp({
    id,
    version: selectedVersion.value,
    onSuccess: async () => {
      await search();
    },
  });
};

await Promise.all([loadRes, search()]);
watch(selectedVersion, () => search());
</script>
