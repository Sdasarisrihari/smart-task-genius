
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

interface ShareTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareTaskDialog = ({ task, isOpen, onClose }: ShareTaskDialogProps) => {
  const { shareTask, unshareTask } = useTaskContext();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [collaborators, setCollaborators] = useState<Collaborator[]>(task.collaborators || []);
  
  const handleAddCollaborator = () => {
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
    
    setCollaborators([...collaborators, newCollaborator]);
    setEmail("");
    toast.success("Collaborator added");
  };
  
  const handleRemoveCollaborator = (userId: string) => {
    setCollaborators(collaborators.filter(c => c.userId !== userId));
  };
  
  const handleSave = () => {
    if (collaborators.length === 0) {
      unshareTask(task.id);
    } else {
      shareTask(task.id, collaborators);
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
            <Button variant="secondary" onClick={handleAddCollaborator}>
              Add
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
