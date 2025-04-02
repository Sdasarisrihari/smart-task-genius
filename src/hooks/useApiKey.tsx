
import { useEffect, useState } from 'react';
import { isApiKeyConfigured } from '../config/api';
import { toast } from 'sonner';
import { apiService } from '../services/apiService';

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
    const apiKeyAvailable = isApiKeyConfigured();
    setIsConfigured(apiKeyAvailable);
    
    if (!apiKeyAvailable) {
      toast.error("API key not configured. Some features may not work properly.");
      console.error("API key not found. Please add one in the Settings page.");
      setKeyPreview('Not configured');
      return;
    }
    
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
