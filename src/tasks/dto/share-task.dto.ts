import { Permission } from '@prisma/client';

export class ShareTaskDto {
  userId: number;
  permission: Permission;
}
