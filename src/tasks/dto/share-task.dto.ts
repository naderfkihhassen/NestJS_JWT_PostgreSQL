import { IsEmail, IsEnum } from 'class-validator';
import { Permission } from '@prisma/client';

export class ShareTaskDto {
  @IsEmail()
  email: string;

  @IsEnum(Permission)
  permission: Permission;
}
