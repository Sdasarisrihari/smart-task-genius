import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, PriorityLevel } from '@/types/task';

// Define the SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface VoiceTaskInputProps {
  onTaskCreated: (task: Partial<Task>) => void;
}

export function VoiceTaskInput({ onTaskCreated }: VoiceTaskInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { categories } = useTaskContext();
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  useEffect(() => {
    // Check if browser supports speech recognition
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    if (!hasSpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    // Create speech recognition instance
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor() as SpeechRecognitionInstance;
    }
    
    if (recognitionRef.current) {
      // Configure
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Event handlers
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Auto restart if we're still supposed to be listening
          recognitionRef.current?.start();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);
  
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening for voice command...', {
        description: 'Try saying: "Create a task to buy groceries due tomorrow"'
      });
    }
  };
  
  const processVoiceCommand = async () => {
    if (!transcript.trim()) {
      toast.error('No voice input detected');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const taskInfo = parseTaskCommand(transcript);
      if (taskInfo) {
        onTaskCreated(taskInfo);
        setTranscript('');
        toast.success('Task created from voice command');
      } else {
        toast.error('Could not understand the task command', {
          description: 'Try being more specific with your task details'
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error('Error processing voice command');
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };
  
  const parseTaskCommand = (command: string): Partial<Task> | null => {
    // Normalize the command text
    const normalizedCommand = command.toLowerCase().trim();
    
    // Extract task title
    let title = '';
    let description = '';
    let priority: PriorityLevel = 'medium';
    let category = '';
    let dueDate: Date | null = null;
    
    // Basic patterns
    const createTaskPatterns = [
      'create a task to ',
      'create task to ',
      'add a task to ',
      'add task to ',
      'create a task ',
      'add a task ',
      'new task '
    ];
    
    // Find the task title
    let remainingText = normalizedCommand;
    for (const pattern of createTaskPatterns) {
      if (normalizedCommand.includes(pattern)) {
        const parts = normalizedCommand.split(pattern);
        if (parts.length > 1) {
          remainingText = parts[1];
          break;
        }
      }
    }
    
    // If no specific patterns found, use the whole transcript as title
    title = remainingText;
    
    // Extract due date
    const dueDatePatterns = [
      { regex: /due (today)/i, handler: () => new Date() },
      { regex: /due (tomorrow)/i, handler: () => new Date(new Date().setDate(new Date().getDate() + 1)) },
      { regex: /due (next week)/i, handler: () => new Date(new Date().setDate(new Date().getDate() + 7)) },
      { regex: /due (in (\d+) days?)/i, handler: (match: RegExpMatchArray) => {
        const days = parseInt(match[2]);
        return new Date(new Date().setDate(new Date().getDate() + days));
      }},
      { regex: /due (on|by) ([a-z]+ \d+)/i, handler: (match: RegExpMatchArray) => {
        // This is a simplified date parser, a real one would need to be more robust
        try {
          return new Date(`${match[2]}, ${new Date().getFullYear()}`);
        } catch (e) {
          return null;
        }
      }}
    ];
    
    for (const pattern of dueDatePatterns) {
      const match = remainingText.match(pattern.regex);
      if (match) {
        dueDate = pattern.handler(match);
        // Remove the due date text from the title
        title = title.replace(match[0], '').trim();
      }
    }
    
    // Extract priority
    if (title.includes('high priority') || title.includes('urgent')) {
      priority = 'high';
      title = title.replace(/(high priority|urgent)/i, '').trim();
    } else if (title.includes('low priority')) {
      priority = 'low';
      title = title.replace(/low priority/i, '').trim();
    }
    
    // Extract category
    const categoryPattern = /in (?:the |)category (\w+)/i;
    const categoryMatch = title.match(categoryPattern);
    
    if (categoryMatch) {
      const categoryName = categoryMatch[1];
      const foundCategory = categories.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase()
      );
      
      if (foundCategory) {
        category = foundCategory.id;
        // Remove the category text from the title
        title = title.replace(categoryMatch[0], '').trim();
      }
    }
    
    // Extract description
    const descriptionPattern = /description(?: is|:) (.+)/i;
    const descriptionMatch = title.match(descriptionPattern);
    
    if (descriptionMatch) {
      description = descriptionMatch[1].trim();
      // Remove the description from the title
      title = title.replace(descriptionMatch[0], '').trim();
    }
    
    // Clean up any extra words
    title = title.replace(/^\s*(?:to|is)\s+/, '');
    
    if (!title.trim()) {
      return null;
    }
    
    return {
      title: title.trim().charAt(0).toUpperCase() + title.trim().slice(1),
      description: description || '',
      dueDate: dueDate?.toISOString() || null,
      priority,
      category: category || categories[0]?.id || '',
      completed: false
    };
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={toggleListening}
          variant={isListening ? "default" : "outline"}
          size="sm"
          className={isListening ? "bg-red-500 hover:bg-red-600 text-white" : ""}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Add Task by Voice
            </>
          )}
        </Button>
        
        <Button
          type="button"
          onClick={processVoiceCommand}
          disabled={!transcript.trim() || isProcessing}
          size="sm"
          variant="outline"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Create Task'
          )}
        </Button>
      </div>
      
      {isListening && (
        <div className="relative">
          <div className="p-3 border rounded-md bg-background">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Listening...</span>
            </div>
            <p className="text-sm">
              {transcript || "Speak now..."}
            </p>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Try saying: "Create a task to call John tomorrow" or "Add task to buy groceries due on Friday high priority"
          </div>
        </div>
      )}
    </div>
  );
}

// Add these declarations to make TypeScript recognize the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
