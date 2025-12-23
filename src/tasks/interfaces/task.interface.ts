import { Priority } from '@prisma/client';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
}
