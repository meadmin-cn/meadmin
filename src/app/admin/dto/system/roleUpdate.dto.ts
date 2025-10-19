import { InferAttributesLoose } from '@/../types/entity.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';

export class SystemRoleUpdateDto extends (SystemRole as new () => InferAttributesLoose<SystemRole>) {}