
import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isAfter, subMonths } from 'date-fns';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { formatDuration } from '../utils/timeUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export const TaskStatistics = () => {
  const { tasks, categories } = useTaskContext();
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Priority distribution
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' }
  ];
  
  // Category distribution
  const categoryData = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category.id);
    return {
      name: category.name,
      completed: categoryTasks.filter(task => task.completed).length,
      pending: categoryTasks.filter(task => !task.completed).length,
      color: category.color,
    };
  });
  
  // Time tracking statistics
  const timeTrackingData = tasks
    .filter(task => task.timeTracking && task.timeTracking.logs && task.timeTracking.logs.length > 0)
    .map(task => ({
      name: task.title,
      estimated: task.timeTracking?.estimatedMinutes || 0,
      actual: task.timeTracking?.actualMinutes || 0,
    }))
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 5);
  
  // Weekly progress
  const now = new Date();
  const startWeek = startOfWeek(now);
  const endWeek = endOfWeek(now);
  
  const weeklyTasks = tasks.filter(t => 
    t.dueDate && isAfter(new Date(t.dueDate), startWeek) && isBefore(new Date(t.dueDate), endWeek)
  );
  const weeklyComplete = weeklyTasks.filter(t => t.completed).length;
  const weeklyCompletion = weeklyTasks.length > 0 ? Math.round((weeklyComplete / weeklyTasks.length) * 100) : 0;
  
  // Monthly progress
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);
  
  const monthlyTasks = tasks.filter(t => 
    t.dueDate && isAfter(new Date(t.dueDate), startMonth) && isBefore(new Date(t.dueDate), endMonth)
  );
  const monthlyComplete = monthlyTasks.filter(t => t.completed).length;
  const monthlyCompletion = monthlyTasks.length > 0 ? Math.round((monthlyComplete / monthlyTasks.length) * 100) : 0;
  
  // Time trends data
  const timeData = [
    { name: 'Weekly', completion: weeklyCompletion },
    { name: 'Monthly', completion: monthlyCompletion },
    { name: 'Overall', completion: completionRate }
  ];
  
  // Monthly trend (last 6 months)
  const monthlyTrendData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(now, 5 - i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthName = format(monthDate, 'MMM');
    
    const monthTasks = tasks.filter(t => 
      t.dueDate && isAfter(new Date(t.dueDate), monthStart) && isBefore(new Date(t.dueDate), monthEnd)
    );
    const completed = monthTasks.filter(t => t.completed).length;
    const total = monthTasks.length;
    
    return {
      name: monthName,
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });
  
  // Download reports as CSV
  const downloadCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle commas, quotes and convert objects to string
          const cellValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          return `"${cellValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Task Completion Overview</CardTitle>
            <CardDescription>Overall completion status of your tasks</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadCSV([
              { status: 'Completed', count: completedTasks, percentage: completionRate },
              { status: 'Pending', count: totalTasks - completedTasks, percentage: 100 - completionRate }
            ], 'task_completion')}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-full">
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold">{completionRate}%</div>
              <div className="text-muted-foreground">Overall completion rate</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: completedTasks, color: '#10b981' },
                    { name: 'Pending', value: totalTasks - completedTasks, color: '#6366f1' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Completed', value: completedTasks, color: '#10b981' },
                    { name: 'Pending', value: totalTasks - completedTasks, color: '#6366f1' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadCSV(priorityData, 'priority_distribution')}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tasks by Category</CardTitle>
            <CardDescription>Completed vs pending tasks per category</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadCSV(categoryData, 'tasks_by_category')}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" name="Completed" fill="#10b981" />
              <Bar dataKey="pending" stackId="a" name="Pending" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Completion Rates</CardTitle>
            <CardDescription>Weekly, monthly and overall performance</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadCSV(timeData, 'completion_rates')}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
              <Bar dataKey="completion" name="Completion Rate" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Task completion over the last 6 months</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadCSV(monthlyTrendData, 'monthly_trends')}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" unit="%" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="completed" name="Completed" fill="#10b981" />
              <Bar yAxisId="left" dataKey="total" name="Total" fill="#6366f1" />
              <Bar yAxisId="right" dataKey="rate" name="Completion Rate %" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {timeTrackingData.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>Estimated vs actual time spent (top 5 tasks)</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadCSV(timeTrackingData, 'time_tracking')}
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeTrackingData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [`${formatDuration(Number(value))}`, 'Time']}
                  labelFormatter={(value) => `Task: ${value}`}
                />
                <Legend />
                <Bar dataKey="estimated" name="Estimated Time" fill="#6366f1" />
                <Bar dataKey="actual" name="Actual Time" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
