<template>
  <div class="cms-container">
    <main v-loading="loading" class="cms-main">
      <el-alert v-if="failed" title="加载失败" type="error" :closable="false"><el-button @click="load">重试</el-button></el-alert>

      <template v-else-if="showDetail">
        <div v-if="detail" class="detail-container">
          <router-link to="/" class="breadcrumb-link">返回首页</router-link>
          <article class="detail-article">
            <h1 class="detail-title">{{ detail.title }}</h1>
            <div class="detail-meta">
              <span class="meta-item"><cms-icon name="calendar" :size="15" />{{ formatDate(detail.publishAt) }}</span
              ><template v-if="kind === 'article'"
                ><span class="meta-item"><cms-icon name="view" :size="15" />浏览 {{ detail.views }}</span
                ><span class="meta-item"><cms-icon name="like" :size="15" />点赞 {{ detail.likes }}</span
                ><span class="meta-item"><cms-icon name="comment" :size="15" />评论 {{ detail.comments }}</span></template
              >
            </div>
            <img v-if="safeUrl(detail.coverUrl)" class="detail-cover" :src="detail.coverUrl" :alt="detail.title" />
            <p v-if="detail.summary" class="detail-summary">{{ detail.summary }}</p>
            <cms-preview :content="detail.mdContent ?? ''" />
            <div v-if="kind === 'article' && detail.orderEnabled" class="detail-actions"><el-button type="primary" @click="orderDialog = true">创建订单</el-button><span>线下支付，提交后可凭订单号查询处理进度</span></div>
            <div v-if="kind === 'article' && detail.isDownload && detail.fileUrl" class="detail-actions download-actions">
              <div class="download-meta">
                <strong>{{ detail.fileName || detail.title }}</strong
                ><span><cms-icon name="download" :size="14" />下载次数 {{ detail.downloads ?? 0 }}</span>
              </div>
              <el-button type="success" :loading="downloading" @click="downloadArticleFile">下载文件</el-button>
            </div>
            <!-- 后台「内容详情页底部」位置的区块投放点 -->
            <div v-if="detailBottomBlocks.length" class="detail-blocks">
              <section v-for="block in detailBottomBlocks" :key="block.id" class="panel detail-block" :class="{ 'has-cover': safeUrl(block.coverUrl) }" :title="blockTitle(block)">
                <img v-if="safeUrl(block.coverUrl)" class="block-cover" :src="block.coverUrl" :alt="block.title" loading="lazy" />
                <div class="block-body">
                  <h3 class="section-title">{{ block.title }}</h3>
                  <cms-preview :content="block.mdContent ?? ''" :title="blockTitle(block)" />
                  <a v-if="safeUrl(block.link)" :href="block.link" class="block-link" target="_blank" rel="noopener">查看详情 →</a>
                </div>
              </section>
            </div>
          </article>
          <section v-if="kind === 'article'" class="comments-section">
            <div class="section-header">
              <h3 class="section-title">评论 {{ comments?.total ?? 0 }}</h3>
              <span class="article-total">友善交流，理性发言</span>
            </div>
            <!-- 未登录时评论区保持可见但整体置灰，点击后弹出登录引导，避免入口消失 -->
            <div class="comment-editor">
              <div class="comment-editor-identity">
                <div class="comment-editor-avatar">
                  <img v-if="isLoggedIn && currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" /><span v-else>{{ isLoggedIn ? currentUserName.slice(0, 1) || '我' : '访' }}</span>
                </div>
                <strong>{{ isLoggedIn ? currentUserName : '登录后参与评论' }}</strong>
              </div>
              <el-input v-model="commentForm.content" type="textarea" :rows="4" :disabled="!isLoggedIn" placeholder="友善交流，分享你的看法" maxlength="2000" show-word-limit />
              <div class="comment-editor-footer">
                <span class="comment-tip">{{ isLoggedIn ? '评论审核通过后公开展示' : '登录后可以发表评论、回复与举报' }}</span>
                <el-button v-if="isLoggedIn" type="primary" :loading="commentSubmitting" :disabled="!isLoggedIn || !commentForm.content.trim()" @click="submitComment">发表评论</el-button>
                <el-button v-else type="primary" plain @click="requireCommentLogin">登录</el-button>
              </div>
            </div>
            <div v-if="commentTree.length" class="comment-list"><CommentTree v-for="comment in commentTree" :key="comment.id" :comment="comment" :reply-target-id="replyTarget?.id" :reply-content="replyContent" :submitting="commentSubmitting" @reply="startReply" @report="openReport" @update:reply-content="replyContent = $event" @submit-reply="submitReply" /></div>
            <div v-else class="comment-empty"><strong>还没有评论</strong><span>来发表第一条友善的评论吧</span></div>
            <el-pagination v-if="comments?.total" v-model:current-page="commentPage" :page-size="comments.pageSize || 3" :total="comments.total" layout="prev, pager, next" class="comment-pagination" @current-change="loadComments" />
          </section>
          <section v-if="kind === 'article' && relatedList.length" class="related-section panel">
            <div class="section-header">
              <h3 class="section-title">相关推荐</h3>
              <span class="article-total">基于同栏目或相似标签</span>
            </div>
            <div class="articles-grid"><cms-article-card v-for="item in relatedList" :key="item.id" :article="item" :tags="articleTags(item)" @click="handleArticleClick" /></div>
          </section>
          <el-dialog v-model="loginDialog" title="登录后操作" width="calc(100% - 32px)" style="max-width: 420px" class="comment-login-dialog">
            <div class="comment-login-dialog-content">
              <div class="comment-login-dialog-icon">评</div>
              <div>
                <strong>请登录后参与评论</strong>
                <p>登录后即可发表评论、回复评论和举报评论。</p>
              </div>
            </div>
            <template #footer>
              <el-button @click="loginDialog = false">关闭</el-button>
              <el-button @click="goRegister">去注册</el-button>
              <el-button type="primary" @click="goLogin">去登录</el-button>
            </template>
          </el-dialog>
          <el-dialog v-model="reportDialog" title="举报评论" width="420px"
            ><p class="report-target">举报 {{ reportTarget?.author }} 的评论</p>
            <el-input v-model="reportReason" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请说明举报原因" /><template #footer><el-button @click="reportDialog = false">取消</el-button><el-button type="primary" :loading="reportSubmitting" @click="submitReport">提交举报</el-button></template></el-dialog
          >
          <el-dialog v-model="orderDialog" title="创建线下订单" width="calc(100% - 32px)" style="max-width: 520px" class="order-dialog"
            ><div class="order-article">
              <span>下单内容</span><strong>{{ detail.title }}</strong
              ><small>{{ isLoggedIn ? '订单将自动关联当前账号' : '当前为访客下单，可凭订单号和联系电话查询' }}</small>
            </div>
            <el-form label-position="top"
              ><div class="order-form-grid">
                <el-form-item label="收件人"><el-input v-model="orderForm.contactName" maxlength="80" placeholder="请输入收件人姓名" /></el-form-item><el-form-item label="联系电话"><el-input v-model="orderForm.contactPhone" maxlength="30" placeholder="请输入联系电话" /></el-form-item>
              </div>
              <el-form-item label="收货地址"><el-input v-model="orderForm.shippingAddress" maxlength="500" placeholder="请输入省、市、区及详细地址" /></el-form-item>
              <div class="order-form-grid quantity-row">
                <el-form-item label="数量"><el-input-number v-model="orderForm.quantity" :min="1" :max="999" controls-position="right" /></el-form-item>
              </div>
              <el-form-item label="订单备注"><el-input v-model="orderForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="选填，可填写规格或其他说明" /></el-form-item></el-form
            ><template #footer><el-button @click="orderDialog = false">取消</el-button><el-button type="primary" :loading="orderSubmitting" @click="submitOrder">提交订单</el-button></template></el-dialog
          >
        </div>
        <!-- 详情页之间跳转时保留旧内容与骨架占位，避免短暂回落到首页造成“中间页”闪烁 -->
        <div v-else class="detail-skeleton">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="h1" style="width: 46%; height: 34px" />
              <el-skeleton-item variant="text" style="width: 30%; margin: 14px 0 22px" />
              <el-skeleton-item variant="image" style="width: 100%; height: 340px; border-radius: 10px" />
              <el-skeleton-item variant="text" style="margin-top: 22px" />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" style="width: 62%" />
            </template>
          </el-skeleton>
        </div>
      </template>

      <template v-else>
        <section class="home-container" :class="{ 'is-list': isListPage }">
          <div v-if="slides.length && !isListPage" class="hero-carousel">
            <div class="cms-carousel">
              <div v-for="(slide, index) in slides" :key="slide.id" class="cms-carousel-slide" :class="{ 'is-active': activeSlide === index }" :aria-hidden="activeSlide !== index">
                <component :is="safeUrl(slide.link) ? 'a' : 'div'" :href="safeUrl(slide.link)" class="carousel-link" :title="blockTitle(slide)">
                  <img v-if="safeUrl(slide.coverUrl)" :src="slide.coverUrl" :alt="slide.title" class="carousel-image" />
                  <div class="carousel-overlay">
                    <div class="carousel-content">
                      <span class="carousel-kicker">精选内容</span>
                      <h2>{{ slide.title }}</h2>
                    </div>
                  </div>
                </component>
              </div>
            </div>
          </div>

          <div v-if="homeBlocks.length && !isListPage" class="block-stream">
            <section v-for="block in homeBlocks" :key="block.id" class="panel block-panel" :class="{ 'has-cover': safeUrl(block.coverUrl) }" :title="blockTitle(block)">
              <img v-if="safeUrl(block.coverUrl)" class="block-cover" :src="block.coverUrl" :alt="block.title" loading="lazy" />
              <div class="block-body">
                <div class="section-header">
                  <h3 class="section-title">{{ block.title }}</h3>
                </div>
                <cms-preview :content="block.mdContent ?? ''" :title="blockTitle(block)" />
                <a v-if="safeUrl(block.link)" :href="block.link" class="block-link" target="_blank" rel="noopener">查看详情 →</a>
              </div>
            </section>
          </div>

          <div class="content-layout">
            <section v-if="!failed && (!detail || kind === 'topic')" class="articles-section">
              <div v-if="isTagPage && tagPageTag" class="tag-banner">
                <h3>标签：{{ tagPageTag.title }}</h3>
                <button class="text-action" @click="clearTagFilter">查看全部内容</button>
              </div>
              <section v-if="!isTagPage && recommendCategories.length && !isListPage" class="panel recommend-cat-section">
                <div class="section-header">
                  <h3 class="section-title">栏目推荐</h3>
                  <span class="article-total">精选 {{ recommendCategories.length }} 个栏目</span>
                </div>
                <div class="cat-grid">
                  <template v-for="cat in recommendCategories" :key="cat.id">
                    <a v-if="cat.type === 3" :href="cat.link" :target="cat.openMode === 1 ? '_blank' : undefined" rel="noopener" class="cat-card" tabindex="0">
                      <img v-if="safeUrl(cat.coverUrl)" :src="cat.coverUrl" :alt="cat.title" />
                      <div class="cat-body">
                        <h4>{{ cat.title }}</h4>
                        <span>进入栏目 →</span>
                      </div>
                    </a>
                    <router-link v-else-if="cat.link" :to="cat.link" class="cat-card" tabindex="0">
                      <img v-if="safeUrl(cat.coverUrl)" :src="cat.coverUrl" :alt="cat.title" />
                      <div class="cat-body">
                        <h4>{{ cat.title }}</h4>
                        <span>进入栏目 →</span>
                      </div>
                    </router-link>
                  </template>
                </div>
              </section>
              <section class="panel list-panel">
                <div class="articles-header">
                  <!-- 面包屑与篇数同处一行：把栏目层级与内容规模压到同一条基线上，避免头部占用过多竖向空间 -->
                  <div class="articles-topline">
                    <nav v-if="isListPage" class="me-breadcrumb" aria-label="面包屑">
                      <router-link to="/">首页</router-link>
                      <span class="me-breadcrumb-sep">/</span>
                      <template v-if="parentCategory">
                        <router-link :to="`/aon/cms/category/${parentCategory.slug}`">{{ parentCategory.title }}</router-link>
                        <span class="me-breadcrumb-sep">/</span>
                      </template>
                      <span class="me-breadcrumb-current">{{ breadcrumbCurrent }}</span>
                    </nav>
                    <div class="articles-heading">
                      <span class="article-total">共 {{ articles?.total ?? 0 }} 篇</span>
                    </div>
                  </div>
                  <div class="filter-bar">
                    <div class="search-field">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21" /></svg><input v-model="query.keyword" type="search" placeholder="搜索文章标题或摘要" @keyup.enter="search" /><button
                        v-if="query.keyword"
                        class="clear-search"
                        aria-label="清除搜索"
                        @click="
                          query.keyword = '';
                          search();
                        "
                      >
                        ×</button
                      ><button class="search-submit" @click="search">搜索</button>
                    </div>
                    <div class="sort-tabs">
                      <span>排序</span><button v-for="option in sortOptions" :key="option.value" class="sort-tab" :class="{ active: query.sortBy === option.value }" @click="changeSortBy(option.value)">{{ option.label }}</button>
                    </div>
                  </div>
                </div>
                <div class="articles-grid"><cms-article-card v-for="item in articles?.list" :key="item.id" :article="item" :category-name="articleCategoryName(item)" :topic-name="articleTopicName(item)" :tags="articleTags(item)" @click="handleArticleClick" /></div>
                <el-empty v-if="articles && articles.total === 0" description="暂无内容" />
                <el-pagination v-if="articles?.total" v-model:current-page="query.page" :page-size="query.pageSize" :total="articles.total" layout="prev,pager,next" class="pagination" @current-change="fetchArticles" />
              </section>
            </section>
            <aside v-if="!isListPage" class="sidebar">
              <section class="sidebar-card order-card">
                <h3 class="sidebar-title">订单查询</h3>
                <p class="sidebar-hint">提交内容页订单后，可在这里查询处理进度。</p>
                <div class="order-query">
                  <el-input v-model="orderQuery.orderNo" placeholder="订单号" /><el-input v-model="orderQuery.contactPhone" placeholder="手机号" /><el-button @click="queryExistingOrder">查询订单</el-button>
                  <div v-if="orderResult" class="order-result">
                    <p>订单 {{ orderResult.orderNo }}：{{ paymentLabel(orderResult.paymentStatus) }}，{{ shippingLabel(orderResult.shippingStatus ?? 0) }}，{{ statusLabel(orderResult.status) }}</p>
                    <p v-if="orderResult.expressNo">物流：{{ orderResult.expressCompany }} {{ orderResult.expressNo }}</p>
                  </div>
                </div>
              </section>
              <section class="sidebar-card filter-card">
                <h3 class="sidebar-title">筛选内容</h3>
                <el-select v-model="query.categoryId" clearable placeholder="全部分栏" class="filter-select" @change="search"
                  ><el-option-group v-for="group in categoryGroups" :key="group.label" :label="group.label"><el-option v-for="opt in group.options" :key="opt.value" :value="opt.value" :label="opt.label" /></el-option-group></el-select
                ><el-select v-model="query.tagId" clearable placeholder="全部标签" class="filter-select" @change="search"><el-option v-for="tag in navigation?.tags" :key="tag.id" :value="tag.id" :label="tag.title" /></el-select>
              </section>
              <section class="sidebar-card">
                <div class="section-header">
                  <h3 class="sidebar-title">热门排行</h3>
                  <router-link class="text-action" :to="{ path: '/aon/cms', query: { sortBy: 'views' } }">更多</router-link>
                </div>
                <router-link v-for="(article, index) in ranking.slice(0, 6)" :key="article.id" class="rank-item" :to="`/aon/cms/article/${article.slug}`"
                  ><span class="rank-number" :class="{ top: index < 3 }">{{ index + 1 }}</span
                  ><span class="rank-copy"
                    ><strong>{{ article.title }}</strong
                    ><small><cms-icon name="view" :size="13" />{{ article.views }}</small></span
                  ></router-link
                >
              </section>
              <section v-if="topCategories.length" class="sidebar-card">
                <h3 class="sidebar-title">栏目导航</h3>
                <template v-for="cat in topCategories" :key="cat.id">
                  <a v-if="cat.type === 3" class="category-item" :href="cat.link" :target="cat.openMode === 1 ? '_blank' : undefined" rel="noopener" tabindex="0">
                    <span>{{ cat.title }}</span
                    ><span>进入</span>
                  </a>
                  <router-link v-else class="category-item" :to="cat.link || `/aon/cms/category/${cat.slug}`" tabindex="0">
                    <span>{{ cat.title }}</span
                    ><span>进入</span>
                  </router-link>
                </template>
              </section>
              <section v-if="displayTags.length" class="sidebar-card">
                <h3 class="sidebar-title">热门标签</h3>
                <div class="tag-cloud">
                  <router-link v-for="tag in displayTags" :key="tag.id" class="tag-link" :class="{ active: query.tagId === tag.id }" :to="`/aon/cms/tag/${tag.slug}`">{{ tag.title }}</router-link>
                </div>
              </section>
              <section v-if="promoBlocks.length" class="sidebar-card ad-sidebar">
                <h3 class="sidebar-title">推荐</h3>
                <component :is="safeUrl(promo.link) ? 'a' : 'span'" v-for="promo in promoBlocks" :key="promo.id" class="ad-item" :class="{ 'is-static': !safeUrl(promo.link) }" :href="safeUrl(promo.link)" :target="safeUrl(promo.link) ? '_blank' : undefined" rel="noopener">
                  <img v-if="safeUrl(promo.coverUrl)" :src="promo.coverUrl" :alt="promo.title" loading="lazy" />
                  <span v-else>{{ promo.title }}</span>
                </component>
              </section>
            </aside>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { PageEnum } from '@/dict/pageEnum';
import { useUserStore } from '@/store';
import { formatterAtExec } from '@/utils/helper';
import { ElMessage } from 'element-plus';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { CmsComment, CmsContent, CmsOption, CmsOrder, CmsQuery } from '../api/cms';
import { articleDownloadApi, articlesApi, blocksApi, commentsApi, createCommentApi, createOrderApi, detailApi, homeApi, navigationApi, queryOrderApi, relatedApi, reportCommentApi } from '../api/cms';
import CmsArticleCard from '../components/cmsArticleCard.vue';
import CmsIcon from '../components/cmsIcon.vue';
import CmsPreview from '../components/cmsPreview.vue';
import CommentTree from './components/commentTree.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => Boolean(userStore.token && userStore.user.id));
const currentUserName = computed(() => userStore.user.nickname?.trim() || userStore.user.username || '我');
const currentUserAvatar = computed(() => userStore.user.avatar?.url || '');
const { runAsync: getArticles, data: articles } = articlesApi();
const { runAsync: getDetail } = detailApi();
const { runAsync: getNavigation, data: navigation } = navigationApi();
const { runAsync: getComments, data: comments } = commentsApi();
const { runAsync: getHome, data: home } = homeApi();
const { runAsync: getRelated, data: related } = relatedApi();
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
const loginDialog = ref(false);
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
const { runAsync: downloadArticle } = articleDownloadApi();
const downloading = ref(false);
const downloadArticleFile = async () => {
  if (!slug.value) return;
  downloading.value = true;
  try {
    const res = await downloadArticle(slug.value);
    detail.value = { ...detail.value, downloads: res.downloads } as CmsContent;
    if (res.url) window.open(res.url, '_blank');
  } finally {
    downloading.value = false;
  }
};
const detail = ref<CmsContent>();
const loading = ref(false);
const failed = ref(false);
const activeCategory = ref<CmsOption>();
// 面包屑中的上级栏目（如「产品动态」），仅栏目页存在
const parentCategory = ref<{ title: string; slug: string }>();
const commentPage = ref(1);
const sortOptions: Array<{ label: string; value: NonNullable<CmsQuery['sortBy']> }> = [
  { label: '最新发布', value: 'latest' },
  { label: '点赞最多', value: 'likes' },
  { label: '评论最多', value: 'comments' },
  { label: '浏览最多', value: 'views' },
];
const kind = computed(() => route.params.kind as 'article' | 'page' | 'topic' | undefined);
const slug = computed(() => String(route.params.slug ?? ''));
// 是否处于「详情」视图：由路由决定，而非由数据是否就绪决定，避免详情页跳转时短暂回落首页
const showDetail = computed(() => Boolean(kind.value && slug.value));
// 区块按「展示位置」投放：下面每个请求对应后台区块字典中的一个位置
const { runAsync: getHomeBanner, data: homeBanner } = blocksApi();
const { runAsync: getHomeContent, data: homeContent } = blocksApi();
const { runAsync: getSidebarPromos, data: sidebarPromos } = blocksApi();
const { runAsync: getDetailBlocks, data: detailBlocks } = blocksApi();
const slides = computed(() => homeBanner.value ?? []);
const activeSlide = ref(0);
let slideTimer: ReturnType<typeof setInterval> | undefined;
const homeBlocks = computed(() => homeContent.value ?? []);
const promoBlocks = computed(() => sidebarPromos.value ?? []);
const detailBottomBlocks = computed(() => detailBlocks.value ?? []);
const hotTags = computed(() => home.value?.hotTags ?? []);
const recommendCategories = computed(() => home.value?.recommendCategories ?? []);
const ranking = computed(() => home.value?.ranking ?? []);
const relatedList = computed(() => related.value ?? []);
const displayTags = computed(() => (hotTags.value.length ? hotTags.value : (navigation.value?.tags ?? [])));
const isTagPage = computed(() => route.name === 'cms-tag');
const isListPage = computed(() => route.name === 'cms-category' || route.name === 'cms-tag');
const tagPageTag = computed(() => (isTagPage.value ? (navigation.value?.tags ?? []).find((tag) => tag.slug === slug.value) : undefined));
// 面包屑末级：严格按栏目树取当前栏目名（标签页显示标签名），不再硬编码站点文案
const breadcrumbCurrent = computed(() => (isTagPage.value ? `标签：${tagPageTag.value?.title ?? ''}` : (activeCategory.value?.title ?? '全部内容')));
const articleTags = (article: CmsContent) => (navigation.value?.tags ?? []).filter((tag) => article.tagIds?.includes(tag.id)).slice(0, 5);
const articleCategoryName = (article: CmsContent) => {
  const find = (list: CmsOption[]): string => {
    for (const node of list) {
      if (node.id === article.categoryId) return node.title;
      if (node.children?.length) {
        const r = find(node.children);
        if (r) return r;
      }
    }
    return '';
  };
  return article.categoryId ? find(navigation.value?.categories ?? []) || '' : '';
};
const articleTopicName = (article: CmsContent) => {
  if (!article.topicId) return '';
  return (navigation.value?.topics ?? []).find((t) => t.id === article.topicId)?.title || '';
};
const topCategories = computed(() => {
  const leaves = (items: CmsOption[]): CmsOption[] => items.flatMap((item) => (item.children?.length ? leaves(item.children) : [item]));
  // 侧边栏栏目导航同样严格按栏目渲染：只展示能解析出落地地址的栏目（类型 4/5 未配置目标时自动跳过）
  return leaves(navigation.value?.categories ?? [])
    .filter((item) => item.link)
    .slice(0, 8);
});
const categoryGroups = computed(() => {
  const items = navigation.value?.categories ?? [];
  return items.map((cat) => ({
    label: cat.title,
    options: (cat.children?.length ? cat.children : [cat]).map((c) => ({ value: c.id, label: c.title })),
  }));
});
const paymentLabel = (value: number) => ['待线下支付', '已确认', '已取消'][value] ?? '未知';
const statusLabel = (value: number) => ['待处理', '处理中', '已完成', '已关闭'][value] ?? '未知';
const shippingLabel = (value: number) => ['未发货', '已发货', '已签收'][value] ?? '未知';
const submitOrder = async () => {
  if (!slug.value || !detail.value) return;
  if (!orderForm.contactName.trim()) {
    ElMessage.warning('请输入收件人姓名');
    return;
  }
  if (orderForm.contactPhone.trim().length < 5) {
    ElMessage.warning('请输入有效联系电话');
    return;
  }
  if (orderForm.shippingAddress.trim().length < 5) {
    ElMessage.warning('请输入完整收货地址');
    return;
  }
  orderSubmitting.value = true;
  try {
    orderResult.value = await createOrder(slug.value, { ...orderForm, contactName: orderForm.contactName.trim(), contactPhone: orderForm.contactPhone.trim(), shippingAddress: orderForm.shippingAddress.trim(), remark: orderForm.remark.trim() });
    orderQuery.orderNo = orderResult.value.orderNo;
    orderQuery.contactPhone = orderForm.contactPhone.trim();
    orderDialog.value = false;
    ElMessage.success(`订单已提交：${orderResult.value.orderNo}`);
  } finally {
    orderSubmitting.value = false;
  }
};
const goLogin = () => {
  loginDialog.value = false;
  return router.push({ path: PageEnum.LOGIN, query: { redirect: route.fullPath } });
};
const goRegister = () => {
  loginDialog.value = false;
  return router.push({ path: PageEnum.REGISTER, query: { redirect: route.fullPath } });
};
const requireCommentLogin = () => {
  loginDialog.value = true;
};
// 未登录用户仍可浏览评论列表；回复、举报等操作点击后引导登录。
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
const openReport = (comment: CmsComment) => {
  if (!isLoggedIn.value) return requireCommentLogin();
  reportTarget.value = comment;
  reportReason.value = '';
  reportDialog.value = true;
};
const submitReport = async () => {
  if (!reportTarget.value || !reportReason.value.trim() || !slug.value) {
    ElMessage.warning('请填写举报原因');
    return;
  }
  reportSubmitting.value = true;
  try {
    await reportComment(slug.value, reportTarget.value.id, { reason: reportReason.value.trim() });
    reportDialog.value = false;
    ElMessage.success('举报已提交，等待后台处理');
  } finally {
    reportSubmitting.value = false;
  }
};
const submitComment = async () => {
  if (!isLoggedIn.value) return requireCommentLogin();
  if (!commentForm.content.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }
  commentSubmitting.value = true;
  try {
    await createComment(slug.value, { content: commentForm.content.trim() });
    commentForm.content = '';
    ElMessage.success('评论已提交，审核后展示');
  } finally {
    commentSubmitting.value = false;
  }
};
const submitReply = async () => {
  if (!isLoggedIn.value) return goLogin();
  if (!replyTarget.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }
  commentSubmitting.value = true;
  try {
    await createComment(slug.value, { content: replyContent.value.trim(), parentId: replyTarget.value.id });
    replyContent.value = '';
    replyTarget.value = undefined;
    ElMessage.success('回复已提交，审核后展示');
  } finally {
    commentSubmitting.value = false;
  }
};
const queryExistingOrder = async () => {
  orderResult.value = await queryOrder(orderQuery);
};
const safeUrl = (url?: string) => (url && /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(url) ? url : undefined);
// 区块前台标题：渲染为节点的 title 属性，鼠标移入时以浏览器原生提示展示；未配置时不输出属性
const blockTitle = (block: { displayTitle?: string; title?: string }) => block.displayTitle?.trim() || block.title || undefined;
const formatDate = (date?: string) => formatterAtExec(date, 'YYYY-MM-DD');
const handleArticleClick = (article: CmsContent) => router.push(`/aon/cms/article/${article.slug}`);
const fetchArticles = async () => {
  try {
    await getArticles(query);
  } catch {
    failed.value = true;
  }
};
const loadComments = async () => {
  try {
    await getComments(slug.value, commentPage.value);
  } catch {
    failed.value = true;
  }
};
const changeSortBy = (sortBy: NonNullable<CmsQuery['sortBy']>) => {
  query.sortBy = sortBy;
  search();
};
const search = async () => {
  query.page = 1;
  const path = route.name === 'cms-category' ? route.path : '/aon/cms';
  await router.replace({ path, query: { keyword: query.keyword || undefined, categoryId: query.categoryId || undefined, tagId: query.tagId || undefined, sortBy: query.sortBy !== 'latest' ? query.sortBy : undefined } });
  await fetchArticles();
};
const clearTagFilter = () => {
  query.tagId = undefined;
  return router.push({ path: '/aon/cms' });
};
let generation = 0;
const load = async () => {
  const current = ++generation;
  loading.value = true;
  failed.value = false;
  // 仅当离开详情视图时才清空详情：详情之间跳转保留旧内容 + 加载遮罩，避免闪烁
  if (!showDetail.value) detail.value = undefined;
  query.page = 1;
  query.topicId = undefined;
  query.keyword = typeof route.query.keyword === 'string' ? route.query.keyword : '';
  query.categoryId = typeof route.query.categoryId === 'string' ? route.query.categoryId : undefined;
  query.tagId = typeof route.query.tagId === 'string' ? route.query.tagId : undefined;
  query.sortBy = sortOptions.some((item) => item.value === route.query.sortBy) ? (route.query.sortBy as NonNullable<CmsQuery['sortBy']>) : 'latest';
  try {
    if (kind.value && slug.value) {
      const row = await getDetail(kind.value, slug.value);
      if (current !== generation) return;
      detail.value = row;
      document.title = row.seoTitle || row.title;
      if (kind.value === 'topic') {
        // 专题可配置跳转目标（外链/文章/表单/栏目/单页），有落地地址时直接跳转，否则渲染本页内容
        if (row.type && row.type !== 1 && row.link) {
          if (row.type === 2) {
            if (row.openMode === 1) window.open(row.link, '_blank', 'noopener');
            else window.location.href = row.link;
          } else {
            router.replace(row.link);
          }
          return;
        }
        query.topicId = row.id;
        await fetchArticles();
      }
      if (kind.value === 'page' && row.kind === 2 && row.link) {
        if (row.target === 1) window.open(row.link, '_blank', 'noopener');
        else window.location.href = row.link;
        return;
      }
      if (kind.value === 'article') {
        commentPage.value = 1;
        await Promise.all([loadComments(), getDetailBlocks('content-detail-bottom').catch(() => undefined)]);
        try {
          await getRelated(slug.value);
        } catch {
          related.value = [];
        }
      }
    } else {
      // 区块按位置并行拉取，任一位置取不到不影响主流程
      await Promise.all([getHomeBanner('home-banner'), getHomeContent('home-content'), getSidebarPromos('sidebar')]).catch(() => undefined);
      const nav = await getNavigation();
      await getHome();
      let currentCategory: CmsOption | undefined;
      let parentHit: { title: string; slug: string } | undefined;
      activeCategory.value = undefined;
      parentCategory.value = undefined;
      if (route.name === 'cms-category') {
        // 逐层下钻并按栏目类型执行唯一的落地行为，直接访问错误的 category URL 也不会退化成全站文章。
        const findCategory = (items: CmsOption[], parent?: CmsOption): CmsOption | undefined => {
          for (const category of items) {
            if (category.slug === slug.value) {
              parentHit = parent ? { title: parent.title, slug: parent.slug } : undefined;
              return category;
            }
            const hit = category.children?.length ? findCategory(category.children, category) : undefined;
            if (hit) return hit;
          }
          return undefined;
        };
        currentCategory = findCategory(nav.categories ?? []);
        if (!currentCategory) throw new Error('栏目不存在或不可见');
        activeCategory.value = currentCategory;
        if (![1, 2, 6].includes(currentCategory.type ?? 1)) {
          if (!currentCategory.link) throw new Error('栏目跳转目标未配置');
          if (currentCategory.type === 3) {
            window.location.href = currentCategory.link;
          } else {
            router.replace(currentCategory.link);
          }
          return;
        }
        query.categoryId = currentCategory.id;
      }
      if (isTagPage.value) {
        const tag = (nav.tags || []).find((t) => t.slug === slug.value);
        query.categoryId = undefined;
        query.tagId = tag?.id;
        document.title = tag ? `标签：${tag.title} - 内容中心` : '内容中心';
      } else {
        query.tagId = undefined;
        document.title = currentCategory ? `${currentCategory.title} - 内容中心` : '内容中心';
      }
      parentCategory.value = parentHit;
      await fetchArticles();
    }
  } catch {
    if (current === generation) failed.value = true;
  } finally {
    if (current === generation) loading.value = false;
  }
};
onMounted(() => {
  watch(() => route.fullPath, load, { immediate: true });
  const startSlideTimer = () => {
    if (slideTimer || slides.value.length < 2) return;
    slideTimer = setInterval(() => {
      activeSlide.value = (activeSlide.value + 1) % slides.value.length;
    }, 4000);
  };
  const stopSlideTimer = () => {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = undefined;
  };
  watch(
    slides,
    (items) => {
      activeSlide.value = items.length ? activeSlide.value % items.length : 0;
      if (items.length > 1) startSlideTimer();
      else stopSlideTimer();
    },
    { immediate: true },
  );
  onBeforeUnmount(stopSlideTimer);
});
</script>

<style scoped>
.cms-container {
  min-height: 100vh;
  color: #253148;
}
.cms-main {
  max-width: 1400px;
  margin: 0 auto;
}
.hero-carousel {
  grid-column: 1 / -1;
  overflow: hidden;
  border-radius: 0 0 14px 14px;
  box-shadow: 0 12px 30px rgba(24, 45, 88, 0.12);
}
.cms-carousel {
  position: relative;
  height: 300px;
}
.cms-carousel-slide {
  display: none;
  height: 100%;
  &.is-active {
    display: block;
  }
}
.carousel-link {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.carousel-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 56px clamp(24px, 7vw, 86px);
  background: linear-gradient(90deg, rgba(13, 24, 48, 0.72), rgba(13, 24, 48, 0.12) 68%), linear-gradient(0deg, rgba(13, 24, 48, 0.78), transparent 58%);
}
.carousel-content {
  max-width: 720px;
  color: #fff;
}
.carousel-kicker {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.carousel-content h2 {
  margin: 10px 0 8px;
  font-size: 34px;
  line-height: 1.25;
}
.carousel-content p {
  margin: 0;
  line-height: 1.7;
  opacity: 0.9;
}
.content-layout {
  display: contents;
}
.home-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 22px;
  padding: 22px 28px 18px;
}
.home-container.is-list {
  grid-template-columns: minmax(0, 1fr);
}
.home-container.is-list .content-layout > .articles-section {
  grid-column: 1 / -1;
  /* 列表页没有轮播与区块流，必须显式落在第 1 行：否则仍占第 3 行，
     前两行的 22px 行间距会变成 44px 空白，把卡片整体往下顶。 */
  grid-row: 1;
}
.main-content {
  display: none;
}
.content-layout > .articles-section {
  grid-column: 1;
  grid-row: 3;
}
.content-layout > .sidebar {
  grid-column: 2;
  grid-row: 3;
}
.main-content {
  min-width: 0;
}
.articles-section {
  min-width: 0;
  padding: 0;
}
.filter-card .filter-select {
  width: 100%;
  margin-bottom: 10px;
}
.filter-card .filter-select:last-child {
  margin-bottom: 0;
}
.order-card .el-form-item {
  margin-bottom: 10px;
}
.order-card .el-input-number {
  width: 100%;
}
.order-query {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #edf0f5;
}
.order-query p {
  margin: 0;
  color: #566176;
  font-size: 12px;
  line-height: 1.5;
}
.panel,
.sidebar-card,
.detail-article,
.comments-section {
  background: #fff;
  border: 1px solid #e7ebf2;
  border-radius: 12px;
  box-shadow: 0 8px 26px rgba(30, 48, 90, 0.045);
}
.panel {
  margin-bottom: 22px;
  padding: 24px;
}
.list-panel {
  padding: 20px;
}
.list-panel .articles-header {
  margin: 0 0 16px;
  padding: 0 0 16px;
  border-bottom: 1px solid #edf0f5;
}
.list-panel .articles-grid {
  gap: 14px;
}
.section-header,
.articles-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.section-title,
.sidebar-title {
  margin: 0;
  color: #202b3d;
  font-size: 20px;
  font-weight: 700;
}
.eyebrow {
  display: block;
  margin-bottom: 7px;
  color: #202b3d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.article-total {
  color: #929baa;
  font-size: 13px;
}
.tags-grid,
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.tag-button,
.tag-cloud button,
.tag-cloud a.tag-link {
  padding: 5px 10px;
  color: #667085;
  font-size: 12px;
  line-height: 1.4;
  text-decoration: none;
  border: 1px solid #e5e9f0;
  border-radius: 999px;
  background: #f8fafc;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s;
}
.tag-button:hover,
.tag-button.active,
.tag-cloud button:hover,
.tag-cloud button.active,
.tag-cloud a.tag-link:hover,
.tag-cloud a.tag-link.active {
  color: #181c28;
  border-color: #d3d9e3;
  background: #f1f3f7;
}
.tag-cloud {
  align-items: stretch;
  column-gap: 6px;
  row-gap: 8px;
  display: flex;
  flex-wrap: wrap;
}
.tag-cloud button {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  padding: 4px 8px;
  white-space: nowrap;
}
.text-action {
  color: #454b5c;
  border: 0;
  background: none;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}
.text-action:hover {
  color: #181c28;
}
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.recommend-card {
  display: grid;
  grid-template-columns: 42% minmax(0, 1fr);
  min-height: 178px;
  overflow: hidden;
  border: 1px solid #e6eaf1;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transform: translateY(0);
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}
.recommend-card:hover,
.recommend-card:focus-visible {
  border-color: #d3d9e3;
  box-shadow: 0 12px 26px rgba(44, 68, 126, 0.12);
  transform: translateY(-4px);
  outline: none;
}
.recommend-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.32s ease;
}
.recommend-card:hover img,
.recommend-card:focus-visible img {
  transform: scale(1.035);
}
.recommend-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 17px;
  background: #fff;
}
.recommend-body h4 {
  margin: 0 0 9px;
  font-size: 16px;
  line-height: 1.45;
  transition: color 0.2s ease;
}
.recommend-card:hover h4,
.recommend-card:focus-visible h4 {
  color: #181c28;
}
.recommend-body p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #737e90;
  font-size: 13px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
  color: #98a1af;
  font-size: 12px;
}
.block-stream {
  display: grid;
  grid-column: 1 / -1;
  grid-row: 2;
  gap: 18px;
  margin: 0;
}
.block-panel {
  padding: 22px 24px;
}
/* 配了封面图时区块采用左图右文，让图片与文字的对应关系一目了然 */
.block-panel.has-cover,
.detail-block.has-cover {
  display: flex;
  align-items: stretch;
  gap: 20px;
}
.block-panel.has-cover .block-cover,
.detail-block.has-cover .block-cover {
  width: 240px;
  flex: 0 0 240px;
  height: auto;
  max-height: none;
  border-radius: 10px;
}
.block-body {
  min-width: 0;
  flex: 1;
}
.detail-blocks {
  display: grid;
  gap: 16px;
  margin-top: 26px;
  padding-top: 24px;
  border-top: 1px solid #edf0f5;
}
.detail-block {
  padding: 20px;
}
.detail-block .section-title {
  margin-bottom: 8px;
  font-size: 17px;
}
.block-panel :deep(.cms-preview),
.detail-block :deep(.cms-preview) {
  margin-top: 6px;
}
.block-link {
  display: inline-block;
  margin-top: 12px;
  color: #454b5c;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.block-link:hover {
  color: #181c28;
}
.recommend-cat-section {
  padding: 22px 24px;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 18px;
}
.cat-card {
  display: block;
  overflow: hidden;
  border: 1px solid #e6eaf1;
  border-radius: 8px;
  background: #fff;
  text-decoration: none;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}
.cat-card:hover {
  border-color: #d3d9e3;
  box-shadow: 0 12px 26px rgba(44, 68, 126, 0.12);
  transform: translateY(-4px);
}
.cat-card img {
  width: 100%;
  height: 116px;
  object-fit: cover;
}
.cat-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
}
.cat-body h4 {
  margin: 0;
  font-size: 15px;
  color: #202b3d;
}
.cat-body span {
  color: #454b5c;
  font-size: 12px;
  transition: color 0.2s;
}
.cat-card:hover .cat-body span,
.cat-card:focus-visible .cat-body span {
  color: #181c28;
}
.ad-sidebar .ad-item {
  display: block;
  overflow: hidden;
  margin-bottom: 12px;
  border-radius: 8px;
  text-decoration: none;
}
.ad-sidebar .ad-item:last-child {
  margin-bottom: 0;
}
.ad-sidebar .ad-item img {
  width: 100%;
  border-radius: 8px;
}
.ad-sidebar .ad-item.is-static {
  cursor: default;
}
.ad-sidebar .ad-item > span {
  display: block;
  padding: 12px 14px;
  background: #fafbfd;
  color: #566176;
  font-size: 13px;
  border: 1px solid #eef0f5;
  border-radius: 8px;
}
.tag-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 18px;
  padding: 16px 22px;
  background: #fff;
  border: 1px solid #e7ebf2;
  border-radius: 12px;
}
.tag-banner h3 {
  margin: 0;
  font-size: 18px;
  color: #202b3d;
}
.me-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: 13px;
  color: #929baa;
}
.me-breadcrumb a {
  color: #5b6478;
  text-decoration: none;
  transition: color 0.2s;
}
.me-breadcrumb a:hover {
  color: var(--el-color-primary, #2f6bff);
}
.me-breadcrumb-sep {
  margin: 0 8px;
  color: #c6cdd9;
}
.me-breadcrumb-plain,
.me-breadcrumb-current {
  color: #202b3d;
  font-weight: 600;
}
.related-section {
  margin: 30px 0 0;
  padding: 24px 0 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}
.related-section .section-header {
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eef0f5;
}
.related-section .articles-grid {
  gap: 12px;
}
.block-cover {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
}
.sidebar {
  min-width: 0;
}
.sidebar-card {
  margin-bottom: 18px;
  padding: 18px;
}
.sidebar-card .tag-cloud {
  gap: 7px;
  margin-top: 0;
}
.sidebar-title {
  margin-bottom: 15px;
  font-size: 16px;
}
/* 侧栏「热门排行」卡片：标题与「更多」按文字基线对齐，列表紧贴标题，末条不再留分隔线 */
.sidebar-card .section-header {
  align-items: baseline;
  gap: 10px;
  margin-bottom: 0;
}
.sidebar-card .section-header .sidebar-title {
  margin-bottom: 0;
}
.sidebar-card .section-header + .rank-item {
  margin-top: 10px;
}
.rank-item,
.category-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  color: inherit;
  text-align: left;
  text-decoration: none;
  border: 0;
  border-bottom: 1px solid #f0f2f6;
  background: transparent;
  cursor: pointer;
}
/* 排行条目：序号与标题首行顶部对齐，行距收紧，末条去掉分隔线 */
.rank-item {
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
}
.rank-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.rank-item:hover .rank-copy strong {
  color: #181c28;
}
.rank-number {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  margin-top: 1px;
  place-items: center;
  color: #8e98a8;
  border-radius: 5px;
  background: #f2f4f7;
}
.rank-number.top {
  color: #fff;
  background: #f05b65;
}
.rank-copy {
  min-width: 0;
}
.rank-copy strong {
  display: block;
  overflow: hidden;
  color: #394459;
  font-size: 13px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-copy small {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  color: #a0a8b5;
}
.category-item {
  justify-content: space-between;
  color: #454b5c;
  transition: color 0.2s;
}
.category-item:hover {
  color: #181c28;
}
.category-item span:last-child {
  color: #454b5c;
  font-size: 12px;
  transition: color 0.2s;
}
.category-item:hover span:last-child {
  color: #181c28;
}
.articles-section {
  padding: 0;
}
.articles-heading {
  align-items: center;
}
/* 面包屑 + 篇数同行展示，去掉面包屑单独占行留下的底部间距 */
.articles-topline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
}
.articles-topline .me-breadcrumb {
  margin-bottom: 0;
}

.articles-header {
  margin-bottom: 20px;
  padding: 22px 24px 20px;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #edf0f5;
  border-radius: 10px;
  background: #f7f9fc;
}
.search-field {
  display: flex;
  height: 38px;
  min-width: 260px;
  flex: 1 1 300px;
  align-items: center;
  overflow: hidden;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  background: #fff;
}
.search-field:focus-within {
  border-color: #202b3d;
  box-shadow: 0 0 0 3px rgba(32, 43, 61, 0.1);
}
.search-field svg {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin-left: 12px;
  fill: none;
  stroke: #9aa4b5;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.search-field input {
  min-width: 0;
  height: 100%;
  flex: 1;
  padding: 0 9px;
  font: inherit;
  font-size: 13px;
  border: 0;
  outline: 0;
}
.clear-search {
  width: 28px;
  height: 28px;
  color: #a4adbb;
  font-size: 20px;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.search-submit {
  height: 38px;
  padding: 0 18px;
  color: #fff;
  font-weight: 600;
  border: 0;
  background: #202b3d;
  cursor: pointer;
}
.filter-select {
  min-width: 140px;
}
.sort-tabs {
  display: flex;
  gap: 3px;
  margin-left: auto;
  padding: 3px;
  align-items: center;
  border: 1px solid #e1e6ef;
  border-radius: 8px;
  background: #fff;
}
.sort-tabs > span {
  padding: 0 7px;
  color: #99a2b0;
  font-size: 12px;
}
.sort-tab {
  padding: 7px 10px;
  color: #687385;
  font-size: 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}
.sort-tab:hover,
.sort-tab.active {
  color: #181c28;
  background: #eef1f5;
}
.articles-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
}
.pagination,
.comment-pagination {
  justify-content: center;
  margin-top: 24px;
}
.comment-pagination {
  padding-top: 16px;
  border-top: 1px solid #edf0f4;
}
.detail-container {
  max-width: 940px;
  margin: 0 auto;
  padding: 28px;
}
.detail-skeleton {
  max-width: 940px;
  min-height: 70vh;
  margin: 0 auto;
  padding: 40px 28px;
  background: #fff;
  border: 1px solid #e7ebf2;
  border-radius: 12px;
  box-shadow: 0 8px 26px rgba(30, 48, 90, 0.045);
}
.breadcrumb-link {
  display: inline-flex;
  margin-bottom: 16px;
  color: #566176;
}
.detail-article,
.comments-section {
  margin-bottom: 20px;
  padding: 36px;
}
.detail-title {
  margin: 0 0 16px;
  font-size: 34px;
  line-height: 1.35;
}
.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  color: #929baa;
  font-size: 13px;
}
.detail-meta .meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.detail-cover {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  border-radius: 8px;
}
.detail-summary {
  margin: 24px 0;
  padding: 18px 20px;
  color: #5b6678;
  line-height: 1.8;
  border-left: 3px solid #202b3d;
  background: #f7f9fc;
}
.detail-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 22px 0 28px;
  padding: 18px 20px;
  border: 1px solid #e3e7ee;
  background: #f7f8fa;
}
.download-actions {
  border-color: #cdeedd;
  background: #f3fbf6;
}
.download-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}
.download-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #7c8796;
  font-size: 12px;
}
.download-meta strong {
  color: #1f8a4c;
  font-size: 15px;
}
.detail-actions > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}
.detail-actions strong {
  color: #2d3b57;
  font-size: 15px;
}
.detail-actions span,
.sidebar-hint {
  color: #8993a3;
  font-size: 13px;
  line-height: 1.6;
}
.order-article {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 18px;
  padding: 14px 16px;
  border: 1px solid #e2e8f4;
  border-radius: 6px;
  background: #f7f9fd;
}
.order-article span {
  color: #8993a3;
  font-size: 12px;
}
.order-article strong {
  color: #28354d;
  font-size: 15px;
  line-height: 1.5;
}
.order-article small {
  color: #6f7e96;
  font-size: 12px;
}
.order-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.order-form-grid.quantity-row {
  grid-template-columns: 160px;
}
.comment-login-gate {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 24px;
  padding: 18px 20px;
  border: 1px solid #e4eaf5;
  background: #f8faff;
}
.comment-login-gate > div:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}
.comment-login-gate strong {
  color: #24324a;
  font-size: 15px;
}
.comment-login-gate span {
  color: #8490a3;
  font-size: 13px;
}
.comment-login-avatar {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  background: #5d73df;
  border-radius: 50%;
}
.comment-login-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 4px 0 12px;
}
.comment-login-dialog-icon {
  display: flex;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  background: #5d73df;
  border-radius: 50%;
}
.comment-login-dialog-content strong {
  display: block;
  margin: 2px 0 8px;
  color: #24324a;
  font-size: 16px;
}
.comment-login-dialog-content p {
  margin: 0;
  color: #8490a3;
  font-size: 13px;
  line-height: 1.7;
}
.comment-editor {
  margin: 18px 0 22px;
  padding: 16px;
  border: 1px solid #e7ebf1;
  border-radius: 6px;
  background: #fafbfc;
}
.comment-editor-identity {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 12px;
  color: #253149;
  font-size: 14px;
}
.comment-editor-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  overflow: hidden;
  place-items: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 50%;
  background: #5b72e8;
}
.comment-editor-avatar img,
:deep(.comment-avatar img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.comment-editor :deep(.el-textarea__inner) {
  min-height: 96px !important;
  padding: 12px 14px;
  line-height: 1.65;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dfe4ec inset;
}
.comment-editor :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #6b86ee inset;
}
.comment-editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: #929cab;
  font-size: 12px;
}
.comment-list {
  margin-top: 2px;
}
:deep(.comment-thread) {
  border-bottom: 1px solid #edf0f4;
}
:deep(.comment-node) {
  display: flex;
  gap: 12px;
}
:deep(.comment-node.is-root) {
  padding: 20px 0 18px;
}
:deep(.comment-main) {
  min-width: 0;
  flex: 1;
}
:deep(.comment-avatar) {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  overflow: hidden;
  place-items: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 50%;
  background: #5b72e8;
}
:deep(.comment-replies) {
  margin: 0 0 4px 48px;
}
:deep(.comment-node.is-reply) {
  gap: 10px;
  padding: 13px 0;
  border-top: 1px solid #f0f2f5;
}
:deep(.comment-node.is-reply .comment-avatar) {
  width: 30px;
  height: 30px;
  flex-basis: 30px;
  font-size: 12px;
}
:deep(.comment-author) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  min-height: 22px;
}
:deep(.comment-author strong) {
  color: #30394b;
  font-size: 14px;
  font-weight: 600;
}
:deep(.comment-author span) {
  color: #a0a8b5;
  font-size: 12px;
}
:deep(.comment-author em) {
  color: #647fe7;
  font-size: 13px;
  font-style: normal;
}
:deep(.comment-content) {
  margin: 4px 0 6px;
  color: #3f4a5e;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
}
:deep(.comment-actions) {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 20px;
  color: #a0a8b5;
  font-size: 12px;
}
:deep(.comment-actions button) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 1px 0;
  color: #8b95a5;
  font-size: 12px;
  border: 0;
  background: none;
  cursor: pointer;
}
:deep(.comment-actions .comment-time) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
:deep(.comment-actions button:hover),
:deep(.comment-actions button.active) {
  color: #181c28;
}
/* 未登录时回复/举报按钮置灰（仍可点击，由评论区统一引导登录） */
:deep(.comment-actions button.disabled) {
  color: #c3c9d4;
  cursor: pointer;
}
:deep(.comment-actions button.disabled:hover) {
  color: #c3c9d4;
}
:deep(.inline-reply-editor) {
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid #cfd6e2;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(32, 43, 61, 0.04);
}
:deep(.inline-reply-editor textarea) {
  display: block;
  width: 100%;
  min-height: 76px;
  resize: vertical;
  padding: 11px 13px;
  color: #39465d;
  font: inherit;
  font-size: 13px;
  line-height: 1.65;
  border: 0;
  outline: 0;
  box-sizing: border-box;
}
:deep(.inline-reply-editor textarea::placeholder) {
  color: #a1a9b6;
}
:deep(.inline-reply-footer) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 7px 9px;
  color: #98a1af;
  font-size: 11px;
}
:deep(.inline-reply-footer button) {
  min-width: 64px;
  height: 30px;
  color: #fff;
  border: 0;
  border-radius: 4px;
  background: #202b3d;
  cursor: pointer;
}
:deep(.inline-reply-footer button:disabled) {
  background: #c2c9d4;
  cursor: not-allowed;
}
.report-target {
  margin: 0 0 12px;
  color: #69758a;
  font-size: 13px;
}
:deep(.comment-reply-action) {
  padding: 0;
  color: #71809a;
  font-size: 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
}
:deep(.comment-reply-action:hover) {
  color: #181c28;
}
:deep(.comment-children) {
  margin-left: 48px;
}
.comment-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 28px 12px 8px;
  color: #9aa4b3;
}
.comment-empty strong {
  color: #667085;
  font-size: 14px;
}
.comment-empty span {
  font-size: 13px;
}
.comment-reply p {
  margin-bottom: 0;
}
@media (max-width: 1024px) {
  .home-container {
    grid-template-columns: 1fr;
  }
  .content-layout > .articles-section,
  .content-layout > .sidebar {
    grid-column: 1;
  }
  .content-layout > .articles-section {
    grid-row: 3;
  }
  .content-layout > .sidebar {
    grid-row: 4;
  }
  .sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .sidebar-card {
    margin-bottom: 0;
  }
}
@media (max-width: 768px) {
  .hero-carousel {
    border-radius: 0 0 10px 10px;
  }
  .carousel-overlay {
    padding: 28px 20px;
  }
  .carousel-content h2 {
    font-size: 23px;
  }
  .home-container {
    padding: 16px;
  }
  .content-layout {
    grid-template-columns: 1fr;
    padding: 0;
  }
  .articles-section {
    padding: 0;
  }
  .sidebar {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .panel {
    padding: 18px;
  }
  .recommend-grid {
    grid-template-columns: 1fr;
  }
  .recommend-card {
    grid-template-columns: 38% minmax(0, 1fr);
    min-height: 154px;
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-field,
  .filter-select {
    width: 100%;
    min-width: 0;
    flex-basis: auto;
  }
  .sort-tabs {
    width: 100%;
    margin-left: 0;
    overflow-x: auto;
  }
  .articles-header {
    padding: 18px;
  }
  .detail-container {
    padding: 16px;
  }
  .detail-article,
  .comments-section {
    padding: 22px 18px;
  }
  .detail-title {
    font-size: 26px;
  }
  .block-panel.has-cover,
  .detail-block.has-cover {
    flex-direction: column;
    gap: 14px;
  }
  .block-panel.has-cover .block-cover,
  .detail-block.has-cover .block-cover {
    width: 100%;
    flex: 0 0 auto;
    aspect-ratio: 16 / 9;
  }
  :deep(.comment-replies) {
    margin-left: 40px;
  }
  :deep(.comment-node) {
    gap: 10px;
  }
  :deep(.comment-node.is-reply .comment-avatar) {
    width: 28px;
    height: 28px;
    flex-basis: 28px;
  }
  .comment-editor-footer {
    align-items: flex-end;
  }
}
@media (max-width: 520px) {
  .comment-editor {
    padding: 14px;
  }
  .order-form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .order-form-grid.quantity-row {
    grid-template-columns: 1fr;
  }
  .order-form-grid.quantity-row :deep(.el-input-number) {
    width: 100%;
  }
  .comment-editor-footer {
    flex-direction: column;
  }
  .comment-editor-footer :deep(.el-button) {
    width: 100%;
  }
  :deep(.comment-replies) {
    margin-left: 18px;
  }
  :deep(.comment-node.is-reply) {
    padding: 12px 0;
  }
  :deep(.comment-author) {
    gap: 4px;
  }
  :deep(.comment-content) {
    font-size: 13px;
  }
}
</style>
