import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskContext } from '@/contexts/TaskContext';
import { CalendarService, CalendarProvider } from '@/services/calendarService';
import { CalendarPlus, Calendar as CalendarIcon, Check, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Task } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

export const CalendarIntegration = () => {
  const { tasks } = useTaskContext();
  const [selectedProvider, setSelectedProvider] = useState<CalendarProvider>(CalendarProvider.GOOGLE);
  const [isExporting, setIsExporting] = useState(false);
  const [showTaskSelectionDialog, setShowTaskSelectionDialog] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});

  const handleCalendarProviderChange = (value: string) => {
    setSelectedProvider(value as CalendarProvider);
  };

  const handleExportTask = async (task: Task) => {
    if (!task.dueDate) {
      toast.error('This task has no due date', {
        description: 'Add a due date before exporting to calendar'
      });
      return;
    }

    try {
      setIsExporting(true);
      const dueDate = new Date(task.dueDate);
      await CalendarService.addEvent({
        title: task.title,
        description: task.description,
        startTime: dueDate,
        endTime: new Date(dueDate.getTime() + 60 * 60 * 1000), // 1 hour duration
      }, selectedProvider);
    } catch (error) {
      console.error('Error exporting task:', error);
      toast.error('Failed to export task to calendar');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMultipleTasks = () => {
    // Open task selection dialog
    const initialSelection: Record<string, boolean> = {};
    tasks.forEach(task => {
      // Pre-select tasks with due dates
      if (task.dueDate) {
        initialSelection[task.id] = true;
      }
    });
    setSelectedTasks(initialSelection);
    setShowTaskSelectionDialog(true);
  };

  const handleExportSelectedTasks = async () => {
    const tasksToExport = tasks.filter(task => selectedTasks[task.id]);
    
    if (tasksToExport.length === 0) {
      toast.error('No tasks selected', {
        description: 'Please select at least one task with a due date'
      });
      return;
    }

    setIsExporting(true);
    setShowTaskSelectionDialog(false);
    
    try {
      await CalendarService.exportTasksToCalendar(tasksToExport, selectedProvider);
      toast.success(`${tasksToExport.length} tasks exported to calendar`);
    } catch (error) {
      console.error('Error exporting tasks:', error);
      toast.error('Failed to export tasks to calendar');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getProviderIcon = (provider: CalendarProvider) => {
    return <CalendarIcon className="h-4 w-4" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Calendar Integration</CardTitle>
          <CardDescription>Export your tasks to your preferred calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={selectedProvider} onValueChange={handleCalendarProviderChange}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value={CalendarProvider.GOOGLE} className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Google</span>
              </TabsTrigger>
              <TabsTrigger value={CalendarProvider.OUTLOOK} className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Outlook</span>
              </TabsTrigger>
              <TabsTrigger value={CalendarProvider.APPLE} className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Apple</span>
              </TabsTrigger>
              <TabsTrigger value={CalendarProvider.GENERIC} className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>iCal</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={CalendarProvider.GOOGLE}>
              <div className="p-4 border rounded-lg">
                <h3 className="text-base font-medium mb-2">Google Calendar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your tasks to Google Calendar for better time management
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={handleExportMultipleTasks}
                    disabled={isExporting}
                    className="flex-1"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Export Tasks
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value={CalendarProvider.OUTLOOK}>
              <div className="p-4 border rounded-lg">
                <h3 className="text-base font-medium mb-2">Microsoft Outlook</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your tasks to Microsoft Outlook Calendar
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={handleExportMultipleTasks}
                    disabled={isExporting}
                    className="flex-1"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Export Tasks
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value={CalendarProvider.APPLE}>
              <div className="p-4 border rounded-lg">
                <h3 className="text-base font-medium mb-2">Apple Calendar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your tasks to Apple Calendar (iCal)
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={handleExportMultipleTasks}
                    disabled={isExporting}
                    className="flex-1"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Export Tasks
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value={CalendarProvider.GENERIC}>
              <div className="p-4 border rounded-lg">
                <h3 className="text-base font-medium mb-2">iCal Format (.ics)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download tasks as .ics file that works with most calendar apps
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={handleExportMultipleTasks}
                    disabled={isExporting}
                    className="flex-1"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Export Tasks
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex-col items-start">
          <p className="text-sm text-muted-foreground mb-2">
            Tasks with due dates can be exported to your calendar for better scheduling
          </p>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank')}
            className="text-xs"
          >
            Learn about calendar importing
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showTaskSelectionDialog} onOpenChange={setShowTaskSelectionDialog}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Tasks to Export</DialogTitle>
            <DialogDescription>
              Choose which tasks you want to export to your calendar
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center my-2 px-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs"
              onClick={() => {
                const newSelection: Record<string, boolean> = {};
                tasks.forEach(task => {
                  if (task.dueDate) {
                    newSelection[task.id] = true;
                  }
                });
                setSelectedTasks(newSelection);
              }}
            >
              Select all with due dates
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => setSelectedTasks({})}
            >
              Clear selection
            </Button>
          </div>
          
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-2 my-2">
              {tasks.map(task => (
                <div 
                  key={task.id}
                  className={`p-3 border rounded-md hover:bg-accent/50 transition-colors ${!task.dueDate ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={!!selectedTasks[task.id]}
                      disabled={!task.dueDate}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                    />
                    <Label
                      htmlFor={`task-${task.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{task.title}</div>
                      {task.dueDate ? (
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-500">
                          No due date set
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowTaskSelectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportSelectedTasks} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  Export to {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
