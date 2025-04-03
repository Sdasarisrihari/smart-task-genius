
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { storeApiKey, clearApiKey, isApiKeyConfigured, getAuthHeaders } from '../config/api';
import { useApiKey } from '../hooks/useApiKey';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SecurityAlert } from '@/components/SecurityAlert';
import { Badge } from '@/components/ui/badge';
import { DataExportImport } from '@/components/DataExportImport';
import { ApiUsageMetrics } from '@/components/ApiUsageMetrics';
import { TaskTemplates } from '@/components/TaskTemplates';
import { CalendarIntegration } from '@/components/CalendarIntegration';
import { CalendarProvider } from '@/services/calendarService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const { isConfigured, isValidating, isValid, validateApiKey, keyPreview } = useApiKey();
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'system'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notificationsEnabled') !== 'false'
  );
  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem('emailNotifications') === 'true'
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    localStorage.getItem('twoFactorEnabled') === 'true'
  );
  const [preferredCalendar, setPreferredCalendar] = useState<CalendarProvider>(
    (localStorage.getItem('preferredCalendar') as CalendarProvider) || CalendarProvider.GOOGLE
  );
  const [googleCalendarIntegration, setGoogleCalendarIntegration] = useState(
    localStorage.getItem('googleCalendarIntegration') === 'true'
  );
  const [outlookCalendarIntegration, setOutlookCalendarIntegration] = useState(
    localStorage.getItem('outlookCalendarIntegration') === 'true'
  );
  const [activeTab, setActiveTab] = useState('general');

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    storeApiKey(apiKey.trim());
    setApiKey('');
    toast.success('API key stored successfully');
    validateApiKey();
  };

  const handleClearApiKey = () => {
    clearApiKey();
    toast.success('API key removed');
    setTimeout(() => validateApiKey(), 500);
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem('theme', value);
    
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
    
    toast.success('Theme updated');
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem('notificationsEnabled', checked ? 'true' : 'false');
    
    if (checked) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast.success('Notifications enabled');
        } else {
          toast.error('Permission to show notifications was denied');
          setNotificationsEnabled(false);
          localStorage.setItem('notificationsEnabled', 'false');
        }
      });
    } else {
      toast.info('Notifications disabled');
    }
  };

  const handleEmailNotificationsToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    localStorage.setItem('emailNotifications', checked ? 'true' : 'false');
    toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    localStorage.setItem('twoFactorEnabled', checked ? 'true' : 'false');
    toast.success(checked ? '2FA enabled' : '2FA disabled');
    
    if (checked) {
      toast.info('Two-factor authentication configured', {
        description: 'You will be asked to verify your identity on next login'
      });
    }
  };
  
  const handleCalendarPreferenceChange = (value: string) => {
    setPreferredCalendar(value as CalendarProvider);
    localStorage.setItem('preferredCalendar', value);
    toast.success('Default calendar updated');
  };
  
  const handleGoogleCalendarToggle = (checked: boolean) => {
    setGoogleCalendarIntegration(checked);
    localStorage.setItem('googleCalendarIntegration', checked ? 'true' : 'false');
    
    if (checked) {
      toast.success('Google Calendar integration enabled');
    } else {
      toast.info('Google Calendar integration disabled');
    }
  };
  
  const handleOutlookCalendarToggle = (checked: boolean) => {
    setOutlookCalendarIntegration(checked);
    localStorage.setItem('outlookCalendarIntegration', checked ? 'true' : 'false');
    
    if (checked) {
      toast.success('Outlook Calendar integration enabled');
    } else {
      toast.info('Outlook Calendar integration disabled');
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your app preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Tabs
                defaultValue={activeTab}
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex flex-col items-start h-auto w-full space-y-1">
                  <TabsTrigger
                    value="general"
                    className="justify-start w-full"
                  >
                    General
                  </TabsTrigger>
                  <TabsTrigger 
                    value="api"
                    className="justify-start w-full"
                  >
                    API Configuration
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="justify-start w-full"
                  >
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="integrations"
                    className="justify-start w-full"
                  >
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger
                    value="templates"
                    className="justify-start w-full"
                  >
                    Templates
                  </TabsTrigger>
                  <TabsTrigger
                    value="data"
                    className="justify-start w-full"
                  >
                    Data Management
                  </TabsTrigger>
                  <TabsTrigger
                    value="usage"
                    className="justify-start w-full"
                  >
                    Usage
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Secure your account</AlertTitle>
            <AlertDescription>
              Enable two-factor authentication for better security
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="space-y-6">
          <TabsContent value="general" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Appearance</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select onValueChange={handleThemeChange} value={theme}>
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Notifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive task reminders and alerts
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={handleNotificationsToggle}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive important updates via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={handleEmailNotificationsToggle}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure your API key for external services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityAlert />

                <div className="flex items-start space-x-4 mb-4">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="api-key">Current API Key</Label>
                    <div className="flex items-center">
                      <div className="text-sm font-mono bg-muted p-2 rounded w-full">
                        {keyPreview}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Status: {isConfigured ? (
                        isValid ? (
                          <Badge variant="default" className="ml-1">Valid</Badge>
                        ) : (
                          <Badge variant="destructive" className="ml-1">Invalid</Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="ml-1">Not configured</Badge>
                      )}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={validateApiKey} 
                    disabled={isValidating || !isConfigured}
                  >
                    Verify
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearApiKey}
                    disabled={!isConfigured}
                  >
                    Clear
                  </Button>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-api-key">New API Key</Label>
                    <Input
                      id="new-api-key"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={handleApiKeyChange}
                      type="password"
                    />
                  </div>
                  <Button onClick={handleSaveApiKey}>Save API Key</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security options for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="twoFactor">Enable 2FA</Label>
                        <p className="text-sm text-muted-foreground">
                          Require verification code when logging in
                        </p>
                      </div>
                      <Switch
                        id="twoFactor"
                        checked={twoFactorEnabled}
                        onCheckedChange={handleTwoFactorToggle}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Login Sessions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage active login sessions
                  </p>
                  <div className="border rounded-md">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Current Session</h4>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date().toLocaleString()}
                          </p>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                    </div>
                    {/* Mock other sessions */}
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">
                        No other active sessions
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Password</h3>
                  <Button variant="outline">Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect external services with your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Calendar Services</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredCalendar">Default Calendar</Label>
                      <Select 
                        onValueChange={handleCalendarPreferenceChange} 
                        value={preferredCalendar}
                      >
                        <SelectTrigger id="preferredCalendar">
                          <SelectValue placeholder="Select calendar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CalendarProvider.GOOGLE}>Google Calendar</SelectItem>
                          <SelectItem value={CalendarProvider.OUTLOOK}>Outlook Calendar</SelectItem>
                          <SelectItem value={CalendarProvider.APPLE}>Apple Calendar</SelectItem>
                          <SelectItem value={CalendarProvider.GENERIC}>iCal Format (Generic)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="googleCalendar">Google Calendar</Label>
                        <p className="text-sm text-muted-foreground">
                          Sync tasks with your Google Calendar
                        </p>
                      </div>
                      <Switch
                        id="googleCalendar"
                        checked={googleCalendarIntegration}
                        onCheckedChange={handleGoogleCalendarToggle}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="outlookCalendar">Microsoft Outlook</Label>
                        <p className="text-sm text-muted-foreground">
                          Sync tasks with your Outlook Calendar
                        </p>
                      </div>
                      <Switch
                        id="outlookCalendar"
                        checked={outlookCalendarIntegration}
                        onCheckedChange={handleOutlookCalendarToggle}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <CalendarIntegration />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="m-0">
            <TaskTemplates />
          </TabsContent>
          
          <TabsContent value="data" className="m-0">
            <DataExportImport />
          </TabsContent>
          
          <TabsContent value="usage" className="m-0">
            <ApiUsageMetrics />
          </TabsContent>
        </div>
      </div>
    </div>
  );
}
