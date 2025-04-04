
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
      const emailNotificationsEnabled = localStorage.getItem('emailNotifications') !== 'false';
      
      // For demonstration purposes, we'll log the email details
      console.log(`[EMAIL SERVICE] Sending email to: ${recipient}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
      
      if (!emailNotificationsEnabled) {
        console.log('Email notifications are disabled in user preferences');
        return false;
      }
      
      // Attempt to call the email API service
      try {
        // In a real implementation, this would call an API endpoint
        // Since this is a demo, we'll simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store sent email in local storage for demo purposes
        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        sentEmails.push({
          to: recipient,
          subject,
          body,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
        
        return true;
      } catch (apiError) {
        console.error('Email API error:', apiError);
        return false;
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  },

  /**
   * Send a team invitation email
   * @param userEmail - Email address of the invitee
   * @param role - Role being offered (admin, member, etc)
   * @param inviterName - Name of the person sending the invitation
   */
  async sendTeamInvitation(userEmail: string, role: string, inviterName: string = 'A team admin'): Promise<boolean> {
    const subject = 'You\'ve been invited to join a team on Smart Task Genius';
    
    const body = `
      <h2>Team Invitation</h2>
      <p>${inviterName} has invited you to join their team as a <strong>${role}</strong>.</p>
      <p>Click the button below to accept this invitation:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${window.location.origin}/accept-invite" 
           style="background-color: #3b82f6; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 4px; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${window.location.origin}/accept-invite</p>
      <p style="color: #666; margin-top: 20px; font-size: 0.9em;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    `;
    
    const sent = await this.sendEmail(userEmail, subject, body);
    
    if (sent) {
      console.log(`Team invitation email sent to ${userEmail}`);
    } else {
      console.warn(`Failed to send team invitation email to ${userEmail}`);
    }
    
    return sent;
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
