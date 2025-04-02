
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
  return !!API_KEY;
};

/**
 * Get authorization headers for API requests
 * @returns {Record<string, string>} Headers object with authorization
 */
export const getAuthHeaders = (): Record<string, string> => {
  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };
};
