<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('父级id')" prop="parentId">
          <el-input v-model="params.parentId" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('组织名称')" prop="orgName">
          <el-input v-model="params.orgName" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('排序(降序)')" prop="orderNum">
          <el-input-number v-model="params.orderNum" clearable></el-input-number>
        </el-form-item>
        <el-form-item :label="t('状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('备注')" prop="remark">
          <el-input v-model="params.remark" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('负责人')" prop="leader">
          <el-input v-model="params.leader" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('联系电话')" prop="phone">
          <el-input v-model="params.phone" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('邮箱')" prop="email">
          <el-input v-model="params.email" clearable></el-input>
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
      :on-add="permission('system_organization_add') ? showAddOrUp : undefined"
      @refresh="search(1)"
    >
      <vxe-column field="parentId" :title="t('父级id')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="parent" :title="t('父级')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="orgName" :title="t('组织名称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="orderNum" :title="t('排序(降序)')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="remark" :title="t('备注')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="leader" :title="t('负责人')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="phone" :title="t('联系电话')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="email" :title="t('邮箱')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="admins" :title="t('关联管理员')" :formatter="formatterArrFn('username')"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者(管理员)')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column field="updatedAdmin" :title="t('最后更新者(管理员)')" :formatter="formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)"></vxe-column>
      <vxe-column v-if="permission(['system_organization_add', 'system_organization_edit', 'system_organization_del'])" :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: SystemOrganizationInfo }">
          <me-button v-if="permission('system_organization_info')" :title="t('详情')" link @click="showInfo(row.id)">
            <mel-icon-memo />
          </me-button>
          <me-button v-if="permission('system_organization_edit')" :title="t('编辑')" link @click="showAddOrUp(row.id)">
            <mel-icon-edit />
          </me-button>
          <el-popconfirm v-if="permission('system_organization_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
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

<script setup lang="ts" name="SystemOrganization">
import type { SystemOrganizationInfo } from '@/api/system/organization';
import { delSystemOrganizationApi, systemOrganizationListApi, SystemOrganizationListParam } from '@/api/system/organization';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { createformatterDictFn, formatterArrFn, formatterAt, formatterObjectFn, formatterStr } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
import { getDict } from './dict.js';
const { open: openInfo } = useActionModel(Info);
const { open: openAddOrUp } = useActionModel(AddOrUp);
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemOrganization']);
const dict = getDict(t);
const formatterDict = createformatterDictFn<SystemOrganizationInfo>(dict);
const params = reactive(new SystemOrganizationListParam());
const { loading, data, runAsync } = systemOrganizationListApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { runAsync: delRun, loading: delLoading } = delSystemOrganizationApi();
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
