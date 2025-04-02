
/**
 * API configuration settings
 * This file provides centralized access to API keys and configuration
 */

/**
 * The main API key for external service access
 * Loads from environment variable or localStorage
 */
export const API_KEY = getApiKey();

/**
 * Get API key from localStorage or env
 * Prioritizes localStorage for user-provided keys
 */
function getApiKey(): string {
  // First try to use localStorage (user-provided key takes precedence)
  const localApiKey = localStorage.getItem('VITE_API_KEY');
  
  // If not available, try to use the environment variable
  if (!localApiKey) {
    return import.meta.env.VITE_API_KEY || '';
  }
  
  return localApiKey;
}

/**
 * Checks if the API key is configured
 * @returns {boolean} Whether the API key is available
 */
export const isApiKeyConfigured = (): boolean => {
  // Check both environment variable and localStorage (for browser persistence)
  return !!getApiKey();
};

/**
 * Get authorization headers for API requests
 * @returns {Record<string, string>} Headers object with authorization
 */
export const getAuthHeaders = (): Record<string, string> => {
  const apiKey = getApiKey();
  
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

/**
 * Clear stored API key from localStorage
 */
export const clearApiKey = (): void => {
  localStorage.removeItem('VITE_API_KEY');
  console.log('API key removed from localStorage');
};
