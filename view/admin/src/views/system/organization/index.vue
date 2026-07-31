<template>
<div class="organization-admin">
<el-scrollbar always view-class="body">
  <div class="index-role">
    <OrgListTree ref="role" @current-change="setChecked"></OrgListTree>
  </div>
  <div class="index-menu">
      <Menu :checked-menu-ids="checkedAdminIds" @sub-menus="role!.setRoleMenu($event)"></Menu>
  </div>
</el-scrollbar>
</div>
</template>

<script setup lang="ts" name="SystemOrganization">
  import OrgListTree from './components/listTree.vue';
const checkedOrgId = shallowRef(null as string|null);
const setChecked = (orgId: string|null) => {
  checkedOrgId.value = orgId;
};
</script>
<style lang="scss" scoped>
.organization-admin {
  z-index: 1;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;

  :deep(.body) {
    display: flex;
    flex-wrap: wrap;
    min-height: 100%;
    padding: calc($page-padding - 10px);

    .index-role {
      flex: 1;
      margin: 10px;
      min-width: 300px;
      min-height: 600px;
      position: relative;
    }

    .index-menu {
      flex: 3;
      margin: 10px;
      min-height: 600px;
      position: relative;
    }

    .keyword-lighten {
      background-color: var(--el-color-warning-light-3);
    }
  }
}
</style>