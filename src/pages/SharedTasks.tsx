
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { TeamCollaboration } from '@/components/TeamCollaboration';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useApiKey } from '@/hooks/useApiKey';
import { EmailNotificationsList } from '@/components/EmailNotificationsList';

const SharedTasks = () => {
  const { getSharedTasks, tasks } = useTaskContext();
  const sharedTasks = getSharedTasks();
  const [activeTab, setActiveTab] = useState('shared-tasks');
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Team Collaboration</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="shared-tasks">Shared Tasks</TabsTrigger>
          <TabsTrigger value="team-members">Team Members</TabsTrigger>
          <TabsTrigger value="email-settings">Email Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shared-tasks" className="space-y-4">
          {sharedTasks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Shared Tasks</CardTitle>
                <CardDescription>
                  You don't have any shared tasks yet. Share a task with a team member or ask them to share with you.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button variant="outline" onClick={() => toast.info("Select a task to share from your task list")}>
                  Share a Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Shared</TabsTrigger>
                <TabsTrigger value="shared-by-me">Shared by Me</TabsTrigger>
                <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {sharedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </TabsContent>
              
              <TabsContent value="shared-by-me" className="space-y-4">
                {sharedTasks
                  .filter(task => task.shared)
                  .map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </TabsContent>
              
              <TabsContent value="shared-with-me" className="space-y-4">
                {sharedTasks
                  .filter(task => !task.userId) // In this demo, tasks without userId are ones shared with me
                  .map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
        
        <TabsContent value="team-members">
          <TeamCollaboration />
        </TabsContent>
        
        <TabsContent value="email-settings">
          <EmailNotificationsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Enhanced Task Card component for shared tasks
const TaskCard = ({ task }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {task.priority}
              </span>
              
              {task.dueDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
              ${task.completed 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'}`}
            >
              {task.completed ? 'Completed' : 'In Progress'}
            </span>
            
            {/* Show collaborators if available */}
            {task.collaborators && task.collaborators.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">
                  Shared with {task.collaborators.length} people
                </div>
                <div className="flex -space-x-2">
                  {task.collaborators.slice(0, 3).map((collaborator, index) => (
                    <Avatar key={index} className="border-2 border-background h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {collaborator.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.collaborators.length > 3 && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs">
                      +{task.collaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { SharedTasks };
