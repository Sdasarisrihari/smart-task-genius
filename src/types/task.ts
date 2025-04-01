
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  priority: PriorityLevel;
  completed: boolean;
  category: string;
  aiScore: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // Owner of the task
  collaborators?: Collaborator[];
  shared?: boolean;
}

import { Collaborator } from './user';
