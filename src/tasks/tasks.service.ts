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

interface TaskWithRelations {
  id: number;
  title: string;
  description: string | null;
  ownerId: number;
  createdAt: Date;
  shares: Array<{
    userId: number;
    permission: Permission;
  }>;
  owner: {
    id: number;
    email: string;
  };
}

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
    let tasks: TaskWithRelations[];

    if (user.role === Role.MANAGER) {
      tasks = await this.prisma.task.findMany({
        include: {
          shares: true,
          owner: {
            select: { id: true, email: true },
          },
        },
      });
    } else {
      tasks = await this.prisma.task.findMany({
        where: {
          OR: [
            { ownerId: user.userId },
            { shares: { some: { userId: user.userId } } },
          ],
        },
        include: {
          shares: true,
          owner: {
            select: { id: true, email: true },
          },
        },
      });
    }

    return tasks.map((task) => {
      const isOwner = task.ownerId === user.userId;
      const userShare = task.shares.find(
        (share) => share.userId === user.userId,
      );

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        ownerId: task.ownerId,
        createdAt: task.createdAt,
        isOwner: isOwner,
        permission: userShare?.permission || null,
        owner: task.owner,
      };
    });
  }

  async updateTask(id: number, user: JwtUser, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!task) throw new NotFoundException('Task not found');

    const canWrite =
      task.ownerId === user.userId ||
      user.role === Role.MANAGER ||
      task.shares.some(
        (s) => s.userId === user.userId && s.permission === Permission.WRITE,
      );

    if (!canWrite)
      throw new ForbiddenException(
        'You do not have permission to edit this task',
      );

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async deleteTask(id: number, user: JwtUser) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!task) throw new NotFoundException('Task not found');

    const canDelete =
      task.ownerId === user.userId ||
      user.role === Role.MANAGER ||
      task.shares.some(
        (s) => s.userId === user.userId && s.permission === Permission.WRITE,
      );

    if (!canDelete)
      throw new ForbiddenException(
        'You do not have permission to delete this task',
      );

    // Delete all shares first (due to foreign key constraints)
    await this.prisma.taskShare.deleteMany({
      where: { taskId: id },
    });

    // Then delete the task
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async shareTask(id: number, user: JwtUser, dto: ShareTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    if (task.ownerId !== user.userId && user.role !== Role.MANAGER) {
      throw new ForbiddenException('You can only share your own tasks');
    }

    // Find the user by email
    const userToShareWith = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!userToShareWith) {
      throw new NotFoundException('User not found with that email');
    }

    // Prevent sharing with yourself
    if (userToShareWith.id === user.userId) {
      throw new ForbiddenException('You cannot share a task with yourself');
    }

    return this.prisma.taskShare.upsert({
      where: {
        taskId_userId: {
          taskId: id,
          userId: userToShareWith.id,
        },
      },
      update: {
        permission: dto.permission,
      },
      create: {
        taskId: id,
        userId: userToShareWith.id,
        permission: dto.permission,
      },
    });
  }
}
