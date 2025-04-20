import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task } from '../types/task';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isSameDay, isAfter, isBefore, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarProvider, CalendarService } from '../services/calendarService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DayContentProps } from 'react-day-picker';

const Calendar = () => {
  const { tasks, updateTask } = useTaskContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [exportFormat, setExportFormat] = useState<CalendarProvider>(CalendarProvider.GOOGLE);
  const [exportInProgress, setExportInProgress] = useState(false);
  
  // Get tasks for the selected date
  const tasksForSelectedDate = date 
    ? tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), date))
    : [];
    
  // Get upcoming tasks (due today or in the future, not completed)
  const upcomingTasks = tasks.filter(task => 
    task.dueDate && 
    !task.completed && 
    (isToday(new Date(task.dueDate)) || isAfter(new Date(task.dueDate), new Date()))
  );
  
  // Get overdue tasks (due in the past, not completed)
  const overdueTasks = tasks.filter(task => 
    task.dueDate && 
    !task.completed && 
    isBefore(new Date(task.dueDate), new Date()) && 
    !isToday(new Date(task.dueDate))
  );
  
  // Get completed tasks
  const completedTasks = tasks.filter(task => task.completed);
  
  // Get the display tasks based on the selected tab
  const getDisplayTasks = () => {
    switch (selectedTab) {
      case 'upcoming':
        return upcomingTasks;
      case 'overdue':
        return overdueTasks;
      case 'completed':
        return completedTasks;
      default:
        return upcomingTasks;
    }
  };
    
  // Calendar dates with tasks
  const datesWithTasks = tasks
    .filter(task => task.dueDate)
    .map(task => new Date(task.dueDate!));
  
  // Export calendar
  const handleExportCalendar = async () => {
    try {
      setExportInProgress(true);
      
      const tasksWithDueDates = tasks.filter(task => task.dueDate);
      
      if (tasksWithDueDates.length === 0) {
        toast.error("Nothing to export", {
          description: "No tasks with due dates found"
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
      setExportInProgress(false);
    }
  };

  // Track recurring patterns in the calendar
  const recurringTasks = tasks.filter(task => task.recurrence);
  
  // Render recurring indicators on the calendar
  const recurrenceCssClasses = (date: Date) => {
    for (const task of recurringTasks) {
      if (task.dueDate && isSameDay(new Date(task.dueDate), date)) {
        return 'bg-orange-100 dark:bg-orange-900/40';
      }
    }
    return '';
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Task Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Calendar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Date View</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiersClassNames={{
                selected: 'bg-primary text-primary-foreground',
              }}
              modifiersStyles={{
                selected: { backgroundColor: 'var(--primary)' },
                today: { border: '1px solid var(--primary)' },
              }}
              disabled={{ before: new Date(2000, 0, 1) }}
              defaultMonth={date}
              classNames={{
                day_disabled: 'text-gray-300 dark:text-gray-600',
              }}
              components={{
                DayContent: ({ date }: DayContentProps) => (
                  <div className={cn(
                    'relative flex h-8 w-8 items-center justify-center',
                    datesWithTasks.some(taskDate => isSameDay(taskDate, date)) 
                      ? 'bg-blue-100 dark:bg-blue-900/40 rounded-full'
                      : '',
                    recurrenceCssClasses(date)
                  )}>
                    <span>{format(date, "d")}</span>
                    {datesWithTasks.some(taskDate => isSameDay(taskDate, date)) && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                    )}
                  </div>
                )
              }}
            />

            <div className="mt-6">
              <Label>Export Calendar</Label>
              <Select
                value={exportFormat}
                onValueChange={(value: string) => setExportFormat(value as CalendarProvider)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CalendarProvider.GOOGLE}>Google Calendar</SelectItem>
                  <SelectItem value={CalendarProvider.OUTLOOK}>Outlook</SelectItem>
                  <SelectItem value={CalendarProvider.APPLE}>Apple Calendar</SelectItem>
                  <SelectItem value={CalendarProvider.GENERIC}>iCal File (.ics)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="w-full mt-2" 
                onClick={handleExportCalendar} 
                disabled={exportInProgress}
              >
                {exportInProgress ? 'Exporting...' : 'Export Tasks to Calendar'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks Lists */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>
                {date ? format(date, "MMMM d, yyyy") : "No Date Selected"}
              </span>
              <div>
                {tasksForSelectedDate.length > 0 && (
                  <Badge variant="outline" className="ml-2 font-normal">
                    {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {tasksForSelectedDate.length > 0 ? (
                tasksForSelectedDate.map((task) => (
                  <div 
                    key={task.id}
                    className={cn(
                      "border rounded-md p-3 transition-all hover:border-primary",
                      task.completed && "opacity-60"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={cn(
                            "font-medium",
                            task.completed && "line-through"
                          )}>
                            {task.title}
                          </h3>
                          {task.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">High</Badge>
                          )}
                          {task.recurrence && (
                            <Badge variant="outline" className="text-xs bg-orange-100 border-orange-200">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="font-normal">
                            Due: {format(new Date(task.dueDate!), "h:mm a")}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        {task.completed ? (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateTask(task.id, { completed: false, completedAt: undefined })}
                          >
                            Undo
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const now = new Date();
                              updateTask(task.id, { 
                                completed: true, 
                                completedAt: now.toISOString() 
                              });
                            }}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>No tasks scheduled for this date</p>
                  <Button className="mt-4" onClick={() => {
                    // A real implementation would open a form or dialog
                    // This is just for demonstration
                    toast.info("Task creation", {
                      description: `To create a task for ${format(date!, 'MMM d, yyyy')}, please use the Tasks page`
                    });
                  }}>
                    Add Task for This Date
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* All Tasks */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">
              Task Schedule
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">
                  Upcoming
                  <Badge variant="secondary" className="ml-2">
                    {upcomingTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  Overdue
                  <Badge variant="secondary" className="ml-2">
                    {overdueTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  <Badge variant="secondary" className="ml-2">
                    {completedTasks.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="space-y-2">
                {getDisplayTasks().length > 0 ? (
                  getDisplayTasks().map((task) => (
                    <div 
                      key={task.id}
                      className={cn(
                        "border rounded-md p-3 transition-all hover:border-primary",
                        task.completed && "opacity-60"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={cn(
                              "font-medium",
                              task.completed && "line-through"
                            )}>
                              {task.title}
                            </h3>
                            {task.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">High</Badge>
                            )}
                            {task.recurrence && (
                              <Badge variant="outline" className="text-xs bg-orange-100 border-orange-200">
                                Recurring
                              </Badge>
                            )}
                            {selectedTab === 'overdue' && (
                              <Badge variant="destructive" className="text-xs">Overdue</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {task.dueDate && (
                              <Badge variant="outline" className="font-normal">
                                {isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), "MMM d")} at {format(new Date(task.dueDate), "h:mm a")}
                              </Badge>
                            )}
                            {task.completedAt && (
                              <Badge variant="outline" className="font-normal text-green-600">
                                Completed: {format(new Date(task.completedAt), "MMM d, h:mm a")}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          {task.completed ? (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateTask(task.id, { completed: false, completedAt: undefined })}
                            >
                              Undo
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const now = new Date();
                                updateTask(task.id, { 
                                  completed: true, 
                                  completedAt: now.toISOString() 
                                });
                              }}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    {selectedTab === 'upcoming' && 'No upcoming tasks'}
                    {selectedTab === 'overdue' && 'No overdue tasks - great job!'}
                    {selectedTab === 'completed' && 'No completed tasks yet'}
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
