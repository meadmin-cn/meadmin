import { isMobile } from '@/app/core/classVlidate/rules/isMobile';
import { ApiProperty, OmitType, PartialType } from '@meadmin/nest-swagger';
import { IsEmail, Length, ValidationArguments } from 'class-validator';
import { AdminEntity } from '../entities/admin.entity';

export class CreateAdminDto extends AdminEntity {
  avatar? = '123';
}
