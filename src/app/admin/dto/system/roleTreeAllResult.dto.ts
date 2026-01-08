import { ApiPropertyRule } from '@/decorators/index.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { InferAttributesLoose } from '@/types/entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemRoleTreeAllResultDto extends (SystemRole as new () => InferAttributesLoose<SystemRole,{omit:'menus'}>) {
  @ApiPropertyRule({ description: '子级', type: 'array', items: { type: () => SystemRoleTreeAllResultDto } })
  childern: SystemRoleTreeAllResultDto[];

  @ApiPropertyRule({ description: '具备的菜单', type: 'array', items: { type: 'object', properties: { id: { type: 'string' } } } })
  menus: { id: string }[];
}
