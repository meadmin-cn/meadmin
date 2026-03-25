import { FileInfo } from '@/api/file.js';
import { SystemAdminInfo } from '@/api/system/admin.js';
import request, { RequestOptions } from '@/utils/request.js';

//配置
export class AonDocConfig {
  icon = undefined as FileInfo | null | undefined; //图标
  version = [] as Array<AonConfigVersion>; //版本
  links = [] as Array<AonDocConfiglinks>; //外链
}

export class AonConfigVersion {
  title = ''; //标题
  code = ''; //标识
  status = 1 as 1 | 0; //状态:1=启用;0=禁用
}

export class AonDocConfiglinks {
  icon = null as FileInfo | null; //图片(200*200)
  title = ''; //标识
  url = ''; //地址
}

export type AonDocConfigInfo = AonDocConfig & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
  createdAdmin: SystemAdminInfo | null; //创建者(管理员)
  updatedAdmin: SystemAdminInfo | null; //最后更新者(管理员)
};

//获取配置详情
export function aonDocConfigInfoApi(options?: RequestOptions<AonDocConfigInfo, []>) {
  return request<AonDocConfigInfo, []>(
    () => ({
      url: `addons/doc/config/info`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateAonDocConfigInfoParam = Omit<Partial<AonDocConfigInfo>, 'id' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'>;

//修改配置信息
export function updateAonDocConfigApi(options?: RequestOptions<AonDocConfigInfo, [UpdateAonDocConfigInfoParam]>) {
  return request<AonDocConfigInfo, [UpdateAonDocConfigInfoParam]>(
    (data) => ({
      url: `addons/doc/config/up`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}
