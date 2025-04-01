import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, PriorityLevel, Category } from '../types/task';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { SyncService } from '../services/syncService';
import { NotificationService } from '../services/notificationService';
import { toast } from 'sonner';
import { Collaborator } from '../types/user';

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'aiScore'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  getTasksByCategory: (categoryId: string) => Task[];
  getTasksByPriority: (priority: PriorityLevel) => Task[];
  shareTask: (taskId: string, collaborators: Collaborator[]) => void;
  unshareTask: (taskId: string) => void;
  getSharedTasks: () => Task[];
  getMyTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks 
      ? JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })) 
      : sampleTasks;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : sampleCategories;
  });

  // Initialize the sync service
  useEffect(() => {
    SyncService.init();
  }, []);

  // Save to localStorage whenever tasks or categories change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Schedule notifications for upcoming tasks
  useEffect(() => {
    if (isAuthenticated) {
      tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
          NotificationService.scheduleNotification(task);
        }
      });
    }
  }, [tasks, isAuthenticated]);

  const calculateAiScore = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'aiScore'>): number => {
    // This is a simplified version of what would be a ML model in a real implementation
    let score = 0;
    
    // Priority factor
    if (task.priority === 'high') score += 50;
    else if (task.priority === 'medium') score += 30;
    else score += 10;
    
    // Due date factor
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue < 0) score += 30; // Overdue
      else if (daysUntilDue < 1) score += 25; // Due today
      else if (daysUntilDue < 3) score += 20; // Due soon
      else if (daysUntilDue < 7) score += 15; // Due this week
      else score += 5; // Due later
    }
    
    // Length of description (complexity proxy)
    const complexity = task.description.length;
    score += Math.min(10, Math.floor(complexity / 50));
    
    return Math.min(100, score);
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'aiScore'>) => {
    const now = new Date();
    const aiScore = calculateAiScore(task);
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      aiScore,
      userId: currentUser?.id // Associate task with current user
    };
    
    setTasks([...tasks, newTask]);
    
    // Queue for sync when online
    if (isAuthenticated) {
      SyncService.queueOperation('add', 'task', newTask);
      
      // Schedule notification if due date exists
      if (newTask.dueDate) {
        NotificationService.scheduleNotification(newTask);
      }
    }
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updatedFields, updatedAt: new Date() };
        
        // Recalculate AI score if relevant fields changed
        if ('priority' in updatedFields || 'dueDate' in updatedFields || 'description' in updatedFields) {
          updatedTask.aiScore = calculateAiScore(updatedTask);
        }
        
        // Queue for sync when online
        if (isAuthenticated) {
          SyncService.queueOperation('update', 'task', updatedTask);
          
          // Reschedule notification if due date changed
          if ('dueDate' in updatedFields && updatedTask.dueDate) {
            NotificationService.scheduleNotification(updatedTask);
          }
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;
    
    // Check if user has permission to delete
    if (taskToDelete.userId && currentUser?.id !== taskToDelete.userId) {
      const isCollaboratorWithEditRights = taskToDelete.collaborators?.some(
        c => c.userId === currentUser?.id && (c.role === 'editor' || c.role === 'owner')
      );
      
      if (!isCollaboratorWithEditRights) {
        toast.error("You don't have permission to delete this task");
        return;
      }
    }
    
    setTasks(tasks.filter(task => task.id !== id));
    
    // Queue for sync when online
    if (isAuthenticated) {
      SyncService.queueOperation('delete', 'task', { id });
    }
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { 
          ...task, 
          completed: !task.completed, 
          updatedAt: new Date() 
        };
        
        // Queue for sync when online
        if (isAuthenticated) {
          SyncService.queueOperation('update', 'task', updatedTask);
          
          // Send notification for task completion
          if (updatedTask.completed) {
            NotificationService.sendNotification(
              'Task Completed', 
              { body: `You've completed: ${task.title}` }
            );
          }
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setCategories([...categories, newCategory]);
    
    // Queue for sync when online
    if (isAuthenticated) {
      SyncService.queueOperation('add', 'category', newCategory);
    }
  };

  const shareTask = (taskId: string, collaborators: Collaborator[]) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Only the task owner can share it
        if (task.userId !== currentUser?.id) {
          toast.error("Only the task owner can share this task");
          return task;
        }
        
        const updatedTask = {
          ...task,
          collaborators,
          shared: true,
          updatedAt: new Date()
        };
        
        // Queue for sync when online
        if (isAuthenticated) {
          SyncService.queueOperation('update', 'task', updatedTask);
          toast.success("Task shared successfully");
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const unshareTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Only the task owner can unshare it
        if (task.userId !== currentUser?.id) {
          toast.error("Only the task owner can unshare this task");
          return task;
        }
        
        const updatedTask = {
          ...task,
          collaborators: [],
          shared: false,
          updatedAt: new Date()
        };
        
        // Queue for sync when online
        if (isAuthenticated) {
          SyncService.queueOperation('update', 'task', updatedTask);
          toast.success("Task is no longer shared");
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const getTasksByCategory = (categoryId: string) => {
    return tasks.filter(task => task.category === categoryId);
  };

  const getTasksByPriority = (priority: PriorityLevel) => {
    return tasks.filter(task => task.priority === priority);
  };

  const getSharedTasks = () => {
    if (!currentUser) return [];
    
    return tasks.filter(task => 
      // Tasks shared with me
      (task.collaborators?.some(c => c.userId === currentUser.id)) ||
      // Tasks I've shared with others
      (task.userId === currentUser.id && task.shared)
    );
  };

  const getMyTasks = () => {
    if (!currentUser) return tasks;
    return tasks.filter(task => task.userId === currentUser.id);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      categories,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      addCategory,
      getTasksByCategory,
      getTasksByPriority,
      shareTask,
      unshareTask,
      getSharedTasks,
      getMyTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

// Sample data
const sampleCategories: Category[] = [
  { id: 'work', name: 'Work', color: '#7C3AED' },
  { id: 'personal', name: 'Personal', color: '#10B981' },
  { id: 'health', name: 'Health', color: '#F59E0B' },
  { id: 'learning', name: 'Learning', color: '#3B82F6' }
];

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the AI task manager proposal with all required sections and submit for review.',
    dueDate: tomorrow,
    priority: 'high',
    completed: false,
    category: 'work',
    aiScore: 85,
    createdAt: new Date(today.setHours(today.getHours() - 24)),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Morning run',
    description: '5K morning run around the park',
    dueDate: today,
    priority: 'medium',
    completed: false,
    category: 'health',
    aiScore: 60,
    createdAt: new Date(today.setHours(today.getHours() - 48)),
    updatedAt: new Date(today.setHours(today.getHours() - 24))
  },
  {
    id: '3',
    title: 'Learn React Hooks',
    description: 'Study useContext and useReducer hooks',
    dueDate: nextWeek,
    priority: 'low',
    completed: false,
    category: 'learning',
    aiScore: 35,
    createdAt: new Date(today.setHours(today.getHours() - 72)),
    updatedAt: new Date(today.setHours(today.getHours() - 48))
  },
  {
    id: '4',
    title: 'Grocery shopping',
    description: 'Buy vegetables, fruits, and other essentials',
    dueDate: tomorrow,
    priority: 'medium',
    completed: false,
    category: 'personal',
    aiScore: 50,
    createdAt: new Date(today.setHours(today.getHours() - 36)),
    updatedAt: new Date(today.setHours(today.getHours() - 12))
  }
];
