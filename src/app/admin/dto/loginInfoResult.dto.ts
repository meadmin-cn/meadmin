import { ApiPropertyRule } from '@/decorators/index.js';
import { Admin } from '@/entities/admin.entity.js';
import { Menu } from '@/entities/menu.entity.js';

export class LoginInfoResultDto {
  @ApiPropertyRule({ description: '管理员信息', type: Admin })
  info: Admin;
  @ApiPropertyRule({
    description: '有权限的菜单',
    type: 'array',
    items: {
      type: Menu,
    },
  })
  menus: Menu[];
  @ApiPropertyRule({
    description: '按钮权限列表',
    type: 'array',
    items: {
      type: 'string',
    },
  })
  btnRules: string[];
}
