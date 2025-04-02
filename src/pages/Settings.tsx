
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiKey } from '@/hooks/useApiKey';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, SettingsIcon, KeyIcon, Save, CheckCircle2, BellRing, PaintBucket, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const { isConfigured, keyPreview, isValid } = useApiKey();
  const [activeTab, setActiveTab] = useState('api');
  const [tempApiKey, setTempApiKey] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') === 'true';
  });
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('emailNotifications') === 'true';
  });

  // Theme toggle handler
  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
    toast.success(`Theme changed to ${newDarkMode ? 'dark' : 'light'} mode`);
  };

  // Notification toggle handler
  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue.toString());
    toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
  };

  // Email notification toggle handler
  const handleEmailNotificationsToggle = () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    localStorage.setItem('emailNotifications', newValue.toString());
    toast.success(newValue ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  const handleSaveApiKey = () => {
    // In a real app, you would update the environment variable or store in a secure way
    // Here we'll just show a toast to simulate the action
    toast.success("API key instructions", {
      description: "To update your API key, modify the VITE_API_KEY value in your .env file and restart the app."
    });
  };

  useEffect(() => {
    // Apply theme on initial load
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">
            <KeyIcon className="h-4 w-4 mr-2" />
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <PaintBucket className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Configuration</CardTitle>
              <CardDescription>
                Manage your API key for external service access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-api-key">Current API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="current-api-key" 
                      value={keyPreview} 
                      readOnly 
                      className="font-mono" 
                    />
                    <Badge variant={isConfigured ? "outline" : "destructive"} className={isConfigured ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}>
                      {isConfigured ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    API keys should be stored in environment variables for security. 
                    In this demo, the key is stored in the <code>.env</code> file.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="new-api-key">Set New API Key (Demo Only)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="new-api-key" 
                      value={tempApiKey} 
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="font-mono"
                      placeholder="Enter new API key"
                    />
                    <Button onClick={handleSaveApiKey}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="text-xs text-muted-foreground">
                <p>
                  API keys are stored in environment variables for security. To update your API key, 
                  modify the <code>VITE_API_KEY</code> value in your <code>.env</code> file and restart the app.
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Enable Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for task deadlines and updates
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={handleEmailNotificationsToggle}
                  disabled={!notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
