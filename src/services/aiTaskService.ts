
import { Task, PriorityLevel } from '@/types/task';
import { toast } from 'sonner';

interface SuggestedPriority {
  taskId: string;
  currentPriority: PriorityLevel;
  suggestedPriority: PriorityLevel;
  confidence: number;
  reason: string;
}

export const AiTaskService = {
  /**
   * Analyze task content and metadata to suggest appropriate priority levels
   */
  analyzeTasks(tasks: Task[]): SuggestedPriority[] {
    console.log("Analyzing tasks for AI priority suggestions");
    const incompleteTasks = tasks.filter(task => !task.completed);
    const suggestions: SuggestedPriority[] = [];
    
    for (const task of incompleteTasks) {
      const suggestion = this.calculatePriority(task);
      if (suggestion.suggestedPriority !== task.priority && suggestion.confidence > 0.7) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  },
  
  /**
   * Calculate priority suggestion for a single task
   */
  calculatePriority(task: Task): SuggestedPriority {
    // Initialize with current priority
    let suggestedPriority: PriorityLevel = task.priority;
    let confidence = 0.5;
    let reason = "Based on task attributes";
    
    // Factors to consider
    let urgencyScore = 0;
    let importanceScore = 0;
    let complexityScore = 0;
    
    // Check due date (urgency factor)
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        // Overdue tasks
        urgencyScore += 10;
        reason = "Task is overdue";
      } else if (daysUntilDue === 0) {
        // Due today
        urgencyScore += 8;
        reason = "Task is due today";
      } else if (daysUntilDue <= 2) {
        // Due soon (within 2 days)
        urgencyScore += 6;
        reason = "Task is due within 2 days";
      } else if (daysUntilDue <= 7) {
        // Due this week
        urgencyScore += 4;
      } else {
        // Due later
        urgencyScore += 1;
      }
    }
    
    // Check title and description for urgent keywords
    const urgentKeywords = [
      'urgent', 'asap', 'emergency', 'critical', 'deadline', 'important',
      'crucial', 'vital', 'essential', 'priority'
    ];
    
    const content = (task.title + ' ' + task.description).toLowerCase();
    const containsUrgentWord = urgentKeywords.some(word => content.includes(word));
    
    if (containsUrgentWord) {
      urgencyScore += 3;
      importanceScore += 2;
      reason = "Task contains urgent keywords";
    }
    
    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      importanceScore += 2 * task.dependencies.length;
      reason = "Task is blocking other tasks";
    }
    
    // Check if tasks have dependencies on this task
    if (task.dependencies?.length && task.dependencies.length > 2) {
      complexityScore += 3;
    }
    
    // Check description length (complexity factor)
    const descriptionLength = task.description.length;
    if (descriptionLength > 500) {
      complexityScore += 3;
    } else if (descriptionLength > 200) {
      complexityScore += 2;
    } else if (descriptionLength > 100) {
      complexityScore += 1;
    }
    
    // Combine scores
    const totalScore = urgencyScore + importanceScore + complexityScore;
    
    // Determine suggested priority
    if (totalScore >= 10) {
      suggestedPriority = 'high';
      confidence = Math.min(0.9, 0.6 + (totalScore - 10) * 0.03);
    } else if (totalScore >= 5) {
      suggestedPriority = 'medium';
      confidence = 0.7;
    } else {
      suggestedPriority = 'low';
      confidence = 0.6;
    }
    
    // Don't suggest the same priority
    if (suggestedPriority === task.priority) {
      confidence = 0.5; // Lower confidence when no change
    }
    
    return {
      taskId: task.id,
      currentPriority: task.priority,
      suggestedPriority,
      confidence,
      reason
    };
  },
  
  /**
   * Apply the suggested priorities to tasks
   */
  applySuggestedPriorities(
    tasks: Task[], 
    suggestions: SuggestedPriority[], 
    updateTask: (id: string, updates: Partial<Task>) => void
  ): void {
    let appliedCount = 0;
    
    suggestions.forEach(suggestion => {
      const task = tasks.find(t => t.id === suggestion.taskId);
      if (task && suggestion.suggestedPriority !== task.priority) {
        updateTask(suggestion.taskId, { priority: suggestion.suggestedPriority });
        appliedCount++;
      }
    });
    
    if (appliedCount > 0) {
      toast.success(`Updated priority for ${appliedCount} tasks`, {
        description: 'AI has suggested new priorities based on task content and due dates'
      });
    } else {
      toast.info('No priority changes needed', {
        description: 'AI found that all current priorities are appropriate'
      });
    }
  }
};
