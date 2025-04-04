
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Task } from "@/types/task";
import { useTaskContext } from "@/contexts/TaskContext";
import { Collaborator } from "@/types/user";
import { toast } from "sonner";
import { EmailService } from '@/services/emailService';
import { useAuth } from '@/contexts/AuthContext';

interface ShareTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareTaskDialog = ({ task, isOpen, onClose }: ShareTaskDialogProps) => {
  const { shareTask, unshareTask } = useTaskContext();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [collaborators, setCollaborators] = useState<Collaborator[]>(task.collaborators || []);
  const [isSending, setIsSending] = useState(false);
  
  const handleAddCollaborator = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    
    if (!email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Check if already added
    if (collaborators.some(c => c.userId === email)) {
      toast.error("This collaborator has already been added");
      return;
    }
    
    const newCollaborator: Collaborator = {
      userId: email, // In a real app, this would be the user's ID
      displayName: email.split('@')[0], // Using part of email as display name
      role
    };
    
    setIsSending(true);
    
    try {
      // Send invite email
      const taskLink = `${window.location.origin}/tasks/${task.id}`;
      const inviterName = currentUser?.displayName || "A team member";
      
      const emailBody = `
        <h2>Task Shared With You</h2>
        <p>${inviterName} has shared a task with you:</p>
        <p><strong>${task.title}</strong></p>
        <p>${task.description || ''}</p>
        <p>You have been given <strong>${role}</strong> access to this task.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${taskLink}" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Task
          </a>
        </div>
      `;
      
      await EmailService.sendEmail(
        email,
        `Task Shared: ${task.title}`,
        emailBody
      );
      
      setCollaborators([...collaborators, newCollaborator]);
      setEmail("");
      toast.success("Collaborator added and notification sent");
    } catch (error) {
      console.error("Error sending invitation:", error);
      // Add collaborator even if email fails
      setCollaborators([...collaborators, newCollaborator]);
      setEmail("");
      toast.success("Collaborator added", { 
        description: "Email notification may not have been sent"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleRemoveCollaborator = (userId: string) => {
    setCollaborators(collaborators.filter(c => c.userId !== userId));
  };
  
  const handleSave = () => {
    if (collaborators.length === 0) {
      unshareTask(task.id);
      toast.info("Task is no longer shared");
    } else {
      // Convert collaborators array to array of strings (user IDs) for the shareTask function
      const collaboratorIds = collaborators.map(c => c.userId);
      shareTask(task.id, collaboratorIds);
      toast.success(`Task shared with ${collaborators.length} people`);
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Task</DialogTitle>
          <DialogDescription>
            Share "{task.title}" with teammates for collaboration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              placeholder="colleague@example.com"
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Role</Label>
            <RadioGroup
              className="col-span-3"
              value={role}
              onValueChange={(value) => setRole(value as "viewer" | "editor")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="viewer" id="viewer" />
                <Label htmlFor="viewer">Viewer (can only view)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="editor" id="editor" />
                <Label htmlFor="editor">Editor (can make changes)</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end">
            <Button 
              variant="secondary" 
              onClick={handleAddCollaborator}
              disabled={isSending}
            >
              {isSending ? "Adding..." : "Add"}
            </Button>
          </div>
          
          {collaborators.length > 0 && (
            <div className="border rounded-md p-3 mt-2">
              <h4 className="text-sm font-medium mb-2">Current Collaborators</h4>
              <ul className="space-y-2">
                {collaborators.map((c) => (
                  <li key={c.userId} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{c.displayName}</span>
                      <span className="text-muted-foreground ml-2">({c.role})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(c.userId)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
