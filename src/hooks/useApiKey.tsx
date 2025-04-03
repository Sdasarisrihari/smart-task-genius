
import { useEffect, useState } from 'react';
import { isApiKeyConfigured, storeApiKey } from '../config/api';
import { toast } from 'sonner';
import { apiService } from '../services/apiService';

// Default API key for demo purposes
const DEFAULT_API_KEY = 'demo_api_key_12345';

/**
 * Hook to check and validate API key configuration
 * @returns Object containing API key status information
 */
export const useApiKey = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [keyPreview, setKeyPreview] = useState<string>('Not configured');

  const validateApiKey = async () => {
    try {
      setIsValidating(true);
      // Attempt to make a basic API call to validate the key
      await apiService.getUserData();
      setIsValid(true);
      toast.success("API key validated successfully");
      return true;
    } catch (error) {
      console.error("API key validation failed:", error);
      setIsValid(false);
      toast.error("API key validation failed");
      return false;
    } finally {
      setIsValidating(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check if API key is available
    let apiKeyAvailable = isApiKeyConfigured();
    
    // If API key is not configured, set a default one for demo purposes
    if (!apiKeyAvailable) {
      console.log("Setting default API key for demo purposes");
      storeApiKey(DEFAULT_API_KEY);
      apiKeyAvailable = true;
    }
    
    setIsConfigured(apiKeyAvailable);
    
    // Display a masked preview of the API key
    const key = localStorage.getItem('VITE_API_KEY') || import.meta.env.VITE_API_KEY;
    if (key) {
      setKeyPreview(`${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
    }
    
    // Log successful configuration
    console.log("API key configured successfully");
    
    // Validate the API key on initial load
    validateApiKey();
  }, []);
  
  return {
    isConfigured,
    isValidating,
    isValid,
    lastChecked,
    validateApiKey,
    keyPreview,
  };
};
