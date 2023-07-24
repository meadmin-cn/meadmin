import { Model } from '@sequelize/core';
import dayjs from 'dayjs';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
export class BaseEntity<
  TModelAttributes extends object = any,
  TCreationAttributes extends object = TModelAttributes,
> extends Model<TModelAttributes, TCreationAttributes> {
  static useToJSON = true;
  /**
   * 格式化日期属性
   * @param value 日期
   * @param propertyName 属性名称
   * @returns 对应的日期值
   */
  protected formateDate(value: Date, propertyName: string | number | symbol) {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * json转义时格式化信息
   * 日期格式调用formateDate进行格式化
   * 只返回swagger ApiProperty 声明的格式
   * @param this
   * @returns
   */
  public toJSON() {
    const info = super.toJSON();
    if (!BaseEntity.useToJSON) {
      return info;
    }
    const properties: string[] =
      Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES_ARRAY,
        Object.getPrototypeOf(this),
      ) || [];
    const res = {} as Record<keyof typeof info, any>;
    properties.forEach((item) => {
      const propertyName = item.slice(1) as unknown as keyof typeof info;
      if (info[propertyName] === undefined) {
        return;
      }
      if ((info[propertyName] as any) instanceof Date) {
        res[propertyName] = this.formateDate(info[propertyName], propertyName);
        return;
      }
      res[propertyName] = info[propertyName];
    });
    return res;
  }
}
