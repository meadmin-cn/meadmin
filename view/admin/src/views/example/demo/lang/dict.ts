export const getDict = (t = (str: string) => str) =>
  reactive({
    type: [
      { value: 0, label: t('书籍') },
      { value: 1, label: t('电子产品') },
      { value: 2, label: t('卡片') },
    ],
  });
