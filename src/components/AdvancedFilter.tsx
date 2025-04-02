
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import { Label } from './ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Filter, FilterX, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTaskContext } from '../contexts/TaskContext';
import { Category, PriorityLevel } from '../types/task';

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  priority: PriorityLevel | 'all';
  category: string;
  completed: 'all' | 'completed' | 'incomplete';
  searchQuery: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  aiScoreMin: number;
  hasAttachments: boolean | null;
  isDependency: boolean | null;
}

export const AdvancedFilter = ({ onFilterChange }: AdvancedFilterProps) => {
  const { categories } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);
  const [filtersActive, setFiltersActive] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    priority: 'all',
    category: 'all',
    completed: 'all',
    searchQuery: '',
    dateRange: { from: undefined, to: undefined },
    aiScoreMin: 0,
    hasAttachments: null,
    isDependency: null
  });
  
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleDateRangeChange = (field: 'from' | 'to', value: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };
  
  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
    setFiltersActive(true);
  };
  
  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      priority: 'all',
      category: 'all',
      completed: 'all',
      searchQuery: '',
      dateRange: { from: undefined, to: undefined },
      aiScoreMin: 0,
      hasAttachments: null,
      isDependency: null
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setFiltersActive(false);
    setIsOpen(false);
  };
  
  return (
    <div>
      <Button
        variant={filtersActive ? "secondary" : "outline"}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
        size="sm"
      >
        {filtersActive ? (
          <>
            <Filter className="h-4 w-4" /> 
            <span className="ml-1">Filters Active</span>
          </>
        ) : (
          <>
            <Filter className="h-4 w-4" /> Advanced Filter
          </>
        )}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={filters.priority}
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div 
                          className="h-2 w-2 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }} 
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.completed}
                onValueChange={(value: 'all' | 'completed' | 'incomplete') => 
                  handleFilterChange('completed', value)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Task Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search">Search</Label>
              <Input 
                id="search"
                placeholder="Search tasks..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              />
            </div>
            
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Date Range</Label>
              <div className="flex flex-wrap gap-2">
                <div className="grow-0">
                  <Label htmlFor="from" className="text-xs text-muted-foreground">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="from"
                        variant={"outline"}
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !filters.dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? (
                          format(filters.dateRange.from, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => handleDateRangeChange('from', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grow-0">
                  <Label htmlFor="to" className="text-xs text-muted-foreground">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="to"
                        variant={"outline"}
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !filters.dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? (
                          format(filters.dateRange.to, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => handleDateRangeChange('to', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <Label>Minimum AI Score: {filters.aiScoreMin}</Label>
              <Slider
                defaultValue={[0]}
                max={100}
                step={1}
                value={[filters.aiScoreMin]}
                onValueChange={(vals) => handleFilterChange('aiScoreMin', vals[0])}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="has-attachments">Has Attachments</Label>
              <Select 
                value={filters.hasAttachments === null ? 'any' : 
                        filters.hasAttachments ? 'yes' : 'no'}
                onValueChange={(value) => {
                  const boolValue = value === 'any' ? null : value === 'yes';
                  handleFilterChange('hasAttachments', value === 'any' ? null : boolValue);
                }}
              >
                <SelectTrigger id="has-attachments" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="is-dependency">Is a Dependency</Label>
              <Select 
                value={filters.isDependency === null ? 'any' : 
                        filters.isDependency ? 'yes' : 'no'}
                onValueChange={(value) => {
                  const boolValue = value === 'any' ? null : value === 'yes';
                  handleFilterChange('isDependency', value === 'any' ? null : boolValue);
                }}
              >
                <SelectTrigger id="is-dependency" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetFilters}>
              <FilterX className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button type="button" onClick={applyFilters}>
              <Check className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
