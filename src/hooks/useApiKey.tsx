
import { useEffect, useState } from 'react';
import { API_KEY, isApiKeyConfigured } from '../config/api';
import { toast } from 'sonner';

/**
 * Hook to check and validate API key configuration
 * @returns Object containing API key status information
 */
export const useApiKey = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Check if API key is available
    const apiKeyAvailable = isApiKeyConfigured();
    setIsConfigured(apiKeyAvailable);
    
    // Notify if API key is not configured
    if (!apiKeyAvailable) {
      toast.error("API key not configured. Some features may not work properly.");
      console.error("API key not found. Please add VITE_API_KEY to your environment variables.");
    } else {
      console.log("API key configured successfully");
    }
  }, []);
  
  return {
    isConfigured,
    // Only return the first few characters of the API key for verification purposes
    // Never expose the full API key in UI
    keyPreview: isConfigured ? `${API_KEY.substring(0, 8)}...` : 'Not configured'
  };
};
