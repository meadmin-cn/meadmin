export enum CodeEunm {
  Success = '200', //成功
  Unauthorized = '401', //未登录
  Forbidden = '403', //没权限
  Fail = '400', //失败(业务错误)
  ValidateFail = '422', //校验失败
  Error = '500', //异常
}
