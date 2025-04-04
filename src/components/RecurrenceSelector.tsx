
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { RecurrencePattern } from '@/types/task';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface RecurrenceSelectorProps {
  value: RecurrencePattern | undefined;
  onChange: (value: RecurrencePattern | undefined) => void;
  className?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function RecurrenceSelector({ value, onChange, className }: RecurrenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(!!value);
  const [pattern, setPattern] = useState<RecurrencePattern | undefined>(
    value || { frequency: 'weekly', interval: 1 }
  );
  
  useEffect(() => {
    setIsRecurring(!!value);
    setPattern(value || { frequency: 'weekly', interval: 1 });
  }, [value]);
  
  const handleToggleRecurring = (checked: boolean) => {
    setIsRecurring(checked);
    
    if (checked && !pattern) {
      const defaultPattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1
      };
      setPattern(defaultPattern);
      onChange(defaultPattern);
    } else if (!checked) {
      onChange(undefined);
    }
  };
  
  const handleChangePattern = (newPattern: Partial<RecurrencePattern>) => {
    if (!pattern) return;
    
    const updatedPattern = { ...pattern, ...newPattern };
    setPattern(updatedPattern);
    
    // Only propagate changes if recurring is enabled
    if (isRecurring) {
      onChange(updatedPattern);
    }
  };
  
  const handleApply = () => {
    if (isRecurring && pattern) {
      onChange(pattern);
    } else {
      onChange(undefined);
    }
    setIsOpen(false);
  };
  
  const getRecurrenceDescription = (): string => {
    if (!pattern) return 'Not recurring';
    
    const { frequency, interval } = pattern;
    
    switch (frequency) {
      case 'daily':
        return interval === 1 ? 'Every day' : `Every ${interval} days`;
      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const days = pattern.daysOfWeek.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label || '').join(', ');
          return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
        }
        return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
      case 'monthly':
        return interval === 1 ? 'Every month' : `Every ${interval} months`;
      case 'yearly':
        return interval === 1 ? 'Every year' : `Every ${interval} years`;
      default:
        return 'Custom recurrence';
    }
  };
  
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Switch
          id="recurrence-toggle"
          checked={isRecurring}
          onCheckedChange={handleToggleRecurring}
        />
        <Label htmlFor="recurrence-toggle" className="font-medium cursor-pointer">
          Recurring Task
        </Label>
        
        {isRecurring && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs"
            onClick={() => setIsOpen(true)}
          >
            <Repeat className="mr-2 h-3 w-3" />
            {getRecurrenceDescription()}
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task Recurrence</DialogTitle>
            <DialogDescription>
              Set up how often this task should repeat
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={pattern?.frequency || 'weekly'}
                onValueChange={(value) => handleChangePattern({ 
                  frequency: value as RecurrencePattern['frequency'] 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Every</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  className="w-20"
                  value={pattern?.interval || 1}
                  onChange={(e) => handleChangePattern({ interval: parseInt(e.target.value) || 1 })}
                />
                <span>
                  {pattern?.frequency === 'daily' ? 'days' : 
                   pattern?.frequency === 'weekly' ? 'weeks' : 
                   pattern?.frequency === 'monthly' ? 'months' : 'years'}
                </span>
              </div>
            </div>
            
            {pattern?.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>On these days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => {
                    const isSelected = pattern?.daysOfWeek?.includes(day.value);
                    
                    return (
                      <Badge
                        key={day.value}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const currentDays = pattern?.daysOfWeek || [];
                          const updatedDays = isSelected
                            ? currentDays.filter(d => d !== day.value)
                            : [...currentDays, day.value];
                          
                          handleChangePattern({ daysOfWeek: updatedDays });
                        }}
                      >
                        {day.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {pattern?.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label>Day of month</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  className="w-20"
                  value={pattern?.dayOfMonth || ''}
                  onChange={(e) => handleChangePattern({ dayOfMonth: parseInt(e.target.value) || undefined })}
                  placeholder="Any"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>End recurrence</Label>
              <Select
                value={pattern?.endDate ? 'date' : pattern?.endAfterOccurrences ? 'after' : 'never'}
                onValueChange={(value) => {
                  if (value === 'never') {
                    handleChangePattern({ 
                      endDate: undefined,
                      endAfterOccurrences: undefined
                    });
                  } else if (value === 'after' && !pattern?.endAfterOccurrences) {
                    handleChangePattern({ 
                      endAfterOccurrences: 10,
                      endDate: undefined
                    });
                  } else if (value === 'date' && !pattern?.endDate) {
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + 3);
                    handleChangePattern({ 
                      endDate: endDate.toISOString(),
                      endAfterOccurrences: undefined
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="after">After occurrences</SelectItem>
                  <SelectItem value="date">On date</SelectItem>
                </SelectContent>
              </Select>
              
              {pattern?.endAfterOccurrences !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  <Label>After</Label>
                  <Input
                    type="number"
                    min="1"
                    className="w-20"
                    value={pattern.endAfterOccurrences}
                    onChange={(e) => handleChangePattern({ 
                      endAfterOccurrences: parseInt(e.target.value) || 1
                    })}
                  />
                  <span>occurrences</span>
                </div>
              )}
              
              {pattern?.endDate && (
                <div className="mt-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !pattern.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pattern.endDate ? (
                          format(new Date(pattern.endDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pattern.endDate ? new Date(pattern.endDate) : undefined}
                        onSelect={(date) => handleChangePattern({ 
                          endDate: date?.toISOString()
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleApply}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
