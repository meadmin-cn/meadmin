<template>
  <me-dialog v-model="show" v-loading="loading" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <div class="title">基础信息</div>
    <el-descriptions class="info" :border="true">
      <el-descriptions-item :label="t('ID')"> {{ formatterStrExec(data?.id) }} </el-descriptions-item>
      <el-descriptions-item :label="t('任务名称')"> {{ formatterStrExec(data?.name) }} </el-descriptions-item>
      <el-descriptions-item :label="t('去重策略')"> {{ formatterDictExec(dict, 'deduplication', data?.deduplication) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建时间')"> {{ formatterAtExec(data?.createdAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新时间')"> {{ formatterAtExec(data?.updatedAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建者(管理员)')"> {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.createdAdmin) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新者(管理员)')"> {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.updatedAdmin) }} </el-descriptions-item>
    </el-descriptions>
    <div class="title">策略参数</div>
    <el-tabs v-model="strategy" type="card">
      <el-tab-pane :label="t('立即执行')" :name="1">
        <el-descriptions class="info" border>
          <el-descriptions-item label-class-name="no-label">
            <div class="empty">{{ t('无需参数') }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="t('延时执行')" :name="2">
        <el-descriptions class="info" :border="true" label-width="30%">
          <el-descriptions-item :label="t('延时时间(ms)')"> {{ formatterStrExec(data?.delay) }} </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="t('定时执行')" :name="3">
        <el-descriptions class="info" :border="true" label-width="30%">
          <el-descriptions-item :label="t('定时表达式(cron)')"> {{ formatterStrExec(data?.cron) }} </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="t('放弃执行')" :name="4">
        <el-descriptions class="info" border>
          <el-descriptions-item label-class-name="no-label">
            <div class="empty">{{ t('无需参数') }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>

    <div class="title">任务信息</div>
    <el-descriptions class="info" :border="true">
      <el-descriptions-item :label="t('任务id')"> {{ formatterStrExec(data?.jobId) }} </el-descriptions-item>
      <el-descriptions-item :label="t('任务进度')"> {{ formatterStrExec(data?.progress) }} </el-descriptions-item>
      <el-descriptions-item :label="t('任务类型')"> {{ formatterDictExec(dict, 'type', data?.type) }} </el-descriptions-item>
      <el-descriptions-item :label="t('任务状态')"> {{ formatterDictExec(dict, 'status', data?.status) }} </el-descriptions-item>
      <el-descriptions-item :label="t('任务执行成功数')"> {{ formatterStrExec(data?.sucessedNum) }} </el-descriptions-item>
      <el-descriptions-item :label="t('任务执行失败数')"> {{ formatterStrExec(data?.failedNum) }} </el-descriptions-item>
      <el-descriptions-item :label="t('执行策略')" :span="3"> {{ formatterDictExec(dict, 'strategy', data?.strategy) }} </el-descriptions-item>
    </el-descriptions>
    <div class="title">任务参数</div>
    <el-tabs v-model="type" type="card">
      <el-tab-pane :label="t('sql')" :name="1">
        <el-descriptions class="info" :border="true">
          <el-descriptions-item :label="t('sql语句')"> {{ formatterStrExec(data?.sql) }} </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="t('url请求')" :name="2">
        <el-descriptions class="info" :border="true">
          <el-descriptions-item :label="t('url请求地址')"> {{ formatterStrExec(data?.url) }} </el-descriptions-item>
          <el-descriptions-item :label="t('请求方法')"> {{ formatterDictExec(dict, 'method', data?.method) }} </el-descriptions-item>
          <el-descriptions-item :label="t('请求头(json格式)')"> {{ formatterStrExec(data?.headers) }} </el-descriptions-item>
          <el-descriptions-item :label="t('POST请求体(json格式)')"> {{ formatterStrExec(data?.body) }} </el-descriptions-item>
          <el-descriptions-item :label="t('GET参数(json格式)')"> {{ formatterStrExec(data?.query) }} </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="t('自定义')" :name="3">
        <el-descriptions class="info" :border="true">
          <el-descriptions-item :label="t('自定义任务处理器')"> {{ formatterStrExec(data?.queueName) }} </el-descriptions-item>
          <el-descriptions-item :label="t('自定义任务处理器参数(json格式)')"> {{ formatterStrExec(data?.queueOptions) }} </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>
    <div class="title">执行结果</div>
    <el-tabs v-model="resultType" type="card">
      <el-tab-pane :label="t('执行结果')" name="result">
        <div>
          <template v-for="(item, index) in formatJosnArr(data?.result)" :key="index">
            <me-json-editor v-if="item" :model-value="item" :aria-label="'result' + index" :readony="true" :main-menu-bar="false" :navigation-bar="false" :status-bar="false" :expand="1"> </me-json-editor>
            <div v-else>--</div>
          </template>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="t('失败响应')" name="failedResponse">
        <div>
          <template v-for="(item, index) in formatJosnArr(data?.failedResponse)" :key="index">
            <me-json-editor v-if="item" :model-value="item" :aria-label="'failed' + index" :readony="true" :main-menu-bar="false" :navigation-bar="false" :status-bar="false" :expand="1"> </me-json-editor>
            <div v-else>--</div>
          </template>
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { jobInfoApi } from '@/api/job';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterAtExec, formatterDictExec, formatterObjectExecFn, formatterStrExec } from '@/utils/helper.js';
import { getDict } from '../dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'job']);
await loadRes;
const strategy = ref<number>();
const type = ref<number>();
const resultType = ref('result');
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = jobInfoApi();
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      await runAsync(id);
      strategy.value = data.value?.strategy;
      type.value = data.value?.type;
    }
  },
  { immediate: true },
);
const formatJosnArr = (data?: Array<string>) => {
  if (!data) {
    return [];
  }
  return data.map((item) => JSON.parse(item));
};
</script>
<style lang="scss" scoped>
.title {
  padding: 10px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 3px;
    top: 5px;
    bottom: 5px;
    border-radius: 2px;
    background-color: var(--el-color-primary);
    z-index: 1;
  }
}
.info {
  :deep(.no-label) {
    width: 0;
    padding: 0 !important;
  }
  .empty {
    width: 100%;
    text-align: center;
    color: var(--el-text-color-secondary);
  }
}
</style>
