
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Check, Download, Lightbulb, BarChart, Calendar, Clock } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from 'sonner';
import { AiTaskService } from '@/services/aiTaskService';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

const Analytics = () => {
  const { tasks, updateTask } = useTaskContext();
  const [tab, setTab] = useState<'insights' | 'productivity' | 'time'>('insights');
  
  const handleGenerateInsights = () => {
    // Analyze tasks and generate priority suggestions
    const suggestions = AiTaskService.analyzeTasks(tasks);
    
    if (suggestions.length > 0) {
      // Ask user if they want to apply the suggestions
      if (window.confirm(`AI suggests changing priorities for ${suggestions.length} tasks. Apply these changes?`)) {
        AiTaskService.applySuggestedPriorities(tasks, suggestions, updateTask);
      } else {
        toast.info(`${suggestions.length} priority suggestions generated`, {
          description: "You can review and apply them manually"
        });
      }
    } else {
      toast.info("No priority changes suggested", {
        description: "Your current task priorities look good!"
      });
    }
  };
  
  const handleExportAnalytics = () => {
    // In a real app, this would generate and download a PDF or CSV report
    toast.success("Analytics export started", {
      description: "Your report will download shortly"
    });
    
    // Simulate export delay
    setTimeout(() => {
      const data = JSON.stringify({
        tasks: {
          total: tasks.length,
          completed: tasks.filter(task => task.completed).length,
          overdue: tasks.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < new Date()).length
        },
        categories: tasks.reduce((acc, task) => {
          if (!acc[task.category]) acc[task.category] = 0;
          acc[task.category]++;
          return acc;
        }, {} as Record<string, number>),
        priorities: tasks.reduce((acc, task) => {
          if (!acc[task.priority]) acc[task.priority] = 0;
          acc[task.priority]++;
          return acc;
        }, {} as Record<string, number>),
        timestamps: new Date().toISOString()
      });
      
      // Create and download file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `task-analytics-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Analytics exported successfully");
    }, 1500);
  };
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            View metrics, trends, and AI-powered insights about your tasks
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={handleGenerateInsights}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Generate Insights
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={tab} onValueChange={(v) => setTab(v as any)} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="insights">
            <BarChart className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="productivity">
            <Check className="mr-2 h-4 w-4" />
            Productivity
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="mr-2 h-4 w-4" />
            Time Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="productivity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Rate</CardTitle>
                <CardDescription>Your task completion performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {/* This would be a chart in a real implementation */}
                  Productivity tracking metrics and charts
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>How your tasks are distributed by priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {/* This would be a chart in a real implementation */}
                  Priority distribution visualization
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="time">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Tracking Analysis</CardTitle>
                <CardDescription>Analysis of time spent on different categories of tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {/* This would be a chart in a real implementation */}
                  Time tracking analysis visualization
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Time-Consuming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-2xl font-bold text-blue-500">Work</div>
                  <p className="text-center text-muted-foreground mt-2">Category with highest time tracking</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Efficient</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-2xl font-bold text-green-500">Personal</div>
                  <p className="text-center text-muted-foreground mt-2">Best estimated vs actual time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Needs Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-2xl font-bold text-amber-500">Health</div>
                  <p className="text-center text-muted-foreground mt-2">Worst estimated vs actual time</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
