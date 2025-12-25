import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtUser } from './interfaces/jwt-user.interface';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(@Body() body: CreateTaskDto, @Req() req: { user: JwtUser }) {
    return this.tasksService.createTask(body, req.user.userId);
  }

  @Get()
  getMyTasks(@Req() req: { user: JwtUser }) {
    return this.tasksService.getMyTasks(req.user);
  }

  @Put(':id')
  updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Req() req: { user: JwtUser },
  ) {
    return this.tasksService.updateTask(Number(id), req.user, body);
  }

  @Post(':id/share')
  shareTask(
    @Param('id') id: string,
    @Body() body: { userId: number; permission: 'READ' | 'WRITE' },
    @Req() req: { user: JwtUser },
  ) {
    return this.tasksService.shareTask(Number(id), req.user, body);
  }
}
