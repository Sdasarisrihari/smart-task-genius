
import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task, TimeLogEntry } from '../types/task';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlayCircle, PauseCircle, Clock, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistance } from 'date-fns';
import { formatDuration } from '../utils/timeUtils';

interface TimeTrackerProps {
  task: Task;
}

export const TimeTracker = ({ task }: TimeTrackerProps) => {
  const { updateTask } = useTaskContext();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentSession, setCurrentSession] = useState(0);
  const [notes, setNotes] = useState('');
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>(task?.timeTracking?.logs || []);
  
  // Total time calculations
  const totalEstimatedMinutes = task?.timeTracking?.estimatedMinutes || 0;
  const totalActualMinutes = task?.timeTracking?.actualMinutes || 0;
  
  // Update the session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);
        setCurrentSession(elapsed);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTracking, startTime]);
  
  const startTracking = () => {
    if (task.completed) {
      toast.error("Can't track time for a completed task");
      return;
    }
    
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
    toast.success("Time tracking started");
  };
  
  const pauseTracking = () => {
    if (!startTime) return;
    
    setIsTracking(false);
    toast.info("Time tracking paused");
  };
  
  const stopTracking = () => {
    if (!startTime) return;
    
    const now = new Date();
    const durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
    
    // Create a new time log entry
    const newLog: TimeLogEntry = {
      id: crypto.randomUUID(),
      taskId: task.id,
      startTime: startTime,
      endTime: now,
      durationMinutes,
      notes: notes.trim() || undefined
    };
    
    // Calculate new total actual time
    const newTotalActualMinutes = (task?.timeTracking?.actualMinutes || 0) + durationMinutes;
    const newLogs = [...timeLogs, newLog];
    
    // Update time tracking info in task
    updateTask(task.id, {
      timeTracking: {
        estimatedMinutes: totalEstimatedMinutes,
        actualMinutes: newTotalActualMinutes,
        logs: newLogs
      }
    });
    
    // Reset state
    setIsTracking(false);
    setStartTime(null);
    setCurrentSession(0);
    setNotes('');
    setTimeLogs(newLogs);
    
    toast.success(`Time log saved: ${durationMinutes} minutes`);
  };
  
  const updateEstimatedTime = (minutes: number) => {
    updateTask(task.id, {
      timeTracking: {
        estimatedMinutes: minutes,
        actualMinutes: totalActualMinutes,
        logs: timeLogs
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Estimated Time</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={totalEstimatedMinutes}
                onChange={(e) => updateEstimatedTime(parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm">min</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Time Logged</div>
            <div className="text-xl font-medium">
              {formatDuration(totalActualMinutes)}
            </div>
          </div>
        </div>
        
        {isTracking && startTime && (
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm font-medium mb-1">Current Session</div>
            <div className="text-xl font-bold">{formatDuration(currentSession)}</div>
            <div className="text-xs text-muted-foreground">
              Started {format(startTime, 'h:mm a')} ({formatDistance(startTime, new Date(), { addSuffix: true })})
            </div>
          </div>
        )}
        
        {isTracking && (
          <div>
            <Label htmlFor="notes">Session Notes</Label>
            <Input
              id="notes"
              placeholder="What are you working on?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Recent Time Logs</div>
          {timeLogs.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-auto">
              {timeLogs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="text-sm border-b border-gray-100 pb-2">
                  <div className="flex justify-between">
                    <span>
                      {format(new Date(log.startTime), 'MMM d, h:mm a')}
                    </span>
                    <span className="font-medium">{formatDuration(log.durationMinutes)}</span>
                  </div>
                  {log.notes && <div className="text-xs text-muted-foreground">{log.notes}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No time logs yet</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isTracking ? (
          <Button onClick={startTracking} className="w-full">
            <PlayCircle className="mr-2 h-4 w-4" /> Start Tracking
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            <Button onClick={pauseTracking} variant="outline" className="flex-1">
              <PauseCircle className="mr-2 h-4 w-4" /> Pause
            </Button>
            <Button onClick={stopTracking} className="flex-1">
              <StopCircle className="mr-2 h-4 w-4" /> Stop & Save
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
