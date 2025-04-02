
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function SecurityAlert() {
  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Security Notice</AlertTitle>
      <AlertDescription>
        <p>Your API key is currently stored in your browser's localStorage. This is more secure than storing it directly in code, but:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Don't use this approach on shared computers</li>
          <li>Clear browser data when using public computers</li>
          <li>For production apps, consider storing API keys server-side</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
