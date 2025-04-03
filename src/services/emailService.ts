
import { apiService } from './apiService';
import { toast } from 'sonner';

export const EmailService = {
  /**
   * Send an email notification to a user
   * @param recipient - Email address of the recipient
   * @param subject - Subject line of the email
   * @param body - HTML body content of the email
   * @returns Promise resolving to success boolean
   */
  async sendEmail(recipient: string, subject: string, body: string): Promise<boolean> {
    try {
      // Check if email notifications are enabled in user preferences
      const emailNotificationsEnabled = localStorage.getItem('emailNotifications') === 'true';
      if (!emailNotificationsEnabled) {
        console.log('Email notifications are disabled in user preferences');
        return false;
      }

      // For demonstration purposes, we'll just log the email
      // In a real app, this would call an API endpoint
      console.log(`[EMAIL SERVICE] Sending email to: ${recipient}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
      
      // Mock API call to email service
      // In a real implementation, this would be apiService.sendEmail()
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  },

  /**
   * Send a task reminder email
   * @param userEmail - Email address of the user
   * @param task - Task object with details for the reminder
   */
  async sendTaskReminder(userEmail: string, task: any): Promise<void> {
    if (!task.title || !task.dueDate) return;
    
    const subject = `Task Reminder: ${task.title}`;
    const priorityLabel = task.priority === 'high' ? '⚠️ High priority' : 
                          task.priority === 'medium' ? '⚠ Medium priority' : 'Low priority';
    
    const body = `
      <h2>Task Reminder</h2>
      <p>This is a reminder about your task:</p>
      <h3>${task.title}</h3>
      <p>${task.description || 'No description'}</p>
      <p><strong>Due date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
      <p><strong>Priority:</strong> ${priorityLabel}</p>
      <p>Log in to your account to view and manage this task.</p>
    `;
    
    const sent = await this.sendEmail(userEmail, subject, body);
    if (sent) {
      toast.success('Reminder email sent', {
        description: `An email reminder was sent to ${userEmail}`
      });
    }
  },
  
  /**
   * Schedule email reminder for a task
   * @param userEmail - User's email address
   * @param task - Task object
   * @param reminderTimeMs - Time before due date to send reminder (in milliseconds)
   */
  scheduleTaskReminder(userEmail: string, task: any, reminderTimeMs = 24 * 60 * 60 * 1000): void {
    if (!task.dueDate) return;
    
    const dueDate = new Date(task.dueDate).getTime();
    const now = Date.now();
    const reminderTime = dueDate - reminderTimeMs;
    
    // Only schedule if reminder time is in the future
    if (reminderTime > now) {
      const timeUntilReminder = reminderTime - now;
      
      // For demonstration, log the scheduled time
      console.log(`Scheduled email reminder for task "${task.title}" in ${timeUntilReminder / 60000} minutes`);
      
      // Set timeout to send the reminder
      setTimeout(() => {
        this.sendTaskReminder(userEmail, task);
      }, timeUntilReminder);
    }
  }
};
