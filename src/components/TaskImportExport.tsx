
import React, { useState, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { FileInput, FileOutput, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const TaskImportExport = () => {
  const { exportTasks, importTasks } = useTaskContext();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExport = () => {
    try {
      const data = exportTasks();
      setExportData(data);
      setIsExportDialogOpen(true);
    } catch (error) {
      toast.error("Error exporting tasks");
      console.error(error);
    }
  };
  
  const handleImport = () => {
    try {
      if (!importData.trim()) {
        toast.error("Please enter valid JSON data");
        return;
      }
      
      importTasks(importData);
      setIsImportDialogOpen(false);
      setImportData('');
    } catch (error) {
      toast.error("Error importing tasks");
      console.error(error);
    }
  };
  
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setImportData(content);
        setIsImportDialogOpen(true);
      } catch (error) {
        toast.error("Failed to read file");
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const downloadExport = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex gap-2 items-center">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileImport}
      />
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center"
      >
        <FileInput className="h-4 w-4 mr-1" /> Import
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
        className="flex items-center"
      >
        <FileOutput className="h-4 w-4 mr-1" /> Export
      </Button>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Export Tasks</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm mb-4">
              Your tasks have been exported as JSON. You can copy the data or download it as a file.
            </p>
            <Textarea 
              value={exportData} 
              readOnly 
              className="h-[250px] font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={downloadExport}>
              <FileOutput className="h-4 w-4 mr-1" /> Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Tasks</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Make sure the JSON format matches the required structure. 
                  Importing invalid data may cause issues.
                </p>
              </div>
            </div>
            <Label htmlFor="import-data">Paste JSON Data</Label>
            <Textarea 
              id="import-data"
              value={importData} 
              onChange={(e) => setImportData(e.target.value)}
              className="h-[250px] font-mono text-xs mt-2"
              placeholder='[{"title":"Task 1", "description":"Description", ...}]'
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
