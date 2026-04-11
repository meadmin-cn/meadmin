<template>
  <div class="menu">
    <me-vxe-table
      ref="menuRef"
      v-model:quick-search="searchText"
      :data="data ?? []"
      :loading="loading"
      :custom-column="false"
      :tree-config="{ expandAll: true, showLine: true, reserve: true }"
      :checkbox-config="{ labelField: 'id' }"
      :row-config="{ keyField: 'id', useKey: true }"
      :column-config="{ useKey: true }"
      :quick-search-placeholder="t('输入菜单名称快捷查询')"
      :on-add="permission('system_menu') ? showAddOrUp : undefined"
      align="center"
      border
      me-class="table-menu"
      height="auto"
      show-overflow
      @refresh="getMenu"
      @quick-search="search"
    >
      <vxe-column type="checkbox" tree-node width="240px" align="left" header-align="center" field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="title" :title="t('菜单名称')" type="html"></vxe-column>
      <vxe-column field="menuType" :title="t('类型')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="rule" :title="t('权限')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="path" :title="t('路径')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="isLink" :title="t('外链')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="component" :title="t('组件路径')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="orderNum" :title="t('排序(降序)')" :formatter="formatterStr"></vxe-column>
      <vxe-column v-if="permission(['system_menu_info', 'system_menu_edit', 'system_menu_del'])" title="操作" fixed="right">
        <template #default="{ row }">
          <me-button v-if="permission('system_menu_info')" link :title="t('详情')" @click="showInfo(row.id)">
            <mel-icon-memo />
          </me-button>
          <me-button v-if="permission('system_menu_edit')" link :title="t('编辑')" @click="showAddOrUp(row.id)"><mel-icon-edit /></me-button>
          <el-popconfirm v-if="permission('system_menu_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
            <template #reference>
              <me-button :key="row.id" :loading="delLoading && delId === row.id" :title="t('删除')" link type="danger">
                <mel-icon-delete />
              </me-button>
            </template>
          </el-popconfirm>
        </template>
      </vxe-column>
      <template #toolsButton>
        <me-button
          type="success"
          :disabled="isSuper !== 0"
          @click="
            isSuper === 0 &&
            emit(
              'subMenus',
              menuRef!.vxeTableRef!.getCheckboxRecords(true).map((item) => item.id),
            )
          "
          >保存</me-button
        >
      </template>
    </me-vxe-table>
  </div>
</template>
<script setup lang="ts" name="Menu">
import type { SystemMenuInfo, SystemMenuTreeAll} from '@/api/system/menu';
import { delSystemMenuApi, systemMenuTreeAllApi } from '@/api/system/menu';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { formatterStr, searchTreeTable } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import { cloneDeep } from 'lodash-es';
import type { VxeColumnPropTypes } from 'vxe-table';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
import { getDict } from './dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemMenu']);
const menuRef = ref<MeVxeTableInstance>();
const dict = getDict(t);
const formatterDict: VxeColumnPropTypes.Formatter<SystemMenuInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, { value: string | number; label: string }[]>)[column.field]?.find((item) => item.value == cellValue)?.label });
};
const { open } = useActionModel(AddOrUp);
const { open: openInfo } = useActionModel(Info);

const { checkedMenuIds = [], isSuper = 0 } = defineProps<{ checkedMenuIds: string[]; isSuper: 0 | 1 }>();
const emit = defineEmits<{
  subMenus: [menuIds: string[]]; //提交菜单选中
}>();
const { loading, data, runAsync } = systemMenuTreeAllApi();
onMounted(() => {
  watch(
    //设置选中值
    () => [checkedMenuIds, data.value],
    async () => {
      if (!data.value?.length) {
        return;
      }
      await menuRef.value!.vxeTableRef!.clearCheckboxRow();
      menuRef.value!.vxeTableRef!.setCheckboxRow(
        checkedMenuIds.reduce((previousValue, currentValue) => {
          const row = menuRef.value!.vxeTableRef!.getRowById(currentValue);
          if (!row?.children?.length) {
            previousValue.push(row);
          }
          return previousValue;
        }, [] as any[]),
        true,
      );
    },
    { immediate: true },
  );
});

const searchText = ref('');
const search = (searchText: string) => {
  data.value = searchTreeTable(searchText, ['title', 'id', 'rule'] as const, menuDataCopy);
  nextTick(() => menuRef.value?.vxeTableRef?.setAllTreeExpand(true));
};
let menuDataCopy = [] as SystemMenuTreeAll;
const getMenu = async () => {
  await runAsync();
  menuDataCopy = cloneDeep(data.value!);
  search(searchText.value);
};

const { runAsync: delRun, loading: delLoading } = delSystemMenuApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await getMenu();
};
const showAddOrUp = (id?: string) => {
  open({
    id,
    onSuccess: async () => {
      await getMenu();
    },
  });
};
const showInfo = (id?: string) => {
  openInfo({ id });
};
await Promise.all([loadRes, getMenu()]);
</script>
<style lang="scss" scoped>
.menu {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .table-menu {
    height: 100%;
    display: flex;
    flex-direction: column;
    :deep(.me-vxe-body) {
      flex-grow: 1;
    }
  }
}
</style>
