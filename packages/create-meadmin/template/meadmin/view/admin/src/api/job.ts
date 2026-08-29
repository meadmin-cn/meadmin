import type { PageResult } from '@/api/api.model.js';
import { PageParam } from '@/api/api.model.js';
import type { SystemAdminInfo } from '@/api/system/admin.js';
import type { RequestOptions } from '@/utils/request.js';
import request from '@/utils/request.js';

//任务
export class Job {
  name = '' as string; //任务名称
  strategy = 1 as 1 | 2 | 3 | 4 | undefined; //执行策略:1=立即执行;2=延时执行;3=定时执行;4=放弃执行
  delay = undefined as number | undefined; //延时时间(ms)
  cron = '' as string; //定时表达式(cron)
  deduplication = 1 as 1 | 2 | 3 | undefined; //去重策略:1=可重复;2=去重;3=覆盖
  jobId = '' as string; //任务id
  progress = undefined as number | undefined; //任务进度
  type = 1 as 1 | 2 | 3 | undefined; //任务类型:1=sql;2=url请求;3=自定义
  sql = '' as string; //sql语句
  url = '' as string; //url请求地址
  method = ''; //请求方法:GET=GET请求;POST=POST请求;PUT=PUT请求;DELETE=DELETE请求
  headers = '' as string; //请求头(json格式)
  body = '' as string; //POST请求体(json格式)
  query = '' as string; //GET参数(json格式)
  queueName = '' as string; //自定义任务处理器
  queueOptions = '' as string; //自定义任务处理器参数(json格式)
  status = ''; //任务状态:active=执行中;completed=已完成;failed=失败;waiting=等待中
  result = [] as string[]; //任务执行结果
  sucessedNum = undefined as number | undefined; //任务执行成功数
  failedNum = undefined as number | undefined; //任务执行失败数
  failedResponse = [] as string[]; //任务执行失败响应
}

export type JobInfo = Job & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
  createdAdmin: SystemAdminInfo | null; //创建者(管理员)
  updatedAdmin: SystemAdminInfo | null; //最后更新者(管理员)
};
//添加任务信息
export function addJobApi() {
  return request<JobInfo, [Job]>(
    (data) => ({
      url: 'job/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type JobListResult = PageResult<JobInfo>;
export class JobListParam extends PageParam {
  createdAdmin?: SystemAdminInfo | null; //创建者(管理员)
  updatedAdmin?: SystemAdminInfo | null; //最后更新者(管理员)
  id?: string; //ID
  name?: string; //任务名称
  strategy?: 1 | 2 | 3 | 4; //执行策略:1=立即执行;2=延时执行;3=定时执行;4=放弃执行
  delay?: number; //延时时间(ms)
  cron?: string; //定时表达式(cron)
  deduplication?: 1 | 2 | 3; //去重策略:1=可重复;2=去重;3=覆盖
  jobId?: string; //任务id
  progress?: number; //任务进度
  type?: 1 | 2 | 3; //任务类型:1=sql;2=url请求;3=自定义
  sql?: string; //sql语句
  url?: string; //url请求地址
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; //请求方法:GET=GET请求;POST=POST请求;PUT=PUT请求;DELETE=DELETE请求
  headers?: string; //请求头(json格式)
  body?: string; //POST请求体(json格式)
  query?: string; //GET参数(json格式)
  queueName?: string; //自定义任务处理器
  queueOptions?: string; //自定义任务处理器参数(json格式)
  status?: 'active' | 'completed' | 'failed' | 'waiting'; //任务状态:active=执行中;completed=已完成;failed=失败;waiting=等待中
  result?: string; //任务执行结果
  sucessedNum?: number; //任务执行成功数
  failedNum?: number; //任务执行失败数
  failedResponse?: string; //任务执行失败响应
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取任务列表
export function jobListApi(options?: RequestOptions<JobListResult, [JobListParam]>) {
  return request<JobListResult, [JobListParam]>(
    (data) => ({
      url: 'job/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取任务详情
export function jobInfoApi(options?: RequestOptions<JobInfo, [string]>) {
  return request<JobInfo, [string]>(
    (id) => ({
      url: `job/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type StartJobParam = Pick<Partial<JobInfo>, 'strategy' | 'delay' | 'cron' | 'deduplication'>;
//启动任务
export function startJobApi(options?: RequestOptions<JobInfo, [string, StartJobParam]>) {
  return request<JobInfo, [string, StartJobParam]>(
    (id, data) => ({
      url: `job/start/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//停止任务
export function stopJobApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `job/stop/${id}`,
      method: 'post',
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除任务
export function delJobApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `job/del/${id}`,
      method: 'post',
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}
