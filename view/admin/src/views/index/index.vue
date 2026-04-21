<template>
  <div class="dashboard">
    <total-panel></total-panel>
    <charts></charts>
  </div>
</template>

<script setup lang="ts">
import Charts from './components/charts.vue';
import TotalPanel from './components/totalPanel.vue';
</script>
<style lang="scss" scoped>
.dashboard {
}
</style>
