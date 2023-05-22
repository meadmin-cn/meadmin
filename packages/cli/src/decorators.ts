import { COMMAND, OPTION } from './dict';
import 'reflect-metadata';

/**
 * 声明命令
 * 尖括号表示必需的命令参数，而方括号表示可选参数。
 * @param   {string}  name         命令名称
 * @param   {string}  description  命令描述
 * @param   {boolean} config.allowUnknownOptions       在此命令中允许未知选项。
 * @param   {boolean} config.ignoreOptionDefaultValue  不要在解析的选项中使用选项的默认值，只在帮助消息中显示它们。
 *
 * @return  {[type]}               [return description]
 */
export function Command(
  name: string,
  description: string,
  config?: {
    allowUnknownOptions: boolean;
    ignoreOptionDefaultValue: boolean;
  },
) {
  return Reflect.metadata(COMMAND, {
    name,
    description,
    config,
  });
}

/**
 * 声明选项
 * 尖括号表示需要字符串/数字值，而方括号表示该值也可以是true.
 * @param   {string}  name         名称
 * @param   {string}  description  描述
 * @param   {any}     config.default       选项的默认值
 * @param   {any[]}   config.type         设置为 时[]，选项值返回数组类型。您还可以使用一个转换函数，例如[String]，它将调用带有 的选项值String
 *
 * @return  {[]}                   [return description]
 */
export function Option(
  name: string,
  description: string,
  config?: { default?: any; type?: any[] },
) {
  return function (target: any, propertyKey: string) {
    const options = Reflect.getMetadata(OPTION, target) ?? [];
    if (!options.length) {
      Reflect.defineMetadata(OPTION, options, target);
    }
    options.push({
      name,
      description,
      config,
    });
  };
}
