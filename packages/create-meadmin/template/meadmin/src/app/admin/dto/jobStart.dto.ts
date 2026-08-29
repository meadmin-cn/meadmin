import { PartialType, PickDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { Job } from '../../../entities/job.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class JobStartDto extends PartialType(
  PickDtoType(
    Job as new () => InferAttributesLoose<Job>, //只保留声明属性
    ['strategy', 'delay', 'cron', 'deduplication'], //值保留启动相关的属性
  ),
) {}
