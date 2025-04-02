
/**
 * API configuration settings
 * This file provides centralized access to API keys and configuration
 */

/**
 * The main API key for external service access
 * Loads from VITE_API_KEY environment variable
 */
export const API_KEY = import.meta.env.VITE_API_KEY || '';

/**
 * Checks if the API key is configured
 * @returns {boolean} Whether the API key is available
 */
export const isApiKeyConfigured = (): boolean => {
  // Check both environment variable and localStorage (for browser persistence)
  const envApiKey = import.meta.env.VITE_API_KEY;
  const localApiKey = localStorage.getItem('VITE_API_KEY');
  
  // Return true if either source has an API key
  return !!(envApiKey || localApiKey);
};

/**
 * Get authorization headers for API requests
 * @returns {Record<string, string>} Headers object with authorization
 */
export const getAuthHeaders = (): Record<string, string> => {
  // First try to use the environment variable
  let apiKey = import.meta.env.VITE_API_KEY;
  
  // If not available, try to use from localStorage
  if (!apiKey) {
    apiKey = localStorage.getItem('VITE_API_KEY') || '';
  }
  
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Store an API key in localStorage for persistence
 * @param {string} key - The API key to store
 */
export const storeApiKey = (key: string): void => {
  localStorage.setItem('VITE_API_KEY', key);
  console.log('API key stored in localStorage');
};
