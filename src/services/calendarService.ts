
/**
 * Calendar integration service
 * Provides integration with external calendar services
 */

import { toast } from 'sonner';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay?: boolean;
}

export enum CalendarProvider {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  APPLE = 'apple',
  GENERIC = 'ical'
}

export const CalendarService = {
  /**
   * Add an event to the user's calendar
   * @param event The event to add
   * @param provider The calendar provider to use
   */
  async addEvent(event: CalendarEvent, provider: CalendarProvider): Promise<boolean> {
    try {
      switch (provider) {
        case CalendarProvider.GOOGLE:
          return await this.addToGoogleCalendar(event);
        case CalendarProvider.OUTLOOK:
          return await this.addToOutlookCalendar(event);
        case CalendarProvider.APPLE:
          return await this.addToAppleCalendar(event);
        case CalendarProvider.GENERIC:
        default:
          return await this.generateICalFile(event);
      }
    } catch (error) {
      console.error('Error adding calendar event:', error);
      toast.error('Failed to add event to calendar');
      return false;
    }
  },
  
  /**
   * Add event to Google Calendar
   * In a real implementation, this would use Google Calendar API
   */
  async addToGoogleCalendar(event: CalendarEvent): Promise<boolean> {
    console.log('Adding event to Google Calendar:', event);
    
    // Check if Google Calendar integration is configured
    const googleCalendarIntegrationEnabled = localStorage.getItem('googleCalendarIntegration') === 'true';
    if (!googleCalendarIntegrationEnabled) {
      // Generate OAuth URL for Google Calendar (in a real implementation)
      const oauthUrl = 'https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=https://www.googleapis.com/auth/calendar&response_type=code';
      
      // Open authentication window for Google Calendar
      window.open(oauthUrl, '_blank', 'width=600,height=700');
      
      toast.info('Google Calendar integration required', {
        description: 'Please authenticate with Google to enable calendar integration'
      });
      
      return false;
    }
    
    // In a real implementation, this would make an API call
    // For demo purposes, just show a success message
    toast.success('Event added to Google Calendar');
    return true;
  },
  
  /**
   * Add event to Outlook Calendar
   * In a real implementation, this would use Microsoft Graph API
   */
  async addToOutlookCalendar(event: CalendarEvent): Promise<boolean> {
    console.log('Adding event to Outlook Calendar:', event);
    
    // Check if Outlook Calendar integration is configured
    const outlookCalendarIntegrationEnabled = localStorage.getItem('outlookCalendarIntegration') === 'true';
    if (!outlookCalendarIntegrationEnabled) {
      toast.info('Outlook Calendar integration required', {
        description: 'Please authenticate with Microsoft to enable calendar integration'
      });
      return false;
    }
    
    // In a real implementation, this would make an API call
    // For demo purposes, just show a success message
    toast.success('Event added to Outlook Calendar');
    return true;
  },
  
  /**
   * Add event to Apple Calendar
   * For Apple Calendar, we'll generate an iCal file that can be imported
   */
  async addToAppleCalendar(event: CalendarEvent): Promise<boolean> {
    return this.generateICalFile(event);
  },
  
  /**
   * Generate an iCal file for the event
   * This creates a downloadable .ics file that can be imported into any calendar
   */
  async generateICalFile(event: CalendarEvent): Promise<boolean> {
    try {
      // Format dates for iCal format (YYYYMMDDTHHMMSSZ)
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
      };
      
      // Create the iCalendar content
      const icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Smart Task Genius//Calendar//EN',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@smarttaskgenius`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(event.startTime)}`,
        `DTEND:${formatDate(event.endTime)}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : '',
        event.location ? `LOCATION:${event.location}` : '',
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(Boolean).join('\r\n');
      
      // Create a blob from the iCal content
      const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
      
      // Create a link to download the file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);
      
      toast.success('Calendar file created', {
        description: 'The event file (.ics) has been downloaded'
      });
      
      return true;
    } catch (error) {
      console.error('Error generating iCal file:', error);
      toast.error('Failed to create calendar file');
      return false;
    }
  },
  
  /**
   * Create calendar events from tasks
   * @param tasks Array of tasks to convert to calendar events
   * @param provider Calendar provider to use
   */
  async exportTasksToCalendar(tasks: any[], provider: CalendarProvider): Promise<boolean> {
    if (!tasks || tasks.length === 0) {
      toast.error('No tasks selected for calendar export');
      return false;
    }
    
    try {
      // Process each task
      let allSuccessful = true;
      
      for (const task of tasks) {
        if (!task.dueDate) continue;
        
        // Create calendar event from task
        const dueDate = new Date(task.dueDate);
        const event: CalendarEvent = {
          title: task.title,
          description: task.description || '',
          startTime: dueDate,
          // Default event duration: 1 hour
          endTime: new Date(dueDate.getTime() + 60 * 60 * 1000),
        };
        
        const success = await this.addEvent(event, provider);
        if (!success) {
          allSuccessful = false;
        }
      }
      
      if (allSuccessful) {
        toast.success(`Tasks exported to calendar`);
      } else {
        toast.warning('Some tasks could not be exported to calendar');
      }
      
      return allSuccessful;
    } catch (error) {
      console.error('Error exporting tasks to calendar:', error);
      toast.error('Failed to export tasks to calendar');
      return false;
    }
  }
};
