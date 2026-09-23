import request from '@/utils/request';
export const lookupApi = () => request<Array<{ id: string; title: string }>, ['tag' | 'topic', string, string[]]>((kind, keyword, ids) => ({ url: 'addons/cms/options/' + kind, method: 'post', data: { keyword, ids } }), { noLoading: true });
