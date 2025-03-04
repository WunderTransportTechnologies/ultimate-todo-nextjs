export type PriorityLevel = 'low' | 'medium' | 'high';

export type TodoStatus = 'pending' | 'in-progress' | 'completed';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: PriorityLevel;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
}
