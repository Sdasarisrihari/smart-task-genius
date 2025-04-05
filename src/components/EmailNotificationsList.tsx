import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SentEmail {
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

export const EmailNotificationsList = () => {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => {
    try {
      const savedEmails = localStorage.getItem('sentEmails');
      return savedEmails ? JSON.parse(savedEmails) : [];
    } catch (error) {
      console.error('Error parsing stored emails:', error);
      return [];
    }
  });
  
  const [emailsEnabled, setEmailsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('emailNotifications') !== 'false';
  });
  
  // Keep localStorage in sync with state
  useEffect(() => {
    localStorage.setItem('emailNotifications', emailsEnabled.toString());
  }, [emailsEnabled]);
  
  const clearEmails = () => {
    localStorage.removeItem('sentEmails');
    setSentEmails([]);
    toast.success('Email history cleared');
  };
  
  const toggleEmailNotifications = () => {
    setEmailsEnabled(prevState => !prevState);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Email simulation for demonstration purposes</CardDescription>
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
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Demo Mode: No Real Emails Are Sent</p>
            <p className="text-muted-foreground mt-1">
              This application simulates sending emails. In a production environment, 
              you would integrate with an email service provider (like Gmail) to send actual emails to recipients.
            </p>
          </div>
        </div>
        
        {emailsEnabled ? (
          <div className="text-sm mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded">
            Email simulations are currently enabled
          </div>
        ) : (
          <div className="text-sm mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded">
            Email simulations are currently disabled
          </div>
        )}
        
        {sentEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No simulated emails have been sent yet
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
