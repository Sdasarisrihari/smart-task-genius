
import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { TaskStatistics } from '../components/TaskStatistics';
import { CategoryManager } from '../components/CategoryManager';
import { TaskTemplates } from '../components/TaskTemplates';
import { TaskImportExport } from '../components/TaskImportExport';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
  const { suggestTaskPriorities } = useTaskContext();
  
  const handleOptimizeTasks = () => {
    suggestTaskPriorities();
    toast.success("AI has suggested priority updates", {
      description: "Tasks have been reprioritized based on urgency and importance"
    });
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics & Management</h1>
          <p className="text-muted-foreground">View statistics, manage categories, and optimize your workflow</p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button onClick={handleOptimizeTasks} className="flex items-center gap-2">
            <Brain className="h-4 w-4" /> Optimize Tasks with AI
          </Button>
          <TaskImportExport />
        </div>
      </header>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="statistics">
          <TaskStatistics />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        
        <TabsContent value="templates">
          <TaskTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
