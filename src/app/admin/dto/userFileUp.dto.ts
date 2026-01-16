import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@midwayjs/validate';

export class UserFileUpDto {
  @ApiPropertyRule({ description: '文件名', rule: RuleType.string().required() })
  name: string;

  @ApiPropertyRule({ description: 'md5值', rule: RuleType.string().required() })
  md5: string;

  @ApiPropertyRule({ description: '分片上传:0=否;1=是', rule: RuleType.string().equal('0', '1').required() })
  chunk: string;

  @ApiPropertyRule({ description: '当前分片md5值', rule: RuleType.string().when('chunk', { is: '1', then: RuleType.required() }) })
  chunkMd5: string;

  @ApiPropertyRule({ description: '当前片序号(从0开始)', rule: RuleType.string().when('chunk', { is: '1', then: RuleType.required() }) })
  chunkIndex: string;

  @ApiPropertyRule({ description: '当前分片起止位置(从0开始)', rule: RuleType.string().when('chunk', { is: '1', then: RuleType.required() }) })
  start: string;

  @ApiPropertyRule({ description: '是否结束(需确保最后一个分片上传时其他分片请求已完成):0=否;1=是', rule: RuleType.string().when('chunk', { is: '1', then: RuleType.required() }) })
  over: string;

  @ApiPropertyRule({ description: '文件(注意，上传表单必须把file字段放在最后，否则读取不到字段值)', type: 'string', format: 'binary' })
  file: any;
}
