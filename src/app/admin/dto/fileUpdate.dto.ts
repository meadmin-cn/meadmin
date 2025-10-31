import { File } from '../../../entities/file.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';
import { PartialType } from '@/helper/dto.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class FileUpdateDto extends PartialType(File as new () => InferAttributesLoose<File>) {}
