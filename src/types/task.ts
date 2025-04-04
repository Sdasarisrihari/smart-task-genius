
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TaskDependency {
  id: string;
  dependsOn: string; // Task ID this task depends on
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: PriorityLevel;
  completed: boolean;
  completedAt?: string; // ISO date string when task was completed
  category: string;
  aiScore: number;
  createdAt: string;
  updatedAt: string;
  userId?: string; // Owner of the task
  collaborators?: Collaborator[];
  shared?: boolean;
  isTemplate?: boolean;
  dependencies?: string[]; // IDs of tasks this task depends on
  timeTracking?: {
    estimatedMinutes: number;
    actualMinutes: number;
    logs: TimeLogEntry[];
  };
  attachments?: TaskAttachment[];
}

export interface TimeLogEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number;
  notes?: string;
}

import { Collaborator } from './user';

