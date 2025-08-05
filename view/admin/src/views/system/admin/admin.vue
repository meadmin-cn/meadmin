<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('用户名')" prop="username">
          <el-input v-model="params.username"></el-input>
        </el-form-item>
        <el-form-item :label="t('昵称')" prop="nickname">
          <el-input v-model="params.nickname"></el-input>
        </el-form-item>
        <el-form-item :label="t('邮箱')" prop="email">
          <el-input-number v-model="params.email" ></el-input-number>
        </el-form-item>
        <el-form-item :label="t('手机号')" prop="mobile">
          <el-input-number v-model="params.mobile"></el-input-number>
        </el-form-item>
        <el-form-item :label="t('创建时间')" prop="createTime">
          <el-date-picker v-model="params.startCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
          <el-date-picker v-model="params.endCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
          </el-form-item>
        </el-form-item>
         <el-form-item :label="t('修改时间')" prop="createTime">
          <el-date-picker v-model="params.startUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
          <el-date-picker v-model="params.endUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
          </el-form-item>
        </el-form-item>
      </me-search-form>
    </template>
    <me-vxe-table
    v-model:quick-search="params.id"
    :loading="loading"
    :data="data?.list"
    :pagination-options="{
      currentPage: params.page,
      pageSize: params.size,
      total: data?.total ?? 0,
      layout: 'sizes, prev, pager, next, jumper, ->, total',
      change: search,
    }"
    align="center"
    border
    @refresh="search(1)"
    @add="showAddOrUp()"
    @quick-search="search(1)"
  >
    <vxe-column field="id" :title="t('ID')" ></vxe-column>
    <vxe-column field="username" :title="t('用户名')" ></vxe-column>
    <vxe-column field="nickname" :title="t('昵称')"></vxe-column>
    <vxe-column field="avatarFile" :title="t('头像')" ></vxe-column>
    <vxe-column field="email" :title="t('邮箱')" ></vxe-column>
    <vxe-column field="mobile" :title="t('手机号')" ></vxe-column>
    <vxe-column field="loginFailure" :title="t('登录失败次数')"></vxe-column>
    <vxe-column field="lastLoginAt" :title="t('最后登录时间')"></vxe-column>
    <vxe-column field="lastLoginIp" :title="t('最后登录IP')"></vxe-column>
    <vxe-column :title="t('操作')" fixed="right" min-width="150px">
      <template #default="{ row }: { row: AdminInfo }">
        <el-button @click="showAddOrUp(row.id)">
          <mel-icon-edit />
        </el-button>
        <el-popconfirm :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
          <template #reference>
            <el-button :key="row.id" :loading="delLoading && delId === row.id" type="danger">
              <mel-icon-delete />
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </vxe-column>
    </me-vxe-table>    
  </page>
</template>

<script setup lang="ts" name="Admin">
import { adminListApi,AdminListParam,delAdminApi,AdminInfo } from '@/api/admin';
import { useLocalesI18n } from '@/locales/i18n';
import AddOrUp from './components/addOrUp.vue';
import { useActionModel } from '@/hooks/index.js';
import { number } from 'echarts/core';
const {open} = useActionModel(AddOrUp);
let { t } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'admin']);
const params = reactive(new AdminListParam());
const { loading, data, runAsync } = adminListApi();
const search = (page = params.page, size = params.size) => runAsync(Object.assign(params, { page, size }));
const { runAsync: delRun, loading: delLoading } = delAdminApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search(1);
};
const showAddOrUp = (id?: string) => {
  open({id,onSuccess:async ()=>{
    await search(1);
  }});
};
await search(1);

</script>

