<template>
  <div class="menu">
    <me-vxe-table
      ref="menuRef"
      v-model:quick-search="searchText"
      :data="data ?? []"
      :loading="loading"
      :custom-column="false"
      :tree-config="{ expandAll: true, line: true, reserve: true }"
      :checkbox-config="{ labelField: 'id' }"
      :row-config="{ keyField: 'id', useKey: true }"
      :column-config="{ useKey: true }"
      align="center"
      border
      me-class="table-menu"
      height="auto"
      show-overflow
      :quick-search-placeholder="t('输入菜单名称快捷查询')"
      @refresh="getMenu"
      @quick-search="search"
      @add="showAddOrUp()"
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
      <vxe-column title="操作">
        <template #default="{ row }">
          <el-button  @click="showAddOrUp(row.id)"><mel-icon-edit /></el-button>
          <el-popconfirm :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
            <template #reference>
              <el-button :key="row.id" :loading="delLoading && delId === row.id" type="danger">
                <mel-icon-delete />
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </vxe-column>
      <template #toolsButton>
        <el-button
          type="success"
          @click="
            emit(
              'subMenus',
              menuRef!.vxeTableRef!.getCheckboxRecords(true).map((item) => item.id),
            )
          "
          >保存</el-button>
      </template>
    </me-vxe-table>
  </div>
</template>
<script setup lang="ts" name="Menu">
import { SystemMenuListParam, delSystemMenuApi, SystemMenuInfo, systemMenuTreeAllApi, SystemMenuTreeAll } from '@/api/system/menu';
import { useLocalesI18n } from '@/locales/i18n';
import AddOrUp from './components/addOrUp.vue';
import { useActionModel } from '@/hooks/index.js';
import { formatterStr, searchTreeTable } from '@/utils/helper.js';
import { VxeColumnPropTypes } from 'vxe-table';
import { cloneDeep } from 'lodash-es';
let { t } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemMenu']);
const menuRef = ref<MeVxeTableInstance>();
const dict = {
  menuType: [
    { value: 1, label: t('目录') },
    { value: 2, label: t('菜单') },
    { value: 3, label: t('按钮') },
  ],
  status: [
    { value: 1, label: t('启用') },
    { value: 0, label: t('禁用') },
  ],
  isLink: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  hideMenu: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  cache: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  affix: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  alwaysShow: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  breadcrumb: [
    { value: 1, label: t('展示') },
    { value: 0, label: t('不展示') },
  ],
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemMenuInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, { value: string | number; label: string }[]>)[column.field]?.find((item) => item.value == cellValue)?.label });
};
const { open } = useActionModel(AddOrUp);

const { checkedMenuIds =  [] } = defineProps<{checkedMenuIds:string[]}>()
const emit = defineEmits<{
  subMenus: [menuIds: string[]]//提交菜单选中
}>()
const params = reactive(new SystemMenuListParam());
const { loading, data, runAsync } = systemMenuTreeAllApi();
onMounted(()=>{
watch(//设置选中值
  () => [checkedMenuIds, data.value],
  async () => {
    if (!data.value?.length) {
      return;
    }
    await menuRef.value!.vxeTableRef!.clearCheckboxRow();
    menuRef.value!.vxeTableRef!.setCheckboxRow(
      checkedMenuIds.reduce((previousValue, currentValue) => {
        const row = menuRef.value!.vxeTableRef!.getRowById(currentValue);
        if (!row.children?.length) {
          previousValue.push(row);
        }
        return previousValue;
      }, [] as any[]),
      true,
    );
  },
  {immediate:true}
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

await getMenu();
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
