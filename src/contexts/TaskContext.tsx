
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
import { TaskAttachment } from '@/types/task';

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
  updateCollaborator: (id: string, updates: Partial<Collaborator>) => void;
  deleteCollaborator: (id: string) => void;
  collaborators: Collaborator[];
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
  shareTask: (taskId: string, collaboratorIds: string[]) => void;
  unshareTask: (taskId: string) => void;
  getSharedTasks: () => Task[];
  exportTasks: () => string;
  importTasks: (jsonData: string) => void;
  addTaskDependency: (taskId: string, dependsOnTaskId: string) => void;
  removeTaskDependency: (taskId: string, dependsOnTaskId: string) => void;
  getTaskDependencies: (taskId: string) => Task[];
  getDependentTasks: (taskId: string) => Task[];
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
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    const storedTemplates = localStorage.getItem('templates');
    return storedTemplates ? JSON.parse(storedTemplates) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('collaborators', JSON.stringify(collaborators));
  }, [collaborators]);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

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

  const completeTask = (id: string) => {
    toggleComplete(id);
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
    if (!collaborator.id) {
      collaborator.id = uuidv4();
    }
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
    setTasks(prevTasks => [...prevTasks, newTask as Task]);
    
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
  
  const saveTemplate = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newTemplate: TaskTemplate = {
      id: uuidv4(),
      taskId: taskId,
      name: `Template: ${task.title}`,
      description: task.description,
      createdAt: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, newTemplate]);
  };

  const addAttachment = (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => {
    const newAttachment = {
      ...attachment,
      id: uuidv4()
    };
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          attachments: [...(task.attachments || []), newAttachment]
        };
      }
      return task;
    }));
  };
  
  const removeAttachment = (taskId: string, attachmentId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.attachments) {
        return {
          ...task,
          attachments: task.attachments.filter(a => a.id !== attachmentId)
        };
      }
      return task;
    }));
  };

  const shareTask = (taskId: string, collaboratorIds: string[]) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const taskCollaborators = collaboratorIds.map(id => 
          collaborators.find(c => c.id === id)
        ).filter(Boolean) as Collaborator[];
        
        return {
          ...task,
          shared: true,
          collaborators: taskCollaborators
        };
      }
      return task;
    }));
  };
  
  const unshareTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          shared: false,
          collaborators: []
        };
      }
      return task;
    }));
  };
  
  const getSharedTasks = () => {
    return tasks.filter(task => task.shared);
  };

  const exportTasks = () => {
    return JSON.stringify({
      tasks,
      categories,
      collaborators,
      templates
    }, null, 2);
  };
  
  const importTasks = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks) setTasks(data.tasks);
      if (data.categories) setCategories(data.categories);
      if (data.collaborators) setCollaborators(data.collaborators);
      if (data.templates) setTemplates(data.templates);
    } catch (error) {
      console.error('Error importing tasks:', error);
      throw new Error('Invalid JSON data');
    }
  };

  const addTaskDependency = (taskId: string, dependsOnTaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const dependencies = task.dependencies || [];
        if (!dependencies.includes(dependsOnTaskId)) {
          return {
            ...task,
            dependencies: [...dependencies, dependsOnTaskId]
          };
        }
      }
      return task;
    }));
  };
  
  const removeTaskDependency = (taskId: string, dependsOnTaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.dependencies) {
        return {
          ...task,
          dependencies: task.dependencies.filter(id => id !== dependsOnTaskId)
        };
      }
      return task;
    }));
  };
  
  const getTaskDependencies = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.dependencies) return [];
    
    return task.dependencies
      .map(depId => tasks.find(t => t.id === depId))
      .filter(Boolean) as Task[];
  };
  
  const getDependentTasks = (taskId: string) => {
    return tasks.filter(task => 
      task.dependencies && task.dependencies.includes(taskId)
    );
  };

  const contextValue: TaskContextType = {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    completeTask,
    reorderTasks,
    setTasks,
    templates,
    createTaskFromTemplate,
    deleteTemplate,
    renameTemplate,
    saveTemplate,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
    collaborators,
    addAttachment,
    removeAttachment,
    shareTask,
    unshareTask,
    getSharedTasks,
    exportTasks,
    importTasks,
    addTaskDependency,
    removeTaskDependency,
    getTaskDependencies,
    getDependentTasks
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
