
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SentEmail {
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

export const EmailNotificationsList = () => {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => {
    return JSON.parse(localStorage.getItem('sentEmails') || '[]');
  });
  
  const clearEmails = () => {
    localStorage.removeItem('sentEmails');
    setSentEmails([]);
  };
  
  const toggleEmailNotifications = () => {
    const currentSetting = localStorage.getItem('emailNotifications') !== 'false';
    localStorage.setItem('emailNotifications', (!currentSetting).toString());
    // Force refresh to update UI
    setSentEmails([...sentEmails]);
  };
  
  const emailsEnabled = localStorage.getItem('emailNotifications') !== 'false';
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>View sent email notifications (demo mode)</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={emailsEnabled ? "default" : "outline"}
              onClick={toggleEmailNotifications}
            >
              {emailsEnabled ? "Disable Emails" : "Enable Emails"}
            </Button>
            {sentEmails.length > 0 && (
              <Button variant="outline" onClick={clearEmails}>Clear History</Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {emailsEnabled ? (
          <div className="text-sm mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded">
            Email notifications are currently enabled (demo mode)
          </div>
        ) : (
          <div className="text-sm mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded">
            Email notifications are currently disabled
          </div>
        )}
        
        {sentEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No emails have been sent yet
          </div>
        ) : (
          <div className="space-y-4">
            {sentEmails.map((email, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div className="font-medium">{email.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(email.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">To: {email.to}</div>
                <div className="mt-2 border-t pt-2">
                  <div className="text-sm overflow-hidden max-h-24" dangerouslySetInnerHTML={{ __html: email.body }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
