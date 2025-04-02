
import { getAuthHeaders } from '../config/api';
import { toast } from 'sonner';
import { Task } from '@/types/task';

/**
 * Base URL for API requests
 */
const API_BASE_URL = 'https://api.example.com/v1';

/**
 * Generic fetch function with error handling and authentication
 */
export async function fetchFromApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API functions for task management and other features
 */
export const apiService = {
  // User data
  getUserData: async () => {
    return fetchFromApi('/user');
  },
  
  // Task management
  getTasks: async () => {
    return fetchFromApi<Task[]>('/tasks');
  },
  
  getTask: async (id: string) => {
    return fetchFromApi<Task>(`/tasks/${id}`);
  },
  
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchFromApi<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  
  updateTask: async (id: string, task: Partial<Task>) => {
    return fetchFromApi<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },
  
  deleteTask: async (id: string) => {
    return fetchFromApi(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Categories
  getCategories: async () => {
    return fetchFromApi('/categories');
  },
  
  createCategory: async (category: any) => {
    return fetchFromApi('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
  
  // Task sharing and collaboration
  shareTask: async (taskId: string, users: string[]) => {
    return fetchFromApi(`/tasks/${taskId}/share`, {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
  },
  
  // Team management
  getTeamMembers: async () => {
    return fetchFromApi('/team/members');
  },
  
  inviteTeamMember: async (email: string, role: string) => {
    return fetchFromApi('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },
  
  // File uploads for tasks
  uploadTaskAttachment: async (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetchFromApi(`/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the correct Content-Type for FormData
    });
  },
  
  // Analytics data
  getTaskAnalytics: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    return fetchFromApi(`/analytics/tasks?period=${period}`);
  },
  
  getProductivityMetrics: async () => {
    return fetchFromApi('/analytics/productivity');
  },
  
  getCompletionRateByCategory: async () => {
    return fetchFromApi('/analytics/completion-rate');
  },
  
  // User preferences
  getUserPreferences: async () => {
    return fetchFromApi('/user/preferences');
  },
  
  updateUserPreferences: async (preferences: any) => {
    return fetchFromApi('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};
