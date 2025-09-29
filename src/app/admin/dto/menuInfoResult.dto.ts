import { Menu } from '@/entities/systemMenu.entity.js';
import { ApiProperty } from '@midwayjs/swagger';

export class TreeMenu extends Menu {
  //循环依赖
  @ApiProperty({
    description: '子级',
    type: 'array',
    items: {
      type: () => TreeMenu,
    },
  })
  children: TreeMenu[];
}
