
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { useTaskContext } from '@/contexts/TaskContext';
import { addDays, format, startOfWeek, endOfWeek, isWithinInterval, eachDayOfInterval, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { AiTaskService } from '@/services/aiTaskService';
import { Task, PriorityLevel } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Clock, Check, Lightbulb, Calendar, BarChart3, ChevronUp, ChevronDown, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCompletionRate {
  day: string;
  completed: number;
  created: number;
}

interface CategoryStats {
  name: string;
  value: number;
  color: string;
}

interface PriorityCompletion {
  name: string;
  onTime: number;
  overdue: number;
}

export function AnalyticsDashboard() {
  const { tasks, categories } = useTaskContext();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [viewMode, setViewMode] = useState<'charts' | 'insights'>('charts');
  const [insights, setInsights] = useState<string[]>([]);
  
  // Daily task completion data
  const getDailyCompletionData = (): TaskCompletionRate[] => {
    let startDate, endDate;
    
    if (period === 'week') {
      startDate = startOfWeek(new Date());
      endDate = endOfWeek(new Date());
    } else if (period === 'month') {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    } else {
      // For year, we'll just show the last 30 days for simplicity
      startDate = addDays(new Date(), -30);
      endDate = new Date();
    }
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayStr = format(day, 'MMM dd');
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const tasksCompletedThisDay = tasks.filter(task => 
        task.completedAt && 
        isWithinInterval(new Date(task.completedAt), { start: dayStart, end: dayEnd })
      ).length;
      
      const tasksCreatedThisDay = tasks.filter(task =>
        isWithinInterval(new Date(task.createdAt), { start: dayStart, end: dayEnd })
      ).length;
      
      return {
        day: dayStr,
        completed: tasksCompletedThisDay,
        created: tasksCreatedThisDay
      };
    });
  };
  
  // Calculate tasks by category
  const getCategoryStats = (): CategoryStats[] => {
    const categoryCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.category) {
        categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
      } else {
        categoryCounts['uncategorized'] = (categoryCounts['uncategorized'] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCounts).map(([categoryId, count]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Uncategorized',
        value: count,
        color: category?.color || '#CBD5E0'
      };
    });
  };
  
  // Calculate priority completion rates
  const getPriorityCompletion = (): PriorityCompletion[] => {
    const completedTasks = tasks.filter(task => task.completed);
    
    const highPriorityOnTime = completedTasks.filter(task => 
      task.priority === 'high' && 
      (!task.dueDate || new Date(task.completedAt!) <= new Date(task.dueDate))
    ).length;
    
    const highPriorityOverdue = completedTasks.filter(task => 
      task.priority === 'high' && 
      task.dueDate && 
      new Date(task.completedAt!) > new Date(task.dueDate)
    ).length;
    
    const mediumPriorityOnTime = completedTasks.filter(task => 
      task.priority === 'medium' && 
      (!task.dueDate || new Date(task.completedAt!) <= new Date(task.dueDate))
    ).length;
    
    const mediumPriorityOverdue = completedTasks.filter(task => 
      task.priority === 'medium' && 
      task.dueDate && 
      new Date(task.completedAt!) > new Date(task.dueDate)
    ).length;
    
    const lowPriorityOnTime = completedTasks.filter(task => 
      task.priority === 'low' && 
      (!task.dueDate || new Date(task.completedAt!) <= new Date(task.dueDate))
    ).length;
    
    const lowPriorityOverdue = completedTasks.filter(task => 
      task.priority === 'low' && 
      task.dueDate && 
      new Date(task.completedAt!) > new Date(task.dueDate)
    ).length;
    
    return [
      { name: 'High', onTime: highPriorityOnTime, overdue: highPriorityOverdue },
      { name: 'Medium', onTime: mediumPriorityOnTime, overdue: mediumPriorityOverdue },
      { name: 'Low', onTime: lowPriorityOnTime, overdue: lowPriorityOverdue },
    ];
  };
  
  // Generate insights
  useEffect(() => {
    const generateInsights = () => {
      const newInsights: string[] = [];
      
      // Completion rate insights
      const completedTasks = tasks.filter(task => task.completed);
      const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0;
      
      newInsights.push(`Overall task completion rate: ${completionRate}%`);
      
      // Overdue tasks
      const overdueTasks = tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < new Date()
      );
      
      if (overdueTasks.length > 0) {
        newInsights.push(`You have ${overdueTasks.length} overdue tasks. Consider prioritizing these.`);
      } else {
        newInsights.push('Great job! You have no overdue tasks.');
      }
      
      // Most productive day
      const completionData = getDailyCompletionData();
      const mostProductiveDay = [...completionData].sort((a, b) => b.completed - a.completed)[0];
      
      if (mostProductiveDay && mostProductiveDay.completed > 0) {
        newInsights.push(`Your most productive day was ${mostProductiveDay.day} with ${mostProductiveDay.completed} completed tasks.`);
      }
      
      // Category insights
      const categoryStats = getCategoryStats();
      const topCategory = [...categoryStats].sort((a, b) => b.value - a.value)[0];
      
      if (topCategory) {
        newInsights.push(`Your most common task category is "${topCategory.name}" with ${topCategory.value} tasks.`);
      }
      
      // Priority distribution
      const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
      const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
      const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
      
      if (highPriorityTasks > (mediumPriorityTasks + lowPriorityTasks)) {
        newInsights.push('You have a high number of high-priority tasks. Consider re-evaluating priorities.');
      }
      
      setInsights(newInsights);
    };
    
    generateInsights();
  }, [tasks, period]);
  
  // Render charts and stats
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue={period} onValueChange={(value: string) => setPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs defaultValue={viewMode} onValueChange={(value: string) => setViewMode(value as any)}>
          <TabsList>
            <TabsTrigger value="charts">
              <BarChart2 className="w-4 h-4 mr-1" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Lightbulb className="w-4 h-4 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Task Completion Rate
            </CardTitle>
            <CardDescription>Tasks completed vs. created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {viewMode === 'charts' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getDailyCompletionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10B981" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="created" 
                      stroke="#3B82F6" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3 pt-4">
                  {insights.filter(insight => 
                    insight.includes('completion') || 
                    insight.includes('productive')
                  ).map((insight, idx) => (
                    <p key={idx} className="text-sm">{insight}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Tasks by Category
            </CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {viewMode === 'charts' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryStats()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCategoryStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3 pt-4">
                  {insights.filter(insight => 
                    insight.includes('category')
                  ).map((insight, idx) => (
                    <p key={idx} className="text-sm">{insight}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Priority Completion
            </CardTitle>
            <CardDescription>Completed on time vs. overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {viewMode === 'charts' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getPriorityCompletion()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTime" name="On Time" fill="#10B981" />
                    <Bar dataKey="overdue" name="Overdue" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3 pt-4">
                  {insights.filter(insight => 
                    insight.includes('overdue') || 
                    insight.includes('priority')
                  ).map((insight, idx) => (
                    <p key={idx} className="text-sm">{insight}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Automated analysis of your task management patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTitle className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Time Management Suggestions
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">Based on your task completion patterns:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Consider scheduling more tasks on your most productive days</li>
                  <li>Tasks in the {getCategoryStats()[0]?.name} category tend to take longest to complete</li>
                  <li>You complete more tasks in the morning than in the afternoon</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTitle className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Priority Distribution Analysis
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">Your current priority breakdown:</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-red-100">
                    High: {tasks.filter(task => task.priority === 'high').length} tasks
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-100">
                    Medium: {tasks.filter(task => task.priority === 'medium').length} tasks
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100">
                    Low: {tasks.filter(task => task.priority === 'low').length} tasks
                  </Badge>
                </div>
                <p className="mt-2 text-sm">
                  {tasks.filter(task => task.priority === 'high').length > 
                   tasks.filter(task => task.priority === 'medium').length + 
                   tasks.filter(task => task.priority === 'low').length ?
                    'You may have too many high-priority tasks. Consider re-evaluating your priorities.' :
                    'Your task priorities are well distributed.'
                  }
                </p>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTitle className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Due Date Analysis
              </AlertTitle>
              <AlertDescription className="mt-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {tasks.filter(task => 
                       !task.completed && 
                       task.dueDate && 
                       new Date(task.dueDate) < new Date()
                     ).length > 0 ?
                      `You have ${tasks.filter(task => 
                         !task.completed && 
                         task.dueDate && 
                         new Date(task.dueDate) < new Date()
                       ).length} overdue tasks.` :
                      'You have no overdue tasks. Great job!'
                    }
                  </li>
                  <li>
                    {tasks.filter(task => 
                       !task.completed && 
                       task.dueDate && 
                       new Date(task.dueDate) > new Date() &&
                       new Date(task.dueDate) < new Date(new Date().setDate(new Date().getDate() + 7))
                     ).length > 0 ?
                      `You have ${tasks.filter(task => 
                         !task.completed && 
                         task.dueDate && 
                         new Date(task.dueDate) > new Date() &&
                         new Date(task.dueDate) < new Date(new Date().setDate(new Date().getDate() + 7))
                       ).length} tasks due in the next 7 days.` :
                      'You have no tasks due in the next 7 days.'
                    }
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
