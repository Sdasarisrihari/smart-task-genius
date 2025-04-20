
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
  priority: PriorityLevel;
  category: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  aiScore?: number;
  attachments?: TaskAttachment[];
  shared?: boolean;
  collaborators?: Collaborator[];
  dependencies?: string[];
  timeTracking?: TimeTracking;
  recurrence?: RecurrencePattern;
  isTemplate?: boolean;
  parentRecurringTaskId?: string;
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

export interface TimeTracking {
  estimatedMinutes: number;
  actualMinutes: number;
  logs: TimeLogEntry[];
}

export interface TimeLogEntry {
  id: string;
  taskId: string;
  startTime: Date | string;
  endTime: Date | string;
  durationMinutes: number;
  notes?: string;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  endAfterOccurrences?: number;
}

import { TaskTemplate } from './taskTemplate';
import { Collaborator } from './user';

export interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  completeTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  setTasks: (tasks: Task[]) => void;
  templates: TaskTemplate[];
  createTaskFromTemplate: (templateId: string) => Task;
  deleteTemplate: (templateId: string) => void;
  renameTemplate: (templateId: string, name: string, description: string) => void;
  saveTemplate: (taskId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  addCollaborator: (collaborator: Collaborator) => void;
  updateCollaborator: (userId: string, updates: Partial<Collaborator>) => void;
  deleteCollaborator: (userId: string) => void;
  collaborators: Collaborator[];
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
  shareTask: (taskId: string, collaboratorIds: string[]) => void;
  unshareTask: (taskId: string) => void;
  getSharedTasks: () => Task[];
  exportTasks: () => string;
  importTasks: (jsonData: string) => void;
  importCategories: (categories: Category[]) => void;
  addTaskDependency: (taskId: string, dependsOnTaskId: string) => void;
  removeTaskDependency: (taskId: string, dependsOnTaskId: string) => void;
  getTaskDependencies: (taskId: string) => Task[];
  getDependentTasks: (taskId: string) => Task[];
}
