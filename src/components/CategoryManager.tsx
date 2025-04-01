
import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, Trash2, Edit, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { toast } from 'sonner';
import { ChromePicker } from 'react-color';
import { Category } from '../types/task';

export const CategoryManager = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#10b981');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  
  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryColor(category.color);
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryColor('#10b981');
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };
  
  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (editingCategory) {
      updateCategory(editingCategory.id, { 
        name: categoryName, 
        color: categoryColor 
      });
      toast.success('Category updated successfully');
    } else {
      addCategory({ 
        name: categoryName, 
        color: categoryColor 
      });
      toast.success('Category added successfully');
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteCategory = (id: string) => {
    const hasTasksInCategory = categories.some(category => category.id === id);
    
    if (hasTasksInCategory) {
      if (confirm('This will also affect tasks in this category. Continue?')) {
        deleteCategory(id);
        toast.success('Category deleted successfully');
      }
    } else {
      deleteCategory(id);
      toast.success('Category deleted successfully');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="p-4 rounded-md border border-gray-200 shadow-sm flex justify-between items-center"
          >
            <div className="flex items-center">
              <div 
                className="h-5 w-5 rounded-full mr-3" 
                style={{ backgroundColor: category.color }} 
              />
              <span>{category.name}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleOpenDialog(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeleteCategory(category.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-10 h-10 rounded cursor-pointer border"
                  style={{ backgroundColor: categoryColor }}
                  onClick={() => setColorPickerOpen(!colorPickerOpen)}
                />
                <Input
                  id="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
              {colorPickerOpen && (
                <div className="absolute z-10 mt-2">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setColorPickerOpen(false)} 
                  />
                  <ChromePicker
                    color={categoryColor}
                    onChange={(color) => setCategoryColor(color.hex)}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
