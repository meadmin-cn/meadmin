import type { RequestOptions } from '@/utils/request';
import request from '@/utils/request';
export type IndexResult = {
  banner: {
    title: string;
    content: string;
    bgImg: string;
  }[];
  info: {
    title: string;
    desc: string;
    list: {
      title: string;
      content: string;
    }[];
  }[];
};
export function indexApi(options?: RequestOptions<IndexResult, []>) {
  return request<IndexResult, []>(
    () => ({
      url: 'index',
      method: 'get',
    }),
    options,
  );
}
