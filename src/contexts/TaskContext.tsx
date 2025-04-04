import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, PriorityLevel, Category } from '@/types/task';
import { TaskTemplate } from '@/components/TaskTemplates';
import { Collaborator } from '@/types/user';

export interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  setTasks: (tasks: Task[]) => void;
  templates?: TaskTemplate[];
  createTaskFromTemplate?: (templateId: string) => Task;
  deleteTemplate?: (templateId: string) => void;
  renameTemplate?: (templateId: string, name: string, description: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  addCollaborator: (collaborator: Collaborator) => void;
  updateCollaborator: (id: string, updates: Partial<Collaborator>) => void;
  deleteCollaborator: (id: string) => void;
  collaborators: Collaborator[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const storedCategories = localStorage.getItem('categories');
    return storedCategories
      ? JSON.parse(storedCategories)
      : [
          { id: uuidv4(), name: 'Personal', color: '#EF4444' },
          { id: uuidv4(), name: 'Work', color: '#2563EB' },
          { id: uuidv4(), name: 'Shopping', color: '#10B981' },
          { id: uuidv4(), name: 'Health', color: '#EAB308' },
        ];
  });
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    const storedCollaborators = localStorage.getItem('collaborators');
    return storedCollaborators ? JSON.parse(storedCollaborators) : [];
  });
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('collaborators', JSON.stringify(collaborators));
  }, [collaborators]);

  const addTask = (task: Omit<Task, 'id'>): Task => {
    const newTask: Task = {
      id: uuidv4(),
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiScore: Math.floor(Math.random() * 100),
    };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    const reorderedTasks = [...tasks];
    const [removed] = reorderedTasks.splice(startIndex, 1);
    reorderedTasks.splice(endIndex, 0, removed);
    setTasks(reorderedTasks);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      id: uuidv4(),
      ...category,
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(
      categories.map((category) => (category.id === id ? { ...category, ...updates } : category))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  const addCollaborator = (collaborator: Collaborator) => {
    setCollaborators([...collaborators, collaborator]);
  };

  const updateCollaborator = (id: string, updates: Partial<Collaborator>) => {
    setCollaborators(
      collaborators.map((collaborator) =>
        collaborator.id === id ? { ...collaborator, ...updates } : collaborator
      )
    );
  };

  const deleteCollaborator = (id: string) => {
    setCollaborators(collaborators.filter((collaborator) => collaborator.id !== id));
  };

  const createTaskFromTemplate = (templateId: string) => {
    // Implementation
    const template = templates.find(t => t.id === templateId);
    if (!template) return {} as Task;
    
    // Find the task that this template refers to
    const sourceTask = tasks.find(t => t.id === template.taskId);
    if (!sourceTask) return {} as Task;
    
    // Create a new task based on the template
    const newTask = {
      ...sourceTask,
      id: uuidv4(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the new task
    addTask(newTask as Task);
    
    return newTask as Task;
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const renameTemplate = (templateId: string, name: string, description: string) => {
    setTemplates(prev => 
      prev.map(t => t.id === templateId ? { ...t, name, description } : t)
    );
  };

  const contextValue: TaskContextType = {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
    setTasks,
    templates,
    createTaskFromTemplate,
    deleteTemplate,
    renameTemplate,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
    collaborators,
  };

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
