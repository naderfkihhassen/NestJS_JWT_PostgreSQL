import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TasksService } from './tasks/tasks.service';
import { CreateTaskDto } from './tasks/dto/create-task.dto';
import { UpdateTaskDto } from './tasks/dto/update-task.dto';
import { Role } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: { userId: number; role: Role };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class AppController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(
    @Body() body: CreateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.createTask(body, req.user.userId);
  }

  @Get()
  getMyTasks(@Request() req: AuthenticatedRequest) {
    return this.tasksService.getMyTasks(req.user);
  }

  @Put(':id')
  updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.updateTask(+id, req.user, body);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.deleteTask(+id, req.user);
  }

  @Post(':id/share')
  shareTask(
    @Param('id') id: string,
    @Body() body: { email: string; permission: 'READ' | 'WRITE' },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.shareTask(+id, req.user, body);
  }
}
