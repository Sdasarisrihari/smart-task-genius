
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SyncService } from '@/services/syncService';

export const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [pendingOperations, setPendingOperations] = useState<number>(0);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!', {
        description: 'Synchronizing your data...'
      });
      
      // Trigger sync when back online
      SyncService.syncPendingOperations().then((syncedCount) => {
        if (syncedCount && syncedCount > 0) {
          toast.success(`Synchronized ${syncedCount} pending changes`);
        }
      });
      
      setWasOffline(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline', {
        description: 'Changes will be synchronized when you reconnect'
      });
    };
    
    const handlePendingOperationsChange = () => {
      setPendingOperations(SyncService.pendingOperations.length);
    };
    
    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for sync events to update pending operations count
    window.addEventListener('sync-completed', handlePendingOperationsChange);
    
    // Get initial count of pending operations
    setPendingOperations(SyncService.pendingOperations.length);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-completed', handlePendingOperationsChange);
    };
  }, []);

  // Show/hide the offline banner
  if (isOnline) {
    // Show success alert when coming back online if there were pending operations
    if (wasOffline && pendingOperations > 0) {
      return (
        <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-700 dark:text-green-400">Back online</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            {pendingOperations > 0 ? (
              <p>Synchronizing {pendingOperations} pending changes...</p>
            ) : (
              <p>All your changes have been synchronized.</p>
            )}
          </AlertDescription>
        </Alert>
      );
    }
    return null; // Don't show anything when online normally
  }

  // Show offline banner
  return (
    <Alert className="mb-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
      <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-700 dark:text-amber-400">You are offline</AlertTitle>
      <AlertDescription className="text-amber-600 dark:text-amber-400">
        <p>Don't worry! You can continue working and your changes will be synced when you're back online.</p>
        {pendingOperations > 0 && (
          <p className="mt-1 font-medium">
            {pendingOperations} {pendingOperations === 1 ? 'change' : 'changes'} pending synchronization
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
