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
