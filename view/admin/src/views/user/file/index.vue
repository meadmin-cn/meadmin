<template>
  <page>
    <template #searchForm>
      <me-search-form
        :model="params"
        :default-all="true"
        class="search-form"
        @search="search(1)"
      >
        <el-form-item :label="t('创建者Id')" prop="createdUserId">
          <el-input v-model="params.createdUserId" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('文件名')" prop="name">
          <el-input v-model="params.name" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('路径')" prop="path">
          <el-input v-model="params.path" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('mime类型')" prop="mimeType">
          <el-input v-model="params.mimeType" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('文件大小')" prop="size">
          <el-input-number v-model="params.size" clearable></el-input-number>
        </el-form-item>
        <el-form-item :label="t('存储引擎')" prop="storage">
          <el-input v-model="params.storage" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('文件MD5值')" prop="md5">
          <el-input v-model="params.md5" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('文件url')" prop="url">
          <el-input v-model="params.url" clearable></el-input>
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
      :on-add="permission('user_file_add') ? showAdd : undefined"
      @refresh="search(1)"
    >
      <vxe-column
        field="id"
        :title="t('ID')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column :title="t('预览')">
        <template #default="{ row }: { row: UserFileInfo }">
          <me-files-view :files="[row]"></me-files-view>
        </template>
      </vxe-column>
      <vxe-column
        field="name"
        :title="t('文件名')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="path"
        :title="t('路径')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="mimeType"
        :title="t('mime类型')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="size"
        :title="t('文件大小')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="storage"
        :title="t('存储引擎')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="md5"
        :title="t('文件MD5值')"
        :formatter="formatterStr"
      ></vxe-column>
      <vxe-column
        field="url"
        :title="t('文件url')"
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
        field="createdUser"
        :title="t('创建者(用户)')"
        :formatter="
          formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)
        "
      ></vxe-column>
      <vxe-column
        field="updatedUser"
        :title="t('最后更新者(用户)')"
        :formatter="
          formatterObjectFn((obj) => `${obj.nickname}(${obj.username})`)
        "
      ></vxe-column>
      <vxe-column
        v-if="permission(['user_file_add', 'user_file_edit', 'user_file_del'])"
        :title="t('操作')"
        fixed="right"
        min-width="150px"
      >
        <template #default="{ row }: { row: UserFileInfo }">
          <me-button
            v-if="permission('user_file_info')"
            link
            :title="t('详情')"
            @click="showInfo(row.id)"
          >
            <mel-icon-memo />
          </me-button>
          <me-button
            v-if="permission('user_file_edit')"
            link
            :title="t('编辑')"
            @click="showUp(row.id)"
          >
            <mel-icon-edit />
          </me-button>
          <el-popconfirm
            v-if="permission('user_file_del')"
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

<script setup lang="ts" name="UserFile">
import {
  delUserFileApi,
  UserFileInfo,
  userFileListApi,
  UserFileListParam,
} from "@/api/userFile";
import { useActionModel } from "@/hooks/index.js";
import { useLocalesI18n } from "@/locales/i18n";
import {
  formatterAt,
  formatterObjectFn,
  formatterStr,
} from "@/utils/helper.js";
import { permission } from "@/utils/permission.js";
import Add from "./components/add.vue";
import Info from "./components/info.vue";
import Up from "./components/up.vue";
const { open: openInfo } = useActionModel(Info);
const { open: openAdd } = useActionModel(Add);
const { open: openUp } = useActionModel(Up);

let { t, loadRes } = useLocalesI18n({}, [
  (locale: string) => import(`./lang/${locale}.json`),
  "userFile",
]);

const params = reactive(new UserFileListParam());
const { loading, data, runAsync } = userFileListApi();
const search = (page = params.page, pageSize = params.pageSize) =>
  runAsync(Object.assign(params, { page, pageSize }));
const { runAsync: delRun, loading: delLoading } = delUserFileApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search(1);
};
const showAdd = () => {
  openAdd({
    onClosed: async () => {
      await search(1);
    },
  });
};
const showUp = (id: string) => {
  openUp({
    id,
    onSuccess: async () => {
      await search(1);
    },
  });
};
const showInfo = (id: string) => {
  openInfo({
    id,
  });
};

await Promise.all([loadRes, search(1)]);
</script>
