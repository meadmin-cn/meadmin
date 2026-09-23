<template>
  <section class="message-page">
    <div class="message-shell">
      <header class="page-heading">
        <div>
          <span class="page-kicker">交流反馈</span>
          <h1>留言板</h1>
          <p>欢迎提出建议或反馈问题，公开留言会在审核后展示。</p>
        </div>
        <el-button type="primary" @click="editorOpen = !editorOpen">{{ editorOpen ? '收起留言' : '发布留言' }}</el-button>
      </header>

      <section v-show="editorOpen" class="message-editor">
        <div class="editor-heading">
          <div>
            <h2>写下留言</h2>
            <p>联系方式仅管理员可见，请尽量说明具体场景。</p>
          </div>
          <button type="button" aria-label="关闭留言表单" @click="editorOpen = false">×</button>
        </div>
        <el-form label-position="top" class="message-form">
          <el-form-item label="称呼"><el-input v-model="form.author" maxlength="80" placeholder="怎么称呼你" /></el-form-item>
          <el-form-item label="联系方式"><el-input v-model="form.contact" maxlength="160" placeholder="手机号或邮箱，仅管理员可见" /></el-form-item>
          <el-form-item label="留言内容" class="content-field"><el-input v-model="form.content" type="textarea" :rows="4" maxlength="2000" show-word-limit placeholder="请输入具体问题或建议" /></el-form-item>
          <div class="submit-row"><span>留言提交后需经管理员审核</span><el-button type="primary" :loading="submitting" @click="submit">提交留言</el-button></div>
        </el-form>
      </section>

      <section class="message-stream">
        <div class="stream-header">
          <div>
            <h2>公开留言</h2>
            <span>共 {{ data?.total ?? 0 }} 条</span>
          </div>
          <button type="button" @click="load">刷新列表</button>
        </div>
        <div v-loading="loading" class="stream-list">
          <article v-for="item in data?.list" :key="`${item.author}-${item.createdAt}`" class="message-item">
            <div class="message-avatar">{{ item.author.slice(0, 1) }}</div>
            <div class="message-copy">
              <header>
                <strong>{{ item.author }}</strong
                ><time>{{ item.createdAt.slice(0, 10) }}</time>
              </header>
              <p>{{ item.content }}</p>
              <div v-if="item.reply" class="reply">
                <span>管理员回复</span>
                <p>{{ item.reply }}</p>
              </div>
            </div>
          </article>
          <div v-if="data && !data.total" class="empty-state"><strong>暂无公开留言</strong><span>点击右上角“发布留言”提交第一条建议</span></div>
        </div>
        <el-pagination v-if="data?.total" v-model:current-page="page" :page-size="pageSize" :total="data.total" layout="prev,pager,next" class="pagination" @current-change="load" />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import { createMessageApi, messagesApi } from '../api/cms';

const form = reactive({ author: '', contact: '', content: '' });
const editorOpen = ref(false);
const submitting = ref(false);
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
const { data, runAsync: fetchMessages } = messagesApi();
const { runAsync: create } = createMessageApi();
const load = async () => {
  loading.value = true;
  try {
    await fetchMessages({ page: page.value, pageSize });
  } finally {
    loading.value = false;
  }
};
const submit = async () => {
  if (!form.author.trim() || !form.content.trim()) {
    ElMessage.warning('请填写称呼和留言内容');
    return;
  }
  submitting.value = true;
  try {
    await create({ ...form });
    form.content = '';
    editorOpen.value = false;
    ElMessage.success('留言已提交，审核后公开展示');
  } finally {
    submitting.value = false;
  }
};
await load();
</script>

<style scoped>
.message-page {
  min-height: 100%;
  padding: 28px 20px 60px;
  color: #273248;
  background: #f4f6f9;
  box-sizing: border-box;
}
.message-shell {
  width: min(100%, 960px);
  margin: 0 auto;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 4px 4px 22px;
}
.page-kicker {
  color: #2b5cff;
  font-size: 12px;
  font-weight: 700;
}
.page-heading h1 {
  margin: 7px 0 6px;
  color: #202b3e;
  font-size: 28px;
  line-height: 1.25;
}
.page-heading p {
  margin: 0;
  color: #7a8597;
  font-size: 14px;
  line-height: 1.7;
}
.message-editor,
.message-stream {
  border: 1px solid #e3e8ef;
  background: #fff;
  box-shadow: 0 3px 12px rgba(32, 47, 78, 0.035);
}
.message-editor {
  margin-bottom: 14px;
  padding: 18px 20px 20px;
}
.editor-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
  padding-bottom: 13px;
  border-bottom: 1px solid #edf0f4;
}
.editor-heading h2,
.stream-header h2 {
  margin: 0;
  color: #273248;
  font-size: 16px;
}
.editor-heading p {
  margin: 5px 0 0;
  color: #8a94a5;
  font-size: 12px;
}
.editor-heading button {
  width: 28px;
  height: 28px;
  padding: 0;
  color: #8b95a5;
  font-size: 22px;
  line-height: 1;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.message-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
}
.message-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.message-form :deep(.el-form-item__label) {
  padding-bottom: 5px;
  color: #59667a;
  font-size: 12px;
}
.message-form :deep(.el-input__wrapper),
.message-form :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dfe5ee inset;
}
.content-field,
.submit-row {
  grid-column: 1 / -1;
}
.message-form :deep(.el-textarea__inner) {
  min-height: 104px !important;
  line-height: 1.65;
}
.submit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.submit-row span {
  color: #9aa3b1;
  font-size: 12px;
}
.message-stream {
  padding: 0 20px 22px;
}
.stream-header {
  display: flex;
  height: 54px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e7ebf1;
}
.stream-header > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.stream-header span {
  color: #929baa;
  font-size: 12px;
}
.stream-header button {
  padding: 4px 0;
  color: #2b5cff;
  font-size: 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.message-item {
  display: flex;
  gap: 14px;
  padding: 18px 4px;
  border-bottom: 1px solid #edf0f4;
}
.message-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 4px;
  background: #5b72e8;
}
.message-copy {
  min-width: 0;
  flex: 1;
}
.message-copy header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.message-copy header strong {
  color: #34415a;
  font-size: 14px;
}
.message-copy time {
  color: #a0a8b5;
  font-size: 11px;
}
.message-copy > p {
  margin: 7px 0 0;
  color: #566176;
  font-size: 13px;
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.reply {
  margin-top: 12px;
  padding: 10px 12px;
  border-left: 2px solid #5b72e8;
  background: #f6f8fc;
}
.reply span {
  color: #526079;
  font-size: 11px;
  font-weight: 700;
}
.reply p {
  margin: 4px 0 0;
  color: #647084;
  font-size: 12px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
.empty-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #98a1af;
}
.empty-state strong {
  color: #606b7e;
}
.empty-state span {
  font-size: 12px;
}
.pagination {
  justify-content: center;
  margin-top: 22px;
}
@media (max-width: 620px) {
  .message-page {
    padding: 20px 12px 44px;
  }
  .page-heading {
    align-items: flex-start;
    gap: 14px;
    padding: 2px 2px 18px;
  }
  .page-heading h1 {
    font-size: 24px;
  }
  .page-heading p {
    font-size: 13px;
  }
  .page-heading :deep(.el-button) {
    flex: 0 0 auto;
    margin-top: 18px;
    padding-right: 12px;
    padding-left: 12px;
  }
  .message-editor,
  .message-stream {
    padding-right: 14px;
    padding-left: 14px;
  }
  .message-form {
    grid-template-columns: 1fr;
  }
  .content-field,
  .submit-row {
    grid-column: auto;
  }
  .submit-row {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
  .submit-row :deep(.el-button) {
    width: 100%;
  }
  .message-item {
    gap: 10px;
    padding: 16px 0;
  }
  .message-avatar {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }
  .message-copy header {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
