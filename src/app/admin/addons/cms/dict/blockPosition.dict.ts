// CMS 区块「展示位置」字典。
// 位置即渲染点：选中某个位置后，前台会在对应的版位自动渲染，区块内容的各个字段如何使用也由位置定义，
// 避免运营在表单里猜测图片应该放哪里。新增前台版位时，只需在此登记并在前台按 value 取值渲染。
export type CmsBlockRender = 'carousel' | 'content' | 'image-link' | 'config';

export interface CmsBlockPosition {
  /** 位置标识，前台按此值取区块 */
  value: string;
  /** 位置名称 */
  label: string;
  /** 渲染形式：轮播 / 图文内容 / 图片链接 / 纯配置 */
  render: CmsBlockRender;
  /** 渲染形式说明 */
  renderLabel: string;
  /** 页面中的具体位置描述 */
  desc: string;
  /** 该位置允许同时投放的区块数量（0 表示不限） */
  limit: number;
  /** 区块在该位置动用到的字段说明 */
  usage: Array<{ field: 'coverUrl' | 'mdContent' | 'link' | 'config'; label: string; hint: string }>;
  /** 用于兼容旧数据的区块类型：1区块 2轮播 3广告 */
  kind: number;
  /** 图片建议尺寸等提示 */
  imageHint: string;
  /** 是否必须上传图片 */
  imageRequired: boolean;
  /** 配置示例，仅纯配置位使用 */
  configSample?: string;
}

export const cmsBlockPositions: CmsBlockPosition[] = [
  {
    value: 'home-banner',
    label: '首页顶部轮播',
    render: 'carousel',
    renderLabel: '轮播图',
    desc: '首页顶部通栏大图轮播，多张时按排序轮流播放，点击整图跳转到「链接」。',
    limit: 0,
    kind: 2,
    imageHint: '必须上传封面图，建议 1600×600（8:3），单张不超过 500MB',
    imageRequired: true,
    usage: [
      { field: 'coverUrl', label: '封面图', hint: '作为轮播大图铺满整个轮播区域' },
      { field: 'mdContent', label: '正文', hint: '该位置不展示正文，留空即可' },
      { field: 'link', label: '链接', hint: '点击轮播图后跳转的地址，可填站内路径或完整网址' },
    ],
  },
  {
    value: 'home-content',
    label: '首页内容区块',
    render: 'content',
    renderLabel: '图文区块',
    desc: '首页轮播图下方、内容列表上方的通栏卡片，展示「名称 + 正文」，配了封面图时为左图右文。',
    limit: 0,
    kind: 1,
    imageHint: '可选封面图，建议 800×600（4:3），上传后以左图右文展示',
    imageRequired: false,
    usage: [
      { field: 'mdContent', label: '正文', hint: '卡片右侧的正文内容，支持富文本' },
      { field: 'coverUrl', label: '封面图', hint: '可选，配置后卡片变为左图右文布局' },
      { field: 'link', label: '链接', hint: '可选，填写后卡片底部显示「查看详情」按钮' },
    ],
  },
  {
    value: 'sidebar',
    label: '右侧边栏推广',
    render: 'image-link',
    renderLabel: '图片推广',
    desc: '右侧边栏「推荐」卡片内的图片位，纵向排列，点击整图跳转；首页与栏目/标签列表页的右侧边栏都会展示。',
    limit: 0,
    kind: 3,
    imageHint: '建议上传封面图 600×300（2:1），展示为横向推广图；未上传时降级显示名称文字',
    imageRequired: false,
    usage: [
      { field: 'coverUrl', label: '封面图', hint: '侧边栏展示的推广图，未上传时降级显示名称文字' },
      { field: 'link', label: '链接', hint: '点击图片后跳转的地址，可填站内路径或完整网址' },
      { field: 'mdContent', label: '正文', hint: '该位置不展示正文，留空即可' },
    ],
  },
  {
    value: 'content-detail-bottom',
    label: '内容详情页底部',
    render: 'content',
    renderLabel: '图文区块',
    desc: '文章详情页正文之后、评论区之前的通栏区块，适合投放说明、活动与二次引导。',
    limit: 0,
    kind: 1,
    imageHint: '可选封面图，建议 800×600（4:3），上传后以左图右文展示',
    imageRequired: false,
    usage: [
      { field: 'mdContent', label: '正文', hint: '详情页底部展示的正文内容，支持富文本' },
      { field: 'coverUrl', label: '封面图', hint: '可选，配置后区块变为左图右文布局' },
      { field: 'link', label: '链接', hint: '可选，填写后区块底部显示「查看详情」按钮' },
    ],
  },
  {
    value: 'home-ranking',
    label: '首页热门排行（配置位）',
    render: 'config',
    renderLabel: '数据配置',
    desc: '不直接渲染内容，仅用「配置」控制首页右侧「热门排行」卡片的排序规则与展示条数，同一位置只取第一条生效数据。',
    limit: 1,
    kind: 1,
    imageHint: '该位置不使用图片',
    imageRequired: false,
    configSample: '{"sortBy":"views","limit":6}',
    usage: [
      { field: 'config', label: '配置', hint: 'sortBy 可选 latest / likes / comments / views；limit 取值 1-50' },
      { field: 'mdContent', label: '正文', hint: '该位置不展示正文，留空即可' },
    ],
  },
];

const byValue = new Map(cmsBlockPositions.map((item) => [item.value, item]));

/** 取位置定义，未知位置返回 null */
export const cmsBlockPosition = (value: string): CmsBlockPosition | null => byValue.get(value) ?? null;

/** 位置标识白名单，用于后端校验 */
export const cmsBlockPositionValues = cmsBlockPositions.map((item) => item.value);

/** 兼容旧数据：由位置推导区块类型 */
export const cmsBlockKindOf = (value: string): number => byValue.get(value)?.kind ?? 1;
