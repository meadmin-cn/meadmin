<template>
  <div class="cms-container">
    <main v-loading="loading" class="cms-main">
      <el-alert v-if="failed" title="加载失败" type="error" :closable="false"><el-button @click="load">重试</el-button></el-alert>

      <template v-else-if="detail">
        <div class="detail-container">
          <router-link to="/aon/cms" class="breadcrumb-link">返回内容中心</router-link>
          <article class="detail-article">
            <h1 class="detail-title">{{ detail.title }}</h1>
            <div class="detail-meta">
              <span>{{ formatDate(detail.publishAt) }}</span><span>浏览 {{ detail.views }}</span><span>点赞 {{ detail.likes }}</span><span>评论 {{ detail.comments }}</span>
            </div>
            <img v-if="safeUrl(detail.coverUrl)" class="detail-cover" :src="detail.coverUrl" :alt="detail.title" />
            <p v-if="detail.summary" class="detail-summary">{{ detail.summary }}</p>
            <cms-preview :content="detail.mdContent ?? ''" />
            <div v-if="kind === 'article' && detail.orderEnabled" class="detail-actions"><el-button type="primary" @click="orderDialog = true">创建订单</el-button><span>线下支付，提交后可凭订单号查询处理进度</span></div>
          </article>
          <section v-if="kind === 'article'" class="comments-section">
            <div class="section-header"><h3 class="section-title">评论 {{ comments?.total ?? 0 }}</h3><span class="article-total">友善交流，理性发言</span></div>
            <div v-if="isLoggedIn" class="comment-editor">
              <div class="comment-editor-identity">
                <div class="comment-editor-avatar"><img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" /><span v-else>{{ currentUserName.slice(0, 1) || '我' }}</span></div>
                <strong>{{ currentUserName }}</strong>
              </div>
              <el-input v-model="commentForm.content" type="textarea" :rows="4" placeholder="友善交流，分享你的看法" maxlength="2000" show-word-limit />
              <div class="comment-editor-footer"><span class="comment-tip">评论审核通过后公开展示</span><el-button type="primary" :loading="commentSubmitting" :disabled="!commentForm.content.trim()" @click="submitComment">发表评论</el-button></div>
            </div>
            <div v-else class="comment-login-gate"><div class="comment-login-avatar">访</div><div><strong>登录后参与评论</strong><span>登录后可以发表评论</span></div><el-button type="primary" plain @click="goLogin">登录</el-button></div>
            <div v-if="commentTree.length" class="comment-list"><comment-tree v-for="comment in commentTree" :key="comment.id" :comment="comment" :reply-target-id="replyTarget?.id" :reply-content="replyContent" :submitting="commentSubmitting" @reply="startReply" @report="openReport" @update:reply-content="replyContent = $event" @submit-reply="submitReply" /></div>
            <div v-else class="comment-empty"><strong>还没有评论</strong><span>来发表第一条友善的评论吧</span></div>
          </section>
          <el-dialog v-model="reportDialog" title="举报评论" width="420px"><p class="report-target">举报 {{ reportTarget?.author }} 的评论</p><el-input v-model="reportReason" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请说明举报原因" /><template #footer><el-button @click="reportDialog = false">取消</el-button><el-button type="primary" :loading="reportSubmitting" @click="submitReport">提交举报</el-button></template></el-dialog>
          <el-dialog v-model="orderDialog" title="创建线下订单" width="calc(100% - 32px)" style="max-width: 520px" class="order-dialog"><div class="order-article"><span>下单内容</span><strong>{{ detail.title }}</strong><small>{{ isLoggedIn ? '订单将自动关联当前账号' : '当前为访客下单，可凭订单号和联系电话查询' }}</small></div><el-form label-position="top"><div class="order-form-grid"><el-form-item label="收件人"><el-input v-model="orderForm.contactName" maxlength="80" placeholder="请输入收件人姓名" /></el-form-item><el-form-item label="联系电话"><el-input v-model="orderForm.contactPhone" maxlength="30" placeholder="请输入联系电话" /></el-form-item></div><el-form-item label="收货地址"><el-input v-model="orderForm.shippingAddress" maxlength="500" placeholder="请输入省、市、区及详细地址" /></el-form-item><div class="order-form-grid quantity-row"><el-form-item label="数量"><el-input-number v-model="orderForm.quantity" :min="1" :max="999" controls-position="right" /></el-form-item></div><el-form-item label="订单备注"><el-input v-model="orderForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="选填，可填写规格或其他说明" /></el-form-item></el-form><template #footer><el-button @click="orderDialog = false">取消</el-button><el-button type="primary" :loading="orderSubmitting" @click="submitOrder">提交订单</el-button></template></el-dialog>
        </div>
      </template>

      <template v-else>
        <section class="home-container">
          <el-carousel v-if="slides.length" height="300px" class="hero-carousel">
            <el-carousel-item v-for="slide in slides" :key="slide.id">
              <component :is="safeUrl(slide.link) ? 'a' : 'div'" :href="safeUrl(slide.link)" class="carousel-link">
                <img :src="safeUrl(slide.coverUrl)" :alt="slide.title" class="carousel-image" />
                <div class="carousel-overlay"><div class="carousel-content"><span class="carousel-kicker">精选内容</span><h2>{{ slide.title }}</h2><p v-if="slide.summary">{{ slide.summary }}</p></div></div>
              </component>
            </el-carousel-item>
          </el-carousel>

          <div class="content-layout">
            <section v-if="!failed && (!detail || kind === 'topic')" class="articles-section">
              <section v-if="recommendedArticles.length" class="panel recommended-section">
                <div class="section-header"><h3 class="section-title">栏目推荐</h3><span class="article-total">精选 {{ recommendedArticles.length }} 篇</span></div>
                <div class="recommend-grid">
                  <article v-for="article in recommendedArticles" :key="article.id" class="recommend-card" tabindex="0" @click="handleArticleClick(article)" @keyup.enter="handleArticleClick(article)">
                    <img v-if="safeUrl(article.coverUrl)" :src="article.coverUrl" :alt="article.title" />
                    <div class="recommend-body"><h4>{{ article.title }}</h4><p>{{ article.summary }}</p><div class="article-meta"><span>{{ formatDate(article.publishAt) }}</span><span>浏览 {{ article.views }}</span><span>评论 {{ article.comments }}</span></div></div>
                  </article>
                </div>
              </section>
              <section class="panel list-panel">
                <div class="articles-header">
                  <div class="articles-heading"><h3 class="section-title">文章列表</h3><span class="article-total">共 {{ articles?.total ?? 0 }} 篇</span></div>
                  <div class="filter-bar">
                    <div class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21" /></svg><input v-model="query.keyword" type="search" placeholder="搜索文章标题或摘要" @keyup.enter="search" /><button v-if="query.keyword" class="clear-search" aria-label="清除搜索" @click="query.keyword = ''; search()">×</button><button class="search-submit" @click="search">搜索</button></div>
                    <div class="sort-tabs"><span>排序</span><button v-for="option in sortOptions" :key="option.value" class="sort-tab" :class="{ active: query.sortBy === option.value }" @click="changeSortBy(option.value)">{{ option.label }}</button></div>
                  </div>
                </div>
                <div class="articles-grid"><cms-article-card v-for="item in articles?.list" :key="item.id" :article="item" :tags="articleTags(item)" @click="handleArticleClick" /></div>
                <el-empty v-if="articles && articles.total === 0" description="暂无内容" />
                <el-pagination v-if="articles?.total" v-model:current-page="query.page" :page-size="query.pageSize" :total="articles.total" layout="prev,pager,next" class="pagination" @current-change="fetchArticles" />
              </section>
            </section>
            <aside class="sidebar">
              <section class="sidebar-card order-card"><h3 class="sidebar-title">订单查询</h3><p class="sidebar-hint">提交内容页订单后，可在这里查询处理进度。</p><div class="order-query"><el-input v-model="orderQuery.orderNo" placeholder="订单号" /><el-input v-model="orderQuery.contactPhone" placeholder="手机号" /><el-button @click="queryExistingOrder">查询订单</el-button><p v-if="orderResult">订单 {{ orderResult.orderNo }}：{{ paymentLabel(orderResult.paymentStatus) }}，{{ statusLabel(orderResult.status) }}</p></div></section><section class="sidebar-card filter-card"><h3 class="sidebar-title">筛选内容</h3><el-tree-select v-model="query.categoryId" :data="categoryOptions" node-key="id" :props="{ label: 'title', disabled: 'disabled' }" placeholder="选择末级栏目" check-strictly clearable class="filter-select" @change="search" /><el-select v-model="query.tagId" clearable placeholder="全部标签" class="filter-select" @change="search"><el-option v-for="tag in navigation?.tags" :key="tag.id" :value="tag.id" :label="tag.title" /></el-select></section>
              <section class="sidebar-card"><div class="section-header"><h3 class="sidebar-title">热门排行</h3><button class="text-action" @click="changeSortBy('views')">更多</button></div><router-link v-for="(article, index) in topArticles.slice(0, 6)" :key="article.id" class="rank-item" :to="`/aon/cms/article/${article.slug}`"><span class="rank-number" :class="{ top: index < 3 }">{{ index + 1 }}</span><span class="rank-copy"><strong>{{ article.title }}</strong><small>浏览 {{ article.views }}</small></span></router-link></section>
              <section v-if="topCategories.length" class="sidebar-card"><h3 class="sidebar-title">栏目导航</h3><button v-for="cat in topCategories" :key="cat.id" class="category-item" @click="filterByCategory(cat.id)"><span>{{ cat.title }}</span><span>进入</span></button></section>
              <section v-if="navigation?.tags?.length" class="sidebar-card"><h3 class="sidebar-title">热门标签</h3><div class="tag-cloud"><button v-for="tag in navigation.tags.slice(0, 14)" :key="tag.id" :class="{ active: query.tagId === tag.id }" @click="filterByTag(tag.id)">{{ tag.title }}</button></div></section>
              <section v-if="galleryArticles.length" class="sidebar-card gallery-sidebar"><h3 class="sidebar-title">图集精选</h3><button v-for="article in galleryArticles.slice(0, 3)" :key="article.id" class="gallery-side-item" @click="handleArticleClick(article)"><img v-if="safeUrl(article.coverUrl)" :src="article.coverUrl" :alt="article.title" /><span>{{ article.title }}</span></button></section>
            </aside>
          </div>
        </section>

      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { PageEnum } from '@/dict/pageEnum';
import { useUserStore } from '@/store';
import type { CmsComment, CmsContent, CmsOption, CmsQuery, CmsOrder } from '../api/cms';
import { articlesApi, blocksApi, commentsApi, createCommentApi, createOrderApi, detailApi, navigationApi, queryOrderApi, reportCommentApi } from '../api/cms';
import CmsArticleCard from '../components/cmsArticleCard.vue';
import CommentTree from './components/commentTree.vue';
import CmsPreview from '../components/cmsPreview.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => Boolean(userStore.token && userStore.user.id));
const currentUserName = computed(() => userStore.user.nickname?.trim() || userStore.user.username || '我');
const currentUserAvatar = computed(() => userStore.user.avatar?.url || '');
const { runAsync: getArticles, data: articles } = articlesApi();
const { runAsync: getRecommendedArticles, data: recommendedResult } = articlesApi();
const { runAsync: getDetail } = detailApi();
const { runAsync: getNavigation, data: navigation } = navigationApi();
const { runAsync: getBlocks, data: blocks } = blocksApi();
const { runAsync: getComments, data: comments } = commentsApi();
type CommentNode = CmsComment & { children: CommentNode[] };
const commentTree = computed(() => {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  for (const item of comments.value?.list ?? []) nodes.set(item.id, { ...item, children: [] });
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) nodes.get(node.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
});
const query = reactive<CmsQuery>({ page: 1, pageSize: 12, keyword: '', sortBy: 'latest' });
const orderForm = reactive({ contactName: '', contactPhone: '', shippingAddress: '', quantity: 1, remark: '' });
const orderQuery = reactive({ orderNo: '', contactPhone: '' });
const orderResult = ref<CmsOrder>();
const orderSubmitting = ref(false);
const orderDialog = ref(false);
const commentForm = reactive({ content: '' });
const replyTarget = ref<CmsComment>();
const replyContent = ref('');
const commentSubmitting = ref(false);
const reportDialog = ref(false);
const reportReason = ref('');
const reportTarget = ref<CmsComment>();
const reportSubmitting = ref(false);
const { runAsync: createComment } = createCommentApi();
const { runAsync: reportComment } = reportCommentApi();
const { runAsync: createOrder } = createOrderApi();
const { runAsync: queryOrder } = queryOrderApi();
const detail = ref<CmsContent>();
const loading = ref(false);
const failed = ref(false);
const commentPage = ref(1);
const sortOptions: Array<{ label: string; value: NonNullable<CmsQuery['sortBy']> }> = [
  { label: '最新发布', value: 'latest' }, { label: '点赞最多', value: 'likes' }, { label: '评论最多', value: 'comments' }, { label: '浏览最多', value: 'views' },
];
const kind = computed(() => route.params.kind as 'article' | 'page' | 'topic' | undefined);
const slug = computed(() => String(route.params.slug ?? ''));
const slides = computed(() => blocks.value?.filter(item => item.kind === 2) ?? []);
const recommendedArticles = computed(() => recommendedResult.value?.list.slice(0, 4) ?? []);
const galleryArticles = computed(() => articles.value?.list.slice(4, 12) ?? []);
const topArticles = computed(() => [...(articles.value?.list ?? [])].sort((a, b) => b.views - a.views).slice(0, 10));
const articleTags = (article: CmsContent) => (navigation.value?.tags ?? []).filter(tag => article.tagIds?.includes(tag.id)).slice(0, 5);
const topCategories = computed(() => {
  const leaves = (items: CmsOption[]): CmsOption[] => items.flatMap(item => item.children?.length ? leaves(item.children) : [item]);
  return leaves(navigation.value?.categories ?? []).slice(0, 8);
});
const categoryOptions = computed(() => {
  const markParents = (items: CmsOption[]): CmsOption[] => items.map(item => ({ ...item, disabled: Boolean(item.children?.length), children: item.children?.length ? markParents(item.children) : undefined }));
  return markParents(navigation.value?.categories ?? []);
});
const paymentLabel = (value: number) => ['待线下支付', '已确认', '已取消'][value] ?? '未知';
const statusLabel = (value: number) => ['待处理', '处理中', '已完成', '已关闭'][value] ?? '未知';
const submitOrder = async () => {
  if (!slug.value || !detail.value) return;
  if (!orderForm.contactName.trim()) { ElMessage.warning('请输入收件人姓名'); return; }
  if (orderForm.contactPhone.trim().length < 5) { ElMessage.warning('请输入有效联系电话'); return; }
  if (orderForm.shippingAddress.trim().length < 5) { ElMessage.warning('请输入完整收货地址'); return; }
  orderSubmitting.value = true;
  try {
    orderResult.value = await createOrder(slug.value, { ...orderForm, contactName: orderForm.contactName.trim(), contactPhone: orderForm.contactPhone.trim(), shippingAddress: orderForm.shippingAddress.trim(), remark: orderForm.remark.trim() });
    orderQuery.orderNo = orderResult.value.orderNo;
    orderQuery.contactPhone = orderForm.contactPhone.trim();
    orderDialog.value = false;
    ElMessage.success(`订单已提交：${orderResult.value.orderNo}`);
  } finally { orderSubmitting.value = false; }
};
const goLogin = () => router.push({ path: PageEnum.LOGIN, query: { redirect: route.fullPath } });
const requireCommentLogin = () => { ElMessage.warning('请登录后操作'); };
const startReply = (comment: CmsComment) => {
  if (!isLoggedIn.value) return requireCommentLogin();
  if (replyTarget.value?.id === comment.id) {
    replyTarget.value = undefined;
    replyContent.value = '';
    return;
  }
  replyTarget.value = comment;
  replyContent.value = '';
};
const openReport = (comment: CmsComment) => { if (!isLoggedIn.value) return requireCommentLogin(); reportTarget.value = comment; reportReason.value = ''; reportDialog.value = true; };
const submitReport = async () => {
  if (!reportTarget.value || !reportReason.value.trim() || !slug.value) { ElMessage.warning('请填写举报原因'); return; }
  reportSubmitting.value = true;
  try { await reportComment(slug.value, reportTarget.value.id, { reason: reportReason.value.trim() }); reportDialog.value = false; ElMessage.success('举报已提交，等待后台处理'); } finally { reportSubmitting.value = false; }
};
const submitComment = async () => {
  if (!isLoggedIn.value) return goLogin();
  if (!commentForm.content.trim()) { ElMessage.warning('请输入评论内容'); return; }
  commentSubmitting.value = true;
  try {
    await createComment(slug.value, { content: commentForm.content.trim() });
    commentForm.content = '';
    ElMessage.success('评论已提交，审核后展示');
  } finally { commentSubmitting.value = false; }
};
const submitReply = async () => {
  if (!isLoggedIn.value) return goLogin();
  if (!replyTarget.value || !replyContent.value.trim()) { ElMessage.warning('请输入回复内容'); return; }
  commentSubmitting.value = true;
  try {
    await createComment(slug.value, { content: replyContent.value.trim(), parentId: replyTarget.value.id });
    replyContent.value = '';
    replyTarget.value = undefined;
    ElMessage.success('回复已提交，审核后展示');
  } finally { commentSubmitting.value = false; }
};
const queryExistingOrder = async () => { orderResult.value = await queryOrder(orderQuery); };
const safeUrl = (url?: string) => (url && /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(url) ? url : undefined);
const formatDate = (date?: string) => date?.slice(0, 10) ?? '';
const handleArticleClick = (article: CmsContent) => router.push(`/aon/cms/article/${article.slug}`);
const fetchArticles = async () => { try { await getArticles(query); } catch { failed.value = true; } };
const loadComments = async () => { try { await getComments(slug.value, commentPage.value); } catch { failed.value = true; } };
const filterByCategory = (categoryId: string) => { query.categoryId = categoryId; search(); };
const filterByTag = (tagId: string) => { query.tagId = query.tagId === tagId ? undefined : tagId; search(); };
const changeSortBy = (sortBy: NonNullable<CmsQuery['sortBy']>) => { query.sortBy = sortBy; search(); };
const search = async () => {
  query.page = 1;
  const path = route.name === 'cms-category' ? route.path : '/aon/cms';
  await router.replace({ path, query: { keyword: query.keyword || undefined, categoryId: query.categoryId || undefined, tagId: query.tagId || undefined, sortBy: query.sortBy !== 'latest' ? query.sortBy : undefined } });
  await fetchArticles();
};
const fetchRecommendations = async () => {
  await getRecommendedArticles({ page: 1, pageSize: 4, categoryId: query.categoryId, sortBy: 'views' });
};
let generation = 0;
const load = async () => {
  const current = ++generation;
  loading.value = true; failed.value = false; detail.value = undefined; query.page = 1; query.topicId = undefined;
  query.keyword = typeof route.query.keyword === 'string' ? route.query.keyword : '';
  query.categoryId = typeof route.query.categoryId === 'string' ? route.query.categoryId : undefined;
  query.tagId = typeof route.query.tagId === 'string' ? route.query.tagId : undefined;
  query.sortBy = sortOptions.some(item => item.value === route.query.sortBy) ? route.query.sortBy as NonNullable<CmsQuery['sortBy']> : 'latest';
  try {
    if (kind.value && slug.value) {
      const row = await getDetail(kind.value, slug.value); if (current !== generation) return; detail.value = row;
      document.title = row.seoTitle || row.title;
      if (kind.value === 'topic') { query.topicId = row.id; await fetchArticles(); }
      if (kind.value === 'article') { commentPage.value = 1; await loadComments(); }
    } else {
      const [nav] = await Promise.all([getNavigation(), getBlocks()]);
      let currentCategory: CmsOption | undefined;
      if (route.name === 'cms-category') {
        const flattenCategories = (items: CmsOption[]): CmsOption[] => items.flatMap(category => [category, ...(category.children?.length ? flattenCategories(category.children) : [])]);
        const categories = flattenCategories(nav.categories ?? []);
        currentCategory = categories.find(category => category.slug === slug.value);
        query.categoryId = currentCategory?.id;
      }
      await Promise.all([fetchArticles(), fetchRecommendations()]);
      document.title = currentCategory ? `${currentCategory.title} - 内容中心` : '内容中心';
    }
  } catch { if (current === generation) failed.value = true; }
  finally { if (current === generation) loading.value = false; }
};
onMounted(() => watch(() => route.fullPath, load, { immediate: true }));
</script>

<style scoped>
.cms-container { min-height: 100vh; background: #f5f7fb; color: #253148; }
.cms-main { max-width: 1400px; margin: 0 auto; }
.hero-carousel { overflow: hidden; border-radius: 0 0 14px 14px; box-shadow: 0 12px 30px rgba(24, 45, 88, .12); }
.carousel-link { position: relative; display: block; width: 100%; height: 100%; }
.carousel-image { width: 100%; height: 100%; object-fit: cover; }
.carousel-overlay { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 56px clamp(24px, 7vw, 86px); background: linear-gradient(90deg, rgba(13,24,48,.72), rgba(13,24,48,.12) 68%), linear-gradient(0deg, rgba(13,24,48,.78), transparent 58%); }
.carousel-content { max-width: 720px; color: #fff; }
.carousel-kicker { font-size: 13px; font-weight: 700; letter-spacing: .12em; }
.carousel-content h2 { margin: 10px 0 8px; font-size: 34px; line-height: 1.25; }
.carousel-content p { margin: 0; line-height: 1.7; opacity: .9; }
.content-layout { display: contents; }
.home-container { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 22px; padding: 22px 28px 18px; }
.hero-carousel { grid-column: 1 / -1; }
.main-content { display: none; }
.content-layout > .articles-section { grid-column: 1; grid-row: 2; }
.content-layout > .sidebar { grid-column: 2; grid-row: 2; }
.main-content { min-width: 0; }
.articles-section { min-width: 0; padding: 0; }
.articles-section .articles-header { margin-bottom: 14px; }
.filter-card .filter-select { width: 100%; margin-bottom: 10px; }
.filter-card .filter-select:last-child { margin-bottom: 0; }
.order-card .el-form-item { margin-bottom: 10px; }
.order-card .el-input-number { width: 100%; }
.order-query { display: grid; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #edf0f5; }
.order-query p { margin: 0; color: #566176; font-size: 12px; line-height: 1.5; }
.gallery-side-item { display: flex; width: 100%; align-items: center; gap: 10px; padding: 8px 0; text-align: left; border: 0; border-bottom: 1px solid #f0f2f6; background: transparent; cursor: pointer; }
.gallery-side-item img { width: 66px; height: 48px; flex: 0 0 66px; object-fit: cover; border-radius: 4px; }
.gallery-side-item span { overflow: hidden; color: #566176; font-size: 13px; line-height: 1.45; text-overflow: ellipsis; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.panel, .sidebar-card, .detail-article, .comments-section { background: #fff; border: 1px solid #e7ebf2; border-radius: 12px; box-shadow: 0 8px 26px rgba(30,48,90,.045); }
.panel { margin-bottom: 22px; padding: 24px; }
.list-panel { padding: 20px; }
.list-panel .articles-header { margin: 0 0 16px; padding: 0 0 16px; border-bottom: 1px solid #edf0f5; }
.list-panel .articles-grid { gap: 0; }
.list-panel .articles-grid :deep(.cms-article-card) { border-width: 0 0 1px; border-radius: 0; box-shadow: none; }
.list-panel .articles-grid :deep(.cms-article-card:first-child) { border-top: 1px solid #edf0f5; }
.section-header, .articles-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.section-title, .sidebar-title { margin: 0; color: #202b3d; font-size: 20px; font-weight: 700; }
.eyebrow { display: block; margin-bottom: 7px; color: #2b5cff; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.article-total { color: #929baa; font-size: 13px; }
.tags-grid, .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.tag-button, .tag-cloud button { padding: 5px 10px; color: #667085; font-size: 12px; line-height: 1.4; border: 1px solid #e5e9f0; border-radius: 999px; background: #f8fafc; cursor: pointer; transition: color .2s, border-color .2s, background .2s; }
.tag-button:hover, .tag-button.active, .tag-cloud button:hover, .tag-cloud button.active { color: #2b5cff; border-color: #c7d4ff; background: #f0f4ff; }
.tag-cloud { align-items: flex-start; column-gap: 6px; row-gap: 8px; }
.tag-cloud { display: grid; grid-template-columns: repeat(2, max-content); justify-content: start; }
.tag-cloud button { display: inline-flex; width: max-content; max-width: 100%; align-items: center; padding: 4px 8px; white-space: nowrap; }
.text-action { color: #2b5cff; border: 0; background: none; cursor: pointer; }
.recommend-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; margin-top: 20px; }
.recommend-card { display: grid; grid-template-columns: 42% minmax(0,1fr); min-height: 178px; overflow: hidden; border: 1px solid #e6eaf1; border-radius: 8px; background: #fff; cursor: pointer; transform: translateY(0); transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease; }
.recommend-card:hover, .recommend-card:focus-visible { border-color: #ccd7f5; box-shadow: 0 12px 26px rgba(44, 68, 126, .12); transform: translateY(-4px); outline: none; }
.recommend-card img { width: 100%; height: 100%; object-fit: cover; transition: transform .32s ease; }
.recommend-card:hover img, .recommend-card:focus-visible img { transform: scale(1.035); }
.recommend-body { position: relative; z-index: 1; display: flex; flex-direction: column; padding: 17px; background: #fff; }
.recommend-body h4 { margin: 0 0 9px; font-size: 16px; line-height: 1.45; transition: color .2s ease; }
.recommend-card:hover h4, .recommend-card:focus-visible h4 { color: #2b5cff; }
.recommend-body p { display: -webkit-box; margin: 0; overflow: hidden; color: #737e90; font-size: 13px; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.article-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto; padding-top: 12px; color: #98a1af; font-size: 12px; }
.gallery-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; margin-top: 20px; }
.gallery-item { overflow: hidden; border: 1px solid #e7eaf0; border-radius: 8px; cursor: pointer; }
.gallery-item img { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
.gallery-item h4 { margin: 0; padding: 12px; overflow: hidden; font-size: 13px; white-space: nowrap; text-overflow: ellipsis; }
.block-cover { width: 100%; max-height: 380px; object-fit: cover; }
.sidebar { min-width: 0; }
.sidebar-card { margin-bottom: 18px; padding: 18px; }
.sidebar-card .tag-cloud { gap: 7px; margin-top: 0; }
.sidebar-title { margin-bottom: 15px; font-size: 16px; }
.rank-item, .category-item { display: flex; width: 100%; align-items: center; gap: 10px; padding: 10px 0; color: inherit; text-align: left; text-decoration: none; border: 0; border-bottom: 1px solid #f0f2f6; background: transparent; cursor: pointer; }
.rank-item:hover .rank-copy strong { color: #2b5cff; }
.rank-number { display: grid; width: 24px; height: 24px; flex: 0 0 24px; place-items: center; color: #8e98a8; border-radius: 5px; background: #f2f4f7; }
.rank-number.top { color: #fff; background: #f05b65; }
.rank-copy { min-width: 0; }
.rank-copy strong { display: block; overflow: hidden; color: #394459; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.rank-copy small { color: #a0a8b5; }
.category-item { justify-content: space-between; color: #566176; }
.category-item span:last-child { color: #a2aab7; font-size: 12px; }
.articles-section { padding: 0; }
.articles-section .articles-header { padding: 18px 20px; }
.articles-heading { align-items: center; }
.articles-heading .section-title { margin-right: 12px; }
.filter-bar { margin-top: 14px; }

.articles-header { margin-bottom: 20px; padding: 22px 24px 20px; }
.filter-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 18px; padding: 12px; border: 1px solid #edf0f5; border-radius: 10px; background: #f7f9fc; }
.search-field { display: flex; height: 38px; min-width: 260px; flex: 1 1 300px; align-items: center; overflow: hidden; border: 1px solid #dfe5ee; border-radius: 8px; background: #fff; }
.search-field:focus-within { border-color: #2b5cff; box-shadow: 0 0 0 3px rgba(43,92,255,.1); }
.search-field svg { width: 18px; height: 18px; flex: 0 0 18px; margin-left: 12px; fill: none; stroke: #9aa4b5; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.search-field input { min-width: 0; height: 100%; flex: 1; padding: 0 9px; font: inherit; font-size: 13px; border: 0; outline: 0; }
.clear-search { width: 28px; height: 28px; color: #a4adbb; font-size: 20px; border: 0; background: transparent; cursor: pointer; }
.search-submit { height: 38px; padding: 0 18px; color: #fff; font-weight: 600; border: 0; background: #2b5cff; cursor: pointer; }
.filter-select { min-width: 140px; }
.sort-tabs { display: flex; gap: 3px; margin-left: auto; padding: 3px; align-items: center; border: 1px solid #e1e6ef; border-radius: 8px; background: #fff; }
.sort-tabs > span { padding: 0 7px; color: #99a2b0; font-size: 12px; }
.sort-tab { padding: 7px 10px; color: #687385; font-size: 12px; border: 0; border-radius: 6px; background: transparent; cursor: pointer; }
.sort-tab:hover, .sort-tab.active { color: #2b5cff; background: #eef2ff; }
.articles-grid { display: grid; gap: 15px; }
.pagination { justify-content: center; margin-top: 24px; }
.detail-container { max-width: 940px; margin: 0 auto; padding: 28px; }
.breadcrumb-link { display: inline-flex; margin-bottom: 16px; color: #566176; }
.detail-article, .comments-section { margin-bottom: 20px; padding: 36px; }
.detail-title { margin: 0 0 16px; font-size: 34px; line-height: 1.35; }
.detail-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; color: #929baa; font-size: 13px; }
.detail-cover { width: 100%; max-height: 520px; object-fit: cover; border-radius: 8px; }
.detail-summary { margin: 24px 0; padding: 18px 20px; color: #5b6678; line-height: 1.8; border-left: 3px solid #2b5cff; background: #f7f9fc; }
.detail-actions { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 22px 0 28px; padding: 18px 20px; border: 1px solid #dfe7fb; background: #f6f8ff; }
.detail-actions > div { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
.detail-actions strong { color: #2d3b57; font-size: 15px; }
.detail-actions span, .sidebar-hint { color: #8993a3; font-size: 13px; line-height: 1.6; }
.order-article { display: flex; flex-direction: column; gap: 5px; margin-bottom: 18px; padding: 14px 16px; border: 1px solid #e2e8f4; border-radius: 6px; background: #f7f9fd; }
.order-article span { color: #8993a3; font-size: 12px; }
.order-article strong { color: #28354d; font-size: 15px; line-height: 1.5; }
.order-article small { color: #6f7e96; font-size: 12px; }
.order-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.order-form-grid.quantity-row { grid-template-columns: 160px; }
.comment-login-gate { display: flex; align-items: center; gap: 12px; margin: 18px 0 24px; padding: 18px 20px; border: 1px solid #e4eaf5; background: #f8faff; }
.comment-login-gate > div:nth-child(2) { display: flex; flex: 1; flex-direction: column; gap: 4px; }
.comment-login-gate strong { color: #24324a; font-size: 15px; }
.comment-login-gate span { color: #8490a3; font-size: 13px; }
.comment-login-avatar { display: flex; width: 38px; height: 38px; align-items: center; justify-content: center; color: #fff; font-weight: 700; background: #5d73df; border-radius: 50%; }
.comment-editor { margin: 18px 0 22px; padding: 16px; border: 1px solid #e7ebf1; border-radius: 6px; background: #fafbfc; }
.comment-editor-identity { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; color: #253149; font-size: 14px; }
.comment-editor-avatar { display: grid; width: 34px; height: 34px; flex: 0 0 34px; overflow: hidden; place-items: center; color: #fff; font-size: 13px; font-weight: 700; border-radius: 50%; background: #5b72e8; }
.comment-editor-avatar img, :deep(.comment-avatar img) { width: 100%; height: 100%; object-fit: cover; }
.comment-editor :deep(.el-textarea__inner) { min-height: 96px !important; padding: 12px 14px; line-height: 1.65; border-radius: 4px; box-shadow: 0 0 0 1px #dfe4ec inset; }
.comment-editor :deep(.el-textarea__inner:focus) { box-shadow: 0 0 0 1px #6b86ee inset; }
.comment-editor-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; color: #929cab; font-size: 12px; }
.comment-list { margin-top: 2px; }
:deep(.comment-thread) { border-bottom: 1px solid #edf0f4; }
:deep(.comment-node) { display: flex; gap: 12px; }
:deep(.comment-node.is-root) { padding: 20px 0 18px; }
:deep(.comment-main) { min-width: 0; flex: 1; }
:deep(.comment-avatar) { display: grid; width: 36px; height: 36px; flex: 0 0 36px; overflow: hidden; place-items: center; color: #fff; font-size: 13px; font-weight: 700; border-radius: 50%; background: #5b72e8; }
:deep(.comment-replies) { margin: 0 0 4px 48px; }
:deep(.comment-node.is-reply) { gap: 10px; padding: 13px 0; border-top: 1px solid #f0f2f5; }
:deep(.comment-node.is-reply .comment-avatar) { width: 30px; height: 30px; flex-basis: 30px; font-size: 12px; }
:deep(.comment-author) { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; min-height: 22px; }
:deep(.comment-author strong) { color: #30394b; font-size: 14px; font-weight: 600; }
:deep(.comment-author span) { color: #a0a8b5; font-size: 12px; }
:deep(.comment-author em) { color: #647fe7; font-size: 13px; font-style: normal; }
:deep(.comment-content) { margin: 4px 0 6px; color: #3f4a5e; font-size: 14px; line-height: 1.65; white-space: pre-wrap; }
:deep(.comment-actions) { display: flex; align-items: center; gap: 14px; min-height: 20px; color: #a0a8b5; font-size: 12px; }
:deep(.comment-actions button) { padding: 1px 0; color: #8b95a5; font-size: 12px; border: 0; background: none; cursor: pointer; }
:deep(.comment-actions button:hover), :deep(.comment-actions button.active) { color: #2b5cff; }
:deep(.inline-reply-editor) { margin-top: 10px; overflow: hidden; border: 1px solid #aebff9; border-radius: 4px; background: #fff; box-shadow: 0 0 0 2px rgba(43, 92, 255, .04); }
:deep(.inline-reply-editor textarea) { display: block; width: 100%; min-height: 76px; resize: vertical; padding: 11px 13px; color: #39465d; font: inherit; font-size: 13px; line-height: 1.65; border: 0; outline: 0; box-sizing: border-box; }
:deep(.inline-reply-editor textarea::placeholder) { color: #a1a9b6; }
:deep(.inline-reply-footer) { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 7px 9px; color: #98a1af; font-size: 11px; }
:deep(.inline-reply-footer button) { min-width: 64px; height: 30px; color: #fff; border: 0; border-radius: 4px; background: #2b5cff; cursor: pointer; }
:deep(.inline-reply-footer button:disabled) { background: #b5c8fb; cursor: not-allowed; }
.report-target { margin: 0 0 12px; color: #69758a; font-size: 13px; }
:deep(.comment-reply-action) { padding: 0; color: #71809a; font-size: 12px; border: 0; background: transparent; cursor: pointer; }
:deep(.comment-reply-action:hover) { color: #2b5cff; }
:deep(.comment-children) { margin-left: 48px; }
.comment-empty { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 28px 12px 8px; color: #9aa4b3; }
.comment-empty strong { color: #667085; font-size: 14px; }
.comment-empty span { font-size: 13px; }
.comment-reply p { margin-bottom: 0; }
@media (max-width: 1024px) { .home-container { grid-template-columns: 1fr; } .content-layout > .articles-section, .content-layout > .sidebar { grid-column: 1; } .content-layout > .sidebar { grid-row: 3; } .sidebar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; } .sidebar-card { margin-bottom: 0; } .gallery-sidebar { grid-column: 1 / -1; } .gallery-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 768px) {
  .hero-carousel { border-radius: 0 0 10px 10px; }
  .carousel-overlay { padding: 28px 20px; }
  .carousel-content h2 { font-size: 23px; }
  .home-container { padding: 16px; }
  .content-layout { grid-template-columns: 1fr; padding: 0; }
  .articles-section { padding: 0; }
  .sidebar { grid-template-columns: 1fr; gap: 12px; }
  .gallery-sidebar { grid-column: auto; }
  .panel { padding: 18px; }
  .recommend-grid { grid-template-columns: 1fr; }
  .recommend-card { grid-template-columns: 38% minmax(0,1fr); min-height: 154px; }
  .gallery-grid { grid-template-columns: repeat(2,1fr); }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .search-field, .filter-select { width: 100%; min-width: 0; flex-basis: auto; }
  .sort-tabs { width: 100%; margin-left: 0; overflow-x: auto; }
  .articles-header { padding: 18px; }
  .detail-container { padding: 16px; }
  .detail-article, .comments-section { padding: 22px 18px; }
  .detail-title { font-size: 26px; }
  :deep(.comment-replies) { margin-left: 40px; }
  :deep(.comment-node) { gap: 10px; }
  :deep(.comment-node.is-reply .comment-avatar) { width: 28px; height: 28px; flex-basis: 28px; }
  .comment-editor-footer { align-items: flex-end; }
}
@media (max-width: 520px) {
  .comment-editor { padding: 14px; }
  .order-form-grid { grid-template-columns: 1fr; gap: 0; }
  .order-form-grid.quantity-row { grid-template-columns: 1fr; }
  .order-form-grid.quantity-row :deep(.el-input-number) { width: 100%; }
  .comment-editor-footer { flex-direction: column; }
  .comment-editor-footer :deep(.el-button) { width: 100%; }
  :deep(.comment-replies) { margin-left: 18px; }
  :deep(.comment-node.is-reply) { padding: 12px 0; }
  :deep(.comment-author) { gap: 4px; }
  :deep(.comment-content) { font-size: 13px; }
}
</style>
