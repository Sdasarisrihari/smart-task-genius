
import { Task } from "../types/task";

interface SyncOperation {
  id: string;
  type: 'add' | 'update' | 'delete';
  entity: 'task' | 'category';
  data: any;
  timestamp: number;
  synced: boolean;
}

export const SyncService = {
  pendingOperations: [] as SyncOperation[],
  
  init() {
    // Load pending operations from localStorage
    try {
      const savedOperations = localStorage.getItem('pendingOperations');
      if (savedOperations) {
        this.pendingOperations = JSON.parse(savedOperations);
      }
    } catch (error) {
      console.error("Error loading pending sync operations:", error);
    }
    
    // Set up network status listeners
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));
    
    // If online, try to sync immediately
    if (navigator.onLine) {
      this.syncPendingOperations();
    }
    
    // Set up periodic sync
    setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingOperations();
      }
    }, 60000); // Try every minute
    
    console.log("Sync service initialized. Network status:", navigator.onLine ? "online" : "offline");
    return this;
  },
  
  handleNetworkChange() {
    if (navigator.onLine) {
      console.log("Back online, attempting to sync");
      this.syncPendingOperations();
    } else {
      console.log("Offline mode activated");
    }
  },
  
  async syncPendingOperations() {
    if (!navigator.onLine || this.pendingOperations.length === 0) return;
    
    console.log(`Attempting to sync ${this.pendingOperations.length} pending operations`);
    
    const successfulIds = [];
    
    for (const operation of this.pendingOperations) {
      try {
        // In a real app, this would call an API endpoint
        // For this demo, we'll simulate successful syncing
        
        // Mark as synced and add to successful list
        operation.synced = true;
        successfulIds.push(operation.id);
        
        // For demo, just emit an event that sync occurred
        window.dispatchEvent(new CustomEvent('sync-completed', { 
          detail: { operation } 
        }));
      } catch (error) {
        console.error(`Error syncing operation ${operation.id}:`, error);
      }
    }
    
    // Remove successful operations
    this.pendingOperations = this.pendingOperations.filter(
      op => !successfulIds.includes(op.id)
    );
    
    // Update localStorage
    localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    
    return successfulIds.length;
  },
  
  queueOperation(type: 'add' | 'update' | 'delete', entity: 'task' | 'category', data: any) {
    const operation: SyncOperation = {
      id: crypto.randomUUID(),
      type,
      entity,
      data,
      timestamp: Date.now(),
      synced: false
    };
    
    this.pendingOperations.push(operation);
    localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    
    // If online, try to sync immediately
    if (navigator.onLine) {
      this.syncPendingOperations();
    }
    
    return operation.id;
  }
};
