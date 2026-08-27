export const getDict = (t = (str: string) => str) =>
  reactive({
    strategy: [
      { value: 1, label: t('立即执行') },
      { value: 2, label: t('延时执行') },
      { value: 3, label: t('定时执行') },
      { value: 4, label: t('放弃执行') },
    ],
    deduplication: [
      { value: 1, label: t('可重复') },
      { value: 2, label: t('去重') },
      { value: 3, label: t('覆盖') },
    ],
    type: [
      { value: 1, label: t('sql') },
      { value: 2, label: t('url请求') },
      { value: 3, label: t('自定义') },
    ],
    method: [
      { value: 'GET', label: t('GET请求') },
      { value: 'POST', label: t('POST请求') },
      { value: 'PUT', label: t('PUT请求') },
      { value: 'DELETE', label: t('DELETE请求') },
    ],
    status: [
      { value: 'active', label: t('执行中') },
      { value: 'completed', label: t('已完成') },
      { value: 'failed', label: t('失败') },
      { value: 'waiting', label: t('等待中') },
    ],
  });
