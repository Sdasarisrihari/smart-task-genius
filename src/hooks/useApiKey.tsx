
import { useEffect, useState } from 'react';
import { API_KEY, isApiKeyConfigured } from '../config/api';
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
      console.error("API key not found. Please add VITE_API_KEY to your environment variables.");
      return;
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
    // Only return the first few characters of the API key for verification purposes
    // Never expose the full API key in UI
    keyPreview: isConfigured ? `${API_KEY.substring(0, 8)}...` : 'Not configured'
  };
};
