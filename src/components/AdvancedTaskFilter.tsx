
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskContext } from '@/contexts/TaskContext';
import { Badge } from '@/components/ui/badge';

export interface AdvancedFilterOptions {
  priority: string;
  category: string;
  completed: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  aiScoreMin: number;
  hasAttachments: boolean | null;
  isDependency: boolean | null;
}

interface AdvancedTaskFilterProps {
  onFilterChange: (filters: AdvancedFilterOptions) => void;
}

export const AdvancedTaskFilter = ({ onFilterChange }: AdvancedTaskFilterProps) => {
  const { categories } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  
  const [filters, setFilters] = useState<AdvancedFilterOptions>({
    priority: 'all',
    category: 'all',
    completed: 'all',
    dateRange: { from: undefined, to: undefined },
    aiScoreMin: 0,
    hasAttachments: null,
    isDependency: null
  });

  const updateFilters = (newFilters: Partial<AdvancedFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Count active filters
    let count = 0;
    if (updatedFilters.priority !== 'all') count++;
    if (updatedFilters.category !== 'all') count++;
    if (updatedFilters.completed !== 'all') count++;
    if (updatedFilters.dateRange.from || updatedFilters.dateRange.to) count++;
    if (updatedFilters.aiScoreMin > 0) count++;
    if (updatedFilters.hasAttachments !== null) count++;
    if (updatedFilters.isDependency !== null) count++;
    
    setActiveFilters(count);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      priority: 'all',
      category: 'all',
      completed: 'all',
      dateRange: { from: undefined, to: undefined },
      aiScoreMin: 0,
      hasAttachments: null,
      isDependency: null
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setActiveFilters(0);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsOpen(true)}>
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <h3 className="font-medium">Filter Tasks</h3>
          
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              value={filters.priority} 
              onValueChange={(value) => updateFilters({ priority: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => updateFilters({ category: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }} 
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.completed} 
              onValueChange={(value) => updateFilters({ completed: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Due Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.from.toLocaleDateString()
                    ) : (
                      <span>Start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => 
                      updateFilters({ 
                        dateRange: { ...filters.dateRange, from: date || undefined }
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? (
                      filters.dateRange.to.toLocaleDateString()
                    ) : (
                      <span>End date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => 
                      updateFilters({ 
                        dateRange: { ...filters.dateRange, to: date || undefined }
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Min AI Score: {filters.aiScoreMin}</Label>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[filters.aiScoreMin]}
              onValueChange={(value) => updateFilters({ aiScoreMin: value[0] })}
              className="w-full"
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="has-attachments">Has Attachments</Label>
              <div className="space-x-2">
                <Button 
                  variant={filters.hasAttachments === true ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => updateFilters({ hasAttachments: filters.hasAttachments === true ? null : true })}
                >
                  Yes
                  {filters.hasAttachments === true && <Check className="ml-1 h-3 w-3" />}
                </Button>
                <Button 
                  variant={filters.hasAttachments === false ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updateFilters({ hasAttachments: filters.hasAttachments === false ? null : false })}
                >
                  No
                  {filters.hasAttachments === false && <Check className="ml-1 h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is-dependency">Has Dependencies</Label>
              <div className="space-x-2">
                <Button 
                  variant={filters.isDependency === true ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => updateFilters({ isDependency: filters.isDependency === true ? null : true })}
                >
                  Yes
                  {filters.isDependency === true && <Check className="ml-1 h-3 w-3" />}
                </Button>
                <Button 
                  variant={filters.isDependency === false ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updateFilters({ isDependency: filters.isDependency === false ? null : false })}
                >
                  No
                  {filters.isDependency === false && <Check className="ml-1 h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
