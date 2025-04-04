
import { Task } from "@/types/task";
import { toast } from "sonner";

export enum CalendarProvider {
  GOOGLE = "google",
  OUTLOOK = "outlook",
  APPLE = "apple",
  GENERIC = "generic"
}

interface CalendarEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

export const CalendarService = {
  /**
   * Add a single event to a calendar
   * @param event - Event details
   * @param provider - Calendar provider
   * @returns Promise indicating success or failure
   */
  async addEvent(event: CalendarEvent, provider: CalendarProvider): Promise<boolean> {
    try {
      console.log(`Adding event to ${provider} calendar:`, event);
      
      switch (provider) {
        case CalendarProvider.GOOGLE:
          return await this.addToGoogleCalendar(event);
          
        case CalendarProvider.OUTLOOK:
          return await this.addToOutlookCalendar(event);
          
        case CalendarProvider.APPLE:
          return await this.addToAppleCalendar(event);
          
        case CalendarProvider.GENERIC:
          return await this.downloadICS(event);
          
        default:
          throw new Error(`Unsupported calendar provider: ${provider}`);
      }
    } catch (error) {
      console.error("Error adding event to calendar:", error);
      toast.error("Failed to add event to calendar");
      return false;
    }
  },
  
  /**
   * Export multiple tasks to a calendar
   * @param tasks - Array of tasks to export
   * @param provider - Calendar provider
   * @returns Promise indicating success or failure
   */
  async exportTasksToCalendar(tasks: Task[], provider: CalendarProvider): Promise<boolean> {
    try {
      console.log(`Exporting ${tasks.length} tasks to ${provider} calendar`);
      
      // Filter out tasks without due dates
      const tasksWithDueDates = tasks.filter(task => task.dueDate);
      
      if (tasksWithDueDates.length === 0) {
        toast.error("No tasks with due dates to export");
        return false;
      }
      
      // For generic provider, export all tasks as a single ICS file
      if (provider === CalendarProvider.GENERIC) {
        return await this.downloadMultipleICS(tasksWithDueDates);
      }
      
      // For other providers, add each task as a separate event
      const results = await Promise.all(
        tasksWithDueDates.map(task => this.taskToCalendarEvent(task))
          .filter((event): event is CalendarEvent => event !== null)
          .map(event => this.addEvent(event, provider))
      );
      
      // Consider successful if at least one task was exported
      return results.some(result => result === true);
    } catch (error) {
      console.error("Error exporting tasks to calendar:", error);
      toast.error("Failed to export tasks to calendar");
      return false;
    }
  },
  
  /**
   * Convert a task to a calendar event
   * @param task - Task to convert
   * @returns Calendar event or null if task has no due date
   */
  taskToCalendarEvent(task: Task): CalendarEvent | null {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    
    // Set end time to 1 hour after start for default duration
    const endTime = new Date(dueDate.getTime() + 60 * 60 * 1000);
    
    return {
      title: task.title,
      description: task.description,
      startTime: dueDate,
      endTime: endTime
    };
  },
  
  /**
   * Add an event to Google Calendar
   * In a real implementation, this would use the Google Calendar API
   */
  async addToGoogleCalendar(event: CalendarEvent): Promise<boolean> {
    // For demonstration, simulate API call with OAuth
    console.log("Adding to Google Calendar:", event);
    
    // Check if Google API is already loaded
    if (window.gapi && window.gapi.client && window.gapi.client.calendar) {
      try {
        // Use Google Calendar API (simplified example)
        await window.gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: {
            summary: event.title,
            description: event.description,
            start: {
              dateTime: event.startTime.toISOString()
            },
            end: {
              dateTime: event.endTime.toISOString()
            }
          }
        });
        
        toast.success("Added to Google Calendar");
        return true;
      } catch (error) {
        console.error("Google Calendar API error:", error);
        throw error;
      }
    } else {
      // If Google API not loaded, open Google Calendar in new tab
      const url = this.generateGoogleCalendarUrl(event);
      window.open(url, '_blank');
      
      toast.success("Google Calendar opened in new tab", {
        description: "Please complete the event creation"
      });
      return true;
    }
  },
  
  /**
   * Add an event to Outlook Calendar
   */
  async addToOutlookCalendar(event: CalendarEvent): Promise<boolean> {
    console.log("Adding to Outlook Calendar:", event);
    
    const url = this.generateOutlookCalendarUrl(event);
    window.open(url, '_blank');
    
    toast.success("Outlook Calendar opened in new tab", {
      description: "Please complete the event creation"
    });
    return true;
  },
  
  /**
   * Add an event to Apple Calendar
   */
  async addToAppleCalendar(event: CalendarEvent): Promise<boolean> {
    console.log("Adding to Apple Calendar:", event);
    
    // For Apple Calendar, we create and download an ICS file
    return this.downloadICS(event);
  },
  
  /**
   * Generate and download an ICS file for an event
   */
  async downloadICS(event: CalendarEvent): Promise<boolean> {
    console.log("Generating ICS file for event:", event);
    
    const icsContent = this.generateICS([event]);
    this.downloadFile(icsContent, `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
    
    toast.success("Calendar file downloaded", {
      description: "Import this file into your calendar application"
    });
    return true;
  },
  
  /**
   * Generate and download an ICS file for multiple events
   */
  async downloadMultipleICS(tasks: Task[]): Promise<boolean> {
    console.log("Generating ICS file for multiple tasks");
    
    const events = tasks
      .map(task => this.taskToCalendarEvent(task))
      .filter((event): event is CalendarEvent => event !== null);
    
    if (events.length === 0) return false;
    
    const icsContent = this.generateICS(events);
    this.downloadFile(icsContent, `tasks_export_${new Date().toISOString().slice(0, 10)}.ics`);
    
    toast.success(`Calendar file with ${events.length} events downloaded`, {
      description: "Import this file into your calendar application"
    });
    return true;
  },
  
  /**
   * Helper to generate Google Calendar URL
   */
  generateGoogleCalendarUrl(event: CalendarEvent): string {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const text = `&text=${encodeURIComponent(event.title)}`;
    const details = `&details=${encodeURIComponent(event.description)}`;
    const dates = `&dates=${this.formatDateForGoogle(event.startTime)}/${this.formatDateForGoogle(event.endTime)}`;
    const location = event.location ? `&location=${encodeURIComponent(event.location)}` : '';
    
    return `${base}${text}${details}${dates}${location}`;
  },
  
  /**
   * Helper to generate Outlook Calendar URL
   */
  generateOutlookCalendarUrl(event: CalendarEvent): string {
    const base = 'https://outlook.office.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent';
    const subject = `&subject=${encodeURIComponent(event.title)}`;
    const body = `&body=${encodeURIComponent(event.description)}`;
    const startdt = `&startdt=${event.startTime.toISOString()}`;
    const enddt = `&enddt=${event.endTime.toISOString()}`;
    const location = event.location ? `&location=${encodeURIComponent(event.location)}` : '';
    
    return `${base}${subject}${body}${startdt}${enddt}${location}`;
  },
  
  /**
   * Generate ICS file content for events
   */
  generateICS(events: CalendarEvent[]): string {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Task Genius//EN'
    ];
    
    events.forEach(event => {
      icsContent = icsContent.concat([
        'BEGIN:VEVENT',
        `UID:${this.generateUID()}`,
        `SUMMARY:${this.escapeIcsValue(event.title)}`,
        `DESCRIPTION:${this.escapeIcsValue(event.description)}`,
        `DTSTART:${this.formatDateForIcs(event.startTime)}`,
        `DTEND:${this.formatDateForIcs(event.endTime)}`,
        `DTSTAMP:${this.formatDateForIcs(new Date())}`,
        'END:VEVENT'
      ]);
    });
    
    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\r\n');
  },
  
  /**
   * Helper to format date for Google Calendar URL
   */
  formatDateForGoogle(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  },
  
  /**
   * Helper to format date for ICS file
   */
  formatDateForIcs(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  },
  
  /**
   * Helper to escape special characters in ICS values
   */
  escapeIcsValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  },
  
  /**
   * Generate a unique ID for ICS events
   */
  generateUID(): string {
    return `task-${Date.now()}-${Math.floor(Math.random() * 1000000)}@smarttaskgenius`;
  },
  
  /**
   * Helper to download a file
   */
  downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Add type declarations for global variables
declare global {
  interface Window {
    gapi?: {
      client?: {
        calendar?: {
          events: {
            insert: (params: any) => Promise<any>
          }
        }
      }
    }
  }
}
