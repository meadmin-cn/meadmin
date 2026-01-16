import { ApiPropertyRule } from '@/decorators/index.js';
import { SystemAdmin } from '@/entities/systemAdmin.entity.js';
import { SystemMenu } from '@/entities/systemMenu.entity.js';

export class LoginInfoResultDto {
  @ApiPropertyRule({ description: '管理员信息', type: SystemAdmin })
  info: SystemAdmin;
  @ApiPropertyRule({
    description: '有权限的菜单',
    type: 'array',
    items: {
      type: () => SystemMenu,
    },
  })
  menus: SystemMenu[];
  @ApiPropertyRule({
    description: '按钮权限列表',
    type: 'array',
    items: {
      type: 'string',
    },
  })
  btnRules: string[];
}
