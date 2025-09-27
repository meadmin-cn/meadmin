export class PageParam {
  page = 1;
  size = 10;
}

export type PageResult<R> = {
  page: number;
  size: number;
  total: number;
  list: R[];
};
