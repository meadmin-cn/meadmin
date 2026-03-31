import { FileResult } from '@/api/api.model.js';
import { File } from '@/api/file.js';
import { TreeArrayItem } from '@/utils/helper.js';
import request, { RequestOptions } from '@/utils/request.js';

export type AonDocContentInfo = {
  title: string; //名称
  type: string; //类型:1=目录;2=菜单
  contentType: 0 | 1; //内容类型:0=markdown;1=外链
  mdContent: string | null; //内容
  link: string | null; //外链地址
  version: string; //版本
  label: string | null; //标识
};
//获取文档内容
export function aonDocGetContentApi(options?: RequestOptions<AonDocContentInfo, [string, string]>) {
  return request<AonDocContentInfo, [string, string]>(
    (version, labelOrId) => ({
      url: `aonDoc/getContent/${version}/${labelOrId}`,
      method: 'get',
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
  label: string | null; //唯一标识
  version: string; //版本
  trueLabel?: string; //自动生成的真实跳转菜单
};
export type AonDocMenuTree = TreeArrayItem<AonDocMenu, 'children'>[];
//获取树形菜单
export function aonDocmenuTreeApi(options?: RequestOptions<AonDocMenuTree, [string?]>) {
  return request<AonDocMenuTree, [string?]>(
    (version?: string) => ({
      url: 'aonDoc/menuTree',
      method: 'get',
      params: { version },
    }),
    Object.assign({ noLoading: true }, options),
  );
}

//配置
export class AonDocConfig {
  icon = undefined as File | null | undefined; //图标
  version = [] as Array<AonConfigVersion>; //版本
  links = [] as Array<AonDocConfiglinks>; //外链
}

export class AonConfigVersion {
  title = ''; //标题
  code = ''; //标识
  status = 1 as 1 | 0; //状态:1=启用;0=禁用
}

export class AonDocConfiglinks {
  icon = null as File | null; //图片(200*200)
  title = ''; //标识
  url = ''; //地址
}

export type AonDocConfigInfo = AonDocConfig & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};
//获取配置
export function aonDocConfigApi(options?: RequestOptions<AonDocConfigInfo, []>) {
  return request<AonDocConfigInfo, []>(
    () => ({
      url: 'aonDoc/config',
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
