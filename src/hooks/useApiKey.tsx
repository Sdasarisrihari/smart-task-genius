
import { useEffect, useState } from 'react';
import { API_KEY, isApiKeyConfigured } from '../config/api';
import { toast } from 'sonner';

/**
 * Hook to check and validate API key configuration
 * @returns Object containing API key status information
 */
export const useApiKey = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if API key is available
    const apiKeyAvailable = isApiKeyConfigured();
    setIsConfigured(apiKeyAvailable);
    
    if (!apiKeyAvailable) {
      toast.error("API key not configured. Some features may not work properly.");
      console.error("API key not found. Please add VITE_API_KEY to your environment variables.");
      return;
    }
    
    // Basic validation (just check it's not empty)
    console.log("API key configured successfully");
    
    // Optional - you could add an API key validation check here
    // For now we'll assume it's valid if it exists
    setIsValid(true);
    
  }, []);
  
  return {
    isConfigured,
    isValidating,
    isValid,
    // Only return the first few characters of the API key for verification purposes
    // Never expose the full API key in UI
    keyPreview: isConfigured ? `${API_KEY.substring(0, 8)}...` : 'Not configured'
  };
};
