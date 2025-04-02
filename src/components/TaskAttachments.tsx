
import React, { useState, useRef, ChangeEvent } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task, TaskAttachment } from '../types/task';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Paperclip, FileText, Image, File, Download, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AdvancedFileUpload } from './AdvancedFileUpload';

interface TaskAttachmentsProps {
  task: Task;
}

export const TaskAttachments = ({ task }: TaskAttachmentsProps) => {
  const { addAttachment, removeAttachment } = useTaskContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploader, setShowUploader] = useState(false);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    
    // In a real app, you would upload to a storage service
    // Here we'll simulate by creating a URL
    const attachment: Omit<TaskAttachment, 'id'> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file) // In a real app, this would be the upload URL
    };
    
    addAttachment(task.id, attachment);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const handleUploadComplete = () => {
    setShowUploader(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium flex items-center">
          <Paperclip className="h-5 w-5 mr-2" /> Attachments
        </h3>
        <div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowUploader(!showUploader)}
          >
            <Upload className="h-4 w-4 mr-1" /> {showUploader ? 'Cancel' : 'Upload File'}
          </Button>
        </div>
      </div>
      
      {showUploader && (
        <div className="mb-4">
          <AdvancedFileUpload taskId={task.id} onUploadComplete={handleUploadComplete} />
        </div>
      )}
      
      <div>
        {(!task.attachments || task.attachments.length === 0) ? (
          <div className="text-center py-6 bg-muted/50 rounded-md">
            <p className="text-muted-foreground mb-2">No attachments yet</p>
            <p className="text-sm text-muted-foreground">
              Add files like images, documents or links to this task
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {task.attachments.map(attachment => (
              <li 
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{attachment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                  >
                    <a href={attachment.url} download={attachment.name} target="_blank">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeAttachment(task.id, attachment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
