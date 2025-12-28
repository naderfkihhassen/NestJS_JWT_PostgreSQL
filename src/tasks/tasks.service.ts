import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUser } from './interfaces/jwt-user.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // ---------------- CREATE ----------------
  async createTask(dto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: userId,
      },
    });
  }

  // ---------------- GET MY TASKS ----------------
  async getMyTasks(user: JwtUser) {
    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { ownerId: user.userId },
          {
            shares: {
              some: { userId: user.userId },
            },
          },
        ],
      },
      include: {
        shares: true,
      },
    });

    return tasks.map((task) => {
      const share = task.shares.find((s) => s.userId === user.userId);

      const isOwner = task.ownerId === user.userId;

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        ownerId: task.ownerId,
        isOwner,
        permission: isOwner ? 'OWNER' : (share?.permission ?? 'READ'),
      };
    });
  }

  // ---------------- UPDATE ----------------
  async updateTask(taskId: number, user: JwtUser, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { shares: true },
    });

    if (!task) throw new NotFoundException('Task not found');

    const isOwner = task.ownerId === user.userId;
    const share = task.shares.find((s) => s.userId === user.userId);

    if (!isOwner && share?.permission !== 'WRITE') {
      throw new ForbiddenException('No edit permission');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });
  }

  // ---------------- SHARE ----------------
  async shareTask(
    taskId: number,
    user: JwtUser,
    dto: { email: string; permission: 'READ' | 'WRITE' },
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.ownerId !== user.userId) {
      throw new ForbiddenException('Only owner can share');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!targetUser) throw new NotFoundException('User not found');

    return this.prisma.taskShare.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: targetUser.id,
        },
      },
      update: {
        permission: dto.permission,
      },
      create: {
        taskId,
        userId: targetUser.id,
        permission: dto.permission,
      },
    });
  }

  async deleteTask(taskId: number, user: JwtUser) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { shares: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const isOwner = task.ownerId === user.userId;

    const hasWritePermission = task.shares.some(
      (s) => s.userId === user.userId && s.permission === 'WRITE',
    );

    if (!isOwner && !hasWritePermission) {
      throw new Error('You do not have permission to delete this task');
    }

    // delete shares first (FK safety)
    await this.prisma.taskShare.deleteMany({
      where: { taskId },
    });

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
