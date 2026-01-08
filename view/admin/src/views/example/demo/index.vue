<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('手机号')" prop="mobile">
          <el-input v-model="params.mobile" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('类型')" prop="type">
          <el-select v-model="params.type" clearable>
            <el-option v-for="val in dict.type" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('名称')" prop="name">
          <el-input v-model="params.name" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('创建时间')" prop="createdAt">
          <el-date-picker v-model="params.startCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />
          </el-form-item>
        </el-form-item>
        <el-form-item :label="t('最后更新时间')" prop="updatedAt">
          <el-date-picker v-model="params.startUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />
          </el-form-item>
        </el-form-item>
      </me-search-form>
    </template>
    <me-vxe-table
      align="center"
      border
      :loading="loading"
      :data="data?.list"
      :pagination-options="{
        currentPage: params.page,
        pageSize: params.pageSize,
        total: data?.total ?? 0,
        layout: 'sizes, prev, pager, next, jumper, ->, total',
        change: search,
      }"
      :onAdd="permission('example_demo_add') ? showAddOrUp : undefined"
      @refresh="search(1)"
    >
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mobile" :title="t('手机号')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="type" :title="t('类型')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="name" :title="t('名称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="books" :title="t('书籍')" :formatter="formatterArrFn('name')"></vxe-column>
      <vxe-column field="user" :title="t('用户')" :formatter="formatterObjectFn('username')"></vxe-column>
      <vxe-column field="avatar" :title="t('头像')">
        <template #default="{ row }: { row: ExampleDemoInfo }">
          <me-table-file-item :files="row.avatar ? [row.avatar] : []"></me-table-file-item>
        </template>
      </vxe-column>
      <vxe-column field="files" :title="t('附件')">
        <template #default="{ row }: { row: ExampleDemoInfo }">
          <me-table-file-item :files="row.files"></me-table-file-item>
        </template>
      </vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column field="updatedAdmin" :title="t('最后更新者')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column v-if="permission(['example_demo_edit', 'exampleDemoDel'])" :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: ExampleDemoInfo }">
          <el-button v-if="permission('example_demo_info')" @click="showInfo(row.id)" :title="t('详情')">
            <mel-icon-memo />
          </el-button>
          <el-button v-if="permission('example_demo_edit')" @click="showAddOrUp(row.id)" :title="t('编辑')">
            <mel-icon-edit />
          </el-button>
          <el-popconfirm v-if="permission('example_demo_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
            <template #reference>
              <el-button :key="row.id" :loading="delLoading && delId === row.id" type="danger" :title="t('删除')">
                <mel-icon-delete />
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </vxe-column>
    </me-vxe-table>
  </page>
</template>

<script setup lang="ts" name="ExampleDemo">
import { delExampleDemoApi, ExampleDemoInfo, exampleDemoListApi, ExampleDemoListParam } from '@/api/example/demo';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { createformatterDictFn, formatterArrFn, formatterAt, formatterObjectFn, formatterStr } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
import { getDict } from './dict.js';
const { open: openInfo } = useActionModel(Info);
const { open: openAddOrUp } = useActionModel(AddOrUp);
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'exampleDemo']);
const dict = getDict(t);
const formatterDict = createformatterDictFn<ExampleDemoInfo>(dict);
const params = reactive(new ExampleDemoListParam());
const { loading, data, runAsync } = exampleDemoListApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { runAsync: delRun, loading: delLoading } = delExampleDemoApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search(1);
};
const showInfo = (id?: string) => {
  openInfo({ id });
};
const showAddOrUp = (id?: string) => {
  openAddOrUp({
    id,
    onSuccess: async () => {
      await search(1);
    },
  });
};

await Promise.all([loadRes, search(1)]);
</script>
