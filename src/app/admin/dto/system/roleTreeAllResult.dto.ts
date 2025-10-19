import { ApiPropertyRule } from '@/decorators/index.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';

export class SystemRoleTreeAllResultDto extends (SystemRole as new () => InferAttributesLoose<SystemRole,{omit:'menus'}>) {
  @ApiPropertyRule({ description: '子级', type: 'array', items: { type: () => SystemRoleTreeAllResultDto } })
  childern: SystemRoleTreeAllResultDto[];

  @ApiPropertyRule({ description: '具备的菜单', type: 'array', items: { type: 'object', properties: { id: { type: 'string' } } } })
  menus: { id: string }[];
}
