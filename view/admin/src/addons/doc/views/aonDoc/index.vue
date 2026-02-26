<template>
  <page>
    <template #searchForm>
      <me-search-form
        :model="params"
        :default-all="true"
        class="search-form"
        @search="search(1)"
      >
        <el-form-item :label="t('父级id')" prop="parentId">
          <el-input v-model="params.parentId" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('名称')" prop="title">
          <el-input v-model="params.title" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('类型')" prop="type">
          <el-select v-model="params.type" clearable>
            <el-option
              v-for="val in dict.type"
              :key="val.value"
              :value="val.value"
              :label="val.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option
              v-for="val in dict.status"
              :key="val.value"
              :value="val.value"
              :label="val.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('排序(降序)')" prop="orderNum">
          <el-input-number
            v-model="params.orderNum"
            clearable
          ></el-input-number>
        </el-form-item>
        <el-form-item :label="t('内容类型')" prop="constentType">
          <el-select v-model="params.constentType" clearable>
            <el-option
              v-for="val in dict.constentType"
              :key="val.value"
              :value="val.value"
              :label="val.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('内容')" prop="mdContent">
          <el-input v-model="params.mdContent" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('外链地址')" prop="link">
          <el-input v-model="params.link" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('创建时间')" prop="createdAt">
          <el-date-picker
            v-model="params.startCreatedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
          />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker
              v-model="params.endCreatedAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
          </el-form-item>
        </el-form-item>
        <el-form-item :label="t('最后更新时间')" prop="updatedAt">
          <el-date-picker
            v-model="params.startUpdatedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
          />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker
              v-model="params.endUpdatedAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
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
      :on-add="permission('aon_doc_add') ? showAddOrUp : undefined"
      @refresh="search(1)"
    >
      <vxe-column
        field="parentId"
        :title="t('父级id')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="id"
        :title="t('ID')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="title"
        :title="t('名称')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column field="icon" :title="t('图标(200*200)')">
        <template #default="{ row }: { row: AonDocInfo }">
          <me-files-view :files="row.icon ? [row.icon] : []"></me-files-view>
        </template>
      </vxe-column>
      <vxe-column
        field="parent"
        :title="t('父级')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="type"
        :title="t('类型')"
        :formatter="formatterDict"
      ></vxe-column>
      <vxe-column
        field="status"
        :title="t('状态')"
        :formatter="formatterDict"
      ></vxe-column>
      <vxe-column
        field="orderNum"
        :title="t('排序(降序)')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="constentType"
        :title="t('内容类型')"
        :formatter="formatterDict"
      ></vxe-column>
      <vxe-column
        field="mdContent"
        :title="t('内容')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="link"
        :title="t('外链地址')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="createdAt"
        :title="t('创建时间')"
        :formatter="formatterAt"
      ></vxe-column>
      <vxe-column
        field="updatedAt"
        :title="t('最后更新时间')"
        :formatter="formatterAt"
      ></vxe-column>
      <vxe-column
        field="createdAdmin"
        :title="t('创建者(管理员)')"
        :formatter="
          formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)
        "
      ></vxe-column>
      <vxe-column
        field="updatedAdmin"
        :title="t('最后更新者(管理员)')"
        :formatter="
          formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)
        "
      ></vxe-column>
      <vxe-column
        v-if="permission(['aon_doc_add', 'aon_doc_edit', 'aon_doc_del'])"
        :title="t('操作')"
        fixed="right"
        min-width="150px"
      >
        <template #default="{ row }: { row: AonDocInfo }">
          <me-button
            v-if="permission('aon_doc_info')"
            link
            :title="t('详情')"
            @click="showInfo(row.id)"
          >
            <mel-icon-memo />
          </me-button>
          <me-button
            v-if="permission('aon_doc_edit')"
            link
            :title="t('编辑')"
            @click="showAddOrUp(row.id)"
          >
            <mel-icon-edit />
          </me-button>
          <el-popconfirm
            v-if="permission('aon_doc_del')"
            :title="t('确认删除？')"
            placement="left"
            @confirm="del(row.id)"
          >
            <template #reference>
              <me-button
                :key="row.id"
                :loading="delLoading && delId === row.id"
                type="danger"
                link
                :title="t('删除')"
              >
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
import {
  AonDocInfo,
  aonDocListApi,
  AonDocListParam,
  delAonDocApi,
} from "@/addons/doc/api/aonDoc";
import { useActionModel } from "@/hooks/index.js";
import { useLocalesI18n } from "@/locales/i18n";
import {
  createformatterDictFn,
  formatterAt,
  formatterObjectFn,
  formatterStr,
} from "@/utils/helper.js";
import { permission } from "@/utils/permission.js";
import AddOrUp from "./components/addOrUp.vue";
import Info from "./components/info.vue";
import { getDict } from "./dict.js";
const { open: openInfo } = useActionModel(Info);
const { open: openAddOrUp } = useActionModel(AddOrUp);
let { t, loadRes } = useLocalesI18n({}, [
  (locale: string) => import(`./lang/${locale}.json`),
  "aonDoc",
]);
const dict = getDict(t);
const formatterDict = createformatterDictFn<AonDocInfo>(dict);
const params = reactive(new AonDocListParam());
const { loading, data, runAsync } = aonDocListApi();
const search = (page = params.page, pageSize = params.pageSize) =>
  runAsync(Object.assign(params, { page, pageSize }));
const { runAsync: delRun, loading: delLoading } = delAonDocApi();
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
