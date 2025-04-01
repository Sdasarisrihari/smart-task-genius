
import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { PlusCircle, Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const TaskTemplates = () => {
  const { getTemplates, createFromTemplate, deleteTask } = useTaskContext();
  const templates = getTemplates();
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Task Templates</h2>
      <p className="text-muted-foreground">Create new tasks from saved templates</p>
      
      {templates.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mb-3 text-muted-foreground">No templates yet</div>
          <p className="mb-4 max-w-md mx-auto text-sm">
            Save frequently created tasks as templates to quickly reuse them later.
            You can create templates from existing tasks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Badge variant="outline">{template.priority}</Badge>
                  {template.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      Due date will be set relative to creation
                    </span>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteTask(template.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                <Button 
                  size="sm"
                  onClick={() => createFromTemplate(template.id)}
                >
                  <Copy className="h-4 w-4 mr-1" /> Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
