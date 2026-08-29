import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemOrganization } from '../../../../entities/systemOrganization.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemOrganizationCreateDto extends OmitDtoType(
  SystemOrganization as new () => InferAttributesLoose<SystemOrganization>, //只保留声明属性
  ['id', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin'], //排除自动创建的字段
) {}
