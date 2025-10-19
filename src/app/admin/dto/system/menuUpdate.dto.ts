import { InferAttributesLoose } from '@/../types/entity.js';
import { SystemMenu } from '../../../../entities/systemMenu.entity.js';

export class SystemMenuUpdateDto extends (SystemMenu as new () => InferAttributesLoose<SystemMenu>) {}