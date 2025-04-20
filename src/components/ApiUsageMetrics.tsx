
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, RefreshCcw, BarChart, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { COLORS, PRIORITY_COLORS } from '@/lib/utils';

// Define types for the analytics data
interface TaskAnalytics {
  overview: { name: string; value: number }[];
  priority: { name: string; value: number; color: string }[];
}

interface ProductivityMetrics {
  timeSeriesData: { date: string; completed: number; created: number }[];
}

// Function to generate local task data
const generateLocalTaskData = () => {
  const overview = [
    { name: 'Created', value: 200 },
    { name: 'In Progress', value: 300 },
    { name: 'Completed', value: 500 },
  ];

  const priority = [
    { name: 'High', value: 400, color: PRIORITY_COLORS.high },
    { name: 'Medium', value: 300, color: PRIORITY_COLORS.medium },
    { name: 'Low', value: 200, color: PRIORITY_COLORS.low },
  ];

  const categories = [
    { name: 'Work', value: 400, color: COLORS[0] },
    { name: 'Personal', value: 300, color: COLORS[1] },
    { name: 'Shopping', value: 200, color: COLORS[2] },
  ];

  return { overview, priority, categories };
};

export const ApiUsageMetrics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    data: usageData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['api-usage-metrics'],
    queryFn: () => {
      // Mock API call - this would normally call apiService.getApiUsageMetrics()
      return Promise.resolve({
        overview: {
          requestsToday: 42,
          requestsThisMonth: 358,
          monthlyLimit: 1000,
          remainingCredits: 642
        },
        timeSeriesData: [
          { day: 'Mon', requests: 45 },
          { day: 'Tue', requests: 52 },
          { day: 'Wed', requests: 38 },
          { day: 'Thu', requests: 71 },
          { day: 'Fri', requests: 29 },
          { day: 'Sat', requests: 18 },
          { day: 'Sun', requests: 42 }
        ],
        endpointData: [
          { name: '/tasks', calls: 145 },
          { name: '/users', calls: 87 },
          { name: '/analytics', calls: 63 },
          { name: '/auth', calls: 29 },
          { name: '/files', calls: 34 }
        ]
      });
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const handleRefresh = () => {
    toast.info('Refreshing API usage data');
    refetch();
  };

  // Calculate usage percentage
  const usagePercentage = usageData?.overview 
    ? Math.round((usageData.overview.requestsThisMonth / usageData.overview.monthlyLimit) * 100) 
    : 0;

  // Determine usage status
  const getUsageStatus = () => {
    if (!usageData?.overview) return 'normal';
    
    const percentage = (usageData.overview.requestsThisMonth / usageData.overview.monthlyLimit) * 100;
    if (percentage > 90) return 'critical';
    if (percentage > 75) return 'warning';
    return 'normal';
  };
  
  const usageStatus = getUsageStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">API Usage Metrics</CardTitle>
            <CardDescription>Monitor your API usage and limits</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full border-2 border-primary/30 border-t-primary h-8 w-8 mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading API usage data...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm text-destructive">Failed to load API usage data</p>
          </div>
        ) : (
          <>
            <div className={`rounded-lg p-4 mb-4 ${
              usageStatus === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
              usageStatus === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
              'bg-green-50 dark:bg-green-900/20'
            }`}>
              <div className="mb-1 flex justify-between items-center">
                <h3 className={`text-sm font-medium ${
                  usageStatus === 'critical' ? 'text-red-700 dark:text-red-400' :
                  usageStatus === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                  'text-green-700 dark:text-green-400'
                }`}>
                  Monthly API Usage
                </h3>
                <span className={`text-xs font-medium ${
                  usageStatus === 'critical' ? 'text-red-700 dark:text-red-400' :
                  usageStatus === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                  'text-green-700 dark:text-green-400'
                }`}>
                  {usagePercentage}%
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className={`h-2 ${
                  usageStatus === 'critical' ? 'bg-red-200 dark:bg-red-900/50' :
                  usageStatus === 'warning' ? 'bg-amber-200 dark:bg-amber-900/50' :
                  'bg-green-200 dark:bg-green-900/50'
                }`}
              />
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {usageData?.overview?.requestsThisMonth} / {usageData?.overview?.monthlyLimit} requests
                </span>
                <span className="text-muted-foreground">
                  {usageData?.overview?.remainingCredits} remaining
                </span>
              </div>
            </div>
            
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 border rounded-lg text-center">
                    <Activity className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{usageData?.overview?.requestsToday}</div>
                    <div className="text-xs text-muted-foreground">Requests today</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{usageData?.overview?.requestsThisMonth}</div>
                    <div className="text-xs text-muted-foreground">Requests this month</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1">Usage tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Implement client-side caching to reduce API calls</li>
                    <li>Group operations when possible to use batch APIs</li>
                    <li>Monitor your usage regularly to avoid hitting limits</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="pt-2">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={usageData?.timeSeriesData || []}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ fill: '#7c3aed', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  API requests over the last 7 days
                </div>
              </TabsContent>
              
              <TabsContent value="endpoints" className="pt-2">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart
                      data={usageData?.endpointData || []}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calls" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  API calls by endpoint
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
};
