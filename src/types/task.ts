
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  priority: PriorityLevel;
  completed: boolean;
  category: string;
  aiScore?: number; // AI-calculated priority score
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
