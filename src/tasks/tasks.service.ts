/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';

@Injectable()
export class TasksService {
  create(dto: CreateTaskDto) {
    throw new Error('Method not implemented.');
  }
  findOne(arg0: number) {
    throw new Error('Method not implemented.');
  }
  updateStatus(arg0: number, completed: boolean) {
    throw new Error('Method not implemented.');
  }
  remove(arg0: number) {
    throw new Error('Method not implemented.');
  }
  findAllPaginated(filter: FilterTasksDto, arg1: number, arg2: number) {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  createTask(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
      },
    });
  }

  getTasks(filter: FilterTasksDto) {
    return this.prisma.task.findMany({
      where: {
        completed: filter.completed,
        priority: filter.priority,
      },
    });
  }
}
