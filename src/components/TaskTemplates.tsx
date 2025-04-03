
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from 'sonner';
import { MoreHorizontal, FilePlus, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TaskForm } from './TaskForm';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  taskId: string;
}

export const TaskTemplates = () => {
  const { templates, createTaskFromTemplate, deleteTemplate, renameTemplate } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TaskTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleEdit = (template: TaskTemplate) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setIsDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate) return;
    
    renameTemplate(currentTemplate.id, templateName, templateDescription);
    toast.success('Template updated successfully');
    setIsDialogOpen(false);
  };

  const handleDelete = (templateId: string) => {
    deleteTemplate(templateId);
    toast.success('Template deleted');
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsTaskFormOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Task Templates</h2>
        </div>

        {templates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-3">
                <FilePlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">No templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Save a task as template to reuse it later
              </p>
              <p className="text-xs text-muted-foreground">
                When creating or editing a task, check "Save as template"
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base line-clamp-1">{template.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {template.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button 
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full"
                    size="sm"
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your template details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input 
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input 
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isTaskFormOpen && selectedTemplateId && (
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          templateId={selectedTemplateId}
          isFromTemplate={true}
        />
      )}
    </>
  );
};
