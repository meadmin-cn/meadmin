<template>
  <div class="nest-demo">
    <!-- 面包屑：由 matched 路由链自动生成，体现层级深度 -->
    <div class="crumbs">
      <template v-for="(m, i) in route.matched" :key="m.path">
        <span v-if="i > 0" class="sep">/</span>
        <span class="crumb" :class="{ last: i === route.matched.length - 1 }">{{ m.meta?.title }}</span>
      </template>
    </div>
    <div class="card">
      <h1>{{ route.meta?.title }}</h1>
      <p>这是一个<strong>四层深度导航</strong>测试页。顶部导航的每一级父菜单在当前页面下都会保持选中高亮，悬停可逐级展开子菜单。</p>
      <div class="meta">
        <span
          >当前路径：<code>{{ route.path }}</code></span
        >
        <span
          >菜单层级：<code>{{ route.matched.length }}</code> 级</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="NestedDemo">
const route = useRoute();
</script>

<style lang="scss" scoped>
.nest-demo {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 16px 80px;
}
.crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13.5px;
  color: #6b7280;
  .sep {
    opacity: 0.5;
  }
  .crumb.last {
    color: #2b5cff;
    font-weight: 600;
  }
}
.card {
  padding: 48px 40px;
  background: #fff;
  border: 1px solid #e8ebf2;
  border-radius: 18px;
  box-shadow: 0 12px 32px -18px rgba(24, 36, 88, 0.18);
  text-align: center;
  .card-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    margin: 0 auto 18px;
    color: #2b5cff;
    background: #eef2ff;
    border-radius: 14px;
  }
  h1 {
    margin: 0 0 12px;
    font-size: 26px;
    letter-spacing: -0.02em;
  }
  p {
    margin: 0 auto;
    max-width: 46ch;
    font-size: 15px;
    line-height: 1.8;
    color: #454b5c;
    strong {
      color: #2b5cff;
    }
  }
  .meta {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px 28px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px dashed #e8ebf2;
    font-size: 13.5px;
    color: #6b7280;
    code {
      padding: 2px 8px;
      color: #2b5cff;
      background: #eef2ff;
      border-radius: 6px;
      font-family: Consolas, monospace;
    }
  }
}
</style>
