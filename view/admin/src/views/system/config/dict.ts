import type { SystemConfigVariableType } from '@/api/system/config.js';

export const getDict = (t = (str: string) => str) => ({
  variableType: [
    { value: 'string' as SystemConfigVariableType, label: t('字符串') },
    { value: 'number' as SystemConfigVariableType, label: t('数字') },
    { value: 'text' as SystemConfigVariableType, label: t('文本') },
    { value: 'textarea' as SystemConfigVariableType, label: t('文本框') },
    { value: 'multiline' as SystemConfigVariableType, label: t('多行文本') },
    { value: 'array' as SystemConfigVariableType, label: t('数组') },
    { value: 'keyvalue' as SystemConfigVariableType, label: t('键值对') },
    { value: 'dict' as SystemConfigVariableType, label: t('字典') },
  ],
  configStatus: [
    { value: 1, label: t('启用') },
    { value: 0, label: t('禁用') },
  ],
});
