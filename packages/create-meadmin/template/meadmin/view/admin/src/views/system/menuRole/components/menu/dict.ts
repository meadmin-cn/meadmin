export const getDict = (t = (str: string) => str) =>
  reactive({
    menuType: [
      { value: 1, label: t('目录') },
      { value: 2, label: t('菜单') },
      { value: 3, label: t('按钮') },
    ],
    status: [
      { value: 1, label: t('启用') },
      { value: 0, label: t('禁用') },
    ],
    isLink: [
      { value: 1, label: t('是') },
      { value: 0, label: t('否') },
    ],
    hideMenu: [
      { value: 1, label: t('是') },
      { value: 0, label: t('否') },
    ],
    cache: [
      { value: 1, label: t('是') },
      { value: 0, label: t('否') },
    ],
    affix: [
      { value: 1, label: t('是') },
      { value: 0, label: t('否') },
    ],
    alwaysShow: [
      { value: 1, label: t('是') },
      { value: 0, label: t('否') },
    ],
    breadcrumb: [
      { value: 1, label: t('展示') },
      { value: 0, label: t('不展示') },
    ],
  });
