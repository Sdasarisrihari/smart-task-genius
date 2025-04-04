
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { CalendarIntegration } from '@/components/CalendarIntegration';
import { ScrollArea } from '@/components/ui/scroll-area';

const Calendar = () => {
  const { tasks } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);

  // Update tasks for selected date when date or tasks change
  useEffect(() => {
    const filteredTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isSameDay(dueDate, selectedDate);
    });
    
    setTasksForSelectedDate(filteredTasks);
  }, [selectedDate, tasks]);

  // Task calendar date decorator
  const getDayClassNames = (date: Date) => {
    // Find tasks due on this day
    const tasksOnDay = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
    
    if (tasksOnDay.length === 0) return undefined;
    
    // Has high priority tasks?
    const hasHighPriority = tasksOnDay.some(task => task.priority === 'high');
    
    // Are all tasks completed?
    const allTasksCompleted = tasksOnDay.every(task => task.completed);
    
    if (hasHighPriority && !allTasksCompleted) {
      return 'border-red-400 border-2'; // High priority indicator
    } else if (allTasksCompleted) {
      return 'border-green-400 border-2'; // Completed tasks indicator
    } else {
      return 'border-blue-400 border-2'; // Normal tasks indicator
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };
  
  const handleExportToCalendar = () => {
    if (tasksForSelectedDate.length === 0) {
      toast.info('No tasks to export on this date');
      return;
    }
    
    // This would normally open the calendar export dialog
    toast('Exporting tasks to calendar...', {
      description: `${tasksForSelectedDate.length} tasks for ${format(selectedDate, 'PPP')}`
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">Visualize your tasks on a timeline</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>View and manage your schedule</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-3 flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md"
                  modifiersClassNames={{
                    selected: 'bg-primary text-primary-foreground',
                    today: 'bg-muted text-foreground'
                  }}
                  modifiers={{
                    taskDay: (date) => {
                      return tasks.some(task => {
                        if (!task.dueDate) return false;
                        return isSameDay(new Date(task.dueDate), date);
                      });
                    }
                  }}
                  styles={{
                    day: (date) => {
                      const className = getDayClassNames(date);
                      return className ? { borderRadius: '9999px', borderColor: className.split('-')[1] } : {};
                    }
                  }}
                  disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000)}
                />
              </div>
              
              <div className="px-6 pb-6 pt-2">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-blue-400 mr-1"></div>
                    <span>Tasks due</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-red-400 mr-1"></div>
                    <span>High priority</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-green-400 mr-1"></div>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>External Calendar</CardTitle>
              <CardDescription>
                Connect with your preferred calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-4" onClick={handleExportToCalendar}>
                <CalendarRange className="mr-2 h-4 w-4" />
                Export this day's tasks
              </Button>
              
              <p className="text-sm text-muted-foreground mb-2">
                Your default calendar:
              </p>
              
              <div className="bg-muted p-3 rounded-md text-center mb-3">
                <span className="font-medium">
                  {localStorage.getItem('preferredCalendar') || 'Google Calendar'}
                </span>
                <p className="text-xs text-muted-foreground">
                  Change in Settings → Integrations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </CardTitle>
                  <CardDescription>
                    {tasksForSelectedDate.length} tasks scheduled
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="day" className="h-full">
                <TabsList>
                  <TabsTrigger value="day" onClick={() => setView('day')}>Day</TabsTrigger>
                  <TabsTrigger value="week" onClick={() => setView('week')}>Week</TabsTrigger>
                  <TabsTrigger value="month" onClick={() => setView('month')}>Month</TabsTrigger>
                </TabsList>
                
                <TabsContent value="day" className="h-[400px]">
                  {tasksForSelectedDate.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">No tasks scheduled</h3>
                      <p className="text-muted-foreground mb-4">
                        There are no tasks scheduled for this date
                      </p>
                      <Button>Add a Task</Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-2 py-4">
                        {tasksForSelectedDate
                          .sort((a, b) => {
                            // Sort by priority (high → medium → low)
                            const priorityOrder = { high: 0, medium: 1, low: 2 };
                            return priorityOrder[a.priority as keyof typeof priorityOrder] - 
                                  priorityOrder[b.priority as keyof typeof priorityOrder];
                          })
                          .map(task => (
                            <div 
                              key={task.id}
                              className="flex items-start p-3 border rounded-md hover:bg-accent/50 transition-colors"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </h3>
                                  <Badge 
                                    variant={task.priority === 'high' ? 'destructive' : 
                                           task.priority === 'medium' ? 'default' : 'outline'}
                                    className="ml-2"
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                                
                                {task.description && (
                                  <p className={`text-sm mt-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
                
                <TabsContent value="week" className="h-[400px]">
                  <div className="h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-medium mb-2">Week View</h3>
                    <p className="text-muted-foreground text-center">
                      Week view is in development. This view will show a weekly schedule of tasks.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="month" className="h-[400px]">
                  <div className="h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-medium mb-2">Month View</h3>
                    <p className="text-muted-foreground text-center">
                      Month view is in development. This view will show a monthly overview of tasks.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <CalendarIntegration />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
