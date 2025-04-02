import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiService } from '@/services/apiService';
import { useTaskContext } from '@/contexts/TaskContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

export const DashboardAnalytics = () => {
  const { tasks, categories } = useTaskContext();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data from API
  const { data: taskAnalytics, isLoading: isLoadingTaskAnalytics } = useQuery({
    queryKey: ['taskAnalytics'],
    queryFn: () => apiService.getTaskAnalytics(),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch task analytics:', error);
        // Fall back to local data if API fails
      }
    }
  });

  const { data: productivityMetrics, isLoading: isLoadingProductivity } = useQuery({
    queryKey: ['productivityMetrics'],
    queryFn: () => apiService.getProductivityMetrics(),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch productivity metrics:', error);
        // Fall back to local data if API fails
      }
    }
  });

  const { data: completionRates, isLoading: isLoadingCompletionRates } = useQuery({
    queryKey: ['completionRates'],
    queryFn: () => apiService.getCompletionRateByCategory(),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch completion rates:', error);
        // Fall back to local data if API fails
      }
    }
  });

  // Generate local fallback data if API fails
  const generateLocalTaskData = () => {
    // Completed vs. pending tasks
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    // Tasks by priority
    const highPriority = tasks.filter(task => task.priority === 'high').length;
    const mediumPriority = tasks.filter(task => task.priority === 'medium').length;
    const lowPriority = tasks.filter(task => task.priority === 'low').length;

    // Tasks by category
    const tasksByCategory = categories.map(category => {
      const categoryTasks = tasks.filter(task => task.category === category.id);
      const completedInCategory = categoryTasks.filter(task => task.completed).length;
      
      return {
        name: category.name,
        color: category.color,
        total: categoryTasks.length,
        completed: completedInCategory,
        completion: categoryTasks.length > 0 
          ? Math.round((completedInCategory / categoryTasks.length) * 100) 
          : 0
      };
    });

    return {
      overview: [
        { name: 'Completed', value: completed },
        { name: 'Pending', value: pending }
      ],
      priority: [
        { name: 'High', value: highPriority },
        { name: 'Medium', value: mediumPriority },
        { name: 'Low', value: lowPriority }
      ],
      categories: tasksByCategory
    };
  };

  // Data for charts (use API data or fallback to local)
  const localData = generateLocalTaskData();
  const chartData = {
    overview: taskAnalytics ? (taskAnalytics as any)?.overview || localData.overview : localData.overview,
    priority: taskAnalytics ? (taskAnalytics as any)?.priority || localData.priority : localData.priority,
    categories: completionRates || localData.categories,
    productivity: productivityMetrics ? (productivityMetrics as any)?.timeSeriesData || [
      { date: '2023-01-01', completed: 3, created: 5 },
      { date: '2023-01-02', completed: 4, created: 2 },
      { date: '2023-01-03', completed: 7, created: 6 },
      { date: '2023-01-04', completed: 5, created: 4 },
      { date: '2023-01-05', completed: 6, created: 3 },
      { date: '2023-01-06', completed: 8, created: 5 },
      { date: '2023-01-07', completed: 9, created: 4 }
    ] : [
      { date: '2023-01-01', completed: 3, created: 5 },
      { date: '2023-01-02', completed: 4, created: 2 },
      { date: '2023-01-03', completed: 7, created: 6 },
      { date: '2023-01-04', completed: 5, created: 4 },
      { date: '2023-01-05', completed: 6, created: 3 },
      { date: '2023-01-06', completed: 8, created: 5 },
      { date: '2023-01-07', completed: 9, created: 4 }
    ]
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Task Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>Completed vs pending tasks</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoadingTaskAnalytics ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.overview}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.overview.map((entry, index) => (
                          <Sector
                            key={`cell-${index}`}
                            fill={index === 0 ? '#10B981' : '#F59E0B'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
                <CardDescription>Distribution across priority levels</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoadingTaskAnalytics ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.priority}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Trends</CardTitle>
              <CardDescription>Tasks created vs completed over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoadingProductivity ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.productivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate by Category</CardTitle>
              <CardDescription>Task completion percentage per category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoadingCompletionRates ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completion" name="Completion %" fill="#3B82F6" />
                    <Bar dataKey="total" name="Total Tasks" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
