import { isMobile } from '@/core/classVlidate/rules/isMobile';
import { IsEmail, Length, ValidationArguments } from 'class-validator';

export class CreateAdminDto {
  @Length(1, 20, {
    message: (args: ValidationArguments) => {
      return args.property + ' 长度必须在1-20之间';
    },
  })
  username: string;
  @Length(1, 20)
  nickname: string;
  @Length(6, 20)
  password: string;
  @Length(0, 100)
  avatar: string;
  @IsEmail()
  email: string;
  @isMobile()
  mobile: string;
}
