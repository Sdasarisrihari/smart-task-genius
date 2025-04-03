
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTaskContext } from '@/contexts/TaskContext';
import { Download, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DataExportImport = () => {
  const { tasks, categories, importTasks, importCategories } = useTaskContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('export');

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Create export data object
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          tasks,
          categories
        }
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set download attributes and trigger download
      link.href = url;
      link.download = `task-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Validate the imported data structure
        if (!importedData.data || !importedData.version) {
          throw new Error('Invalid data format');
        }
        
        // Import tasks and categories
        if (importedData.data.tasks) {
          importTasks(importedData.data.tasks);
        }
        
        if (importedData.data.categories) {
          importCategories(importedData.data.categories);
        }
        
        toast.success('Data imported successfully');
        setShowImportDialog(false);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import data. Invalid file format.');
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading the file');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Data Management</CardTitle>
          <CardDescription>Export or import your task data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50 text-center">
                <FileText className="h-10 w-10 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Export All Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your tasks and categories as a JSON file
                </p>
                <Button onClick={handleExport} disabled={isExporting} className="w-full">
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">The export file includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All tasks and their details</li>
                  <li>Custom categories</li>
                  <li>Task templates</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50 text-center">
                <Upload className="h-10 w-10 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Import Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import tasks and categories from a previously exported file
                </p>
                <Button onClick={() => setShowImportDialog(true)} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-2 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-400">
                    <p className="font-medium mb-1">Important</p>
                    <p>Importing data will merge with your existing tasks and categories. Duplicate items will be created if they have different IDs.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Select a task data JSON file to import
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here, or click to select
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="file-upload"
                disabled={isImporting}
              />
              <label htmlFor="file-upload">
                <Button disabled={isImporting} asChild>
                  <span>
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>Select File</>
                    )}
                  </span>
                </Button>
              </label>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Only files previously exported from this app are supported.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
