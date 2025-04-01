
import React from 'react';
import { Task } from '../types/task';
import { format } from 'date-fns';
import { Check, Trash2, Edit, Clock } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { completeTask, deleteTask, categories } = useTaskContext();
  
  const category = categories.find(c => c.id === task.category);
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  return (
    <div className={cn(
      "task-card animate-fade-in flex flex-col",
      task.completed && "opacity-60"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className={cn(
            "font-medium text-lg transition-all",
            task.completed && "line-through text-gray-500"
          )}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            {category && (
              <Badge style={{ backgroundColor: category.color, color: '#fff' }} variant="outline">
                {category.name}
              </Badge>
            )}
            <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ml-2 h-8 w-8 rounded-full flex items-center justify-center" 
                style={{
                  background: `conic-gradient(from 0deg, #8B5CF6 ${task.aiScore}%, #E5E7EB ${task.aiScore}% 100%)`
                }}>
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-gray-700">
                  {task.aiScore}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Priority Score</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 flex-grow">{task.description}</p>
      
      {task.dueDate && (
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Clock className="h-3 w-3 mr-1" />
          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </div>
      )}
      
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => completeTask(task.id)}
          className="text-xs"
        >
          <Check className="h-4 w-4 mr-1" />
          {task.completed ? 'Undo' : 'Complete'}
        </Button>
        
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(task)} 
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => deleteTask(task.id)} 
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
