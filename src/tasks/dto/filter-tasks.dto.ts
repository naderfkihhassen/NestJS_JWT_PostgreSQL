import { Priority } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class FilterTasksDto {
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  completed?: boolean;
}
