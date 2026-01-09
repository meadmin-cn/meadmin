<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('用户名')" prop="username">
          <el-input v-model="params.username" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('昵称')" prop="nickname">
          <el-input v-model="params.nickname" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('密码')" prop="password">
          <el-input v-model="params.password" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('邮箱')" prop="email">
          <el-input v-model="params.email" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('手机号')" prop="mobile">
          <el-input v-model="params.mobile" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('登录失败次数')" prop="loginFailure">
          <el-input-number v-model="params.loginFailure" clearable></el-input-number>
        </el-form-item>
        <el-form-item :label="t('最后登录时间')" prop="lastLoginAt">
          <el-date-picker v-model="params.startLastLoginAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endLastLoginAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />
          </el-form-item>
        </el-form-item>
        <el-form-item :label="t('最后登录ip')" prop="lastLoginIp">
          <el-input v-model="params.lastLoginIp" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('创建者Id')" prop="createdUserId">
          <el-input v-model="params.createdUserId" clearable></el-input>
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
      :onAdd="permission('user_add') ? showAddOrUp : undefined"
      @refresh="search(1)"
    >
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="username" :title="t('用户名')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="nickname" :title="t('昵称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="password" :title="t('密码')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="avatar" :title="t('头像')" :formatter="formatterObjectFn('name')"></vxe-column>
      <vxe-column field="email" :title="t('邮箱')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mobile" :title="t('手机号')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="loginFailure" :title="t('登录失败次数')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="lastLoginAt" :title="t('最后登录时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="lastLoginIp" :title="t('最后登录ip')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="createdUserId" :title="t('创建者Id')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdUser" :title="t('创建者')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="updatedUser" :title="t('最后更新者')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column
      ><vxe-column v-if="permission(['user_add', 'user_edit', 'user_del'])" :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: UserInfo }">
          <me-button v-if="permission('user_info')" @click="showInfo(row.id)" link :title="t('详情')">
            <mel-icon-memo />
          </me-button>
          <me-button v-if="permission('user_edit')" @click="showAddOrUp(row.id)" link :title="t('编辑')">
            <mel-icon-edit />
          </me-button>
          <el-popconfirm v-if="permission('user_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
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

<script setup lang="ts" name="User">
import { delUserApi, UserInfo, userListApi, UserListParam } from '@/api/user';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { createformatterDictFn, formatterAt, formatterObjectFn, formatterStr } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
import { getDict } from './dict.js';
const { open: openInfo } = useActionModel(Info);
const { open: openAddOrUp } = useActionModel(AddOrUp);
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'user']);
const dict = getDict(t);
const formatterDict = createformatterDictFn<UserInfo>(dict);
const params = reactive(new UserListParam());
const { loading, data, runAsync } = userListApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { runAsync: delRun, loading: delLoading } = delUserApi();
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
