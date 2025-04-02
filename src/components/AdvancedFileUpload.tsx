
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';
import { UploadCloud, X, File, FileText, Image, CheckCircle } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskAttachment } from '@/types/task';

interface AdvancedFileUploadProps {
  taskId: string;
  onUploadComplete?: (attachment: TaskAttachment) => void;
}

export const AdvancedFileUpload = ({ taskId, onUploadComplete }: AdvancedFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAttachment } = useTaskContext();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File is too large. Maximum size is 10MB");
      return;
    }
    
    setUploading(true);
    
    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 95) return prev + 5;
          clearInterval(interval);
          return prev;
        });
      }, 100);
      
      // In a real app, you would upload to your API
      // const response = await apiService.uploadTaskAttachment(taskId, selectedFile);
      
      // For demo, simulate API response and create local attachment
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        
        const newAttachment: Omit<TaskAttachment, 'id'> = {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          url: URL.createObjectURL(selectedFile) // In a real app, this would be the URL from the API response
        };
        
        addAttachment(taskId, newAttachment);
        
        if (onUploadComplete) {
          onUploadComplete({
            ...newAttachment,
            id: 'temp-' + Date.now() // In a real app, this would be the ID from the API response
          });
        }
        
        toast.success("File uploaded successfully");
        setSelectedFile(null);
        setProgress(0);
        setUploading(false);
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Upload failed. Please try again");
      setProgress(0);
      setUploading(false);
    }
  };
  
  const cancelUpload = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getFileIcon = () => {
    if (!selectedFile) return <UploadCloud className="h-10 w-10 text-muted-foreground" />;
    
    if (selectedFile.type.startsWith('image/')) {
      return <Image className="h-10 w-10 text-blue-500" />;
    } else if (selectedFile.type.includes('pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else {
      return <File className="h-10 w-10 text-green-500" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={preventDefaults}
          onDragEnter={preventDefaults}
          onDragLeave={preventDefaults}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="hidden" 
          />
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
          <div className="text-sm font-medium mb-1">
            Drop file here or click to upload
          </div>
          <div className="text-xs text-muted-foreground">
            Supports images, documents, and other files up to 10MB
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <div className="font-medium text-sm truncate max-w-[200px]">{selectedFile.name}</div>
                <div className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={cancelUpload}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs">
                <span>{progress}% complete</span>
                <span>{progress < 100 ? 'Uploading...' : 'Complete'}</span>
              </div>
            </div>
          )}
          
          {!uploading && (
            <Button onClick={handleUpload} className="w-full">
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
