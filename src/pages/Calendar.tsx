import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task } from '../types/task';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { addDays, startOfWeek, format, getDay, isSameDay } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarProvider, CalendarService } from '../services/calendarService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Calendar = () => {
  const { tasks, updateTask } = useTaskContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [exportFormat, setExportFormat] = useState<CalendarProvider>(CalendarProvider.GOOGLE);
  const [isExporting, setIsExporting] = useState(false);

  const upcomingTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) >= new Date() && !task.completed
  ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  
  const completedTasks = tasks.filter(task => task.completed)
    .sort((a, b) => {
      // Sort completed tasks by completion date (if available) or due date
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 
        (a.dueDate ? new Date(a.dueDate).getTime() : 0);
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 
        (b.dueDate ? new Date(b.dueDate).getTime() : 0);
      return dateB - dateA; // Most recent first
    })
    .slice(0, 10); // Only show the 10 most recently completed tasks

  const exportCalendar = async () => {
    try {
      setIsExporting(true);
      // Filter tasks that have due dates
      const tasksWithDueDates = tasks.filter(task => task.dueDate);
      
      if (tasksWithDueDates.length === 0) {
        toast.error("No tasks with due dates to export", {
          description: "Add due dates to your tasks first"
        });
        return;
      }
      
      const result = await CalendarService.exportTasksToCalendar(tasksWithDueDates, exportFormat);
      
      if (result) {
        toast.success("Calendar exported successfully", {
          description: `Exported ${tasksWithDueDates.length} tasks to ${exportFormat}`
        });
      } else {
        toast.error("Failed to export calendar");
      }
    } catch (error) {
      console.error("Error exporting calendar:", error);
      toast.error("Failed to export calendar");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateClick = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
  };

  // Function to generate the 5-day view starting from the current week
  const generateWeekView = () => {
    const startDate = startOfWeek(new Date());
    const days = [];
    
    for (let i = 0; i < 5; i++) {
      const currentDate = addDays(startDate, i);
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        return isSameDay(new Date(task.dueDate), currentDate);
      });
      
      days.push({
        date: currentDate,
        dayOfWeek: format(currentDate, 'EEE'),
        dayOfMonth: format(currentDate, 'd'),
        tasks: dayTasks
      });
    }
    
    return days;
  };

  const weekView = generateWeekView();

  // Function to get classnames for calendar dates
  const getDayClassNames = (date: Date) => {
    if (!date) return null;
    
    // Get tasks for the day
    const dateString = format(date, 'yyyy-MM-dd');
    const todayTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateString;
    });
    
    // Return appropriate color based on priorities
    if (todayTasks.length === 0) return null;
    
    // Check if there are any high priority tasks
    if (todayTasks.some(t => t.priority === 'high')) {
      return 'border-red-500';
    }
    
    // Check if there are any medium priority tasks
    if (todayTasks.some(t => t.priority === 'medium')) {
      return 'border-yellow-500';
    }
    
    // Default for low priority or unspecified
    return 'border-green-500';
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">Manage your tasks by date</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          {/* Week View */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Your upcoming tasks for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {weekView.map((day, index) => (
                  <div key={index} className="border rounded-md p-2">
                    <div className="text-center mb-2">
                      <div className="text-sm font-medium">{day.dayOfWeek}</div>
                      <div className="text-2xl">{day.dayOfMonth}</div>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {day.tasks.length > 0 ? (
                        day.tasks.map(task => (
                          <div 
                            key={task.id} 
                            className={`p-1 text-xs rounded truncate ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            }`}
                          >
                            {task.title}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-center text-muted-foreground py-2">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view or add tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateClick}
                className="rounded-md border"
                modifiers={{
                  booked: (date) => {
                    return tasks.some(task => 
                      task.dueDate && isSameDay(new Date(task.dueDate), date)
                    );
                  }
                }}
                modifiersStyles={{
                  booked: { border: '2px solid currentColor' }
                }}
                styles={{
                  day: (date) => {
                    const className = getDayClassNames(date);
                    return className ? { border: `2px solid var(--${className.split('-')[1]})` } : {};
                  }
                }}
                disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000)}
              />
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Export Calendar</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={exportFormat} 
                    onValueChange={(value) => setExportFormat(value as CalendarProvider)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CalendarProvider.GOOGLE}>Google Calendar</SelectItem>
                      <SelectItem value={CalendarProvider.OUTLOOK}>Outlook Calendar</SelectItem>
                      <SelectItem value={CalendarProvider.APPLE}>Apple Calendar</SelectItem>
                      <SelectItem value={CalendarProvider.GENERIC}>iCal Format</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={exportCalendar} 
                    disabled={isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Task Lists */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <Tabs defaultValue="upcoming" value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
                <div className="flex items-center justify-between">
                  <CardTitle>Tasks</CardTitle>
                  <TabsList>
                    <TabsTrigger value="upcoming" className="text-xs">
                      Upcoming
                      {upcomingTasks.length > 0 && (
                        <Badge className="ml-1" variant="secondary">{upcomingTasks.length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="overdue" className="text-xs">
                      Overdue
                      {overdueTasks.length > 0 && (
                        <Badge className="ml-1" variant="destructive">{overdueTasks.length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs">
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="upcoming" className="pt-4">
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingTasks.map(task => (
                        <div key={task.id} className="flex items-start p-2 border rounded-md">
                          <div className="flex-1">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Due: {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div>
                            <Badge variant={
                              task.priority === 'high' ? 'destructive' : 
                              task.priority === 'medium' ? 'default' : 'outline'
                            }>
                              {task.priority || 'low'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No upcoming tasks
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="overdue" className="pt-4">
                  {overdueTasks.length > 0 ? (
                    <div className="space-y-4">
                      {overdueTasks.map(task => (
                        <div key={task.id} className="flex items-start p-2 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/10">
                          <div className="flex-1">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Due: {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const now = new Date();
                              updateTask({ 
                                ...task, 
                                completed: true, 
                                completedAt: now.toISOString() 
                              });
                            }}
                          >
                            Complete
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No overdue tasks
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="pt-4">
                  {completedTasks.length > 0 ? (
                    <div className="space-y-4">
                      {completedTasks.map(task => (
                        <div key={task.id} className="flex items-start p-2 border border-green-200 rounded-md bg-green-50 dark:bg-green-900/10">
                          <div className="flex-1">
                            <div className="font-medium line-through opacity-70">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Completed: {task.completedAt ? format(new Date(task.completedAt), 'MMM d, yyyy') : 'Unknown'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No completed tasks
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
          
          {/* Tasks for Selected Date */}
          {date && (
            <Card>
              <CardHeader>
                <CardTitle>{format(date, 'MMMM d, yyyy')}</CardTitle>
                <CardDescription>Tasks scheduled for this date</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.filter(task => {
                  if (!task.dueDate) return false;
                  return isSameDay(new Date(task.dueDate), date);
                }).length > 0 ? (
                  <div className="space-y-4">
                    {tasks
                      .filter(task => task.dueDate && isSameDay(new Date(task.dueDate), date))
                      .map(task => (
                        <div key={task.id} className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => updateTask({ ...task, completed: !task.completed })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                            {task.title}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No tasks scheduled for this date
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => {
                  // A real implementation would open a form or dialog
                  // This is just for demonstration
                  toast.info("Task creation", {
                    description: `To create a task for ${format(date, 'MMM d, yyyy')}, please use the Tasks page`
                  });
                }}>
                  Add Task for This Date
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
