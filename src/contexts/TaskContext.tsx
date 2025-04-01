
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, PriorityLevel, Category, TimeLogEntry, TaskAttachment } from '../types/task';
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
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getTasksByCategory: (categoryId: string) => Task[];
  getTasksByPriority: (priority: PriorityLevel) => Task[];
  shareTask: (taskId: string, collaborators: Collaborator[]) => void;
  unshareTask: (taskId: string) => void;
  getSharedTasks: () => Task[];
  getMyTasks: () => Task[];
  saveTemplate: (taskId: string) => void;
  createFromTemplate: (templateId: string) => void;
  getTemplates: () => Task[];
  addTaskDependency: (taskId: string, dependsOnId: string) => void;
  removeTaskDependency: (taskId: string, dependsOnId: string) => void;
  getDependentTasks: (taskId: string) => Task[];
  getTaskDependencies: (taskId: string) => Task[];
  addTimeLog: (taskId: string, log: Omit<TimeLogEntry, 'id'>) => void;
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
  exportTasks: () => string;
  importTasks: (jsonData: string) => void;
  getTasksByDateRange: (startDate: Date, endDate: Date) => Task[];
  suggestTaskPriorities: () => void;
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
          timeTracking: task.timeTracking ? {
            ...task.timeTracking,
            logs: task.timeTracking.logs?.map((log: any) => ({
              ...log,
              startTime: new Date(log.startTime),
              endTime: log.endTime ? new Date(log.endTime) : null
            }))
          } : undefined
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

    // Dependencies factor
    if (task.dependencies && task.dependencies.length > 0) {
      score += 15;
    }
    
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
        if ('priority' in updatedFields || 'dueDate' in updatedFields || 'description' in updatedFields || 'dependencies' in updatedFields) {
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
  
  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(categories.map(category => {
      if (category.id === id) {
        const updatedCategory = { ...category, ...updatedFields };
        
        // Queue for sync when online
        if (isAuthenticated) {
          SyncService.queueOperation('update', 'category', updatedCategory);
        }
        
        return updatedCategory;
      }
      return category;
    }));
  };
  
  const deleteCategory = (id: string) => {
    // Confirm category has no tasks before deleting
    const hasTasks = tasks.some(task => task.category === id);
    
    if (hasTasks) {
      // Optionally reassign tasks to another category
      const defaultCategoryId = categories.find(c => c.id !== id)?.id || 'uncategorized';
      
      setTasks(tasks.map(task => {
        if (task.category === id) {
          return { ...task, category: defaultCategoryId };
        }
        return task;
      }));
    }
    
    setCategories(categories.filter(category => category.id !== id));
    
    // Queue for sync when online
    if (isAuthenticated) {
      SyncService.queueOperation('delete', 'category', { id });
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

  const saveTemplate = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const templateTask: Task = {
      ...task,
      id: uuidv4(),
      isTemplate: true,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTasks([...tasks, templateTask]);
    toast.success("Task saved as template");
    
    // Queue for sync when online
    if (isAuthenticated) {
      SyncService.queueOperation('add', 'task', templateTask);
    }
  };
  
  const createFromTemplate = (templateId: string) => {
    const template = tasks.find(t => t.id === templateId && t.isTemplate);
    if (!template) return;
    
    const newTask: Task = {
      ...template,
      id: uuidv4(),
      isTemplate: false,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: currentUser?.id,
    };
    
    setTasks([...tasks, newTask]);
    toast.success("Task created from template");
    
    // Queue for sync when online
    if (isAuthenticated) {
      SyncService.queueOperation('add', 'task', newTask);
    }
  };
  
  const getTemplates = () => {
    return tasks.filter(task => task.isTemplate);
  };

  const addTaskDependency = (taskId: string, dependsOnId: string) => {
    // Check to prevent circular dependencies
    const dependsOnTask = tasks.find(t => t.id === dependsOnId);
    if (dependsOnTask?.dependencies?.includes(taskId)) {
      toast.error("Cannot add circular dependency");
      return;
    }
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const dependencies = task.dependencies || [];
        if (dependencies.includes(dependsOnId)) {
          toast.error("Dependency already exists");
          return task;
        }
        
        const updatedTask = {
          ...task,
          dependencies: [...dependencies, dependsOnId],
          updatedAt: new Date()
        };
        
        // Queue for sync when online
        if (isAuthenticated) {
          SyncService.queueOperation('update', 'task', updatedTask);
        }
        
        return updatedTask;
      }
      return task;
    }));
  };
  
  const removeTaskDependency = (taskId: string, dependsOnId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.dependencies) {
        const updatedTask = {
          ...task,
          dependencies: task.dependencies.filter(id => id !== dependsOnId),
          updatedAt: new Date()
        };
        
        // Queue for sync when online
        if (isAuthenticated) {
          SyncService.queueOperation('update', 'task', updatedTask);
        }
        
        return updatedTask;
      }
      return task;
    }));
  };
  
  const getDependentTasks = (taskId: string) => {
    // Return tasks that depend on this task
    return tasks.filter(task => 
      task.dependencies && task.dependencies.includes(taskId)
    );
  };
  
  const getTaskDependencies = (taskId: string) => {
    // Return tasks that this task depends on
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.dependencies) return [];
    
    return tasks.filter(t => task.dependencies?.includes(t.id));
  };

  const addTimeLog = (taskId: string, log: Omit<TimeLogEntry, 'id'>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newLog: TimeLogEntry = { ...log, id: uuidv4() };
    const currentLogs = task.timeTracking?.logs || [];
    const currentActualMinutes = task.timeTracking?.actualMinutes || 0;
    
    const updatedTask = {
      ...task,
      timeTracking: {
        estimatedMinutes: task.timeTracking?.estimatedMinutes || 0,
        actualMinutes: currentActualMinutes + log.durationMinutes,
        logs: [...currentLogs, newLog]
      },
      updatedAt: new Date()
    };
    
    updateTask(taskId, updatedTask);
  };

  const addAttachment = (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newAttachment: TaskAttachment = { ...attachment, id: uuidv4() };
    const currentAttachments = task.attachments || [];
    
    updateTask(taskId, {
      attachments: [...currentAttachments, newAttachment]
    });
    
    toast.success("Attachment added");
  };
  
  const removeAttachment = (taskId: string, attachmentId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.attachments) return;
    
    updateTask(taskId, {
      attachments: task.attachments.filter(a => a.id !== attachmentId)
    });
    
    toast.success("Attachment removed");
  };

  const exportTasks = () => {
    // Export tasks as JSON string
    const tasksToExport = currentUser 
      ? tasks.filter(task => task.userId === currentUser.id || !task.userId)
      : tasks;
    
    return JSON.stringify(tasksToExport);
  };
  
  const importTasks = (jsonData: string) => {
    try {
      const importedTasks = JSON.parse(jsonData);
      
      if (!Array.isArray(importedTasks)) {
        throw new Error("Invalid import format");
      }
      
      // Process imported tasks
      const now = new Date();
      const processedTasks = importedTasks.map(task => ({
        ...task,
        id: uuidv4(), // Generate new IDs
        userId: currentUser?.id,
        createdAt: now,
        updatedAt: now,
        dueDate: task.dueDate ? new Date(task.dueDate) : null
      }));
      
      // Add to existing tasks
      setTasks([...tasks, ...processedTasks]);
      toast.success(`Imported ${processedTasks.length} tasks successfully`);
    } catch (err) {
      toast.error("Failed to import tasks. Invalid format.");
      console.error(err);
    }
  };

  const getTasksByDateRange = (startDate: Date, endDate: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= startDate && dueDate <= endDate;
    });
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

  const suggestTaskPriorities = () => {
    // Simulate AI-based priority suggestions
    const updatedTasks = tasks.map(task => {
      if (task.completed) return task;
      
      // Calculate a new AI score for each task
      const newScore = calculateAiScore(task);
      
      // Determine if priority should change based on score
      let suggestedPriority: PriorityLevel = task.priority;
      
      if (newScore >= 70 && task.priority !== 'high') {
        suggestedPriority = 'high';
      } else if (newScore < 70 && newScore >= 40 && task.priority !== 'medium') {
        suggestedPriority = 'medium';
      } else if (newScore < 40 && task.priority !== 'low') {
        suggestedPriority = 'low';
      }
      
      // Only update if different from current
      if (suggestedPriority !== task.priority) {
        toast.info(`AI suggested changing "${task.title}" priority to ${suggestedPriority}`);
        return { ...task, priority: suggestedPriority, aiScore: newScore, updatedAt: new Date() };
      }
      
      return { ...task, aiScore: newScore };
    });
    
    setTasks(updatedTasks);
    toast.success("AI priority suggestions applied");
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
      updateCategory,
      deleteCategory,
      getTasksByCategory,
      getTasksByPriority,
      shareTask,
      unshareTask,
      getSharedTasks,
      getMyTasks,
      saveTemplate,
      createFromTemplate,
      getTemplates,
      addTaskDependency,
      removeTaskDependency,
      getDependentTasks,
      getTaskDependencies,
      addTimeLog,
      addAttachment,
      removeAttachment,
      exportTasks,
      importTasks,
      getTasksByDateRange,
      suggestTaskPriorities
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
