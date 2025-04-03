
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from '../types/task';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Save, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TimeTracker } from './TimeTracker';
import { TaskDependencies } from './TaskDependencies';
import { TaskAttachments } from './TaskAttachments';
import { toast } from 'sonner';
import { TaskComments } from './TaskComments';
import { CalendarService, CalendarProvider } from '@/services/calendarService';

// Extended schema to include new fields
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, 'Category is required'),
  estimatedMinutes: z.number().min(0).optional(),
  saveAsTemplate: z.boolean().optional(),
  addToCalendar: z.boolean().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  isFromTemplate?: boolean;
}

export const TaskForm = ({ task, isOpen, onClose, templateId, isFromTemplate }: TaskFormProps) => {
  const { 
    addTask, 
    updateTask, 
    categories, 
    saveTemplate,
    getTaskDependencies,
    getTaskTemplate
  } = useTaskContext();
  
  const [activeTab, setActiveTab] = useState('details');
  
  // For new task form, default to 'details' tab, for existing tasks, we can show tabs
  useEffect(() => {
    setActiveTab('details');
    
    // If creating task from template, load template data
    if (isFromTemplate && templateId) {
      const template = getTaskTemplate(templateId);
      if (template) {
        // Get the original task the template is based on
        const templateTask = getTaskByTemplateId(template.taskId);
        if (templateTask) {
          form.reset({
            title: template.name || templateTask.title,
            description: templateTask.description || '',
            dueDate: null, // Don't copy due date from template
            priority: templateTask.priority,
            category: templateTask.category,
            estimatedMinutes: templateTask.timeTracking?.estimatedMinutes || 0,
            saveAsTemplate: false,
            addToCalendar: false
          });
        }
      }
    }
  }, [isOpen, isFromTemplate, templateId]);
  
  // Helper to get a task by ID for template loading
  const getTaskByTemplateId = (taskId: string): Task | undefined => {
    // This would normally query tasks from the context
    // For demo purposes, we're just simulating
    return {
      id: taskId,
      title: "Template Task",
      description: "This is a task from a template",
      category: categories[0]?.id || "",
      priority: "medium",
      completed: false
    } as Task;
  };
  
  // Calculate if dependencies are completed for existing task
  const areDependenciesComplete = task ? getTaskDependencies(task.id).every(t => t.completed) : true;
  
  const defaultValues: TaskFormValues = {
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate) : null,
    priority: task?.priority || 'medium',
    category: task?.category || (categories.length > 0 ? categories[0].id : ''),
    estimatedMinutes: task?.timeTracking?.estimatedMinutes || 0,
    saveAsTemplate: false,
    addToCalendar: false
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const onSubmit = async (values: TaskFormValues) => {
    const { saveAsTemplate, addToCalendar, ...taskValues } = values;
    
    // Include time tracking info if estimated time is set
    const timeTracking = values.estimatedMinutes ? {
      estimatedMinutes: values.estimatedMinutes,
      actualMinutes: task?.timeTracking?.actualMinutes || 0,
      logs: task?.timeTracking?.logs || []
    } : undefined;
    
    let savedTask: Task | undefined;
    
    if (task) {
      // Update existing task
      updateTask(task.id, {
        ...taskValues,
        timeTracking
      });
      savedTask = { ...task, ...taskValues, timeTracking };
      
      if (saveAsTemplate) {
        saveTemplate(task.id);
      }
    } else {
      // Create new task
      savedTask = addTask({
        title: values.title,
        description: values.description || '',
        dueDate: values.dueDate,
        priority: values.priority,
        category: values.category,
        completed: false,
        timeTracking
      });
      
      // Only attempt to save as template if newTask is returned and has an id
      if (saveAsTemplate && savedTask && savedTask.id) {
        saveTemplate(savedTask.id);
      }
    }
    
    // Add to calendar if requested
    if (addToCalendar && savedTask && savedTask.dueDate) {
      const calendarProvider = localStorage.getItem('preferredCalendar') as CalendarProvider || CalendarProvider.GOOGLE;
      
      try {
        const dueDate = new Date(savedTask.dueDate);
        await CalendarService.addEvent({
          title: savedTask.title,
          description: savedTask.description,
          startTime: dueDate,
          endTime: new Date(dueDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        }, calendarProvider);
        
        toast.success('Task added to calendar');
      } catch (error) {
        console.error('Error adding to calendar:', error);
        toast.error('Failed to add to calendar');
      }
    }
    
    onClose();
  };
  
  // Warn about dependencies if relevant
  useEffect(() => {
    if (task && !areDependenciesComplete) {
      toast.warning("This task has unfinished dependencies", {
        description: "You may want to complete them first"
      });
    }
  }, [task, areDependenciesComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isFromTemplate ? 'Create Task from Template' : (task ? 'Edit Task' : 'Add New Task')}
          </DialogTitle>
        </DialogHeader>
        
        {task ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="pt-4">
              <TaskFormDetails 
                form={form} 
                onSubmit={onSubmit}
                onClose={onClose}
                isNew={false}
              />
            </TabsContent>
            
            <TabsContent value="time" className="pt-4">
              <TimeTracker task={task} />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="dependencies" className="pt-4">
              <TaskDependencies task={task} />
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="pt-4">
              <TaskComments taskId={task.id} />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="pt-4">
            <TaskFormDetails 
              form={form} 
              onSubmit={onSubmit}
              onClose={onClose}
              isNew={true}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Extract the form fields to a separate component for clarity
interface TaskFormDetailsProps {
  form: any;
  onSubmit: (values: TaskFormValues) => void;
  onClose: () => void;
  isNew: boolean;
}

const TaskFormDetails = ({ form, onSubmit, onClose, isNew }: TaskFormDetailsProps) => {
  const { categories } = useTaskContext();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add details about this task"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }} 
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="estimatedMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Time (minutes)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input 
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Estimate how long this task will take
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="saveAsTemplate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel>Save as template</FormLabel>
                  <FormDescription>
                    Create a reusable template from this task
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="addToCalendar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel>Add to calendar</FormLabel>
                  <FormDescription>
                    Add this task to your calendar when saved
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">
            {isNew ? 'Add Task' : 'Update Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
