
export const NotificationService = {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  async sendNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      const defaultOptions: NotificationOptions = {
        badge: '/favicon.ico',
        icon: '/favicon.ico',
        silent: false,
        ...options
      };

      // First try to use service worker
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        await navigator.serviceWorker.ready;
        await navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: defaultOptions
        });
        return true;
      } else {
        // Fallback to regular notification
        new Notification(title, defaultOptions);
        return true;
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  },

  scheduleNotification(task: {id: string, title: string, dueDate: Date | null}): void {
    if (!task.dueDate) return;
    
    const now = new Date();
    const dueTime = new Date(task.dueDate).getTime();
    
    // Calculate time until due (ensure it's at least 1 minute in the future)
    const timeUntilDue = Math.max(dueTime - now.getTime(), 60000); 
    
    // Schedule notifications at different intervals
    if (timeUntilDue <= 60 * 60 * 1000) { // Less than 1 hour away
      setTimeout(() => {
        this.sendNotification(`Task due soon: ${task.title}`, {
          body: `Your task "${task.title}" is due in less than an hour!`,
          data: `/task/${task.id}`
        });
      }, timeUntilDue - (15 * 60 * 1000)); // 15 minutes before due
    } else {
      setTimeout(() => {
        this.sendNotification(`Upcoming task: ${task.title}`, {
          body: `Your task "${task.title}" is due in 1 hour`,
          data: `/task/${task.id}`
        });
      }, timeUntilDue - (60 * 60 * 1000)); // 1 hour before due
    }
  }
};

export const registerServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }
  console.warn('Service Workers not supported');
  return false;
};
