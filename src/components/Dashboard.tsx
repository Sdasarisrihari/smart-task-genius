
import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Task } from '../types/task';
import { 
  BarChart, 
  PlusCircle, 
  ListFilter, 
  Clock, 
  CheckCircle2, 
  ArrowUpDown, 
  Brain, 
  SearchIcon, 
  MicIcon 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as ChartTooltip,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const { tasks, categories } = useTaskContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const openNewTaskForm = () => {
    setTaskToEdit(undefined);
    setIsFormOpen(true);
  };

  const openEditTaskForm = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleVoiceCommand = () => {
    toast("Voice recognition starting...", {
      description: "This feature would integrate with SpeechRecognition API in a full implementation.",
    });
  };

  const filterTasks = (tasks: Task[]) => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
        const matchesCategory = filterCategory === "all" || task.category === filterCategory;
        const matchesTab = (activeTab === "all") || 
                          (activeTab === "completed" && task.completed) ||
                          (activeTab === "incomplete" && !task.completed);
        
        return matchesSearch && matchesPriority && matchesCategory && matchesTab;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "ai":
            return (b.aiScore || 0) - (a.aiScore || 0);
          case "due":
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case "title":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  };

  const filteredTasks = filterTasks(tasks);
  
  // Calculate stats for the dashboard
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Prepare category data for the chart
  const categoryData = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category.id);
    const completed = categoryTasks.filter(task => task.completed).length;
    const total = categoryTasks.length;
    
    return {
      name: category.name,
      completed,
      remaining: total - completed,
      color: category.color,
    };
  });

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Smart Task Manager</h1>
        <p className="text-muted-foreground">AI-powered task prioritization and management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
              <Badge variant={completionRate > 70 ? "default" : "outline"}>
                {completionRate}%
              </Badge>
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks requiring immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ai-gradient rounded-md px-3 py-1 inline-flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              Optimize Your Day
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" name="Completed" fill="#10B981" />
                  <Bar dataKey="remaining" stackId="a" name="Remaining" fill="#6366F1" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="font-medium flex items-center text-purple-900 mb-1">
                  <Brain className="h-4 w-4 mr-1" /> Priority Analysis
                </div>
                <p className="text-sm text-purple-800">
                  You have {highPriorityTasks} high-priority tasks that need attention first.
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-medium flex items-center text-blue-900 mb-1">
                  <Clock className="h-4 w-4 mr-1" /> Scheduling Suggestion
                </div>
                <p className="text-sm text-blue-800">
                  Consider allocating morning hours to high-priority tasks for optimal productivity.
                </p>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => toast("Full AI analysis would open in a real implementation")}>
                View Detailed Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="w-full sm:w-auto flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleVoiceCommand}>
            <MicIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={openNewTaskForm}>
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1">
          <ListFilter className="h-4 w-4" />
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <ListFilter className="h-4 w-4" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <div 
                      className="h-2 w-2 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }} 
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <ArrowUpDown className="h-4 w-4" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai">AI Priority</SelectItem>
              <SelectItem value="due">Due Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEditTaskForm} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search or filters" 
                    : "Add some tasks to get started"}
                </p>
                <Button onClick={openNewTaskForm}>Add Your First Task</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <TaskForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        task={taskToEdit} 
      />
    </div>
  );
};
