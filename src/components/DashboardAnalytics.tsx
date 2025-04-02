import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { apiService } from '@/services/apiService';
import { useQuery } from '@tanstack/react-query';
import { useApiKey } from '@/hooks/useApiKey';
import { Button } from '@/components/ui/button';
import { SelectGroup, SelectItem } from '@/components/ui/select';
import { COLORS, PRIORITY_COLORS } from '@/lib/utils';

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

export const DashboardAnalytics = () => {
  const { isConfigured, isValid } = useApiKey();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // Enhanced queries with proper error handling in meta object
  const { data: taskAnalytics, isLoading: isLoadingTaskAnalytics } = useQuery({
    queryKey: ['taskAnalytics', period],
    queryFn: () => apiService.getTaskAnalytics(period),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch task analytics:', error);
      }
    },
    enabled: isConfigured && isValid === true
  });

  const { data: productivityMetrics, isLoading: isLoadingProductivity } = useQuery({
    queryKey: ['productivityMetrics'],
    queryFn: () => apiService.getProductivityMetrics(),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch productivity metrics:', error);
      }
    },
    enabled: isConfigured && isValid === true
  });

  const { data: completionRates, isLoading: isLoadingCompletionRates } = useQuery({
    queryKey: ['completionRates'],
    queryFn: () => apiService.getCompletionRateByCategory(),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch completion rates:', error);
      }
    },
    enabled: isConfigured && isValid === true
  });

  // Generate local data for when API is not available
  const localData = generateLocalTaskData();
  
  // Data for charts (use API data or fallback to local)
  const chartData = {
    overview: taskAnalytics?.overview || localData.overview || [],
    priority: taskAnalytics?.priority || localData.priority || [],
    categories: completionRates || localData.categories || [],
    productivity: productivityMetrics?.timeSeriesData || [
      { date: '2023-01-01', completed: 3, created: 5 },
      { date: '2023-01-02', completed: 4, created: 2 },
      { date: '2023-01-03', completed: 7, created: 6 },
      { date: '2023-01-04', completed: 5, created: 4 },
      { date: '2023-01-05', completed: 6, created: 3 },
      { date: '2023-01-06', completed: 8, created: 5 },
      { date: '2023-01-07', completed: 9, created: 4 }
    ]
  };

  const isLoading = isLoadingTaskAnalytics || isLoadingProductivity || isLoadingCompletionRates;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Task Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
          <CardDescription>Distribution of tasks by status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.overview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Task Priority Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Task Priority</CardTitle>
          <CardDescription>Distribution of tasks by priority</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={false}
                  data={chartData.priority}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {chartData.priority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Completion Rate by Category Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate by Category</CardTitle>
          <CardDescription>Task completion rate across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={false}
                  data={chartData.categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {chartData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Productivity Metrics Chart */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Productivity Metrics</CardTitle>
            <SelectGroup>
              <SelectItem value="day" onClick={() => setPeriod('day')}>Day</SelectItem>
              <SelectItem value="week" onClick={() => setPeriod('week')}>Week</SelectItem>
              <SelectItem value="month" onClick={() => setPeriod('month')}>Month</SelectItem>
              <SelectItem value="year" onClick={() => setPeriod('year')}>Year</SelectItem>
            </SelectGroup>
          </div>
          <CardDescription>Tasks created vs. tasks completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.productivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed" />
                <Line type="monotone" dataKey="created" stroke="#8884d8" name="Created" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
