export const getDict = (t = (str: string) => str) =>
  reactive({
    status: [
      { value: 1, label: t('启用') },
      { value: 0, label: t('禁用') },
    ],
  });
