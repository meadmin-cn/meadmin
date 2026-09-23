<template>
  <div class="cms-header">
    <div class="cms-header-container">
      <router-link to="/aon/cms" class="cms-brand">
        <span class="cms-brand-icon">📰</span>
        <span class="cms-brand-name">内容中心</span>
      </router-link>
      
      <nav class="cms-nav">
        <router-link 
          v-for="cat in categories" 
          :key="cat.id" 
          :to="`/aon/cms?category=${cat.id}`"
          class="cms-nav-item"
          :class="{ active: currentCategory === cat.id }"
        >
          {{ cat.name }}
        </router-link>
      </nav>

      <div class="cms-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <button class="cms-hamburger" @click="mobileOpen = !mobileOpen">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <div class="cms-mobile-menu" :class="{ open: mobileOpen }">
      <router-link 
        v-for="cat in categories" 
        :key="cat.id" 
        :to="`/aon/cms?category=${cat.id}`"
        class="cms-mobile-item"
        @click="mobileOpen = false"
      >
        {{ cat.name }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

const props = defineProps<{
  categories?: any[];
  currentCategory?: string;
}>();

const emit = defineEmits<{
  search: [keyword: string];
}>();

const searchKeyword = ref('');
const mobileOpen = ref(false);

const handleSearch = () => {
  emit('search', searchKeyword.value);
};
</script>

<style lang="scss" scoped>
:root {
  --cms-surface-0: #05070C;
  --cms-surface-1: #0A0D12;
  --cms-surface-2: #0F131C;
  --cms-surface-3: #161D2B;
  --cms-surface-4: #1E2636;
  --cms-accent: #38BDF8;
  --cms-accent-dim: #0EA5E9;
  --cms-text-primary: #E2E8F0;
  --cms-text-secondary: #94A3B8;
  --cms-border: rgba(255, 255, 255, 0.08);
}

.cms-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--cms-surface-2);
  border-bottom: 1px solid var(--cms-border);
  backdrop-filter: blur(12px);
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
}

.cms-header-container {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 40px);
  height: 70px;
}

.cms-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-1px);
  }
}

.cms-brand-icon {
  font-size: 28px;
  line-height: 1;
}

.cms-brand-name {
  font-size: clamp(17px, 2.5vw, 20px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--cms-text-primary);
  white-space: nowrap;
}

.cms-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cms-nav-item {
  position: relative;
  padding: 10px 16px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--cms-text-secondary);
  text-decoration: none;
  border-radius: 999px;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    color: var(--cms-accent);
    background: rgba(56, 189, 248, 0.08);
  }
  
  &.active {
    color: var(--cms-accent);
    background: rgba(56, 189, 248, 0.12);
    font-weight: 600;
  }
}

.cms-search {
  width: clamp(180px, 20vw, 280px);
  
  :deep(.el-input__wrapper) {
    background: var(--cms-surface-3);
    border: 1px solid var(--cms-border);
    border-radius: 999px;
    box-shadow: none;
    transition: all 0.2s;
    
    &:hover {
      border-color: var(--cms-accent-dim);
    }
  }
  
  :deep(.el-input__inner) {
    color: var(--cms-text-primary);
    font-size: 14px;
    
    &::placeholder {
      color: var(--cms-text-secondary);
    }
  }
  
  :deep(.el-icon) {
    color: var(--cms-text-secondary);
  }
}

.cms-hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 42px;
  height: 42px;
  padding: 11px 10px;
  background: var(--cms-surface-3);
  border: 1px solid var(--cms-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--cms-accent);
    background: var(--cms-surface-4);
  }
}

.hamburger-line {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--cms-text-primary);
  border-radius: 2px;
  transition: all 0.2s;
}

.cms-mobile-menu {
  display: none;
  flex-direction: column;
  gap: 4px;
  max-height: 0;
  overflow: hidden;
  padding: 0 clamp(16px, 4vw, 40px);
  background: var(--cms-surface-1);
  border-top: 1px solid var(--cms-border);
  transition: max-height 0.3s, padding 0.3s;
  
  &.open {
    max-height: 500px;
    padding: 16px clamp(16px, 4vw, 40px);
  }
}

.cms-mobile-item {
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--cms-text-secondary);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s;
  
  &:hover {
    color: var(--cms-accent);
    background: var(--cms-surface-3);
  }
}

@media (max-width: 960px) {
  .cms-header-container {
    grid-template-columns: auto 1fr auto;
  }
  
  .cms-nav,
  .cms-search {
    display: none;
  }
  
  .cms-hamburger,
  .cms-mobile-menu {
    display: flex;
  }
}

@media (max-width: 640px) {
  .cms-header-container {
    height: 60px;
    gap: 12px;
  }
  
  .cms-brand-name {
    font-size: 16px;
  }
}
</style>
