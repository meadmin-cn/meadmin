<template>
  <me-dialog v-model="show" :title="t('新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" v-loading="loading" :model="info" :rules="rules" class="add" label-width="10em">
      <el-form-item :label="t('任务名称')" prop="name">
        <el-input v-model="info.name"></el-input>
      </el-form-item>
      <el-form-item :label="t('执行策略')" prop="strategy">
        <el-radio-group v-model="info.strategy" fill="#409eff">
          <el-radio-button v-for="val in dict.strategy" :key="val.value" :value="val.value" :label="val.label" />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="info.strategy === 2" :label="t('延时时间(ms)')" prop="delay">
        <el-input-number v-model="info.delay" :value-on-clear="null"></el-input-number>
      </el-form-item>
      <el-form-item v-else-if="info.strategy === 3" :label="t('定时表达式(cron)')" prop="cron">
        <el-input v-model="info.cron"></el-input>
        <el-alert type="info" :closable="false" style="margin-top: 5px">
          <pre>
<span class="line"><span>*     *     *     *     *     *</span></span>
<span class="line"><span>┬    ┬    ┬    ┬    ┬    ┬</span></span>
<span class="line"><span>│    │    │    │    │    │</span></span>
<span class="line"><span>│    │    │    │    │    └ day of week (0 - 7, 1L - 7L, where 0 or 7 is Sunday)</span></span>
<span class="line"><span>│    │    │    │    └───── month (1 - 12)</span></span>
<span class="line"><span>│    │    │    └────────── day of month (1 - 31, L for the last day of the month)</span></span>
<span class="line"><span>│    │    └─────────────── hour (0 - 23)</span></span>
<span class="line"><span>│    └──────────────────── minute (0 - 59)</span></span>
<span class="line"><span>└───────────────────────── second (0 - 59, optional)</span></span></pre>
        </el-alert>
      </el-form-item>
      <el-form-item :label="t('去重策略')" prop="deduplication">
        <el-radio-group v-model="info.deduplication" fill="#409eff">
          <el-radio-button v-for="val in dict.deduplication" :key="val.value" :value="val.value" :label="val.label" />
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('任务类型')" prop="type">
        <el-radio-group v-model="info.type" fill="#409eff">
          <el-radio-button v-for="val in dict.type" :key="val.value" :value="val.value" :label="val.label" />
        </el-radio-group>
      </el-form-item>
      <template v-if="info.type === 1">
        <el-form-item :label="t('sql语句')" prop="sql">
          <el-input v-model="info.sql" type="textarea"></el-input>
        </el-form-item>
      </template>
      <template v-else-if="info.type === 2">
        <el-form-item :label="t('url请求地址')" prop="url">
          <el-input v-model="info.url"></el-input>
        </el-form-item>
        <el-form-item :label="t('请求方法')" prop="method">
          <el-select v-model="info.method" :value-on-clear="null" clearable>
            <el-option v-for="val in dict.method" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('请求头(json格式)')" prop="headers">
          <me-json-editor v-model="info.headers" :stringified="true"></me-json-editor>
        </el-form-item>
        <el-form-item :label="t('POST请求体(json格式)')" prop="body">
          <me-json-editor v-model="info.body" :stringified="true"></me-json-editor>
        </el-form-item>
        <el-form-item :label="t('GET参数(json格式)')" prop="query">
          <me-json-editor v-model="info.query" :stringified="true"></me-json-editor>
        </el-form-item>
      </template>
      <template v-else-if="info.type === 3">
        <el-form-item :label="t('自定义任务处理器')" prop="queueName">
          <el-input v-model="info.queueName"></el-input>
        </el-form-item>
        <el-form-item :label="t('自定义任务处理器参数(json格式)')" prop="queueOptions">
          <me-json-editor v-model="info.queueOptions" :stringified="true"></me-json-editor>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpJob">
import { Job, type JobInfo, addJobApi } from '@/api/job';
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { getDict } from '../dict.js';
//接口需要现在setup顶层初始化（如果是异步setup需要在异步调用之前初始化），否则会有unMounted，非法调用警告，因为vueRequest使用了unMounted
const { runAsync: addRunAsync } = addJobApi();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'job']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();

const info = ref<Job | JobInfo>(new Job());
const loading = ref(false);
const rules: FormRules = {
  name: [
    { required: true, message: t('{label} 必须填写', { label: t('任务名称') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 300, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('任务名称'), min: 1, max: 300 }), trigger: 'blur' },
  ],
  strategy: [{ required: true, message: t('{label} 必须填写', { label: t('执行策略') }), trigger: 'blur' }],
  delay: [
    { required: true, message: t('{label} 必须填写', { label: t('延时时间(ms)') }), trigger: 'blur' },
    { type: 'number', min: 0, message: t('{label}必须大于等于 {min}', { label: t('延时时间(ms)'), max: 0 }), trigger: 'blur' },
  ],
  deduplication: [
    { required: true, message: t('{label} 必须填写', { label: t('延时时间(ms)') }), trigger: 'blur' },
    { required: true, message: t('{label} 必须填写', { label: t('去重策略') }), trigger: 'blur' },
  ],
  progress: [{ type: 'number', min: 0, max: 100, message: t('{label} 必须在 {min} 及 {max} 之间', { label: t('任务进度'), min: 0, max: 100 }), trigger: 'blur' }],
  type: [{ required: true, message: t('{label} 必须填写', { label: t('任务类型') }), trigger: 'blur' }],
  sucessedNum: [{ type: 'number', min: 0, message: t('{label}必须大于等于 {min}', { label: t('任务执行成功数'), max: 0 }), trigger: 'blur' }],
  failedNum: [{ type: 'number', min: 0, message: t('{label}必须大于等于 {min}', { label: t('任务执行失败数'), max: 0 }), trigger: 'blur' }],
  sql: [{ required: true, message: t('{label} 必须填写', { label: t('sql语句') }), trigger: 'blur' }],
  url: [{ required: true, message: t('{label} 必须填写', { label: t('url地址') }), trigger: 'blur' }],
  method: [{ required: true, message: t('{label} 必须填写', { label: t('请求方法') }), trigger: 'blur' }],
  queueName: [{ required: true, message: t('{label} 必须填写', { label: t('自定义任务处理器') }), trigger: 'blur' }],
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  await addRunAsync(info.value);
  show.value = false;
  emit('success');
};
</script>
