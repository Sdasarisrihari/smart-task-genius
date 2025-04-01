
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Bell, Settings, User, Search, MicIcon, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

export const Header = () => {
  const handleVoiceCommand = () => {
    toast("Voice activation", {
      description: "Speak your task or command",
    });
  };
  
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span>TaskGenius</span>
          </Link>
          
          <nav className="hidden md:flex items-center ml-8 space-x-4">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link to="/calendar" className="text-sm font-medium hover:text-primary">
              Calendar
            </Link>
            <Link to="/analytics" className="text-sm font-medium hover:text-primary">
              Analytics
            </Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 w-[200px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleVoiceCommand}>
            <MicIcon className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center absolute -top-1 -right-1 text-[10px]">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Task due soon</span>
                  <span className="text-xs text-muted-foreground">Complete project proposal in 2 hours</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">AI Suggestion</span>
                  <span className="text-xs text-muted-foreground">Reprioritize your afternoon tasks</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Team update</span>
                  <span className="text-xs text-muted-foreground">Sarah shared a task with you</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                <span className="text-xs text-primary">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
