export const getDict = (t = (str: string) => str) =>
  reactive({
    type: [
      { value: 1, label: t('目录') },
      { value: 2, label: t('菜单') },
    ],
    status: [
      { value: 1, label: t('启用') },
      { value: 0, label: t('禁用') },
    ],
    constentType: [
      { value: 0, label: t('markdown') },
      { value: 1, label: t('外链') },
    ],
  });
