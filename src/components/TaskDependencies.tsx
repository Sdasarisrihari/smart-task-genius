import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task } from '../types/task';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Check, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskDependenciesProps {
  task: Task;
}

export const TaskDependencies = ({ task }: TaskDependenciesProps) => {
  const { tasks, addTaskDependency, removeTaskDependency, getTaskDependencies, getDependentTasks } = useTaskContext();
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  
  const dependencies = getTaskDependencies(task.id);
  const dependentTasks = getDependentTasks(task.id);
  
  // Filter out tasks that would create circular dependencies or are the task itself
  const availableTasks = tasks.filter(t => {
    // Skip templates, completed tasks, the task itself, and tasks that depend on this task
    if (t.isTemplate || t.completed || t.id === task.id || dependentTasks.some(dt => dt.id === t.id)) {
      return false;
    }
    
    // Skip tasks that this task already depends on
    if (task.dependencies?.includes(t.id)) {
      return false;
    }
    
    return true;
  });
  
  const handleAddDependency = (dependencyId: string) => {
    addTaskDependency(task.id, dependencyId);
    toast.success("Dependency added");
  };
  
  const handleRemoveDependency = (dependencyId: string) => {
    removeTaskDependency(task.id, dependencyId);
    toast.success("Dependency removed");
  };
  
  const getStatusClass = (task: Task) => {
    if (task.completed) return "text-green-500";
    if (task.dueDate && new Date(task.dueDate) < new Date()) return "text-red-500";
    return "";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Dependencies</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setIsSelectDialogOpen(true)}
          disabled={availableTasks.length === 0}
        >
          Add Dependency
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">This task depends on:</h4>
          {dependencies.length === 0 ? (
            <div className="text-sm text-muted-foreground">No dependencies</div>
          ) : (
            <ul className="space-y-2">
              {dependencies.map(dependency => (
                <li key={dependency.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <div className={cn("flex items-center gap-2", getStatusClass(dependency))}>
                    <span className={dependency.completed ? "line-through" : ""}>
                      {dependency.title}
                    </span>
                    {dependency.completed && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleRemoveDependency(dependency.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {dependentTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Tasks that depend on this:</h4>
            <ul className="space-y-2">
              {dependentTasks.map(dependency => (
                <li key={dependency.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <div className={cn("flex items-center gap-2", getStatusClass(dependency))}>
                    <span className={dependency.completed ? "line-through" : ""}>
                      {dependency.title}
                    </span>
                    {dependency.completed && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Dependencies</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select tasks that must be completed before this task can be worked on.
            </p>
            <ScrollArea className="h-[300px] pr-4">
              <ul className="space-y-2">
                {availableTasks.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No available tasks to add as dependencies</li>
                ) : (
                  availableTasks.map(t => (
                    <li 
                      key={t.id} 
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => handleAddDependency(t.id)}
                    >
                      <span className="line-clamp-1">{t.title}</span>
                      <ChevronRight className="h-4 w-4" />
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSelectDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
