import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ShareTaskDto } from './dto/share-task.dto';
import { Role, Permission } from '@prisma/client';
import { JwtUser } from './interfaces/jwt-user.interface';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  createTask(dto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: userId,
      },
    });
  }

  async getMyTasks(user: JwtUser) {
    if (user.role === Role.MANAGER) {
      return this.prisma.task.findMany({
        include: { shares: true },
      });
    }

    return this.prisma.task.findMany({
      where: {
        OR: [
          { ownerId: user.userId },
          { shares: { some: { userId: user.userId } } },
        ],
      },
      include: { shares: true },
    });
  }

  async updateTask(id: number, user: JwtUser, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!task) throw new NotFoundException();

    const canWrite =
      task.ownerId === user.userId ||
      user.role === Role.MANAGER ||
      task.shares.some(
        (s) => s.userId === user.userId && s.permission === Permission.WRITE,
      );

    if (!canWrite) throw new ForbiddenException();

    return this.prisma.task.update({
      where: { id },
      data: dto,
    });
  }

  async shareTask(id: number, user: JwtUser, dto: ShareTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) throw new NotFoundException();

    if (task.ownerId !== user.userId && user.role !== Role.MANAGER) {
      throw new ForbiddenException();
    }

    return this.prisma.taskShare.upsert({
      where: {
        taskId_userId: {
          taskId: id,
          userId: dto.userId,
        },
      },
      update: {
        permission: dto.permission,
      },
      create: {
        taskId: id,
        userId: dto.userId,
        permission: dto.permission,
      },
    });
  }
}
