
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiKey } from '@/hooks/useApiKey';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, SettingsIcon, KeyIcon, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { isConfigured, keyPreview } = useApiKey();
  const [activeTab, setActiveTab] = useState('api');
  const [tempApiKey, setTempApiKey] = useState('');

  const handleSaveApiKey = () => {
    // In a real app, you would update the environment variable or store in a secure way
    // Here we'll just show a toast to simulate the action
    toast.success("API key instructions", {
      description: "To update your API key, modify the VITE_API_KEY value in your .env file and restart the app."
    });
  };

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
            <SettingsIcon className="h-4 w-4 mr-2" />
            Appearance
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
                    <Badge variant={isConfigured ? "success" : "destructive"}>
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
            <CardContent>
              {/* Appearance settings would go here */}
              <p className="text-muted-foreground py-8 text-center">
                Appearance settings to be implemented
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
