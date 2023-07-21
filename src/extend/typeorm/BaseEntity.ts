import { BaseEntity as Base } from 'typeorm';
import dayjs from 'dayjs';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
export class BaseEntity extends Base {
  static useToJSON = true;
  /**
   * 格式化日期属性
   * @param value 日期
   * @param propertyName 属性名称
   * @returns 对应的日期值
   */
  protected formateDate(value: Date, propertyName: string) {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * json转义时格式化信息
   * 日期格式调用formateDate进行格式化
   * 只返回swagger ApiProperty 声明的格式
   * @param this
   * @returns
   */
  public toJSON(this: BaseEntity & Record<string, any>) {
    if (!BaseEntity.useToJSON) {
      return this;
    }
    const properties: string[] =
      Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES_ARRAY,
        Object.getPrototypeOf(this),
      ) || [];
    const res = {} as Record<string, any>;
    properties.forEach((item) => {
      const propertyName = item.slice(1);
      if (this[propertyName] === undefined) {
        return;
      }
      const getPropertyFunctionName =
        'get' + propertyName.slice(0, 1).toUpperCase() + propertyName.slice(1);
      if (typeof this[getPropertyFunctionName] === 'function') {
        res[propertyName] = this[getPropertyFunctionName]();
        return;
      }
      if (this[propertyName] instanceof Date) {
        res[propertyName] = this.formateDate(res[propertyName], propertyName);
        return;
      }
      res[propertyName] = this[propertyName];
    });
    return res;
  }
}
