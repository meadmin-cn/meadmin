import { RuleType } from '@midwayjs/validate';

export interface CustomStringSchema<TSchema = string> extends RuleType.StringSchema<TSchema>{
    /**
     * 校验是否是正确的手机号
     */
    mobile(): this;
}
export const initRuleType = <T extends RuleType.Root>(customRuleType: T) => {
  return customRuleType.extend(root => ({
    type: 'string',
    base: root.string(),
    messages: {
      'string.mobile': '{{#label}} must be a true mobile',
    },
    rules: {
      mobile: {
        validate(value, helpers) {
          if (!/^1\d{10}$/.test(value)) {
            return helpers.error('string.mobile');
          }
        },
      },
    },
  })) as {
    string<TSchema = string>(): CustomStringSchema<TSchema>;
  } & T ;
};
