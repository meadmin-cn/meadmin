<template>
  <div class="role-permissions">
    <el-scrollbar always view-class="body">
      <Role ref="group" class="group" @current-change="checkedMenuIds = $event"></Role>
      <Menu class="menu" :checked-menu-ids="checkedMenuIds" @sub-menus="role!.setRoleMenu($event)"></Menu>
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup name="RulePermissions">
import Role from './components/role/index.vue';
import Menu from './components/menu/index.vue';
const role = ref<InstanceType<typeof Role>>();
const checkedMenuIds = shallowRef([] as string[]);
</script>
<style lang="scss" scoped>
.role-permissions {
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
    .group {
      flex: 1;
      margin: 10px;
      min-width: 300px;
      min-height: 600px;
    }

    .menu {
      flex: 3;
      margin: 10px;
      min-height: 600px;
    }

    .keyword-lighten {
      background-color: var(--el-color-warning-light-3);
    }
  }
}
</style>
