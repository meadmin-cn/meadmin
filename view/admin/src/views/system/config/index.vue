<template>
  <page>
    <div class="config-card">
      <div class="tabs-header">
        <el-tabs v-model="activeTab" class="config-tabs" @tab-change="handleTabChange">
          <template v-for="group in groups" :key="group.id">
            <el-tab-pane v-if="$permission(group.groupCode === 'dict' ? 'system_config_dict_list' : 'system_config_list')" :name="group.id">
              <template #label>
                <span class="tab-label"
                  >{{ group.groupName }}<el-tag v-if="group.isBuiltin" size="small" type="info">{{ t('内置') }}</el-tag
                  ><el-badge v-if="isDirty(group.id)" is-dot
                /></span>
              </template>
            </el-tab-pane>
          </template>

          <el-tab-pane v-if="$permission('system_config_group_list')" :name="manageTab">
            <template #label>{{ t('配置组管理') }}</template>
          </el-tab-pane>
        </el-tabs>
        <me-button v-if="activeTab === manageTab && $permission('system_config_group_add')" type="primary" @click="showGroupDialog()"><mel-icon-plus />{{ t('新增配置组') }}</me-button>
      </div>

      <div v-if="activeTab !== manageTab && selectedGroup" :key="activeTab + '-selectedGroup'" class="config-panel">
        <div class="content-header">
          <div class="title-wrap">
            <span>{{ selectedGroup.groupName }}</span>
            <span class="group-code">{{ selectedGroup.groupCode }}</span>
            <el-tag v-if="isCurrentDirty" size="small" type="warning">{{ t('未保存') }}</el-tag>
          </div>
          <div class="toolbar-actions">
            <div v-if="selectedGroup.groupType === 'dict'" class="dict-search" :class="{ 'has-query': dictSearch }">
              <el-input v-model="dictSearch" clearable :placeholder="t('字典标题或字典标识')" :aria-label="t('字典标题或字典标识')" @keyup.enter="reloadDictConfigs" @clear="reloadDictConfigs" />
              <el-button class="dict-search-trigger" text :title="t('搜索')" :aria-label="t('搜索')" @click="reloadDictConfigs"><mel-icon-search /></el-button>
            </div>
            <me-button v-if="selectedGroup.groupType === 'dict' && $permission('system_config_dict_add')" type="primary" @click="showConfigDialogForGroup(selectedGroup)"><mel-icon-plus />{{ t('新增字典') }}</me-button>
          </div>
        </div>
        <div class="config-content-scroll">
          <el-form v-loading="configLoading" label-position="top" class="config-form">
            <template v-if="selectedGroup.groupType === 'dict'">
              <div v-for="item in pagedDictConfigs" :key="item.id" class="config-item dictionary-item">
                <div class="dictionary-actions">
                  <me-button v-if="$permission('system_config_dict_edit')" link type="primary" @click="editDictionary(item)"><mel-icon-edit />{{ t('编辑') }}</me-button>
                  <me-button v-if="!item.isBuiltin && $permission('system_config_dict_del')" link type="danger" @click="deleteDictionary(item)"><mel-icon-delete />{{ t('删除') }}</me-button>
                </div>
                <div class="config-item-head">
                  <div>
                    <div class="config-title">{{ item.variableTitle }}</div>
                    <div class="config-meta">
                      <code>{{ item.variableCode }}</code
                      ><span>{{ item.description }}</span>
                    </div>
                  </div>
                </div>
                <div class="editor-table">
                  <div class="editor-row editor-head">
                    <span>{{ t('标题') }}</span
                    ><span>{{ t('值') }}</span
                    ><span>{{ t('排序值') }}</span
                    ><span>{{ t('状态') }}</span
                    ><span>{{ t('操作') }}</span>
                  </div>
                  <div v-for="(row, index) in sortedEditorRows(item)" :key="row.key" class="editor-row">
                    <el-input v-model="row.key" :placeholder="t('标题')" />
                    <el-input v-model="row.label" :placeholder="t('值')" />
                    <el-input-number v-model="row.sort" :min="0" :precision="0" controls-position="right" />
                    <el-select v-model="row.status"><el-option v-for="status in dict.configStatus" :key="status.value" :value="status.value" :label="status.label" /></el-select>
                    <el-button type="danger" link :title="t('删除')" @click="removeEditorRow(item, index)"><mel-icon-delete /></el-button>
                  </div>
                  <div class="editor-actions">
                    <me-button link type="primary" @click="addDictRow(item)"><mel-icon-plus />{{ t('新增选项') }}</me-button>
                    <me-button v-if="$permission('system_config_value_edit')" type="primary" :loading="savingDictId === item.id" @click="saveDictItem(item)">{{ t('保存') }}</me-button>
                  </div>
                </div>
              </div>
              <el-empty v-if="!pagedDictConfigs.length" :description="t('暂无配置项')" />
            </template>
            <template v-else>
              <div v-for="item in configs" :key="item.id" class="config-item">
                <div class="config-item-head">
                  <div>
                    <div class="config-title">{{ item.variableTitle }}</div>
                    <div class="config-meta">
                      <code>{{ item.variableCode }}</code
                      ><span>{{ variableTypeLabel(item.variableType) }}</span>
                    </div>
                    <div v-if="item.description" class="config-description">{{ item.description }}</div>
                  </div>
                </div>
                <el-input-number v-if="item.variableType === 'number'" :model-value="typeof item.value === 'number' ? item.value : null" class="config-value" controls-position="right" @update:model-value="(value) => setSimpleValue(item, value)" />
                <el-input v-else-if="['string', 'text', 'textarea', 'multiline'].includes(item.variableType)" :model-value="typeof item.value === 'string' ? item.value : ''" class="config-value" type="textarea" :rows="item.variableType === 'string' ? 1 : item.variableType === 'multiline' ? 6 : 3" @update:model-value="(value) => setSimpleValue(item, value)" />
                <div v-else-if="item.variableType === 'array'" class="editor-table">
                  <div class="editor-row editor-head">
                    <span>{{ t('值') }}</span
                    ><span>{{ t('排序值') }}</span
                    ><span>{{ t('操作') }}</span>
                  </div>
                  <div v-for="(row, index) in sortedEditorRows(item)" :key="row.key" class="editor-row">
                    <el-input v-model="row.value" />
                    <el-input-number v-model="row.sort" :min="0" :precision="0" controls-position="right" />
                    <el-button type="danger" link :title="t('删除')" @click="removeEditorRow(item, index)"><mel-icon-delete /></el-button>
                  </div>
                  <me-button link type="primary" @click="addArrayRow(item)"><mel-icon-plus />{{ t('新增项') }}</me-button>
                </div>
                <div v-else-if="item.variableType === 'keyvalue'" class="editor-table">
                  <div class="editor-row editor-head">
                    <span>{{ t('标题') }}</span
                    ><span>{{ t('值') }}</span
                    ><span>{{ t('排序值') }}</span
                    ><span>{{ t('操作') }}</span>
                  </div>
                  <div v-for="(row, index) in sortedEditorRows(item)" :key="row.key" class="editor-row">
                    <el-input v-model="row.key" />
                    <el-input v-model="row.value" />
                    <el-input-number v-model="row.sort" :min="0" :precision="0" controls-position="right" />
                    <el-button type="danger" link :title="t('删除')" @click="removeEditorRow(item, index)"><mel-icon-delete /></el-button>
                  </div>
                  <me-button link type="primary" @click="addKeyValueRow(item)"><mel-icon-plus />{{ t('新增键值对') }}</me-button>
                </div>
                <div v-else class="config-value object-value">{{ JSON.stringify(item.value) }}</div>
              </div>
              <el-empty v-if="!configs.length" :description="t('暂无配置项')" />
            </template>
          </el-form>
        </div>
        <el-pagination v-if="selectedGroup.groupType === 'dict'" v-model:current-page="dictPage" v-model:page-size="pageSize" class="dict-pagination" :page-sizes="[10, 20, 50, 100]" :total="dictTotal" layout="sizes, prev, pager, next, jumper, ->, total" @size-change="reloadDictConfigs" @current-change="() => selectedGroup && loadContent(selectedGroup)" />
        <div v-if="configs.length && selectedGroup.groupType !== 'dict'" class="form-footer">
          <me-button v-if="$permission('system_config_value_edit')" @click="resetConfigs">{{ t('重置') }}</me-button>
          <me-button v-if="$permission('system_config_value_edit')" type="primary" :loading="savingConfig" @click="saveConfigs">{{ t('确定') }}</me-button>
        </div>
      </div>
      <el-empty v-else-if="activeTab !== manageTab" :description="t('暂无配置分组')" />

      <div v-if="activeTab === manageTab" :key="activeTab + '-manageTab'" class="config-manage">
        <aside class="group-list">
          <div class="group-list-header">
            <span>{{ t('所有配置组') }}</span
            ><me-button v-if="$permission('system_config_group_add')" link type="primary" @click="showGroupDialog()"><mel-icon-plus /></me-button>
          </div>
          <div v-for="(group, index) in groups" :key="group.id" class="group-item" :class="{ active: group.id === managementGroupId }" @click="selectManagementGroup(group.id)">
            <div class="group-name-wrap">
              <div class="group-name">{{ group.groupName }}</div>
              <div class="group-meta">
                <code>{{ group.groupCode }}</code
                ><el-tag size="small" :type="group.isBuiltin ? 'info' : 'success'">{{ t(group.isBuiltin ? '内置' : '自定义') }}</el-tag>
              </div>
            </div>
            <div v-if="!group.isBuiltin" class="group-actions" @click.stop>
              <me-button v-if="$permission('system_config_group_edit')" link :title="t('编辑')" @click="showGroupDialog(group.id)"><mel-icon-edit /></me-button>
              <me-button v-if="$permission('system_config_group_del')" type="danger" link :title="t('删除')" @click="deleteGroup(group)"><mel-icon-delete /></me-button>
              <me-button v-if="$permission('system_config_group_edit')" link :disabled="!canMoveGroup(index, -1)" :title="t('上移')" @click="moveGroup(group, -1)"><mel-icon-arrow-up /></me-button>
              <me-button v-if="$permission('system_config_group_edit')" link :disabled="!canMoveGroup(index, 1)" :title="t('下移')" @click="moveGroup(group, 1)"><mel-icon-arrow-down /></me-button>
            </div>
          </div>
        </aside>
        <section class="field-list">
          <div v-if="managementGroup" class="field-header">
            <div>
              <span class="field-title">{{ managementGroup.groupName }}</span
              ><span class="field-subtitle">{{ managementGroup.groupCode }}</span>
            </div>
            <div class="field-header-actions">
              <me-button v-if="!managementGroup.isBuiltin && $permission('system_config_group_edit')" @click="showGroupDialog(managementGroup.id)"><mel-icon-edit />{{ t('编辑组') }}</me-button>
              <me-button v-if="!managementGroup.isBuiltin && $permission('system_config_group_del')" type="danger" @click="deleteGroup(managementGroup)"><mel-icon-delete />{{ t('删除组') }}</me-button>
              <me-button v-if="!managementGroup.isBuiltin && $permission('system_config_field_add')" type="primary" @click="showConfigDialog()"><mel-icon-plus />{{ t('新增字段') }}</me-button>
            </div>
          </div>
          <div v-if="managementGroup" v-loading="fieldLoading" class="field-table-wrap">
            <el-table :data="managementConfigs" stripe>
              <el-table-column prop="variableTitle" :label="t('变量标题')" min-width="150" />
              <el-table-column prop="variableCode" :label="t('变量标识')" min-width="180"
                ><template #default="{ row }"
                  ><code>{{ row.variableCode }}</code></template
                ></el-table-column
              >
              <el-table-column :label="t('变量类型')" width="120"
                ><template #default="{ row }"
                  ><el-tag size="small">{{ variableTypeLabel(row.variableType) }}</el-tag></template
                ></el-table-column
              >
              <el-table-column :label="t('必填项')" width="90"
                ><template #default="{ row }">{{ row.isRequired ? t('是') : t('否') }}</template></el-table-column
              >
              <el-table-column :label="t('状态')" width="90"
                ><template #default="{ row }"
                  ><el-tag size="small" :type="row.status === 1 ? 'success' : 'info'">{{ statusLabel(row.status) }}</el-tag></template
                ></el-table-column
              >
              <el-table-column :label="t('操作')" width="120" fixed="right"
                ><template #default="{ row }"
                  ><me-button v-if="$permission('system_config_field_edit')" link :title="t('编辑')" @click="showConfigDialog(row.id)"><mel-icon-edit /></me-button
                  ><el-popconfirm v-if="!row.isBuiltin && $permission('system_config_field_del')" :title="t('确认删除配置字段', { name: row.variableTitle })" @confirm="deleteConfig(row.id)"
                    ><template #reference
                      ><me-button type="danger" link :title="t('删除')"><mel-icon-delete /></me-button></template></el-popconfirm></template
              ></el-table-column>
            </el-table>
            <el-empty v-if="!managementConfigs.length" :description="t('该配置组暂无字段')" />
          </div>
          <el-empty v-else :description="t('请在左侧选择一个配置组')" />
        </section>
      </div>
    </div>
  </page>
</template>

<script setup lang="ts" name="SystemConfig">
import type { SystemConfigGroupInfo, SystemConfigInfo, SystemConfigOption, SystemConfigValue, SystemConfigVariableType } from '@/api/system/config.js';
import { delSystemConfigApi, delSystemConfigGroupApi, delSystemDictApi, saveSystemConfigValuesApi, sortSystemConfigGroupApi, systemConfigDictListApi, systemConfigGroupListApi, systemConfigListApi, systemConfigValuesApi } from '@/api/system/config.js';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { ElMessageBox } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import ConfigDialog from './components/configDialog.vue';
import GroupDialog from './components/groupDialog.vue';
import { getDict } from './dict.js';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemConfig']);
const dict = getDict(t);
const manageTab = 'manage';
const activeTab = ref('');
const previousTab = ref('');
const groups = ref<SystemConfigGroupInfo[]>([]);
const configs = ref<SystemConfigInfo[]>([]);
const configLoading = ref(false);
const savingConfig = ref(false);
const savingDictId = ref('');
const fieldLoading = ref(false);
const managementGroupId = ref('');
const managementConfigs = ref<SystemConfigInfo[]>([]);
const dictPage = ref(1);
const dictSearch = ref('');
const pageSize = ref(10);
const dictTotal = ref(0);
const pagedDictConfigs = computed(() => configs.value);
const valueSnapshots = reactive<Record<string, string>>({});
const editors = reactive<Record<string, EditorRow[]>>({});
const selectedGroup = computed(() => groups.value.find((group) => group.id === activeTab.value));
const managementGroup = computed(() => groups.value.find((group) => group.id === managementGroupId.value));
const isCurrentDirty = computed(() => (selectedGroup.value ? isDirty(selectedGroup.value.id) : false));
const { runAsync: getGroups } = systemConfigGroupListApi();
const { runAsync: getConfigs } = systemConfigListApi();
const { runAsync: getDictConfigs } = systemConfigDictListApi();
const { runAsync: getValues } = systemConfigValuesApi();
const { runAsync: saveValues } = saveSystemConfigValuesApi();
const { runAsync: sortGroups } = sortSystemConfigGroupApi();
const { runAsync: deleteGroupRequest } = delSystemConfigGroupApi();
const { runAsync: deleteConfigRequest } = delSystemConfigApi();
const { runAsync: deleteDictRequest } = delSystemDictApi();
const { open: openGroup } = useActionModel(GroupDialog);
const { open: openConfig } = useActionModel(ConfigDialog);
type EditorRow = { key: string; label: string; value: string; sort: number; status: number };

const variableTypeLabel = (type: SystemConfigVariableType) => dict.variableType.find((item) => item.value === type)?.label ?? type;
const statusLabel = (status: number) => dict.configStatus.find((item) => item.value === status)?.label ?? String(status);
const snapshot = (items: SystemConfigInfo[]) =>
  JSON.stringify(
    items.map((item) => ({
      variableCode: item.variableCode,
      value: item.variableType === 'array' || item.variableType === 'keyvalue' ? editorValue(item) : item.value,
      options: item.variableType === 'dict' ? editorOptions(item) : item.options,
    })),
  );
const isDirty = (groupId: string) => groupId === activeTab.value && valueSnapshots[groupId] !== undefined && valueSnapshots[groupId] !== snapshot(configs.value);
const currentContentDirty = () => previousTab.value !== manageTab && valueSnapshots[previousTab.value] !== undefined && valueSnapshots[previousTab.value] !== snapshot(configs.value);

const syncEditor = (item: SystemConfigInfo) => {
  if (item.variableType === 'array' && Array.isArray(item.value)) {
    editors[item.id] = item.value.map((value, index) => ({ key: `${item.id}-${index}`, label: '', value: String(value), sort: index + 1, status: 1 }));
  } else if (item.variableType === 'dict' || selectedGroup.value?.groupType === 'dict') {
    // 字典配置项本身通常保存当前选中值，选项列表才是编辑器的数据源。
    editors[item.id] = (item.options ?? []).map((option, index) => ({
      key: String(option.value),
      label: option.label,
      value: String(option.value),
      sort: option.sort ?? index + 1,
      status: option.status ?? 1,
    }));
  } else if (item.variableType === 'keyvalue' && item.value && typeof item.value === 'object' && !Array.isArray(item.value)) {
    editors[item.id] = Object.entries(item.value).map(([key, value], index) => ({ key, label: '', value: String(value), sort: index + 1, status: 1 }));
  } else {
    editors[item.id] = [];
  }
};
const syncEditors = () => configs.value.forEach(syncEditor);
const editorRows = (item: SystemConfigInfo) => editors[item.id] ?? [];
const sortedEditorRows = (item: SystemConfigInfo) => [...editorRows(item)].sort((a, b) => a.sort - b.sort);
const setSimpleValue = (item: SystemConfigInfo, value: string | number | null | undefined) => {
  item.value = value ?? null;
};
const addArrayRow = (item: SystemConfigInfo) => editorRows(item).push({ key: `${item.id}-${Date.now()}`, label: '', value: '', sort: editorRows(item).length + 1, status: 1 });
const addKeyValueRow = (item: SystemConfigInfo) => editorRows(item).push({ key: '', label: '', value: '', sort: editorRows(item).length + 1, status: 1 });
const addDictRow = (item: SystemConfigInfo) => editorRows(item).push({ key: '', label: '', value: '', sort: editorRows(item).length + 1, status: 1 });
const removeEditorRow = (item: SystemConfigInfo, index: number) => editorRows(item).splice(index, 1);
const editorValue = (item: SystemConfigInfo): SystemConfigValue => {
  const rows = [...editorRows(item)].sort((a, b) => a.sort - b.sort);
  if (item.variableType === 'array') return rows.map((row) => row.value);
  return Object.fromEntries(rows.filter((row) => row.key).map((row) => [row.key, row.value]));
};
const editorOptions = (item: SystemConfigInfo): SystemConfigOption[] => [...editorRows(item)].sort((a, b) => a.sort - b.sort).map((row) => ({ label: row.label || row.key, value: row.key || row.value, sort: row.sort, status: row.status }));

const reloadDictConfigs = async () => {
  dictPage.value = 1;
  if (selectedGroup.value?.groupType === 'dict') await loadContent(selectedGroup.value);
};
const loadContent = async (group: SystemConfigGroupInfo) => {
  configLoading.value = true;
  configs.value = [];
  try {
    if (group.groupType !== 'dict') dictPage.value = 1;
    if (group.groupType !== 'dict') dictSearch.value = '';
    if (group.groupType === 'dict') {
      const result = await getDictConfigs({ page: dictPage.value, pageSize: pageSize.value, groupId: group.id, keyword: dictSearch.value || undefined });
      dictTotal.value = result.total;
      configs.value = result.list.map((item) => ({ ...item, value: item.variableType === 'number' && typeof item.value === 'string' ? JSON.parse(item.value) : item.value }));
    } else {
      configs.value = await getValues(group.groupCode);
    }
    syncEditors();
    valueSnapshots[group.id] = snapshot(configs.value);
  } finally {
    configLoading.value = false;
  }
};
const handleTabChange = async (name: string | number) => {
  const next = String(name);
  const current = groups.value.find((group) => group.id === previousTab.value);
  if (current && currentContentDirty()) {
    try {
      await ElMessageBox.confirm(t('当前有未保存的修改，是否保存？'), t('未保存的修改'), { distinguishCancelAndClose: true, confirmButtonText: t('保存'), cancelButtonText: t('不保存'), type: 'warning' });
      await saveGroupValues(current);
    } catch (error) {
      if (error === 'cancel') {
        resetGroupValues(current);
      } else {
        activeTab.value = previousTab.value;
        return;
      }
    }
  }
  previousTab.value = next;
  if (next !== manageTab) {
    const group = groups.value.find((item) => item.id === next);
    if (group) await loadContent(group);
  }
};
const loadGroups = async () => {
  const result = await getGroups({ page: 1, pageSize: 100 });
  groups.value = result.list;
  const current = groups.value.find((group) => group.id === activeTab.value) ?? groups.value[0];
  if (current) {
    activeTab.value = current.id;
    previousTab.value = current.id;
    await loadContent(current);
  }
  if (!managementGroupId.value && groups.value.length) await selectManagementGroup(groups.value[0].id);
};
const resetGroupValues = async (group: SystemConfigGroupInfo) => {
  if (group.id !== selectedGroup.value?.id) return;
  await loadContent(group);
};
const resetConfigs = async () => {
  if (selectedGroup.value) await resetGroupValues(selectedGroup.value);
};
const saveGroupValues = async (group: SystemConfigGroupInfo) => {
  savingConfig.value = true;
  try {
    if (group.groupType === 'dict') {
      for (const item of configs.value) {
        await saveValues(group.groupCode, { values: [{ variableCode: item.variableCode, value: editorValue(item), options: editorOptions(item) }] });
      }
    } else {
      await saveValues(group.groupCode, { values: configs.value.map((item) => ({ variableCode: item.variableCode, value: item.variableType === 'array' || item.variableType === 'keyvalue' ? editorValue(item) : item.value, options: item.variableType === 'dict' ? editorOptions(item) : undefined })) });
    }
    await loadContent(group);
  } finally {
    savingConfig.value = false;
  }
};
const saveConfigs = async () => {
  if (selectedGroup.value) await saveGroupValues(selectedGroup.value);
};
const saveDictItem = async (item: SystemConfigInfo) => {
  if (!selectedGroup.value) return;
  savingDictId.value = item.id;
  try {
    await saveValues(selectedGroup.value.groupCode, { values: [{ variableCode: item.variableCode, value: item.value, options: editorOptions(item) }] });
    await loadContent(selectedGroup.value);
  } finally {
    savingDictId.value = '';
  }
};
const selectManagementGroup = async (id: string) => {
  managementGroupId.value = id;
  fieldLoading.value = true;
  const result = await getConfigs({ page: 1, pageSize: 100, groupId: id });
  managementConfigs.value = result.list;
  fieldLoading.value = false;
};
const showGroupDialog = (id?: string) => openGroup({ id, onSuccess: loadGroups });
const editDictionary = (item?: SystemConfigInfo) => {
  const group = selectedGroup.value;
  if (!group) return;
  openConfig({ id: item?.id, groupId: group.id, groupType: group.groupType, groups: groups.value, onSuccess: () => loadContent(group) });
};
const deleteDictionary = async (item: SystemConfigInfo) => {
  await ElMessageBox.confirm(t('确认删除配置字段', { name: item.variableTitle }), t('确认删除'), { type: 'warning' });
  await deleteDictRequest(item.id);
  if (configs.value.length === 1 && dictPage.value > 1) dictPage.value--;
  if (selectedGroup.value) await loadContent(selectedGroup.value);
};
const showConfigDialogForGroup = (group: SystemConfigGroupInfo) => {
  if (group.groupType === 'dict') editDictionary();
  else {
    managementGroupId.value = group.id;
    showConfigDialog();
  }
};
const showConfigDialog = (id?: string) => {
  if (!managementGroup.value) return;
  openConfig({ id, groupId: managementGroup.value.id, groupType: managementGroup.value.groupType, groups: groups.value, onSuccess: () => selectManagementGroup(managementGroup.value!.id) });
};
const deleteGroup = async (group: SystemConfigGroupInfo) => {
  await ElMessageBox.confirm(t('确认删除配置组', { name: group.groupName }), t('确认删除'), { confirmButtonText: t('确认删除'), cancelButtonText: t('取消'), type: 'warning' });
  await deleteGroupRequest(group.id);
  if (managementGroupId.value === group.id) managementGroupId.value = '';
  await loadGroups();
};
const deleteConfig = async (id: string) => {
  const item = managementConfigs.value.find((config) => config.id === id);
  if (!item) return;
  await deleteConfigRequest(id);
  await selectManagementGroup(item.groupId);
};
const customGroups = computed(() => groups.value.filter((group) => !group.isBuiltin));
const canMoveGroup = (index: number, direction: number) => {
  const group = groups.value[index];
  if (!group || group.isBuiltin) return false;
  const customIndex = customGroups.value.findIndex((item) => item.id === group.id);
  return customIndex + direction >= 0 && customIndex + direction < customGroups.value.length;
};
const moveGroup = async (group: SystemConfigGroupInfo, direction: number) => {
  const customIndex = customGroups.value.findIndex((item) => item.id === group.id);
  const target = customGroups.value[customIndex + direction];
  if (!target) return;
  await sortGroups({ groupId: group.id, targetGroupId: target.id });
  await loadGroups();
};

await loadRes;
await loadGroups();
</script>

<style lang="scss" scoped>
.dict-search {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  height: 32px;
}
.dict-search > .el-input {
  width: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    width 0.2s ease,
    opacity 0.2s ease;
}
.dict-search:hover > .el-input,
.dict-search:focus-within > .el-input,
.dict-search.has-query > .el-input {
  width: 200px;
  opacity: 1;
}
.dict-search-trigger {
  width: 32px;
  height: 32px;
  padding: 0;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .dict-search:hover > .el-input,
  .dict-search:focus-within > .el-input,
  .dict-search.has-query > .el-input {
    width: 120px;
  }
}
.dictionary-actions {
  float: right;
  display: flex;
  gap: 8px;
}
.dict-pagination {
  flex: 0 0 auto;
  width: 100%;
  margin: 0 !important;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.config-card {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 18px 20px 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}
/* 包裹分组内容的容器：接替 .config-card 的纵向 flex 布局，
   保证内部滚动区 flex:1 生效、分页栏与底部按钮始终固定可见。 */
.config-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.config-content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 12px;
}
.form-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 0 0;
  background: var(--el-bg-color);
}
.tabs-header,
.content-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.config-tabs {
  min-width: 0;
  flex: 1;
  :deep(.el-tabs__header) {
    margin-bottom: 18px;
  }
  :deep(.el-tabs__nav-wrap) {
    overflow-x: auto;
  }
}
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.content-header {
  min-height: 42px;
  margin-bottom: 12px;
}
.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}
.group-code,
.field-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}
.toolbar-actions,
.field-header-actions,
.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.config-form {
  max-width: 960px;
}
.config-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.config-item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.config-title,
.field-title {
  font-weight: 600;
}
.config-meta {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.config-description {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.config-value {
  width: 100%;
}
.object-value {
  padding: 10px 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  word-break: break-all;
}
.dictionary-item {
  max-width: 960px;
}
.editor-table {
  width: 100%;
}
.editor-row {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(120px, 1fr) 110px 110px 44px;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.editor-row > .el-input-number,
.editor-row > .el-select {
  width: 100%;
}
.editor-head {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.config-manage {
  display: flex;
  min-height: 520px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.group-list {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}
.group-list-header,
.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  font-weight: 600;
}
.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-left: 3px solid transparent;
  cursor: pointer;
}
.group-item:hover {
  background: var(--el-fill-color);
}
.group-item.active {
  background: var(--el-color-primary-light-9);
  border-left-color: var(--el-color-primary);
}
.group-name-wrap {
  min-width: 0;
  flex: 1;
}
.group-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
}
.group-actions {
  display: flex;
  align-items: center;
  gap: 0;
}
.field-list {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.field-header {
  flex-shrink: 0;
}
.field-subtitle {
  margin-left: 8px;
  font-family: Consolas, Monaco, monospace;
}
.field-table-wrap {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
.el-pagination {
  justify-content: center;
  margin: 20px 0;
}
@media (max-width: 768px) {
  .tabs-header,
  .content-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .config-tabs {
    width: 100%;
  }
  .config-manage {
    flex-direction: column;
  }
  .group-list {
    width: 100%;
    max-height: 300px;
    border-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  .field-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .field-header-actions {
    flex-wrap: wrap;
  }
  .editor-row {
    grid-template-columns: 1fr 1fr 90px 90px 36px;
  }
}
</style>
