import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskContext } from '../contexts/TaskContext';
import { Task, PriorityLevel, RecurrencePattern } from '@/types/task';
import { cn } from '@/lib/utils';
import { RecurrenceSelector } from './RecurrenceSelector';
import { VoiceTaskInput } from './VoiceTaskInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MessageSquarePlus } from 'lucide-react';

interface TaskFormProps {
  initialTask?: Task;
  onSave?: (task: Task) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  task?: Task;
  templateId?: string;
  isFromTemplate?: boolean;
}

const TaskForm = ({ 
  initialTask, 
  onSave, 
  onCancel, 
  onDelete, 
  isEditing, 
  isOpen, 
  onClose,
  task,
  templateId,
  isFromTemplate
}: TaskFormProps) => {
  // Use task prop if provided, otherwise use initialTask
  const actualTask = task || initialTask;
  
  const { addTask, updateTask, categories, createTaskFromTemplate } = useTaskContext();
  const [title, setTitle] = useState(actualTask?.title || '');
  const [description, setDescription] = useState(actualTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    actualTask?.dueDate ? new Date(actualTask.dueDate) : undefined
  );
  const [category, setCategory] = useState(actualTask?.category || categories[0]?.id || '');
  const [priority, setPriority] = useState<PriorityLevel>(actualTask?.priority || 'medium');
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMethod, setInputMethod] = useState<'form' | 'voice'>('form');
  const [recurrence, setRecurrence] = useState<RecurrencePattern | undefined>(actualTask?.recurrence);
  
  // Handle template if provided
  useEffect(() => {
    if (isFromTemplate && templateId) {
      const createdTask = createTaskFromTemplate(templateId);
      if (createdTask) {
        setTitle(createdTask.title || '');
        setDescription(createdTask.description || '');
        setDueDate(createdTask.dueDate ? new Date(createdTask.dueDate) : undefined);
        setCategory(createdTask.category || categories[0]?.id || '');
        setPriority(createdTask.priority || 'medium');
        setRecurrence(createdTask.recurrence);
      }
    }
  }, [isFromTemplate, templateId, createTaskFromTemplate, categories]);
  
  // Validation state
  const [errors, setErrors] = useState({
    title: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      setErrors({ ...errors, title: true });
      return;
    }

    // Create/update task object
    const taskData: Partial<Task> = {
      title,
      description,
      dueDate: dueDate ? dueDate.toISOString() : null,
      category,
      priority,
      recurrence,
      isRecurring: !!recurrence
    };

    if (isEditing && initialTask) {
      // Update existing task
      updateTask(initialTask.id, taskData);
      if (onSave) onSave({ ...initialTask, ...taskData } as Task);
    } else {
      // Create new task
      const newTask = addTask({
        ...taskData,
        completed: false
      } as any);
      if (onSave) onSave(newTask);
    }

    // Reset form if not editing
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setPriority('medium');
      setCategory(categories[0]?.id || '');
      setRecurrence(undefined);
    }
  };

  const handleVoiceTaskCreated = (taskData: Partial<Task>) => {
    // Fill the form with the voice task data
    setTitle(taskData.title || '');
    setDescription(taskData.description || '');
    setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : undefined);
    setPriority(taskData.priority || 'medium');
    setCategory(taskData.category || categories[0]?.id || '');
    
    // Switch to form input to review before submitting
    setInputMethod('form');
  };

  return (
    <Card className="w-full transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          {isEditing ? 'Edit Task' : 'Add New Task'}
        </CardTitle>
      </CardHeader>
      
      <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'form' | 'voice')}>
        <TabsList className="mx-6">
          <TabsTrigger value="form" className="flex-1">Form Input</TabsTrigger>
          <TabsTrigger value="voice" className="flex-1">Voice Command</TabsTrigger>
        </TabsList>
        
        <TabsContent value="voice" className="p-6 pt-4">
          <VoiceTaskInput onTaskCreated={handleVoiceTaskCreated} />
        </TabsContent>
        
        <TabsContent value="form">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setErrors({ ...errors, title: false });
                  }}
                  className={cn(errors.title ? "border-red-500 focus-visible:ring-red-500" : "")}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">Title is required</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Select
                    value={priority}
                    onValueChange={(value) => setPriority(value as PriorityLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: cat.color }}
                            ></div>
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Set due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <RecurrenceSelector 
                value={recurrence} 
                onChange={setRecurrence} 
              />
              
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" type="button" className="w-full justify-between">
                    <span>
                      {isExpanded ? 'Hide description' : 'Add description'}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded ? "transform rotate-180" : "")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Textarea
                    placeholder="Task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {isEditing && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit">
                  {isEditing ? 'Update Task' : 'Add Task'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TaskForm;
