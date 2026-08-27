<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('任务名称')" prop="name">
          <el-input v-model="params.name" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('执行策略')" prop="strategy">
          <el-select v-model="params.strategy" clearable>
            <el-option v-for="val in dict.strategy" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('任务类型')" prop="type">
          <el-select v-model="params.type" clearable>
            <el-option v-for="val in dict.type" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('任务状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
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
      :on-add="permission('job_add') ? showAdd : undefined"
      @refresh="search(1)"
    >
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="name" :title="t('任务名称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="strategy" :title="t('执行策略')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="deduplication" :title="t('去重策略')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="progress" :title="t('任务进度')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="type" :title="t('任务类型')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="status" :title="t('任务状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="sucessedNum" :title="t('任务执行成功数')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="failedNum" :title="t('任务执行失败数')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者(管理员)')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column field="updatedAdmin" :title="t('最后更新者(管理员)')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column v-if="permission(['job_add', 'job_start', 'job_stop', 'job_del'])" :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: JobInfo }">
          <me-button v-if="permission('job_info')" :title="t('详情')" link @click="showInfo(row.id)">
            <mel-icon-memo />
          </me-button>
          <me-button v-if="permission('job_start')" :title="t('启动')" :disabled="row.strategy !== 4" link @click="showStart(row.id)">
            <mel-icon-open />
          </me-button>
          <me-button v-if="permission('job_stop')" :title="t('关闭')" :disabled="row.strategy === 4" link @click="stop(row.id)">
            <mel-icon-turn-off />
          </me-button>
          <el-popconfirm v-if="permission('job_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
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

<script setup lang="ts" name="Job">
import type { JobInfo } from '@/api/job';
import { delJobApi, jobListApi, JobListParam, stopJobApi } from '@/api/job';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { createformatterDictFn, formatterAt, formatterObjectFn, formatterStr } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import Add from './components/add.vue';
import Info from './components/info.vue';
import Start from './components/start.vue';
import { getDict } from './dict.js';
const { open: openInfo } = useActionModel(Info);
const { open: openAdd } = useActionModel(Add);
const { open: openStart } = useActionModel(Start);
const { runAsync: stopAsync } = stopJobApi();

let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'job']);
const dict = getDict(t);
const formatterDict = createformatterDictFn<JobInfo>(dict);
const params = reactive(new JobListParam());
const { loading, data, runAsync } = jobListApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { runAsync: delRun, loading: delLoading } = delJobApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search(1);
};
const showInfo = (id?: string) => {
  openInfo({ id });
};
const showAdd = () => {
  openAdd({
    onSuccess: async () => {
      await search(1);
    },
  });
};
const showStart = (id: string) => {
  openStart({
    id,
    onSuccess: async () => {
      data.value = undefined;
      await nextTick();
      await search();
    },
  });
};
const stop = async (id: string) => {
  await stopAsync(id);
  data.value = undefined;
  await nextTick();
  await search();
};
await Promise.all([loadRes, search(1)]);
</script>
