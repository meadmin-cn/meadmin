import { User } from '../../../entities/user.entity.js';
import { InferAttributes } from '@sequelize/core';

export class UserUpdateDto extends (User as new () => InferAttributes<User>) {}
