
import { getAuthHeaders } from '../config/api';
import { toast } from 'sonner';

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
 * Example API functions
 */
export const apiService = {
  // Get user data
  getUserData: async () => {
    return fetchFromApi('/user');
  },
  
  // Get data with pagination
  getItems: async (page: number = 1, limit: number = 10) => {
    return fetchFromApi(`/items?page=${page}&limit=${limit}`);
  },
  
  // Create a new item
  createItem: async (data: any) => {
    return fetchFromApi('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update an existing item
  updateItem: async (id: string, data: any) => {
    return fetchFromApi(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete an item
  deleteItem: async (id: string) => {
    return fetchFromApi(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};
