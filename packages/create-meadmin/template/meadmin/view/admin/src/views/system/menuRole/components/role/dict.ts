export const getDict = (t = (str: string) => str) =>
  reactive({
    status: [
      { value: 1, label: t('启用') },
      { value: 0, label: t('禁用') },
    ],
    dataScope: [
      { value: 1, label: t('全部数据权限') },
      { value: 2, label: t('组织数据权限') },
      { value: 3, label: t('组织及以下数据权限') },
      { value: 4, label: t('仅本人数据权限') },
    ],
  });
