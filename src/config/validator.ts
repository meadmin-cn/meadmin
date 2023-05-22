import { ValodatorConfig } from '@/interfaces/config/validator';

// 验证器配置 参考 https://docs.nestjs.com/techniques/validation https://github.com/typestack/class-validator#validation-decorators
export default (): ValodatorConfig => ({
  enableDebugMessages: false, // 如果设置为 true，验证器将在出现问题时向控制台打印额外的警告消息
  skipUndefinedProperties: false, // 如果设置为 true，则验证器将跳过验证对象中未定义的所有属性的验证。
  skipNullProperties: false, // 如果设置为 true，则验证器将跳过验证对象中所有为 null 的属性的验证。
  skipMissingProperties: false, // 如果设置为 true，则验证器将跳过验证对象中所有为 null 或未定义的属性的验证。
  whitelist: true, // 如果设置为 true，验证器将去除任何不使用任何验证装饰器的属性的已验证（返回）对象。
  transform: true, // 如果设置为 true，自动将有效负载转换为根据其 DTO 类类型化的对象
  forbidNonWhitelisted: false, // 如果设置为 true，验证器将抛出异常而不是剥离非白名单属性。
  forbidUnknownValues: false, // 如果设置为 true，验证未知对象的尝试会立即失败。
  disableErrorMessages: false, // 如果设置为 true，验证错误将不会返回给客户端。
  errorHttpStatusCode: undefined, // 此设置允许您指定在出现错误时将使用哪种异常类型。默认情况下它会抛出BadRequestException.
  exceptionFactory: undefined, // 获取验证错误数组并返回要抛出的异常对象。
  groups: [], // 对象验证期间要使用的组。
  always: false, // always为装饰器选项设置默认值。可以在装饰器选项中覆盖默认值
  strictGroups: false, //如果groups未给出或为空，则忽略至少有一组的装饰器。
  dismissDefaultMessages: false, // 如果设置为 true，验证将不使用默认消息。undefined如果未明确设置，则始终会出现错误消息。
  validationError: {
    target: false, // 指示是否应该在ValidationError中公开目标。
    value: false, // 指示是否应该在ValidationError中公开验证值。
  },
  stopAtFirstError: false, // 当设置为 true 时，给定属性的验证将在遇到第一个错误后停止。
});
