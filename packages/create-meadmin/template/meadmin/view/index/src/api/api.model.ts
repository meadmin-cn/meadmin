export class PageParam {
  page = 1;
  pageSize = 10;
}

export type PageResult<R> = {
  page: number;
  pageSize: number;
  total: number;
  list: R[];
};

//关联文件格式
export type FileResult = {
  id: string; //ID
  name: string; //文件名
  path: string; //路径
  mimeType: string; //mime类型
  size: number | null | undefined; //文件大小(字节)
  storage: string; //存储引擎
  url: ''; //访问地址
};
