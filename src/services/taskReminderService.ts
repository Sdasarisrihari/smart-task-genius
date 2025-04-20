
import { Task, RecurrencePattern } from "@/types/task";
import { EmailService } from "./emailService";
import { NotificationService } from "./notificationService";
import { format } from "date-fns";

export const TaskReminderService = {
  /**
   * Schedule reminders for a task based on due date
   */
  scheduleReminders(task: Task, userEmail?: string): void {
    if (!task.dueDate) return;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const msUntilDue = dueDate.getTime() - now.getTime();
    
    // Don't schedule reminders for past due tasks
    if (msUntilDue <= 0) return;
    
    // Schedule notification reminders at different intervals
    this.scheduleNotificationReminders(task, msUntilDue);
    
    // Schedule email reminders if user email is provided
    if (userEmail) {
      this.scheduleEmailReminders(task, userEmail, msUntilDue);
    }
  },
  
  /**
   * Schedule browser/push notifications for a task
   */
  scheduleNotificationReminders(task: Task, msUntilDue: number): void {
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    if (!notificationsEnabled) return;
    
    const dueDateObj = new Date(task.dueDate!);
    const formattedDate = format(dueDateObj, 'MMM d, h:mm a');
    
    // 1 day before
    if (msUntilDue > 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        NotificationService.sendNotification(
          `Task Due Tomorrow: ${task.title}`,
          { 
            body: `Your task "${task.title}" is due tomorrow at ${format(dueDateObj, 'h:mm a')}.`,
            data: { taskId: task.id }
          }
        );
      }, msUntilDue - 24 * 60 * 60 * 1000);
    }
    
    // 1 hour before
    if (msUntilDue > 60 * 60 * 1000) {
      setTimeout(() => {
        NotificationService.sendNotification(
          `Task Due Soon: ${task.title}`,
          { 
            body: `Your task "${task.title}" is due in 1 hour.`,
            data: { taskId: task.id }
          }
        );
      }, msUntilDue - 60 * 60 * 1000);
    }
    
    // 15 minutes before
    if (msUntilDue > 15 * 60 * 1000) {
      setTimeout(() => {
        NotificationService.sendNotification(
          `Task Due Very Soon: ${task.title}`,
          { 
            body: `Your task "${task.title}" is due in 15 minutes.`,
            data: { taskId: task.id }
          }
        );
      }, msUntilDue - 15 * 60 * 1000);
    }
  },
  
  /**
   * Schedule email reminders for a task
   */
  scheduleEmailReminders(task: Task, userEmail: string, msUntilDue: number): void {
    const emailNotificationsEnabled = localStorage.getItem('emailNotifications') === 'true';
    if (!emailNotificationsEnabled) return;
    
    // 1 day before
    if (msUntilDue > 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        EmailService.sendTaskReminder(userEmail, task);
      }, msUntilDue - 24 * 60 * 60 * 1000);
    }
  },
  
  /**
   * Generate next occurrence of a recurring task
   */
  generateNextOccurrence(recurringTask: Task): Task | null {
    if (!recurringTask.recurrence || !recurringTask.dueDate) return null;
    
    const pattern = recurringTask.recurrence;
    const lastDueDate = new Date(recurringTask.dueDate);
    let nextDueDate: Date | null = null;
    
    // Calculate next due date based on recurrence pattern
    switch(pattern.frequency) {
      case 'daily':
        nextDueDate = new Date(lastDueDate);
        nextDueDate.setDate(lastDueDate.getDate() + pattern.interval);
        break;
      case 'weekly':
        // For weekly, we respect the days of week if specified
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find the next occurrence based on days of week
          nextDueDate = this.getNextWeeklyDate(lastDueDate, pattern);
        } else {
          // Simple weekly recurrence
          nextDueDate = new Date(lastDueDate);
          nextDueDate.setDate(lastDueDate.getDate() + (7 * pattern.interval));
        }
        break;
      case 'monthly':
        nextDueDate = new Date(lastDueDate);
        nextDueDate.setMonth(lastDueDate.getMonth() + pattern.interval);
        // If dayOfMonth is specified, use it instead
        if (pattern.dayOfMonth) {
          nextDueDate.setDate(pattern.dayOfMonth);
        }
        break;
      case 'yearly':
        nextDueDate = new Date(lastDueDate);
        nextDueDate.setFullYear(lastDueDate.getFullYear() + pattern.interval);
        // If monthOfYear is specified, use it
        if (pattern.monthOfYear !== undefined) {
          nextDueDate.setMonth(pattern.monthOfYear);
        }
        break;
    }
    
    if (!nextDueDate) return null;
    
    // Check if we've reached the end of recurrence
    if (pattern.endDate && new Date(pattern.endDate) < nextDueDate) {
      return null;
    }
    
    // Create a new task for the next occurrence
    const nextTask: Task = {
      ...recurringTask,
      id: crypto.randomUUID(),
      dueDate: nextDueDate.toISOString(),
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentRecurringTaskId: recurringTask.id
    };
    
    return nextTask;
  },
  
  /**
   * Helper to find next weekly occurrence based on days of week
   */
  getNextWeeklyDate(lastDate: Date, pattern: RecurrencePattern): Date {
    if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
      // If no days specified, just add a week
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + (7 * pattern.interval));
      return nextDate;
    }
    
    // Clone the date
    const nextDate = new Date(lastDate);
    
    // Find the next day of week that is in our pattern
    let daysToAdd = 1;
    let currentDayOfWeek = (lastDate.getDay() + 1) % 7; // Next day
    
    // Keep incrementing until we find a day of the week in our pattern
    while (!pattern.daysOfWeek.includes(currentDayOfWeek)) {
      daysToAdd++;
      currentDayOfWeek = (currentDayOfWeek + 1) % 7;
    }
    
    nextDate.setDate(lastDate.getDate() + daysToAdd);
    return nextDate;
  }
};
