import { FileResult } from '@/api/api.model.js';
import { TreeArrayItem } from '@/utils/helper.js';
import request, { RequestOptions } from '@/utils/request.js';

export type AonDocContentInfo = {
  title: string; //名称
  type: string; //类型:1=目录;2=菜单
  contentType: 0 | 1; //内容类型:0=markdown;1=外链
  mdContent: string | null; //内容
};
//获取文档内容
export function aonDocGetContentApi(options?: RequestOptions<AonDocContentInfo, [string]>) {
  return request<AonDocContentInfo, [string]>(
    (id) => ({
      url: 'aonDoc/getContent/' + id,
      method: 'string',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type AonDocMenu = {
  id: string; //ID
  parentId: string; //父级id
  title: string; //名称
  contentType: 0 | 1; //内容类型:0=markdown;1=外链
  link: string | null; //外链地址
  icon: FileResult | null | undefined; //图标(200*200)
};
export type AonDocMenuTree = TreeArrayItem<AonDocMenu, 'children'>[];
//获取树形菜单
export function aonDocmenuTreeApi(options?: RequestOptions<AonDocMenuTree, []>) {
  return request<AonDocMenuTree, []>(
    () => ({
      url: 'aonDoc/menuTree',
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
