import { aonDocConfigInfoApi } from '../../api/config.js';

export const getDict = async (t = (str: string) => str) => {
  const config = await aonDocConfigInfoApi({}, true)();

  return reactive({
    type: [
      { value: 1, label: t('目录') },
      { value: 2, label: t('菜单') },
    ],
    status: [
      { value: 1, label: t('启用') },
      { value: 0, label: t('禁用') },
    ],
    contentType: [
      { value: 0, label: t('markdown') },
      { value: 1, label: t('外链') },
    ],
    version: config.version.map((item) => ({ value: item.code, label: item.title })),
  });
};
