import { ApiPropertyRule } from '@/decorators/index.js';

export class CaptchaResultDto {
  @ApiPropertyRule({ description: '验证码标识' })
  id: string;
  @ApiPropertyRule({ description: '验证码 SVG 图片的 base64 数据，可以直接放入前端的 img 标签内' })
  imageBase64: string;
}
