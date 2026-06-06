import { RuleType } from '@midwayjs/validate';

export interface CustomStringSchema<TSchema = string> extends RuleType.StringSchema<TSchema> {
  /**
   * 校验是否是正确的手机号
   */
  mobile(): this;
  /**
   * 校验是否是正确的手机号或座机号
   */
  phone(): this;
}
export const initRuleType = <T extends RuleType.Root>(customRuleType: T) => {
  return customRuleType.extend((root) => ({
    type: 'string',
    base: root.string(),
    messages: { //默认给英文翻译，中文翻译请去src/locales/zh-cn.json中配置
      'string.mobile': '{{#label}} must be a true mobile',
      'string.phone':'{{#label}} must be a valid mobile number or landline number',
    },
    rules: {
      mobile: {
        validate(value, helpers) {
          if (!/^1\d{10}$/.test(value)) {
            return helpers.error('string.mobile');
          }
          return value;
        },
      },
      phone:{
        validate(value, helpers) {
          if (/^1\d{10}$/.test(value) || /^0\d{2,3}-\d{7,8}$/.test(value)) {
            return value;
          }
          return helpers.error('string.phone');
        },
      }
    },
  })) as {
    string<TSchema = string>(): CustomStringSchema<TSchema>;
  } & T;
};
