<template>
  <page>
    <div class="site-workspace">
      <aside class="site-panel">
        <div class="panel-header">
          <span class="panel-title">站点</span>
          <el-button v-if="permission('system_site_add')" type="primary" size="small" @click="openSiteDialog()">新增站点</el-button>
        </div>
        <el-empty v-if="!siteList.length" description="暂无站点，请先新增" :image-size="72" />
        <div v-else class="site-list">
          <div v-for="site in siteList" :key="site.id" class="site-item" :class="{ 'is-active': site.id === selectedSiteId }" @click="selectSite(site.id)">
            <div class="site-item-main">
              <div class="site-name">
                <span>{{ site.name }}</span>
                <el-tag size="small" :type="site.status === 1 ? 'success' : 'info'">{{ site.status === 1 ? '启用' : '禁用' }}</el-tag>
              </div>
              <div class="site-domains">{{ site.domains.length ? site.domains.join('、') : '未绑定域名' }}</div>
              <div class="site-meta">根路径：{{ site.basePath || '未设置' }}</div>
            </div>
            <div class="site-actions" @click.stop>
              <el-button v-if="permission('system_site_edit')" link type="primary" @click="openSiteDialog(site)">编辑</el-button>
              <el-button v-if="permission('system_site_del')" link type="danger" @click="removeSite(site)">删除</el-button>
            </div>
          </div>
        </div>
      </aside>

      <section class="rule-panel">
        <div class="panel-header">
          <div class="rule-title">
            <span class="panel-title">伪静态规则</span>
            <span v-if="selectedSite" class="rule-subtitle">{{ selectedSite.name }} · {{ selectedSite.basePath || '未设置根路径' }}</span>
          </div>
          <div class="rule-toolbar">
            <el-button link type="primary" @click="helpVisible = !helpVisible">{{ helpVisible ? '收起语法说明' : '查看语法说明' }}</el-button>
            <el-button v-if="selectedSite && permission('system_rewrite_add')" type="primary" @click="openRuleDialog()">新增规则</el-button>
          </div>
        </div>
        <div v-show="helpVisible" class="rule-help">
          <div class="help-head">
            <span class="help-title">URL 模式语法</span>
            <span class="help-tip">与 nginx location 写法保持一致，地址栏保留伪静态地址，路由命中真实前端路由</span>
          </div>
          <div class="help-lead">常规路由<b>不需要在这里配置</b>：站点的「根路径映射」已经让该前缀下的所有路由自动对外去掉前缀（<code>/aon/cms/article/:slug</code> → <code>/article/:slug</code>）。规则只用于特例，例如给内容页追加 <code>.html</code> 后缀、或把某个路径改写到别的前缀。</div>
          <table class="help-table">
            <thead>
              <tr>
                <th class="col-modifier">修饰符</th>
                <th class="col-pattern">写法示例</th>
                <th>匹配规则</th>
                <th class="col-target">对应目标路由</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>=</code></td>
                <td><code>= /</code></td>
                <td>精确匹配，只命中这一个地址</td>
                <td><code>/aon/cms</code></td>
              </tr>
              <tr>
                <td><code>^~</code></td>
                <td><code>^~ /category/:slug</code></td>
                <td>前缀匹配，优先级高于正则</td>
                <td><code>/aon/cms/category/:slug</code></td>
              </tr>
              <tr>
                <td><code>~</code></td>
                <td><code>~ ^/category/([^/]+)$</code></td>
                <td>正则匹配，捕获分组顺序对应目标路由的参数</td>
                <td><code>/aon/cms/category/:slug</code></td>
              </tr>
              <tr>
                <td><code>~*</code></td>
                <td><code>~* ^/News/([^/]+)$</code></td>
                <td>同正则，忽略大小写</td>
                <td><code>/aon/cms/article/:slug</code></td>
              </tr>
              <tr>
                <td><span class="modifier-none">无</span></td>
                <td><code>/article/:slug</code></td>
                <td>路径模板，参数名需与目标路由一致</td>
                <td><code>/aon/cms/article/:slug</code></td>
              </tr>
            </tbody>
          </table>
          <div class="help-note">匹配优先级：<code>=</code> 精确 &gt; <code>^~</code> 前缀 &gt; <code>~</code> / <code>~*</code> 正则 &gt; 无修饰符；同级前缀越长越优先。 正则分组按顺序对应目标路由的参数，也可在目标路由里用 <code>$1</code>、<code>$2</code> 引用。 分组不能跨路径段（斜杠需写进字符类，如 <code>[^/]+</code>），不支持前瞻、非捕获分组与顶层通配符。 路由匹配本身不区分大小写，<code>~</code> 与 <code>~*</code> 实际行为一致，保留 <code>~*</code> 只为兼容 nginx 写法习惯。</div>
        </div>
        <el-empty v-if="!selectedSite" description="请选择左侧站点" />
        <div v-else class="rule-table">
          <el-table v-loading="rulesLoading" :data="rules?.list ?? []" height="100%" border empty-text="常规路由已由根路径映射自动接管，这里只需添加特例（如 .html 后缀）">
            <el-table-column label="匹配类型" width="126">
              <template #default="{ row }">
                <el-tag size="small" :type="modifierTagType(compiledOf(row)?.modifier)">{{ modifierLabel(compiledOf(row)?.modifier) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="pattern" label="URL 模式" min-width="200" show-overflow-tooltip />
            <el-table-column label="生效地址" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <code v-if="compiledOf(row)?.ok" class="pattern-text">{{ compiledOf(row)?.alias }}</code>
                <el-tooltip v-else :content="compiledOf(row)?.error ?? 'URL 模式无法编译'" placement="top">
                  <el-tag size="small" type="danger">无法编译</el-tag>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="目标路由" min-width="200" show-overflow-tooltip />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderNum" label="排序" width="80" />
            <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button v-if="permission('system_rewrite_edit')" link type="primary" @click="openRuleDialog(row)">编辑</el-button>
                <el-button v-if="permission('system_rewrite_del')" link type="danger" @click="removeRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>
    </div>

    <me-dialog v-model="siteDialogVisible" :title="siteForm.id ? '编辑站点' : '新增站点'" width="560px" destroy-on-close>
      <el-form label-width="110px">
        <el-form-item label="站点名称" required>
          <el-input v-model="siteForm.name" maxlength="100" placeholder="如：CMS 站" />
        </el-form-item>
        <el-form-item label="绑定域名">
          <el-input v-model="siteForm.domainsText" type="textarea" :rows="4" placeholder="每行一个域名，如：&#10;cms.meadmin.cn&#10;*.example.com" />
          <div class="form-tip">不含协议与端口；支持 *.example.com 通配子域名。</div>
        </el-form-item>
        <el-form-item label="根路径映射">
          <el-input v-model="siteForm.basePath" placeholder="如：/aon/cms" />
          <div class="form-tip">填写该站点真实路由前缀（CMS 为 <code>/aon/cms</code>）。该前缀下的所有前端路由会自动对外去掉前缀，例如 <code>/aon/cms/category/:slug</code> → <code>/category/:slug</code>、<code>/aon/cms</code> → <code>/</code>，无需逐条配置规则。留空表示不映射。</div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="siteForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="siteForm.orderNum" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="siteForm.remark" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <me-button @click="siteDialogVisible = false">取消</me-button>
        <me-button type="primary" :loading="savingSite" @click="saveSite">保存</me-button>
      </template>
    </me-dialog>

    <me-dialog v-model="ruleDialogVisible" :title="ruleForm.id ? '编辑规则' : '新增规则'" width="620px" destroy-on-close>
      <el-form label-width="110px">
        <el-form-item label="URL 模式" required>
          <el-input v-model="ruleForm.pattern" placeholder="如：= / 或 ~ ^/category/([^/]+)$" />
          <div class="form-tip">支持 <code>=</code> 精确、<code>^~</code> 前缀优先、<code>~</code> / <code>~*</code> 正则，也可直接写 <code>/article/:slug</code> 路径模板。</div>
        </el-form-item>
        <el-form-item label="目标路由" required>
          <el-input v-model="ruleForm.target" placeholder="如：/aon/cms/category/:slug" />
          <div class="form-tip">真实前端路由。正则分组按顺序对应目标路由的参数，也可用 <code>$1</code>、<code>$2</code> 引用。</div>
        </el-form-item>
        <el-form-item label="示例">
          <div class="example-list">
            <el-button v-for="example in ruleExamples" :key="example.pattern" size="small" plain @click="applyExample(example)">{{ example.label }}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="编译结果">
          <div class="compile-preview" :class="{ 'is-error': compileState.error }">
            <template v-if="compileState.error">{{ compileState.error }}</template>
            <template v-else-if="compileState.alias">
              <div>
                生效地址：<code>{{ compileState.alias }}</code>
              </div>
              <div>
                命中路由：<code>{{ compileState.target }}</code>
              </div>
            </template>
            <template v-else>填写 URL 模式与目标路由后自动校验</template>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="ruleForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="ruleForm.orderNum" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="ruleForm.remark" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <me-button @click="ruleDialogVisible = false">取消</me-button>
        <me-button type="primary" :loading="savingRule" @click="saveRule">保存</me-button>
      </template>
    </me-dialog>
  </page>
</template>

<script setup lang="ts" name="SystemSite">
import type { SystemRewriteCompiled, SystemRewriteInfo, SystemSiteInfo } from '@/api/site';
import { createRewrite, createSite, previewRewrite, removeRewriteInfo, removeSiteInfo, saveRewriteInfo, saveSiteInfo, systemRewriteListApi, SystemRewriteListParam, systemSiteAllApi } from '@/api/site';
import { permission } from '@/utils/permission.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, nextTick, reactive, ref, watch } from 'vue';

const { data: sites, runAsync: loadSites } = systemSiteAllApi();
const siteList = computed(() => sites.value ?? []);
const selectedSiteId = ref('');
const selectedSite = computed(() => siteList.value.find((site) => site.id === selectedSiteId.value));

const ruleParams = reactive(new SystemRewriteListParam());
const { data: rules, loading: rulesLoading, runAsync: loadRules } = systemRewriteListApi();

const selectSite = (id: string) => {
  if (selectedSiteId.value === id) return;
  selectedSiteId.value = id;
  void refreshRules();
};

const refreshRules = async () => {
  if (!selectedSiteId.value) return;
  ruleParams.siteId = selectedSiteId.value;
  await loadRules(ruleParams);
};

const refreshSites = async (keepId?: string) => {
  await loadSites();
  const nextId = keepId && siteList.value.some((site) => site.id === keepId) ? keepId : (siteList.value[0]?.id ?? '');
  selectedSiteId.value = nextId;
  await refreshRules();
};

// 站点表单
const siteDialogVisible = ref(false);
const savingSite = ref(false);
const siteForm = reactive({
  id: '',
  name: '',
  domainsText: '',
  basePath: '',
  status: 1 as 1 | 0,
  orderNum: 0,
  remark: '',
});

const openSiteDialog = (site?: SystemSiteInfo) => {
  siteForm.id = site?.id ?? '';
  siteForm.name = site?.name ?? '';
  siteForm.domainsText = (site?.domains ?? []).join('\n');
  siteForm.basePath = site?.basePath ?? '';
  siteForm.status = site?.status ?? 1;
  siteForm.orderNum = site?.orderNum ?? 0;
  siteForm.remark = site?.remark ?? '';
  siteDialogVisible.value = true;
};

const parseDomains = (text: string) =>
  Array.from(
    new Set(
      text
        .split(/[\s,，;；]+/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

const saveSite = async () => {
  if (!siteForm.name.trim()) return ElMessage.warning('请填写站点名称');
  const domains = parseDomains(siteForm.domainsText);
  if (domains.some((domain) => domain.includes('://') || domain.includes('/'))) return ElMessage.warning('域名不能包含协议或路径');
  if (siteForm.basePath.trim() && !siteForm.basePath.trim().startsWith('/')) return ElMessage.warning('根路径映射必须以 / 开头');
  const payload = {
    name: siteForm.name.trim(),
    domains,
    basePath: siteForm.basePath.trim(),
    status: siteForm.status,
    orderNum: siteForm.orderNum,
    remark: siteForm.remark.trim(),
  };
  savingSite.value = true;
  try {
    const saved = siteForm.id ? await saveSiteInfo(siteForm.id, payload) : await createSite(payload);
    siteDialogVisible.value = false;
    ElMessage.success('保存成功');
    await refreshSites(saved.id);
  } finally {
    savingSite.value = false;
  }
};

const removeSite = async (site: SystemSiteInfo) => {
  await ElMessageBox.confirm(`删除站点「${site.name}」会同时删除其全部伪静态规则，确认删除？`, '删除确认', { type: 'warning' });
  await removeSiteInfo(site.id);
  ElMessage.success('删除成功');
  if (selectedSiteId.value === site.id) selectedSiteId.value = '';
  await refreshSites();
};

// 规则表单
const ruleDialogVisible = ref(false);
const savingRule = ref(false);
const helpVisible = ref(true);
const ruleForm = reactive({
  id: '',
  pattern: '',
  target: '',
  status: 1 as 1 | 0,
  orderNum: 0,
  remark: '',
});

/** 列表接口附带的编译结果，用于展示匹配类型与实际生效地址 */
const compiledOf = (row: SystemRewriteInfo): SystemRewriteCompiled | undefined => row.compiled;
const MODIFIER_LABELS: Record<string, string> = { '=': '精确匹配', '^~': '前缀优先', '~': '正则匹配', '~*': '正则忽略大小写' };
const modifierLabel = (modifier?: string) => MODIFIER_LABELS[modifier ?? ''] ?? '路径匹配';
const modifierTagType = (modifier?: string): 'success' | 'warning' | 'danger' | 'info' => {
  if (modifier === '=') return 'success';
  if (modifier === '^~') return 'warning';
  if (modifier === '~' || modifier === '~*') return 'danger';
  return 'info';
};

/** 常用写法一键填充：常规路由已由根路径映射接管，这里只列特例 */
const ruleExamples = [
  { label: '内容页 .html 后缀', pattern: '~ ^/article/([^/]+)\\.html$', target: '/aon/cms/article/:slug' },
  { label: '文章短链接 /p/:slug', pattern: '~ ^/p/([^/]+)$', target: '/aon/cms/article/:slug' },
  { label: '栏目短链接 /c/:slug', pattern: '~ ^/c/([^/]+)$', target: '/aon/cms/category/:slug' },
];

// 编译预览：与服务端保存校验使用同一套编译逻辑
const compileState = reactive({ alias: '', target: '', error: '' });
let compileTimer: ReturnType<typeof setTimeout> | undefined;
const runCompile = async () => {
  const pattern = ruleForm.pattern.trim();
  const target = ruleForm.target.trim();
  if (!pattern || !target) {
    compileState.alias = '';
    compileState.target = '';
    compileState.error = '';
    return;
  }
  try {
    const result = await previewRewrite({ pattern, target });
    if (result?.ok) {
      compileState.alias = result.alias ?? '';
      compileState.target = result.target ?? '';
      compileState.error = '';
    } else {
      compileState.alias = '';
      compileState.target = '';
      compileState.error = result?.error ?? '无法解析该 URL 模式';
    }
  } catch {
    // 预览失败不阻塞保存，真正的校验交给保存接口
    compileState.alias = '';
    compileState.target = '';
    compileState.error = '';
  }
};
const scheduleCompile = () => {
  if (compileTimer) clearTimeout(compileTimer);
  compileTimer = setTimeout(() => void runCompile(), 300);
};

watch(() => [ruleForm.pattern, ruleForm.target], scheduleCompile);

const applyExample = (example: { pattern: string; target: string }) => {
  ruleForm.pattern = example.pattern;
  ruleForm.target = example.target;
};

const openRuleDialog = (rule?: SystemRewriteInfo) => {
  ruleForm.id = rule?.id ?? '';
  ruleForm.pattern = rule?.pattern ?? '';
  ruleForm.target = rule?.target ?? '';
  ruleForm.status = rule?.status ?? 1;
  ruleForm.orderNum = rule?.orderNum ?? 0;
  ruleForm.remark = rule?.remark ?? '';
  compileState.alias = '';
  compileState.target = '';
  compileState.error = '';
  ruleDialogVisible.value = true;
  void nextTick(runCompile);
};

const saveRule = async () => {
  if (!selectedSiteId.value) return;
  if (!ruleForm.pattern.trim()) return ElMessage.warning('请填写 URL 模式');
  if (!ruleForm.target.trim()) return ElMessage.warning('请填写目标路由');
  if (compileState.error) return ElMessage.warning(compileState.error);
  const payload = {
    siteId: selectedSiteId.value,
    pattern: ruleForm.pattern.trim(),
    target: ruleForm.target.trim(),
    status: ruleForm.status,
    orderNum: ruleForm.orderNum,
    remark: ruleForm.remark.trim(),
  };
  savingRule.value = true;
  try {
    if (ruleForm.id) {
      await saveRewriteInfo(ruleForm.id, payload);
    } else {
      await createRewrite(payload);
    }
    ruleDialogVisible.value = false;
    ElMessage.success('保存成功');
    await refreshRules();
  } finally {
    savingRule.value = false;
  }
};

const removeRule = async (rule: SystemRewriteInfo) => {
  await ElMessageBox.confirm(`确认删除规则「${rule.pattern}」？`, '删除确认', { type: 'warning' });
  await removeRewriteInfo(rule.id);
  ElMessage.success('删除成功');
  await refreshRules();
};

await refreshSites();
</script>

<style lang="scss" scoped>
.site-workspace {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}
.site-panel,
.rule-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-bg-color);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.panel-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.rule-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}
.rule-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rule-toolbar {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.site-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px;
}
.site-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
}
.site-item + .site-item {
  margin-top: 6px;
}
.site-item:hover {
  background: var(--el-fill-color-light);
}
.site-item.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}
.site-item-main {
  min-width: 0;
}
.site-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.site-domains,
.site-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
.site-actions {
  flex-shrink: 0;
}
.rule-table {
  flex: 1;
  min-height: 0;
  padding: 10px;
}
.rule-help {
  flex-shrink: 0;
  margin: 10px 10px 0;
  padding: 10px 12px;
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
}
.help-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.help-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.help-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.help-lead {
  margin-bottom: 8px;
  padding: 6px 10px;
  border-left: 3px solid var(--el-color-primary-light-5);
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  font-size: 12px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}
.help-lead b {
  color: var(--el-color-primary);
}
.help-lead code {
  background: var(--el-bg-color);
}
.help-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.help-table th,
.help-table td {
  padding: 4px 8px;
  text-align: left;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.help-table th {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  border-bottom-style: solid;
}
.help-table tr:last-child td {
  border-bottom: none;
}
.help-table .col-modifier {
  width: 60px;
}
.help-table .col-pattern {
  width: 210px;
}
.help-table .col-target {
  width: 200px;
}
.help-table code,
.form-tip code,
.pattern-text {
  padding: 1px 5px;
  border-radius: 4px;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  background: var(--el-fill-color);
  color: var(--el-text-color-primary);
}
.modifier-none {
  display: inline-block;
  padding: 0 4px;
  color: var(--el-text-color-secondary);
}
.help-note {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}
.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.example-list :deep(.el-button + .el-button) {
  margin-left: 0;
}
.compile-preview {
  width: 100%;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px dashed var(--el-border-color);
  background: var(--el-fill-color-lighter);
  font-size: 12px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  word-break: break-all;
}
.compile-preview.is-error {
  border-color: var(--el-color-danger-light-5);
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
