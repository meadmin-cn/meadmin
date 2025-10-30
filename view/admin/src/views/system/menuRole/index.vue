<template>
  <div class="role-permissions">
    <el-scrollbar always view-class="body">
      <div class="index-role">
        <Role ref="role" @current-change="setChecked"></Role>
      </div>
      <div class="index-menu">
        <Menu :checked-menu-ids="checkedMenuIds" :is-super="roleIsSuper" @sub-menus="role!.setRoleMenu($event)"></Menu>
      </div>
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup name="RulePermissions">
import Role from './components/role/index.vue';
import Menu from './components/menu/index.vue';
const role = ref<InstanceType<typeof Role>>();
const checkedMenuIds = shallowRef([] as string[]);
const roleIsSuper = ref<0|1>(0);
const setChecked = (menuIds: string[], isSuper: 0 | 1) => {
  checkedMenuIds.value = menuIds;
  roleIsSuper.value = isSuper;
}
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
